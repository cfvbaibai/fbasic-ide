/**
 * GOSUB Statement Executor
 * 
 * Handles execution of GOSUB statements from CST.
 * Calls a subroutine and pushes return address to stack.
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import { getFirstToken } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export class GosubExecutor {
  constructor(
    private context: ExecutionContext
  ) {}

  /**
   * Execute a GOSUB statement from CST
   * Jumps to the specified line number and pushes return address to stack
   */
  execute(gosubStmtCst: CstNode, lineNumber: number): void {
    const lineNumberToken = getFirstToken(gosubStmtCst.children.NumberLiteral)
    
    if (!lineNumberToken) {
      this.context.addError({
        line: lineNumber,
        message: 'GOSUB: missing line number',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    const targetLineNumber = parseInt(lineNumberToken.image, 10)
    
    if (isNaN(targetLineNumber)) {
      this.context.addError({
        line: lineNumber,
        message: `GOSUB: invalid line number: ${lineNumberToken.image}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Find the statement index for the target line number
    const targetStatementIndex = this.context.findStatementIndexByLine(targetLineNumber)
    
    if (targetStatementIndex === -1) {
      this.context.addError({
        line: lineNumber,
        message: `GOSUB: line number ${targetLineNumber} not found`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Push return address to stack (statement index after the current GOSUB statement)
    const returnStatementIndex = this.context.currentStatementIndex + 1
    this.context.gosubStack.push(returnStatementIndex)

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`GOSUB: jumping to line ${targetLineNumber} (statement index ${targetStatementIndex}), return address: ${returnStatementIndex}`)
    }

    // Jump to the target statement
    this.context.jumpToStatement(targetStatementIndex)
  }
}

