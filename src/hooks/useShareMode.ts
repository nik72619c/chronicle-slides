/**
 * Custom hook for managing share/viewer mode
 * 
 * This hook handles reading the URL parameters to determine if the app
 * is in viewer mode (read-only with only specific slides visible).
 */

import { useMemo } from 'react';
import type { Slide } from '../types/slide.types';
import { URL_PARAMS } from '../constants/app.constants';

interface UseShareModeResult {
  /** Whether the app is in read-only viewer mode */
  readOnly: boolean;
  /** Array of slides that should be visible (filtered by shared parameter) */
  visibleSlides: Slide[];
  /** Set of allowed slide IDs (null if not in viewer mode) */
  allowedSlideIds: Set<string> | null;
  /** Whether the user is in shared mode (viewing via share link) */
  isSharedMode: boolean;
}

/**
 * Extracts and parses the share mode from URL parameters
 * 
 * @param slides - All available slides
 * @returns Share mode state and filtered slides
 * 
 * @example
 * // URL: /?shared=slide1,slide2&edit=true
 * const { readOnly, visibleSlides, isSharedMode } = useShareMode(allSlides);
 * // readOnly = false, visibleSlides = [slide1, slide2], isSharedMode = true
 * 
 * @example
 * // URL: /?shared=slide1,slide2&edit=false
 * const { readOnly, visibleSlides, isSharedMode } = useShareMode(allSlides);
 * // readOnly = true, visibleSlides = [slide1, slide2], isSharedMode = true
 */
export function useShareMode(slides: Slide[] | null): UseShareModeResult {
  // Parse shared slide IDs and edit permission from URL
  const { allowedSlideIds, canEdit } = useMemo(() => {
    const search = new URLSearchParams(window.location.search);
    const sharedParam = search.get(URL_PARAMS.SHARED_SLIDES);
    const editParam = search.get(URL_PARAMS.CAN_EDIT);
    
    if (!sharedParam) {
      return { allowedSlideIds: null, canEdit: false };
    }
    
    const ids = sharedParam.split(',').filter(Boolean);
    const canEditValue = editParam === 'true';
    
    return { allowedSlideIds: new Set(ids), canEdit: canEditValue };
  }, []);

  // User is in shared mode if they accessed via a share link
  const isSharedMode = allowedSlideIds !== null;
  
  // Determine if in read-only mode (shared but without edit permission)
  const readOnly = isSharedMode && !canEdit;

  // Filter visible slides based on share mode
  const visibleSlides = useMemo(() => {
    if (!slides) return [];
    if (!allowedSlideIds) return slides;
    
    return slides.filter((slide) => allowedSlideIds.has(slide.id));
  }, [slides, allowedSlideIds]);

  return {
    readOnly,
    visibleSlides,
    allowedSlideIds,
    isSharedMode,
  };
}

