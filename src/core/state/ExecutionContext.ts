/**
 * Execution Context
 * 
 * Holds the state and context needed for BASIC program execution.
 */

import { ERROR_TYPES } from '../constants'
import type { 
  BasicVariable, 
  BasicError, 
  InterpreterConfig,
  DeviceAdapterInterface 
} from '../interfaces'
import type { StatementNode } from '../parser/ast-types'
import type { EvaluationContext } from '../evaluation/ExpressionEvaluator'
import type { BasicScalarValue, BasicArrayValue } from '../types/BasicTypes'

export interface LoopState {
  variableName: string
  startValue: number
  endValue: number
  stepValue: number
  currentValue: number
  statementIndex: number
  shouldExecute?: boolean
}

export class ExecutionContext implements EvaluationContext {
  // Core state
  public variables: Map<string, BasicVariable> = new Map()
  public output: string[] = []
  public errors: BasicError[] = []
  public isRunning = false
  public shouldStop = false
  public currentStatementIndex = 0
  public statements: StatementNode[] = []
  public iterationCount = 0
  
  // Configuration
  public config: InterpreterConfig
  
  // Control flow
  public loopStack: LoopState[] = []
  public gosubStack: number[] = [] // Stack for GOSUB/RETURN
  
  // Data management
  public dataValues: BasicScalarValue[] = [] // Storage for DATA values
  public dataIndex = 0 // Current position in DATA
  public arrays: Map<string, BasicArrayValue> = new Map() // Array storage
  
  // Debug
  public debugOutput: string[] = [] // Debug output buffer
  
  // Device integration
  public deviceAdapter?: DeviceAdapterInterface
  public joystickStates: number[] = [0, 0, 0, 0] // Cached STICK states for joysticks 0-3
  public triggerStates: number[] = [0, 0, 0, 0] // Cached STRIG states for joysticks 0-3

  constructor(config: InterpreterConfig) {
    this.config = config
  }

  /**
   * Reset the execution context to initial state
   */
  reset(): void {
    this.variables.clear()
    this.output = []
    this.errors = []
    this.isRunning = false
    this.shouldStop = false
    this.currentStatementIndex = 0
    this.statements = []
    this.iterationCount = 0
    this.loopStack = []
    this.gosubStack = []
    this.dataValues = []
    this.dataIndex = 0
    this.arrays.clear()
    this.debugOutput = []
    this.joystickStates = [0, 0, 0, 0]
    this.triggerStates = [0, 0, 0, 0]
  }

  /**
   * Add output to the context
   */
  addOutput(value: string): void {
    if (this.output.length >= this.config.maxOutputLines) {
      this.output.shift() // Remove oldest line
    }
    this.output.push(value)
  }

  /**
   * Add error to the context
   */
  addError(error: BasicError): void {
    this.errors.push(error)
  }

  /**
   * Add debug output
   */
  addDebugOutput(message: string): void {
    if (this.config.enableDebugMode) {
      this.debugOutput.push(`[DEBUG] ${message}`)
    }
  }

  /**
   * Check if execution should continue
   */
  shouldContinue(): boolean {
    return this.isRunning && 
           !this.shouldStop && 
           this.iterationCount < this.config.maxIterations &&
           this.currentStatementIndex < this.statements.length
  }

  /**
   * Increment iteration count and check limits
   */
  incrementIteration(): void {
    this.iterationCount++
    if (this.iterationCount >= this.config.maxIterations) {
      this.addError({
        line: 0,
        message: 'Maximum iterations exceeded',
        type: ERROR_TYPES.RUNTIME
      })
      this.shouldStop = true
    }
  }

  /**
   * Get current statement
   */
  getCurrentStatement(): StatementNode | undefined {
    return this.statements[this.currentStatementIndex]
  }

  /**
   * Move to next statement
   */
  nextStatement(): void {
    this.currentStatementIndex++
  }

  /**
   * Jump to statement by index
   */
  jumpToStatement(index: number): void {
    this.currentStatementIndex = index
  }

  /**
   * Find statement index by line number
   */
  findStatementIndexByLine(lineNumber: number): number {
    return this.statements.findIndex(stmt => stmt.lineNumber === lineNumber)
  }

  /**
   * Get joystick state (cross buttons)
   */
  getJoystickState(joystickId: number): number {
    // Use cached synchronous state
    return this.joystickStates[joystickId] || 0
  }

  /**
   * Get trigger state (action buttons)
   */
  getTriggerState(joystickId: number): number {
    // Use cached synchronous state
    return this.triggerStates[joystickId] || 0
  }
}
