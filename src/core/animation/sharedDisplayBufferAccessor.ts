/**
 * Shared Display Buffer Accessor
 *
 * Unified accessor for the combined display buffer that creates consistent views
 * for both Executor Worker (AnimationManager) and Animation Worker.
 *
 * This class encapsulates all offset calculations and provides type-safe
 * sync command methods, serving as the single source of truth for buffer layout.
 *
 * @see {@link docs/reference/shared-display-buffer.md} for full buffer layout
 */

import {
  ACK_PENDING,
  ACK_RECEIVED,
  readSpriteCharacterType,
  readSpriteColorCombination,
  readSpriteDirection,
  readSpriteFrameIndex,
  readSpriteIsActive,
  readSpriteIsVisible,
  readSpritePosition,
  readSpritePriority,
  readSpriteRemainingDistance,
  readSpriteSpeed,
  readSpriteTotalDistance,
  SyncCommandType,
  writeSpriteState as helperWriteSpriteState,
} from './sharedAnimationBuffer'
import { OFFSET_ANIMATION_SYNC, SHARED_DISPLAY_BUFFER_BYTES } from './sharedDisplayBuffer'

/**
 * Parameters for sync commands (varies by command type)
 */
export interface SyncCommandParams {
  startX?: number
  startY?: number
  direction?: number
  speed?: number
  distance?: number
  priority?: number
}

/**
 * Sync command read from buffer
 */
export interface SyncCommand {
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
}

/**
 * Unified accessor for shared display buffer.
 *
 * Creates consistent views for sprite data and sync section, with methods
 * for sync command operations.
 */
export class SharedDisplayBufferAccessor {
  private readonly buffer: SharedArrayBuffer

  // Cached views - created once in constructor
  private readonly spriteViewInternal: Float64Array
  private readonly syncViewInternal: Float64Array
  private readonly syncInt32ViewInternal: Int32Array

  // Section sizes
  private static readonly SPRITE_DATA_FLOATS = 96 // 8 sprites × 12 floats
  private static readonly SYNC_SECTION_FLOATS = 9 // command type + action number + 6 params + ack
  private static readonly SYNC_SECTION_BYTES = 9 * 8 // 72 bytes

  // Offsets within sync section (relative to sync section start in combined buffer)
  // In combined display buffer, sync section starts at byte OFFSET_ANIMATION_SYNC (2128)
  private static readonly SYNC_COMMAND_TYPE_INDEX = 0
  private static readonly SYNC_ACTION_NUMBER_INDEX = 1
  private static readonly SYNC_PARAM1_INDEX = 2
  private static readonly SYNC_PARAM2_INDEX = 3
  private static readonly SYNC_PARAM3_INDEX = 4
  private static readonly SYNC_PARAM4_INDEX = 5
  private static readonly SYNC_PARAM5_INDEX = 6
  private static readonly SYNC_PARAM6_INDEX = 7
  private static readonly SYNC_ACK_INDEX = 8

  /**
   * Create accessor from combined display buffer.
   * @param buffer - SharedArrayBuffer (must be SHARED_DISPLAY_BUFFER_BYTES)
   * @throws RangeError if buffer is too small
   */
  constructor(buffer: SharedArrayBuffer) {
    if (buffer.byteLength < SHARED_DISPLAY_BUFFER_BYTES) {
      throw new RangeError(
        `Buffer too small: ${buffer.byteLength} bytes, need at least ${SHARED_DISPLAY_BUFFER_BYTES}`
      )
    }

    this.buffer = buffer

    // Sprite data view: 96 Float64 elements at byte offset 0
    this.spriteViewInternal = new Float64Array(buffer, 0, SharedDisplayBufferAccessor.SPRITE_DATA_FLOATS)

    // Sync section view: 9 Float64 elements at byte offset OFFSET_ANIMATION_SYNC (2128)
    // This is where the sync section is located in the COMBINED display buffer
    this.syncViewInternal = new Float64Array(
      buffer,
      OFFSET_ANIMATION_SYNC,
      SharedDisplayBufferAccessor.SYNC_SECTION_FLOATS
    )

    // Int32 view for Atomics: 9 Float64 × 2 = 18 Int32 elements at same offset
    this.syncInt32ViewInternal = new Int32Array(
      buffer,
      OFFSET_ANIMATION_SYNC,
      SharedDisplayBufferAccessor.SYNC_SECTION_FLOATS * 2
    )
  }

  /**
   * Get sprite data view (88 Float64 elements).
   * For use with helper functions in sharedAnimationBuffer.ts.
   */
  get spriteView(): Float64Array {
    return this.spriteViewInternal
  }

  /**
   * Get sync section view (9 Float64 elements at byte offset 2128).
   * Indices are 0-8 relative to sync section start.
   */
  get syncView(): Float64Array {
    return this.syncViewInternal
  }

  /**
   * Get sync section Int32 view (18 Int32 elements) for Atomics operations.
   */
  get syncInt32View(): Int32Array {
    return this.syncInt32ViewInternal
  }

  /**
   * Get Int32 index for acknowledgment (for Atomics operations).
   * The syncInt32View starts at the sync section (byte 2128), where ack is at index 8.
   * In Int32 terms: 8 × 2 = 16.
   */
  get ackInt32Index(): number {
    // Ack is at index 8 in sync section
    // syncInt32View starts at sync section, so ack is at Int32 index 8 * 2 = 16
    return 8 * 2
  }

  // ============================================================================
  // Sync Command Methods
  // ============================================================================

  /**
   * Write a sync command to the shared buffer for Animation Worker to process.
   */
  writeSyncCommand(
    commandType: SyncCommandType,
    actionNumber: number,
    params: SyncCommandParams = {}
  ): void {
    const sync = this.syncViewInternal
    sync[SharedDisplayBufferAccessor.SYNC_COMMAND_TYPE_INDEX] = commandType
    sync[SharedDisplayBufferAccessor.SYNC_ACTION_NUMBER_INDEX] = actionNumber
    sync[SharedDisplayBufferAccessor.SYNC_PARAM1_INDEX] = params.startX ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM2_INDEX] = params.startY ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM3_INDEX] = params.direction ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM4_INDEX] = params.speed ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM5_INDEX] = params.distance ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM6_INDEX] = params.priority ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_ACK_INDEX] = ACK_PENDING
  }

  /**
   * Read sync command from shared buffer.
   * Returns null if no command is pending.
   */
  readSyncCommand(): SyncCommand | null {
    const sync = this.syncViewInternal
    const commandType = sync[SharedDisplayBufferAccessor.SYNC_COMMAND_TYPE_INDEX] as SyncCommandType

    // Only valid command types (1-5) are real commands
    if (commandType < SyncCommandType.START_MOVEMENT || commandType > SyncCommandType.CLEAR_ALL_MOVEMENTS) {
      return null
    }

    return {
      commandType,
      actionNumber: sync[SharedDisplayBufferAccessor.SYNC_ACTION_NUMBER_INDEX] as number,
      params: {
        startX: sync[SharedDisplayBufferAccessor.SYNC_PARAM1_INDEX] as number,
        startY: sync[SharedDisplayBufferAccessor.SYNC_PARAM2_INDEX] as number,
        direction: sync[SharedDisplayBufferAccessor.SYNC_PARAM3_INDEX] as number,
        speed: sync[SharedDisplayBufferAccessor.SYNC_PARAM4_INDEX] as number,
        distance: sync[SharedDisplayBufferAccessor.SYNC_PARAM5_INDEX] as number,
        priority: sync[SharedDisplayBufferAccessor.SYNC_PARAM6_INDEX] as number,
      },
    }
  }

  /**
   * Clear sync command from shared buffer (set to NONE).
   */
  clearSyncCommand(): void {
    const sync = this.syncViewInternal
    sync[SharedDisplayBufferAccessor.SYNC_COMMAND_TYPE_INDEX] = SyncCommandType.NONE
    sync[SharedDisplayBufferAccessor.SYNC_ACTION_NUMBER_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM1_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM2_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM3_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM4_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM5_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM6_INDEX] = 0
  }

  /**
   * Write acknowledgment flag.
   */
  writeAck(ack: number): void {
    this.syncViewInternal[SharedDisplayBufferAccessor.SYNC_ACK_INDEX] = ack
  }

  /**
   * Read acknowledgment flag.
   */
  readAck(): number {
    return this.syncViewInternal[SharedDisplayBufferAccessor.SYNC_ACK_INDEX] as number
  }

  /**
   * Notify waiting thread using Atomics (sets ack to RECEIVED and notifies).
   */
  notifyAck(): void {
    this.syncInt32ViewInternal[this.ackInt32Index] = ACK_RECEIVED
    try {
      Atomics.notify(this.syncInt32ViewInternal, this.ackInt32Index, 1)
    } catch {
      // Atomics.notify may throw in some contexts, ignore
    }
  }

  /**
   * Wait for acknowledgment using Atomics.
   * @param timeoutMs - Timeout in milliseconds (default 100)
   * @returns true if acknowledged, false if timeout
   */
  waitForAck(timeoutMs: number = 100): boolean {
    const ackIndex = this.ackInt32Index
    const startTime = performance.now()

    while (this.syncInt32ViewInternal[ackIndex] === ACK_PENDING) {
      const elapsed = performance.now() - startTime
      if (elapsed >= timeoutMs) {
        return false
      }
      try {
        const remaining = Math.min(10, timeoutMs - elapsed)
        Atomics.wait(this.syncInt32ViewInternal, ackIndex, ACK_PENDING, remaining)
      } catch {
        // Atomics.wait may throw if not in a worker or if buffer is not shared
        const start = performance.now()
        while (performance.now() - start < 1) {
          // Busy-wait for 1ms to yield CPU
        }
      }
    }

    return this.syncInt32ViewInternal[ackIndex] === ACK_RECEIVED
  }

  // ============================================================================
  // Sprite State Convenience Methods
  // ============================================================================

  /**
   * Write one sprite's full animation state to shared buffer.
   * Convenience wrapper around helper function.
   */
  writeSpriteState(
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
    helperWriteSpriteState(
      this.spriteViewInternal,
      actionNumber,
      x,
      y,
      isActive,
      isVisible,
      frameIndex,
      remainingDistance,
      totalDistance,
      direction,
      speed,
      priority,
      characterType,
      colorCombination
    )
  }

  /**
   * Clear all sprite data in the shared buffer.
   * Sets all sprites to inactive, invisible, with characterType = -1 (uninitialized).
   */
  clearAllSprites(): void {
    // Set all sprites to uninitialized state
    for (let i = 0; i < 8; i++) {
      this.writeSpriteState(i, 0, 0, false, false, 0, 0, 0, 0, 0, 0, -1, 0)
    }
  }

  /**
   * Read one sprite's position from shared buffer.
   * Returns null if slot not used.
   */
  readSpritePosition(actionNumber: number): { x: number; y: number } | null {
    return readSpritePosition(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read isActive for one sprite (1 = active, 0 = inactive).
   */
  readSpriteIsActive(actionNumber: number): boolean {
    return readSpriteIsActive(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read isVisible for one sprite (1 = visible, 0 = invisible).
   */
  readSpriteIsVisible(actionNumber: number): boolean {
    return readSpriteIsVisible(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read frameIndex for one sprite (which animation frame to show).
   */
  readSpriteFrameIndex(actionNumber: number): number {
    return readSpriteFrameIndex(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read remainingDistance for one sprite (dots remaining in movement).
   */
  readSpriteRemainingDistance(actionNumber: number): number {
    return readSpriteRemainingDistance(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read totalDistance for one sprite (total distance in dots).
   */
  readSpriteTotalDistance(actionNumber: number): number {
    return readSpriteTotalDistance(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read direction for one sprite (0-8 direction code).
   */
  readSpriteDirection(actionNumber: number): number {
    return readSpriteDirection(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read speed for one sprite (MOVE command speed parameter C).
   */
  readSpriteSpeed(actionNumber: number): number {
    return readSpriteSpeed(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read priority for one sprite (0=front, 1=back).
   */
  readSpritePriority(actionNumber: number): number {
    return readSpritePriority(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read characterType for one sprite (DEF MOVE character type).
   */
  readSpriteCharacterType(actionNumber: number): number {
    return readSpriteCharacterType(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read colorCombination for one sprite.
   */
  readSpriteColorCombination(actionNumber: number): number {
    return readSpriteColorCombination(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read all movement states from shared buffer.
   * Returns an array of MovementState objects for slots that have a valid DEF MOVE (characterType >= 0).
   * This allows the main thread rendering to discover which movements have been defined
   * without relying on a separate movementStates ref.
   */
  readAllMovementStates(): Array<{
    actionNumber: number
    definition: {
      actionNumber: number
      characterType: number
      direction: number
      speed: number
      distance: number
      priority: number
      colorCombination: number
    }
  }> {
    const states: Array<{
      actionNumber: number
      definition: {
        actionNumber: number
        characterType: number
        direction: number
        speed: number
        distance: number
        priority: number
        colorCombination: number
      }
    }> = []

    // Read all 8 sprite slots
    for (let actionNumber = 0; actionNumber < 8; actionNumber++) {
      const characterType = this.readSpriteCharacterType(actionNumber)
      // characterType = -1 means uninitialized (no DEF MOVE)
      // characterType >= 0 means a valid DEF MOVE exists
      if (characterType >= 0) {
        const totalDistance = this.readSpriteTotalDistance(actionNumber)
        states.push({
          actionNumber,
          definition: {
            actionNumber,
            characterType,
            direction: this.readSpriteDirection(actionNumber),
            speed: this.readSpriteSpeed(actionNumber),
            distance: Math.round(totalDistance / 2), // distance = totalDistance / 2
            priority: this.readSpritePriority(actionNumber),
            colorCombination: this.readSpriteColorCombination(actionNumber),
          },
        })
      }
    }

    return states
  }
}
