/**
 * Expression Evaluator
 * 
 * Handles evaluation of BASIC expressions from CST nodes.
 * Uses Decimal.js for precise integer arithmetic to avoid JavaScript floating point precision issues.
 */

import type { CstNode } from 'chevrotain'
import Decimal from 'decimal.js'
import type { BasicError, InterpreterConfig } from '../interfaces'
import type { BasicVariable, BasicDeviceAdapter } from '../interfaces'
import type { LoopState } from '../state/ExecutionContext'
import type { BasicScalarValue, BasicArrayValue } from '../types/BasicTypes'
import { getFirstCstNode, getCstNodes, getFirstToken, getTokens } from '../parser/cst-helpers'
import type { ExpandedStatement } from '../execution/statement-expander'
import { FunctionEvaluator } from './FunctionEvaluator'

export interface EvaluationContext {
  variables: Map<string, BasicVariable>
  arrays: Map<string, BasicArrayValue>
  deviceAdapter?: BasicDeviceAdapter
  
  // Additional properties needed for execution
  isRunning: boolean
  shouldStop: boolean
  currentStatementIndex: number
  statements: ExpandedStatement[] // Expanded statements (flat list)
  labelMap: Map<number, number[]> // Line number -> statement indices
  iterationCount: number
  config: InterpreterConfig
  loopStack: LoopState[]
  gosubStack: number[]
  dataValues: BasicScalarValue[]
  dataIndex: number
  
  // Methods
  addOutput: (text: string) => void
  addError: (error: BasicError) => void
  addDebugOutput: (message: string) => void
  getErrors: () => BasicError[]
  getStickState: (joystickId: number) => number
  consumeStrigState: (joystickId: number) => number
  findStatementIndexByLine: (lineNumber: number) => number
  findStatementIndicesByLine: (lineNumber: number) => number[]
  nextStatement: () => void
  jumpToStatement: (index: number) => void
  shouldContinue: () => boolean
  reset: () => void
}

export class ExpressionEvaluator {
  private functionEvaluator: FunctionEvaluator

  constructor(private context: EvaluationContext) {
    // Create function evaluator with reference to evaluateExpression method
    // We'll set it up after construction to avoid circular dependency
    this.functionEvaluator = new FunctionEvaluator(
      context,
      (exprCst: CstNode) => this.evaluateExpression(exprCst)
    )
  }

  /**
   * Evaluate a BASIC expression from CST
   */
  evaluateExpression(exprCst: CstNode): number | string {
    // Expression -> Additive -> ModExpression -> Multiplicative -> Unary -> Primary
    const additiveCst = getFirstCstNode(exprCst.children.additive)
    if (additiveCst) {
      return this.evaluateAdditive(additiveCst)
    }

    throw new Error('Invalid expression CST')
  }

  /**
   * Evaluate a logical expression from CST
   * Returns -1 for true, 0 for false (per Family BASIC spec)
   * Supports: NOT, AND, OR, XOR
   * Precedence: NOT > AND > OR > XOR
   * Structure: LogicalOrExpression (XOR LogicalOrExpression)*
   */
  evaluateLogicalExpression(logicalCst: CstNode): number {
    const logicalOrExprs = getCstNodes(logicalCst.children.logicalOrExpression)
    if (logicalOrExprs.length === 0) {
      throw new Error('Invalid logical expression: missing logical OR expression')
    }

    // Evaluate first logical OR expression
    let result = this.evaluateLogicalOrExpression(logicalOrExprs[0]!)

    // Apply XOR operators (lowest precedence, combines LogicalOrExpressions)
    const xorTokens = getTokens(logicalCst.children.Xor)
    for (let i = 0; i < xorTokens.length && i + 1 < logicalOrExprs.length; i++) {
      const operand = this.evaluateLogicalOrExpression(logicalOrExprs[i + 1]!)
      // XOR: exactly one must be non-zero (true) to return -1
      // In BASIC: non-zero = true, zero = false
      // XOR truth table: 1 XOR 1 = 0, 1 XOR 0 = 1, 0 XOR 1 = 1, 0 XOR 0 = 0
      const leftIsTrue = result !== 0
      const rightIsTrue = operand !== 0
      result = (leftIsTrue !== rightIsTrue) ? -1 : 0
    }

    return result
  }

  /**
   * Evaluate a logical OR expression from CST
   * Structure: LogicalAndExpression (OR LogicalAndExpression)*
   * OR combines LogicalAndExpressions
   */
  private evaluateLogicalOrExpression(cst: CstNode): number {
    const logicalAndExprs = getCstNodes(cst.children.logicalAndExpression)
    if (logicalAndExprs.length === 0) {
      throw new Error('Invalid logical OR expression: missing logical AND expression')
    }

    // Evaluate first logical AND expression
    let result = this.evaluateLogicalAndExpression(logicalAndExprs[0]!)

    // Apply OR operators (combines LogicalAndExpressions)
    const orTokens = getTokens(cst.children.Or)
    for (let i = 0; i < orTokens.length && i + 1 < logicalAndExprs.length; i++) {
      const operand = this.evaluateLogicalAndExpression(logicalAndExprs[i + 1]!)
      // OR: at least one must be non-zero (true) to return -1
      result = (result !== 0 || operand !== 0) ? -1 : 0
    }

    return result
  }

  /**
   * Evaluate a logical AND expression from CST
   * Structure: LogicalNotExpression (AND LogicalNotExpression)*
   * AND has middle precedence (combines LogicalNotExpressions)
   */
  private evaluateLogicalAndExpression(cst: CstNode): number {
    const logicalNotExprs = getCstNodes(cst.children.logicalNotExpression)
    if (logicalNotExprs.length === 0) {
      throw new Error('Invalid logical AND expression: missing logical NOT expression')
    }

    // Evaluate first logical NOT expression
    let result = this.evaluateLogicalNotExpression(logicalNotExprs[0]!)

    // Apply AND operators (middle precedence, combines LogicalNotExpressions)
    const andTokens = getTokens(cst.children.And)
    for (let i = 0; i < andTokens.length && i + 1 < logicalNotExprs.length; i++) {
      const operand = this.evaluateLogicalNotExpression(logicalNotExprs[i + 1]!)
      // AND: both must be non-zero (true) to return -1
      result = (result !== 0 && operand !== 0) ? -1 : 0
    }

    return result
  }

  /**
   * Evaluate a logical NOT expression from CST
   * Structure: (NOT)? ComparisonExpression
   * NOT has highest precedence (applies to ComparisonExpression)
   */
  private evaluateLogicalNotExpression(cst: CstNode): number {
    const comparisonExprCst = getFirstCstNode(cst.children.comparisonExpression)
    if (!comparisonExprCst) {
      throw new Error('Invalid logical NOT expression: missing comparison expression')
    }

    // Evaluate comparison expression
    let result = this.evaluateComparisonExpression(comparisonExprCst)

    // Apply NOT if present (highest precedence, unary operator)
    const notTokens = getTokens(cst.children.Not)
    if (notTokens.length > 0) {
      // NOT: invert the boolean value
      // -1 (true) becomes 0 (false), 0 (false) becomes -1 (true)
      result = result !== 0 ? 0 : -1
    }

    return result
  }

  /**
   * Evaluate a comparison expression from CST
   * Returns -1 for true, 0 for false (per Family BASIC spec)
   * Supports: =, <>, <, >, <=, >=
   * Also supports single expression (non-zero = true, zero = false)
   */
  evaluateComparisonExpression(comparisonCst: CstNode): number {
    const expressions = getCstNodes(comparisonCst.children.expression)
    if (expressions.length === 0) {
      throw new Error('Invalid comparison expression: missing expression')
    }

    const leftValue = this.evaluateExpression(expressions[0]!)

    // If no comparison operator, treat as boolean (non-zero = true)
    // Per Family BASIC spec: relational operators return -1 for true, 0 for false
    // For single expressions: non-zero = true (-1), zero = false (0)
    if (expressions.length === 1) {
      if (typeof leftValue === 'string') {
        // Non-empty string = true
        return leftValue.length > 0 ? -1 : 0
      }
      // Non-zero number = true
      return leftValue !== 0 ? -1 : 0
    }

    // Two expressions with comparison operator
    const rightValue = this.evaluateExpression(expressions[1]!)

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
    const operators: Array<{ op: '+' | '-', operand: CstNode }> = []
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
   * Evaluate primary expression: NumberLiteral | StringLiteral | Identifier | FunctionCall | (LParen Expression RParen)
   */
  private evaluatePrimary(cst: CstNode): number | string {
    // Check for function call
    const functionCallCst = getFirstCstNode(cst.children.functionCall)
    if (functionCallCst) {
      return this.evaluateFunctionCall(functionCallCst)
    }

    // Check for parenthesized expression
    if (cst.children.LParen && !functionCallCst) {
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
