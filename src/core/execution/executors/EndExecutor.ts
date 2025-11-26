/**
 * End Statement Executor
 * 
 * Handles execution of END statements to terminate program execution.
 */

import type { CstNode } from 'chevrotain'
import type { EvaluationContext } from '../../evaluation/ExpressionEvaluator'

export class EndExecutor {
  constructor(private context: EvaluationContext) {}

  /**
   * Execute an END statement from CST
   * Stops program execution immediately
   */
  execute(_endStmtCst: CstNode): void {
    // Stop execution
    this.context.shouldStop = true
    this.context.isRunning = false

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput('END: Program terminated')
    }
  }
}

