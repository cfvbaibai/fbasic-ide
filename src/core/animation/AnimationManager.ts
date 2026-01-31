/**
 * Animation Manager
 * Manages animated sprite movement for DEF MOVE and MOVE commands
 */

import { getSpriteSizeForMoveDefinition } from '@/core/animation/CharacterAnimationBuilder'
import {
  readSpriteIsActive,
  SHARED_ANIMATION_BUFFER_BYTES,
  SHARED_ANIMATION_BUFFER_LENGTH,
} from '@/core/animation/sharedAnimationBuffer'
import { SCREEN_DIMENSIONS } from '@/core/constants'
import type { AnimationCommand, BasicDeviceAdapter } from '@/core/interfaces'
import type { MoveDefinition, MovementState } from '@/core/sprite/types'

/**
 * AnimationManager - Manages 8 action slots (0-7) for animated sprite movement
 * Handles move definitions and movement states.
 * Note: Position updates happen in the frontend animation loop using Konva nodes.
 */
export class AnimationManager {
  private moveDefinitions: Map<number, MoveDefinition> = new Map()
  private movementStates: Map<number, MovementState> = new Map()
  private deviceAdapter?: BasicDeviceAdapter
  /** Shared animation state view (isActive). When set, getMovementStatus reads from it. */
  private sharedAnimationView: Float64Array | null = null

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
   * Accepts either the standalone animation buffer (192 bytes) or the combined display buffer
   * (1548 bytes); in the latter case uses only the first 192 bytes for the sprite Float64 view.
   */
  setSharedAnimationBuffer(buffer: SharedArrayBuffer | undefined): void {
    this.sharedAnimationView = buffer ? this.viewFromBuffer(buffer) : null
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
    if (sharedAnimationBuffer) {
      this.sharedAnimationView = this.viewFromBuffer(sharedAnimationBuffer)
    }
  }

  /**
   * Define a movement (DEF MOVE command). Stores the definition; does not start movement.
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
   * Start movement (MOVE command). Initializes state and sends START_MOVEMENT to main thread.
   * @param actionNumber - Action slot 0-7 (must have been defined with DEF MOVE)
   * @param startX - Optional pixel X (0-255); default center if omitted
   * @param startY - Optional pixel Y (0-239); default center if omitted
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

    // Send animation command to main thread immediately (startX/startY sent here, not stored)
    if (this.deviceAdapter?.sendAnimationCommand) {
      const command: AnimationCommand = {
        type: 'START_MOVEMENT',
        actionNumber,
        definition,
        startX: initialX,
        startY: initialY,
      }
      this.deviceAdapter.sendAnimationCommand(command)
      this.deviceAdapter.clearSpritePosition?.(actionNumber)
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
   * Sends STOP_MOVEMENT to main thread.
   * @param actionNumbers - Action slots 0-7 to stop
   */
  stopMovement(actionNumbers: number[]): void {
    for (const actionNumber of actionNumbers) {
      const movement = this.movementStates.get(actionNumber)
      if (movement) {
        movement.isActive = false
      }
    }

    // Send animation command to main thread to stop movements
    if (this.deviceAdapter?.sendAnimationCommand) {
      const command: AnimationCommand = {
        type: 'STOP_MOVEMENT',
        actionNumbers,
      }
      this.deviceAdapter.sendAnimationCommand(command)
    }
  }

  /**
   * Erase movement (ERA command). Stops movement and hides sprite; sends ERASE_MOVEMENT to main thread.
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

    // Send animation command to main thread to erase movements
    if (this.deviceAdapter?.sendAnimationCommand) {
      const command: AnimationCommand = {
        type: 'ERASE_MOVEMENT',
        actionNumbers,
      }
      this.deviceAdapter.sendAnimationCommand(command)
    }
  }

  /**
   * Set initial position (POSITION command). Sends SET_POSITION to main thread.
   * Main thread sets Konva node or stores pending for next START_MOVEMENT.
   * @param actionNumber - Action slot 0-7
   * @param x - Pixel X (0-255)
   * @param y - Pixel Y (0-239)
   * @throws Error if actionNumber or coordinates out of range
   */
  setPosition(actionNumber: number, x: number, y: number): void {
    if (actionNumber < 0 || actionNumber > 7) {
      throw new Error(`Invalid action number: ${actionNumber} (must be 0-7)`)
    }
    if (x < 0 || x > 255) {
      throw new Error(`Invalid X coordinate: ${x} (must be 0-255)`)
    }
    if (y < 0 || y > 239) {
      throw new Error(`Invalid Y coordinate: ${y} (must be 0-239)`)
    }

    this.deviceAdapter?.setSpritePosition?.(actionNumber, x, y)
    if (this.deviceAdapter?.sendAnimationCommand) {
      const command: AnimationCommand = {
        type: 'SET_POSITION',
        actionNumber,
        x,
        y,
      }
      this.deviceAdapter.sendAnimationCommand(command)
    }
  }

  /**
   * Get movement status (MOVE(n) function). -1 = moving, 0 = complete or not started.
   * When shared buffer is set (worker), reads isActive from shared memory.
   * @param actionNumber - Action slot 0-7
   * @returns -1 if movement is active, 0 otherwise
   */
  getMovementStatus(actionNumber: number): -1 | 0 {
    if (this.sharedAnimationView && readSpriteIsActive(this.sharedAnimationView, actionNumber)) {
      return -1
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
