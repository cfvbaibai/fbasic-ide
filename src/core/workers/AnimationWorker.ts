/**
 * Animation Worker - Manages sprite state (positions, movement, physics) as the SINGLE WRITER
 * to the shared animation buffer. Main thread becomes read-only for rendering.
 *
 * NEW: Supports direct synchronization from Executor Worker via shared buffer sync section.
 * Polls for commands in sync section and writes acknowledgment when complete.
 *
 * Responsibilities:
 * - Poll sync section for commands from Executor Worker (direct, no message passing)
 * - Calculate sprite positions (x += dx * speed * dt)
 * - Handle screen wrapping (modulo 256×240)
 * - Manage movement lifecycle (isActive, remainingDistance)
 * - Write positions to shared buffer (ONLY writer)
 * - Write acknowledgment when command is processed
 * - Run at fixed 60Hz tick rate
 */

import {
  MAX_SPRITES,
  notifyAck,
  readSyncCommand,
  SHARED_ANIMATION_BUFFER_BYTES,
  SyncCommandType,
  writeSpriteState,
} from '@/core/animation/sharedAnimationBuffer'
import { SHARED_DISPLAY_BUFFER_BYTES } from '@/core/animation/sharedDisplayBuffer'
import { SCREEN_DIMENSIONS } from '@/core/constants'
import type { MoveDefinition } from '@/core/sprite/types'
import { logWorker } from '@/shared/logger'

/**
 * Animation Worker command types (Main Thread → Animation Worker via message)
 * Note: Direct sync from Executor Worker uses shared buffer instead of message passing.
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
 * with direct synchronization from Executor Worker.
 */
export class AnimationWorker {
  private movementStates: Map<number, WorkerMovementState> = new Map()
  private sharedAnimationView: Float64Array | null = null
  private sharedSyncView: Int32Array | null = null
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
    logWorker.debug('[AnimationWorker] Received command:', command.type)
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
   * Extracts both Float64Array view (sprite data) and Int32Array view (sync section).
   * Supports both standalone animation buffer (264 bytes) and combined display buffer (1620 bytes).
   */
  private handleSetSharedBuffer(buffer: SharedArrayBuffer): void {
    console.log('[AnimationWorker] handleSetSharedBuffer called, byteLength =', buffer.byteLength)
    const MIN_BUFFER_BYTES = SHARED_ANIMATION_BUFFER_BYTES
    if (buffer.byteLength < MIN_BUFFER_BYTES) {
      throw new RangeError(
        `Shared animation buffer too small: ${buffer.byteLength} bytes, need at least ${MIN_BUFFER_BYTES}`
      )
    }

    // Sprite data is always at the beginning (24 floats for 8 sprites)
    this.sharedAnimationView = new Float64Array(buffer, 0, MAX_SPRITES * 3)

    // Extract Int32Array sync view from the sync section
    // The sync section can be at different offsets depending on buffer layout:
    // - Standalone animation buffer (264 bytes): sync at byte 192 (float 24)
    // - Combined display buffer (1624 bytes): sync at byte 1552 (with padding for alignment)
    const syncSectionFloats = 9 // command type, action number, params (6), ack

    let syncSectionByteOffset: number
    if (buffer.byteLength === SHARED_ANIMATION_BUFFER_BYTES) {
      // Standalone animation buffer: sync section at byte 192 (float 24)
      syncSectionByteOffset = 24 * 8
    } else if (buffer.byteLength === SHARED_DISPLAY_BUFFER_BYTES) {
      // Combined display buffer: sync section at byte 1552
      syncSectionByteOffset = 1552
    } else {
      // Unknown buffer type, try standalone layout
      syncSectionByteOffset = 24 * 8
      logWorker.warn('[AnimationWorker] Unknown buffer size:', buffer.byteLength, 'trying standalone layout')
    }

    // Create Int32Array view of sync section
    this.sharedSyncView = new Int32Array(buffer, syncSectionByteOffset, syncSectionFloats * 2)
    logWorker.debug('[AnimationWorker] Direct sync enabled (sync section at byte', syncSectionByteOffset, ')')

    logWorker.debug('[AnimationWorker] Shared animation buffer set, byteLength =', buffer.byteLength)

    // Initialize all sprite slots to inactive
    if (this.sharedAnimationView) {
      for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
        writeSpriteState(this.sharedAnimationView, actionNumber, 0, 0, false)
      }
    }

    // Start tick loop to poll for sync commands from Executor Worker
    // This needs to run even when no movements are active, to handle SET_POSITION and other commands
    if (!this.isRunning) {
      this.startTickLoop()
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

    // Only stop tick loop if NOT using direct sync and no active movements
    if (
      !this.sharedSyncView &&
      (this.movementStates.size === 0 || !Array.from(this.movementStates.values()).some(m => m.isActive))
    ) {
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
   * Poll sync section for commands from Executor Worker (direct communication).
   * Processes any pending command and writes acknowledgment when complete.
   */
  private pollSyncCommands(): void {
    if (!this.sharedAnimationView || !this.sharedSyncView) return

    const command = readSyncCommand(this.sharedAnimationView)
    if (!command) return // No pending command

    logWorker.debug('[AnimationWorker] Sync command from buffer:', command.commandType, command.actionNumber)

    try {
      switch (command.commandType) {
        case SyncCommandType.NONE:
          // Should not happen as readSyncCommand returns null for NONE
          break
        case SyncCommandType.START_MOVEMENT:
          this.handleStartMovementFromSync(command.actionNumber, command.params)
          break
        case SyncCommandType.STOP_MOVEMENT:
          this.handleStopMovementFromSync(command.actionNumber)
          break
        case SyncCommandType.ERASE_MOVEMENT:
          this.handleEraseMovementFromSync(command.actionNumber)
          break
        case SyncCommandType.SET_POSITION:
          this.handleSetPositionFromSync(command.actionNumber, command.params.startX, command.params.startY)
          break
      }

      // Write acknowledgment
      if (this.sharedSyncView) {
        notifyAck(this.sharedSyncView)
      }
    } catch (error) {
      logWorker.error('[AnimationWorker] Error processing sync command:', error)
      // Still write ack to prevent Executor Worker from hanging
      if (this.sharedSyncView) {
        notifyAck(this.sharedSyncView)
      }
    }
  }

  /**
   * Handle START_MOVEMENT from sync buffer.
   */
  private handleStartMovementFromSync(
    actionNumber: number,
    params: {
      startX: number
      startY: number
      direction: number
      speed: number
      distance: number
      priority: number
    }
  ): void {
    logWorker.debug('[AnimationWorker] START_MOVEMENT from sync:', { actionNumber, params })

    const { deltaX, deltaY } = this.getDirectionDeltas(params.direction)
    const speedDotsPerSecond = params.speed === 0 ? 60 / 256 : 60 / params.speed
    const totalDistance = 2 * params.distance

    const definition: MoveDefinition = {
      actionNumber,
      characterType: 0, // Will be set by DEF MOVE
      direction: params.direction,
      speed: params.speed,
      distance: params.distance,
      priority: params.priority as 0 | 1,
      colorCombination: 0, // Default
    }

    const movementState: WorkerMovementState = {
      actionNumber,
      definition,
      x: params.startX,
      y: params.startY,
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
      writeSpriteState(this.sharedAnimationView, actionNumber, params.startX, params.startY, true)
    }

    // Start tick loop if not already running
    if (!this.isRunning) {
      this.startTickLoop()
    }
  }

  /**
   * Handle STOP_MOVEMENT from sync buffer.
   */
  private handleStopMovementFromSync(actionNumber: number): void {
    logWorker.debug('[AnimationWorker] STOP_MOVEMENT from sync:', actionNumber)

    const movement = this.movementStates.get(actionNumber)
    if (movement) {
      movement.isActive = false
      // Write inactive state to shared buffer
      if (this.sharedAnimationView) {
        writeSpriteState(this.sharedAnimationView, actionNumber, movement.x, movement.y, false)
      }
    }
  }

  /**
   * Handle ERASE_MOVEMENT from sync buffer.
   */
  private handleEraseMovementFromSync(actionNumber: number): void {
    logWorker.debug('[AnimationWorker] ERASE_MOVEMENT from sync:', actionNumber)

    this.movementStates.delete(actionNumber)
    // Write inactive state to shared buffer
    if (this.sharedAnimationView) {
      writeSpriteState(this.sharedAnimationView, actionNumber, 0, 0, false)
    }

    // Only stop tick loop if NOT using direct sync and no active movements
    if (
      !this.sharedSyncView &&
      (this.movementStates.size === 0 || !Array.from(this.movementStates.values()).some(m => m.isActive))
    ) {
      this.stopTickLoop()
    }
  }

  /**
   * Handle SET_POSITION from sync buffer.
   */
  private handleSetPositionFromSync(actionNumber: number, x: number, y: number): void {
    logWorker.debug('[AnimationWorker] SET_POSITION from sync:', { actionNumber, x, y })

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

    console.log('[AnimationWorker] Starting tick loop at 60Hz')

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

    // Poll for sync commands from Executor Worker (direct communication)
    if (this.sharedSyncView) {
      this.pollSyncCommands()
    }

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

    // Only stop tick loop if NOT using direct sync
    // When using direct sync, the loop must keep running to poll for commands (SET_POSITION, etc.)
    if (!this.sharedSyncView && !Array.from(this.movementStates.values()).some(m => m.isActive)) {
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
    // Restart tick loop if using direct sync, to keep polling for commands
    if (this.sharedSyncView && !this.isRunning) {
      this.startTickLoop()
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
