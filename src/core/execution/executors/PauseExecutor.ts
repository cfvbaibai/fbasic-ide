/**
 * Pause Statement Executor
 * 
 * Handles execution of PAUSE statements to delay program execution.
 */

import type { CstNode } from 'chevrotain'
import type { EvaluationContext } from '../../evaluation/ExpressionEvaluator'
import { ExpressionEvaluator } from '../../evaluation/ExpressionEvaluator'
import { getFirstCstNode } from '../../parser/cst-helpers'

export class PauseExecutor {
  constructor(
    private context: EvaluationContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a PAUSE statement from CST
   * Pauses execution for the specified duration (in milliseconds)
   */
  async execute(pauseStmtCst: CstNode): Promise<void> {
    const expressionCst = getFirstCstNode(pauseStmtCst.children.expression)
    
    if (!expressionCst) {
      throw new Error('Invalid PAUSE statement: missing expression')
    }

    // Evaluate the pause duration
    const durationValue = this.evaluator.evaluateExpression(expressionCst)
    // Convert to number (handles both numeric and string values)
    const duration = typeof durationValue === 'number' 
      ? Math.max(0, Math.floor(durationValue))
      : Math.max(0, Math.floor(parseFloat(String(durationValue)) || 0))

    // Pause for the specified duration (in milliseconds)
    // In Family BASIC, PAUSE typically pauses for frames, but we'll use milliseconds
    // for better compatibility with web environments
    if (duration > 0) {
      await new Promise(resolve => setTimeout(resolve, duration))
    }

    // Add debug output
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`PAUSE: ${duration}ms`)
    }
  }
}

