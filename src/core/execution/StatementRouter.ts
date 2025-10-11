/**
 * Statement Router
 * 
 * Routes BASIC statements to their appropriate executors.
 */

import type { 
  StatementNode, 
  StatementBlockExecutorNode, 
  IfStatementNode, 
  ForStatementNode, 
  NextStatementNode, 
  GotoStatementNode, 
  GosubStatementNode, 
  ReturnStatementNode, 
  InputStatementNode, 
  ReadStatementNode, 
  RestoreStatementNode, 
  DimStatementNode, 
  ColorStatementNode,
  NumberLiteralNode
} from '../parser/ast-types'
import { ERROR_TYPES } from '../constants'
import { PrintExecutor } from './executors/PrintExecutor'
import { LetExecutor } from './executors/LetExecutor'
import { IoService } from '../services/IoService'
import { VariableService } from '../services/VariableService'
import { DataService } from '../services/DataService'
import { ExpressionEvaluator, type EvaluationContext } from '../evaluation/ExpressionEvaluator'

export class StatementRouter {
  private printExecutor: PrintExecutor
  private letExecutor: LetExecutor

  constructor(
    private context: EvaluationContext,
    private evaluator: ExpressionEvaluator,
    private variableService: VariableService,
    private ioService: IoService,
    private dataService: DataService
  ) {
    this.printExecutor = new PrintExecutor(ioService)
    this.letExecutor = new LetExecutor(variableService)
  }

  /**
   * Route a statement to its appropriate executor
   */
  async executeStatement(statement: StatementNode): Promise<void> {
    switch (statement.command.type) {
      case 'PrintStatement':
        this.printExecutor.execute(statement.command)
        break

      case 'LetStatement':
        this.letExecutor.execute(statement.command)
        break

      case 'IfStatement':
        await this.executeIfStatement(statement.command)
        break

      case 'ForStatement':
        await this.executeForStatement(statement.command)
        break

      case 'NextStatement':
        await this.executeNextStatement(statement.command)
        break

      case 'GotoStatement':
        await this.executeGotoStatement(statement.command)
        break

      case 'GosubStatement':
        await this.executeGosubStatement(statement.command)
        break

      case 'ReturnStatement':
        await this.executeReturnStatement(statement.command)
        break

      case 'InputStatement':
        await this.executeInputStatement(statement.command)
        break

      case 'DataStatement':
        this.dataService.addDataValues(statement.command.constants || [])
        break

      case 'ReadStatement':
        await this.executeReadStatement(statement.command)
        break

      case 'RestoreStatement':
        await this.executeRestoreStatement(statement.command)
        break

      case 'DimStatement':
        await this.executeDimStatement(statement.command)
        break

      case 'ClsStatement':
        this.ioService.clearScreen()
        break

      case 'ColorStatement':
        await this.executeColorStatement(statement.command)
        break


      case 'EndStatement':
        // END statement - stop execution
        this.context.shouldStop = true
        break

      case 'RemStatement':
        // REM statement - no operation (comments are ignored)
        break

      case 'StatementBlockExecutor':
        // Execute nested StatementBlock statements in sequence
        await this.executeStatementBlock(statement.command.statements)
        break

      default:
        this.context.addError({
          line: statement.lineNumber,
          message: `Unsupported statement type: ${(statement.command as { type: string }).type}`,
          type: ERROR_TYPES.RUNTIME
        })
    }
  }

  /**
   * Execute a StatementBlock by executing each statement in sequence
   */
  private async executeStatementBlock(statements: StatementBlockExecutorNode['statements']): Promise<void> {
    for (const cmd of statements) {
      // Wrap each command in a StatementNode and execute it
      const statementNode: StatementNode = {
        type: 'Statement',
        lineNumber: 0, // Use 0 for nested statements
        command: cmd
      }
      await this.executeStatement(statementNode)
    }
  }

  // Placeholder methods for statements not yet extracted
  private async executeIfStatement(ifStmt: IfStatementNode): Promise<void> {
    // TODO: Extract to IfExecutor
    const condition = this.evaluator.evaluateExpression(ifStmt.condition)
    if (condition) {
      // thenStatement is a CommandNode, wrap it in a StatementNode
      await this.executeStatement({
        type: 'Statement',
        lineNumber: 0,
        command: ifStmt.thenStatement
      })
    }
  }

  private async executeForStatement(forStmt: ForStatementNode): Promise<void> {
    // TODO: Extract to ForExecutor
    const varName = forStmt.variable.name
    
    // Check if there's already a loop state for this variable
    const existingLoopIndex = this.context.loopStack.findIndex(loop => loop.variableName === varName)
    
    if (existingLoopIndex !== -1) {
      // Reuse existing loop state - don't create a new one
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`FOR: reusing existing loop state for ${varName}`)
      }
      return
    }
    
    // Create new loop state
    const startValue = this.evaluator.evaluateExpression(forStmt.start)
    const endValue = this.evaluator.evaluateExpression(forStmt.end)
    const stepValue = forStmt.step ? this.evaluator.evaluateExpression(forStmt.step) : 1
    
    const startNum = this.toNumber(startValue)
    const endNum = this.toNumber(endValue)
    const stepNum = this.toNumber(stepValue)
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`FOR: ${varName} = ${startValue} TO ${endValue} STEP ${stepValue}`)
    }
    
    this.variableService.setVariable(varName, startValue)
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`FOR: creating new loop state for ${varName}, storing statementIndex ${this.context.currentStatementIndex}`)
    }
    
    // Check if loop should execute at all
    const shouldExecute = (stepNum > 0 && startNum <= endNum) || (stepNum < 0 && startNum >= endNum)
    
    this.context.loopStack.push({
      variableName: varName,
      startValue: startNum,
      endValue: endNum,
      stepValue: stepNum,
      currentValue: startNum,
      statementIndex: this.context.currentStatementIndex,
      shouldExecute: shouldExecute
    })
    
    // If loop shouldn't execute, skip to the NEXT statement
    if (!shouldExecute) {
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`FOR: loop will not execute (${startNum} ${stepNum > 0 ? '>' : '<'} ${endNum}), skipping to NEXT`)
      }
      // Find the NEXT statement and jump to it
      const nextStatementIndex = this.findNextStatementIndex(this.context.currentStatementIndex, varName)
      if (nextStatementIndex !== -1) {
        this.context.currentStatementIndex = nextStatementIndex
      }
    }
  }

  private async executeNextStatement(nextStmt: NextStatementNode): Promise<void> {
    // TODO: Extract to NextExecutor
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`NEXT: loopStack length = ${this.context.loopStack.length}`)
    }
    
    if (this.context.loopStack.length === 0) {
      this.context.addError({
        line: 0,
        message: 'NEXT without FOR',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Find the loop state that matches the variable name
    let loopStateIndex = -1
    if (nextStmt.variable) {
      const variableName = nextStmt.variable.name
      // Find the most recent loop with this variable name
      for (let i = this.context.loopStack.length - 1; i >= 0; i--) {
        if (this.context.loopStack[i] && this.context.loopStack[i]!.variableName === variableName) {
          loopStateIndex = i
          break
        }
      }
    } else {
      // No variable specified, use the most recent loop
      loopStateIndex = this.context.loopStack.length - 1
    }

    if (loopStateIndex === -1) {
      // Handle mismatched NEXT variable gracefully - use the most recent FOR loop
      if (this.context.loopStack.length > 0) {
        loopStateIndex = this.context.loopStack.length - 1
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`NEXT: no matching FOR found for variable ${nextStmt.variable?.name || 'unnamed'}, using most recent FOR loop`)
        }
      } else {
        // No FOR loops on stack, just continue execution
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`NEXT: no matching FOR found for variable ${nextStmt.variable?.name || 'unnamed'}, continuing execution`)
        }
        return
      }
    }

    const loopState = this.context.loopStack[loopStateIndex]
    
    if (!loopState) {
      // This should not happen, but handle gracefully
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`NEXT: no valid loop state found, continuing execution`)
      }
      return
    }
    
    // If the loop was marked as not executing, just pop it and continue
    if (loopState.shouldExecute === false) {
      this.context.loopStack.splice(loopStateIndex, 1)
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`NEXT: loop was not executed, popping from stack`)
      }
      return
    }
    
    loopState.currentValue += loopState.stepValue

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`NEXT: currentValue=${loopState.currentValue}, endValue=${loopState.endValue}, stepValue=${loopState.stepValue}`)
    }

    if ((loopState.stepValue > 0 && loopState.currentValue <= loopState.endValue) ||
        (loopState.stepValue < 0 && loopState.currentValue >= loopState.endValue)) {
      this.variableService.setVariable(loopState.variableName, loopState.currentValue)
      this.context.currentStatementIndex = loopState.statementIndex
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`NEXT: continuing loop, jumping to statement ${loopState.statementIndex}`)
      }
    } else {
      this.context.loopStack.splice(loopStateIndex, 1)
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`NEXT: loop completed, removed from stack`)
      }
    }
  }

  private async executeGotoStatement(gotoStmt: GotoStatementNode): Promise<void> {
    // TODO: Extract to GotoExecutor
    const targetLine = this.evaluator.evaluateExpression(gotoStmt.target)
    const targetIndex = this.context.findStatementIndexByLine(this.toNumber(targetLine))

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`GOTO: target line ${targetLine}, target index ${targetIndex}`)
      this.context.addDebugOutput(`GOTO: available statements: ${this.context.statements.map((s, i) => `${i}:L${s.lineNumber}`).join(', ')}`)
    }

    if (targetIndex !== -1) {
      this.context.currentStatementIndex = targetIndex
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`GOTO: jumping to statement ${targetIndex}`)
      }
    } else {
      this.context.addError({
        line: 0,
        message: `GOTO target line ${targetLine} not found`,
        type: ERROR_TYPES.RUNTIME
      })
    }
  }

  private async executeGosubStatement(gosubStmt: GosubStatementNode): Promise<void> {
    // TODO: Extract to GosubExecutor
    this.context.gosubStack.push(this.context.currentStatementIndex + 1)
    const targetLine = this.evaluator.evaluateExpression(gosubStmt.target)
    const targetIndex = this.context.findStatementIndexByLine(this.toNumber(targetLine))

    if (targetIndex !== -1) {
      this.context.currentStatementIndex = targetIndex
    } else {
      this.context.addError({
        line: 0,
        message: `GOSUB target line ${targetLine} not found`,
        type: ERROR_TYPES.RUNTIME
      })
    }
  }

  private async executeReturnStatement(_returnStmt: ReturnStatementNode): Promise<void> {
    // TODO: Extract to ReturnExecutor
    if (this.context.gosubStack.length === 0) {
      this.context.addError({
        line: 0,
        message: 'RETURN without GOSUB',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    const returnIndex = this.context.gosubStack.pop()!
    this.context.currentStatementIndex = returnIndex
  }

  private async executeInputStatement(_inputStmt: InputStatementNode): Promise<void> {
    // TODO: Extract to InputExecutor
    this.ioService.inputValue()
  }

  private async executeReadStatement(readStmt: ReadStatementNode): Promise<void> {
    // TODO: Extract to ReadExecutor
    for (const variable of readStmt.variables) {
      const value = this.dataService.readNextDataValue()
      
      if (variable.subscript) {
        this.variableService.setArrayElementFromExpressions(
          variable.name,
          variable.subscript,
          { type: 'NumberLiteral', value } as NumberLiteralNode
        )
      } else {
        this.variableService.setVariable(variable.name, value)
      }
    }
  }

  private async executeRestoreStatement(restoreStmt: RestoreStatementNode): Promise<void> {
    // TODO: Extract to RestoreExecutor
    const lineNumber = restoreStmt.lineNumber ? 
      this.evaluator.evaluateExpression(restoreStmt.lineNumber) : 
      undefined
    this.dataService.restoreData(lineNumber ? this.toNumber(lineNumber) : undefined)
  }

  private async executeDimStatement(dimStmt: DimStatementNode): Promise<void> {
    // TODO: Extract to DimExecutor
    for (const arrayDecl of dimStmt.arrays) {
      const dimensions = arrayDecl.dimensions.map((dim) => 
        this.toNumber(this.evaluator.evaluateExpression(dim))
      )
      this.variableService.createArray(arrayDecl.variable.name, dimensions)
    }
  }

  private async executeColorStatement(colorStmt: ColorStatementNode): Promise<void> {
    // TODO: Extract to ColorExecutor
    const foreground = this.toNumber(this.evaluator.evaluateExpression(colorStmt.foreground))
    const background = colorStmt.background ? 
      this.toNumber(this.evaluator.evaluateExpression(colorStmt.background)) : 0
    
    // Placeholder - actual color implementation would go here
    this.context.addDebugOutput(`COLOR: foreground=${foreground}, background=${background}`)
  }

  private toNumber(value: number | string | boolean | undefined): number {
    if (typeof value === 'number') return value
    if (typeof value === 'boolean') return value ? 1 : 0
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  /**
   * Find the NEXT statement for a given variable
   */
  private findNextStatementIndex(startIndex: number, variableName: string): number {
    for (let i = startIndex + 1; i < this.context.statements.length; i++) {
      const stmt = this.context.statements[i]
      if (stmt && stmt.command.type === 'NextStatement') {
        // Check if this NEXT matches our variable (or no variable specified)
        if (!stmt.command.variable || stmt.command.variable.name === variableName) {
          return i
        }
      }
    }
    return -1
  }
}
