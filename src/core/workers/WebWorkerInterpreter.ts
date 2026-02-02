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
  InputValueMessage,
  OutputMessage,
  ResultMessage,
  SetSharedAnimationBufferMessage,
  StickEventMessage,
  StopMessage,
  StrigEventMessage,
} from '@/core/interfaces'
import { logWorker } from '@/shared/logger'

// Web Worker Interpreter Implementation
class WebWorkerInterpreter {
  private interpreter: BasicInterpreter | null = null
  private isRunning: boolean = false
  private currentExecutionId: string | null = null
  private webWorkerDeviceAdapter: WebWorkerDeviceAdapter | null = null
  private sharedAnimationBuffer: SharedArrayBuffer | null = null

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
      logWorker.debug('Web worker received message from main thread:', {
        type: event.data.type,
        id: event.data.id,
        timestamp: event.data.timestamp,
        dataSize: JSON.stringify(event.data).length,
      })
      void this.handleMessage(event.data)
    })
  }

  async handleMessage(message: AnyServiceWorkerMessage) {
    logWorker.debug('Processing message:', {
      type: message.type,
      id: message.id,
      timestamp: message.timestamp,
    })

    try {
      // -- Only handling request messages, not response messages
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (message.type) {
        case 'EXECUTE':
          logWorker.debug('Handling EXECUTE message')
          await this.handleExecute(message)
          break
        case 'PING':
          this.handlePing(message)
          break
        case 'STOP':
          logWorker.debug('Handling STOP message')
          this.handleStop(message)
          break
        case 'STRIG_EVENT':
          logWorker.debug('Handling STRIG_EVENT message')
          this.handleStrigEvent(message)
          break
        case 'STICK_EVENT':
          logWorker.debug('Handling STICK_EVENT message')
          this.handleStickEvent(message)
          break
        case 'SET_SHARED_ANIMATION_BUFFER':
          this.handleSetSharedAnimationBuffer(message)
          break
        case 'INPUT_VALUE':
          this.handleInputValue(message)
          break

        default:
          // Other message types (RESULT, PROGRESS, OUTPUT, ERROR,
          // SCREEN_UPDATE, INIT, READY) are sent FROM the worker, not
          // handled BY the worker
          logWorker.warn('Unexpected message type:', message.type)
          break
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      logWorker.error('Error processing message:', err.message)
      logWorker.error('Stack trace:', err.stack ?? '(no stack available)')
      // Capture location from interpreter when available (e.g. error escaped from handleExecute)
      const location = this.interpreter?.getExecutionLocation?.() ?? null
      this.sendError(message.id, err, location)
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

      logWorker.debug('Starting execution:', {
        executionId: message.id,
        codeLength: code.length,
      })

      // Create a new interpreter for each execution to ensure correct configuration
      logWorker.debug('Creating interpreter with WebWorkerDeviceAdapter:', {
        hasOriginalDeviceAdapter: !!config.deviceAdapter,
        maxIterations: config.maxIterations,
        maxOutputLines: config.maxOutputLines,
      })
      this.interpreter = new BasicInterpreter({
        ...config,
        deviceAdapter: this.webWorkerDeviceAdapter!,
        sharedAnimationBuffer: this.sharedAnimationBuffer ?? undefined,
      })
      logWorker.debug('Interpreter created with WebWorkerDeviceAdapter')

      // Execute the BASIC code
      logWorker.debug('Executing BASIC code')
      this.isRunning = true
      const result = await this.interpreter.execute(code)
      this.isRunning = false

      logWorker.debug('Execution completed:', {
        success: result.success,
        outputLines: this.webWorkerDeviceAdapter?.printOutput.length ?? 0,
        executionTime: result.executionTime,
      })
      if (!result.success && result.errors?.length) {
        logWorker.error('Execution returned success: false', result.errors[0]?.message, result.errors)
      }

      // Flush final screen buffer so main thread receives full SCREEN_UPDATE before RESULT.
      // Otherwise RESULT can be processed first and only the first batched screen shows.
      if (this.webWorkerDeviceAdapter) {
        this.webWorkerDeviceAdapter.setCurrentExecutionId(null)
      }

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
      const err = error instanceof Error ? error : new Error(String(error))
      logWorker.error('Execution error:', err.message)
      logWorker.error('Stack trace:', err.stack ?? '(no stack available)')
      const location = this.interpreter?.getExecutionLocation() ?? null
      this.sendError(message.id, err, location)
    }
  }

  handlePing(message: { id: string }) {
    logWorker.debug('Handling PING message')
    this.sendResult(message.id, {
      executionId: message.id,
      success: true,
      errors: [],
      variables: new Map(),
      executionTime: 0,
    })
  }

  handleStop(_message: StopMessage) {
    logWorker.debug('Stopping execution:', {
      wasRunning: this.isRunning,
      currentExecutionId: this.currentExecutionId,
    })
    this.isRunning = false
    if (this.webWorkerDeviceAdapter) {
      this.webWorkerDeviceAdapter.rejectAllInputRequests('Execution stopped')
    }
    if (this.interpreter) {
      logWorker.debug('Calling interpreter.stop()')
      this.interpreter.stop()
    }
  }

  handleInputValue(message: InputValueMessage) {
    if (this.webWorkerDeviceAdapter) {
      this.webWorkerDeviceAdapter.handleInputValueMessage(message)
    }
  }

  handleStrigEvent(message: StrigEventMessage) {
    const { joystickId, state } = message.data
    logWorker.debug('Processing STRIG event:', { joystickId, state })

    // Update the WebWorkerDeviceAdapter directly
    if (this.webWorkerDeviceAdapter) {
      logWorker.debug('Updating WebWorkerDeviceAdapter STRIG buffer')
      this.webWorkerDeviceAdapter.pushStrigState(joystickId, state)
    } else {
      logWorker.debug('No WebWorkerDeviceAdapter available for STRIG event')
    }
  }

  handleStickEvent(message: StickEventMessage) {
    const { joystickId, state } = message.data
    logWorker.debug('Processing STICK event:', { joystickId, state })

    // Update the WebWorkerDeviceAdapter directly
    if (this.webWorkerDeviceAdapter) {
      logWorker.debug('Updating WebWorkerDeviceAdapter STICK state')
      this.webWorkerDeviceAdapter.setStickState(joystickId, state)
    } else {
      logWorker.debug('No WebWorkerDeviceAdapter available for STICK event')
    }
  }

  handleSetSharedAnimationBuffer(message: SetSharedAnimationBufferMessage) {
    const data = message.data
    if (!data?.buffer) {
      logWorker.warn('SET_SHARED_ANIMATION_BUFFER: message.data or buffer missing')
      return
    }
    const { buffer } = data
    this.sharedAnimationBuffer = buffer
    if (this.webWorkerDeviceAdapter) {
      this.webWorkerDeviceAdapter.setSharedAnimationBuffer(buffer)
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
    logWorker.debug('Sending OUTPUT message:', {
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
    logWorker.debug('Sending RESULT message:', {
      messageId,
      success: result.success,
      executionTime: result.executionTime,
    })
    self.postMessage(message)
  }

  sendError(
    messageId: string,
    error: Error,
    location?: { lineNumber: number; statementIndex: number; sourceLine?: string } | null
  ): void {
    // Always send a string for stack so main thread can display it (worker stack may be undefined in some envs)
    const stackStr =
      (error && typeof (error).stack === 'string' && (error).stack) ||
      '(stack not available)'
    const message: ErrorMessage = {
      type: 'ERROR',
      id: messageId,
      timestamp: Date.now(),
      data: {
        executionId: messageId,
        message: error.message,
        stack: stackStr,
        lineNumber: location?.lineNumber,
        sourceLine: location?.sourceLine,
        errorType: 'execution',
        recoverable: true,
      },
    }
    logWorker.error('Sending ERROR message:', {
      messageId,
      errorMessage: error.message,
      lineNumber: location?.lineNumber,
      sourceLine: location?.sourceLine ? `${location.sourceLine.slice(0, 40)}...` : undefined,
      errorType: 'execution',
      recoverable: true,
    })
    logWorker.error('Stack trace:', stackStr)
    self.postMessage(message)
  }
}

// Initialize web worker interpreter
new WebWorkerInterpreter()
