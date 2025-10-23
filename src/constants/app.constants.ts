/**
 * Application-wide constants
 * 
 * Centralized configuration values and magic numbers to improve maintainability.
 * Update these constants to change application behavior globally.
 */

/**
 * Default values for new text boxes
 */
export const TEXT_BOX_DEFAULTS = {
  /** Default width in pixels */
  WIDTH: 200,
  /** Default height in pixels */
  HEIGHT: 100,
  /** Default font size in pixels */
  FONT_SIZE: 16,
  /** Default text color */
  COLOR: 'gray.900',
  /** Random position offset range */
  POSITION_OFFSET_RANGE: 200,
  /** Random position base for X */
  POSITION_BASE_X: 100,
  /** Random position base for Y */
  POSITION_BASE_Y: 100,
  /** Random Y offset range */
  POSITION_Y_OFFSET: 150,
} as const;

/**
 * Default values for new slides
 */
export const SLIDE_DEFAULTS = {
  /** Default background color */
  BACKGROUND_COLOR: 'white',
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  /** Sidebar width in pixels */
  SIDEBAR_WIDTH: '240px',
  /** Thumbnail aspect ratio (16:9) */
  THUMBNAIL_ASPECT_RATIO: 16 / 9,
  /** Animation duration for smooth scrolling */
  SCROLL_ANIMATION_DELAY: 100,
  /** Toast notification duration in milliseconds */
  TOAST_DURATION: 2000,
  /** Toast placement */
  TOAST_PLACEMENT: 'top-end',
} as const;

/**
 * Liveblocks Room Configuration
 */
export const ROOM_CONFIG = {
  /** The room ID that all users connect to */
  ROOM_ID: 'chronicle-slides',
  /** Y.js map key for textboxes CRDT storage */
  YJS_TEXTBOXES_KEY: 'textboxes',
} as const;

/**
 * URL Parameters
 */
export const URL_PARAMS = {
  /** Query parameter for shared slide IDs */
  SHARED_SLIDES: 'shared',
  /** Query parameter for edit permission (true/false) */
  CAN_EDIT: 'edit',
} as const;

