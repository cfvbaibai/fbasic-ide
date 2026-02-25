/**
 * BEEP Statement Executor
 *
 * Handles execution of BEEP statements to produce a beep sound.
 * Reference: F-BASIC Manual page 80
 */

import type { CstNode } from 'chevrotain'

import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class BeepExecutor {
  constructor(private context: ExecutionContext) {}

  /**
   * Execute a BEEP statement from CST
   * Produces a 'beep' type of sound
   * Per F-BASIC Manual page 80: "Outputs a 'beep' type of sound"
   */
  execute(_beepStmtCst: CstNode): void {
    // Play beep via device adapter
    if (this.context.deviceAdapter?.beep) {
      this.context.deviceAdapter.beep()
    }

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput('BEEP: Sound played')
    }
  }
}
