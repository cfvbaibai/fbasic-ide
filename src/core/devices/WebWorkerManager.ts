/**
 * Web Worker Manager
 * 
 * Handles web worker lifecycle, initialization, and communication.
 */

import { DEFAULTS } from '@/core/constants'
import type { 
  AnyServiceWorkerMessage,
  ExecuteMessage,
  ExecutionResult,
  InterpreterConfig, 
  StopMessage
} from '@/core/interfaces'

export interface WebWorkerExecutionOptions {
  onProgress?: (iterationCount: number, currentStatement?: string) => void
  onError?: (error: Error) => void
  timeout?: number
}

export class WebWorkerManager {
  private worker: Worker | null = null
  private messageId = 0
  private pendingMessages = new Map<string, {
    resolve: (result: ExecutionResult) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
  }>()

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
    console.log('🔧 [WEB_WORKER] WebWorkerManager.initialize called with script:', workerScript)
    if (!WebWorkerManager.isSupported()) {
      console.error('❌ [WEB_WORKER] Web workers are not supported in this environment')
      throw new Error('Web workers are not supported in this environment')
    }

    if (this.worker) {
      console.log('✅ [WEB_WORKER] Worker already initialized')
      return // Already initialized
    }

    const script = workerScript ?? DEFAULTS.WEB_WORKER.WORKER_SCRIPT
    console.log('🔧 [WEB_WORKER] Creating worker with script:', script)
    
    try {
      this.worker = new Worker(script)
      console.log('✅ [WEB_WORKER] Worker created successfully')
    } catch (error) {
      console.error('❌ [WEB_WORKER] Failed to create worker:', error)
      throw error
    }
    
    // Handle worker errors
    this.worker.onerror = (error) => {
      console.error('❌ [WEB_WORKER] Web worker error:', error)
      this.rejectAllPending(`Web worker error: ${error.message}`)
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
    options: WebWorkerExecutionOptions = {},
    onMessage?: (message: AnyServiceWorkerMessage) => void
  ): Promise<ExecutionResult> {
    console.log(`executeInWorker called with code: ${code.substring(0, 50)  }...`)
    if (!this.worker) {
      console.log('Worker not initialized, initializing...')
      await this.initialize(DEFAULTS.WEB_WORKER.WORKER_SCRIPT)
    }

    if (!this.worker) {
      throw new Error('Failed to initialize web worker')
    }

    const messageId = (++this.messageId).toString()
    const timeout = options.timeout ?? DEFAULTS.WEB_WORKER.MESSAGE_TIMEOUT
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

      // Set up message listener if provided (must be done before sending message)
      if (onMessage && this.worker) {
        this.worker.onmessage = (event) => {
          const message = event.data as AnyServiceWorkerMessage
          onMessage(message)
        }
      }

      console.log('🔄 [MAIN→WORKER] Posting message to worker:', {
        type: message.type,
        id: message.id,
        timestamp: message.timestamp,
        dataSize: JSON.stringify(message.data).length,
        hasDeviceAdapter: !!config.deviceAdapter
      })
      if (this.worker) {
        this.worker.postMessage(message)
      }
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
   * Send a message to the web worker
   */
  sendMessage(message: AnyServiceWorkerMessage): void {
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

  /**
   * Get the worker instance (for setting up message listeners)
   */
  getWorker(): Worker | null {
    return this.worker
  }

  /**
   * Get pending messages map (for use by MessageHandler)
   */
  getPendingMessages(): Map<string, { resolve: (result: ExecutionResult) => void; reject: (error: Error) => void; timeout: NodeJS.Timeout }> {
    return this.pendingMessages
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
