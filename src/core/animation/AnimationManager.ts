/**
 * Animation Manager
 * Manages animated sprite movement for DEF MOVE and MOVE commands
 */

import type { AnimationCommand, BasicDeviceAdapter } from '@/core/interfaces'
import type { MoveDefinition, MovementState } from '@/core/sprite/types'

/**
 * AnimationManager - Manages 8 action slots (0-7) for animated sprite movement
 * Handles move definitions, movement states, and position updates
 */
export class AnimationManager {
  private moveDefinitions: Map<number, MoveDefinition> = new Map()
  private movementStates: Map<number, MovementState> = new Map()
  private storedPositions: Map<number, { x: number; y: number }> = new Map()
  private deviceAdapter?: BasicDeviceAdapter

  /**
   * Set device adapter for sending animation commands
   */
  setDeviceAdapter(adapter: BasicDeviceAdapter): void {
    this.deviceAdapter = adapter
  }

  constructor() {
    // Initialize 8 action slots with different default positions to avoid overlap
    // Spread them out in a grid pattern
    const defaultPositions = [
      { x: 80, y: 80 }, // Action 0: top-left
      { x: 176, y: 80 }, // Action 1: top-right
      { x: 80, y: 160 }, // Action 2: bottom-left
      { x: 176, y: 160 }, // Action 3: bottom-right
      { x: 128, y: 60 }, // Action 4: top-center
      { x: 128, y: 180 }, // Action 5: bottom-center
      { x: 50, y: 120 }, // Action 6: left-center
      { x: 206, y: 120 }, // Action 7: right-center
    ]
    for (let i = 0; i < 8; i++) {
      this.storedPositions.set(i, defaultPositions[i] ?? { x: 120, y: 120 })
    }
  }

  /**
   * Define a movement (DEF MOVE command)
   * Stores the movement definition but does not start movement
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
    if (definition.speed < 1 || definition.speed > 255) {
      throw new Error(`Invalid speed: ${definition.speed} (must be 1-255)`)
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
   * Get movement definition
   */
  getMoveDefinition(actionNumber: number): MoveDefinition | undefined {
    return this.moveDefinitions.get(actionNumber)
  }

  /**
   * Start movement (MOVE command)
   * Initializes movement state and begins animation
   */
  startMovement(actionNumber: number, startX?: number, startY?: number): void {
    const definition = this.moveDefinitions.get(actionNumber)
    if (!definition) {
      throw new Error(`No movement definition for action number ${actionNumber} (use DEF MOVE first)`)
    }

    // Use stored position or provided position, or default to (120, 120)
    const storedPos = this.storedPositions.get(actionNumber)
    const initialX = startX ?? storedPos?.x ?? 120
    const initialY = startY ?? storedPos?.y ?? 120

    // Calculate direction deltas
    const { deltaX, deltaY } = this.getDirectionDeltas(definition.direction)

    // Calculate speed: 60/C dots per second
    const speedDotsPerSecond = definition.speed > 0 ? 60 / definition.speed : 0

    // Calculate total distance: 2×D dots
    const totalDistance = 2 * definition.distance

    // Create movement state
    const movementState: MovementState = {
      actionNumber,
      definition,
      startX: initialX,
      startY: initialY,
      currentX: initialX,
      currentY: initialY,
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

    // Send animation command to main thread immediately
    if (this.deviceAdapter?.sendAnimationCommand) {
      const command: AnimationCommand = {
        type: 'START_MOVEMENT',
        actionNumber,
        definition,
        startX: initialX,
        startY: initialY,
      }
      this.deviceAdapter.sendAnimationCommand(command)
    }
  }

  /**
   * Update all active movements (called each frame)
   * @param deltaTime - Time elapsed since last frame in milliseconds
   */
  updateMovements(deltaTime: number): void {
    for (const movement of this.movementStates.values()) {
      if (!movement.isActive || movement.remainingDistance <= 0) {
        movement.isActive = false
        continue
      }

      // Calculate distance per frame: speedDotsPerSecond × (deltaTime / 1000)
      const dotsPerFrame = movement.speedDotsPerSecond * (deltaTime / 1000)
      const distanceThisFrame = Math.min(dotsPerFrame, movement.remainingDistance)

      // Update position
      movement.currentX += movement.directionDeltaX * distanceThisFrame
      movement.currentY += movement.directionDeltaY * distanceThisFrame
      movement.remainingDistance -= distanceThisFrame

      // Clamp to screen bounds
      movement.currentX = Math.max(0, Math.min(255, movement.currentX))
      movement.currentY = Math.max(0, Math.min(239, movement.currentY))

      // Check if movement is complete
      if (movement.remainingDistance <= 0) {
        movement.isActive = false
        // Update stored position for next movement
        this.storedPositions.set(movement.actionNumber, {
          x: movement.currentX,
          y: movement.currentY,
        })
      }
    }
  }

  /**
   * Stop movement (CUT command)
   * Stops movement but keeps sprite visible at current position
   */
  stopMovement(actionNumbers: number[]): void {
    for (const actionNumber of actionNumbers) {
      const movement = this.movementStates.get(actionNumber)
      if (movement) {
        movement.isActive = false
        // Update stored position
        this.storedPositions.set(actionNumber, {
          x: movement.currentX,
          y: movement.currentY,
        })
      }
    }
  }

  /**
   * Erase movement (ERA command)
   * Stops movement and hides sprite
   */
  eraseMovement(actionNumbers: number[]): void {
    for (const actionNumber of actionNumbers) {
      const movement = this.movementStates.get(actionNumber)
      if (movement) {
        movement.isActive = false
      }
      // Remove movement state
      this.movementStates.delete(actionNumber)
    }
  }

  /**
   * Set initial position (POSITION command)
   * Stores position for next MOVE command
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

    this.storedPositions.set(actionNumber, { x, y })
  }

  /**
   * Get movement status (MOVE(n) function)
   * Returns -1 if movement is active, 0 if complete or not started
   */
  getMovementStatus(actionNumber: number): -1 | 0 {
    const movement = this.movementStates.get(actionNumber)
    if (movement?.isActive) {
      return -1
    }
    return 0
  }

  /**
   * Get sprite position (XPOS/YPOS functions)
   */
  getSpritePosition(actionNumber: number): { x: number; y: number } | null {
    const movement = this.movementStates.get(actionNumber)
    if (movement) {
      return {
        x: movement.currentX,
        y: movement.currentY,
      }
    }
    // Return stored position if no active movement
    const stored = this.storedPositions.get(actionNumber)
    if (stored) {
      return stored
    }
    return null
  }

  /**
   * Get all active movement states
   */
  getAllMovementStates(): MovementState[] {
    return Array.from(this.movementStates.values())
  }

  /**
   * Get movement state for a specific action number
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
    // Reset stored positions to defaults
    for (let i = 0; i < 8; i++) {
      this.storedPositions.set(i, { x: 120, y: 120 })
    }
  }
}
