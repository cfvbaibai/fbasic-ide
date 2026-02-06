/**
 * Shared display state buffer for main thread ↔ worker sync.
 * Layout: sprites (0–192) + cell chars (192–864) + cell patterns (864–1536) +
 * cursor (1536–1538) + sequence (1540–1544) + scalars (1544–1548) +
 * animation sync (1548–1620).
 * Reuses first 192 bytes for sprite state (Float64Array × 24); screen/sequence/scalars follow.
 * Animation sync section (9 floats) at end for Executor Worker ↔ Animation Worker direct sync.
 */

import type { ScreenCell } from '@/core/interfaces'
import { logCore } from '@/shared/logger'
import { getCharacterByCode, getCodeByChar } from '@/shared/utils/backgroundLookup'

import { MAX_SPRITES } from './sharedAnimationBuffer'

// Screen grid
export const COLS = 28
export const ROWS = 24
export const CELLS = COLS * ROWS // 672

// Byte offsets (plan: §1)
const SPRITES_BYTES = MAX_SPRITES * 3 * 8 // 192
export const OFFSET_SPRITES = 0
export const OFFSET_CHARS = SPRITES_BYTES // 192
export const OFFSET_PATTERNS = OFFSET_CHARS + CELLS // 864
export const OFFSET_CURSOR = OFFSET_PATTERNS + CELLS // 1536
// Sequence at 1540 for Int32 alignment (cursor ends at 1538)
export const OFFSET_SEQUENCE = 1540
export const OFFSET_SCALARS = OFFSET_SEQUENCE + 4 // 1544

// Animation sync section (same layout as standalone animation buffer)
// 9 floats: command type, action number, params (6), ack
// Must be aligned to 8 bytes for Float64Array (1548 + 4 = 1552)
const SYNC_SECTION_FLOATS = 9
const SYNC_SECTION_BYTES = SYNC_SECTION_FLOATS * 8 // 72
// Add padding to align to 8 bytes (1544 + 4 + 4 = 1552, which is divisible by 8)
const SYNC_PADDING = 4
export const OFFSET_ANIMATION_SYNC = OFFSET_SCALARS + 4 + SYNC_PADDING // 1552

export const SHARED_DISPLAY_BUFFER_BYTES = OFFSET_ANIMATION_SYNC + SYNC_SECTION_BYTES // 1624

/**
 * Typed views over the shared display buffer (sprites + screen + cursor + sequence + scalars).
 */
export interface SharedDisplayViews {
  /** Raw SharedArrayBuffer (1620 bytes). */
  buffer: SharedArrayBuffer
  /** Sprite positions and isActive (0-192 bytes; Float64 × 24). */
  spriteView: Float64Array
  /** Screen character codes (28×24 cells). */
  charView: Uint8Array
  /** Screen color patterns (28×24 cells). */
  patternView: Uint8Array
  /** Cursor X, Y (2 bytes). */
  cursorView: Uint8Array
  /** Sequence number for change detection (Int32). */
  sequenceView: Int32Array
  /** Scalars: bgPalette, spritePalette, backdropColor, cgenMode (4 bytes). */
  scalarsView: Uint8Array
  /** Animation sync section (Float64Array × 9) for Executor Worker ↔ Animation Worker direct sync. */
  animationSyncView: Float64Array
}

/** F-BASIC character code for space (empty cell). Code 0 is a picture tile, so buffer must not start as zeros. */
const CHAR_CODE_SPACE = 0x20

/**
 * Create SharedArrayBuffer and typed views for full display state (sprites + screen + cursor + sequence + scalars).
 * Call only when crossOriginIsolated (required for SharedArrayBuffer).
 * Initializes screen region to spaces so the screen shows empty on first load (not code-0 BGITEM).
 */
export function createSharedDisplayBuffer(): SharedDisplayViews {
  if (typeof SharedArrayBuffer === 'undefined') {
    throw new Error('SharedArrayBuffer is not available (require cross-origin isolation)')
  }
  const buffer = new SharedArrayBuffer(SHARED_DISPLAY_BUFFER_BYTES)
  const charView = new Uint8Array(buffer, OFFSET_CHARS, CELLS)
  const patternView = new Uint8Array(buffer, OFFSET_PATTERNS, CELLS)
  // SharedArrayBuffer is zero-initialized;
  // code 0 is a picture BGITEM. Fill screen with space so initial screen is empty.
  charView.fill(CHAR_CODE_SPACE)
  patternView.fill(0)
  return {
    buffer,
    spriteView: new Float64Array(buffer, OFFSET_SPRITES, MAX_SPRITES * 3),
    charView,
    patternView,
    cursorView: new Uint8Array(buffer, OFFSET_CURSOR, 2),
    sequenceView: new Int32Array(buffer, OFFSET_SEQUENCE, 1),
    scalarsView: new Uint8Array(buffer, OFFSET_SCALARS, 4),
    animationSyncView: new Float64Array(buffer, OFFSET_ANIMATION_SYNC, SYNC_SECTION_FLOATS),
  }
}

/**
 * Create views from an existing buffer (e.g. in worker after receiving SET_SHARED_ANIMATION_BUFFER).
 */
export function createViewsFromDisplayBuffer(buffer: SharedArrayBuffer): SharedDisplayViews {
  return {
    buffer,
    spriteView: new Float64Array(buffer, OFFSET_SPRITES, MAX_SPRITES * 3),
    charView: new Uint8Array(buffer, OFFSET_CHARS, CELLS),
    patternView: new Uint8Array(buffer, OFFSET_PATTERNS, CELLS),
    cursorView: new Uint8Array(buffer, OFFSET_CURSOR, 2),
    sequenceView: new Int32Array(buffer, OFFSET_SEQUENCE, 1),
    scalarsView: new Uint8Array(buffer, OFFSET_SCALARS, 4),
    animationSyncView: new Float64Array(buffer, OFFSET_ANIMATION_SYNC, SYNC_SECTION_FLOATS),
  }
}

function cellIndex(x: number, y: number): number {
  return y * COLS + x
}

/**
 * Write screen state from ScreenStateManager into shared views.
 * Does not increment sequence (caller calls incrementSequence after).
 */
export function writeScreenState(
  views: SharedDisplayViews,
  screenBuffer: ScreenCell[][],
  cursorX: number,
  cursorY: number,
  bgPalette: number,
  spritePalette: number,
  backdropColor: number,
  cgenMode: number
): void {
  if (screenBuffer == null) {
    logCore.warn('[sharedDisplayBuffer] writeScreenState: screenBuffer is required, skipping')
    return
  }
  const { charView, patternView, cursorView, scalarsView } = views
  for (let y = 0; y < ROWS; y++) {
    const row = screenBuffer[y]
    for (let x = 0; x < COLS; x++) {
      const cell = row?.[x]
      const idx = cellIndex(x, y)
      const ch = cell?.character ?? ' '
      // Store F-BASIC code (0-255); use mapping so e.g. '「' → 91, not Unicode 12300
      const code = getCodeByChar(ch) ?? (ch.length === 1 ? ch.charCodeAt(0) : 0x20)
      charView[idx] = Math.max(0, Math.min(255, code))
      patternView[idx] = (cell?.colorPattern ?? 0) & 3
    }
  }
  cursorView[0] = Math.max(0, Math.min(COLS - 1, cursorX))
  cursorView[1] = Math.max(0, Math.min(ROWS - 1, cursorY))
  scalarsView[0] = bgPalette & 1
  scalarsView[1] = spritePalette & 3
  scalarsView[2] = Math.max(0, Math.min(60, backdropColor))
  scalarsView[3] = cgenMode & 3
}

export interface DecodedScreenState {
  buffer: ScreenCell[][]
  cursorX: number
  cursorY: number
  bgPalette: number
  spritePalette: number
  backdropColor: number
  cgenMode: number
}

/**
 * Read screen state from shared views into ScreenCell[][] and scalars.
 */
export function readScreenStateFromShared(views: SharedDisplayViews): DecodedScreenState {
  const { charView, patternView, cursorView, scalarsView } = views
  const buffer: ScreenCell[][] = []
  for (let y = 0; y < ROWS; y++) {
    const row: ScreenCell[] = []
    for (let x = 0; x < COLS; x++) {
      const idx = cellIndex(x, y)
      row.push({
        character: getCharacterByCode(charView[idx] ?? 0x20) ?? String.fromCharCode(charView[idx] ?? 0x20),
        colorPattern: (patternView[idx] ?? 0) & 3,
        x,
        y,
      })
    }
    buffer.push(row)
  }
  return {
    buffer,
    cursorX: cursorView[0] ?? 0,
    cursorY: cursorView[1] ?? 0,
    bgPalette: scalarsView[0] ?? 1,
    spritePalette: scalarsView[1] ?? 1,
    backdropColor: scalarsView[2] ?? 0,
    cgenMode: scalarsView[3] ?? 2,
  }
}

export function readSequence(views: SharedDisplayViews): number {
  return views.sequenceView[0] ?? 0
}

/**
 * Increment sequence (worker only). Main thread only reads.
 */
export function incrementSequence(views: SharedDisplayViews): void {
  views.sequenceView[0] = (views.sequenceView[0] ?? 0) + 1
}

// Sprite helpers: use sharedAnimationBuffer with views.spriteView (Float64Array on first 192 bytes)
