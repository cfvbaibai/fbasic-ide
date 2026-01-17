/**
 * End Statement Executor
 * 
 * Handles execution of END statements to terminate program execution.
 */

import type { CstNode } from 'chevrotain'
import type { ExecutionContext } from '../../state/ExecutionContext'

export class EndExecutor {
  constructor(private context: ExecutionContext) {}

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

