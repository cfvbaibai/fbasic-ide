/**
 * Pause Statement Executor
 * 
 * Handles execution of PAUSE statements to delay program execution.
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES, TIMING } from '@/core/constants'
import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getFirstCstNode } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class PauseExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a PAUSE statement from CST
   * Pauses execution for the specified number of frames
   * In Family BASIC, PAUSE uses frames (1 frame = ~1/30 second = ~33.33ms)
   */
  async execute(pauseStmtCst: CstNode): Promise<void> {
    const expressionCst = getFirstCstNode(pauseStmtCst.children.expression)
    
    if (!expressionCst) {
      this.context.addError({
        line: 0,
        message: 'Invalid PAUSE statement: missing expression',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Evaluate the pause duration (in frames)
    const durationValue = this.evaluator.evaluateExpression(expressionCst)
    // Convert to number (handles both numeric and string values)
    const frames = typeof durationValue === 'number'
      ? Math.max(0, Math.floor(durationValue))
      : Math.max(0, Math.floor(parseFloat(String(durationValue)) || 0))  

    // Convert frames to milliseconds (1 frame = 1000/30 ms = ~33.33ms)
    const durationMs = frames * TIMING.FRAME_DURATION_MS

    if (durationMs > 0) {
      await new Promise(resolve => setTimeout(resolve, durationMs))
    }

    // Add debug output
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`PAUSE: ${frames} frames (${Math.round(durationMs)}ms)`)
    }
  }
}

