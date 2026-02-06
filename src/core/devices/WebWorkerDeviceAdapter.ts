/**
 * Web Worker Device Adapter
 *
 * A comprehensive device adapter that handles both device operations and web worker management.
 * Delegates to specialized modules for web worker management, screen state, and message handling.
 */

import { readSpritePosition } from '@/core/animation/sharedAnimationBuffer'
import {
  createViewsFromDisplayBuffer,
  incrementSequence,
  type SharedDisplayViews,
  writeScreenState,
} from '@/core/animation/sharedDisplayBuffer'
import type {
  AnimationCommand,
  AnyServiceWorkerMessage,
  BasicDeviceAdapter,
  ExecutionResult,
  InputValueMessage,
  InterpreterConfig,
  OutputMessage,
} from '@/core/interfaces'
import { parseMusic } from '@/core/sound/MusicDSLParser'
import { SoundStateManager } from '@/core/sound/SoundStateManager'
import { logWorker } from '@/shared/logger'

import { MessageHandler } from './MessageHandler'
import { ScreenStateManager } from './ScreenStateManager'
import {
  createViewsFromJoystickBuffer,
  getStickState,
  type JoystickBufferView,
} from './sharedJoystickBuffer'
import { type WebWorkerExecutionOptions, WebWorkerManager } from './WebWorkerManager'

export type { WebWorkerExecutionOptions }

export class WebWorkerDeviceAdapter implements BasicDeviceAdapter {
  // === DEVICE STATE ===
  private strigClickBuffer: Map<number, number[]> = new Map()
  private stickStates: Map<number, number> = new Map()
  /** Shared display buffer. Set when receiving SET_SHARED_ANIMATION_BUFFER. */
  private sharedDisplayViews: SharedDisplayViews | null = null
  /** Shared joystick buffer. Set when receiving SET_SHARED_JOYSTICK_BUFFER. */
  private sharedJoystickView: JoystickBufferView | null = null
  /** Last POSITION per sprite; getSpritePosition returns it so MOVE uses it (not buffer 0,0). */
  private lastPositionBySprite: Map<number, { x: number; y: number }> = new Map()
  private isEnabled = true

  // === MANAGERS ===
  private webWorkerManager: WebWorkerManager
  private screenStateManager: ScreenStateManager
  private messageHandler: MessageHandler
  private soundStateManager: SoundStateManager

  // === INPUT REQUEST (worker only: INPUT/LINPUT) ===
  private pendingInputRequests: Map<
    string,
    { resolve: (values: string[]) => void; reject: (err: Error) => void }
  > = new Map()

  // === SCREEN UPDATE BATCHING ===
  // FPS-based batching: batches screen updates to align with target frame rate
  private pendingScreenUpdate: boolean = false
  private screenUpdateTimeout: number | null = null
  private lastScreenUpdateTime: number = 0
  private readonly TARGET_FPS = 60 // Target frames per second
  private readonly FRAME_INTERVAL_MS = 1000 / 60 // ~16.67ms for 60 FPS
  private readonly MAX_BATCH_DELAY_MS = 33 // Maximum delay (2 frames) to prevent excessive lag

  constructor() {
    logWorker.debug('WebWorkerDeviceAdapter created')
    this.webWorkerManager = new WebWorkerManager()
    this.screenStateManager = new ScreenStateManager()
    this.soundStateManager = new SoundStateManager()
    this.messageHandler = new MessageHandler(this.webWorkerManager.getPendingMessages())
    this.setupMessageListener()
  }

  // === WEB WORKER MANAGEMENT METHODS ===

  /**
   * Check if web workers are supported
   */
  static isSupported(): boolean {
    return WebWorkerManager.isSupported()
  }

  /**
   * Check if we're currently running in a web worker context
   */
  static isInWebWorker(): boolean {
    return WebWorkerManager.isInWebWorker()
  }

  /**
   * Initialize the web worker
   */
  async initialize(workerScript?: string): Promise<void> {
    await this.webWorkerManager.initialize(workerScript)
    this.setupMessageListener()
  }

  /**
   * Execute BASIC code in the web worker
   */
  async executeInWorker(
    code: string,
    config: InterpreterConfig,
    options: WebWorkerExecutionOptions = {}
  ): Promise<ExecutionResult> {
    return this.webWorkerManager.executeInWorker(code, config, options, message => {
      this.handleWorkerMessage(message)
    })
  }

  /**
   * Stop execution in the web worker
   */
  stopExecution(): void {
    this.webWorkerManager.stopExecution()
  }

  /**
   * Send a STRIG event to the web worker
   */
  sendStrigEvent(joystickId: number, state: number): void {
    const worker = this.webWorkerManager.getWorker()
    if (!worker) {
      logWorker.debug('No worker available for STRIG event')
      return
    }

    const message = {
      type: 'STRIG_EVENT',
      id: `strig-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        joystickId,
        state,
        timestamp: Date.now(),
      },
    }

    logWorker.debug('Sending STRIG event to web worker:', {
      joystickId,
      state,
      messageId: message.id,
    })

    worker.postMessage(message)
  }

  /**
   * Send a message to the web worker
   */
  sendMessage(message: AnyServiceWorkerMessage): void {
    this.webWorkerManager.sendMessage(message)
  }

  /**
   * Terminate the web worker
   */
  terminate(): void {
    this.webWorkerManager.terminate()
    this.messageHandler.rejectAllPending('Web worker terminated')
  }

  // === DEVICE ADAPTER METHODS ===

  /**
   * Enable or disable the device adapter
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    logWorker.debug('Device adapter enabled:', enabled)
  }

  // === JOYSTICK INPUT METHODS ===

  getJoystickCount(): number {
    return 2
  }

  /**
   * Get stick state from shared joystick buffer (zero-copy read)
   * Falls back to Map if shared buffer is not set (backward compatibility)
   */
  getStickState(joystickId: number): number {
    if (this.sharedJoystickView) {
      return getStickState(this.sharedJoystickView, joystickId)
    }
    return this.stickStates.get(joystickId) ?? 0
  }

  /**
   * Set stick state (deprecated - main thread now writes directly to shared buffer)
   * Kept for backward compatibility during transition
   */
  setStickState(joystickId: number, state: number): void {
    this.stickStates.set(joystickId, state)
    logWorker.debug('Stick state set:', {
      joystickId,
      state,
    })
  }

  /**
   * Set shared joystick buffer (called from worker when receiving SET_SHARED_JOYSTICK_BUFFER)
   */
  setSharedJoystickBuffer(buffer: SharedArrayBuffer): void {
    this.sharedJoystickView = createViewsFromJoystickBuffer(buffer)
    logWorker.debug('[WebWorkerDeviceAdapter] Shared joystick buffer set')
  }

  pushStrigState(joystickId: number, state: number): void {
    if (!this.isEnabled) return

    logWorker.debug('pushStrigState called:', {
      joystickId,
      state,
    })

    if (state > 0) {
      if (!this.strigClickBuffer.has(joystickId)) {
        this.strigClickBuffer.set(joystickId, [])
      }
      const buffer = this.strigClickBuffer.get(joystickId)!
      buffer.push(state)
      logWorker.debug('STRIG pulse buffered:', {
        joystickId,
        state,
        bufferSize: buffer.length,
      })
    }
  }

  // === SPRITE POSITION QUERY ===

  /**
   * Set shared display buffer (called from worker when receiving SET_SHARED_ANIMATION_BUFFER).
   * Creates views for sprites, screen cells, cursor, sequence, and scalars.
   */
  setSharedAnimationBuffer(buffer: SharedArrayBuffer): void {
    this.sharedDisplayViews = createViewsFromDisplayBuffer(buffer)
  }

  getSpritePosition(actionNumber: number): { x: number; y: number } | null {
    // Explicit POSITION command takes precedence (including POSITION 0,0)
    if (this.lastPositionBySprite.has(actionNumber)) {
      return this.lastPositionBySprite.get(actionNumber) ?? null
    }
    // Shared buffer (main thread writes positions each frame) so XPOS/YPOS see live position
    if (this.sharedDisplayViews) {
      const pos = readSpritePosition(this.sharedDisplayViews.spriteView, actionNumber)
      // Buffer (0,0) is uninitialized: treat as no position so MOVE uses default center (like DEF SPRITE)
      if (pos !== null && (pos.x !== 0 || pos.y !== 0)) return pos
    }
    return null
  }

  setSpritePosition(actionNumber: number, x: number, y: number): void {
    this.lastPositionBySprite.set(actionNumber, { x, y })
  }

  clearSpritePosition(actionNumber: number): void {
    this.lastPositionBySprite.delete(actionNumber)
  }

  /** Clear all stored POSITION values (e.g. when IDE Clear is clicked so next Run uses default center). */
  clearAllSpritePositions(): void {
    this.lastPositionBySprite.clear()
  }

  /**
   * Write current screen state from ScreenStateManager to shared buffer and increment sequence.
   * Caller must then postMessage(SCREEN_CHANGED).
   */
  private syncScreenStateToShared(): void {
    if (!this.sharedDisplayViews) return
    const manager = this.screenStateManager
    if (!manager) return
    const buffer = manager.getScreenBuffer()
    if (buffer == null) {
      logWorker.warn('[WebWorkerDeviceAdapter] syncScreenStateToShared: getScreenBuffer() returned null/undefined, skipping')
      return
    }
    const { x: cursorX, y: cursorY } = manager.getCursorPosition()
    const { bgPalette, spritePalette } = manager.getPalette()
    writeScreenState(
      this.sharedDisplayViews,
      buffer,
      cursorX,
      cursorY,
      bgPalette,
      spritePalette,
      manager.getBackdropColor(),
      manager.getCgenMode()
    )
    incrementSequence(this.sharedDisplayViews)
  }

  private postScreenChanged(): void {
    self.postMessage({
      type: 'SCREEN_CHANGED',
      id: `screen-changed-${Date.now()}`,
      timestamp: Date.now(),
    })
  }

  consumeStrigState(joystickId: number): number {
    const buffer = this.strigClickBuffer.get(joystickId)
    if (!buffer || buffer.length === 0) {
      return 0
    }

    const clickValue = buffer.shift()!
    logWorker.debug(
      `consumeStrigState: consumed STRIG event for joystick ${joystickId}, value=${clickValue}, remaining=${buffer.length}`
    )
    return clickValue
  }

  // === TEXT OUTPUT METHODS ===

  printOutput(output: string): void {
    logWorker.debug('Print output:', output)

    // Send to STDOUT (original textarea output)
    self.postMessage({
      type: 'OUTPUT',
      id: `output-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.screenStateManager.getCurrentExecutionId() ?? 'unknown',
        output: output,
        outputType: 'print',
        timestamp: Date.now(),
      },
    }, '*')

    // Process all characters and update screen buffer
    for (const char of output) {
      this.screenStateManager.writeCharacter(char)
    }

    // Batch screen updates to avoid sending too many messages
    // This significantly reduces Vue reactivity overhead on the receiving side
    this.scheduleScreenUpdate()
  }

  debugOutput(output: string): void {
    logWorker.debug('Debug output:', output)
    // Send debug output to main thread
    self.postMessage({
      type: 'OUTPUT',
      id: `debug-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.screenStateManager.getCurrentExecutionId() ?? 'unknown',
        output: output,
        outputType: 'debug',
        timestamp: Date.now(),
      },
    }, '*')
  }

  errorOutput(output: string): void {
    logWorker.error('Error output:', output)
    // Send error output to main thread
    self.postMessage({
      type: 'OUTPUT',
      id: `error-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.screenStateManager.getCurrentExecutionId() ?? 'unknown',
        output: output,
        outputType: 'error',
        timestamp: Date.now(),
      },
    }, '*')
  }

  clearScreen(): void {
    logWorker.debug('Clear screen')
    this.screenStateManager.initializeScreen()
    if (this.sharedDisplayViews) {
      this.syncScreenStateToShared()
      this.postScreenChanged()
    } else {
      self.postMessage(this.screenStateManager.createClearScreenUpdateMessage())
    }
    this.cancelPendingScreenUpdate()
  }

  setCursorPosition(x: number, y: number): void {
    logWorker.debug('Set cursor position:', { x, y })
    this.screenStateManager.setCursorPosition(x, y)
    if (this.sharedDisplayViews) {
      this.syncScreenStateToShared()
      this.postScreenChanged()
    } else {
      self.postMessage(this.screenStateManager.createCursorUpdateMessage())
    }
  }

  setColorPattern(x: number, y: number, pattern: number): void {
    logWorker.debug('Set color pattern:', { x, y, pattern })
    const cellsToUpdate = this.screenStateManager.setColorPattern(x, y, pattern)
    if (this.sharedDisplayViews) {
      this.syncScreenStateToShared()
      this.postScreenChanged()
    } else {
      self.postMessage(this.screenStateManager.createColorUpdateMessage(cellsToUpdate))
    }
  }

  setColorPalette(bgPalette: number, spritePalette: number): void {
    logWorker.debug('Set color palette:', {
      bgPalette,
      spritePalette,
    })
    this.screenStateManager.setColorPalette(bgPalette, spritePalette)
    if (this.sharedDisplayViews) {
      this.syncScreenStateToShared()
      this.postScreenChanged()
    } else {
      self.postMessage(this.screenStateManager.createPaletteUpdateMessage())
    }
  }

  setBackdropColor(colorCode: number): void {
    logWorker.debug('Set backdrop color:', colorCode)
    this.screenStateManager.setBackdropColor(colorCode)
    if (this.sharedDisplayViews) {
      this.syncScreenStateToShared()
      this.postScreenChanged()
    } else {
      self.postMessage(this.screenStateManager.createBackdropUpdateMessage())
    }
  }

  setCharacterGeneratorMode(mode: number): void {
    logWorker.debug('Set character generator mode:', mode)
    this.screenStateManager.setCharacterGeneratorMode(mode)
    if (this.sharedDisplayViews) {
      this.syncScreenStateToShared()
      this.postScreenChanged()
    } else {
      self.postMessage(this.screenStateManager.createCgenUpdateMessage())
    }
  }

  /**
   * Send animation command to main thread immediately
   * This allows movements to start as soon as MOVE is called
   */
  sendAnimationCommand(command: AnimationCommand): void {
    logWorker.debug('Sending animation command:', command.type, command)

    const message: AnyServiceWorkerMessage = {
      type: 'ANIMATION_COMMAND',
      id: `anim-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      data: command,
    }

    self.postMessage(message)
  }

  /**
   * Send animation worker command via main thread
   * Main thread forwards this to the Animation Worker
   */
  sendAnimationWorkerCommand(command: AnimationCommand): void {
    logWorker.debug('Forwarding animation worker command:', command.type, command)

    const message: AnyServiceWorkerMessage = {
      type: 'FORWARD_TO_ANIMATION_WORKER',
      id: `anim-worker-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      data: { command },
    }

    self.postMessage(message)
  }

  /**
   * Request user input (INPUT/LINPUT). Used in worker; posts REQUEST_INPUT to main and waits for INPUT_VALUE.
   */
  requestInput(
    prompt: string,
    options?: { variableCount?: number; isLinput?: boolean }
  ): Promise<string[]> {
    const variableCount = options?.variableCount ?? 1
    const isLinput = options?.isLinput ?? false
    const requestId = `input-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const executionId = this.screenStateManager.getCurrentExecutionId() ?? 'unknown'

    const promise = new Promise<string[]>((resolve, reject) => {
      this.pendingInputRequests.set(requestId, { resolve, reject })
    })

    self.postMessage({
      type: 'REQUEST_INPUT',
      id: requestId,
      timestamp: Date.now(),
      data: {
        requestId,
        executionId,
        prompt,
        variableCount,
        isLinput,
      },
    }, '*')

    return promise
  }

  /**
   * Resolve or reject a pending input request (called from WebWorkerInterpreter when INPUT_VALUE is received).
   */
  handleInputValueMessage(message: InputValueMessage): void {
    const { requestId, values, cancelled } = message.data
    const pending = this.pendingInputRequests.get(requestId)
    this.pendingInputRequests.delete(requestId)
    if (!pending) return
    if (cancelled) {
      pending.reject(new Error('Input cancelled'))
    } else {
      pending.resolve(values)
    }
  }

  /**
   * Reject all pending input requests (e.g. when STOP is received).
   */
  rejectAllInputRequests(reason: string = 'Execution stopped'): void {
    for (const [, pending] of this.pendingInputRequests) {
      pending.reject(new Error(reason))
    }
    this.pendingInputRequests.clear()
  }

  /**
   * Set the current execution ID (called by WebWorkerInterpreter)
   */
  setCurrentExecutionId(executionId: string | null): void {
    this.screenStateManager.setCurrentExecutionId(executionId)
    if (executionId) {
      this.screenStateManager.initializeScreen()
      if (this.sharedDisplayViews) {
        this.syncScreenStateToShared()
        this.postScreenChanged()
      } else {
        self.postMessage(this.screenStateManager.createClearScreenUpdateMessage())
      }
      this.cancelPendingScreenUpdate()
    } else {
      this.flushScreenUpdate()
    }
  }

  /**
   * Play sound using F-BASIC PLAY music DSL
   * Parses the music string into Note[] and posts PLAY_SOUND message to main thread
   */
  playSound(musicString: string): void {
    logWorker.debug('Playing sound:', musicString)

    try {
      // Parse music string using DSL parser
      const musicCommand = parseMusic(musicString, this.soundStateManager)

      // Flatten all channels into a single event array for transmission
      const events = musicCommand.channels.flatMap(channelEvents => channelEvents)

      // Convert events to serializable format
      const serializedEvents = events.map(event => ({
        frequency: 'frequency' in event ? event.frequency : undefined,
        duration: event.duration,
        channel: event.channel,
        duty: 'duty' in event ? event.duty : 0,
        envelope: 'envelope' in event ? event.envelope : 0,
        volumeOrLength: 'volumeOrLength' in event ? event.volumeOrLength : 0,
      }))

      // Post PLAY_SOUND message to main thread
      self.postMessage({
        type: 'PLAY_SOUND',
        id: `play-sound-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.screenStateManager.getCurrentExecutionId() ?? 'unknown',
          musicString,
          events: serializedEvents,
        },
      }, '*')
    } catch (error) {
      logWorker.error('Error parsing music string:', error)
      this.errorOutput(`PLAY error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // === PRIVATE METHODS ===

  /**
   * Set up message listener for web worker responses
   */
  private setupMessageListener(): void {
    if (typeof window === 'undefined') return // Not in main thread

    const worker = this.webWorkerManager.getWorker()
    if (worker) {
      worker.onmessage = event => {
        logWorker.debug('Main thread received message from worker:', {
          type: event.data.type,
          id: event.data.id,
          timestamp: event.data.timestamp,
          dataSize: JSON.stringify(event.data).length,
        })
        const message = event.data as AnyServiceWorkerMessage
        this.handleWorkerMessage(message)
      }
    }
  }

  /**
   * Handle messages from the web worker
   */
  private handleWorkerMessage(message: AnyServiceWorkerMessage): void {
    this.messageHandler.handleWorkerMessage(message, outputMessage => {
      this.handleOutputMessage(outputMessage)
    })
  }

  /**
   * Handle OUTPUT messages from the web worker
   */
  private handleOutputMessage(message: OutputMessage): void {
    logWorker.debug('Handling OUTPUT message:', {
      outputType: message.data.outputType,
      outputLength: message.data.output.length,
    })

    // Output is now handled by the device adapter in the web worker
    // No need to forward to main thread callbacks
  }

  /**
   * Schedule a batched screen update with FPS-based timing
   * This batches multiple screen updates together to align with target frame rate
   * and reduce message volume and Vue reactivity overhead on the receiving side
   * 
   * Strategy:
   * - Calculate time since last update
   * - If enough time has passed (>= frame interval), send immediately
   * - Otherwise, schedule for the next frame boundary
   * - This ensures updates are sent at consistent FPS intervals
   */
  private scheduleScreenUpdate(): void {
    // Mark that we have a pending update
    this.pendingScreenUpdate = true

    // If there's already a scheduled update, don't schedule another one
    // The existing scheduled update will pick up this pending change
    if (this.screenUpdateTimeout !== null) {
      return
    }

    const now = performance.now()
    const timeSinceLastUpdate = now - this.lastScreenUpdateTime

    // If enough time has passed since last update, send immediately
    // This ensures we don't delay unnecessarily when updates are sparse
    if (timeSinceLastUpdate >= this.FRAME_INTERVAL_MS) {
      // Send immediately - we're already past the frame boundary
      this.flushScreenUpdate()
      return
    }

    // Calculate delay to next frame boundary
    // This aligns updates with FPS intervals for smoother rendering
    const delayUntilNextFrame = this.FRAME_INTERVAL_MS - timeSinceLastUpdate
    
    // Cap the delay to prevent excessive lag (max 2 frames)
    const delay = Math.min(delayUntilNextFrame, this.MAX_BATCH_DELAY_MS)

    // Schedule the update to be sent at the next frame boundary
    // This batches multiple rapid updates together while maintaining FPS alignment
    this.screenUpdateTimeout = self.setTimeout(() => {
      this.flushScreenUpdate()
    }, delay)
  }

  /**
   * Cancel any pending screen update (used by flush paths and by tests to avoid timeouts firing after teardown).
   */
  cancelPendingScreenUpdate(): void {
    if (this.screenUpdateTimeout !== null) {
      self.clearTimeout(this.screenUpdateTimeout)
      this.screenUpdateTimeout = null
    }
    this.pendingScreenUpdate = false
  }

  /**
   * Flush the pending screen update immediately.
   * With shared buffer: writes to shared buffer, increments sequence, sends SCREEN_CHANGED.
   * Without (e.g. tests): sends SCREEN_UPDATE full.
   */
  private flushScreenUpdate(): void {
    this.screenUpdateTimeout = null
    if (!this.pendingScreenUpdate) {
      return
    }
    this.pendingScreenUpdate = false
    this.lastScreenUpdateTime = performance.now()
    if (this.sharedDisplayViews) {
      this.syncScreenStateToShared()
      this.postScreenChanged()
    } else if (this.screenStateManager) {
      // In test environment (jsdom), postMessage requires targetOrigin
      self.postMessage(this.screenStateManager.createFullScreenUpdateMessage())
    }
  }
}
