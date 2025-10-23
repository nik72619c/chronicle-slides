/**
 * Custom hook for syncing text box content between Y.js and Liveblocks storage
 * 
 * This hook handles the seeding of initial text content from Liveblocks storage
 * into Y.js CRDTs when a text box is first loaded.
 */

import { useEffect, useRef } from 'react';
import type { TextBox } from '../types/slide.types';

interface UseTextBoxSyncParams {
  textBox: TextBox;
  collaborativeText: string;
  setCollaborativeText: (text: string) => void;
}

/**
 * Seeds Y.js text with initial content from Liveblocks storage
 * 
 * This is needed when:
 * - A user first loads a text box that already has content
 * - After a page reload to restore the text state
 * 
 * Uses a ref to ensure seeding only happens once per text box.
 * 
 * @param params - Text box data and collaborative text setters
 * 
 * @example
 * useTextBoxSync({
 *   textBox,
 *   collaborativeText,
 *   setCollaborativeText
 * });
 */
export function useTextBoxSync({
  textBox,
  collaborativeText,
  setCollaborativeText,
}: UseTextBoxSyncParams): void {
  const seededRef = useRef(false);

  useEffect(() => {
    // Don't seed if already seeded
    if (seededRef.current) return;
    
    // Seed Y.js text if storage has content but collaborative text is empty
    // This happens on initial load or after reload
    if (textBox.text && textBox.text.length > 0 && (!collaborativeText || collaborativeText.length === 0)) {
      seededRef.current = true;
      setCollaborativeText(textBox.text);
    }
  }, [textBox.id, textBox.text, collaborativeText, setCollaborativeText]);
}

