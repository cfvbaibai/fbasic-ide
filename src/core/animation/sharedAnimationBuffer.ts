/**
 * Shared animation state buffer for Executor Worker ↔ Animation Worker sync.
 *
 * @see {@link docs/reference/shared-display-buffer.md} for full buffer layout documentation
 *
 * This module provides:
 * 1. Helper functions for sprite state read/write (compatible with raw Float64Array views)
 * 2. Sync command serialization/deserialization functions
 * 3. Constants for buffer layout
 *
 * For unified buffer access with consistent view creation, use SharedDisplayBufferAccessor
 * from sharedDisplayBufferAccessor.ts. The helper functions in this module remain
 * backward compatible with raw views for testing and direct access.
 *
 * Animation Section Layout (Float64Array indices within combined buffer):
 *   [0-95]   - Sprite data: 8 sprites × 12 (x, y, isActive, isVisible, frameIndex, remainingDistance,
 *                                       totalDistance, direction, speed, priority, characterType, colorCombination)
 *   [96]     - Sync command type (0=none, 1=START_MOVEMENT, 2=STOP_MOVEMENT, 3=ERASE_MOVEMENT, 4=SET_POSITION)
 *   [97]     - Sync action number (0-7)
 *   [98]     - Sync parameter 1 (startX for START_MOVEMENT, x for SET_POSITION)
 *   [99]     - Sync parameter 2 (startY for START_MOVEMENT, y for SET_POSITION)
 *   [100]    - Sync parameter 3 (direction for START_MOVEMENT)
 *   [101]    - Sync parameter 4 (speed for START_MOVEMENT)
 *   [102]    - Sync parameter 5 (distance for START_MOVEMENT)
 *   [103]    - Sync parameter 6 (priority for START_MOVEMENT)
 *   [104]    - Acknowledgment flag (0=pending, 1=acknowledged)
 *
 * In the combined display buffer (2160 bytes), the animation sync section starts
 * at byte offset 2112 (Float64 index 264 when viewing from buffer start).
 */

export const MAX_SPRITES = 8
// 12 floats per sprite: x, y, isActive, isVisible, frameIndex, remainingDistance, totalDistance,
// direction, speed, priority, characterType, colorCombination
const FLOATS_PER_SPRITE = 12
export const SPRITE_DATA_FLOATS = MAX_SPRITES * FLOATS_PER_SPRITE // 96
const SYNC_SECTION_FLOATS = 9 // command type, action number, params (6), ack
export const ANIMATION_SECTION_FLOATS = SPRITE_DATA_FLOATS + SYNC_SECTION_FLOATS // 105

// Sync section offsets (in Float64Array indices, relative to animation section)
export const SYNC_COMMAND_TYPE_OFFSET = SPRITE_DATA_FLOATS // 96
export const SYNC_ACTION_NUMBER_OFFSET = 97
export const SYNC_PARAM1_OFFSET = 98
export const SYNC_PARAM2_OFFSET = 99
export const SYNC_PARAM3_OFFSET = 100
export const SYNC_PARAM4_OFFSET = 101
export const SYNC_PARAM5_OFFSET = 102
export const SYNC_PARAM6_OFFSET = 103
export const SYNC_ACK_OFFSET = 104

// Sync command types
export enum SyncCommandType {
  NONE = 0,
  START_MOVEMENT = 1,
  STOP_MOVEMENT = 2,
  ERASE_MOVEMENT = 3,
  SET_POSITION = 4,
  CLEAR_ALL_MOVEMENTS = 5,
}

// Acknowledgment values
export const ACK_PENDING = 0
export const ACK_RECEIVED = 1

/** Slot base index for actionNumber i: [base]=x, [base+1]=y, [base+2]=isActive, [base+3]=isVisible, [base+4]=frameIndex, [base+5]=remainingDistance, [base+6]=totalDistance, [base+7]=direction, [base+8]=speed, [base+9]=priority, [base+10]=characterType, [base+11]=colorCombination */
export function slotBase(actionNumber: number): number {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) {
    throw new RangeError(`actionNumber must be 0-${MAX_SPRITES - 1}, got ${actionNumber}`)
  }
  return actionNumber * FLOATS_PER_SPRITE
}

/** Write one sprite's full animation state into the shared view. */
export function writeSpriteState(
  view: Float64Array,
  actionNumber: number,
  x: number,
  y: number,
  isActive: boolean,
  isVisible: boolean,
  frameIndex: number = 0,
  remainingDistance: number = 0,
  totalDistance: number = 0,
  direction: number = 0,
  speed: number = 0,
  priority: number = 0,
  characterType: number = 0,
  colorCombination: number = 0
): void {
  const base = slotBase(actionNumber)
  view[base] = x
  view[base + 1] = y
  view[base + 2] = isActive ? 1 : 0
  view[base + 3] = isVisible ? 1 : 0
  view[base + 4] = frameIndex
  view[base + 5] = remainingDistance
  view[base + 6] = totalDistance
  view[base + 7] = direction
  view[base + 8] = speed
  view[base + 9] = priority
  view[base + 10] = characterType
  view[base + 11] = colorCombination
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

/** Read isVisible for one sprite (1 = visible, 0 = invisible). */
export function readSpriteIsVisible(view: Float64Array, actionNumber: number): boolean {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return false
  const base = slotBase(actionNumber)
  return view[base + 3] !== 0
}

/** Read frameIndex for one sprite (which animation frame to show). */
export function readSpriteFrameIndex(view: Float64Array, actionNumber: number): number {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
  const base = slotBase(actionNumber)
  return view[base + 4] ?? 0
}

/** Read remainingDistance for one sprite (dots remaining in movement). */
export function readSpriteRemainingDistance(view: Float64Array, actionNumber: number): number {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
  const base = slotBase(actionNumber)
  return view[base + 5] ?? 0
}

/** Read totalDistance for one sprite (total distance in dots). */
export function readSpriteTotalDistance(view: Float64Array, actionNumber: number): number {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
  const base = slotBase(actionNumber)
  return view[base + 6] ?? 0
}

/** Read direction for one sprite (0-8 direction code). */
export function readSpriteDirection(view: Float64Array, actionNumber: number): number {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
  const base = slotBase(actionNumber)
  return view[base + 7] ?? 0
}

/** Read speed for one sprite (MOVE command speed parameter C). */
export function readSpriteSpeed(view: Float64Array, actionNumber: number): number {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
  const base = slotBase(actionNumber)
  return view[base + 8] ?? 0
}

/** Read priority for one sprite (0=front, 1=back). */
export function readSpritePriority(view: Float64Array, actionNumber: number): number {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
  const base = slotBase(actionNumber)
  return view[base + 9] ?? 0
}

/** Read characterType for one sprite (DEF MOVE character type). */
export function readSpriteCharacterType(view: Float64Array, actionNumber: number): number {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
  const base = slotBase(actionNumber)
  return view[base + 10] ?? 0
}

/** Read colorCombination for one sprite. */
export function readSpriteColorCombination(view: Float64Array, actionNumber: number): number {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
  const base = slotBase(actionNumber)
  return view[base + 11] ?? 0
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
  console.log('[writeSyncCommand] BEFORE writing, current ack value:', view[SYNC_ACK_OFFSET])
  view[SYNC_COMMAND_TYPE_OFFSET] = commandType
  view[SYNC_ACTION_NUMBER_OFFSET] = actionNumber
  view[SYNC_PARAM1_OFFSET] = params.startX ?? 0
  view[SYNC_PARAM2_OFFSET] = params.startY ?? 0
  view[SYNC_PARAM3_OFFSET] = params.direction ?? 0
  view[SYNC_PARAM4_OFFSET] = params.speed ?? 0
  view[SYNC_PARAM5_OFFSET] = params.distance ?? 0
  view[SYNC_PARAM6_OFFSET] = params.priority ?? 0
  view[SYNC_ACK_OFFSET] = ACK_PENDING
  console.log('[writeSyncCommand] AFTER writing ack to ACK_PENDING, ack value:', view[SYNC_ACK_OFFSET])
}

/**
 * Write CLEAR_ALL_MOVEMENTS command to the sync buffer.
 * AnimationWorker will clear all internal movement states when it processes this.
 */
export function writeClearAllMovementsCommand(view: Float64Array): void {
  console.log('[writeClearAllMovementsCommand] Writing CLEAR_ALL_MOVEMENTS command')
  view[SYNC_COMMAND_TYPE_OFFSET] = SyncCommandType.CLEAR_ALL_MOVEMENTS
  view[SYNC_ACTION_NUMBER_OFFSET] = 0 // actionNumber unused for CLEAR_ALL
  view[SYNC_PARAM1_OFFSET] = 0
  view[SYNC_PARAM2_OFFSET] = 0
  view[SYNC_PARAM3_OFFSET] = 0
  view[SYNC_PARAM4_OFFSET] = 0
  view[SYNC_PARAM5_OFFSET] = 0
  view[SYNC_PARAM6_OFFSET] = 0
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

  // Only valid command types (1-5) are real commands; anything else is garbage/uninitialized
  if (commandType < SyncCommandType.START_MOVEMENT || commandType > SyncCommandType.CLEAR_ALL_MOVEMENTS) {
    return null
  }

  console.log('[readSyncCommand] Reading VALID command from buffer:', {
    commandType,
    commandTypeName: commandType === 1 ? 'START_MOVEMENT' : commandType === 2 ? 'STOP_MOVEMENT' : commandType === 3 ? 'ERASE_MOVEMENT' : commandType === 4 ? 'SET_POSITION' : commandType === 5 ? 'CLEAR_ALL_MOVEMENTS' : 'UNKNOWN',
    actionNumber: view[SYNC_ACTION_NUMBER_OFFSET],
    startX: view[SYNC_PARAM1_OFFSET],
    startY: view[SYNC_PARAM2_OFFSET],
    direction: view[SYNC_PARAM3_OFFSET],
    speed: view[SYNC_PARAM4_OFFSET],
    distance: view[SYNC_PARAM5_OFFSET],
    priority: view[SYNC_PARAM6_OFFSET],
  })

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

  const initialAck = syncView[ackIndex]
  console.log('[waitForAck] Starting wait, initial ack value:', initialAck, '(0=cleared, 1=received, 2=pending)')

  while (syncView[ackIndex] === ACK_PENDING) {
    const elapsed = performance.now() - startTime
    if (elapsed >= timeoutMs) {
      console.log('[waitForAck] Timeout after', elapsed.toFixed(2), 'ms')
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

  const finalAck = syncView[ackIndex]
  console.log('[waitForAck] Wait ended, final ack value:', finalAck, 'elapsed:', (performance.now() - startTime).toFixed(2), 'ms')
  return finalAck === ACK_RECEIVED
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
