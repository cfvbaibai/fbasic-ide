/**
 * Let Statement Executor
 * 
 * Handles execution of LET statements for variable assignment.
 */

import type { LetStatementNode } from '../../parser/ast-types'
import { VariableService } from '../../services/VariableService'

export class LetExecutor {
  constructor(private variableService: VariableService) {}

  /**
   * Execute a LET statement
   */
  execute(letStmt: LetStatementNode): void {
    if (letStmt.variable.subscript) {
      // Array assignment
      this.variableService.setArrayElementFromExpressions(
        letStmt.variable.name,
        letStmt.variable.subscript,
        letStmt.expression
      )
    } else {
      // Simple variable assignment
      this.variableService.setVariableFromExpression(
        letStmt.variable.name,
        letStmt.expression
      )
      
      // Add debug output
      if (this.variableService.context.config.enableDebugMode) {
        const value = this.variableService.evaluator.evaluateExpression(letStmt.expression)
        this.variableService.context.addDebugOutput(`LET: ${letStmt.variable.name} = ${value}`)
      }
    }
  }
}
