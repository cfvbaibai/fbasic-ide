/**
 * SPRITE Statement Executor
 *
 * Handles execution of SPRITE statements to display sprites at specified positions.
 * Grammar: SPRITE n, X, Y
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getCstNodes } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

// Sprite screen dimensions
const SPRITE_SCREEN = {
  MAX_X: 255,
  MAX_Y: 239
}

export class SpriteExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a SPRITE statement from CST
   * SPRITE n, X, Y
   * n: sprite number (0-7)
   * X: pixel X coordinate (0-255)
   * Y: pixel Y coordinate (0-239)
   */
  execute(spriteStmtCst: CstNode, lineNumber?: number): void {
    try {
      // Extract labeled expressions
      const spriteNumberExpr = getCstNodes(spriteStmtCst.children.spriteNumber)?.[0]
      const xExpr = getCstNodes(spriteStmtCst.children.x)?.[0]
      const yExpr = getCstNodes(spriteStmtCst.children.y)?.[0]

      if (!spriteNumberExpr || !xExpr || !yExpr) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: 'SPRITE: Missing required parameters (n, X, Y)',
          type: ERROR_TYPES.RUNTIME
        })
        return
      }

      // Evaluate parameters
      const spriteNumber = this.evaluateNumber(spriteNumberExpr, 'sprite number', lineNumber)
      const x = this.evaluateNumber(xExpr, 'X coordinate', lineNumber)
      const y = this.evaluateNumber(yExpr, 'Y coordinate', lineNumber)

      if (spriteNumber === null || x === null || y === null) {
        return // Error already added
      }

      // Validate ranges
      if (!this.validateSpriteNumber(spriteNumber, lineNumber)) return
      if (!this.validateCoordinate(x, SPRITE_SCREEN.MAX_X, 'X', lineNumber)) return
      if (!this.validateCoordinate(y, SPRITE_SCREEN.MAX_Y, 'Y', lineNumber)) return

      // Display sprite via sprite state manager
      if (this.context.spriteStateManager) {
        try {
          this.context.spriteStateManager.displaySprite(spriteNumber, x, y)
        } catch (error) {
          this.context.addError({
            line: lineNumber ?? 0,
            message: `SPRITE: ${error instanceof Error ? error.message : String(error)}`,
            type: ERROR_TYPES.RUNTIME
          })
          return
        }
      }

      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`SPRITE: Displayed sprite ${spriteNumber} at (${x}, ${y})`)
      }
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `SPRITE: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME
      })
    }
  }

  private evaluateNumber(expr: CstNode, paramName: string, lineNumber?: number): number | null {
    try {
      const value = this.evaluator.evaluateExpression(expr)
      const num = typeof value === 'number'
        ? Math.floor(value)
        : Math.floor(parseFloat(String(value)) || 0)
      return num
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `SPRITE: Error evaluating ${paramName}: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME
      })
      return null
    }
  }

  private validateSpriteNumber(num: number, lineNumber?: number): boolean {
    if (num < 0 || num > 7) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `SPRITE: Sprite number out of range (0-7), got ${num}`,
        type: ERROR_TYPES.RUNTIME
      })
      return false
    }
    return true
  }

  private validateCoordinate(coord: number, max: number, axis: string, lineNumber?: number): boolean {
    if (coord < 0 || coord > max) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `SPRITE: ${axis} coordinate out of range (0-${max}), got ${coord}`,
        type: ERROR_TYPES.RUNTIME
      })
      return false
    }
    return true
  }
}
