/**
 * Print Statement Executor
 * 
 * Handles execution of PRINT statements.
 */

import type { PrintStatementNode } from '../../parser/ast-types'
import { IoService } from '../../services/IoService'

export class PrintExecutor {
  constructor(private ioService: IoService) {}

  /**
   * Execute a PRINT statement
   */
  execute(printStmt: PrintStatementNode): void {
    this.ioService.printValues(printStmt.printList || [])
  }
}
