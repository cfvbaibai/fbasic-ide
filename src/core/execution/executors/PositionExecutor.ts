/**
 * POSITION Statement Executor
 *
 * Handles execution of POSITION statements to set initial sprite position.
 * Grammar: POSITION n, X, Y
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getFirstCstNode } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class PositionExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a POSITION statement from CST
   * POSITION n, X, Y
   * n: action number (0-7)
   * X: X coordinate (0-255)
   * Y: Y coordinate (0-255, per F-BASIC manual)
   */
  execute(positionStmtCst: CstNode, lineNumber?: number): void {
    try {
      // Extract expressions
      const actionNumberExpr = getFirstCstNode(positionStmtCst.children.actionNumber)
      const xExpr = getFirstCstNode(positionStmtCst.children.x)
      const yExpr = getFirstCstNode(positionStmtCst.children.y)

      if (!actionNumberExpr || !xExpr || !yExpr) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: 'POSITION: Missing parameters',
          type: ERROR_TYPES.RUNTIME,
        })
        return
      }

      // Evaluate action number
      const actionNumber = this.evaluateNumber(actionNumberExpr, 'action number', lineNumber)
      if (actionNumber === null) {
        return // Error already added
      }

      // Evaluate X coordinate
      const x = this.evaluateNumber(xExpr, 'X coordinate', lineNumber)
      if (x === null) {
        return // Error already added
      }

      // Evaluate Y coordinate
      const y = this.evaluateNumber(yExpr, 'Y coordinate', lineNumber)
      if (y === null) {
        return // Error already added
      }

      // Validate ranges
      if (!this.validateRange(actionNumber, 0, 7, 'action number', lineNumber)) return
      if (!this.validateRange(x, 0, 255, 'X coordinate', lineNumber)) return
      if (!this.validateRange(y, 0, 255, 'Y coordinate', lineNumber)) return

      // Set position via animation manager
      if (this.context.animationManager) {
        try {
          this.context.animationManager.setPosition(actionNumber, x, y)
        } catch (error) {
          this.context.addError({
            line: lineNumber ?? 0,
            message: `POSITION: ${error instanceof Error ? error.message : String(error)}`,
            type: ERROR_TYPES.RUNTIME,
          })
          return
        }
      }

      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`POSITION: Set position for action ${actionNumber} to (${x}, ${y})`)
      }
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `POSITION: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME,
      })
    }
  }

  private evaluateNumber(expr: CstNode, paramName: string, lineNumber?: number): number | null {
    try {
      const value = this.evaluator.evaluateExpression(expr)
      const num = typeof value === 'number' ? Math.floor(value) : Math.floor(parseFloat(String(value)) || 0)
      return num
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `POSITION: Error evaluating ${paramName}: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME,
      })
      return null
    }
  }

  private validateRange(num: number, min: number, max: number, paramName: string, lineNumber?: number): boolean {
    if (num < min || num > max) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `POSITION: ${paramName} out of range (${min}-${max}), got ${num}`,
        type: ERROR_TYPES.RUNTIME,
      })
      return false
    }
    return true
  }
}
