/**
 * Web Worker Device Adapter
 *
 * A comprehensive device adapter that handles both device operations and web worker management.
 * Delegates to specialized modules for web worker management, screen state, and message handling.
 */

import type { SharedDisplayBufferAccessor } from '@/core/animation/sharedDisplayBufferAccessor'
import type {
  AnyServiceWorkerMessage,
  BasicDeviceAdapter,
  ExecutionResult,
  InputValueMessage,
  InterpreterConfig,
  OutputMessage,
} from '@/core/interfaces'
import { parseMusic } from '@/core/sound/MusicDSLParser'
import { SoundStateManager } from '@/core/sound/SoundStateManager'
import type { BgGridData } from '@/features/bg-editor/types'
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
  /** Shared display buffer accessor for buffer operations. */
  private sharedDisplayAccessor: SharedDisplayBufferAccessor | null = null
  /** Shared joystick buffer view. Set when receiving SET_SHARED_JOYSTICK_BUFFER. */
  private sharedJoystickView: JoystickBufferView | null = null
  /** Last POSITION per sprite; getSpritePosition returns it so MOVE uses it (not buffer 0,0). */
  private lastPositionBySprite: Map<number, { x: number; y: number }> = new Map()
  private isEnabled = true
  /** BG GRAPHIC data for VIEW command. Set via SET_BG_DATA message from main thread. */
  private bgGridData: BgGridData | null = null

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
   * @throws Error if shared joystick buffer is not set
   */
  getStickState(joystickId: number): number {
    if (!this.sharedJoystickView) {
      throw new Error(
        'Shared joystick buffer not set. Worker must receive SET_SHARED_JOYSTICK_BUFFER message before reading joystick state.'
      )
    }
    return getStickState(this.sharedJoystickView, joystickId)
  }

  /**
   * Set stick state (deprecated - main thread now writes directly to shared buffer)
   * @throws Error - this method is deprecated and should not be used
   */
  setStickState(_joystickId: number, _state: number): void {
    throw new Error(
      'setStickState() is deprecated. Main thread writes directly to shared joystick buffer. This method is no longer supported.'
    )
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

    if (state > 0) {
      if (!this.strigClickBuffer.has(joystickId)) {
        this.strigClickBuffer.set(joystickId, [])
      }
      const buffer = this.strigClickBuffer.get(joystickId)!
      buffer.push(state)
    }
  }

  // === SPRITE POSITION QUERY ===

  /**
   * Set shared display buffer accessor (called from worker when receiving SET_SHARED_ANIMATION_BUFFER).
   */
  setSharedDisplayBufferAccessor(accessor: SharedDisplayBufferAccessor): void {
    this.sharedDisplayAccessor = accessor
  }

  getSpritePosition(actionNumber: number): { x: number; y: number } | null {
    // First, sync from shared buffer if available (main thread writes live animation positions each frame)
    if (this.sharedDisplayAccessor) {
      const livePos = this.sharedDisplayAccessor.readSpritePosition(actionNumber)
      // Buffer (0,0) means uninitialized or off-screen - don't cache it
      if (livePos !== null && (livePos.x !== 0 || livePos.y !== 0)) {
        // Update cache with live position so XPOS/YPOS see animated movement
        this.lastPositionBySprite.set(actionNumber, livePos)
        return livePos
      }
    }
    // Fall back to cached explicit POSITION command (or null if never positioned)
    return this.lastPositionBySprite.get(actionNumber) ?? null
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

  // === BG GRAPHIC METHODS (VIEW command) ===

  /**
   * Set BG grid data for VIEW command.
   * Called from WebWorkerInterpreter when receiving SET_BG_DATA message.
   */
  setBgGridData(data: BgGridData): void {
    this.bgGridData = data
    logWorker.debug('[WebWorkerDeviceAdapter] BG grid data set, rows:', data.length)
  }

  /**
   * Copy BG GRAPHIC to Background Screen.
   * Per F-BASIC Manual page 36: "Upon executing the VIEW command,
   * the BG GRAPHIC Screen will be copied to the Background Screen."
   *
   * This method writes the stored BG grid data directly to the screen buffer.
   * The BG grid covers rows 3-23 (21 rows, leaving top 3 rows for system use).
   */
  copyBgGraphicToBackground(): void {
    if (!this.bgGridData) {
      logWorker.warn('[WebWorkerDeviceAdapter] VIEW: No BG grid data available')
      return
    }

    logWorker.debug('[WebWorkerDeviceAdapter] VIEW: Copying BG GRAPHIC to Background Screen')

    // Get the screen buffer from the state manager
    const screenBuffer = this.screenStateManager.getScreenBuffer()

    // Copy BG data to screen buffer
    // BG grid has 21 rows (rows 0-20 in grid), which map to screen rows 3-23
    // BG grid has 28 columns, same as screen width
    for (let gridRow = 0; gridRow < this.bgGridData.length; gridRow++) {
      const bgRow = this.bgGridData[gridRow]
      if (!bgRow) continue

      // Screen rows start at 3 (top 3 rows are system area)
      const screenRow = gridRow + 3
      if (screenRow >= 24) break // Don't exceed screen height

      for (let col = 0; col < bgRow.length && col < 28; col++) {
        const bgCell = bgRow[col]
        if (!bgCell) continue

        const screenCell = screenBuffer[screenRow]?.[col]
        if (screenCell) {
          // Convert character code to character
          // In F-BASIC, character codes 0-255 map to CHR$ values
          screenCell.character = String.fromCharCode(bgCell.charCode)
          screenCell.colorPattern = bgCell.colorPattern
        }
      }
    }

    // Sync to shared buffer and notify main thread
    this.syncScreenStateToShared()
    this.postScreenChanged()

    logWorker.debug('[WebWorkerDeviceAdapter] VIEW: BG GRAPHIC copied successfully')
  }

  /**
   * Write current screen state from ScreenStateManager to shared buffer and increment sequence.
   * Caller must then postMessage(SCREEN_CHANGED).
   */
  private syncScreenStateToShared(): void {
    const accessor = this.sharedDisplayAccessor
    if (!accessor) return
    const manager = this.screenStateManager
    if (!manager) return
    const buffer = manager.getScreenBuffer()
    if (buffer == null) {
      logWorker.warn('[WebWorkerDeviceAdapter] syncScreenStateToShared: getScreenBuffer() returned null/undefined, skipping')
      return
    }
    const { x: cursorX, y: cursorY } = manager.getCursorPosition()
    const { bgPalette, spritePalette } = manager.getPalette()
    accessor.writeScreenState(
      buffer,
      cursorX,
      cursorY,
      bgPalette,
      spritePalette,
      manager.getBackdropColor(),
      manager.getCgenMode()
    )
    accessor.incrementSequence()
  }

  private postScreenChanged(): void {
    // In web worker context, postMessage takes (message, transfer[]) not targetOrigin
    // The '*' parameter is only valid for window.postMessage() in main thread
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
    })

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
    })
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
    })
  }

  clearScreen(): void {
    logWorker.debug('Clear screen')
    this.screenStateManager.initializeScreen()
    this.syncScreenStateToShared()
    this.postScreenChanged()
    this.cancelPendingScreenUpdate()
  }

  setCursorPosition(x: number, y: number): void {
    logWorker.debug('Set cursor position:', { x, y })
    this.screenStateManager.setCursorPosition(x, y)
    this.syncScreenStateToShared()
    this.postScreenChanged()
  }

  setColorPattern(x: number, y: number, pattern: number): void {
    logWorker.debug('Set color pattern:', { x, y, pattern })
    this.screenStateManager.setColorPattern(x, y, pattern)
    this.syncScreenStateToShared()
    this.postScreenChanged()
  }

  setColorPalette(bgPalette: number, spritePalette: number): void {
    logWorker.debug('Set color palette:', {
      bgPalette,
      spritePalette,
    })
    this.screenStateManager.setColorPalette(bgPalette, spritePalette)
    this.syncScreenStateToShared()
    this.postScreenChanged()
  }

  setBackdropColor(colorCode: number): void {
    logWorker.debug('Set backdrop color:', colorCode)
    this.screenStateManager.setBackdropColor(colorCode)
    this.syncScreenStateToShared()
    this.postScreenChanged()
  }

  setCharacterGeneratorMode(mode: number): void {
    logWorker.debug('Set character generator mode:', mode)
    this.screenStateManager.setCharacterGeneratorMode(mode)
    this.syncScreenStateToShared()
    this.postScreenChanged()
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
    })

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
      this.syncScreenStateToShared()
      this.postScreenChanged()
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
      })
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
    this.syncScreenStateToShared()
    this.postScreenChanged()
  }
}
