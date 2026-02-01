/**
 * Expression Evaluator
 *
 * Handles evaluation of BASIC expressions from CST nodes.
 * Uses Decimal.js for precise integer arithmetic to avoid JavaScript floating point precision issues.
 */

import type { CstNode } from 'chevrotain'
import Decimal from 'decimal.js'

import { ERROR_TYPES } from '@/core/constants'
import { getCstNodes, getFirstCstNode, getFirstToken, getTokens } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'
import type { BasicArrayValue, BasicScalarValue } from '@/core/types/BasicTypes'

import { FunctionEvaluator } from './FunctionEvaluator'

export class ExpressionEvaluator {
  private functionEvaluator: FunctionEvaluator

  constructor(private context: ExecutionContext) {
    // Create function evaluator with reference to evaluateExpression method
    // We'll set it up after construction to avoid circular dependency
    this.functionEvaluator = new FunctionEvaluator(context, (exprCst: CstNode) => this.evaluateExpression(exprCst))
  }

  /**
   * Evaluate a BASIC expression from CST.
   * Expression = LogicalExpression (includes AND/OR/NOT/XOR in numeric context per F-BASIC manual p.52).
   */
  evaluateExpression(exprCst: CstNode): number | string {
    const logicalCst = getFirstCstNode(exprCst.children.logicalExpression)
    if (logicalCst) {
      return this.evaluateLogicalExpression(logicalCst)
    }

    throw new Error('Invalid expression CST')
  }

  /** Convert to 16-bit signed integer (F-BASIC numeric range). */
  private toInt16(x: number): number {
    const truncated = Math.trunc(x)
    const masked = (truncated & 0xffff) >>> 0
    return masked >= 0x8000 ? masked - 0x10000 : masked
  }

  /**
   * Evaluate a logical expression from CST.
   * Uses bitwise semantics (F-BASIC manual p.52): NOT/AND/OR/XOR operate on 16-bit values.
   * Returns number or string (e.g. PRINT A$; (A AND 1) in arithmetic).
   * Structure: LogicalOrExpression (XOR LogicalOrExpression)*
   */
  evaluateLogicalExpression(logicalCst: CstNode): number | string {
    const logicalOrExprs = getCstNodes(logicalCst.children.logicalOrExpression)
    if (logicalOrExprs.length === 0) {
      throw new Error('Invalid logical expression: missing logical OR expression')
    }

    let result = this.evaluateLogicalOrExpression(logicalOrExprs[0]!)

    const xorTokens = getTokens(logicalCst.children.Xor)
    for (let i = 0; i < xorTokens.length && i + 1 < logicalOrExprs.length; i++) {
      const operand = this.evaluateLogicalOrExpression(logicalOrExprs[i + 1]!)
      result = this.toInt16(this.toInt16(this.toNumber(result)) ^ this.toInt16(this.toNumber(operand)))
    }

    return result
  }

  /**
   * Evaluate a logical OR expression from CST (bitwise OR).
   * Structure: LogicalAndExpression (OR LogicalAndExpression)*
   */
  private evaluateLogicalOrExpression(cst: CstNode): number | string {
    const logicalAndExprs = getCstNodes(cst.children.logicalAndExpression)
    if (logicalAndExprs.length === 0) {
      throw new Error('Invalid logical OR expression: missing logical AND expression')
    }

    let result = this.evaluateLogicalAndExpression(logicalAndExprs[0]!)

    const orTokens = getTokens(cst.children.Or)
    for (let i = 0; i < orTokens.length && i + 1 < logicalAndExprs.length; i++) {
      const operand = this.evaluateLogicalAndExpression(logicalAndExprs[i + 1]!)
      result = this.toInt16(this.toInt16(this.toNumber(result)) | this.toInt16(this.toNumber(operand)))
    }

    return result
  }

  /**
   * Evaluate a logical AND expression from CST (bitwise AND).
   * Structure: LogicalNotExpression (AND LogicalNotExpression)*
   */
  private evaluateLogicalAndExpression(cst: CstNode): number | string {
    const logicalNotExprs = getCstNodes(cst.children.logicalNotExpression)
    if (logicalNotExprs.length === 0) {
      throw new Error('Invalid logical AND expression: missing logical NOT expression')
    }

    let result = this.evaluateLogicalNotExpression(logicalNotExprs[0]!)

    const andTokens = getTokens(cst.children.And)
    for (let i = 0; i < andTokens.length && i + 1 < logicalNotExprs.length; i++) {
      const operand = this.evaluateLogicalNotExpression(logicalNotExprs[i + 1]!)
      result = this.toInt16(this.toInt16(this.toNumber(result)) & this.toInt16(this.toNumber(operand)))
    }

    return result
  }

  /**
   * Evaluate a logical NOT expression from CST (bitwise NOT when NOT present).
   * Structure: (NOT)? ComparisonExpression
   */
  private evaluateLogicalNotExpression(cst: CstNode): number | string {
    const comparisonExprCst = getFirstCstNode(cst.children.comparisonExpression)
    if (!comparisonExprCst) {
      throw new Error('Invalid logical NOT expression: missing comparison expression')
    }

    let result: number | string = this.evaluateComparisonExpression(comparisonExprCst)

    const notTokens = getTokens(cst.children.Not)
    if (notTokens.length > 0) {
      result = this.toInt16(~this.toInt16(this.toNumber(result)))
    }

    return result
  }

  /**
   * Evaluate a comparison expression from CST.
   * Left operand: bitwiseXorExpression; right operand (when present): additive.
   * Returns number or string (raw value when single operand; -1/0 when relational).
   */
  evaluateComparisonExpression(comparisonCst: CstNode): number | string {
    const bitwiseXorCst = getFirstCstNode(comparisonCst.children.bitwiseXorExpression)
    if (!bitwiseXorCst) {
      throw new Error('Invalid comparison expression: missing bitwise expression')
    }

    const leftValue = this.evaluateBitwiseXorExpression(bitwiseXorCst)

    const additiveCst = getFirstCstNode(comparisonCst.children.additive)
    // If no comparison operator, return raw value (PRINT A$ prints string; (A AND 1) stays 0 or 1)
    if (!additiveCst) {
      return leftValue
    }

    const rightValue = this.evaluateAdditive(additiveCst)

    // Get comparison operator token
    const equalToken = getFirstToken(comparisonCst.children.Equal)
    const notEqualToken = getFirstToken(comparisonCst.children.NotEqual)
    const lessThanToken = getFirstToken(comparisonCst.children.LessThan)
    const greaterThanToken = getFirstToken(comparisonCst.children.GreaterThan)
    const lessThanOrEqualToken = getFirstToken(comparisonCst.children.LessThanOrEqual)
    const greaterThanOrEqualToken = getFirstToken(comparisonCst.children.GreaterThanOrEqual)

    // Determine operator
    let operator: '=' | '<>' | '<' | '>' | '<=' | '>=' | null = null
    if (equalToken) operator = '='
    else if (notEqualToken) operator = '<>'
    else if (lessThanToken) operator = '<'
    else if (greaterThanToken) operator = '>'
    else if (lessThanOrEqualToken) operator = '<='
    else if (greaterThanOrEqualToken) operator = '>='

    if (!operator) {
      throw new Error('Invalid comparison expression: missing operator')
    }

    // Compare values
    // In BASIC, relational operators return -1 for true, 0 for false (per Family BASIC spec)
    // String comparisons are lexicographic
    if (typeof leftValue === 'string' || typeof rightValue === 'string') {
      const leftStr = String(leftValue)
      const rightStr = String(rightValue)
      switch (operator) {
        case '=':
          return leftStr === rightStr ? -1 : 0
        case '<>':
          return leftStr !== rightStr ? -1 : 0
        case '<':
          return leftStr < rightStr ? -1 : 0
        case '>':
          return leftStr > rightStr ? -1 : 0
        case '<=':
          return leftStr <= rightStr ? -1 : 0
        case '>=':
          return leftStr >= rightStr ? -1 : 0
      }
    } else {
      // Numeric comparison
      const leftNum = Number(leftValue)
      const rightNum = Number(rightValue)
      switch (operator) {
        case '=':
          return leftNum === rightNum ? -1 : 0
        case '<>':
          return leftNum !== rightNum ? -1 : 0
        case '<':
          return leftNum < rightNum ? -1 : 0
        case '>':
          return leftNum > rightNum ? -1 : 0
        case '<=':
          return leftNum <= rightNum ? -1 : 0
        case '>=':
          return leftNum >= rightNum ? -1 : 0
      }
    }

    return 0
  }

  /**
   * Evaluate bitwise XOR expression from CST (used as comparison operands).
   * Returns number | string; bitwise ops coerce to number.
   */
  evaluateBitwiseXorExpression(cst: CstNode): number | string {
    const bitwiseOrExprs = getCstNodes(cst.children.bitwiseOrExpression)
    if (bitwiseOrExprs.length === 0) {
      throw new Error('Invalid bitwise XOR expression')
    }
    let result = this.evaluateBitwiseOrExpression(bitwiseOrExprs[0]!)
    const xorTokens = getTokens(cst.children.Xor)
    for (let i = 0; i < xorTokens.length && i + 1 < bitwiseOrExprs.length; i++) {
      const operand = this.evaluateBitwiseOrExpression(bitwiseOrExprs[i + 1]!)
      result = this.toInt16(this.toNumber(result) ^ this.toNumber(operand))
    }
    return result
  }

  private evaluateBitwiseOrExpression(cst: CstNode): number | string {
    const bitwiseAndExprs = getCstNodes(cst.children.bitwiseAndExpression)
    if (bitwiseAndExprs.length === 0) {
      throw new Error('Invalid bitwise OR expression')
    }
    let result = this.evaluateBitwiseAndExpression(bitwiseAndExprs[0]!)
    const orTokens = getTokens(cst.children.Or)
    for (let i = 0; i < orTokens.length && i + 1 < bitwiseAndExprs.length; i++) {
      const operand = this.evaluateBitwiseAndExpression(bitwiseAndExprs[i + 1]!)
      result = this.toInt16(this.toNumber(result) | this.toNumber(operand))
    }
    return result
  }

  private evaluateBitwiseAndExpression(cst: CstNode): number | string {
    const bitwiseNotExprs = getCstNodes(cst.children.bitwiseNotExpression)
    if (bitwiseNotExprs.length === 0) {
      throw new Error('Invalid bitwise AND expression')
    }
    let result = this.evaluateBitwiseNotExpression(bitwiseNotExprs[0]!)
    const andTokens = getTokens(cst.children.And)
    for (let i = 0; i < andTokens.length && i + 1 < bitwiseNotExprs.length; i++) {
      const operand = this.evaluateBitwiseNotExpression(bitwiseNotExprs[i + 1]!)
      result = this.toInt16(this.toNumber(result) & this.toNumber(operand))
    }
    return result
  }

  private evaluateBitwiseNotExpression(cst: CstNode): number | string {
    const additiveCst = getFirstCstNode(cst.children.additive)
    if (!additiveCst) {
      throw new Error('Invalid bitwise NOT expression')
    }
    let result = this.evaluateAdditive(additiveCst)
    const notTokens = getTokens(cst.children.Not)
    if (notTokens.length > 0) {
      result = this.toInt16(~this.toInt16(this.toNumber(result)))
    }
    return result
  }

  /**
   * Evaluate additive expression: ModExpression ((Plus | Minus) ModExpression)*
   */
  private evaluateAdditive(cst: CstNode): number | string {
    const modExpressionNodes = getCstNodes(cst.children.modExpression)
    if (modExpressionNodes.length === 0) {
      throw new Error('Invalid additive expression')
    }

    let result = this.evaluateModExpression(modExpressionNodes[0]!)
    const plusTokens = getTokens(cst.children.Plus)
    const minusTokens = getTokens(cst.children.Minus)

    // Combine operators with their operands
    const operators: Array<{ op: '+' | '-'; operand: CstNode }> = []
    let tokenIndex = 0
    for (let i = 1; i < modExpressionNodes.length; i++) {
      const op = tokenIndex < plusTokens.length ? '+' : '-'
      operators.push({ op, operand: modExpressionNodes[i]! })
      tokenIndex++
      if (tokenIndex >= plusTokens.length + minusTokens.length) break
    }

    // Apply operators
    for (const { op, operand } of operators) {
      const operandValue = this.evaluateModExpression(operand)
      if (op === '+') {
        // Handle string concatenation
        if (typeof result === 'string' || typeof operandValue === 'string') {
          result = String(result) + String(operandValue)
        } else {
          // Use Decimal for precise integer arithmetic
          const resultDecimal = this.toDecimal(result)
          const operandDecimal = this.toDecimal(operandValue)
          result = resultDecimal.plus(operandDecimal).truncated().toNumber()
        }
      } else {
        // Use Decimal for precise integer arithmetic
        const resultDecimal = this.toDecimal(result)
        const operandDecimal = this.toDecimal(operandValue)
        result = resultDecimal.minus(operandDecimal).truncated().toNumber()
      }
    }

    return result
  }

  /**
   * Evaluate MOD expression: Multiplicative ((MOD) Multiplicative)*
   * MOD has priority 2 (after *, / but before +, -)
   */
  private evaluateModExpression(cst: CstNode): number | string {
    const multiplicativeNodes = getCstNodes(cst.children.multiplicative)
    if (multiplicativeNodes.length === 0) {
      throw new Error('Invalid MOD expression')
    }

    let result = this.evaluateMultiplicative(multiplicativeNodes[0]!)
    const modTokens = getTokens(cst.children.Mod)

    // Apply MOD operators (left to right)
    for (let i = 0; i < modTokens.length && i + 1 < multiplicativeNodes.length; i++) {
      const operandValue = this.evaluateMultiplicative(multiplicativeNodes[i + 1]!)

      // MOD only works with numbers
      if (typeof result === 'string' || typeof operandValue === 'string') {
        throw new Error('MOD operator requires numeric operands')
      }

      const resultDecimal = this.toDecimal(result)
      const operandDecimal = this.toDecimal(operandValue)

      if (operandDecimal.isZero()) {
        // MOD by zero is a fatal runtime error
        this.context.addError({
          line: this.context.getCurrentLineNumber(),
          message: 'Division by zero',
          type: ERROR_TYPES.RUNTIME,
        })
        // Return 0 as fallback (execution will halt due to error)
        result = 0
      } else {
        // MOD: remainder after division (toward zero)
        // Use Decimal's modulo operation
        result = resultDecimal.mod(operandDecimal).truncated().toNumber()
      }
    }

    return result
  }

  /**
   * Evaluate multiplicative expression: Unary ((Multiply | Divide) Unary)*
   */
  private evaluateMultiplicative(cst: CstNode): number | string {
    const unaryNodes = getCstNodes(cst.children.unary)
    if (unaryNodes.length === 0) {
      throw new Error('Invalid multiplicative expression')
    }

    let result = this.evaluateUnary(unaryNodes[0]!)
    const multiplyTokens = getTokens(cst.children.Multiply)
    const divideTokens = getTokens(cst.children.Divide)

    let tokenIndex = 0
    for (let i = 1; i < unaryNodes.length; i++) {
      const op = tokenIndex < multiplyTokens.length ? '*' : '/'
      const operandValue = this.evaluateUnary(unaryNodes[i]!)

      if (op === '*') {
        // Use Decimal for precise integer arithmetic
        const resultDecimal = this.toDecimal(result)
        const operandDecimal = this.toDecimal(operandValue)
        result = resultDecimal.times(operandDecimal).truncated().toNumber()
      } else {
        // Integer division: truncate toward zero using Decimal
        const divisorDecimal = this.toDecimal(operandValue)
        if (divisorDecimal.isZero()) {
          // Division by zero is a fatal runtime error
          this.context.addError({
            line: this.context.getCurrentLineNumber(),
            message: 'Division by zero',
            type: ERROR_TYPES.RUNTIME,
          })
          // Return 0 as fallback (execution will halt due to error)
          result = 0
        } else {
          const dividendDecimal = this.toDecimal(result)
          // Use Decimal's truncated division (toward zero)
          result = dividendDecimal.dividedBy(divisorDecimal).truncated().toNumber()
        }
      }
      tokenIndex++
      if (tokenIndex >= multiplyTokens.length + divideTokens.length) break
    }

    // Ensure numeric results are integers
    return typeof result === 'string' ? result : this.toNumber(result)
  }

  /**
   * Evaluate unary expression: (Plus | Minus)? Primary
   */
  private evaluateUnary(cst: CstNode): number | string {
    const primaryCst = getFirstCstNode(cst.children.primary)
    if (!primaryCst) {
      throw new Error('Invalid unary expression: missing primary')
    }

    const primaryValue = this.evaluatePrimary(primaryCst)

    // Check for unary minus operator
    const minusTokens = getTokens(cst.children.Minus)

    // If there's a minus token, negate the value using Decimal
    if (minusTokens.length > 0) {
      const valueDecimal = this.toDecimal(primaryValue)
      return valueDecimal.negated().truncated().toNumber()
    }

    // Unary plus is a no-op (or no unary operator), return the value as-is
    return primaryValue
  }

  /**
   * Evaluate primary expression: 
   * NumberLiteral | StringLiteral | ArrayAccess | FunctionCall | Identifier | (LParen Expression RParen)
   */
  private evaluatePrimary(cst: CstNode): number | string {
    // Check for array access
    const arrayAccessCst = getFirstCstNode(cst.children.arrayAccess)
    if (arrayAccessCst) {
      return this.evaluateArrayAccess(arrayAccessCst)
    }

    // Check for function call
    const functionCallCst = getFirstCstNode(cst.children.functionCall)
    if (functionCallCst) {
      return this.evaluateFunctionCall(functionCallCst)
    }

    // Check for parenthesized expression
    if (cst.children.LParen && !functionCallCst && !arrayAccessCst) {
      const exprCst = getFirstCstNode(cst.children.expression)
      if (exprCst) {
        return this.evaluateExpression(exprCst)
      }
      throw new Error('Invalid parenthesized expression')
    }

    // Check for number literal
    const numberToken = getFirstToken(cst.children.NumberLiteral)
    if (numberToken) {
      // Family Basic only supports integers - parse as integer
      return parseInt(numberToken.image, 10)
    }

    // Check for hex literal (&H<hex digits>, e.g. &HDD = 221)
    const hexToken = getFirstToken(cst.children.HexLiteral)
    if (hexToken) {
      return parseInt(hexToken.image.slice(2), 16)
    }

    // Check for string literal
    const stringToken = getFirstToken(cst.children.StringLiteral)
    if (stringToken) {
      return stringToken.image.slice(1, -1) // Remove quotes
    }

    // Check for identifier (variable)
    const identifierToken = getFirstToken(cst.children.Identifier)
    if (identifierToken) {
      const varName = identifierToken.image.toUpperCase()
      const variable = this.context.variables.get(varName)
      if (variable) {
        return variable.value
      }
      // Default value: empty string for string variables ($ suffix), 0 for numeric variables
      return varName.endsWith('$') ? '' : 0
    }

    throw new Error('Invalid primary expression')
  }

  /**
   * Evaluate array access: Identifier LParen ExpressionList RParen
   * Examples: A(I), A$(I, J)
   */
  private evaluateArrayAccess(cst: CstNode): number | string {
    const identifierToken = getFirstToken(cst.children.Identifier)
    if (!identifierToken) {
      throw new Error('Invalid array access: missing array name')
    }

    const arrayName = identifierToken.image.toUpperCase()
    const expressionListCst = getFirstCstNode(cst.children.expressionList)

    if (!expressionListCst) {
      throw new Error('Invalid array access: missing indices')
    }

    // Evaluate indices
    const expressions = getCstNodes(expressionListCst.children.expression)
    const indices: number[] = []

    for (const exprCst of expressions) {
      const indexValue = this.evaluateExpression(exprCst)
      if (typeof indexValue !== 'number') {
        throw new Error(`Invalid array index: expected number, got ${typeof indexValue}`)
      }
      indices.push(Math.floor(indexValue))
    }

    // Get array value
    const array = this.context.arrays.get(arrayName)
    if (!array) {
      // Array not found - return default value
      return arrayName.endsWith('$') ? '' : 0
    }

    // Navigate through array dimensions
    let value: BasicScalarValue | BasicArrayValue = array
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i]
      if (index === undefined) {
        throw new Error(`Invalid array index at dimension ${i}`)
      }
      if (typeof value !== 'object' || !Array.isArray(value)) {
        throw new Error(`Array access error: dimension ${i} is not an array`)
      }
      if (index < 0 || index >= value.length) {
        // Out of bounds - return default value
        return arrayName.endsWith('$') ? '' : 0
      }
      value = value[index] as BasicScalarValue | BasicArrayValue
    }

    // Return the scalar value
    return typeof value === 'object' && Array.isArray(value)
      ? arrayName.endsWith('$')
        ? ''
        : 0 // Still an array (too few indices)
      : (value as BasicScalarValue)
  }

  /**
   * Evaluate function call: Delegates to FunctionEvaluator
   */
  private evaluateFunctionCall(cst: CstNode): number | string {
    return this.functionEvaluator.evaluateFunctionCall(cst)
  }

  /**
   * Convert a value to a Decimal for precise arithmetic
   */
  private toDecimal(value: number | string | boolean | undefined): Decimal {
    if (typeof value === 'number') {
      return new Decimal(value)
    }
    if (typeof value === 'boolean') {
      return new Decimal(value ? 1 : 0)
    }
    if (typeof value === 'string') {
      // Try to parse as number, default to 0 if not a valid number
      const parsed = parseFloat(value)
      return isNaN(parsed) ? new Decimal(0) : new Decimal(parsed)
    }
    return new Decimal(0)
  }

  /**
   * Convert a value to an integer
   * Family Basic only supports integer numerical values
   */
  private toNumber(value: number | string | boolean | undefined): number {
    if (typeof value === 'number') {
      // Truncate to integer (toward zero)
      return Math.trunc(value)
    }
    if (typeof value === 'boolean') return value ? 1 : 0
    if (typeof value === 'string') {
      // Parse as integer (truncate toward zero)
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : Math.trunc(parsed)
    }
    return 0
  }
}
