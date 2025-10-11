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
import { ref, computed } from 'vue'
import { FBasicParser } from '../core/parser/FBasicParser'
import { BasicInterpreter } from '../core/BasicInterpreter'
import type { ExecutionResult, ParserInfo, HighlighterInfo, BasicVariable } from '../core/interfaces'
import { isEmpty } from 'lodash-es'

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

  // Parser and interpreter instances
  const parser = new FBasicParser()
  const interpreter = new BasicInterpreter()

  // Computed properties
  const hasErrors = computed(() => !isEmpty(errors.value))
  const hasOutput = computed(() => !isEmpty(output.value))
  const isReady = computed(() => !isRunning.value)

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
      // Configure interpreter with debug mode
      interpreter.updateConfig({ enableDebugMode: debugMode.value })

      // Parse the code
      const ast = await parseCode()
      if (!ast) {
        isRunning.value = false
        return
      }

      // Execute using AST-based interpreter
      const result: ExecutionResult = await interpreter.execute(code.value)
      
      output.value = Array.isArray(result.output) ? result.output : [result.output]
      variables.value = result.variables instanceof Map ? Object.fromEntries(result.variables) : result.variables
      debugOutput.value = result.debugOutput || ''
      
      if (result.errors && result.errors.length > 0) {
        errors.value = result.errors.map(error => ({
          line: error.line,
          message: error.message,
          type: error.type
        }))
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
    // Note: The AST-based interpreter doesn't have a direct stop method yet
    // This would need to be implemented in the interpreter
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
  const loadSampleCode = (sampleType: 'basic' | 'gaming' | 'complex' | 'comprehensive' = 'basic') => {
    const samples = {
      basic: `10 PRINT "Basic F-Basic Program"
20 LET A = 10
30 LET B = 20
40 LET C = A + B
50 PRINT "A + B = "; C
60 END`,

      gaming: `10 REM F-Basic Gaming Demo
20 CLS
30 SPRITE 0, 100, 100
40 SPRITEON 0
50 SPRITEPUT 0, 1, 2
60 CGSET 65, 255
70 CGPUT 65, 1, 3
80 MOVE 0, 1
90 ANIMATE 0, 1, 2
100 VIEW 0, 0, 320, 240
110 SOUND 440, 1000
120 JOY 0, 1
130 TILE 0, 0, 0
140 HIT 0, 1
150 PRINT "Gaming demo completed!"
160 END`,

      complex: `10 REM Complex F-Basic Program
20 PRINT "Complex F-Basic Demo"
30 PRINT
40 FOR I = 1 TO 10
50   IF I MOD 2 = 0 THEN PRINT "Even: "; I
60   IF I MOD 2 = 1 THEN PRINT "Odd: "; I
70 NEXT I
80 PRINT
90 LET SUM = 0
100 FOR J = 1 TO 100
110   SUM = SUM + J
120 NEXT J
130 PRINT "Sum of 1 to 100 = "; SUM
140 PRINT
150 PRINT "String functions demo:"
160 LET TEXT$ = "Hello World"
170 PRINT "Length of '"; TEXT$; "' = "; LEN(TEXT$)
180 PRINT "Left 5 chars: "; LEFT(TEXT$, 5)
190 PRINT "Right 5 chars: "; RIGHT(TEXT$, 5)
200 PRINT "Middle chars: "; MID(TEXT$, 3, 5)
210 END`,

      comprehensive: `10 REM F-Basic Comprehensive Gaming Demo
20 CLS
30 REM Initialize sprites
40 SPRITE 0, 50, 50
50 SPRITE 1, 150, 50
60 SPRITEON 0
70 SPRITEON 1
80 REM Set sprite properties
90 SPRITECOLOR 0, 1
100 SPRITECOLOR 1, 2
110 SPRITEPRIORITY 0, 1
120 SPRITEPRIORITY 1, 2
130 REM Character generator
140 CGSET 65, 255
150 CGPUT 65, 1, 3
160 CGMOVE 65, 1, 3
170 REM Movement and animation
180 MOVE 0, 1
190 MOVEX 0, 5
200 MOVEY 0, 3
210 ANIMATE 0, 1, 2
220 ANIMSPEED 2
230 ANIMLOOP 1
240 REM View and scrolling
250 VIEW 0, 0, 320, 240
260 SCROLL 0, 0
270 SCROLLSPEED 1
280 REM Sound and music
290 SOUND 440, 1000
300 MUSIC 1
310 VOLUME 50
320 PITCH 440
330 REM Input handling
340 JOY 0, 1
350 JOYPAD 0, 1
360 BUTTON 1, 1
370 KEY 65, 1
380 REM Tile graphics
390 TILE 0, 0, 0
400 TILEMAP 0, 0, 0
410 BACKGROUND 0, 1
420 LAYER 0, 1
430 PRIORITY 1, 1
440 REM Collision detection
450 HIT 0, 1
460 COLLISION 0, 1
470 HITBOX 0, 0, 0, 16
480 REM System commands
490 CLEAR
500 RUN
510 END`
    }

    code.value = samples[sampleType]
    updateHighlighting()
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
    
    // Computed
    hasErrors,
    hasOutput,
    isReady,
    
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
    toggleDebugMode
  }
}

