/**
 * MOVE Statement Executor
 *
 * Handles execution of MOVE statements to start animated sprite movement.
 * Grammar: MOVE n
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getCstNodes } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class MoveExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a MOVE statement from CST
   * MOVE n
   * n: action number (0-7)
   */
  execute(moveStmtCst: CstNode, lineNumber?: number): void {
    try {
      // Extract labeled expression
      const actionNumberExpr = getCstNodes(moveStmtCst.children.actionNumber)?.[0]

      if (!actionNumberExpr) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: 'MOVE: Missing action number',
          type: ERROR_TYPES.RUNTIME,
        })
        return
      }

      // Evaluate action number
      const actionNumber = this.evaluateNumber(actionNumberExpr, 'action number', lineNumber)

      if (actionNumber === null) {
        return // Error already added
      }

      // Validate range
      if (!this.validateRange(actionNumber, 0, 7, 'action number', lineNumber)) return

      // Start movement via animation manager; use device position if available (e.g. after CUT)
      if (this.context.animationManager) {
        try {
          const position = this.context.deviceAdapter?.getSpritePosition(actionNumber)
          const startX = position?.x
          const startY = position?.y
          this.context.animationManager.startMovement(actionNumber, startX, startY)
        } catch (error) {
          this.context.addError({
            line: lineNumber ?? 0,
            message: `MOVE: ${error instanceof Error ? error.message : String(error)}`,
            type: ERROR_TYPES.RUNTIME,
          })
          return
        }
      }

      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`MOVE: Started movement for action ${actionNumber}`)
      }
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `MOVE: ${error instanceof Error ? error.message : String(error)}`,
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
        message: `MOVE: Error evaluating ${paramName}: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME,
      })
      return null
    }
  }

  private validateRange(num: number, min: number, max: number, paramName: string, lineNumber?: number): boolean {
    if (num < min || num > max) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `MOVE: ${paramName} out of range (${min}-${max}), got ${num}`,
        type: ERROR_TYPES.RUNTIME,
      })
      return false
    }
    return true
  }
}
