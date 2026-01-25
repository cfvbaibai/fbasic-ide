/**
 * DATA Statement Executor
 *
 * Handles DATA statement execution for storing data values.
 * DATA statements are preprocessed before execution, so this executor
 * is mainly used during preprocessing phase.
 */

import type { CstNode } from 'chevrotain'

import { getCstNodes, getFirstCstNode } from '@/core/parser/cst-helpers'
import type { DataService } from '@/core/services/DataService'

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
