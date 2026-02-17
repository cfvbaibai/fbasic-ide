/**
 * BG Editor Constants
 *
 * Constants for the Background Graphic Editor
 */

/** Grid dimensions and cell size */
export const BG_GRID = {
  /** Number of columns (28 for F-BASIC background) */
  COLS: 28,
  /** Number of rows (21 for editor, excluding top 3 system rows) */
  ROWS: 21,
  /** Cell size in pixels (8x8 per character) */
  CELL_SIZE: 8,
} as const

/** Editor modes */
export const BG_EDITOR_MODES = {
  SELECT: 'SELECT',
  COPY: 'COPY',
  MOVE: 'MOVE',
  CHAR: 'CHAR',
} as const

/** LocalStorage key for saving editor state */
export const STORAGE_KEY = 'fbasic-bg-editor'

/** Storage version for migration compatibility */
export const STORAGE_VERSION = 1

/** Default palette code for BG rendering */
export const DEFAULT_BG_PALETTE_CODE = 1

/** Default character code (space character) */
export const DEFAULT_BG_CHAR_CODE = 32

/** Available scale options for grid rendering */
export const SCALE_OPTIONS = [1.75, 2, 3, 4] as const

/** Default scale factor for rendering */
export const DEFAULT_RENDER_SCALE = 2
