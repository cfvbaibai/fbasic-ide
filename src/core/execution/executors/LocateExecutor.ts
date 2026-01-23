/**
 * LOCATE Statement Executor
 * 
 * Handles execution of LOCATE statements to set cursor position.
 */

import type { CstNode } from 'chevrotain'
import type { ExecutionContext } from '../../state/ExecutionContext'
import type { ExpressionEvaluator } from '../../evaluation/ExpressionEvaluator'
import { getCstNodes } from '../../parser/cst-helpers'
import { ERROR_TYPES } from '../../constants'

export class LocateExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a LOCATE statement from CST
   * Sets cursor position to (X, Y)
   * X: Horizontal column (0 to 27)
   * Y: Vertical line (0 to 23)
   */
  execute(locateStmtCst: CstNode, lineNumber?: number): void {
    // Get expressions from CST (X and Y coordinates)
    const expressions = getCstNodes(locateStmtCst.children.expression)
    
    if (expressions.length < 2) {
      this.context.addError({
        line: lineNumber || 0,
        message: 'LOCATE: Expected two arguments (X, Y)',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    const xExprCst = expressions[0]
    const yExprCst = expressions[1]

    if (!xExprCst || !yExprCst) {
      this.context.addError({
        line: lineNumber || 0,
        message: 'LOCATE: Invalid arguments',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Evaluate X and Y coordinates
    let x: number
    let y: number

    try {
      const xValue = this.evaluator.evaluateExpression(xExprCst)
      const yValue = this.evaluator.evaluateExpression(yExprCst)

      // Convert to numbers (handle both numeric and string values)
      x = typeof xValue === 'number' 
        ? Math.floor(xValue)
        : Math.floor(parseFloat(String(xValue)) || 0)
      
      y = typeof yValue === 'number'
        ? Math.floor(yValue)
        : Math.floor(parseFloat(String(yValue)) || 0)
    } catch (error) {
      this.context.addError({
        line: lineNumber || 0,
        message: `LOCATE: Error evaluating coordinates: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Validate ranges
    // X: 0 to 27 (28 columns)
    // Y: 0 to 23 (24 lines)
    if (x < 0 || x > 27) {
      this.context.addError({
        line: lineNumber || 0,
        message: `LOCATE: X coordinate out of range (0-27), got ${x}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    if (y < 0 || y > 23) {
      this.context.addError({
        line: lineNumber || 0,
        message: `LOCATE: Y coordinate out of range (0-23), got ${y}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Set cursor position via device adapter
    if (this.context.deviceAdapter) {
      this.context.deviceAdapter.setCursorPosition(x, y)
    }

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`LOCATE: Cursor set to (${x}, ${y})`)
    }
  }
}
