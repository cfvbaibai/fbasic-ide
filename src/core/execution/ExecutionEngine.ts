/**
 * Execution Engine
 * 
 * Main execution engine that orchestrates BASIC program execution.
 */

import type { ExecutionResult } from '../interfaces'
import type { StatementNode, CommandNode } from '../parser/ast-types'
import { ERROR_TYPES } from '../constants'
import { ExecutionContext } from '../state/ExecutionContext'
import { ExpressionEvaluator } from '../evaluation/ExpressionEvaluator'
import { StatementRouter } from './StatementRouter'
import { VariableService } from '../services/VariableService'
import { IoService } from '../services/IoService'
import { DataService } from '../services/DataService'

export class ExecutionEngine {
  private context: ExecutionContext
  private evaluator: ExpressionEvaluator
  private variableService: VariableService
  private ioService: IoService
  private dataService: DataService
  private statementRouter: StatementRouter

  constructor(context: ExecutionContext) {
    this.context = context
    
    // Initialize services
    this.evaluator = new ExpressionEvaluator(this.context)
    this.variableService = new VariableService(this.context, this.evaluator)
    this.ioService = new IoService(this.context, this.evaluator)
    this.dataService = new DataService(this.context, this.evaluator)
    this.statementRouter = new StatementRouter(
      this.context,
      this.evaluator,
      this.variableService,
      this.ioService,
      this.dataService
    )
  }

  /**
   * Preprocess statement blocks by flattening colon-separated statements
   */
  private preprocessStatementBlocks(): void {
    const flattenedStatements: StatementNode[] = []
    
    for (const statement of this.context.statements) {
      if (statement.command.type === 'StatementBlock') {
        // Flatten the statement block into individual statements
        const block = statement.command
        for (const cmd of block.statements) {
          // Recursively process nested StatementBlocks
          const processedCmd = this.processNestedStatementBlocks(cmd)
          flattenedStatements.push({
            type: 'Statement',
            lineNumber: statement.lineNumber,
            command: processedCmd
          })
        }
      } else {
        // Process non-block statements for nested StatementBlocks
        const processedStatement = {
          ...statement,
          command: this.processNestedStatementBlocks(statement.command)
        }
        flattenedStatements.push(processedStatement)
      }
    }
    
    // Update the context with flattened statements
    this.context.statements = flattenedStatements
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`Preprocessed ${flattenedStatements.length} statements (flattened statement blocks)`)
      // Debug: show statement indices and line numbers
      for (let i = 0; i < flattenedStatements.length; i++) {
        const stmt = flattenedStatements[i]
        if (stmt) {
          this.context.addDebugOutput(`Statement ${i}: Line ${stmt.lineNumber}, Type: ${stmt.command.type}`)
        }
      }
    }
  }

  /**
   * Recursively process nested StatementBlocks in commands
   */
  private processNestedStatementBlocks(command: CommandNode): CommandNode {
    if (command.type === 'StatementBlock') {
      // Flatten the StatementBlock by executing each statement in sequence
      // For now, we'll handle this by creating a special executor
      return {
        type: 'StatementBlockExecutor',
        statements: command.statements
      } as CommandNode
    } else if (command.type === 'IfStatement') {
      // Process the thenStatement for nested StatementBlocks
      return {
        ...command,
        thenStatement: this.processNestedStatementBlocks(command.thenStatement)
      } as CommandNode
    } else {
      // No nested StatementBlocks to process
      return command
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
      
      // Preprocess statement blocks (flatten colon-separated statements)
      this.preprocessStatementBlocks()
      
      // Start execution
      this.context.isRunning = true
      this.context.shouldStop = false
      
      // Main execution loop
      while (this.context.shouldContinue()) {
        const statement = this.context.getCurrentStatement()
        if (!statement) break
        
        // Track the statement index before execution
        const statementIndexBefore = this.context.currentStatementIndex
        
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`Executing statement ${statementIndexBefore}: ${statement.command.type}`)
        }
        
        // Execute the statement
        await this.statementRouter.executeStatement(statement)
        
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
        success: this.context.errors.length === 0,
        output: this.ioService.getOutput(),
        debugOutput: this.context.config.enableDebugMode ? 
          this.context.debugOutput.join('\n') : undefined,
        errors: this.context.errors,
        variables: this.context.variables,
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
        output: this.ioService.getOutput(),
        debugOutput: this.context.config.enableDebugMode ? 
          this.context.debugOutput.join('\n') : undefined,
        errors: this.context.errors,
        variables: this.context.variables,
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
   * Update joystick states
   */
  async updateJoystickStates(): Promise<void> {
    if (!this.context.deviceAdapter) return
    
    try {
      for (let i = 0; i < 4; i++) {
        this.context.joystickStates[i] = await this.context.deviceAdapter.getStickState(i)
        this.context.triggerStates[i] = await this.context.deviceAdapter.getTriggerState(i)
      }
    } catch (error) {
      this.context.addDebugOutput(`Error updating joystick states: ${error}`)
    }
  }

  /**
   * Get current joystick state
   */
  getJoystickState(joystickId: number): number {
    if (joystickId < 0 || joystickId > 3) return 0
    return this.context.joystickStates[joystickId] || 0
  }

  /**
   * Get current trigger state
   */
  getTriggerState(joystickId: number): number {
    if (joystickId < 0 || joystickId > 3) return 0
    return this.context.triggerStates[joystickId] || 0
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
