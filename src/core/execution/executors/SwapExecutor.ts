/**
 * SWAP Statement Executor
 *
 * Handles SWAP statement execution: swaps the values of two variables.
 * Both variables must be the same type (numeric with numeric, string with string).
 */

import type { CstNode } from 'chevrotain'

import { ERROR_TYPES } from '@/core/constants'
import { getCstNodes, getFirstCstNode, getFirstToken } from '@/core/parser/cst-helpers'
import type { VariableService } from '@/core/services/VariableService'
import type { BasicScalarValue } from '@/core/types/BasicTypes'

export class SwapExecutor {
  constructor(private variableService: VariableService) {}

  /**
   * Execute SWAP statement
   * SWAP variable1, variable2 — types must match
   */
  execute(swapStmtCst: CstNode, lineNumber: number): void {
    const targets = getCstNodes(swapStmtCst.children.swapTarget)
    if (targets.length !== 2) {
      this.variableService.context.addError({
        line: lineNumber,
        message: 'SWAP: exactly two variables required',
        type: ERROR_TYPES.RUNTIME,
      })
      return
    }

    const [target1, target2] = targets
    if (!target1 || !target2) return

    const value1 = this.getTargetValue(target1)
    const value2 = this.getTargetValue(target2)

    if (value1 === undefined || value2 === undefined) {
      return // getTargetValue already added error
    }

    const type1 = typeof value1
    const type2 = typeof value2
    if (type1 !== type2) {
      this.variableService.context.addError({
        line: lineNumber,
        message: `SWAP: type mismatch (cannot swap numeric and string variables)`,
        type: ERROR_TYPES.RUNTIME,
      })
      return
    }

    this.setTargetValue(target1, value2)
    this.setTargetValue(target2, value1)

    if (this.variableService.context.config.enableDebugMode) {
      this.variableService.context.addDebugOutput(`SWAP: values exchanged`)
    }
  }

  /**
   * Get value for a swap target (Identifier or arrayAccess)
   */
  private getTargetValue(targetCst: CstNode): BasicScalarValue | undefined {
    const arrayAccessCst = getFirstCstNode(targetCst.children.arrayAccess)
    if (arrayAccessCst) {
      const identifierToken = getFirstToken(arrayAccessCst.children.Identifier)
      const expressionListCst = getFirstCstNode(arrayAccessCst.children.expressionList)
      if (!identifierToken || !expressionListCst) return undefined
      const name = identifierToken.image.toUpperCase()
      const indexExprs = getCstNodes(expressionListCst.children.expression)
      const indices = indexExprs.map(expr =>
        Math.floor(
          (this.variableService.evaluator.evaluateExpression(expr) as number) ?? 0
        )
      )
      return this.variableService.getArrayElement(name, indices)
    }

    const identifierToken = getFirstToken(targetCst.children.Identifier)
    if (!identifierToken) return undefined
    const name = identifierToken.image.toUpperCase()
    const variable = this.variableService.getVariable(name)
    if (variable !== undefined) {
      return variable.value
    }
    return name.endsWith('$') ? '' : 0
  }

  /**
   * Set value for a swap target (Identifier or arrayAccess)
   */
  private setTargetValue(targetCst: CstNode, value: BasicScalarValue): void {
    const arrayAccessCst = getFirstCstNode(targetCst.children.arrayAccess)
    if (arrayAccessCst) {
      const identifierToken = getFirstToken(arrayAccessCst.children.Identifier)
      const expressionListCst = getFirstCstNode(arrayAccessCst.children.expressionList)
      if (!identifierToken || !expressionListCst) return
      const name = identifierToken.image.toUpperCase()
      const indexExprs = getCstNodes(expressionListCst.children.expression)
      const indices = indexExprs.map(expr =>
        Math.floor(
          (this.variableService.evaluator.evaluateExpression(expr) as number) ?? 0
        )
      )
      this.variableService.setArrayElement(name, indices, value)
      return
    }

    const identifierToken = getFirstToken(targetCst.children.Identifier)
    if (!identifierToken) return
    const name = identifierToken.image.toUpperCase()
    this.variableService.setVariable(name, value)
  }
}
