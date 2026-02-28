/**
 * Shared Keyboard Buffer for INKEY$ function
 *
 * Provides shared keyboard state between main thread (writer) and worker (reader).
 * Main thread writes keyboard state directly to this buffer.
 * Worker reads from this buffer for INKEY$ function.
 *
 * Layout:
 * - Bytes 0-7: keyCharCode (Float64) - Character code of pressed key (0 if none)
 * - Bytes 8-15: keyModifiers (Float64) - Bitmask: 1=Shift, 2=Ctrl, 4=Alt
 * - Bytes 16-19: keyAvailable (Int32) - Non-zero when key is available for blocking wait
 * - Bytes 20-23: padding (reserved for alignment)
 *
 * Total: 24 bytes (aligned to Float64)
 */

const FLOAT64_FIELDS = 2
const FLOAT64_BYTES = FLOAT64_FIELDS * 8 // 16 bytes
const KEY_AVAILABLE_INT32_OFFSET = FLOAT64_BYTES // 16
// Round up to multiple of 8 for Float64Array alignment
export const KEYBOARD_BUFFER_BYTES = 24 // 24 bytes (3 × Float64)

/**
 * Create SharedArrayBuffer for keyboard state
 * Call only when crossOriginIsolated (required for SharedArrayBuffer)
 */
export function createSharedKeyboardBuffer(): SharedArrayBuffer {
  if (typeof SharedArrayBuffer === 'undefined') {
    throw new Error('SharedArrayBuffer is not available (require cross-origin isolation)')
  }
  const buffer = new SharedArrayBuffer(KEYBOARD_BUFFER_BYTES)
  // Initialize to zeros
  const view = new Float64Array(buffer)
  view.fill(0)
  return buffer
}

/**
 * Typed views over the shared keyboard buffer
 */
export interface KeyboardBufferView {
  /** Raw SharedArrayBuffer (20 bytes). */
  buffer: SharedArrayBuffer
  /** Character code of currently pressed key (0 if none). */
  keyCharCode: Float64Array
  /** Key modifiers bitmask (1=Shift, 2=Ctrl, 4=Alt). */
  keyModifiers: Float64Array
  /** Int32 view for Atomics operations on keyAvailable flag. */
  keyAvailableInt32: Int32Array
}

/**
 * Create views from an existing shared keyboard buffer
 */
export function createViewsFromKeyboardBuffer(buffer: SharedArrayBuffer): KeyboardBufferView {
  if (buffer.byteLength < KEYBOARD_BUFFER_BYTES) {
    throw new RangeError(
      `Shared keyboard buffer too small: ${buffer.byteLength} bytes, need at least ${KEYBOARD_BUFFER_BYTES}`
    )
  }
  const data = new Float64Array(buffer)
  const int32Data = new Int32Array(buffer)
  return {
    buffer,
    keyCharCode: data.subarray(0, 1),
    keyModifiers: data.subarray(1, 2),
    // Int32 index for keyAvailable flag (byte offset 16 = Int32 index 4)
    keyAvailableInt32: int32Data.subarray(KEY_AVAILABLE_INT32_OFFSET / 4, KEY_AVAILABLE_INT32_OFFSET / 4 + 1),
  }
}

/**
 * Set keyboard state (main thread writes)
 * Also notifies any waiting workers via Atomics.notify.
 * @param view - Keyboard buffer view
 * @param keyChar - Character of pressed key, or empty string if none
 * @param modifiers - Modifier bitmask (1=Shift, 2=Ctrl, 4=Alt)
 */
export function setInkeyState(view: KeyboardBufferView, keyChar: string, modifiers = 0): void {
  // Store character code (0 if empty string)
  view.keyCharCode[0] = keyChar.length > 0 ? keyChar.charCodeAt(0) : 0
  view.keyModifiers[0] = modifiers

  // Set keyAvailable flag and notify waiters
  if (keyChar.length > 0) {
    Atomics.store(view.keyAvailableInt32, 0, 1)
    Atomics.notify(view.keyAvailableInt32, 0, 1)
  }
}

/**
 * Get keyboard state (worker reads)
 * @param view - Keyboard buffer view
 * @returns Object with keyChar string and modifiers bitmask
 */
export function getInkeyState(view: KeyboardBufferView): { keyChar: string; modifiers: number } {
  const charCode = view.keyCharCode[0] ?? 0
  const modifiers = view.keyModifiers[0] ?? 0

  return {
    keyChar: charCode > 0 ? String.fromCharCode(charCode) : '',
    modifiers,
  }
}

/**
 * Clear keyboard state (main thread writes when key released)
 * @param view - Keyboard buffer view
 */
export function clearInkeyState(view: KeyboardBufferView): void {
  view.keyCharCode[0] = 0
  view.keyModifiers[0] = 0
  // Note: Don't clear keyAvailable here - let the worker consume it
}

/**
 * Consume the keyAvailable flag (worker reads after getting key)
 * Resets the flag so the worker can wait for the next key.
 * @param view - Keyboard buffer view
 */
export function consumeKeyAvailable(view: KeyboardBufferView): void {
  Atomics.store(view.keyAvailableInt32, 0, 0)
}

/**
 * Wait for a key to be available (worker blocking)
 * Uses Atomics.wait() to block synchronously until keyAvailable is set.
 * Returns immediately if key is already available.
 * @param view - Keyboard buffer view
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 5000)
 * @returns true if key is available, false if timeout
 */
export function waitForInkeyBlocking(view: KeyboardBufferView, timeoutMs = 5000): boolean {
  // Check if key already available
  if (Atomics.load(view.keyAvailableInt32, 0) !== 0) {
    return true
  }

  // Block until notified or timeout
  const result = Atomics.wait(view.keyAvailableInt32, 0, 0, timeoutMs)
  return result === 'ok'
}
