/**
 * Animation Manager
 * Manages animated sprite movement for DEF MOVE and MOVE commands
 */

import { getSpriteSizeForMoveDefinition } from '@/core/animation/CharacterAnimationBuilder'
import {
  clearSyncCommand,
  readSpriteIsActive,
  SHARED_ANIMATION_BUFFER_BYTES,
  SHARED_ANIMATION_BUFFER_LENGTH,
  SyncCommandType,
  waitForAck,
  writeSyncAck,
  writeSyncCommand,
} from '@/core/animation/sharedAnimationBuffer'
import { SHARED_DISPLAY_BUFFER_BYTES } from '@/core/animation/sharedDisplayBuffer'
import { SCREEN_DIMENSIONS } from '@/core/constants'
import type { BasicDeviceAdapter } from '@/core/interfaces'
import type { MoveDefinition, MovementState } from '@/core/sprite/types'

/**
 * AnimationManager - Manages 8 action slots (0-7) for animated sprite movement
 * Handles move definitions and movement states with direct synchronization to Animation Worker.
 */
export class AnimationManager {
  private moveDefinitions: Map<number, MoveDefinition> = new Map()
  private movementStates: Map<number, MovementState> = new Map()
  private deviceAdapter?: BasicDeviceAdapter
  /** Shared animation state view (Float64Array for sprite data and sync commands). */
  private sharedAnimationView: Float64Array | null = null
  /** Shared animation sync view (Int32Array for Atomics operations). */
  private sharedSyncView: Int32Array | null = null

  /**
   * Set device adapter for sending animation commands to the main thread.
   * @param adapter - Device adapter implementing sendAnimationCommand
   *   (and optional setSpritePosition, clearSpritePosition)
   */
  setDeviceAdapter(adapter: BasicDeviceAdapter): void {
    this.deviceAdapter = adapter
  }

  /**
   * Set shared animation buffer (used by worker for getMovementStatus / MOVE(n)).
   * Accepts either the standalone animation buffer or the combined display buffer.
   * Extracts both Float64Array view (for sprite data) and Int32Array view (for Atomics sync).
   */
  setSharedAnimationBuffer(buffer: SharedArrayBuffer | undefined): void {
    if (!buffer) {
      this.sharedAnimationView = null
      this.sharedSyncView = null
      console.log('[AnimationManager] setSharedAnimationBuffer: buffer is null/undefined')
      return
    }

    this.sharedAnimationView = this.viewFromBuffer(buffer)
    console.log('[AnimationManager] setSharedAnimationBuffer: view length =', this.sharedAnimationView.length, 'buffer.byteLength =', buffer.byteLength)

    // Extract Int32Array sync view from the sync section
    // The sync section can be at different offsets depending on buffer layout:
    // - Standalone animation buffer (264 bytes): sync at float index 24 (byte 192)
    // - Combined display buffer (1624 bytes): sync at float index 193 (byte 1552)
    const syncSectionFloats = 9 // command type, action number, params (6), ack

    // Detect buffer type by size
    let syncSectionByteOffset: number
    if (buffer.byteLength === SHARED_ANIMATION_BUFFER_BYTES) {
      // Standalone animation buffer: sync section at float 24 (byte 192)
      syncSectionByteOffset = 24 * 8
    } else if (buffer.byteLength === SHARED_DISPLAY_BUFFER_BYTES) {
      // Combined display buffer: sync section at byte 1552 (with padding for alignment)
      syncSectionByteOffset = 1552
    } else {
      // Unknown buffer type, try standalone layout
      syncSectionByteOffset = 24 * 8
      console.warn('[AnimationManager] Unknown buffer size:', buffer.byteLength, 'trying standalone layout')
    }

    // Check if buffer has sync section
    const expectedMinLength = 24 + syncSectionFloats // 33 floats for standalone
    console.log('[AnimationManager] Buffer check:', {
      viewLength: this.sharedAnimationView.length,
      expectedMinLength,
      bufferByteLength: buffer.byteLength,
      sharedDisplayBufferBytes: SHARED_DISPLAY_BUFFER_BYTES,
      syncSectionByteOffset,
    })
    if (this.sharedAnimationView.length >= expectedMinLength || buffer.byteLength >= SHARED_DISPLAY_BUFFER_BYTES) {
      // Create Int32Array view of sync section (9 floats × 2 Int32 per float)
      this.sharedSyncView = new Int32Array(buffer, syncSectionByteOffset, syncSectionFloats * 2)
      console.log('[AnimationManager] Direct sync ENABLED (buffer has sync section at byte', syncSectionByteOffset, ')')
    } else {
      this.sharedSyncView = null
      console.log('[AnimationManager] Direct sync DISABLED (buffer too short, has no sync section)')
    }
  }

  /** Create Float64Array view from buffer (standalone 192 bytes or combined display buffer). */
  private viewFromBuffer(buffer: SharedArrayBuffer): Float64Array {
    const byteLen = buffer.byteLength
    if (byteLen === SHARED_ANIMATION_BUFFER_BYTES) {
      return new Float64Array(buffer)
    }
    if (byteLen >= SHARED_ANIMATION_BUFFER_BYTES) {
      return new Float64Array(buffer, 0, SHARED_ANIMATION_BUFFER_LENGTH)
    }
    throw new RangeError(
      `Shared animation buffer too small: ${byteLen} bytes, need at least ${SHARED_ANIMATION_BUFFER_BYTES}`
    )
  }

  constructor(sharedAnimationBuffer?: SharedArrayBuffer) {
    console.log('[AnimationManager] Constructor called with sharedAnimationBuffer:', {
      hasBuffer: !!sharedAnimationBuffer,
      byteLength: sharedAnimationBuffer?.byteLength,
    })
    if (sharedAnimationBuffer) {
      this.sharedAnimationView = this.viewFromBuffer(sharedAnimationBuffer)
      // Also set up sync view and enable direct sync
      this.setSharedAnimationBuffer(sharedAnimationBuffer)
    }
  }

  /**
   * Define a movement (DEF MOVE command). Stores the definition; does not start movement.
   * Typical flow: DEF MOVE(0)=SPRITE(...) → POSITION 0, X, Y → MOVE 0.
   * Position for this action is initialized to screen center here (right after the move is
   * defined); POSITION can then override it before MOVE runs.
   * @param definition - MoveDefinition (actionNumber 0-7, characterType, direction,
   *   speed, distance, priority, colorCombination)
   * @throws Error if any parameter is out of range
   */
  defineMovement(definition: MoveDefinition): void {
    // Validate action number
    if (definition.actionNumber < 0 || definition.actionNumber > 7) {
      throw new Error(`Invalid action number: ${definition.actionNumber} (must be 0-7)`)
    }

    // Validate parameters
    if (definition.characterType < 0 || definition.characterType > 15) {
      throw new Error(`Invalid character type: ${definition.characterType} (must be 0-15)`)
    }
    if (definition.direction < 0 || definition.direction > 8) {
      throw new Error(`Invalid direction: ${definition.direction} (must be 0-8)`)
    }
    if (definition.speed < 0 || definition.speed > 255) {
      throw new Error(`Invalid speed: ${definition.speed} (must be 0-255)`)
    }
    if (definition.distance < 1 || definition.distance > 255) {
      throw new Error(`Invalid distance: ${definition.distance} (must be 1-255)`)
    }
    if (definition.priority < 0 || definition.priority > 1) {
      throw new Error(`Invalid priority: ${definition.priority} (must be 0-1)`)
    }
    if (definition.colorCombination < 0 || definition.colorCombination > 3) {
      throw new Error(`Invalid color combination: ${definition.colorCombination} (must be 0-3)`)
    }

    this.moveDefinitions.set(definition.actionNumber, definition)

    // Initialize POSITION for this action to screen center when DEF MOVE runs (like DEF SPRITE)
    if (this.deviceAdapter?.setSpritePosition) {
      const existing = this.deviceAdapter.getSpritePosition(definition.actionNumber)
      if (existing === null) {
        const halfSize = getSpriteSizeForMoveDefinition(definition) / 2
        const centerX = SCREEN_DIMENSIONS.SPRITE.DEFAULT_X - halfSize
        const centerY = SCREEN_DIMENSIONS.SPRITE.DEFAULT_Y - halfSize
        this.deviceAdapter.setSpritePosition(definition.actionNumber, centerX, centerY)
      }
    }
  }

  /**
   * Get movement definition for an action slot.
   * @param actionNumber - Action slot 0-7
   * @returns MoveDefinition if defined, otherwise undefined
   */
  getMoveDefinition(actionNumber: number): MoveDefinition | undefined {
    return this.moveDefinitions.get(actionNumber)
  }

  /**
   * Start movement (MOVE command). Initializes state and sends START_MOVEMENT.
   * Uses direct synchronization to Animation Worker when available (no main thread forwarding).
   * @param actionNumber - Action slot 0-7 (must have been defined with DEF MOVE)
   * @param startX - Optional pixel X (0-255); default center if omitted
   * @param startY - Optional pixel Y (0-255); default center if omitted
   * @throws Error if no definition exists for actionNumber
   */
  startMovement(actionNumber: number, startX?: number, startY?: number): void {
    const definition = this.moveDefinitions.get(actionNumber)
    if (!definition) {
      throw new Error(`No movement definition for action number ${actionNumber} (use DEF MOVE first)`)
    }

    // Start position: from POSITION command, or default so sprite center is at screen center
    const screenCenterX = SCREEN_DIMENSIONS.SPRITE.DEFAULT_X
    const screenCenterY = SCREEN_DIMENSIONS.SPRITE.DEFAULT_Y
    const halfSize =
      startX === undefined || startY === undefined
        ? getSpriteSizeForMoveDefinition(definition) / 2
        : 0
    const initialX = startX ?? screenCenterX - halfSize
    const initialY = startY ?? screenCenterY - halfSize

    // Calculate direction deltas
    const { deltaX, deltaY } = this.getDirectionDeltas(definition.direction)

    // Calculate speed: 60/C dots per second; C=0 means every 256 frames (manual: 60/256 dots/sec)
    const speedDotsPerSecond =
      definition.speed === 0 ? 60 / 256 : definition.speed > 0 ? 60 / definition.speed : 0

    // Calculate total distance: 2×D dots
    const totalDistance = 2 * definition.distance

    // Store movement state; startX/startY sent in command and stored for result sync (default = center)
    const movementState: MovementState = {
      actionNumber,
      definition,
      startX: initialX,
      startY: initialY,
      remainingDistance: totalDistance,
      totalDistance,
      speedDotsPerSecond,
      directionDeltaX: deltaX,
      directionDeltaY: deltaY,
      isActive: true,
      currentFrameIndex: 0,
      frameCounter: 0,
    }

    this.movementStates.set(actionNumber, movementState)

    // Notify main thread about new movement (for ctx.movementStates tracking)
    // This ensures main thread knows about the movement for rendering even though
    // positions come from the shared buffer (Animation Worker is single writer)
    if (this.deviceAdapter?.sendAnimationCommand) {
      this.deviceAdapter.sendAnimationCommand({
        type: 'START_MOVEMENT',
        actionNumber,
        definition,
        startX: initialX,
        startY: initialY,
      })
    }

    // Use direct sync to Animation Worker if available
    if (this.sharedAnimationView && this.sharedSyncView) {
      // Write command to shared buffer
      writeSyncCommand(this.sharedAnimationView, SyncCommandType.START_MOVEMENT, actionNumber, {
        startX: initialX,
        startY: initialY,
        direction: definition.direction,
        speed: definition.speed,
        distance: definition.distance,
        priority: definition.priority,
      })

      // Notify Animation Worker and wait for acknowledgment
      try {
        Atomics.notify(this.sharedSyncView, 0) // Notify at index 0 (any index works)
      } catch {
        // Atomics.notify may throw in non-worker contexts
        console.warn('[AnimationManager] Atomics.notify failed (not in worker context?)')
      }

      // Wait for acknowledgment with timeout (but don't throw if no Animation Worker)
      const ackReceived = waitForAck(this.sharedSyncView, 100) // 100ms timeout

      if (!ackReceived) {
        // No Animation Worker running (e.g., in tests) - clear command and continue
        console.warn('[AnimationManager] No Animation Worker ack for START_MOVEMENT, clearing command')
        clearSyncCommand(this.sharedAnimationView)
      } else {
        // Clear acknowledgment for next command
        writeSyncAck(this.sharedAnimationView, 0)
        clearSyncCommand(this.sharedAnimationView)
      }
    } else {
      // Direct sync not available - log warning but continue with local tracking only
      console.warn('[AnimationManager] Direct sync not available for START_MOVEMENT, using local tracking only')
    }
  }

  /**
   * Set movements inactive (main thread notified that they completed naturally).
   * Only updates worker state; does not send any command to main thread.
   * @param actionNumbers - Action slots 0-7 to mark inactive
   */
  setMovementsInactive(actionNumbers: number[]): void {
    for (const actionNumber of actionNumbers) {
      const movement = this.movementStates.get(actionNumber)
      if (movement) {
        movement.isActive = false
      }
    }
  }

  /**
   * Stop movement (CUT command). Stops movement but keeps sprite visible at current position.
   * Uses direct synchronization to Animation Worker.
   * @param actionNumbers - Action slots 0-7 to stop
   */
  stopMovement(actionNumbers: number[]): void {
    for (const actionNumber of actionNumbers) {
      const movement = this.movementStates.get(actionNumber)
      if (movement) {
        movement.isActive = false
      }
    }

    // Notify main thread about stopped movements (for ctx.movementStates tracking)
    if (this.deviceAdapter?.sendAnimationCommand) {
      this.deviceAdapter.sendAnimationCommand({
        type: 'STOP_MOVEMENT',
        actionNumbers,
      })
    }

    // Use direct sync to Animation Worker
    if (this.sharedAnimationView && this.sharedSyncView) {
      for (const actionNumber of actionNumbers) {
        // Write command to shared buffer
        writeSyncCommand(this.sharedAnimationView, SyncCommandType.STOP_MOVEMENT, actionNumber, {})

        // Notify and wait for acknowledgment
        try {
          Atomics.notify(this.sharedSyncView, 0)
        } catch {
          // Atomics.notify may throw in non-worker contexts
        }

        const ackReceived = waitForAck(this.sharedSyncView, 100)
        if (!ackReceived) {
          // No Animation Worker running - clear command and continue
          console.warn('[AnimationManager] No Animation Worker ack for STOP_MOVEMENT, clearing command')
          clearSyncCommand(this.sharedAnimationView)
        } else {
          writeSyncAck(this.sharedAnimationView, 0)
          clearSyncCommand(this.sharedAnimationView)
        }
      }
    } else {
      // Direct sync not available - log warning but continue with local tracking only
      console.warn('[AnimationManager] Direct sync not available, using local tracking only')
    }
  }

  /**
   * Erase movement (ERA command). Stops movement and hides sprite.
   * Uses direct synchronization to Animation Worker.
   * @param actionNumbers - Action slots 0-7 to erase
   */
  eraseMovement(actionNumbers: number[]): void {
    for (const actionNumber of actionNumbers) {
      const movement = this.movementStates.get(actionNumber)
      if (movement) {
        movement.isActive = false
      }
      this.movementStates.delete(actionNumber)
    }

    // Notify main thread about erased movements (for ctx.movementStates tracking)
    if (this.deviceAdapter?.sendAnimationCommand) {
      this.deviceAdapter.sendAnimationCommand({
        type: 'ERASE_MOVEMENT',
        actionNumbers,
      })
    }

    // Use direct sync to Animation Worker
    if (this.sharedAnimationView && this.sharedSyncView) {
      for (const actionNumber of actionNumbers) {
        // Write command to shared buffer
        writeSyncCommand(this.sharedAnimationView, SyncCommandType.ERASE_MOVEMENT, actionNumber, {})

        // Notify and wait for acknowledgment
        try {
          Atomics.notify(this.sharedSyncView, 0)
        } catch {
          // Atomics.notify may throw in non-worker contexts
        }

        const ackReceived = waitForAck(this.sharedSyncView, 100)
        if (!ackReceived) {
          // No Animation Worker running - clear command and continue
          console.warn('[AnimationManager] No Animation Worker ack for ERASE_MOVEMENT, clearing command')
          clearSyncCommand(this.sharedAnimationView)
        } else {
          writeSyncAck(this.sharedAnimationView, 0)
          clearSyncCommand(this.sharedAnimationView)
        }
      }
    } else {
      // Direct sync not available - log warning but continue with local tracking only
      console.warn('[AnimationManager] Direct sync not available, using local tracking only')
    }
  }

  /**
   * Set initial position (POSITION command).
   * Uses direct synchronization to Animation Worker.
   * @param actionNumber - Action slot 0-7
   * @param x - Pixel X (0-255)
   * @param y - Pixel Y (0-255, per F-BASIC manual)
   * @throws Error if actionNumber or coordinates out of range
   */
  setPosition(actionNumber: number, x: number, y: number): void {
    if (actionNumber < 0 || actionNumber > 7) {
      throw new Error(`Invalid action number: ${actionNumber} (must be 0-7)`)
    }
    if (x < 0 || x > 255) {
      throw new Error(`Invalid X coordinate: ${x} (must be 0-255)`)
    }
    if (y < 0 || y > 255) {
      throw new Error(`Invalid Y coordinate: ${y} (must be 0-255)`)
    }

    // Store position locally (for MOVE command to use as start position)
    this.deviceAdapter?.setSpritePosition?.(actionNumber, x, y)

    // Notify main thread about position change (for ctx.movementStates tracking)
    if (this.deviceAdapter?.sendAnimationCommand) {
      this.deviceAdapter.sendAnimationCommand({
        type: 'SET_POSITION',
        actionNumber,
        x,
        y,
      })
    }

    // Use direct sync to Animation Worker
    if (this.sharedAnimationView && this.sharedSyncView) {
      // Write command to shared buffer
      writeSyncCommand(this.sharedAnimationView, SyncCommandType.SET_POSITION, actionNumber, {
        startX: x,
        startY: y,
      })

      // Notify and wait for acknowledgment
      try {
        Atomics.notify(this.sharedSyncView, 0)
      } catch {
        // Atomics.notify may throw in non-worker contexts
      }

      const ackReceived = waitForAck(this.sharedSyncView, 100)
      if (!ackReceived) {
        // No Animation Worker running - clear command and continue
        console.warn('[AnimationManager] No Animation Worker ack for SET_POSITION, clearing command')
        clearSyncCommand(this.sharedAnimationView)
      } else {
        writeSyncAck(this.sharedAnimationView, 0)
        clearSyncCommand(this.sharedAnimationView)
      }
    } else {
      // Direct sync not available - log warning but continue with local tracking only
      console.warn('[AnimationManager] Direct sync not available for SET_POSITION, using local tracking only')
    }
  }

  /**
   * Get movement status (MOVE(n) function). -1 = moving, 0 = complete or not started.
   * When shared buffer is set (worker), use only the buffer: main thread writes isActive
   * when movement completes; worker never gets setMovementsInactive, so movementStates
   * would stay true and MOVE(n) would never return 0 otherwise.
   * @param actionNumber - Action slot 0-7
   * @returns -1 if movement is active, 0 otherwise
   */
  getMovementStatus(actionNumber: number): -1 | 0 {
    if (this.sharedAnimationView) {
      return readSpriteIsActive(this.sharedAnimationView, actionNumber) ? -1 : 0
    }
    const movement = this.movementStates.get(actionNumber)
    if (movement?.isActive) {
      return -1
    }
    return 0
  }

  /**
   * Get sprite position (XPOS/YPOS functions). Position lives in Konva on main thread; worker returns null.
   * Frontend should read from shared buffer or Konva for XPOS/YPOS.
   * @param _actionNumber - Action slot 0-7 (unused in worker; frontend reads from buffer/Konva)
   * @returns null in worker; frontend uses shared buffer or Konva nodes
   */
  getSpritePosition(_actionNumber: number): { x: number; y: number } | null {
    // Position is in Konva nodes, not in worker state
    // Frontend will query Konva nodes for XPOS/YPOS
    return null
  }

  /**
   * Get all movement states (active and inactive).
   * @returns Array of MovementState for all defined movements
   */
  getAllMovementStates(): MovementState[] {
    return Array.from(this.movementStates.values())
  }

  /**
   * Get movement state for a specific action slot.
   * @param actionNumber - Action slot 0-7
   * @returns MovementState if present, otherwise undefined
   */
  getMovementState(actionNumber: number): MovementState | undefined {
    return this.movementStates.get(actionNumber)
  }

  /**
   * Calculate direction deltas from direction code
   * Direction: 0=none, 1=up, 2=up-right, 3=right, 4=down-right,
   *            5=down, 6=down-left, 7=left, 8=up-left
   * Returns dx, dy in range [-1, 0, 1]
   */
  private getDirectionDeltas(direction: number): {
    deltaX: number
    deltaY: number
  } {
    switch (direction) {
      case 0: // None
        return { deltaX: 0, deltaY: 0 }
      case 1: // Up
        return { deltaX: 0, deltaY: -1 }
      case 2: // Up-right
        return { deltaX: 1, deltaY: -1 }
      case 3: // Right
        return { deltaX: 1, deltaY: 0 }
      case 4: // Down-right
        return { deltaX: 1, deltaY: 1 }
      case 5: // Down
        return { deltaX: 0, deltaY: 1 }
      case 6: // Down-left
        return { deltaX: -1, deltaY: 1 }
      case 7: // Left
        return { deltaX: -1, deltaY: 0 }
      case 8: // Up-left
        return { deltaX: -1, deltaY: -1 }
      default:
        return { deltaX: 0, deltaY: 0 }
    }
  }

  /**
   * Reset all movement states (for program reset)
   */
  reset(): void {
    this.movementStates.clear()
    this.moveDefinitions.clear()
  }
}
