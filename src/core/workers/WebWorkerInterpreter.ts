/**
 * Web Worker Entry Point for BASIC Interpreter
 *
 * This is the main entry point for the web worker that will be bundled
 * with the interpreter code.
 */

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { WebWorkerDeviceAdapter } from '@/core/devices/WebWorkerDeviceAdapter'
import type {
  AnyServiceWorkerMessage,
  ErrorMessage,
  ExecuteMessage,
  OutputMessage,
  ResultMessage,
  StickEventMessage,
  StopMessage,
  StrigEventMessage,
} from '@/core/interfaces'

// Web Worker Interpreter Implementation
class WebWorkerInterpreter {
  private interpreter: BasicInterpreter | null = null
  private isRunning: boolean = false
  private currentExecutionId: string | null = null
  private webWorkerDeviceAdapter: WebWorkerDeviceAdapter | null = null

  constructor() {
    this.interpreter = null
    this.isRunning = false
    this.currentExecutionId = null
    this.webWorkerDeviceAdapter = new WebWorkerDeviceAdapter()

    this.setupMessageListener()
  }

  setupMessageListener() {
    if (typeof self === 'undefined') return

    self.addEventListener('message', event => {
      console.log('📨 [WORKER] Web worker received message from main thread:', {
        type: event.data.type,
        id: event.data.id,
        timestamp: event.data.timestamp,
        dataSize: JSON.stringify(event.data).length,
      })
      void this.handleMessage(event.data)
    })
  }

  async handleMessage(message: AnyServiceWorkerMessage) {
    console.log('🔍 [WORKER] Processing message:', {
      type: message.type,
      id: message.id,
      timestamp: message.timestamp,
    })

    try {
      // -- Only handling request messages, not response messages
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (message.type) {
        case 'EXECUTE':
          console.log('▶️ [WORKER] Handling EXECUTE message')
          await this.handleExecute(message)
          break
        case 'STOP':
          console.log('⏹️ [WORKER] Handling STOP message')
          this.handleStop(message)
          break
        case 'STRIG_EVENT':
          console.log('🎮 [WORKER] Handling STRIG_EVENT message')
          this.handleStrigEvent(message)
          break
        case 'STICK_EVENT':
          console.log('🎮 [WORKER] Handling STICK_EVENT message')
          this.handleStickEvent(message)
          break

        default:
          // Other message types (RESULT, PROGRESS, OUTPUT, ERROR,
          // SCREEN_UPDATE, INIT, READY) are sent FROM the worker, not
          // handled BY the worker
          console.log('⚠️ [WORKER] Unexpected message type:', message.type)
          break
      }
    } catch (error) {
      console.log('❌ [WORKER] Error processing message:', error)
      this.sendError(message.id, error instanceof Error ? error : new Error(String(error)))
    }
  }

  async handleExecute(message: ExecuteMessage) {
    try {
      const { code, config } = message.data
      this.currentExecutionId = message.id

      // Set execution ID in device adapter so it can include it in OUTPUT messages
      if (this.webWorkerDeviceAdapter) {
        this.webWorkerDeviceAdapter.setCurrentExecutionId(message.id)
      }

      console.log('▶️ [WORKER] Starting execution:', {
        executionId: message.id,
        codeLength: code.length,
      })

      // Create a new interpreter for each execution to ensure correct configuration
      console.log('🔧 [WORKER] Creating interpreter with WebWorkerDeviceAdapter:', {
        hasOriginalDeviceAdapter: !!config.deviceAdapter,
        maxIterations: config.maxIterations,
        maxOutputLines: config.maxOutputLines,
      })
      this.interpreter = new BasicInterpreter({
        ...config,
        deviceAdapter: this.webWorkerDeviceAdapter!, // Use WebWorkerDeviceAdapter (non-null assertion)
      })
      console.log('✅ [WORKER] Interpreter created with WebWorkerDeviceAdapter')

      // Execute the BASIC code
      console.log('🚀 [WORKER] Executing BASIC code')
      this.isRunning = true
      const result = await this.interpreter.execute(code)
      this.isRunning = false

      console.log('✅ [WORKER] Execution completed:', {
        success: result.success,
        outputLines: this.webWorkerDeviceAdapter?.printOutput.length ?? 0,
        executionTime: result.executionTime,
      })

      // Get sprite states and movement states from interpreter
      if (!this.interpreter) {
        throw new Error('Interpreter not initialized')
      }
      const spriteStates = this.interpreter.getSpriteStates()
      const spriteEnabled = this.interpreter.isSpriteEnabled()
      const movementStates = this.interpreter.getMovementStates()

      // Create enhanced result with execution metadata
      const enhancedResult: ResultMessage['data'] = {
        ...result,
        executionId: message.id,
        workerId: 'web-worker-1',
        spriteStates,
        spriteEnabled,
        movementStates,
      }

      this.sendResult(message.id, enhancedResult)
    } catch (error) {
      this.isRunning = false
      this.sendError(message.id, error instanceof Error ? error : new Error(String(error)))
    }
  }

  handleStop(_message: StopMessage) {
    console.log('⏹️ [WORKER] Stopping execution:', {
      wasRunning: this.isRunning,
      currentExecutionId: this.currentExecutionId,
    })
    this.isRunning = false
    if (this.interpreter) {
      console.log('🛑 [WORKER] Calling interpreter.stop()')
      this.interpreter.stop()
    }
  }

  handleStrigEvent(message: StrigEventMessage) {
    const { joystickId, state } = message.data
    console.log('🎮 [WORKER] Processing STRIG event:', { joystickId, state })

    // Update the WebWorkerDeviceAdapter directly
    if (this.webWorkerDeviceAdapter) {
      console.log('🎮 [WORKER] Updating WebWorkerDeviceAdapter STRIG buffer')
      this.webWorkerDeviceAdapter.pushStrigState(joystickId, state)
    } else {
      console.log('🎮 [WORKER] No WebWorkerDeviceAdapter available for STRIG event')
    }
  }

  handleStickEvent(message: StickEventMessage) {
    const { joystickId, state } = message.data
    console.log('🎮 [WORKER] Processing STICK event:', { joystickId, state })

    // Update the WebWorkerDeviceAdapter directly
    if (this.webWorkerDeviceAdapter) {
      console.log('🎮 [WORKER] Updating WebWorkerDeviceAdapter STICK state')
      this.webWorkerDeviceAdapter.setStickState(joystickId, state)
    } else {
      console.log('🎮 [WORKER] No WebWorkerDeviceAdapter available for STICK event')
    }
  }

  sendOutput(output: string, outputType: 'print' | 'debug' | 'error') {
    if (!this.currentExecutionId) return

    const message: OutputMessage = {
      type: 'OUTPUT',
      id: `output-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.currentExecutionId,
        output,
        outputType,
        timestamp: Date.now(),
      },
    }
    console.log('📤 [WORKER→MAIN] Sending OUTPUT message:', {
      outputType,
      outputLength: output.length,
      executionId: this.currentExecutionId,
    })
    self.postMessage(message)
  }

  sendResult(messageId: string, result: ResultMessage['data']) {
    const message: ResultMessage = {
      type: 'RESULT',
      id: messageId,
      timestamp: Date.now(),
      data: result,
    }
    console.log('📊 [WORKER→MAIN] Sending RESULT message:', {
      messageId,
      success: result.success,
      executionTime: result.executionTime,
    })
    self.postMessage(message)
  }

  sendError(messageId: string, error: Error) {
    const message: ErrorMessage = {
      type: 'ERROR',
      id: messageId,
      timestamp: Date.now(),
      data: {
        executionId: messageId,
        message: error.message,
        stack: error.stack,
        errorType: 'execution',
        recoverable: true,
      },
    }
    console.log('❌ [WORKER→MAIN] Sending ERROR message:', {
      messageId,
      errorMessage: error.message,
      errorType: 'execution',
      recoverable: true,
    })
    self.postMessage(message)
  }
}

// Initialize web worker interpreter
new WebWorkerInterpreter()
