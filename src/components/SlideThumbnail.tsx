/**
 * SlideThumbnail Component
 * 
 * Renders a thumbnail preview of a slide in the sidebar.
 * Shows slide number, text box count, and collaborative presence indicators.
 * 
 * Features:
 * - Visual feedback for active/selected slide
 * - Shows number of collaborators viewing this slide
 * - Delete button on hover
 * - Manages ref for auto-scrolling
 */

import { Box, Text, HStack, IconButton, Badge, Group } from '@chakra-ui/react';
import type { SlideThumbnailProps } from '../types';
import { UI_CONFIG } from '../constants/app.constants';

/**
 * Renders a clickable slide thumbnail with metadata
 * Used in the sidebar to navigate between slides
 */
export function SlideThumbnail({
  slide,
  index,
  isActive,
  othersOnThisSlide,
  onSelect,
  onDelete,
  thumbnailRefs,
  isSharedMode = false,
}: SlideThumbnailProps) {
  return (
    <Box
      ref={(el: HTMLDivElement | null) => {
        if (el) {
          thumbnailRefs.current.set(slide.id, el);
        } else {
          thumbnailRefs.current.delete(slide.id);
        }
      }}
      position="relative"
      bg="white"
      borderRadius="lg"
      border="2px solid"
      borderColor={isActive ? 'blue.500' : 'gray.200'}
      p={3}
      cursor="pointer"
      transition="all 0.2s"
      shadow={isActive ? 'md' : 'sm'}
      _hover={{
        borderColor: isActive ? 'blue.600' : 'blue.300',
        shadow: 'md',
        transform: 'translateY(-2px)',
        '& .delete-btn': {
          visibility: 'visible',
        },
      }}
      onClick={() => onSelect(slide.id)}
    >
      {/* Header with slide number and actions */}
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="semibold" color="gray.800" fontSize="sm">
          Slide {index + 1}
        </Text>
        <Group gap={1} attached={false}>
          {/* Show number of other users viewing this slide */}
          {othersOnThisSlide.length > 0 && (
            <Badge colorPalette="purple" fontSize="xs">
              👥 {othersOnThisSlide.length}
            </Badge>
          )}
          {/* Delete button (hidden until hover, not shown in shared mode) */}
          {!isSharedMode && (
            <IconButton
              className="delete-btn"
              aria-label="Delete slide"
              size="xs"
              colorPalette="gray"
              variant="outline"
              visibility="hidden"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(slide.id, index);
              }}
            >
              ×
            </IconButton>
          )}
        </Group>
      </HStack>
      
      {/* Thumbnail preview showing text box count */}
      <Box
        bg={slide.backgroundColor || 'white'}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        aspectRatio={UI_CONFIG.THUMBNAIL_ASPECT_RATIO}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="xs" color="gray.500">
          {Array.isArray(slide.textBoxes) ? slide.textBoxes.length : 0} text box
          {Array.isArray(slide.textBoxes) && slide.textBoxes.length === 1 ? '' : 'es'}
        </Text>
      </Box>
    </Box>
  );
}

