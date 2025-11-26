/**
 * Web Worker Device Adapter
 * 
 * A comprehensive device adapter that handles both device operations and web worker management.
 * Merges WebWorkerManager functionality for unified web worker communication.
 */

/* global Worker, NodeJS, navigator, self, clearTimeout */

import type { 
  BasicDeviceAdapter,
  InterpreterConfig, 
  ExecutionResult,
  AnyServiceWorkerMessage,
  ExecuteMessage,
  ResultMessage,
  ErrorMessage,
  ProgressMessage,
  StopMessage,
  OutputMessage
} from '../interfaces'
import { DEFAULTS } from '../constants'

export interface WebWorkerExecutionOptions {
  onProgress?: (iterationCount: number, currentStatement?: string) => void
  onError?: (error: Error) => void
  timeout?: number
}

export class WebWorkerDeviceAdapter implements BasicDeviceAdapter {
  // === DEVICE STATE ===
  private strigClickBuffer: Map<number, number[]> = new Map()
  private stickStates: Map<number, number> = new Map()
  private isEnabled = true
  private currentExecutionId: string | null = null

  // === WEB WORKER MANAGEMENT ===
  private worker: Worker | null = null
  private messageId = 0
  private pendingMessages = new Map<string, {
    resolve: (result: ExecutionResult) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
  }>()

  constructor() {
    console.log('🔌 [WEB_WORKER_DEVICE] WebWorkerDeviceAdapter created')
    this.setupMessageListener()
  }

  // === WEB WORKER MANAGEMENT METHODS ===

  /**
   * Check if web workers are supported
   */
  static isSupported(): boolean {
    const supported = typeof Worker !== 'undefined'
    console.log('🔍 [WEB_WORKER] isSupported check:', {
      hasWorker: typeof Worker !== 'undefined',
      supported
    })
    return supported
  }

  /**
   * Check if we're currently running in a web worker context
   */
  static isInWebWorker(): boolean {
    const inWebWorker = typeof window === 'undefined' && typeof self !== 'undefined'
    console.log('🔍 [WEB_WORKER] isInWebWorker check:', {
      hasWindow: typeof window !== 'undefined',
      hasSelf: typeof self !== 'undefined',
      inWebWorker
    })
    return inWebWorker
  }

  /**
   * Initialize the web worker
   */
  async initialize(workerScript?: string): Promise<void> {
    console.log('🔧 [WEB_WORKER] WebWorkerDeviceAdapter.initialize called with script:', workerScript)
    if (!WebWorkerDeviceAdapter.isSupported()) {
      console.error('❌ [WEB_WORKER] Web workers are not supported in this environment')
      throw new Error('Web workers are not supported in this environment')
    }

    if (this.worker) {
      console.log('✅ [WEB_WORKER] Worker already initialized')
      return // Already initialized
    }

    const script = workerScript || DEFAULTS.WEB_WORKER.WORKER_SCRIPT
    console.log('🔧 [WEB_WORKER] Creating worker with script:', script)
    
    try {
      this.worker = new Worker(script)
      console.log('✅ [WEB_WORKER] Worker created successfully')
    } catch (error) {
      console.error('❌ [WEB_WORKER] Failed to create worker:', error)
      throw error
    }
    
    // Set up message handling
    this.setupMessageListener()
    
    // Handle worker errors
    this.worker.onerror = (error) => {
      console.error('❌ [WEB_WORKER] Web worker error:', error)
      this.rejectAllPending('Web worker error: ' + error.message)
    }

    // Handle worker termination
    this.worker.onmessageerror = (error) => {
      console.error('❌ [WEB_WORKER] Web worker message error:', error)
      this.rejectAllPending('Web worker message error')
    }
    
    console.log('✅ [WEB_WORKER] Worker initialization completed successfully')
  }

  /**
   * Execute BASIC code in the web worker
   */
  async executeInWorker(
    code: string, 
    config: InterpreterConfig,
    options: WebWorkerExecutionOptions = {}
  ): Promise<ExecutionResult> {
    console.log('executeInWorker called with code:', code.substring(0, 50) + '...')
    if (!this.worker) {
      console.log('Worker not initialized, initializing...')
      await this.initialize(DEFAULTS.WEB_WORKER.WORKER_SCRIPT)
    }

    if (!this.worker) {
      throw new Error('Failed to initialize web worker')
    }

    const messageId = (++this.messageId).toString()
    const timeout = options.timeout || DEFAULTS.WEB_WORKER.MESSAGE_TIMEOUT
    console.log('Sending message with ID:', messageId, 'timeout:', timeout)

    return new Promise<ExecutionResult>((resolve, reject) => {
      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        console.log('Web worker timeout after', timeout, 'ms for message ID:', messageId)
        this.pendingMessages.delete(messageId)
        reject(new Error(`Web worker execution timeout after ${timeout}ms`))
      }, timeout)

      // Store pending message
      this.pendingMessages.set(messageId, {
        resolve,
        reject,
        timeout: timeoutHandle
      })

      // Send execution message
      const message: ExecuteMessage = {
        type: 'EXECUTE',
        id: messageId,
        timestamp: Date.now(),
        data: { 
          code, 
          config,
          options: {
            timeout,
            enableProgress: options.onProgress !== undefined
          }
        }
      }

      console.log('🔄 [MAIN→WORKER] Posting message to worker:', {
        type: message.type,
        id: message.id,
        timestamp: message.timestamp,
        dataSize: JSON.stringify(message.data).length,
        hasDeviceAdapter: !!config.deviceAdapter
      })
      this.worker!.postMessage(message)
      console.log('✅ [MAIN→WORKER] Message posted to worker successfully')
    })
  }

  /**
   * Stop execution in the web worker
   */
  stopExecution(): void {
    if (!this.worker) return

    const message: StopMessage = {
      type: 'STOP',
      id: 'stop',
      timestamp: Date.now(),
      data: {
        executionId: 'current',
        reason: 'user_request'
      }
    }

    console.log('🛑 [MAIN→WORKER] Posting STOP message to worker:', {
      type: message.type,
      id: message.id,
      timestamp: message.timestamp,
      reason: message.data.reason
    })
    this.worker.postMessage(message)
    console.log('✅ [MAIN→WORKER] STOP message posted to worker successfully')
  }

  /**
   * Send a STRIG event to the web worker
   */
  sendStrigEvent(joystickId: number, state: number): void {
    if (!this.worker) {
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
    
    this.worker.postMessage(message)
  }

  /**
   * Send a message to the web worker
   */
  sendMessage(message: any): void {
    if (this.worker) {
      this.worker.postMessage(message)
    }
  }

  /**
   * Terminate the web worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
      this.rejectAllPending('Web worker terminated')
    }
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
    // Send print output to main thread
    self.postMessage({
      type: 'OUTPUT',
      id: `output-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.currentExecutionId || 'unknown',
        output: output,
        outputType: 'print',
        timestamp: Date.now()
      }
    })
  }

  debugOutput(output: string): void {
    console.log('🔌 [WEB_WORKER_DEVICE] Debug output:', output)
    // Send debug output to main thread
    self.postMessage({
      type: 'OUTPUT',
      id: `debug-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.currentExecutionId || 'unknown',
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
        executionId: this.currentExecutionId || 'unknown',
        output: output,
        outputType: 'error',
        timestamp: Date.now()
      }
    })
  }

  clearScreen(): void {
    console.log('🔌 [WEB_WORKER_DEVICE] Clear screen')
    // Send clear screen command to main thread
    self.postMessage({
      type: 'CLEAR_SCREEN',
      id: `clear-${Date.now()}`,
      timestamp: Date.now(),
      data: { executionId: this.currentExecutionId || 'unknown' }
    })
  }

  /**
   * Set the current execution ID (called by WebWorkerInterpreter)
   */
  setCurrentExecutionId(executionId: string | null): void {
    this.currentExecutionId = executionId
  }
  // === PRIVATE METHODS ===

  /**
   * Set up message listener for web worker responses
   */
  private setupMessageListener(): void {
    if (typeof window === 'undefined') return // Not in main thread

    // Use worker.onmessage instead of window.addEventListener
    if (this.worker) {
      this.worker.onmessage = (event) => {
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
    console.log('🔍 [MAIN] Processing worker message:', {
      type: message.type,
      id: message.id,
      timestamp: message.timestamp
    })
    
    // Handle OUTPUT messages separately as they don't have pending message IDs
    if (message.type === 'OUTPUT') {
      console.log('📤 [MAIN] Handling OUTPUT message:', {
        outputType: (message as OutputMessage).data.outputType,
        outputLength: (message as OutputMessage).data.output.length
      })
      this.handleOutputMessage(message as OutputMessage)
      return
    }
    
    const pending = this.pendingMessages.get(message.id)
    if (!pending) {
      console.log('⚠️ [MAIN] No pending message found for ID:', message.id)
      return
    }

    console.log('✅ [MAIN] Found pending message for ID:', message.id)
    switch (message.type) {
      case 'RESULT': {
        const resultMessage = message as ResultMessage
        console.log('📊 [MAIN] Received RESULT message:', {
          success: resultMessage.data.success,
          executionTime: resultMessage.data.executionTime
        })
        clearTimeout(pending.timeout)
        this.pendingMessages.delete(message.id)
        
        // Check if web worker indicates fallback is needed
        if (resultMessage.data.errors?.some(error => error.message.includes('not yet fully implemented'))) {
          console.log('⚠️ [MAIN] Web worker indicates fallback needed, rejecting to trigger fallback')
          // Web worker can't handle the execution, reject to trigger fallback
          pending.reject(new Error('Web worker execution not implemented, falling back to main thread'))
        } else {
          console.log('✅ [MAIN] Web worker result is valid, resolving pending promise')
          pending.resolve(resultMessage.data)
        }
        break
      }

      case 'ERROR': {
        const errorMessage = message as ErrorMessage
        console.log('❌ [MAIN] Received ERROR message:', {
          message: errorMessage.data.message,
          errorType: errorMessage.data.errorType,
          recoverable: errorMessage.data.recoverable
        })
        clearTimeout(pending.timeout)
        this.pendingMessages.delete(message.id)
        console.log('❌ [MAIN] Rejecting pending promise due to error')
        pending.reject(new Error(errorMessage.data.message))
        break
      }

      case 'PROGRESS': {
        // Handle progress updates if needed
        const progressMessage = message as ProgressMessage
        console.log('📈 [MAIN] Received PROGRESS message:', {
          progress: progressMessage.data.progress
        })
        // Could emit progress events here
        break
      }
    }
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

  /**
   * Reject all pending messages (cleanup)
   */
  private rejectAllPending(reason: string): void {
    for (const [_id, pending] of this.pendingMessages) {
      clearTimeout(pending.timeout)
      pending.reject(new Error(reason))
    }
    this.pendingMessages.clear()
  }
}

