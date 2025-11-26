/**
 * RESTORE Statement Executor
 * 
 * Handles RESTORE statement execution for resetting the data pointer.
 */

import type { CstNode } from 'chevrotain'
import { DataService } from '../../services/DataService'
import { getFirstToken } from '../../parser/cst-helpers'

export class RestoreExecutor {
  constructor(private dataService: DataService) {}

  /**
   * Execute RESTORE statement
   * RESTORE (NumberLiteral)?
   */
  execute(cst: CstNode): void {
    const numberLiteralToken = getFirstToken(cst.children.NumberLiteral)
    
    if (numberLiteralToken) {
      // RESTORE with line number
      const lineNumber = parseInt(numberLiteralToken.image, 10)
      this.dataService.restoreData(lineNumber)
    } else {
      // RESTORE without line number (reset to beginning)
      this.dataService.restoreData()
    }
  }
}

