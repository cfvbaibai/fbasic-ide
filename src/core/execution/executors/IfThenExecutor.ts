/**
 * IF-THEN Statement Executor
 *
 * Handles execution of IF-THEN statements from CST.
 * Executes the THEN clause only if the condition evaluates to true (non-zero).
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getFirstCstNode, getFirstToken } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class IfThenExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Evaluate the condition of an IF-THEN statement
   * Returns true if condition is true (non-zero), false otherwise
   */
  evaluateCondition(ifThenStmtCst: CstNode, lineNumber: number): boolean {
    // Check for logicalExpression (supports NOT, AND, OR)
    const logicalExprCst = getFirstCstNode(ifThenStmtCst.children.logicalExpression)

    if (!logicalExprCst) {
      this.context.addError({
        line: lineNumber,
        message: 'Invalid IF-THEN statement: missing condition',
        type: ERROR_TYPES.RUNTIME,
      })
      return false
    }

    // Evaluate the logical expression
    let conditionResult: number
    try {
      conditionResult = this.evaluator.evaluateLogicalExpression(logicalExprCst)
    } catch (error) {
      this.context.addError({
        line: lineNumber,
        message: `Error evaluating IF condition: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME,
      })
      return false
    }

    // In BASIC, non-zero means true, zero means false
    const conditionIsTrue = conditionResult !== 0

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`IF-THEN: condition = ${conditionResult} (${conditionIsTrue ? 'true' : 'false'})`)
    }

    return conditionIsTrue
  }

  /**
   * Get the THEN clause commandList CST node from an IF-THEN statement
   * Returns undefined if THEN clause is a line number (not statements)
   */
  getThenClause(ifThenStmtCst: CstNode): CstNode | undefined {
    return getFirstCstNode(ifThenStmtCst.children.commandList)
  }

  /**
   * Check if IF-THEN has a line number (either THEN number or GOTO number)
   * Returns the line number if present, undefined otherwise
   *
   * Parser structure:
   * - IF ... THEN NumberLiteral -> children.NumberLiteral exists
   * - IF ... THEN CommandList -> children.commandList exists
   * - IF ... GOTO NumberLiteral -> children.Goto token exists, children.NumberLiteral exists
   */
  getLineNumber(ifThenStmtCst: CstNode): number | undefined {
    const lineNumberToken = getFirstToken(ifThenStmtCst.children.NumberLiteral)
    if (lineNumberToken) {
      const lineNumber = parseInt(lineNumberToken.image, 10)
      return isNaN(lineNumber) ? undefined : lineNumber
    }
    return undefined
  }

  /**
   * Check if IF-THEN uses line number jump (either THEN number or GOTO number)
   * Returns true if a line number jump should be performed
   */
  hasLineNumberJump(ifThenStmtCst: CstNode): boolean {
    // If NumberLiteral exists and commandList doesn't, it's a line number jump
    const hasNumberLiteral = !!getFirstToken(ifThenStmtCst.children.NumberLiteral)
    const hasCommandList = !!getFirstCstNode(ifThenStmtCst.children.commandList)
    return hasNumberLiteral && !hasCommandList
  }
}
