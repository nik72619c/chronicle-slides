/**
 * Custom hook for collaborative text editing with Y.js
 * 
 * This hook manages the lifecycle of a collaborative text field using Y.js CRDTs.
 * It handles text changes, undo/redo, and syncing with the Y.js document.
 */

import { useCallback } from 'react';
import { useYText } from '../lib/yjsProvider';

interface UseCollaborativeTextResult {
  /** Current text value from Y.js */
  text: string;
  /** Update the text value */
  setText: (value: string) => void;
  /** Undo the last change */
  undo: () => void;
  /** Redo the last undone change */
  redo: () => void;
  /** Handle textarea change events */
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Handle keyboard shortcuts for undo/redo */
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

/**
 * Manages collaborative text editing for a text box
 * 
 * @param textBoxId - The unique ID of the text box
 * @returns Text state and handlers for collaborative editing
 * 
 * @example
 * const { text, handleTextChange, handleKeyDown } = useCollaborativeText('textbox-123');
 * 
 * <Textarea
 *   value={text}
 *   onChange={handleTextChange}
 *   onKeyDown={handleKeyDown}
 * />
 */
export function useCollaborativeText(textBoxId: string): UseCollaborativeTextResult {
  const { value: text, setValue: setText, undoManager } = useYText(textBoxId);

  /**
   * Handle textarea change events
   * Updates the Y.js text with the new value
   */
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
    },
    [setText]
  );

  /**
   * Handle keyboard shortcuts for undo/redo
   * Supports both Mac (Cmd) and Windows/Linux (Ctrl) shortcuts
   * 
   * - Cmd/Ctrl + Z: Undo
   * - Cmd/Ctrl + Shift + Z: Redo
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
      const meta = isMac ? e.metaKey : e.ctrlKey;
      
      if (meta && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        undoManager.undo();
      } else if (meta && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        undoManager.redo();
      }
    },
    [undoManager]
  );

  /**
   * Undo the last change
   */
  const undo = useCallback(() => {
    undoManager.undo();
  }, [undoManager]);

  /**
   * Redo the last undone change
   */
  const redo = useCallback(() => {
    undoManager.redo();
  }, [undoManager]);

  return {
    text,
    setText,
    undo,
    redo,
    handleTextChange,
    handleKeyDown,
  };
}

