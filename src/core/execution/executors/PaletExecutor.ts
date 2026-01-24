/**
 * PALET Statement Executor
 * 
 * Handles execution of PALET statements to set color codes for color combinations.
 * Supports both PALET B (background/backdrop) and PALET S (sprites).
 */

import type { CstNode } from 'chevrotain'
import type { ExecutionContext } from '../../state/ExecutionContext'
import type { ExpressionEvaluator } from '../../evaluation/ExpressionEvaluator'
import { getCstNodes, getFirstToken, getFirstCstNode } from '../../parser/cst-helpers'
import { ERROR_TYPES } from '../../constants'

export class PaletExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a PALET statement from CST
   * Sets color codes for color combination n (0-3)
   * Syntax: PALET {B|S} n, C1, C2, C3, C4
   * or: PALETB n, C1, C2, C3, C4 (background, no space)
   * or: PALETS n, C1, C2, C3, C4 (sprites, no space)
   * 
   * When target is B and n=0, C1 is the backdrop color.
   * C1, C2, C3, C4 are color codes (0-60).
   */
  execute(paletStmtCst: CstNode, lineNumber?: number): void {
    // Determine target (B or S)
    let target: 'B' | 'S' = 'B'
    
    // Check if this is PALETB or PALETS (no space form)
    const paletbToken = paletStmtCst.children.Paletb?.[0]
    const paletsToken = paletStmtCst.children.Palets?.[0]
    const paletToken = paletStmtCst.children.Palet?.[0]
    
    if (paletbToken) {
      // PALETB form (background, no space)
      target = 'B'
    } else if (paletsToken) {
      // PALETS form (sprites, no space)
      target = 'S'
    } else if (paletToken) {
      // PALET B or PALET S form (with space)
      // Get the identifier token (B or S)
      const targetToken = getFirstToken(paletStmtCst.children.target)
      if (targetToken) {
        const targetStr = targetToken.image.toUpperCase()
        if (targetStr === 'B') {
          target = 'B'
        } else if (targetStr === 'S') {
          target = 'S'
        } else {
          this.context.addError({
            line: lineNumber || 0,
            message: `PALET: Invalid target, expected B or S, got ${targetStr}`,
            type: ERROR_TYPES.RUNTIME
          })
          return
        }
      } else {
        this.context.addError({
          line: lineNumber || 0,
          message: 'PALET: Missing target (B or S)',
          type: ERROR_TYPES.RUNTIME
        })
        return
      }
    } else {
      this.context.addError({
        line: lineNumber || 0,
        message: 'PALET: Invalid statement format',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Get expressions from paletParameterList subrule
    const paletParameterListCst = getFirstCstNode(paletStmtCst.children.paletParameterList)
    if (!paletParameterListCst) {
      this.context.addError({
        line: lineNumber || 0,
        message: 'PALET: Missing parameter list',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    const expressions = getCstNodes(paletParameterListCst.children.expression)
    
    // Validate we have 5 expressions: n, C1, C2, C3, C4
    if (expressions.length < 5) {
      this.context.addError({
        line: lineNumber || 0,
        message: 'PALET: Expected 5 arguments (n, C1, C2, C3, C4)',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    const nExprCst = expressions[0]
    const c1ExprCst = expressions[1]
    const c2ExprCst = expressions[2]
    const c3ExprCst = expressions[3]
    const c4ExprCst = expressions[4]

    if (!nExprCst || !c1ExprCst || !c2ExprCst || !c3ExprCst || !c4ExprCst) {
      this.context.addError({
        line: lineNumber || 0,
        message: 'PALET: Invalid arguments',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Evaluate all expressions
    let n: number
    let c1: number
    let c2: number
    let c3: number
    let c4: number

    try {
      const nValue = this.evaluator.evaluateExpression(nExprCst)
      const c1Value = this.evaluator.evaluateExpression(c1ExprCst)
      const c2Value = this.evaluator.evaluateExpression(c2ExprCst)
      const c3Value = this.evaluator.evaluateExpression(c3ExprCst)
      const c4Value = this.evaluator.evaluateExpression(c4ExprCst)

      // Convert to numbers
      n = typeof nValue === 'number'
        ? Math.floor(nValue)
        : Math.floor(parseFloat(String(nValue)) || 0)
      
      c1 = typeof c1Value === 'number'
        ? Math.floor(c1Value)
        : Math.floor(parseFloat(String(c1Value)) || 0)
      
      c2 = typeof c2Value === 'number'
        ? Math.floor(c2Value)
        : Math.floor(parseFloat(String(c2Value)) || 0)
      
      c3 = typeof c3Value === 'number'
        ? Math.floor(c3Value)
        : Math.floor(parseFloat(String(c3Value)) || 0)
      
      c4 = typeof c4Value === 'number'
        ? Math.floor(c4Value)
        : Math.floor(parseFloat(String(c4Value)) || 0)
    } catch (error) {
      this.context.addError({
        line: lineNumber || 0,
        message: `PALET: Error evaluating arguments: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Validate ranges
    // n: 0 to 3 (color combination number)
    if (n < 0 || n > 3) {
      this.context.addError({
        line: lineNumber || 0,
        message: `PALET: Color combination number out of range (0-3), got ${n}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // C1, C2, C3, C4: 0 to 60 (color codes)
    if (c1 < 0 || c1 > 60 || c2 < 0 || c2 > 60 || c3 < 0 || c3 > 60 || c4 < 0 || c4 > 60) {
      this.context.addError({
        line: lineNumber || 0,
        message: `PALET: Color code out of range (0-60), got C1=${c1}, C2=${c2}, C3=${c3}, C4=${c4}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Handle PALET B with n=0: set backdrop color
    if (target === 'B' && n === 0) {
      // C1 is the backdrop color when n=0
      if (this.context.deviceAdapter) {
        this.context.deviceAdapter.setBackdropColor(c1)
      }

      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`PALET B: Set backdrop color to ${c1} (color combination 0)`)
      }
    } else {
      // For other cases (PALET S, or PALET B with n != 0), we would store palette colors
      // This is a placeholder for future implementation
      // For now, we'll just log it in debug mode
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(
          `PALET ${target}: Set color combination ${n} to C1=${c1}, C2=${c2}, C3=${c3}, C4=${c4} (not yet fully implemented)`
        )
      }
    }
  }
}
