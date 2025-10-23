/**
 * SlideCanvas Component
 * 
 * A canvas where users can add, position, and edit text boxes collaboratively.
 * Shows all text boxes on a slide and allows real-time collaboration.
 */

import { useCallback, useRef } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { TextBox } from './TextBox';
import { useMyPresence, useOthers } from '../liveblocks.config';
import type { SlideCanvasProps } from '../types';

export function SlideCanvas({
  slide,
  onUpdateTextBox,
  onAddTextBox,
  readOnly = false,
}: SlideCanvasProps) {
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleStartEditing = useCallback(
    (textBoxId: string) => {
      updateMyPresence({ editingTextBoxId: textBoxId });
    },
    [updateMyPresence]
  );

  const handleStopEditing = useCallback(() => {
    updateMyPresence({ editingTextBoxId: null });
  }, [updateMyPresence]);

  const handleCanvasClick = useCallback(() => {
    if (myPresence.editingTextBoxId) {
      handleStopEditing();
    }
  }, [myPresence.editingTextBoxId, handleStopEditing]);

  // Track cursor position on the canvas
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      updateMyPresence({ cursor: { x, y } });
    },
    [updateMyPresence]
  );

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  return (
    <Flex direction="column" h="full">
      {/* Toolbar */}
      <Flex
        px={6}
        py={4}
        borderBottom="1px"
        borderColor="gray.200"
        bg="gray.50"
        align="center"
        gap={4}
      >
        {!readOnly && (
          <Button
            colorPalette="blue"
            variant="solid"
            size="sm"
            onClick={onAddTextBox}
          >
            + Add Text Box
          </Button>
        )}
        
        <Text fontSize="sm" color="gray.700">
          Double-click text boxes to edit • Drag to move
        </Text>
      </Flex>

      {/* Canvas */}
      <Box
        ref={canvasRef}
        flex="1"
        position="relative"
        bg={slide.backgroundColor || 'white'}
        overflow="hidden"
        onClick={handleCanvasClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {!Array.isArray(slide.textBoxes) || slide.textBoxes.length === 0 ? (
          <Flex
            h="full"
            align="center"
            justify="center"
            color="gray.500"
          >
            <Text fontSize="md">
              Click "Add Text Box" to start adding content to this slide
            </Text>
          </Flex>
        ) : (
          slide.textBoxes.map((textBox) => (
            <TextBox
              key={textBox.id}
              textBox={textBox}
              isEditing={!readOnly && myPresence.editingTextBoxId === textBox.id}
              onUpdate={onUpdateTextBox}
              onStartEditing={handleStartEditing}
              onStopEditing={handleStopEditing}
              readOnly={readOnly}
            />
          ))
        )}
        
        {/* Render other users' cursors */}
        {others.map((other) => {
          if (!other.presence?.cursor) return null;
          
          return (
            <Box
              key={other.connectionId}
              position="absolute"
              left={`${other.presence.cursor.x}px`}
              top={`${other.presence.cursor.y}px`}
              pointerEvents="none"
              transition="left 0.1s ease-out, top 0.1s ease-out"
              zIndex={100}
              transform="translate(-2px, -2px)"
            >
              {/* Cursor SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}
              >
                <path
                  d="M5.65376 12.3673L13.1844 19.8979L15.4653 13.9221L21.4411 11.6411L13.9105 4.11047L5.65376 12.3673Z"
                  fill={other.presence.userColor}
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
              
              {/* User name label */}
              <Box
                position="absolute"
                top="20px"
                left="20px"
                px={2}
                py={1}
                bg={other.presence.userColor}
                color="white"
                fontSize="xs"
                fontWeight="semibold"
                borderRadius="md"
                whiteSpace="nowrap"
                boxShadow="md"
              >
                {other.presence.userName}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Flex>
  );
}
