/**
 * CGEN Statement Executor
 * 
 * Handles execution of CGEN statements to set character generator mode.
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getFirstCstNode } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class CgenExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a CGEN statement from CST
   * Sets character generator mode (0-3)
   * Syntax: CGEN n
   * 
   * Mode meanings:
   * - 0: Character table A on background screen, A on sprite screen
   * - 1: Character table A on background screen, B on sprite screen
   * - 2: Character table B on background screen, A on sprite screen (default)
   * - 3: Character table B on background screen, B on sprite screen
   */
  execute(cgenStmtCst: CstNode, lineNumber?: number): void {
    // Get expression from CST (n)
    const expressionCst = getFirstCstNode(cgenStmtCst.children.expression)
    
    if (!expressionCst) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: 'CGEN: Missing mode parameter',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Evaluate mode expression
    let mode: number
    try {
      const modeValue = this.evaluator.evaluateExpression(expressionCst)
      mode = typeof modeValue === 'number'
        ? Math.floor(modeValue)
        : Math.floor(parseFloat(String(modeValue)) || 0)  
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `CGEN: Error evaluating mode: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Validate range (0-3)
    if (mode < 0 || mode > 3) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `CGEN: Mode out of range (0-3), got ${mode}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Set character generator mode via device adapter
    if (this.context.deviceAdapter) {
      this.context.deviceAdapter.setCharacterGeneratorMode(mode)
    }

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`CGEN: Character generator mode set to ${mode}`)
    }
  }
}
