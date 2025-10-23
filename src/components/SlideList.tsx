/**
 * SlideList Component
 * 
 * Manages the collection of slides with add/delete functionality.
 * Integrates with Liveblocks storage to sync slides across all users in real-time.
 * 
 * Features:
 * - Add/delete slides
 * - Real-time collaboration with presence indicators
 * - Viewer mode for sharing specific slides
 * - Auto-scroll to active slide
 * - Thumbnail previews
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Button,
  Heading,
  Text,
  VStack,
  createToaster,
} from '@chakra-ui/react';
import { SlideCanvas } from './SlideCanvas';
import { ShareDialog } from './ShareDialog';
import { SlideThumbnail } from './SlideThumbnail';
import { useStorage, useMyPresence, useOthers } from '../liveblocks.config';
import type { Slide, TextBox } from '../types';
import { useSlideManagement, useTextBoxManagement, useShareMode } from '../hooks';
import { UI_CONFIG } from '../constants/app.constants';

export function SlideList() {
  // ========== Data & State Management ==========
  const slides = useStorage((root) => root.slides) as Slide[] | null;
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();
  
  // ========== Custom Hooks ==========
  const { addSlide, deleteSlide, migrateSlides } = useSlideManagement();
  const { addTextBox, updateTextBox } = useTextBoxManagement();
  const { readOnly, visibleSlides, allowedSlideIds, isSharedMode } = useShareMode(slides);
  
  // ========== Refs & UI State ==========
  const prevSlideCountRef = useRef(0);
  const thumbnailRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const toaster = createToaster({
    placement: UI_CONFIG.TOAST_PLACEMENT,
    duration: UI_CONFIG.TOAST_DURATION,
  });

  // ========== Data Migration ==========
  
  /**
   * Auto-migrate old slides to new format on mount
   * This ensures backwards compatibility with older data structures
   */
  useEffect(() => {
    if (slides && slides.length > 0) {
      const needsMigration = slides.some((slide: any) => !Array.isArray(slide.textBoxes));
      if (needsMigration) {
        migrateSlides();
      }
    }
  }, [slides, migrateSlides]);

  // ========== Collaboration & Syncing ==========

  /**
   * Detect when a new slide is added by another user and sync view
   * If someone else adds a slide, switch to it automatically
   */
  useEffect(() => {
    if (!slides) return;
    
    const currentSlideCount = slides.length;
    const prevSlideCount = prevSlideCountRef.current;
    
    // Only process if slide count increased
    if (currentSlideCount > prevSlideCount && prevSlideCount > 0) {
      const newSlide = slides[currentSlideCount - 1];
      
      // Check if another user added this slide (they're viewing it)
      const someoneElseAddedIt = others.some(
        (other) => other.presence?.currentSlideId === newSlide.id
      );
      
      // Auto-switch to the new slide if another user added it
      if (someoneElseAddedIt && myPresence.currentSlideId !== newSlide.id) {
        updateMyPresence({ currentSlideId: newSlide.id, editingTextBoxId: null });
        
        // Scroll to the new slide thumbnail
        setTimeout(() => {
          const thumbnailElement = thumbnailRefs.current.get(newSlide.id);
          if (thumbnailElement) {
            thumbnailElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, UI_CONFIG.SCROLL_ANIMATION_DELAY);
      }
    }
    
    prevSlideCountRef.current = currentSlideCount;
  }, [slides, others, myPresence.currentSlideId, updateMyPresence]);

  /**
   * Scroll to active slide thumbnail when selection changes
   * Ensures the active slide is always visible in the sidebar
   */
  useEffect(() => {
    if (myPresence.currentSlideId) {
      const thumbnailElement = thumbnailRefs.current.get(myPresence.currentSlideId);
      if (thumbnailElement) {
        thumbnailElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [myPresence.currentSlideId]);

  // ========== Event Handlers ==========

  /**
   * Handles adding a new slide
   * Creates the slide and switches to it automatically
   */
  const handleAddSlide = useCallback(() => {
    const newSlideId = addSlide();
    updateMyPresence({ currentSlideId: newSlideId });
    toaster.success({
      title: 'Slide added',
    });
  }, [addSlide, updateMyPresence, toaster]);

  /**
   * Handles selecting a slide from the thumbnail list
   * Clears any active text box editing
   */
  const handleSelectSlide = useCallback(
    (slideId: string) => {
      updateMyPresence({ currentSlideId: slideId, editingTextBoxId: null });
    },
    [updateMyPresence]
  );

  /**
   * Handles adding a text box to a slide
   * Uses the custom hook which handles Y.js CRDT creation
   */
  const handleAddTextBox = useCallback(
    (slideId: string) => {
      addTextBox(slideId);
    },
    [addTextBox]
  );

  /**
   * Handles updating text box properties (position, text, etc.)
   */
  const handleUpdateTextBox = useCallback(
    (slideId: string, textBoxId: string, updates: Partial<TextBox>) => {
      updateTextBox(slideId, textBoxId, updates);
    },
    [updateTextBox]
  );

  /**
   * Handles deleting a slide with confirmation
   * Shows a success toast after deletion
   */
  const handleDeleteSlide = useCallback(
    (slideId: string, index: number) => {
      if (window.confirm(`Delete slide ${index + 1}?`)) {
        deleteSlide(slideId);
        toaster.success({
          title: 'Slide deleted',
        });
      }
    },
    [deleteSlide, toaster]
  );

  // ========== Render Logic ==========

  // Loading state
  if (!slides) {
    return (
      <Flex justify="center" align="center" h="full" p={8}>
        <Text color="gray.600" fontSize="lg">Loading slides...</Text>
      </Flex>
    );
  }

  // Find the active slide based on user presence
  const activeSlide = slides.find((s: Slide) => s.id === myPresence.currentSlideId);

  return (
    <Flex h="full" p={6} gap={6} overflow="hidden">
      {/* Slide Thumbnails Sidebar */}
      <VStack
        w={UI_CONFIG.SIDEBAR_WIDTH}
        h="full"
        minH="0"
        gap={4}
        align="stretch"
        overflowY="auto"
        pr={2}
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        <Flex gap={2}>
          {/* Only show Add Slide button when not in shared mode */}
          {!isSharedMode && (
            <Button
              colorPalette="blue"
              variant="solid"
              size="md"
              onClick={handleAddSlide}
            >
              + Add Slide
            </Button>
          )}
          {/* Only show Share button when not in shared mode and have slides */}
          {!isSharedMode && slides && slides.length > 0 && <ShareDialog slides={slides} />}
        </Flex>

        {visibleSlides.length === 0 ? (
          <Box
            p={6}
            textAlign="center"
            bg="white"
            borderRadius="lg"
            border="2px dashed"
            borderColor="gray.300"
          >
            <Text color="gray.500" fontSize="sm">
              No slides yet. Click "Add Slide" to get started!
            </Text>
          </Box>
        ) : (
          visibleSlides.map((slide: Slide, index: number) => {
            const othersOnThisSlide = others.filter(
              (other) => other.presence?.currentSlideId === slide.id
            );
            
            const isActive = myPresence.currentSlideId === slide.id;
            
            return (
              <SlideThumbnail
                key={slide.id}
                slide={slide}
                index={index}
                isActive={isActive}
                othersOnThisSlide={othersOnThisSlide}
                onSelect={handleSelectSlide}
                onDelete={handleDeleteSlide}
                thumbnailRefs={thumbnailRefs}
                isSharedMode={isSharedMode}
              />
            );
          })
        )}
      </VStack>

      {/* Main Canvas Area */}
      <Box flex="1" h="full" minH="0" bg="white" borderRadius="xl" shadow="lg" overflow="hidden">
        {activeSlide && (!readOnly || (allowedSlideIds && allowedSlideIds.has(activeSlide.id))) ? (
          <SlideCanvas
            slide={activeSlide}
            onUpdateTextBox={(textBoxId, updates) =>
              handleUpdateTextBox(activeSlide.id, textBoxId, updates)
            }
            onAddTextBox={() => handleAddTextBox(activeSlide.id)}
            readOnly={readOnly}
          />
        ) : (
          <Flex
            h="full"
            direction="column"
            align="center"
            justify="center"
            color="gray.500"
            gap={3}
          >
            <Heading size="md" color="gray.400">
              {readOnly ? 'No shared slide selected' : 'No slide selected'}
            </Heading>
            <Text fontSize="sm">
              {visibleSlides.length > 0
                ? (readOnly ? 'Select one of the shared slides from the sidebar' : 'Select a slide from the sidebar to start editing')
                : (readOnly ? 'No slides have been shared yet' : 'Add a slide to get started')}
            </Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
}
