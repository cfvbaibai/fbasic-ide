/**
 * VIEW Statement Executor
 *
 * Handles execution of VIEW statements to copy BG GRAPHIC to Background Screen.
 * Per F-BASIC Manual page 36: "Upon executing the VIEW command,
 * the BG GRAPHIC Screen will be copied to the Background Screen."
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class ViewExecutor {
  constructor(private context: ExecutionContext) {}

  /**
   * Execute a VIEW statement
   * Copies BG GRAPHIC data to the background screen via device adapter
   */
  execute(_viewStmtCst: CstNode, lineNumber: number): void {
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput('VIEW: Copying BG GRAPHIC to Background Screen')
    }

    // Copy BG data via device adapter
    if (this.context.deviceAdapter) {
      if (this.context.deviceAdapter.copyBgGraphicToBackground) {
        this.context.deviceAdapter.copyBgGraphicToBackground()
      } else {
        this.context.addError({
          line: lineNumber,
          message: 'VIEW: Device adapter does not support copyBgGraphicToBackground',
          type: ERROR_TYPES.RUNTIME,
        })
      }
    } else {
      this.context.addError({
        line: lineNumber,
        message: 'VIEW: No device adapter available',
        type: ERROR_TYPES.RUNTIME,
      })
    }
  }
}
