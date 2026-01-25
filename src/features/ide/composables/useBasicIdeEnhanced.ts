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

import { onDeactivated, onUnmounted, ref, watch } from 'vue'

import { EXECUTION_LIMITS } from '@/core/constants'
import type {
  AnyServiceWorkerMessage,
  BasicVariable,
  ExecutionResult,
  HighlighterInfo,
  ParserInfo,
} from '@/core/interfaces'
import { FBasicParser } from '@/core/parser/FBasicParser'
import { getSampleCode } from '@/core/samples/sampleCodes'
import type { MovementState, SpriteState } from '@/core/sprite/types'

import { formatArrayForDisplay } from './useBasicIdeFormatting'
import { handleWorkerMessage, type MessageHandlerContext } from './useBasicIdeMessageHandlers'
import { clearScreenBuffer, initializeScreenBuffer } from './useBasicIdeScreenUtils'
import type { WebWorkerManager } from './useBasicIdeWebWorkerUtils'
import {
  checkWebWorkerHealth,
  initializeWebWorker,
  rejectAllPendingMessages,
  restartWebWorker,
  sendMessageToWorker as sendMessageToWorkerUtil,
} from './useBasicIdeWebWorkerUtils'

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

  const currentSampleType = ref<
    'basic' | 'gaming' | 'complex' | 'comprehensive' | 'pause' | 'allChars' | 'spriteTest' | 'moveTest' | null
  >(null)

  const isRunning = ref(false)
  const output = ref<string[]>([])
  const errors = ref<Array<{ line: number; message: string; type: string }>>([])
  const variables = ref<Record<string, BasicVariable>>({})
  const highlightedCode = ref('')
  const debugOutput = ref<string>('')
  const debugMode = ref(false)

  // Screen state - initialize as full grid for proper reactivity
  const screenBuffer = ref(initializeScreenBuffer())
  const cursorX = ref(0)
  const cursorY = ref(0)
  const bgPalette = ref(1) // Default background palette code is 1
  const backdropColor = ref(0) // Default backdrop color code (0 = black)

  // Sprite state
  const spriteStates = ref<SpriteState[]>([])
  const spriteEnabled = ref(false)
  const movementStates = ref<MovementState[]>([])

  // Parser instance
  const parser = new FBasicParser()

  // Web Worker Manager
  const webWorkerManager: WebWorkerManager = {
    worker: null,
    messageId: 0,
    pendingMessages: new Map(),
  }

  // Functions to send joystick events directly to web worker
  const sendStickEvent = (joystickId: number, state: number) => {
    if (webWorkerManager.worker) {
      webWorkerManager.worker.postMessage({
        type: 'STICK_EVENT',
        id: `stick-${Date.now()}`,
        timestamp: Date.now(),
        data: { joystickId, state },
      })
    }
  }

  const sendStrigEvent = (joystickId: number, state: number) => {
    if (webWorkerManager.worker) {
      webWorkerManager.worker.postMessage({
        type: 'STRIG_EVENT',
        id: `strig-${Date.now()}`,
        timestamp: Date.now(),
        data: { joystickId, state },
      })
    }
  }

  // Message handler context
  const messageHandlerContext: MessageHandlerContext = {
    output,
    errors,
    debugOutput,
    screenBuffer,
    cursorX,
    cursorY,
    bgPalette,
    backdropColor,
    movementStates,
    webWorkerManager,
  }

  // Web Worker Management Functions
  const initializeWebWorkerWrapper = async (): Promise<void> => {
    await initializeWebWorker(webWorkerManager, message => {
      handleWorkerMessage(message, messageHandlerContext)
    })
  }

  const restartWebWorkerWrapper = async (): Promise<void> => {
    await restartWebWorker(webWorkerManager, message => {
      handleWorkerMessage(message, messageHandlerContext)
    })
  }

  const checkWebWorkerHealthWrapper = async (): Promise<boolean> => {
    return checkWebWorkerHealth(webWorkerManager, message => sendMessageToWorkerWrapper(message))
  }

  const sendMessageToWorkerWrapper = (message: AnyServiceWorkerMessage): Promise<ExecutionResult> => {
    return sendMessageToWorkerUtil(message, webWorkerManager)
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
            line: error.location?.start?.line ?? 0,
            message: error.message,
            type: 'syntax',
          }))
        }
        return null
      }
    } catch (error) {
      console.error('Parse error:', error)
      errors.value = [
        {
          line: 0,
          message: error instanceof Error ? error.message : 'Parse error',
          type: 'syntax',
        },
      ]
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
      await initializeWebWorkerWrapper()

      // Check web worker health before execution
      const isHealthy = await checkWebWorkerHealthWrapper()
      if (!isHealthy) {
        console.log('🔄 [COMPOSABLE] Web worker unhealthy, restarting...')
        await restartWebWorkerWrapper()
      }

      // Parse the code
      const cst = await parseCode()
      if (!cst) {
        isRunning.value = false
        return
      }

      // Clear screen
      clearScreenBuffer(screenBuffer, cursorX, cursorY)

      // Clear movement states before new execution
      movementStates.value = []

      // Send execution message to web worker
      const result = await sendMessageToWorkerWrapper({
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
          },
        },
      })

      if (result?.errors && result.errors.length > 0) {
        errors.value = result.errors
      }

      if (result?.variables) {
        const vars: Record<string, BasicVariable> =
          result.variables instanceof Map ? Object.fromEntries(result.variables) : result.variables

        // Add arrays as variables for display (show actual array values)
        if (result.arrays) {
          const arrays = result.arrays instanceof Map ? result.arrays : new Map(Object.entries(result.arrays))
          for (const [arrayName, arrayValue] of arrays.entries()) {
            // Format array to show actual values
            const formatted = formatArrayForDisplay(arrayValue)
            vars[arrayName] = {
              value: formatted,
              type: arrayName.endsWith('$') ? 'string' : 'number',
            }
          }
        }

        variables.value = vars
      }

      // Update sprite states
      if (result?.spriteStates) {
        spriteStates.value = result.spriteStates
      }
      if (result?.spriteEnabled !== undefined) {
        spriteEnabled.value = result.spriteEnabled
      }
      // Update movement states
      if (result?.movementStates) {
        movementStates.value = result.movementStates
      }
    } catch (error) {
      console.error('Execution error:', error)
      errors.value = [
        {
          line: 0,
          message: error instanceof Error ? error.message : 'Execution error',
          type: 'runtime',
        },
      ]
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
        data: {},
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

    // Clear screen - reassign to force reactivity
    screenBuffer.value = initializeScreenBuffer()
    cursorX.value = 0
    cursorY.value = 0

    // Clear sprite states
    spriteStates.value = []
    spriteEnabled.value = false
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
  const loadSampleCode = (
    sampleType:
      | 'basic'
      | 'gaming'
      | 'complex'
      | 'comprehensive'
      | 'pause'
      | 'allChars'
      | 'spriteTest'
      | 'moveTest' = 'basic'
  ) => {
    const sample = getSampleCode(sampleType)
    if (sample) {
      code.value = sample.code
      currentSampleType.value = sampleType
      void updateHighlighting()
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
      features: ['basic-syntax'],
    }
  }

  /**
   * Validate code syntax
   */
  const validateCode = async () => {
    const cst = await parseCode()
    return cst !== null
  }

  // Watch code changes and update highlighting reactively
  watch(
    code,
    () => {
      void updateHighlighting()
    },
    { immediate: true }
  )

  // Cleanup function for web worker
  const cleanupWebWorker = () => {
    console.log('🧹 [COMPOSABLE] Cleaning up web worker...')
    if (webWorkerManager.worker) {
      webWorkerManager.worker.terminate()
      webWorkerManager.worker = null
    }
    rejectAllPendingMessages(webWorkerManager, 'Component unmounted')
  }

  // Clean up on unmount AND deactivation (keep-alive)
  onUnmounted(cleanupWebWorker)
  onDeactivated(cleanupWebWorker)

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
    screenBuffer,
    cursorX,
    cursorY,
    bgPalette,
    backdropColor,
    spriteStates,
    spriteEnabled,
    movementStates,

    // Methods
    runCode,
    stopCode,
    clearOutput,
    clearAll,
    currentSampleType,
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
