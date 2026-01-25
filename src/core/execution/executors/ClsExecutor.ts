/**
 * CLS Statement Executor
 *
 * Handles execution of CLS statements to clear the screen.
 */

import type { CstNode } from 'chevrotain'

import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class ClsExecutor {
  constructor(private context: ExecutionContext) {}

  /**
   * Execute a CLS statement from CST
   * Clears the background screen
   */
  execute(_clsStmtCst: CstNode): void {
    // Clear screen via device adapter
    if (this.context.deviceAdapter) {
      this.context.deviceAdapter.clearScreen()
    }

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput('CLS: Screen cleared')
    }
  }
}
