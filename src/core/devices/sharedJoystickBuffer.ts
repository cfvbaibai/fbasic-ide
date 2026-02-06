/**
 * Shared Joystick Buffer
 *
 * Provides shared joystick state between main thread (writer) and workers (readers).
 * Main thread writes stick/strig state directly to this buffer.
 * Workers (Executor Worker, Animation Worker) read from this buffer.
 *
 * Layout: 2 joysticks × 2 fields × 8 bytes (Float64) = 32 bytes
 * - stickState: [stick0, stick1] - D-pad state (0-15)
 * - strigState: [strig0, strig1] - Button state (0-15)
 */

const JOYSTICK_COUNT = 2
const FIELDS_PER_JOYSTICK = 2 // stickState, strigState
const BYTES_PER_FIELD = 8 // Float64
export const JOYSTICK_BUFFER_BYTES = JOYSTICK_COUNT * FIELDS_PER_JOYSTICK * BYTES_PER_FIELD // 32 bytes

/**
 * Create SharedArrayBuffer for joystick state
 * Call only when crossOriginIsolated (required for SharedArrayBuffer)
 */
export function createSharedJoystickBuffer(): SharedArrayBuffer {
  if (typeof SharedArrayBuffer === 'undefined') {
    throw new Error('SharedArrayBuffer is not available (require cross-origin isolation)')
  }
  const buffer = new SharedArrayBuffer(JOYSTICK_BUFFER_BYTES)
  // Initialize to zeros
  const view = new Float64Array(buffer)
  view.fill(0)
  return buffer
}

/**
 * Typed views over the shared joystick buffer
 */
export interface JoystickBufferView {
  /** Raw SharedArrayBuffer (32 bytes). */
  buffer: SharedArrayBuffer
  /** Stick state for each joystick [stick0, stick1]. */
  stickState: Float64Array
  /** Strig state for each joystick [strig0, strig1]. */
  strigState: Float64Array
}

/**
 * Create views from an existing shared joystick buffer
 */
export function createViewsFromJoystickBuffer(buffer: SharedArrayBuffer): JoystickBufferView {
  if (buffer.byteLength < JOYSTICK_BUFFER_BYTES) {
    throw new RangeError(
      `Shared joystick buffer too small: ${buffer.byteLength} bytes, need at least ${JOYSTICK_BUFFER_BYTES}`
    )
  }
  const data = new Float64Array(buffer)
  return {
    buffer,
    stickState: data.subarray(0, JOYSTICK_COUNT),
    strigState: data.subarray(JOYSTICK_COUNT, JOYSTICK_COUNT * 2),
  }
}

/**
 * Set stick state for a joystick (main thread writes)
 * @param view - Joystick buffer view
 * @param joystickId - Joystick ID (0 or 1)
 * @param state - Stick state (0-15, where 0=none, 1=right, 2=left, 4=down, 8=up, combinations allowed)
 */
export function setStickState(view: JoystickBufferView, joystickId: number, state: number): void {
  if (joystickId < 0 || joystickId >= JOYSTICK_COUNT) {
    throw new RangeError(`joystickId must be 0-${JOYSTICK_COUNT - 1}, got ${joystickId}`)
  }
  view.stickState[joystickId] = state
}

/**
 * Get stick state for a joystick (workers read)
 * @param view - Joystick buffer view
 * @param joystickId - Joystick ID (0 or 1)
 * @returns Stick state (0-15)
 */
export function getStickState(view: JoystickBufferView, joystickId: number): number {
  if (joystickId < 0 || joystickId >= JOYSTICK_COUNT) {
    return 0
  }
  return view.stickState[joystickId] ?? 0
}

/**
 * Set strig state for a joystick (main thread writes)
 * @param view - Joystick buffer view
 * @param joystickId - Joystick ID (0 or 1)
 * @param state - Strig state (0-15, where 0=none, 1=start, 2=select, 4=B, 8=A, combinations allowed)
 */
export function setStrigState(view: JoystickBufferView, joystickId: number, state: number): void {
  if (joystickId < 0 || joystickId >= JOYSTICK_COUNT) {
    throw new RangeError(`joystickId must be 0-${JOYSTICK_COUNT - 1}, got ${joystickId}`)
  }
  view.strigState[joystickId] = state
}

/**
 * Get strig state for a joystick (workers read)
 * @param view - Joystick buffer view
 * @param joystickId - Joystick ID (0 or 1)
 * @returns Strig state (0-15)
 */
export function getStrigState(view: JoystickBufferView, joystickId: number): number {
  if (joystickId < 0 || joystickId >= JOYSTICK_COUNT) {
    return 0
  }
  return view.strigState[joystickId] ?? 0
}
