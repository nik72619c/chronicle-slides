/**
 * TextBox Component
 * 
 * A draggable and editable text box that can be positioned anywhere on a slide canvas.
 * Multiple users can add and edit text boxes simultaneously in real-time.
 * 
 * Features:
 * - Drag to reposition
 * - Double-click to edit
 * - Collaborative text editing using Y.js CRDTs
 * - Real-time presence indicators showing who's editing
 * - Undo/redo support (Cmd/Ctrl + Z)
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { Box, Textarea, Stack } from '@chakra-ui/react';
import { useOthers, useMyPresence } from '../liveblocks.config';
import type { TextBoxProps } from '../types';
import { useCollaborativeText, useTextBoxSync } from '../hooks';

export function TextBox({
  textBox,
  isEditing,
  onUpdate,
  onStartEditing,
  onStopEditing,
  readOnly = false,
}: TextBoxProps) {
  // ========== State Management ==========
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // ========== Presence & Collaboration ==========
  const [myPresence] = useMyPresence();
  const others = useOthers();
  
  // Get other users who are editing this text box
  const otherEditingUsers = others.filter(
    (other) => other.presence?.editingTextBoxId === textBox.id
  );
  
  // All users editing (including self if editing)
  const allEditingUsers = isEditing 
    ? [{ presence: myPresence, connectionId: 'self' }, ...otherEditingUsers]
    : otherEditingUsers;
  
  // ========== Collaborative Text Editing ==========
  const { text: collaborativeText, setText: setCollaborativeText, handleTextChange, handleKeyDown } = useCollaborativeText(textBox.id);
  
  // Sync initial text from Liveblocks storage to Y.js
  useTextBoxSync({ textBox, collaborativeText, setCollaborativeText });

  // ========== Editing Lifecycle ==========
  
  /**
   * Auto-focus and select text when editing starts
   * This provides a better UX by allowing immediate typing
   */
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // ========== Drag & Drop Handlers ==========
  
  /**
   * Initiates dragging when clicking on the text box (but not the textarea)
   * Records the offset between click position and text box position
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      // Don't start dragging if clicking on the textarea while editing
      if (isEditing && e.target === textareaRef.current) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - textBox.x,
        y: e.clientY - textBox.y,
      });
    },
    [readOnly, isEditing, textBox.x, textBox.y]
  );

  /**
   * Updates text box position while dragging
   * Calculates new position based on mouse position and initial offset
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      onUpdate(textBox.id, { x: newX, y: newY });
    },
    [isDragging, dragOffset, textBox.id, onUpdate]
  );

  /**
   * Ends dragging when mouse is released
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Set up global mouse move/up listeners for dragging
   * This allows dragging to work even if mouse moves outside the text box
   */
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ========== Edit Mode Handlers ==========
  
  /**
   * Enters edit mode when double-clicking the text box
   */
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!readOnly) {
        onStartEditing(textBox.id);
      }
    },
    [textBox.id, onStartEditing, readOnly]
  );

  /**
   * Exits edit mode and persists text to Liveblocks storage
   * The collaborative text is synced back to storage for compatibility
   * (e.g., for generating thumbnails or for users who don't have Y.js loaded)
   */
  const handleBlur = useCallback(() => {
    // Persist latest value back to Liveblocks storage for compatibility (e.g., thumbnails)
    onUpdate(textBox.id, { text: collaborativeText });
    onStopEditing();
  }, [onStopEditing, onUpdate, textBox.id, collaborativeText]);

  // ========== Visual State Calculation ==========
  
  /**
   * Determine border color based on who's editing
   * - If current user is editing: use their color
   * - If another user is editing: use their color
   * - If no one is editing: transparent
   */
  const borderColor = isEditing 
    ? myPresence.userColor
    : (otherEditingUsers.length > 0 ? otherEditingUsers[0].presence?.userColor : undefined);
  
  const hasActiveEditors = isEditing || otherEditingUsers.length > 0;

  return (
    <Box
      position="absolute"
      left={`${textBox.x}px`}
      top={`${textBox.y}px`}
      width={`${textBox.width}px`}
      minHeight={`${textBox.height}px`}
      fontSize={`${textBox.fontSize}px`}
      color={textBox.color}
      cursor={readOnly ? 'default' : isDragging ? 'grabbing' : isEditing ? 'text' : 'grab'}
      bg="white"
      border="3px solid"
      borderColor={hasActiveEditors ? borderColor : 'transparent'}
      borderRadius="md"
      p={2}
      shadow={hasActiveEditors ? 'lg' : 'sm'}
      transition="all 0.15s"
      userSelect={isEditing ? 'auto' : 'none'}
      opacity={isDragging ? 0.9 : 1}
      transform={hasActiveEditors ? 'scale(1.02)' : 'scale(1)'}
      _hover={{
        borderColor: hasActiveEditors ? borderColor : 'blue.300',
        shadow: 'md',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Show who's editing this text box */}
      {allEditingUsers.length > 0 && (
        <Stack
          direction="row"
          position="absolute"
          top="-32px"
          left="0"
          gap={1}
          zIndex={10}
        >
          {allEditingUsers.map((user) => (
            <Box
              key={user.connectionId}
              px={2}
              py={1}
              bg={user.presence?.userColor}
              color="white"
              fontSize="xs"
              fontWeight="semibold"
              borderRadius="md"
              boxShadow="md"
            >
              {user.presence?.userName}
            </Box>
          ))}
        </Stack>
      )}
      
      {isEditing ? (
        <Textarea
          ref={textareaRef}
          value={collaborativeText}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          border="none"
          p={1}
          minH={`${textBox.height}px`}
          fontSize={`${textBox.fontSize}px`}
          color={textBox.color}
          resize="both"
          _focus={{
            outline: 'none',
            boxShadow: 'none',
          }}
        />
      ) : (
        <Box
          whiteSpace="pre-wrap"
          wordBreak="break-word"
          minH="1.5em"
          p={1}
        >
          {collaborativeText || 'Double-click to edit'}
        </Box>
      )}
    </Box>
  );
}
