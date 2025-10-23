/**
 * Type definitions for slides and text boxes
 * 
 * These types define the core data structures for the Chronicle Slides application.
 * They are used throughout the app for type safety and documentation.
 */

/**
 * Represents a text box on a slide
 * Text boxes can be positioned anywhere on the canvas and edited collaboratively
 */
export interface TextBox {
  /** Unique identifier for the text box */
  id: string;
  /** The text content (synced via Liveblocks storage for compatibility) */
  text: string;
  /** X position on the canvas in pixels */
  x: number;
  /** Y position on the canvas in pixels */
  y: number;
  /** Width of the text box in pixels */
  width: number;
  /** Height of the text box in pixels */
  height: number;
  /** Font size in pixels */
  fontSize: number;
  /** Text color (CSS color value) */
  color: string;
  /** User ID of the creator */
  createdBy: string;
  /** Timestamp of creation */
  createdAt: number;
}

/**
 * Represents a single slide in the presentation
 * Each slide contains multiple text boxes and visual properties
 */
export interface Slide {
  /** Unique identifier for the slide */
  id: string;
  /** Array of text boxes on this slide */
  textBoxes: TextBox[];
  /** Background color (CSS color value) */
  backgroundColor: string;
  /** Timestamp of creation */
  createdAt: number;
}

/**
 * Liveblocks Storage structure
 * This defines what data is persisted across all users
 * Extends Record<string, any> to satisfy Liveblocks LsonObject constraint
 */
export interface Storage extends Record<string, any> {
  /** Array of all slides in the presentation */
  slides: Slide[];
}

/**
 * User presence information
 * This defines ephemeral per-user state that is not persisted
 * Extends Record<string, any> to satisfy Liveblocks JsonObject constraint
 */
export interface Presence extends Record<string, any> {
  /** The slide ID the user is currently viewing/editing */
  currentSlideId: string | null;
  /** The text box ID the user is currently editing */
  editingTextBoxId: string | null;
  /** User's cursor position on the canvas */
  cursor: { x: number; y: number } | null;
  /** Display name for the user */
  userName: string;
  /** Color assigned to the user for visual identification */
  userColor: string;
}

/**
 * User metadata (can be extended with additional profile info)
 */
export interface UserMeta {
  id?: string;
  info?: {
    name?: string;
    avatar?: string;
  };
}

