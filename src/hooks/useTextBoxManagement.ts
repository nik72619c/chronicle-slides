/**
 * Custom hook for managing text box operations
 * 
 * This hook handles all text box CRUD operations and integrates with Y.js
 * for collaborative text editing using CRDTs.
 */

import { useCallback } from 'react';
import * as Y from 'yjs';
import { useMutation, useSelf } from '../liveblocks.config';
import type { TextBox } from '../types/slide.types';
import { TEXT_BOX_DEFAULTS, ROOM_CONFIG } from '../constants/app.constants';
import { useYjs } from '../lib/yjsProvider';

interface UseTextBoxManagementResult {
  /** Add a new text box to a slide */
  addTextBox: (slideId: string) => void;
  /** Update an existing text box's properties */
  updateTextBox: (slideId: string, textBoxId: string, updates: Partial<TextBox>) => void;
}

/**
 * Provides text box management operations with Y.js CRDT integration
 * 
 * @returns Object containing text box management functions
 * 
 * @example
 * const { addTextBox, updateTextBox } = useTextBoxManagement();
 * addTextBox('slide-123');
 * updateTextBox('slide-123', 'textbox-456', { x: 100, y: 200 });
 */
export function useTextBoxManagement(): UseTextBoxManagementResult {
  const self = useSelf();
  const userId = self?.id || 'anonymous';
  const { doc } = useYjs();

  /**
   * Mutation to add a text box to Liveblocks storage
   * Also creates a corresponding Y.Text CRDT entry for collaborative editing
   */
  const addTextBoxMutation = useMutation(
    ({ storage }, slideId: string, providedId: string, initialText: string) => {
      const currentSlides = storage.get('slides');
      const updatedSlides = currentSlides.map((slide) => {
        if (slide.id === slideId) {
          const newTextBox: TextBox = {
            id: providedId,
            text: initialText,
            // Random position with some offset to prevent overlap
            x: TEXT_BOX_DEFAULTS.POSITION_BASE_X + Math.random() * TEXT_BOX_DEFAULTS.POSITION_OFFSET_RANGE,
            y: TEXT_BOX_DEFAULTS.POSITION_BASE_Y + Math.random() * TEXT_BOX_DEFAULTS.POSITION_Y_OFFSET,
            width: TEXT_BOX_DEFAULTS.WIDTH,
            height: TEXT_BOX_DEFAULTS.HEIGHT,
            fontSize: TEXT_BOX_DEFAULTS.FONT_SIZE,
            color: TEXT_BOX_DEFAULTS.COLOR,
            createdBy: userId,
            createdAt: Date.now(),
          };
          
          const existingTextBoxes = Array.isArray(slide.textBoxes) ? slide.textBoxes : [];
          
          return {
            ...slide,
            backgroundColor: slide.backgroundColor || 'white',
            textBoxes: [...existingTextBoxes, newTextBox],
          };
        }
        return slide;
      });
      storage.set('slides', updatedSlides);
    },
    [userId]
  );

  /**
   * Mutation to update a text box's properties
   * Used for position updates, size changes, and text content synchronization
   */
  const updateTextBoxMutation = useMutation(
    ({ storage }, slideId: string, textBoxId: string, updates: Partial<TextBox>) => {
      const currentSlides = storage.get('slides');
      const updatedSlides = currentSlides.map((slide) => {
        if (slide.id === slideId) {
          const existingTextBoxes = Array.isArray(slide.textBoxes) ? slide.textBoxes : [];
          
          return {
            ...slide,
            textBoxes: existingTextBoxes.map((textBox) =>
              textBox.id === textBoxId ? { ...textBox, ...updates } : textBox
            ),
          };
        }
        return slide;
      });
      storage.set('slides', updatedSlides);
    },
    []
  );

  /**
   * Adds a new text box to a slide
   * Pre-generates a stable ID and creates a shared Y.Text CRDT entry
   * so all peers converge on the same collaborative text structure
   */
  const addTextBox = useCallback(
    (slideId: string) => {
      // Generate unique ID using timestamp + random string
      const newId = `textbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create Y.Text CRDT entry in a transaction
      doc.transact(() => {
        const map = doc.getMap<Y.Text>(ROOM_CONFIG.YJS_TEXTBOXES_KEY);
        if (!map.get(newId)) {
          const ytext = new Y.Text();
          // Start with empty content; Y.js will sync edits
          map.set(newId, ytext);
        }
      });
      
      // Add text box to Liveblocks storage
      addTextBoxMutation(slideId, newId, '');
    },
    [addTextBoxMutation, doc]
  );

  /**
   * Updates a text box's properties (position, size, text, etc.)
   */
  const updateTextBox = useCallback(
    (slideId: string, textBoxId: string, updates: Partial<TextBox>) => {
      updateTextBoxMutation(slideId, textBoxId, updates);
    },
    [updateTextBoxMutation]
  );

  return {
    addTextBox,
    updateTextBox,
  };
}

