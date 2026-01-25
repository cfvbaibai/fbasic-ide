/**
 * SPRITE ON/OFF Statement Executor
 *
 * Handles execution of SPRITE ON/OFF statements to enable/disable sprite display.
 * Grammar: SPRITE ON | SPRITE OFF
 */

import type { CstNode } from 'chevrotain'
import type { ExecutionContext } from '../../state/ExecutionContext'
import { getFirstToken } from '../../parser/cst-helpers'
import { ERROR_TYPES } from '../../constants'

export class SpriteOnOffExecutor {
  constructor(private context: ExecutionContext) {}

  /**
   * Execute a SPRITE ON/OFF statement from CST
   * SPRITE ON - Enable sprite display
   * SPRITE OFF - Disable sprite display
   */
  execute(spriteOnOffStmtCst: CstNode, lineNumber?: number): void {
    try {
      // Get the ON or OFF token
      const onOffToken = getFirstToken(spriteOnOffStmtCst.children.onOff)

      if (!onOffToken) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: 'SPRITE: Expected ON or OFF',
          type: ERROR_TYPES.RUNTIME
        })
        return
      }

      const isOn = onOffToken.image.toUpperCase() === 'ON'

      // Set sprite enabled state in context
      if (this.context.spriteStateManager) {
        this.context.spriteStateManager.setSpriteEnabled(isOn)
      }

      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`SPRITE: Display ${isOn ? 'enabled' : 'disabled'}`)
      }
    } catch (error) {
      this.context.addError({
        line: lineNumber ?? 0,
        message: `SPRITE ON/OFF: ${error instanceof Error ? error.message : String(error)}`,
        type: ERROR_TYPES.RUNTIME
      })
    }
  }
}
