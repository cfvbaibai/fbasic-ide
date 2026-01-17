/**
 * DIM Statement Executor
 * 
 * Handles DIM statement execution for declaring arrays.
 * According to Family BASIC spec:
 * - Arrays can be 1D or 2D
 * - The number in parentheses specifies the highest index (size is N+1)
 * - Numerical arrays are initialized to 0
 * - String arrays (with $ suffix) are initialized to empty strings
 * - Multiple arrays can be declared in one DIM statement
 */

import type { CstNode } from 'chevrotain'
import type { VariableService } from '../../services/VariableService'
import type { ExpressionEvaluator } from '../../evaluation/ExpressionEvaluator'
import type { ExecutionContext } from '../../state/ExecutionContext'
import { ERROR_TYPES } from '../../constants'
import { getFirstCstNode, getCstNodes, getFirstToken } from '../../parser/cst-helpers'

export class DimExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator,
    private variableService: VariableService
  ) {}

  /**
   * Execute DIM statement
   * DIM ArrayDeclaration (Comma ArrayDeclaration)*
   */
  execute(cst: CstNode, lineNumber: number): void {
    const arrayDeclarations = getCstNodes(cst.children.arrayDeclaration)
    
    for (const arrayDeclCst of arrayDeclarations) {
      // Get array name (Identifier)
      const identifierToken = getFirstToken(arrayDeclCst.children.Identifier)
      if (!identifierToken) {
        this.context.addError({
          line: lineNumber,
          message: 'DIM: Missing array name',
          type: ERROR_TYPES.RUNTIME
        })
        continue
      }
      
      const arrayName = identifierToken.image
      
      // Get dimension list
      const dimensionListCst = getFirstCstNode(arrayDeclCst.children.dimensionList)
      if (!dimensionListCst) {
        this.context.addError({
          line: lineNumber,
          message: `DIM: Missing dimensions for array ${arrayName}`,
          type: ERROR_TYPES.RUNTIME
        })
        continue
      }
      
      // Evaluate dimensions (expressions)
      const dimensionExpressions = getCstNodes(dimensionListCst.children.expression)
      const dimensions: number[] = []
      
      for (const exprCst of dimensionExpressions) {
        const value = this.evaluator.evaluateExpression(exprCst)
        const numValue = this.toNumber(value)
        if (numValue < 0) {
          this.context.addError({
            line: lineNumber,
            message: `DIM: Array dimension must be >= 0 for ${arrayName}`,
            type: ERROR_TYPES.RUNTIME
          })
          return
        }
        dimensions.push(numValue)
      }
      
      // Validate dimensions (1D or 2D only)
      if (dimensions.length < 1 || dimensions.length > 2) {
        this.context.addError({
          line: lineNumber,
          message: `DIM: Arrays can have 1 or 2 dimensions only for ${arrayName}`,
          type: ERROR_TYPES.RUNTIME
        })
        continue
      }
      
      // Create the array
      this.variableService.createArray(arrayName, dimensions)
      
      if (this.context.config.enableDebugMode) {
        const dimStr = dimensions.join(',')
        this.context.addDebugOutput(`DIM: Created array ${arrayName}(${dimStr})`)
      }
    }
  }

  /**
   * Convert a value to an integer
   */
  private toNumber(value: number | string | boolean): number {
    if (typeof value === 'number') {
      return Math.floor(value)
    }
    if (typeof value === 'boolean') return value ? 1 : 0
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }
}

