/**
 * Enhanced Composable for Family Basic IDE functionality
 * 
 * Provides reactive state and methods for managing a BASIC interpreter
 * within a Vue.js application using the new AST-based parser system.
 * Handles code execution, error management, and UI state coordination.
 * 
 * @example
 * ```typescript
 * const {
 *   code,
 *   isRunning,
 *   output,
 *   errors,
 *   runCode,
 *   stopCode,
 *   clearOutput,
 *   highlightedCode
 * } = useBasicIde()
 * ```
 * 
 * @returns Object containing reactive state and methods for IDE functionality
 */

/* global Worker, NodeJS, clearTimeout */
import { ref, onUnmounted } from 'vue'
import { FBasicParser } from '../core/parser/FBasicParser'
import { getSampleCode } from '../core/samples/sampleCodes'
import type { ExecutionResult, ParserInfo, HighlighterInfo, BasicVariable, AnyServiceWorkerMessage } from '../core/interfaces'
import { EXECUTION_LIMITS } from '../core/constants'

/**
 * Service Worker Manager for direct communication
 */
interface ServiceWorkerManager {
  worker: Worker | null
  messageId: number
  pendingMessages: Map<string, {
    resolve: (result: ExecutionResult) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
  }>
}

/**
 * Enhanced composable function for BASIC IDE functionality with AST-based parsing
 * 
 * @returns Object with reactive state and methods for IDE management
 */
export function useBasicIde() {
  // State
  const code = ref(`10 PRINT "Hello World!"
20 PRINT "Family Basic IDE Demo"
30 PRINT "Program completed!"
40 FOR I=1 TO 3: PRINT "I="; I: NEXT I
50 END`)

  const isRunning = ref(false)
  const output = ref<string[]>([])
  const errors = ref<Array<{ line: number; message: string; type: string }>>([])
  const variables = ref<Record<string, BasicVariable>>({})
  const highlightedCode = ref('')
  const debugOutput = ref<string>('')
  const debugMode = ref(false)

  // Parser instance
  const parser = new FBasicParser()
  
  // Service Worker Manager
  const serviceWorkerManager: ServiceWorkerManager = {
    worker: null,
    messageId: 0,
    pendingMessages: new Map()
  }

  // Functions to send joystick events directly to service worker
  const sendStickEvent = (joystickId: number, state: number) => {
    if (serviceWorkerManager.worker) {
      serviceWorkerManager.worker.postMessage({
        type: 'STICK_EVENT',
        id: `stick-${Date.now()}`,
        timestamp: Date.now(),
        data: { joystickId, state }
      })
    }
  }

  const sendStrigEvent = (joystickId: number, state: number) => {
    if (serviceWorkerManager.worker) {
      serviceWorkerManager.worker.postMessage({
        type: 'STRIG_EVENT',
        id: `strig-${Date.now()}`,
        timestamp: Date.now(),
        data: { joystickId, state }
      })
    }
  }

  // Helper function to check if code contains joystick functions
  const _hasJoystickFunctions = (code: string): boolean => {
    const joystickKeywords = ['STICK(', 'STRIG(']
    return joystickKeywords.some(keyword => code.includes(keyword))
  }

  // Service Worker Management Functions
  const initializeServiceWorker = async (): Promise<void> => {
    if (serviceWorkerManager.worker) {
      console.log('✅ [COMPOSABLE] Service worker already initialized')
      return
    }

    try {
      console.log('🔧 [COMPOSABLE] Initializing service worker...')
      serviceWorkerManager.worker = new Worker('/basic-interpreter-worker.js')
      
      // Set up message handling
      serviceWorkerManager.worker.onmessage = (event) => {
        handleWorkerMessage(event.data)
      }
      
      serviceWorkerManager.worker.onerror = (error) => {
        console.error('❌ [COMPOSABLE] Service worker error:', error)
        rejectAllPendingMessages('Service worker error: ' + error.message)
        // Restart service worker on error
        restartServiceWorker()
      }
      
      serviceWorkerManager.worker.onmessageerror = (error) => {
        console.error('❌ [COMPOSABLE] Service worker message error:', error)
        rejectAllPendingMessages('Service worker message error')
        // Restart service worker on message error
        restartServiceWorker()
      }
      
      console.log('✅ [COMPOSABLE] Service worker initialized successfully')
    } catch (error) {
      console.error('❌ [COMPOSABLE] Failed to initialize service worker:', error)
      throw error
    }
  }

  const restartServiceWorker = async (): Promise<void> => {
    console.log('🔄 [COMPOSABLE] Restarting service worker...')
    
    // Terminate existing worker
    if (serviceWorkerManager.worker) {
      serviceWorkerManager.worker.terminate()
      serviceWorkerManager.worker = null
    }
    
    // Clear pending messages
    rejectAllPendingMessages('Service worker restarted')
    
    // Wait a bit before restarting
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Reinitialize
    await initializeServiceWorker()
  }

  const checkServiceWorkerHealth = async (): Promise<boolean> => {
    if (!serviceWorkerManager.worker) {
      return false
    }

    try {
      // Send a ping message to check if worker is responsive
      const _pingResult = await sendMessageToWorker({
        type: 'EXECUTE',
        id: `ping-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          code: '10 PRINT "PING"',
          config: {
            maxIterations: 100,
            maxOutputLines: 10,
            enableDebugMode: false,
            strictMode: false,
            deviceAdapter: undefined
          },
          options: {
            timeout: 5000
          }
        }
      })
      
      return true
    } catch (error) {
      console.warn('⚠️ [COMPOSABLE] Service worker health check failed:', error)
      return false
    }
  }

  const handleWorkerMessage = (message: AnyServiceWorkerMessage): void => {
    console.log('📨 [COMPOSABLE] Received message from worker:', message.type)
    
    switch (message.type) {
      case 'OUTPUT':
        handleOutputMessage(message)
        break
      case 'RESULT':
        handleResultMessage(message)
        break
      case 'ERROR':
        handleErrorMessage(message)
        break
      case 'PROGRESS':
        handleProgressMessage(message)
        break
      default:
        console.warn('⚠️ [COMPOSABLE] Unknown message type:', message.type)
    }
  }

  const handleOutputMessage = (message: AnyServiceWorkerMessage): void => {
    const { output: outputText, outputType } = (message as any).data
    console.log('📤 [COMPOSABLE] Handling output:', outputType, outputText)
    
    if (outputType === 'print') {
      output.value.push(outputText)
    } else if (outputType === 'debug') {
      debugOutput.value += outputText + '\n'
    } else if (outputType === 'error') {
      errors.value.push({
        line: 0,
        message: outputText,
        type: 'runtime'
      })
    }
  }

  const handleResultMessage = (message: AnyServiceWorkerMessage): void => {
    const { executionId, result } = (message as any).data
    console.log('✅ [COMPOSABLE] Execution completed:', executionId, 'result:', result)
    
    const pending = serviceWorkerManager.pendingMessages.get(executionId)
    if (pending) {
      clearTimeout(pending.timeout)
      serviceWorkerManager.pendingMessages.delete(executionId)
      pending.resolve(result)
    } else {
      console.warn('⚠️ [COMPOSABLE] No pending message found for executionId:', executionId)
    }
  }

  const handleErrorMessage = (message: AnyServiceWorkerMessage): void => {
    const { executionId, error } = (message as any).data
    console.error('❌ [COMPOSABLE] Execution error:', executionId, error)
    
    const pending = serviceWorkerManager.pendingMessages.get(executionId)
    if (pending) {
      clearTimeout(pending.timeout)
      serviceWorkerManager.pendingMessages.delete(executionId)
      pending.reject(new Error(error))
    }
  }

  const handleProgressMessage = (message: AnyServiceWorkerMessage): void => {
    const { iterationCount, currentStatement } = (message as any).data
    console.log('🔄 [COMPOSABLE] Progress:', iterationCount, currentStatement)
    // Could emit progress events here if needed
  }

  const rejectAllPendingMessages = (reason: string): void => {
    console.log('🚫 [COMPOSABLE] Rejecting all pending messages:', reason)
    for (const [_messageId, pending] of serviceWorkerManager.pendingMessages) {
      clearTimeout(pending.timeout)
      pending.reject(new Error(reason))
    }
    serviceWorkerManager.pendingMessages.clear()
  }

  const sendMessageToWorker = (message: AnyServiceWorkerMessage): Promise<ExecutionResult> => {
    return new Promise((resolve, reject) => {
      if (!serviceWorkerManager.worker) {
        reject(new Error('Service worker not initialized'))
        return
      }

      const _messageId = (++serviceWorkerManager.messageId).toString()
      const messageWithId = { ...message, id: _messageId }
      
      // Set up timeout
      const timeout = setTimeout(() => {
        console.log('⏰ [COMPOSABLE] Message timeout:', _messageId)
        serviceWorkerManager.pendingMessages.delete(_messageId)
        reject(new Error('Service worker message timeout'))
      }, 30000) // 30 second timeout
      
      // Store pending message
      serviceWorkerManager.pendingMessages.set(_messageId, {
        resolve,
        reject,
        timeout
      })
      
      console.log('📤 [COMPOSABLE] Sending message to worker:', messageWithId.type, _messageId)
      console.log('📤 [COMPOSABLE] Pending messages count:', serviceWorkerManager.pendingMessages.size)
      serviceWorkerManager.worker.postMessage(messageWithId)
    })
  }

  /**
   * Parse and highlight the current code
   */
  const updateHighlighting = async () => {
    // Simple fallback highlighting - just return the code as-is
    highlightedCode.value = code.value
  }

  /**
   * Parse the current code into AST
   */
  const parseCode = async () => {
    try {
      const result = await parser.parse(code.value)
      if (result.success && result.ast) {
        return result.ast
      } else {
        // Update errors from parser
        if (result.errors) {
          errors.value = result.errors.map(error => ({
            line: error.location?.start?.line || 0,
            message: error.message,
            type: 'syntax'
          }))
        }
        return null
      }
    } catch (error) {
      console.error('Parse error:', error)
      errors.value = [{
        line: 0,
        message: error instanceof Error ? error.message : 'Parse error',
        type: 'syntax'
      }]
      return null
    }
  }

  /**
   * Execute the current code using AST-based interpreter
   */
  const runCode = async () => {
    if (isRunning.value) return

    isRunning.value = true
    output.value = []
    errors.value = []
    variables.value = {}
    debugOutput.value = ''

    try {
      // Initialize service worker if not already done
      await initializeServiceWorker()

      // Check service worker health before execution
      const isHealthy = await checkServiceWorkerHealth()
      if (!isHealthy) {
        console.log('🔄 [COMPOSABLE] Service worker unhealthy, restarting...')
        await restartServiceWorker()
      }

      // Parse the code
      const ast = await parseCode()
      if (!ast) {
        isRunning.value = false
        return
      }

      // Clear previous output
      output.value = []
      errors.value = []
      debugOutput.value = ''

      // Send execution message to service worker
      const result = await sendMessageToWorker({
        type: 'EXECUTE',
        id: `execute-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          code: code.value,
          config: {
            maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_PRODUCTION,
            maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES_PRODUCTION,
            enableDebugMode: debugMode.value,
            strictMode: true,
          }
        }
      })

      if (result && result.errors && result.errors.length > 0) {
        errors.value = result.errors
      }
      
      if (result && result.variables) {
        variables.value = result.variables instanceof Map ? Object.fromEntries(result.variables) : result.variables
      }

    } catch (error) {
      console.error('Execution error:', error)
      errors.value = [{
        line: 0,
        message: error instanceof Error ? error.message : 'Execution error',
        type: 'runtime'
      }]
    } finally {
      isRunning.value = false
    }
  }

  /**
   * Stop code execution
   */
  const stopCode = () => {
    isRunning.value = false
    // Send stop message to service worker
    if (serviceWorkerManager.worker) {
      serviceWorkerManager.worker.postMessage({
        type: 'STOP',
        id: `stop-${Date.now()}`,
        timestamp: Date.now(),
        data: {}
      })
    }
  }

  /**
   * Clear output and errors
   */
  const clearOutput = () => {
    output.value = []
    errors.value = []
    variables.value = {}
    debugOutput.value = ''
  }

  /**
   * Clear all state
   */
  const clearAll = () => {
    code.value = ''
    clearOutput()
    highlightedCode.value = ''
  }

  /**
   * Toggle debug mode
   */
  const toggleDebugMode = () => {
    debugMode.value = !debugMode.value
  }

  /**
   * Load sample code
   */
  const loadSampleCode = (sampleType: 'basic' | 'gaming' | 'complex' | 'comprehensive' | 'pause' = 'basic') => {
    const sample = getSampleCode(sampleType)
    if (sample) {
      code.value = sample.code
      updateHighlighting()
    }
  }

  /**
   * Get parser capabilities
   */
  const getParserCapabilities = (): ParserInfo => {
    return parser.getParserInfo()
  }

  /**
   * Get syntax highlighter capabilities
   */
  const getHighlighterCapabilities = (): HighlighterInfo => {
    return {
      name: 'Basic Highlighter',
      version: '1.0.0',
      features: ['basic-syntax']
    }
  }

  /**
   * Validate code syntax
   */
  const validateCode = async () => {
    const ast = await parseCode()
    return ast !== null
  }

  // Initialize highlighting
  updateHighlighting()

  // Cleanup service worker on component unmount
  onUnmounted(() => {
    console.log('🧹 [COMPOSABLE] Cleaning up service worker...')
    if (serviceWorkerManager.worker) {
      serviceWorkerManager.worker.terminate()
      serviceWorkerManager.worker = null
    }
    rejectAllPendingMessages('Component unmounted')
  })

  return {
    // State
    code,
    isRunning,
    output,
    errors,
    variables,
    highlightedCode,
    debugOutput,
    debugMode,

    // Methods
    runCode,
    stopCode,
    clearOutput,
    clearAll,
    loadSampleCode,
    updateHighlighting,
    validateCode,
    getParserCapabilities,
    getHighlighterCapabilities,
    toggleDebugMode,
    
    // Service worker communication
    sendStickEvent,
    sendStrigEvent,
  }
}

