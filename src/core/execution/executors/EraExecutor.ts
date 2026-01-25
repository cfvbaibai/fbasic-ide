/**
 * ERA Statement Executor
 *
 * Handles execution of ERA statements to erase sprites.
 * Grammar: ERA n1[, n2, ...]
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getCstNodes, getFirstCstNode } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class EraExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute an ERA statement from CST
   * ERA n1[, n2, ...]
   * n: action numbers (0-7)
   */
  execute(eraStmtCst: CstNode, lineNumber?: number): void {
    try {
      // Extract expression list (action numbers)
      const expressionListCst = getFirstCstNode(eraStmtCst.children.actionNumbers)

      if (!expressionListCst) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: 'ERA: Missing action numbers',
          type: ERROR_TYPES.RUNTIME,
        })
        return
      }

      // Evaluate all action numbers
      const expressions = getCstNodes(expressionListCst.children.expression)
      const actionNumbers: number[] = []

      for (const exprCst of expressions) {
        const actionNumber = this.evaluateNumber(exprCst, lineNumber)
        if (actionNumber === null) {
          return // Error already added
        }

        // Validate range
        if (!this.validateRange(actionNumber, 0, 7, lineNumber)) {
          return // Error already added
        }

        actionNumbers.push(actionNumber)
      }

      if (actionNumbers.length === 0) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: 'ERA: At least one action number required',
          type: ERROR_TYPES.RUNTIME,
        })
        return
      }

      // Erase movements via animation manager
      if (this.context.animationManager) {
        try {
          this.context.animationManager.eraseMovement(actionNumbers)
        } catch (error) {
          this.context.addError({
            line: lineNumber ?? 0,
            message: `ERA: ${error instanceof Error ? error.message : String(error)}`,
            type: ERROR_TYPES.RUNTIME,
          })
          return
        }
      }

      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`ERA: Erased movements for actions ${actionNumbers.join(', ')}`)
      }
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `ERA: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME,
      })
    }
  }

  private evaluateNumber(expr: CstNode, lineNumber?: number): number | null {
    try {
      const value = this.evaluator.evaluateExpression(expr)
      const num = typeof value === 'number' ? Math.floor(value) : Math.floor(parseFloat(String(value)) || 0)
      return num
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `ERA: Error evaluating action number: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME,
      })
      return null
    }
  }

  private validateRange(num: number, min: number, max: number, lineNumber?: number): boolean {
    if (num < min || num > max) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `ERA: Action number out of range (${min}-${max}), got ${num}`,
        type: ERROR_TYPES.RUNTIME,
      })
      return false
    }
    return true
  }
}
