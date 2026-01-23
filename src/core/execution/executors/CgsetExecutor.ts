/**
 * CGSET Statement Executor
 * 
 * Handles execution of CGSET statements to set color palette for background and sprites.
 */

import type { CstNode } from 'chevrotain'
import type { ExecutionContext } from '../../state/ExecutionContext'
import type { ExpressionEvaluator } from '../../evaluation/ExpressionEvaluator'
import { getCstNodes } from '../../parser/cst-helpers'
import { ERROR_TYPES } from '../../constants'

export class CgsetExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a CGSET statement from CST
   * Sets color palette for background and/or sprites
   * m: Background palette code (0 to 1), optional (default: 1)
   * n: Sprite palette code (0 to 2), optional (default: 1)
   * Syntax: CGSET [m][,n]
   */
  execute(cgsetStmtCst: CstNode, lineNumber?: number): void {
    // Get expressions from CST (m and/or n)
    // The parser rule allows both parameters to be optional
    const expressions = getCstNodes(cgsetStmtCst.children.expression)
    
    // Both parameters are optional
    // Default values: m=1, n=1 (from manual page 72)
    let bgPalette: number | undefined = undefined
    let spritePalette: number | undefined = undefined

    // Evaluate first parameter (m) if present
    if (expressions.length >= 1) {
      const mExprCst = expressions[0]
      if (mExprCst) {
        try {
          const mValue = this.evaluator.evaluateExpression(mExprCst)
          bgPalette = typeof mValue === 'number'
            ? Math.floor(mValue)
            : Math.floor(parseFloat(String(mValue)) || 0)
        } catch (error) {
          this.context.addError({
            line: lineNumber || 0,
            message: `CGSET: Error evaluating background palette code: ${error instanceof Error ? error.message : String(error)}`,
            type: ERROR_TYPES.RUNTIME
          })
          return
        }
      }
    }

    // Evaluate second parameter (n) if present
    if (expressions.length >= 2) {
      const nExprCst = expressions[1]
      if (nExprCst) {
        try {
          const nValue = this.evaluator.evaluateExpression(nExprCst)
          spritePalette = typeof nValue === 'number'
            ? Math.floor(nValue)
            : Math.floor(parseFloat(String(nValue)) || 0)
        } catch (error) {
          this.context.addError({
            line: lineNumber || 0,
            message: `CGSET: Error evaluating sprite palette code: ${error instanceof Error ? error.message : String(error)}`,
            type: ERROR_TYPES.RUNTIME
          })
          return
        }
      }
    }

    // Apply default values if not provided
    const finalBgPalette = bgPalette !== undefined ? bgPalette : 1
    const finalSpritePalette = spritePalette !== undefined ? spritePalette : 1

    // Validate ranges
    // Background palette: 0 to 1
    if (bgPalette !== undefined && (bgPalette < 0 || bgPalette > 1)) {
      this.context.addError({
        line: lineNumber || 0,
        message: `CGSET: Background palette code out of range (0-1), got ${bgPalette}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Sprite palette: 0 to 2
    if (spritePalette !== undefined && (spritePalette < 0 || spritePalette > 2)) {
      this.context.addError({
        line: lineNumber || 0,
        message: `CGSET: Sprite palette code out of range (0-2), got ${spritePalette}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Set color palette via device adapter
    if (this.context.deviceAdapter) {
      // Only update the parameters that were provided
      // If both are undefined, use defaults (1, 1)
      this.context.deviceAdapter.setColorPalette(finalBgPalette, finalSpritePalette)
    }

    if (this.context.config.enableDebugMode) {
      const bgStr = bgPalette !== undefined ? String(bgPalette) : 'default(1)'
      const spriteStr = spritePalette !== undefined ? String(spritePalette) : 'default(1)'
      this.context.addDebugOutput(`CGSET: Background palette=${bgStr}, Sprite palette=${spriteStr}`)
    }
  }
}
