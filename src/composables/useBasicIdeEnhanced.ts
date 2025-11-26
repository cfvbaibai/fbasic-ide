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

/* global NodeJS */
import { ref, onUnmounted } from 'vue'
import { FBasicParser } from '../core/parser/FBasicParser'
import { getSampleCode } from '../core/samples/sampleCodes'
import type { ExecutionResult, ParserInfo, HighlighterInfo, BasicVariable, AnyServiceWorkerMessage, ResultMessage, ErrorMessage } from '../core/interfaces'
import { EXECUTION_LIMITS } from '../core/constants'

/**
 * Web Worker Manager for direct communication
 */
interface WebWorkerManager {
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
40 FOR I=1 TO 3: PRINT "I="; I: NEXT
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
  
  // Web Worker Manager
  const webWorkerManager: WebWorkerManager = {
    worker: null,
    messageId: 0,
    pendingMessages: new Map()
  }

  // Functions to send joystick events directly to web worker
  const sendStickEvent = (joystickId: number, state: number) => {
    if (webWorkerManager.worker) {
      webWorkerManager.worker.postMessage({
        type: 'STICK_EVENT',
        id: `stick-${Date.now()}`,
        timestamp: Date.now(),
        data: { joystickId, state }
      })
    }
  }

  const sendStrigEvent = (joystickId: number, state: number) => {
    if (webWorkerManager.worker) {
      webWorkerManager.worker.postMessage({
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

  // Web Worker Management Functions
  const initializeWebWorker = async (): Promise<void> => {
    if (webWorkerManager.worker) {
      console.log('✅ [COMPOSABLE] Web worker already initialized')
      return
    }

    try {
      console.log('🔧 [COMPOSABLE] Initializing web worker...')
      webWorkerManager.worker = new Worker('/basic-interpreter-worker.js')
      
      // Set up message handling
      webWorkerManager.worker.onmessage = (event) => {
        handleWorkerMessage(event.data)
      }
      
      webWorkerManager.worker.onerror = (error) => {
        console.error('❌ [COMPOSABLE] Web worker error:', error)
        rejectAllPendingMessages('Web worker error: ' + error.message)
        // Restart web worker on error
        restartWebWorker()
      }
      
      webWorkerManager.worker.onmessageerror = (error) => {
        console.error('❌ [COMPOSABLE] Web worker message error:', error)
        rejectAllPendingMessages('Web worker message error')
        // Restart web worker on message error
        restartWebWorker()
      }
      
      console.log('✅ [COMPOSABLE] Web worker initialized successfully')
    } catch (error) {
      console.error('❌ [COMPOSABLE] Failed to initialize web worker:', error)
      throw error
    }
  }

  const restartWebWorker = async (): Promise<void> => {
    console.log('🔄 [COMPOSABLE] Restarting web worker...')
    
    // Terminate existing worker
    if (webWorkerManager.worker) {
      webWorkerManager.worker.terminate()
      webWorkerManager.worker = null
    }
    
    // Clear pending messages
    rejectAllPendingMessages('Web worker restarted')
    
    // Wait a bit before restarting
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Reinitialize
    await initializeWebWorker()
  }

  const checkWebWorkerHealth = async (): Promise<boolean> => {
    if (!webWorkerManager.worker) {
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
      console.warn('⚠️ [COMPOSABLE] Web worker health check failed:', error)
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
    const resultMessage = message as ResultMessage
    const result = resultMessage.data // message.data IS the ExecutionResult
    console.log('✅ [COMPOSABLE] Execution completed:', result.executionId, 'result:', result)
    
    // Use message.id to look up the pending message (not executionId from data)
    const pending = webWorkerManager.pendingMessages.get(message.id)
    if (pending) {
      clearTimeout(pending.timeout)
      webWorkerManager.pendingMessages.delete(message.id)
      pending.resolve(result)
    } else {
      console.warn('⚠️ [COMPOSABLE] No pending message found for messageId:', message.id)
    }
  }

  const handleErrorMessage = (message: AnyServiceWorkerMessage): void => {
    const errorMessage = message as ErrorMessage
    console.error('❌ [COMPOSABLE] Execution error:', errorMessage.data.executionId, errorMessage.data.message)
    
    // Use message.id to look up the pending message (not executionId from data)
    const pending = webWorkerManager.pendingMessages.get(message.id)
    if (pending) {
      clearTimeout(pending.timeout)
      webWorkerManager.pendingMessages.delete(message.id)
      pending.reject(new Error(errorMessage.data.message))
    } else {
      console.warn('⚠️ [COMPOSABLE] No pending message found for error messageId:', message.id)
    }
  }

  const handleProgressMessage = (message: AnyServiceWorkerMessage): void => {
    const { iterationCount, currentStatement } = (message as any).data
    console.log('🔄 [COMPOSABLE] Progress:', iterationCount, currentStatement)
    // Could emit progress events here if needed
  }

  const rejectAllPendingMessages = (reason: string): void => {
    console.log('🚫 [COMPOSABLE] Rejecting all pending messages:', reason)
    for (const [_messageId, pending] of webWorkerManager.pendingMessages) {
      clearTimeout(pending.timeout)
      pending.reject(new Error(reason))
    }
    webWorkerManager.pendingMessages.clear()
  }

  const sendMessageToWorker = (message: AnyServiceWorkerMessage): Promise<ExecutionResult> => {
    return new Promise((resolve, reject) => {
      if (!webWorkerManager.worker) {
        reject(new Error('Web worker not initialized'))
        return
      }

      const _messageId = (++webWorkerManager.messageId).toString()
      const messageWithId = { ...message, id: _messageId }
      
      // Set up timeout
      const timeout = setTimeout(() => {
        console.log('⏰ [COMPOSABLE] Message timeout:', _messageId)
        webWorkerManager.pendingMessages.delete(_messageId)
        reject(new Error('Web worker message timeout'))
      }, 30000) // 30 second timeout
      
      // Store pending message
      webWorkerManager.pendingMessages.set(_messageId, {
        resolve,
        reject,
        timeout
      })
      
      console.log('📤 [COMPOSABLE] Sending message to worker:', messageWithId.type, _messageId)
      console.log('📤 [COMPOSABLE] Pending messages count:', webWorkerManager.pendingMessages.size)
      webWorkerManager.worker.postMessage(messageWithId)
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
   * Parse the current code into CST
   */
  const parseCode = async () => {
    try {
      const result = await parser.parse(code.value)
      if (result.success && result.cst) {
        return result.cst
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
      // Initialize web worker if not already done
      await initializeWebWorker()

      // Check web worker health before execution
      const isHealthy = await checkWebWorkerHealth()
      if (!isHealthy) {
        console.log('🔄 [COMPOSABLE] Web worker unhealthy, restarting...')
        await restartWebWorker()
      }

      // Parse the code
      const cst = await parseCode()
      if (!cst) {
        isRunning.value = false
        return
      }

      // Clear previous output
      output.value = []
      errors.value = []
      debugOutput.value = ''

      // Send execution message to web worker
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
        const vars: Record<string, BasicVariable> = result.variables instanceof Map 
          ? Object.fromEntries(result.variables) 
          : result.variables
        
        // Add arrays as variables for display (show actual array values)
        if (result.arrays) {
          const arrays = result.arrays instanceof Map ? result.arrays : new Map(Object.entries(result.arrays))
          for (const [arrayName, arrayValue] of arrays.entries()) {
            // Format array to show actual values
            const formatted = formatArrayForDisplay(arrayValue)
            vars[arrayName] = {
              value: formatted,
              type: arrayName.endsWith('$') ? 'string' : 'number'
            }
          }
        }
        
        variables.value = vars
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
    // Send stop message to web worker
    if (webWorkerManager.worker) {
      webWorkerManager.worker.postMessage({
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
    const cst = await parseCode()
    return cst !== null
  }

  /**
   * Format a single value for display
   */
  function formatValue(value: unknown): string {
    if (typeof value === 'string') {
      return `"${value}"`
    }
    if (typeof value === 'number') {
      return String(value)
    }
    if (value === undefined || value === null) {
      return '0'
    }
    return String(value)
  }

  /**
   * Format array for display in Variables panel
   * Shows actual array values in a readable format
   */
  function formatArrayForDisplay(array: unknown): string {
    if (!Array.isArray(array)) {
      return 'Array'
    }
    
    // Check if it's a 2D array (nested arrays)
    const is2D = array.length > 0 && Array.isArray(array[0])
    
    if (is2D) {
      // 2D array: show matrix representation
      const rows: string[] = []
      for (let i = 0; i < array.length; i++) {
        const row = array[i]
        if (Array.isArray(row)) {
          rows.push(`[${row.map(v => formatValue(v)).join(', ')}]`)
        }
      }
      return `[${rows.join(', ')}]`
    } else {
      // 1D array: show all values
      const values = array.map(v => formatValue(v))
      return `[${values.join(', ')}]`
    }
  }

  // Initialize highlighting
  updateHighlighting()

  // Cleanup web worker on component unmount
  onUnmounted(() => {
    console.log('🧹 [COMPOSABLE] Cleaning up web worker...')
    if (webWorkerManager.worker) {
      webWorkerManager.worker.terminate()
      webWorkerManager.worker = null
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
    
    // Web worker communication
    sendStickEvent,
    sendStrigEvent,
  }
}

