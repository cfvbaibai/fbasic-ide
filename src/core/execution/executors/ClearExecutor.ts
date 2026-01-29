/**
 * CLEAR Statement Executor
 *
 * Handles CLEAR statement execution: clears all variables and arrays.
 * Optional address (e.g. CLEAR &H7600) is ignored in the emulator (no memory map).
 */

import type { CstNode } from 'chevrotain'

import type { VariableService } from '@/core/services/VariableService'

export class ClearExecutor {
  constructor(private variableService: VariableService) {}

  /**
   * Execute CLEAR statement
   * CLEAR (expression)? — clears variables and arrays; address if present is ignored
   */
  execute(_clearStmtCst: CstNode): void {
    this.variableService.clearVariables()
    this.variableService.clearArrays()

    if (this.variableService.context.config.enableDebugMode) {
      this.variableService.context.addDebugOutput('CLEAR: variables and arrays cleared')
    }
  }
}
