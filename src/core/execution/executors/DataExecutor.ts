/**
 * DATA Statement Executor
 * 
 * Handles DATA statement execution for storing data values.
 * DATA statements are preprocessed before execution, so this executor
 * is mainly used during preprocessing phase.
 */

import type { CstNode } from 'chevrotain'
import type { DataService } from '../../services/DataService'
import { getFirstCstNode, getCstNodes } from '../../parser/cst-helpers'

export class DataExecutor {
  constructor(private dataService: DataService) {}

  /**
   * Execute DATA statement (preprocessing phase)
   * DATA DataConstantList
   */
  execute(cst: CstNode): void {
    const dataConstantListCst = getFirstCstNode(cst.children.dataConstantList)
    if (!dataConstantListCst) {
      return // Empty DATA statement
    }
    
    const constants = getCstNodes(dataConstantListCst.children.dataConstant)
    this.dataService.addDataValuesCst(constants)
  }
}

