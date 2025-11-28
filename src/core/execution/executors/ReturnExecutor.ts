/**
 * RETURN Statement Executor
 * 
 * Handles execution of RETURN statements from CST.
 * Returns from a subroutine by popping the return address from stack.
 * Supports optional line number to return to a specific line.
 */

import type { CstNode } from 'chevrotain'
import { ExecutionContext } from '../../state/ExecutionContext'
import { getFirstToken } from '../../parser/cst-helpers'
import { ERROR_TYPES } from '../../constants'

export class ReturnExecutor {
  constructor(
    private context: ExecutionContext
  ) {}

  /**
   * Execute a RETURN statement from CST
   * Returns from subroutine by jumping to the return address on stack
   * If line number is specified, returns to that line instead
   */
  execute(returnStmtCst: CstNode, lineNumber: number): void {
    // Check if RETURN has an optional line number
    const lineNumberToken = getFirstToken(returnStmtCst.children.NumberLiteral)
    
    if (lineNumberToken) {
      // RETURN with line number: return to that specific line
      const targetLineNumber = parseInt(lineNumberToken.image, 10)
      
      if (isNaN(targetLineNumber)) {
        this.context.addError({
          line: lineNumber,
          message: `RETURN: invalid line number: ${lineNumberToken.image}`,
          type: ERROR_TYPES.RUNTIME
        })
        return
      }

      const targetStatementIndex = this.context.findStatementIndexByLine(targetLineNumber)
      
      if (targetStatementIndex === -1) {
        this.context.addError({
          line: lineNumber,
          message: `RETURN: line number ${targetLineNumber} not found`,
          type: ERROR_TYPES.RUNTIME
        })
        return
      }

      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`RETURN: returning to line ${targetLineNumber} (statement index ${targetStatementIndex})`)
      }

      // Jump to the target statement
      this.context.jumpToStatement(targetStatementIndex)
      return
    }

    // RETURN without line number: pop return address from stack
    if (this.context.gosubStack.length === 0) {
      this.context.addError({
        line: lineNumber,
        message: 'RETURN: no GOSUB to return from',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    const returnStatementIndex = this.context.gosubStack.pop()!
    
    if (returnStatementIndex < 0 || returnStatementIndex >= this.context.statements.length) {
      this.context.addError({
        line: lineNumber,
        message: `RETURN: invalid return address: ${returnStatementIndex}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`RETURN: returning to statement index ${returnStatementIndex}`)
    }

    // Jump to the return address
    this.context.jumpToStatement(returnStatementIndex)
  }
}

