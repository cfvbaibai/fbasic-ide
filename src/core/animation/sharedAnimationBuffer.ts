/**
 * Shared animation state buffer for main thread ↔ worker sync.
 * Layout: Float64Array, 8 sprites × 3 (x, y, isActive). No atomics.
 */

export const MAX_SPRITES = 8
const FLOATS_PER_SPRITE = 3
export const SHARED_ANIMATION_BUFFER_LENGTH = MAX_SPRITES * FLOATS_PER_SPRITE

/** Byte length for SharedArrayBuffer (Float64 = 8 bytes each) */
export const SHARED_ANIMATION_BUFFER_BYTES = SHARED_ANIMATION_BUFFER_LENGTH * 8

/**
 * Create SharedArrayBuffer and Float64Array view for animation state.
 * Call only when crossOriginIsolated (required for SharedArrayBuffer).
 */
export function createSharedAnimationBuffer(): {
  buffer: SharedArrayBuffer
  view: Float64Array
} {
  if (typeof SharedArrayBuffer === 'undefined') {
    throw new Error('SharedArrayBuffer is not available (require cross-origin isolation)')
  }
  const buffer = new SharedArrayBuffer(SHARED_ANIMATION_BUFFER_BYTES)
  const view = new Float64Array(buffer)
  return { buffer, view }
}

/** Slot base index for actionNumber i: [base]=x, [base+1]=y, [base+2]=isActive (0|1) */
export function slotBase(actionNumber: number): number {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) {
    throw new RangeError(`actionNumber must be 0-${MAX_SPRITES - 1}, got ${actionNumber}`)
  }
  return actionNumber * FLOATS_PER_SPRITE
}

/** Write one sprite's position and isActive into the shared view. */
export function writeSpriteState(
  view: Float64Array,
  actionNumber: number,
  x: number,
  y: number,
  isActive: boolean
): void {
  const base = slotBase(actionNumber)
  view[base] = x
  view[base + 1] = y
  view[base + 2] = isActive ? 1 : 0
}

/** Read one sprite's position from the shared view. Returns null if slot not used (optional: check isActive). */
export function readSpritePosition(
  view: Float64Array,
  actionNumber: number
): { x: number; y: number } | null {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return null
  const base = slotBase(actionNumber)
  return { x: view[base] ?? 0, y: view[base + 1] ?? 0 }
}

/** Read isActive for one sprite (1 = active, 0 = inactive). */
export function readSpriteIsActive(view: Float64Array, actionNumber: number): boolean {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return false
  const base = slotBase(actionNumber)
  return view[base + 2] !== 0
}
