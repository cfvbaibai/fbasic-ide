/**
 * Web Worker Device Adapter
 * 
 * A comprehensive device adapter that handles both device operations and web worker management.
 * Delegates to specialized modules for web worker management, screen state, and message handling.
 */

import type { 
  BasicDeviceAdapter,
  InterpreterConfig, 
  ExecutionResult,
  AnyServiceWorkerMessage,
  OutputMessage
} from '../interfaces'
import { WebWorkerManager, type WebWorkerExecutionOptions } from './WebWorkerManager'
import { ScreenStateManager } from './ScreenStateManager'
import { MessageHandler } from './MessageHandler'

export type { WebWorkerExecutionOptions }

export class WebWorkerDeviceAdapter implements BasicDeviceAdapter {
  // === DEVICE STATE ===
  private strigClickBuffer: Map<number, number[]> = new Map()
  private stickStates: Map<number, number> = new Map()
  private isEnabled = true
  
  // === MANAGERS ===
  private webWorkerManager: WebWorkerManager
  private screenStateManager: ScreenStateManager
  private messageHandler: MessageHandler

  constructor() {
    console.log('🔌 [WEB_WORKER_DEVICE] WebWorkerDeviceAdapter created')
    this.webWorkerManager = new WebWorkerManager()
    this.screenStateManager = new ScreenStateManager()
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
    return this.webWorkerManager.executeInWorker(code, config, options, (message) => {
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
      console.log('🔌 [WEB_WORKER] No worker available for STRIG event')
      return
    }

    const message = {
      type: 'STRIG_EVENT',
      id: `strig-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        joystickId,
        state,
        timestamp: Date.now()
      }
    }
    
    console.log('🔌 [WEB_WORKER] Sending STRIG event to web worker:', {
      joystickId,
      state,
      messageId: message.id
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
    console.log('🔌 [WEB_WORKER_DEVICE] Device adapter enabled:', enabled)
  }

  // === JOYSTICK INPUT METHODS ===

  getJoystickCount(): number {
    return 2
  }

  getStickState(joystickId: number): number {
    return this.stickStates.get(joystickId) || 0
  }

  setStickState(joystickId: number, state: number): void {
    this.stickStates.set(joystickId, state)
    console.log('🔌 [WEB_WORKER_DEVICE] Stick state set:', { joystickId, state })
  }

  pushStrigState(joystickId: number, state: number): void {
    if (!this.isEnabled) return

    console.log('🔌 [WEB_WORKER_DEVICE] pushStrigState called:', { joystickId, state })

    if (state > 0) {
      if (!this.strigClickBuffer.has(joystickId)) {
        this.strigClickBuffer.set(joystickId, [])
      }
      const buffer = this.strigClickBuffer.get(joystickId)!
      buffer.push(state)
      console.log('🔌 [WEB_WORKER_DEVICE] STRIG pulse buffered:', {
        joystickId,
        state,
        bufferSize: buffer.length
      })
    }
  }

  consumeStrigState(joystickId: number): number {
    if (!this.isEnabled) {
      return 0
    }

    if (!this.strigClickBuffer.has(joystickId)) {
      return 0
    }
    
    const buffer = this.strigClickBuffer.get(joystickId)!
    if (buffer.length === 0) {
      return 0
    }
    
    const clickValue = buffer.shift()!
    console.log(`🔌 [WEB_WORKER_DEVICE] consumeStrigState: consumed STRIG event ` +
      `for joystick ${joystickId}, value=${clickValue}, remaining=${buffer.length}`)
    return clickValue
  }

  // === TEXT OUTPUT METHODS ===

  printOutput(output: string): void {
    console.log('🔌 [WEB_WORKER_DEVICE] Print output:', output)
    
    // Send to STDOUT (original textarea output)
    self.postMessage({
      type: 'OUTPUT',
      id: `output-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.screenStateManager.getCurrentExecutionId() || 'unknown',
        output: output,
        outputType: 'print',
        timestamp: Date.now()
      }
    })
    
    // Process all characters and update screen buffer
    for (const char of output) {
      this.screenStateManager.writeCharacter(char)
    }
    
    // Send a single 'full' screen buffer update after processing all characters
    const updateMessage = this.screenStateManager.createFullScreenUpdateMessage()
    self.postMessage(updateMessage)
  }

  debugOutput(output: string): void {
    console.log('🔌 [WEB_WORKER_DEVICE] Debug output:', output)
    // Send debug output to main thread
    self.postMessage({
      type: 'OUTPUT',
      id: `debug-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.screenStateManager.getCurrentExecutionId() || 'unknown',
        output: output,
        outputType: 'debug',
        timestamp: Date.now()
      }
    })
  }

  errorOutput(output: string): void {
    console.error('🔌 [WEB_WORKER_DEVICE] Error output:', output)
    // Send error output to main thread
    self.postMessage({
      type: 'OUTPUT',
      id: `error-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.screenStateManager.getCurrentExecutionId() || 'unknown',
        output: output,
        outputType: 'error',
        timestamp: Date.now()
      }
    })
  }

  clearScreen(): void {
    console.log('🔌 [WEB_WORKER_DEVICE] Clear screen')
    // Clear screen buffer
    this.screenStateManager.initializeScreen()
    
    // Send clear update
    const updateMessage = this.screenStateManager.createClearScreenUpdateMessage()
    self.postMessage(updateMessage)
  }

  setCursorPosition(x: number, y: number): void {
    console.log('🔌 [WEB_WORKER_DEVICE] Set cursor position:', { x, y })
    
    this.screenStateManager.setCursorPosition(x, y)
    
    // Send cursor update
    const updateMessage = this.screenStateManager.createCursorUpdateMessage()
    self.postMessage(updateMessage)
  }

  setColorPattern(x: number, y: number, pattern: number): void {
    console.log('🔌 [WEB_WORKER_DEVICE] Set color pattern:', { x, y, pattern })
    
    const cellsToUpdate = this.screenStateManager.setColorPattern(x, y, pattern)
    
    // Send screen update with color pattern changes
    const updateMessage = this.screenStateManager.createColorUpdateMessage(cellsToUpdate)
    self.postMessage(updateMessage)
  }

  setColorPalette(bgPalette: number, spritePalette: number): void {
    console.log('🔌 [WEB_WORKER_DEVICE] Set color palette:', { bgPalette, spritePalette })
    
    this.screenStateManager.setColorPalette(bgPalette, spritePalette)
    
    // Send palette update message
    const updateMessage = this.screenStateManager.createPaletteUpdateMessage()
    self.postMessage(updateMessage)
  }

  setBackdropColor(colorCode: number): void {
    console.log('🔌 [WEB_WORKER_DEVICE] Set backdrop color:', colorCode)
    
    this.screenStateManager.setBackdropColor(colorCode)
    
    // Send backdrop color update message
    const updateMessage = this.screenStateManager.createBackdropUpdateMessage()
    self.postMessage(updateMessage)
  }

  setCharacterGeneratorMode(mode: number): void {
    console.log('🔌 [WEB_WORKER_DEVICE] Set character generator mode:', mode)
    
    this.screenStateManager.setCharacterGeneratorMode(mode)
    
    // Send CGEN update message
    const updateMessage = this.screenStateManager.createCgenUpdateMessage()
    self.postMessage(updateMessage)
  }

  /**
   * Set the current execution ID (called by WebWorkerInterpreter)
   */
  setCurrentExecutionId(executionId: string | null): void {
    this.screenStateManager.setCurrentExecutionId(executionId)
    // Clear screen when starting new execution
    if (executionId) {
      this.screenStateManager.initializeScreen()
      const updateMessage = this.screenStateManager.createClearScreenUpdateMessage()
      self.postMessage(updateMessage)
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
      worker.onmessage = (event) => {
        console.log('📨 [WORKER→MAIN] Main thread received message from worker:', {
          type: event.data.type,
          id: event.data.id,
          timestamp: event.data.timestamp,
          dataSize: JSON.stringify(event.data).length
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
    this.messageHandler.handleWorkerMessage(message, (outputMessage) => {
      this.handleOutputMessage(outputMessage)
    })
  }

  /**
   * Handle OUTPUT messages from the web worker
   */
  private handleOutputMessage(message: OutputMessage): void {
    console.log('📤 [MAIN] Handling OUTPUT message:', {
      outputType: message.data.outputType,
      outputLength: message.data.output.length
    })
    
    // Output is now handled by the device adapter in the web worker
    // No need to forward to main thread callbacks
  }
}
