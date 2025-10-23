/**
 * Custom hook for managing slide operations
 * 
 * This hook encapsulates all slide-related mutations and operations,
 * providing a clean interface for components to interact with slides.
 */

import { useMutation } from '../liveblocks.config';
import type { Slide } from '../types/slide.types';
import { SLIDE_DEFAULTS } from '../constants/app.constants';

interface UseSlideManagementResult {
  /** Add a new slide and return its ID */
  addSlide: () => string;
  /** Delete a slide by ID */
  deleteSlide: (slideId: string) => void;
  /** Migrate old slides to new format (backwards compatibility) */
  migrateSlides: () => void;
}

/**
 * Provides slide management operations using Liveblocks mutations
 * 
 * @returns Object containing slide management functions
 * 
 * @example
 * const { addSlide, deleteSlide } = useSlideManagement();
 * const newSlideId = addSlide();
 */
export function useSlideManagement(): UseSlideManagementResult {
  /**
   * Creates a new slide with default values
   * Uses timestamp + random string to ensure unique IDs across clients
   */
  const addSlide = useMutation(({ storage }) => {
    const currentSlides = storage.get('slides');
    const newSlide: Slide = {
      id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      textBoxes: [],
      backgroundColor: SLIDE_DEFAULTS.BACKGROUND_COLOR,
      createdAt: Date.now(),
    };
    storage.set('slides', [...currentSlides, newSlide]);
    return newSlide.id;
  }, []);

  /**
   * Removes a slide from storage
   * All text boxes on the slide are also removed
   */
  const deleteSlide = useMutation(({ storage }, slideId: string) => {
    const currentSlides = storage.get('slides');
    const filteredSlides = currentSlides.filter((slide) => slide.id !== slideId);
    storage.set('slides', filteredSlides);
  }, []);

  /**
   * Migrates slides from old format to new format
   * This ensures backwards compatibility with older data structures
   * Only runs if migration is needed (textBoxes is not an array)
   */
  const migrateSlides = useMutation(({ storage }) => {
    const currentSlides = storage.get('slides');
    let needsMigration = false;
    
    const migratedSlides = currentSlides.map((slide: any) => {
      if (!Array.isArray(slide.textBoxes)) {
        needsMigration = true;
        return {
          id: slide.id,
          textBoxes: [],
          backgroundColor: slide.backgroundColor || SLIDE_DEFAULTS.BACKGROUND_COLOR,
          createdAt: slide.createdAt || Date.now(),
        };
      }
      return slide;
    });
    
    if (needsMigration) {
      storage.set('slides', migratedSlides);
    }
  }, []);

  return {
    addSlide,
    deleteSlide,
    migrateSlides,
  };
}

