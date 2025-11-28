/**
 * Execution Engine
 * 
 * Main execution engine that orchestrates BASIC program execution.
 */

import type { ExecutionResult, BasicDeviceAdapter } from '../interfaces'
import { ERROR_TYPES } from '../constants'
import { ExecutionContext } from '../state/ExecutionContext'
import { ExpressionEvaluator } from '../evaluation/ExpressionEvaluator'
import { StatementRouter } from './StatementRouter'
import { VariableService } from '../services/VariableService'
import { DataService } from '../services/DataService'

export class ExecutionEngine {
  private context: ExecutionContext
  private evaluator: ExpressionEvaluator
  private variableService: VariableService
  private dataService: DataService
  private statementRouter: StatementRouter

  constructor(
    context: ExecutionContext,
    _deviceAdapter?: BasicDeviceAdapter
  ) {
    this.context = context
    
    // Initialize services
    this.evaluator = new ExpressionEvaluator(this.context)
    this.variableService = new VariableService(this.context, this.evaluator)
    this.dataService = new DataService(this.context, this.evaluator)
    this.statementRouter = new StatementRouter(
      this.context,
      this.evaluator,
      this.variableService,
      this.dataService
    )
  }

  /**
   * Preprocess statements (statements are already expanded)
   */
  private preprocessStatements(): void {
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`Preprocessed ${this.context.statements.length} expanded statements`)
      for (let i = 0; i < this.context.statements.length; i++) {
        const stmt = this.context.statements[i]
        if (stmt) {
          this.context.addDebugOutput(`Statement ${i}: Line ${stmt.lineNumber}`)
        }
      }
      this.context.addDebugOutput(`Label map: ${this.context.labelMap.size} line numbers`)
    }
  }

  /**
   * Execute the BASIC program
   */
  async execute(): Promise<ExecutionResult> {
    const startTime = Date.now()
    
    try {
      // Preprocess DATA statements
      this.dataService.preprocessDataStatements()
      
      // Preprocess statements
      this.preprocessStatements()
      
      // Start execution
      this.context.isRunning = true
      this.context.shouldStop = false
      
      // Main execution loop
      while (this.context.shouldContinue()) {
        const expandedStatement = this.context.getCurrentStatement()
        if (!expandedStatement) break
        
        // Track the statement index before execution
        const statementIndexBefore = this.context.currentStatementIndex
        
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`Executing statement ${statementIndexBefore}: Line ${expandedStatement.lineNumber}`)
        }
        
        // Execute the statement
        await this.statementRouter.executeStatement(expandedStatement)
        
        // Only move to next statement if the index wasn't modified by the statement
        if (this.context.currentStatementIndex === statementIndexBefore) {
          this.context.nextStatement()
          if (this.context.config.enableDebugMode) {
            this.context.addDebugOutput(`Moved to next statement: ${this.context.currentStatementIndex}`)
          }
        } else {
          if (this.context.config.enableDebugMode) {
            this.context.addDebugOutput(`Statement index modified to: ${this.context.currentStatementIndex}`)
          }
        }
        
        // Increment iteration count
        this.context.incrementIteration()
      }
      
      // Execution completed
      this.context.isRunning = false
      
      // Check for unclosed FOR loops
      if (this.context.loopStack.length > 0) {
        this.context.addError({
          line: 0,
          message: 'Missing NEXT statement for FOR loop',
          type: ERROR_TYPES.RUNTIME
        })
      }
      
      return {
        success: this.context.getErrors().length === 0,
        errors: this.context.getErrors(),
        variables: this.context.variables,
        arrays: this.context.arrays,
        executionTime: Date.now() - startTime
      }
      
    } catch (error) {
      this.context.isRunning = false
      this.context.addError({
        line: 0,
        message: `Execution error: ${error}`,
        type: ERROR_TYPES.RUNTIME
      })
      
      return {
        success: false,
        errors: this.context.getErrors(),
        variables: this.context.variables,
        arrays: this.context.arrays,
        executionTime: Date.now() - startTime
      }
    }
  }

  /**
   * Stop execution
   */
  stop(): void {
    this.context.shouldStop = true
    this.context.isRunning = false
  }

  /**
   * Reset execution state
   */
  reset(): void {
    this.context.reset()
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<typeof this.context.config>): void {
    this.context.config = {
      ...this.context.config,
      ...newConfig
    }
  }
}
