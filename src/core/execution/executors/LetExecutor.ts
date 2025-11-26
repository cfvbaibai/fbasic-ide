/**
 * Let Statement Executor
 * 
 * Handles execution of LET statements for variable assignment from CST.
 * Supports both simple variables and array elements.
 */

import type { CstNode } from 'chevrotain'
import { VariableService } from '../../services/VariableService'
import { getFirstToken, getFirstCstNode, getCstNodes } from '../../parser/cst-helpers'
import type { BasicScalarValue } from '../../types/BasicTypes'

export class LetExecutor {
  constructor(private variableService: VariableService) {}

  /**
   * Execute a LET statement from CST
   * Supports: LET X = 5, LET A(0) = 10, LET A$(I, J) = "Hello"
   */
  execute(letStmtCst: CstNode): void {
    const expressionCst = getFirstCstNode(letStmtCst.children.expression)
    if (!expressionCst) {
      throw new Error('Invalid LET statement: missing expression')
    }

    // Check if this is an array assignment or simple variable assignment
    const arrayAccessCst = getFirstCstNode(letStmtCst.children.arrayAccess)
    
    if (arrayAccessCst) {
      // Array element assignment: LET A(I) = value
      const identifierToken = getFirstToken(arrayAccessCst.children.Identifier)
      const expressionListCst = getFirstCstNode(arrayAccessCst.children.expressionList)
      
      if (!identifierToken || !expressionListCst) {
        throw new Error('Invalid LET statement: invalid array access')
      }

      const arrayName = identifierToken.image.toUpperCase()
      const indexExpressions = getCstNodes(expressionListCst.children.expression)
      
      // Evaluate indices
      const indices = indexExpressions.map(exprCst => {
        const indexValue = this.variableService.evaluator.evaluateExpression(exprCst)
        if (typeof indexValue !== 'number') {
          throw new Error(`Invalid array index: expected number, got ${typeof indexValue}`)
        }
        return Math.floor(indexValue)
      })

      // Evaluate value expression
      const value = this.variableService.evaluator.evaluateExpression(expressionCst)
      const basicValue: BasicScalarValue = typeof value === 'string' ? value : Math.floor(value)

      // Set array element
      this.variableService.setArrayElement(arrayName, indices, basicValue)

      // Add debug output
      if (this.variableService.context.config.enableDebugMode) {
        this.variableService.context.addDebugOutput(`LET: ${arrayName}(${indices.join(', ')}) = ${basicValue}`)
      }
    } else {
      // Simple variable assignment: LET X = value
      const identifierToken = getFirstToken(letStmtCst.children.Identifier)
      if (!identifierToken) {
        throw new Error('Invalid LET statement: missing identifier')
      }

      const varName = identifierToken.image.toUpperCase()
      this.variableService.setVariableFromExpressionCst(varName, expressionCst)

      // Add debug output
      if (this.variableService.context.config.enableDebugMode) {
        const value = this.variableService.evaluator.evaluateExpression(expressionCst)
        this.variableService.context.addDebugOutput(`LET: ${varName} = ${value}`)
      }
    }
  }
}
