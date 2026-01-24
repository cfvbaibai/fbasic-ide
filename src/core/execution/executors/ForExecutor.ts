/**
 * For Statement Executor
 * 
 * Handles execution of FOR statements for loop initialization from CST.
 */

import type { CstNode } from 'chevrotain'
import type { LoopState } from '../../state/ExecutionContext'
import type { ExpressionEvaluator } from '../../evaluation/ExpressionEvaluator'
import type { VariableService } from '../../services/VariableService'
import { getFirstToken, getCstNodes } from '../../parser/cst-helpers'
import { ERROR_TYPES, DEFAULTS } from '../../constants'

export class ForExecutor {
  constructor(
    private context: ExpressionEvaluator['context'],
    private evaluator: ExpressionEvaluator,
    private variableService: VariableService
  ) {}

  /**
   * Execute a FOR statement from CST
   * Initializes the loop variable and pushes loop state onto the stack
   * If loop is already active (jumped back from NEXT), skip re-initialization
   */
  execute(forStmtCst: CstNode, statementIndex: number, lineNumber: number): void {
    const identifierToken = getFirstToken(forStmtCst.children.Identifier)
    
    // Get all expressions (start, end, and optionally step)
    const expressions = getCstNodes(forStmtCst.children.expression)
    const startExprCst = expressions[0]
    const endExprCst = expressions[1]
    
    if (!identifierToken || !startExprCst || !endExprCst) {
      this.context.addError({
        line: lineNumber,
        message: 'Invalid FOR statement: missing variable or expressions',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    const varName = identifierToken.image.toUpperCase()

    // Check if we're already in a loop for this variable (jumped back from NEXT)
    const existingLoop = this.context.loopStack.find(
      loop => loop.variableName === varName && loop.statementIndex === statementIndex
    )

    if (existingLoop) {
      // Loop is already active - skip re-initialization
      // This happens when FOR, PRINT, and NEXT are on the same line
      // and NEXT jumps back to re-execute the statement
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(
          `FOR: ${varName} loop already active, skipping re-initialization`
        )
      }
      return
    }

    // Evaluate start and end expressions
    const startValue = this.evaluator.evaluateExpression(startExprCst)
    const endValue = this.evaluator.evaluateExpression(endExprCst)

    // Check if values are numbers
    if (typeof startValue !== 'number' || typeof endValue !== 'number') {
      this.context.addError({
        line: lineNumber,
        message: 'FOR loop requires numeric values',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Evaluate step expression (defaults to DEFAULTS.FOR_LOOP_STEP)
    let stepValue: number = DEFAULTS.FOR_LOOP_STEP
    const stepExprCst = expressions[2] // Third expression if present
    if (stepExprCst) {
      const stepValueResult = this.evaluator.evaluateExpression(stepExprCst)
      if (typeof stepValueResult !== 'number') {
        this.context.addError({
          line: lineNumber,
          message: 'FOR STEP requires numeric value',
          type: ERROR_TYPES.RUNTIME
        })
        return
      }
      stepValue = stepValueResult
    }

    // Initialize loop variable with start value
    this.variableService.setVariable(varName, startValue)

    // Create loop state
    // Note: statementIndex is the current statement index where FOR is located
    // When NEXT jumps back, it should jump to the same statement (to re-execute the loop body)
    const loopState: LoopState = {
      variableName: varName,
      startValue,
      endValue,
      stepValue,
      currentValue: startValue,
      statementIndex, // Jump back to the same statement index
      shouldExecute: this.shouldExecuteLoop(startValue, endValue, stepValue)
    }

    // Push loop state onto stack
    this.context.loopStack.push(loopState)

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(
        `FOR: ${varName} = ${startValue} TO ${endValue} STEP ${stepValue} (shouldExecute: ${loopState.shouldExecute})`
      )
    }
  }

  /**
   * Determine if loop should execute based on start, end, and step values
   */
  private shouldExecuteLoop(start: number, end: number, step: number): boolean {
    if (step > 0) {
      // Positive step: execute if start <= end
      return start <= end
    } else if (step < 0) {
      // Negative step: execute if start >= end
      return start >= end
    } else {
      // Zero step: infinite loop (should be an error, but handle gracefully)
      return false
    }
  }
}

