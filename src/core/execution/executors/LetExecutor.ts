/**
 * Let Statement Executor
 * 
 * Handles execution of LET statements for variable assignment from CST.
 * Supports both simple variables and array elements.
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import { getCstNodes,getFirstCstNode, getFirstToken } from '@/core/parser/cst-helpers'
import type { VariableService } from '@/core/services/VariableService'
import type { BasicScalarValue } from '@/core/types/BasicTypes'

export class LetExecutor {
  constructor(private variableService: VariableService) {}

  /**
   * Execute a LET statement from CST
   * Supports: LET X = 5, LET A(0) = 10, LET A$(I, J) = "Hello"
   */
  execute(letStmtCst: CstNode): void {
    // Check if this is an array assignment or simple variable assignment
    const arrayAccessCst = getFirstCstNode(letStmtCst.children.arrayAccess)
    
    if (arrayAccessCst) {
      // Array element assignment: LET A(I) = value
      const identifierToken = getFirstToken(arrayAccessCst.children.Identifier)
      const expressionListCst = getFirstCstNode(arrayAccessCst.children.expressionList)
      
      if (!identifierToken || !expressionListCst) {
        this.variableService.context.addError({
          line: 0,
          message: 'Invalid LET statement: invalid array access',
          type: ERROR_TYPES.RUNTIME
        })
        return
      }

      const expressionCst = getFirstCstNode(letStmtCst.children.expression)
      if (!expressionCst) {
        this.variableService.context.addError({
          line: 0,
          message: 'Invalid LET statement: missing expression',
          type: ERROR_TYPES.RUNTIME
        })
        return
      }

      const arrayName = identifierToken.image.toUpperCase()
      const indexExpressions = getCstNodes(expressionListCst.children.expression)
      
      // Evaluate indices
      const indices: number[] = []
      for (const exprCst of indexExpressions) {
        const indexValue = this.variableService.evaluator.evaluateExpression(exprCst)
        if (typeof indexValue !== 'number') {
          this.variableService.context.addError({
            line: 0,
            message: `Invalid array index: expected number, got ${typeof indexValue}`,
            type: ERROR_TYPES.RUNTIME
          })
          return
        }
        indices.push(Math.floor(indexValue))
      }

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
      // Check for both identifier and expression to provide better error messages
      const identifierToken = getFirstToken(letStmtCst.children.Identifier)
      const expressionCst = getFirstCstNode(letStmtCst.children.expression)
      
      if (!identifierToken && !expressionCst) {
        this.variableService.context.addError({
          line: 0,
          message: 'Invalid LET statement: missing identifier or expression',
          type: ERROR_TYPES.RUNTIME
        })
        return
      }
      if (!identifierToken) {
        this.variableService.context.addError({
          line: 0,
          message: 'Invalid LET statement: missing identifier',
          type: ERROR_TYPES.RUNTIME
        })
        return
      }
      if (!expressionCst) {
        this.variableService.context.addError({
          line: 0,
          message: 'Invalid LET statement: missing expression',
          type: ERROR_TYPES.RUNTIME
        })
        return
      }

      const varName = identifierToken.image.toUpperCase()
      
      // Evaluate expression once and reuse the value
      const value = this.variableService.evaluator.evaluateExpression(expressionCst)
      // Convert boolean to number for BASIC compatibility
      const basicValue = typeof value === 'boolean' ? (value ? 1 : 0) : value
      this.variableService.setVariable(varName, basicValue as BasicScalarValue)

      // Add debug output (only if execution hasn't been halted by a runtime error)
      if (this.variableService.context.config.enableDebugMode && !this.variableService.context.shouldStop) {
        this.variableService.context.addDebugOutput(`LET: ${varName} = ${value}`)
      }
    }
  }
}
