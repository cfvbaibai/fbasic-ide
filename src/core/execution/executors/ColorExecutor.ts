/**
 * COLOR Statement Executor
 * 
 * Handles execution of COLOR statements to set color pattern for screen areas.
 */

import type { CstNode } from 'chevrotain'
import type { ExecutionContext } from '../../state/ExecutionContext'
import type { ExpressionEvaluator } from '../../evaluation/ExpressionEvaluator'
import { getCstNodes } from '../../parser/cst-helpers'
import { ERROR_TYPES, SCREEN_DIMENSIONS, COLOR_PATTERNS } from '../../constants'

export class ColorExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a COLOR statement from CST
   * Sets color pattern for a 2×2 character area containing position (X, Y)
   * X: Horizontal column (0 to 27)
   * Y: Vertical line (0 to 23)
   * n: Color pattern number (0 to 3)
   */
  execute(colorStmtCst: CstNode, lineNumber?: number): void {
    // Get expressions from CST (X, Y, and color pattern number)
    const expressions = getCstNodes(colorStmtCst.children.expression)
    
    if (expressions.length < 3) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: 'COLOR: Expected three arguments (X, Y, n)',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    const xExprCst = expressions[0]
    const yExprCst = expressions[1]
    const patternExprCst = expressions[2]

    if (!xExprCst || !yExprCst || !patternExprCst) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: 'COLOR: Invalid arguments',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Evaluate X, Y coordinates and color pattern number
    let x: number
    let y: number
    let pattern: number

    try {
      const xValue = this.evaluator.evaluateExpression(xExprCst)
      const yValue = this.evaluator.evaluateExpression(yExprCst)
      const patternValue = this.evaluator.evaluateExpression(patternExprCst)

      // Convert to numbers (handle both numeric and string values)
      x = typeof xValue === 'number'
        ? Math.floor(xValue)
        : Math.floor(parseFloat(String(xValue)) || 0)  

      y = typeof yValue === 'number'
        ? Math.floor(yValue)
        : Math.floor(parseFloat(String(yValue)) || 0)  

      pattern = typeof patternValue === 'number'
        ? Math.floor(patternValue)
        : Math.floor(parseFloat(String(patternValue)) || 0)  
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `COLOR: Error evaluating arguments: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Validate ranges
    // X: 0 to MAX_X (COLUMNS)
    // Y: 0 to MAX_Y (LINES)
    // Pattern: 0 to MAX (color pattern numbers)
    if (x < 0 || x > SCREEN_DIMENSIONS.BACKGROUND.MAX_X) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `COLOR: X coordinate out of range (0-${SCREEN_DIMENSIONS.BACKGROUND.MAX_X}), got ${x}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    if (y < 0 || y > SCREEN_DIMENSIONS.BACKGROUND.MAX_Y) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `COLOR: Y coordinate out of range (0-${SCREEN_DIMENSIONS.BACKGROUND.MAX_Y}), got ${y}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    if (pattern < COLOR_PATTERNS.MIN || pattern > COLOR_PATTERNS.MAX) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `COLOR: Color pattern number out of range (${COLOR_PATTERNS.MIN}-${COLOR_PATTERNS.MAX}), got ${pattern}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Set color pattern via device adapter
    if (this.context.deviceAdapter) {
      this.context.deviceAdapter.setColorPattern(x, y, pattern)
    }

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`COLOR: Color pattern ${pattern} set for area containing (${x}, ${y})`)
    }
  }
}
