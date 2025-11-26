/**
 * Let Statement Executor
 * 
 * Handles execution of LET statements for variable assignment from CST.
 */

import type { CstNode } from 'chevrotain'
import { VariableService } from '../../services/VariableService'
import { getFirstToken, getFirstCstNode } from '../../parser/cst-helpers'

export class LetExecutor {
  constructor(private variableService: VariableService) {}

  /**
   * Execute a LET statement from CST
   */
  execute(letStmtCst: CstNode): void {
    const identifierToken = getFirstToken(letStmtCst.children.Identifier)
    const expressionCst = getFirstCstNode(letStmtCst.children.expression)

    if (!identifierToken || !expressionCst) {
      throw new Error('Invalid LET statement: missing identifier or expression')
    }

    const varName = identifierToken.image.toUpperCase()

    // For now, we only support simple variables (no array subscripts)
    // Array support can be added later by checking for LParen after Identifier
    this.variableService.setVariableFromExpressionCst(varName, expressionCst)

    // Add debug output
    if (this.variableService.context.config.enableDebugMode) {
      const value = this.variableService.evaluator.evaluateExpression(expressionCst)
      this.variableService.context.addDebugOutput(`LET: ${varName} = ${value}`)
    }
  }
}
