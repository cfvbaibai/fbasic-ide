/**
 * Animation Worker - Manages sprite state (positions, movement, physics) as the SINGLE WRITER
 * to the shared animation buffer. Main thread becomes read-only for rendering.
 *
 * Responsibilities:
 * - Receive animation commands from Executor Worker
 * - Calculate sprite positions (x += dx * speed * dt)
 * - Handle screen wrapping (modulo 256×240)
 * - Manage movement lifecycle (isActive, remainingDistance)
 * - Write positions to shared buffer (ONLY writer)
 * - Run at fixed 60Hz tick rate
 */

import {
  MAX_SPRITES,
  SHARED_ANIMATION_BUFFER_BYTES,
  SHARED_ANIMATION_BUFFER_LENGTH,
  writeSpriteState,
} from '@/core/animation/sharedAnimationBuffer'
import { SCREEN_DIMENSIONS } from '@/core/constants'
import type { MoveDefinition } from '@/core/sprite/types'
import { logWorker } from '@/shared/logger'

/**
 * Animation Worker command types (Executor Worker → Animation Worker)
 */
export type AnimationWorkerCommand =
  | { type: 'START_MOVEMENT'; actionNumber: number; definition: MoveDefinition; startX: number; startY: number }
  | { type: 'STOP_MOVEMENT'; actionNumbers: number[] }
  | { type: 'ERASE_MOVEMENT'; actionNumbers: number[] }
  | { type: 'SET_POSITION'; actionNumber: number; x: number; y: number }
  | { type: 'SET_SHARED_BUFFER'; buffer: SharedArrayBuffer }
  | { type: 'TICK'; deltaTime: number }

/**
 * Movement state tracked by Animation Worker
 * Position is the single source of truth, written to shared buffer
 */
interface WorkerMovementState {
  actionNumber: number
  definition: MoveDefinition
  x: number
  y: number
  remainingDistance: number
  speedDotsPerSecond: number
  directionDeltaX: number
  directionDeltaY: number
  isActive: boolean
  currentFrameIndex: number
  frameCounter: number
}

const TARGET_FPS = 60
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS
const MAX_DELTA_TIME_MS = 100 // Cap at 100ms to prevent teleportation

/**
 * AnimationWorker class - manages sprite animation state and writes to shared buffer
 */
export class AnimationWorker {
  private movementStates: Map<number, WorkerMovementState> = new Map()
  private sharedAnimationView: Float64Array | null = null
  private tickInterval: number | null = null
  private lastTickTime = 0
  private isRunning = false

  constructor() {
    logWorker.debug('[AnimationWorker] Created')
  }

  /**
   * Handle message from Executor Worker or Main Thread
   */
  handleMessage(command: AnimationWorkerCommand): void {
    switch (command.type) {
      case 'START_MOVEMENT':
        this.handleStartMovement(command.actionNumber, command.definition, command.startX, command.startY)
        break
      case 'STOP_MOVEMENT':
        this.handleStopMovement(command.actionNumbers)
        break
      case 'ERASE_MOVEMENT':
        this.handleEraseMovement(command.actionNumbers)
        break
      case 'SET_POSITION':
        this.handleSetPosition(command.actionNumber, command.x, command.y)
        break
      case 'SET_SHARED_BUFFER':
        this.handleSetSharedBuffer(command.buffer)
        break
      case 'TICK':
        this.tick(command.deltaTime)
        break
      default:
        logWorker.warn('[AnimationWorker] Unknown command type:', (command as { type: string }).type)
    }
  }

  /**
   * Set shared animation buffer (called by Main Thread during initialization)
   */
  private handleSetSharedBuffer(buffer: SharedArrayBuffer): void {
    if (buffer.byteLength < SHARED_ANIMATION_BUFFER_BYTES) {
      throw new RangeError(
        `Shared animation buffer too small: ${buffer.byteLength} bytes, need at least ${SHARED_ANIMATION_BUFFER_BYTES}`
      )
    }
    this.sharedAnimationView = new Float64Array(buffer, 0, SHARED_ANIMATION_BUFFER_LENGTH)
    logWorker.debug('[AnimationWorker] Shared animation buffer set')

    // Initialize all sprite slots to inactive
    if (this.sharedAnimationView) {
      for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
        writeSpriteState(this.sharedAnimationView, actionNumber, 0, 0, false)
      }
    }
  }

  /**
   * Start movement for a sprite (MOVE command)
   */
  private handleStartMovement(
    actionNumber: number,
    definition: MoveDefinition,
    startX: number,
    startY: number
  ): void {
    logWorker.debug('[AnimationWorker] START_MOVEMENT:', { actionNumber, startX, startY, definition })

    // Calculate direction deltas
    const { deltaX, deltaY } = this.getDirectionDeltas(definition.direction)

    // Calculate speed: 60/C dots per second
    const speedDotsPerSecond = definition.speed === 0 ? 60 / 256 : 60 / definition.speed

    // Calculate total distance: 2×D dots
    const totalDistance = 2 * definition.distance

    const movementState: WorkerMovementState = {
      actionNumber,
      definition,
      x: startX,
      y: startY,
      remainingDistance: totalDistance,
      speedDotsPerSecond,
      directionDeltaX: deltaX,
      directionDeltaY: deltaY,
      isActive: true,
      currentFrameIndex: 0,
      frameCounter: 0,
    }

    this.movementStates.set(actionNumber, movementState)

    // Write initial position to shared buffer
    if (this.sharedAnimationView) {
      writeSpriteState(this.sharedAnimationView, actionNumber, startX, startY, true)
    }

    // Start tick loop if not already running
    if (!this.isRunning) {
      this.startTickLoop()
    }
  }

  /**
   * Stop movement for sprites (CUT command)
   */
  private handleStopMovement(actionNumbers: number[]): void {
    logWorker.debug('[AnimationWorker] STOP_MOVEMENT:', actionNumbers)

    for (const actionNumber of actionNumbers) {
      const movement = this.movementStates.get(actionNumber)
      if (movement) {
        movement.isActive = false
        // Write inactive state to shared buffer
        if (this.sharedAnimationView) {
          writeSpriteState(this.sharedAnimationView, actionNumber, movement.x, movement.y, false)
        }
      }
    }
  }

  /**
   * Erase movement for sprites (ERA command)
   */
  private handleEraseMovement(actionNumbers: number[]): void {
    logWorker.debug('[AnimationWorker] ERASE_MOVEMENT:', actionNumbers)

    for (const actionNumber of actionNumbers) {
      this.movementStates.delete(actionNumber)
      // Write inactive state to shared buffer
      if (this.sharedAnimationView) {
        writeSpriteState(this.sharedAnimationView, actionNumber, 0, 0, false)
      }
    }

    // Stop tick loop if no active movements
    if (this.movementStates.size === 0 || !Array.from(this.movementStates.values()).some(m => m.isActive)) {
      this.stopTickLoop()
    }
  }

  /**
   * Set sprite position (POSITION command)
   */
  private handleSetPosition(actionNumber: number, x: number, y: number): void {
    logWorker.debug('[AnimationWorker] SET_POSITION:', { actionNumber, x, y })

    const movement = this.movementStates.get(actionNumber)
    if (movement) {
      movement.x = x
      movement.y = y
    }

    // Write position to shared buffer
    if (this.sharedAnimationView) {
      const isActive = movement?.isActive ?? false
      writeSpriteState(this.sharedAnimationView, actionNumber, x, y, isActive)
    }
  }

  /**
   * Start the tick loop (60Hz fixed)
   */
  private startTickLoop(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.lastTickTime = performance.now()

    logWorker.debug('[AnimationWorker] Starting tick loop at 60Hz')

    // Use setInterval for fixed 60Hz tick rate
    this.tickInterval = self.setInterval(() => {
      const now = performance.now()
      const deltaTime = now - this.lastTickTime
      this.lastTickTime = now
      this.tick(deltaTime)
    }, FRAME_INTERVAL_MS)
  }

  /**
   * Stop the tick loop
   */
  private stopTickLoop(): void {
    if (!this.isRunning) return

    logWorker.debug('[AnimationWorker] Stopping tick loop')

    if (this.tickInterval !== null) {
      self.clearInterval(this.tickInterval)
      this.tickInterval = null
    }
    this.isRunning = false
  }

  /**
   * Single tick - update all active movements
   * This is the core animation loop
   */
  private tick(deltaTime: number): void {
    if (!this.sharedAnimationView) return

    // Cap deltaTime to prevent teleportation
    const cappedDeltaTime = Math.min(deltaTime, MAX_DELTA_TIME_MS)

    const completed: number[] = []

    for (const movement of this.movementStates.values()) {
      if (!movement.isActive || movement.remainingDistance <= 0) {
        if (movement.remainingDistance <= 0 && movement.isActive) {
          completed.push(movement.actionNumber)
        }
        movement.isActive = false
        // Write inactive state to shared buffer
        writeSpriteState(this.sharedAnimationView, movement.actionNumber, movement.x, movement.y, false)
        continue
      }

      // Calculate distance per frame
      const dotsPerFrame = movement.speedDotsPerSecond * (cappedDeltaTime / 1000)
      const distanceThisFrame = Math.min(dotsPerFrame, movement.remainingDistance)

      // Calculate new position
      movement.x += movement.directionDeltaX * distanceThisFrame
      movement.y += movement.directionDeltaY * distanceThisFrame
      movement.remainingDistance -= distanceThisFrame

      // Wrap at screen boundaries (real F-BASIC behavior)
      const w = SCREEN_DIMENSIONS.SPRITE.WIDTH
      const h = SCREEN_DIMENSIONS.SPRITE.HEIGHT
      movement.x = ((movement.x % w) + w) % w
      movement.y = ((movement.y % h) + h) % h

      // Update frame animation
      movement.frameCounter++
      const frameRate = 8 // Default frame rate
      if (movement.frameCounter >= frameRate) {
        movement.frameCounter = 0
        movement.currentFrameIndex++
      }

      // Write position to shared buffer (SINGLE WRITER)
      writeSpriteState(this.sharedAnimationView, movement.actionNumber, movement.x, movement.y, movement.isActive)

      // Check if movement is complete
      if (movement.remainingDistance <= 0) {
        completed.push(movement.actionNumber)
        movement.isActive = false
        writeSpriteState(this.sharedAnimationView, movement.actionNumber, movement.x, movement.y, false)
      }
    }

    // Stop tick loop if no active movements
    if (!Array.from(this.movementStates.values()).some(m => m.isActive)) {
      this.stopTickLoop()
    }
  }

  /**
   * Calculate direction deltas from direction code
   * Direction: 0=none, 1=up, 2=up-right, 3=right, 4=down-right,
   *            5=down, 6=down-left, 7=left, 8=up-left
   */
  private getDirectionDeltas(direction: number): { deltaX: number; deltaY: number } {
    switch (direction) {
      case 0:
        return { deltaX: 0, deltaY: 0 }
      case 1:
        return { deltaX: 0, deltaY: -1 }
      case 2:
        return { deltaX: 1, deltaY: -1 }
      case 3:
        return { deltaX: 1, deltaY: 0 }
      case 4:
        return { deltaX: 1, deltaY: 1 }
      case 5:
        return { deltaX: 0, deltaY: 1 }
      case 6:
        return { deltaX: -1, deltaY: 1 }
      case 7:
        return { deltaX: -1, deltaY: 0 }
      case 8:
        return { deltaX: -1, deltaY: -1 }
      default:
        return { deltaX: 0, deltaY: 0 }
    }
  }

  /**
   * Get all movement states (for debugging/inspection)
   */
  getAllMovementStates(): WorkerMovementState[] {
    return Array.from(this.movementStates.values())
  }

  /**
   * Reset all movement states
   */
  reset(): void {
    this.stopTickLoop()
    this.movementStates.clear()
    if (this.sharedAnimationView) {
      for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
        writeSpriteState(this.sharedAnimationView, actionNumber, 0, 0, false)
      }
    }
  }

  /**
   * Terminate the animation worker
   */
  terminate(): void {
    this.reset()
    this.sharedAnimationView = null
  }
}
