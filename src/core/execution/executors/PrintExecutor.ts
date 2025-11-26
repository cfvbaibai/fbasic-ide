/**
 * Print Statement Executor
 * 
 * Handles execution of PRINT statements from CST.
 */

import type { CstNode } from 'chevrotain'
import { IoService } from '../../services/IoService'
import { ExpressionEvaluator } from '../../evaluation/ExpressionEvaluator'
import { getFirstCstNode, getCstNodes, getFirstToken } from '../../parser/cst-helpers'

export class PrintExecutor {
  constructor(
    private ioService: IoService,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a PRINT statement from CST
   */
  execute(printStmtCst: CstNode): void {
    const printListCst = getFirstCstNode(printStmtCst.children.printList)
    
    if (!printListCst) {
      // Empty PRINT statement - print newline
      this.ioService.printValues([])
      return
    }

    const printItems = getCstNodes(printListCst.children.printItem)
    const values: Array<number | string> = []

    for (const item of printItems) {
      // Check if it's a string literal
      const strToken = getFirstToken(item.children.StringLiteral)
      if (strToken) {
        values.push(strToken.image.slice(1, -1)) // Remove quotes
      } else {
        // It's an expression
        const exprCst = getFirstCstNode(item.children.expression)
        if (exprCst) {
          const value = this.evaluator.evaluateExpression(exprCst)
          values.push(value)
        }
      }
    }

    this.ioService.printValues(values)
  }
}
