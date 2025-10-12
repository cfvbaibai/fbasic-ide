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
  BasicDeviceAdapter 
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
  
  // Device integration
  public deviceAdapter?: BasicDeviceAdapter

  private errors: BasicError[] = []

  constructor(config: InterpreterConfig) {
    this.config = config
  }

  /**
   * Reset the execution context to initial state
   */
  reset(): void {
    this.variables.clear()
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
  }

  /**
   * Add output to the context
   */
  addOutput(value: string): void {
    this.deviceAdapter?.printOutput(value)
  }

  /**
   * Add error to the context
   */
  addError(error: BasicError): void {
    this.deviceAdapter?.errorOutput(error.message)
    this.errors.push(error)
  }

  /**
   * Get errors
   */
  getErrors(): BasicError[] {
    return this.errors
  }

  /**
   * Add debug output
   */
  addDebugOutput(message: string): void {
    if (this.config.enableDebugMode) {
      this.deviceAdapter?.debugOutput(message)
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
  getStickState(joystickId: number): number {
    // Use device adapter if available, otherwise fall back to cached state
    if (this.deviceAdapter) {
      return this.deviceAdapter.getStickState(joystickId)
    }
    return 0
  }

  /**
   * Get trigger state (action buttons)
   */
  consumeStrigState(joystickId: number): number {
    // Use consumeTriggerState if available
    if (this.deviceAdapter) {
      const consumedValue = this.deviceAdapter.consumeStrigState(joystickId)
      
      if (consumedValue > 0) {
        console.log(`🎮 [EXECUTION] STRIG event consumed: joystickId=${joystickId}, value=${consumedValue}`)
        return consumedValue
      }
    }
    return 0
  }
}
