/**
 * Component Props Type Definitions
 * 
 * This file contains all props interfaces for React components.
 * Centralizing props types improves maintainability and reusability.
 */

import type { Slide, TextBox } from './slide.types';

/**
 * Props for the TextBox component
 * Manages individual text box rendering and interaction
 */
export interface TextBoxProps {
  /** The text box data to render */
  textBox: TextBox;
  /** Whether this text box is currently being edited by the user */
  isEditing: boolean;
  /** Callback to update text box properties */
  onUpdate: (id: string, updates: Partial<TextBox>) => void;
  /** Callback when user starts editing this text box */
  onStartEditing: (id: string) => void;
  /** Callback when user stops editing */
  onStopEditing: () => void;
  /** Whether the component is in read-only mode */
  readOnly?: boolean;
}

/**
 * Props for the SlideThumbnail component
 * Renders a thumbnail preview of a slide in the sidebar
 */
export interface SlideThumbnailProps {
  /** The slide data to render */
  slide: Slide;
  /** Index of this slide in the list */
  index: number;
  /** Whether this is the currently active slide */
  isActive: boolean;
  /** Array of other users currently viewing/editing this slide */
  othersOnThisSlide: any[];
  /** Callback when slide is selected */
  onSelect: (slideId: string) => void;
  /** Callback when slide is deleted */
  onDelete: (slideId: string, index: number) => void;
  /** Ref map for scrolling to thumbnails */
  thumbnailRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  /** Whether the app is in shared mode (hides delete button) */
  isSharedMode?: boolean;
}

/**
 * Props for the SlideCanvas component
 * Main canvas area for viewing and editing slide content
 */
export interface SlideCanvasProps {
  /** The slide to render on the canvas */
  slide: Slide;
  /** Callback to update a text box on this slide */
  onUpdateTextBox: (textBoxId: string, updates: Partial<TextBox>) => void;
  /** Callback to add a new text box to this slide */
  onAddTextBox: () => void;
  /** Whether the canvas is in read-only mode */
  readOnly?: boolean;
}

/**
 * Props for the ShareDialog component
 * Dialog for generating shareable links to specific slides
 */
export interface ShareDialogProps {
  /** Array of all slides to choose from for sharing */
  slides: Slide[];
}

