/**
 * Shared animation state buffer for Executor Worker ↔ Animation Worker sync.
 *
 * Layout (Float64Array):
 *   [0-23]   - Sprite data: 8 sprites × 3 (x, y, isActive)
 *   [24]     - Sync command type (0=none, 1=START_MOVEMENT, 2=STOP_MOVEMENT, 3=ERASE_MOVEMENT, 4=SET_POSITION)
 *   [25]     - Sync action number (0-7)
 *   [26]     - Sync parameter 1 (startX for START_MOVEMENT, x for SET_POSITION)
 *   [27]     - Sync parameter 2 (startY for START_MOVEMENT, y for SET_POSITION)
 *   [28]     - Sync parameter 3 (direction for START_MOVEMENT)
 *   [29]     - Sync parameter 4 (speed for START_MOVEMENT)
 *   [30]     - Sync parameter 5 (distance for START_MOVEMENT)
 *   [31]     - Sync parameter 6 (priority for START_MOVEMENT)
 *   [32]     - Acknowledgment flag (0=pending, 1=acknowledged)
 *
 * For Atomics operations, we use an Int32Array view starting at the sync section.
 */

export const MAX_SPRITES = 8
const FLOATS_PER_SPRITE = 3
const SPRITE_DATA_FLOATS = MAX_SPRITES * FLOATS_PER_SPRITE // 24
const SYNC_SECTION_FLOATS = 9 // command type, action number, params (6), ack
export const SHARED_ANIMATION_BUFFER_LENGTH = SPRITE_DATA_FLOATS + SYNC_SECTION_FLOATS // 33

/** Byte length for SharedArrayBuffer (Float64 = 8 bytes each) */
export const SHARED_ANIMATION_BUFFER_BYTES = SHARED_ANIMATION_BUFFER_LENGTH * 8

// Sync section offsets (in Float64Array indices)
export const SYNC_COMMAND_TYPE_OFFSET = SPRITE_DATA_FLOATS // 24
export const SYNC_ACTION_NUMBER_OFFSET = 25
export const SYNC_PARAM1_OFFSET = 26
export const SYNC_PARAM2_OFFSET = 27
export const SYNC_PARAM3_OFFSET = 28
export const SYNC_PARAM4_OFFSET = 29
export const SYNC_PARAM5_OFFSET = 30
export const SYNC_PARAM6_OFFSET = 31
export const SYNC_ACK_OFFSET = 32

// For Atomics operations - byte offset where Int32Array view starts
// Each Float64 is 8 bytes, so SYNC_COMMAND_TYPE_OFFSET * 8 = 192 bytes
export const SYNC_SECTION_BYTE_OFFSET = SYNC_COMMAND_TYPE_OFFSET * 8

// Sync command types
export enum SyncCommandType {
  NONE = 0,
  START_MOVEMENT = 1,
  STOP_MOVEMENT = 2,
  ERASE_MOVEMENT = 3,
  SET_POSITION = 4,
}

// Acknowledgment values
export const ACK_PENDING = 0
export const ACK_RECEIVED = 1

/**
 * Create SharedArrayBuffer and views for animation state.
 * Returns both Float64Array view (for sprite data) and Int32Array view (for Atomics sync).
 * Call only when crossOriginIsolated (required for SharedArrayBuffer).
 */
export function createSharedAnimationBuffer(): {
  buffer: SharedArrayBuffer
  view: Float64Array
  syncView: Int32Array
} {
  if (typeof SharedArrayBuffer === 'undefined') {
    throw new Error('SharedArrayBuffer is not available (require cross-origin isolation)')
  }
  const buffer = new SharedArrayBuffer(SHARED_ANIMATION_BUFFER_BYTES)
  const view = new Float64Array(buffer)
  // Int32Array view starting at sync section for Atomics operations
  const syncView = new Int32Array(buffer, SYNC_SECTION_BYTE_OFFSET, SYNC_SECTION_FLOATS * 2) // *2 because Float64 is 2x Int32
  return { buffer, view, syncView }
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

// ============================================================================
// Synchronization Functions (Executor Worker ↔ Animation Worker)
// ============================================================================

/**
 * Write a sync command to the shared buffer for Animation Worker to process.
 * Uses Float64Array view for command data.
 */
export function writeSyncCommand(
  view: Float64Array,
  commandType: SyncCommandType,
  actionNumber: number,
  params: {
    startX?: number
    startY?: number
    direction?: number
    speed?: number
    distance?: number
    priority?: number
  } = {}
): void {
  view[SYNC_COMMAND_TYPE_OFFSET] = commandType
  view[SYNC_ACTION_NUMBER_OFFSET] = actionNumber
  view[SYNC_PARAM1_OFFSET] = params.startX ?? 0
  view[SYNC_PARAM2_OFFSET] = params.startY ?? 0
  view[SYNC_PARAM3_OFFSET] = params.direction ?? 0
  view[SYNC_PARAM4_OFFSET] = params.speed ?? 0
  view[SYNC_PARAM5_OFFSET] = params.distance ?? 0
  view[SYNC_PARAM6_OFFSET] = params.priority ?? 0
  view[SYNC_ACK_OFFSET] = ACK_PENDING
}

/**
 * Read sync command from shared buffer.
 * Returns null if no command is pending.
 */
export function readSyncCommand(view: Float64Array): {
  commandType: SyncCommandType
  actionNumber: number
  params: {
    startX: number
    startY: number
    direction: number
    speed: number
    distance: number
    priority: number
  }
} | null {
  const commandType = view[SYNC_COMMAND_TYPE_OFFSET] as SyncCommandType
  if (commandType === SyncCommandType.NONE) {
    return null
  }
  return {
    commandType,
    actionNumber: view[SYNC_ACTION_NUMBER_OFFSET] as number,
    params: {
      startX: view[SYNC_PARAM1_OFFSET] as number,
      startY: view[SYNC_PARAM2_OFFSET] as number,
      direction: view[SYNC_PARAM3_OFFSET] as number,
      speed: view[SYNC_PARAM4_OFFSET] as number,
      distance: view[SYNC_PARAM5_OFFSET] as number,
      priority: view[SYNC_PARAM6_OFFSET] as number,
    },
  }
}

/**
 * Clear sync command from shared buffer (set to NONE).
 */
export function clearSyncCommand(view: Float64Array): void {
  view[SYNC_COMMAND_TYPE_OFFSET] = SyncCommandType.NONE
  view[SYNC_ACTION_NUMBER_OFFSET] = 0
  view[SYNC_PARAM1_OFFSET] = 0
  view[SYNC_PARAM2_OFFSET] = 0
  view[SYNC_PARAM3_OFFSET] = 0
  view[SYNC_PARAM4_OFFSET] = 0
  view[SYNC_PARAM5_OFFSET] = 0
  view[SYNC_PARAM6_OFFSET] = 0
}

/**
 * Write acknowledgment flag (using Float64Array view).
 */
export function writeSyncAck(view: Float64Array, ack: number): void {
  view[SYNC_ACK_OFFSET] = ack
}

/**
 * Read acknowledgment flag (using Float64Array view).
 */
export function readSyncAck(view: Float64Array): number {
  return view[SYNC_ACK_OFFSET] as number
}

/**
 * Get Int32 index for acknowledgment (for Atomics operations).
 * The ack is at SYNC_ACK_OFFSET which is the last slot in the sync section.
 * Each Float64 is 2 Int32s, so ack is at index (SYNC_ACK_OFFSET - SYNC_COMMAND_TYPE_OFFSET) * 2.
 */
export function getAckInt32Index(): number {
  return (SYNC_ACK_OFFSET - SYNC_COMMAND_TYPE_OFFSET) * 2
}

/**
 * Wait for acknowledgment using Atomics.
 * @param syncView - Int32Array view of sync section
 * @param timeoutMs - Timeout in milliseconds (default 100)
 * @returns true if acknowledged, false if timeout
 */
export function waitForAck(syncView: Int32Array, timeoutMs: number = 100): boolean {
  const ackIndex = getAckInt32Index()
  const startTime = performance.now()

  while (syncView[ackIndex] === ACK_PENDING) {
    const elapsed = performance.now() - startTime
    if (elapsed >= timeoutMs) {
      return false // Timeout
    }
    // Use Atomics.wait with a small timeout to yield CPU
    // Note: Atomics.wait requires a SharedArrayBuffer and may throw in some contexts
    try {
      const remaining = Math.min(10, timeoutMs - elapsed)
      Atomics.wait(syncView, ackIndex, ACK_PENDING, remaining)
    } catch {
      // Atomics.wait may throw if not in a worker or if buffer is not shared
      // Fall back to simple busy-wait (brief yield)
      const start = performance.now()
      while (performance.now() - start < 1) {
        // Busy-wait for 1ms to yield CPU
      }
    }
  }

  return syncView[ackIndex] === ACK_RECEIVED
}

/**
 * Notify waiting thread using Atomics.
 * @param syncView - Int32Array view of sync section
 */
export function notifyAck(syncView: Int32Array): void {
  const ackIndex = getAckInt32Index()
  syncView[ackIndex] = ACK_RECEIVED
  try {
    Atomics.notify(syncView, ackIndex, 1)
  } catch {
    // Atomics.notify may throw in some contexts, ignore
  }
}
