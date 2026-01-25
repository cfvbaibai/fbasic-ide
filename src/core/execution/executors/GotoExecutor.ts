/**
 * GOTO Statement Executor
 * 
 * Handles execution of GOTO statements from CST.
 * Jumps to the specified line number.
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import { getFirstToken } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class GotoExecutor {
  constructor(
    private context: ExecutionContext
  ) {}

  /**
   * Execute a GOTO statement from CST
   * Jumps to the specified line number
   */
  execute(gotoStmtCst: CstNode, lineNumber: number): void {
    const lineNumberToken = getFirstToken(gotoStmtCst.children.NumberLiteral)
    
    if (!lineNumberToken) {
      this.context.addError({
        line: lineNumber,
        message: 'GOTO: missing line number',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    const targetLineNumber = parseInt(lineNumberToken.image, 10)
    
    if (isNaN(targetLineNumber)) {
      this.context.addError({
        line: lineNumber,
        message: `GOTO: invalid line number: ${lineNumberToken.image}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Find the statement index for the target line number
    const targetStatementIndex = this.context.findStatementIndexByLine(targetLineNumber)
    
    if (targetStatementIndex === -1) {
      this.context.addError({
        line: lineNumber,
        message: `GOTO: line number ${targetLineNumber} not found`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`GOTO: jumping to line ${targetLineNumber} (statement index ${targetStatementIndex})`)
    }

    // Jump to the target statement
    this.context.jumpToStatement(targetStatementIndex)
  }
}

