/**
 * READ Statement Executor
 * 
 * Handles READ statement execution for reading data values from DATA statements.
 * Supports both scalar variables and array elements.
 */

import type { CstNode } from 'chevrotain'

import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getCstNodes,getFirstCstNode, getFirstToken, getTokens } from '@/core/parser/cst-helpers'
import type { DataService } from '@/core/services/DataService'
import type { VariableService } from '@/core/services/VariableService'

export class ReadExecutor {
  constructor(
    private dataService: DataService,
    private variableService: VariableService,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute READ statement
   * READ (Identifier | ArrayAccess) (Comma (Identifier | ArrayAccess))*
   */
  execute(cst: CstNode, _lineNumber: number): void {
    // Process Identifier tokens (scalar variables)
    const identifierTokens = getTokens(cst.children.Identifier)
    
    for (const identifierToken of identifierTokens) {
      const variableName = identifierToken.image
      
      // Read next data value
      const dataValue = this.dataService.readNextDataValue()
      
      // Set the variable
      this.variableService.setVariable(variableName, dataValue)
    }
    
    // Process ArrayAccess nodes (array elements)
    const arrayAccessNodes = getCstNodes(cst.children.arrayAccess)
    
    for (const arrayAccessCst of arrayAccessNodes) {
      const identifierToken = getFirstToken(arrayAccessCst.children.Identifier)
      if (!identifierToken) {
        continue
      }
      
      const arrayName = identifierToken.image.toUpperCase()
      const expressionListCst = getFirstCstNode(arrayAccessCst.children.expressionList)
      
      if (!expressionListCst) {
        continue
      }
      
      // Evaluate indices
      const expressions = getCstNodes(expressionListCst.children.expression)
      const indices: number[] = []
      
      for (const exprCst of expressions) {
        const indexValue = this.evaluator.evaluateExpression(exprCst)
        if (typeof indexValue !== 'number') {
          continue
        }
        indices.push(Math.floor(indexValue))
      }
      
      // Read next data value
      const dataValue = this.dataService.readNextDataValue()
      
      // Set the array element
      this.variableService.setArrayElement(arrayName, indices, dataValue)
    }
  }
}

