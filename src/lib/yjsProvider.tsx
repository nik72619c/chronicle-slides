/**
 * Y.js Provider for Liveblocks Integration
 * 
 * This module sets up Y.js CRDTs (Conflict-free Replicated Data Types) for
 * collaborative text editing, integrated with Liveblocks for real-time sync.
 */

import * as Y from 'yjs';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRoom } from '../liveblocks.config';
import { ROOM_CONFIG } from '../constants/app.constants';

export type YjsContext = {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
};

/**
 * Creates a Y.js document and provider for a Liveblocks room
 * The provider syncs Y.js changes through Liveblocks infrastructure
 */
export function createYjsForRoom(room: any): YjsContext {
  const doc = new Y.Doc();
  const provider = new LiveblocksYjsProvider(room, doc);
  return { doc, provider };
}

const YjsReactContext = createContext<YjsContext | null>(null);

/**
 * Provider component that sets up Y.js document and Liveblocks sync
 * Must wrap any components that need collaborative text editing
 * 
 * @example
 * <YjsProvider>
 *   <YourComponents />
 * </YjsProvider>
 */
export function YjsProvider({ children }: { children: React.ReactNode }) {
  const room = useRoom();
  const contextRef = useRef<YjsContext | null>(null);

  // Create Y.js context once on mount
  if (contextRef.current === null) {
    contextRef.current = createYjsForRoom(room);
  }

  useEffect(() => {
    const ctx = contextRef.current;
    // Ensure the Liveblocks Yjs provider connects so updates sync across clients
    ctx?.provider.connect();
    return () => {
      if (ctx) {
        ctx.provider.destroy();
        ctx.doc.destroy();
        contextRef.current = null;
      }
    };
  }, []);

  return (
    <YjsReactContext.Provider value={contextRef.current}>
      {children}
    </YjsReactContext.Provider>
  );
}

/**
 * Hook to access the Y.js context (document and provider)
 * Must be used within a YjsProvider
 * 
 * @returns Y.js document and Liveblocks provider
 * @throws Error if used outside YjsProvider
 */
export function useYjs(): YjsContext {
  const ctx = useContext(YjsReactContext);
  if (!ctx) {
    throw new Error('useYjs must be used within <YjsProvider>');
  }
  return ctx;
}

/**
 * Hook for collaborative text editing with Y.js
 * 
 * Creates and manages a Y.Text CRDT for a specific key (text box ID).
 * Provides undo/redo functionality and automatic synchronization.
 * 
 * @param key - Unique identifier for the text (usually textbox ID)
 * @returns Object with text value, setter, Y.Text instance, and undo manager
 * 
 * @example
 * const { value, setValue, undoManager } = useYText('textbox-123');
 */
export function useYText(
  key: string
): {
  value: string;
  setValue: (next: string) => void;
  yText: Y.Text;
  undoManager: Y.UndoManager;
} {
  const { doc } = useYjs();
  // Use ref to ensure origin symbol persists across re-renders
  const originRef = useRef<symbol | null>(null);
  if (originRef.current === null) {
    originRef.current = Symbol('user-origin');
  }
  const origin = originRef.current;
  
  const map = useMemo(() => doc.getMap<Y.Text>(ROOM_CONFIG.YJS_TEXTBOXES_KEY), [doc]);
  
  // Initialize or get existing Y.Text for this key
  const [yText, setYText] = useState<Y.Text>(() => {
    let text = map.get(key) as Y.Text | undefined;
    if (!text) {
      doc.transact(() => {
        const created = new Y.Text();
        map.set(key, created);
      }, origin);
      text = map.get(key) as Y.Text;
    }
    return text as Y.Text;
  });

  // Track current text value from Y.Text
  const [value, setValueState] = useState<string>(() => yText.toString());

  /**
   * Observe Y.Text changes and update local state
   * This ensures the React component re-renders when remote users make changes
   */
  useEffect(() => {
    const observer = () => {
      setValueState(yText.toString());
    };
    yText.observe(observer);
    return () => {
      yText.unobserve(observer);
    };
  }, [yText]);

  /**
   * Handle cases where another client replaces the Y.Text entry
   * Reattach to the authoritative Y.Text if the map entry changes
   */
  useEffect(() => {
    const onMapChange = (e: Y.YMapEvent<Y.Text>) => {
      if (e.keysChanged && e.keysChanged.has(key)) {
        const latest = map.get(key) as Y.Text | undefined;
        if (latest && latest !== yText) {
          setYText(latest);
          setValueState(latest.toString());
        }
      }
    };
    map.observe(onMapChange);
    return () => {
      map.unobserve(onMapChange);
    };
  }, [map, key, yText]);

  // Create undo manager for this Y.Text with tracked origins
  // Recreate when yText changes (e.g., when map entry is replaced)
  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  
  useEffect(() => {
    // Destroy old undo manager if it exists
    if (undoManagerRef.current) {
      undoManagerRef.current.destroy();
    }
    
    // Create new undo manager for the current yText
    undoManagerRef.current = new Y.UndoManager(yText, { 
      trackedOrigins: new Set([origin])
    });
    
    return () => {
      if (undoManagerRef.current) {
        undoManagerRef.current.destroy();
        undoManagerRef.current = null;
      }
    };
  }, [yText, origin]);
  
  const undoManager = undoManagerRef.current!;

  /**
   * Updates the Y.Text with minimal diff-based changes
   * 
   * Instead of replacing the entire text, this computes the difference between
   * old and new text and only applies the changed characters. This is critical
   * for Y.js CRDT to properly merge concurrent edits from multiple users.
   * 
   * Algorithm:
   * 1. Find common prefix (characters that are the same at the start)
   * 2. Find common suffix (characters that are the same at the end)
   * 3. Delete only the middle part that changed
   * 4. Insert only the new middle part
   * 
   * Example:
   * - Old: "Hello"
   * - New: "Hello World"
   * - Prefix: "Hello" (5 chars)
   * - Suffix: "" (0 chars)
   * - Delete: 0 chars
   * - Insert: " World" at position 5
   * 
   * @param next - The new text value to set
   */
  const setValue = (next: string) => {
    const prev = yText.toString();
    if (prev === next) return;
    
    // Compute the diff between prev and next to apply minimal changes
    // This is crucial for Y.js CRDT to properly merge concurrent edits
    doc.transact(() => {
      // Find common prefix
      let prefixLen = 0;
      while (prefixLen < prev.length && prefixLen < next.length && prev[prefixLen] === next[prefixLen]) {
        prefixLen++;
      }
      
      // Find common suffix
      let suffixLen = 0;
      while (
        suffixLen < prev.length - prefixLen && 
        suffixLen < next.length - prefixLen && 
        prev[prev.length - 1 - suffixLen] === next[next.length - 1 - suffixLen]
      ) {
        suffixLen++;
      }
      
      // Delete the middle part that changed
      const deleteLen = prev.length - prefixLen - suffixLen;
      if (deleteLen > 0) {
        yText.delete(prefixLen, deleteLen);
      }
      
      // Insert the new middle part
      const insertText = next.slice(prefixLen, next.length - suffixLen);
      if (insertText.length > 0) {
        yText.insert(prefixLen, insertText);
      }
    }, origin);
  };

  return { value, setValue, yText, undoManager };
}



