/**
 * Expression Evaluator
 * 
 * Handles evaluation of BASIC expressions including literals, variables,
 * binary operations, unary operations, and function calls.
 */

import type { 
  ExpressionNode, 
  FunctionCallNode,
  StatementNode
} from '../parser/ast-types'
import type { BasicError, InterpreterConfig } from '../interfaces'
import type { BasicVariable, BasicDeviceAdapter } from '../interfaces'
import type { LoopState } from '../state/ExecutionContext'
import type { BasicScalarValue, BasicArrayValue } from '../types/BasicTypes'

export interface EvaluationContext {
  variables: Map<string, BasicVariable>
  arrays: Map<string, BasicArrayValue>
  deviceAdapter?: BasicDeviceAdapter
  
  // Additional properties needed for execution
  isRunning: boolean
  shouldStop: boolean
  currentStatementIndex: number
  statements: StatementNode[]
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
  nextStatement: () => void
  shouldContinue: () => boolean
  reset: () => void
}

export class ExpressionEvaluator {
  constructor(private context: EvaluationContext) {}

  /**
   * Evaluate a BASIC expression
   */
  evaluateExpression(expr: ExpressionNode): number | string {
    switch (expr.type) {
      case 'Expression':
        // Handle wrapped expressions
        return this.evaluateExpression(expr.expression)
      
      case 'NumberLiteral':
        return expr.value
      
      case 'StringLiteral':
        return expr.value
      
      case 'Variable': {
        if (expr.subscript) {
          // Array access
          const array = this.context.arrays.get(expr.name)
          if (array) {
            const indices = expr.subscript.map(index => this.evaluateExpression(index))
            let value: BasicArrayValue = array
            for (const index of indices) {
              const numIndex = this.toNumber(index)
              if (Array.isArray(value)) {
                const element: BasicArrayValue | undefined = value[Math.floor(numIndex)]
                if (element !== undefined) {
                  value = element
                } else {
                  return 0
                }
              } else {
                return 0 // Default fallback
              }
            }
            return (typeof value !== 'object') ? value : 0
          }
          return 0
        } else {
          // Simple variable
          const variable = this.context.variables.get(expr.name)
          return variable ? variable.value : 0
        }
      }
      
      case 'BinaryExpression': {
        const left = this.evaluateExpression(expr.left)
        const right = this.evaluateExpression(expr.right)
        
        // Convert to numbers for arithmetic operations
        const leftNum = typeof left === 'number' ? left : (typeof left === 'boolean' ? (left ? 1 : 0) : 0)
        const rightNum = typeof right === 'number' ? right : (typeof right === 'boolean' ? (right ? 1 : 0) : 0)
        
        switch (expr.operator) {
          case '+': 
            // Handle string concatenation
            if (typeof left === 'string' || typeof right === 'string') {
              return String(left) + String(right)
            }
            return leftNum + rightNum
          case '-': return leftNum - rightNum
          case '*': return leftNum * rightNum
          case '/': return rightNum !== 0 ? leftNum / rightNum : 0
          case 'MOD': return rightNum !== 0 ? leftNum % rightNum : 0
          case '^': return Math.pow(leftNum, rightNum)
          case '=': return left === right ? 1 : 0
          case '<>': return left !== right ? 1 : 0
          case '<': return leftNum < rightNum ? 1 : 0
          case '>': return leftNum > rightNum ? 1 : 0
          case '<=': return leftNum <= rightNum ? 1 : 0
          case '>=': return leftNum >= rightNum ? 1 : 0
          case 'AND': return (left && right) ? 1 : 0
          case 'OR': return (left || right) ? 1 : 0
          default: return 0
        }
      }
      
      case 'UnaryExpression': {
        const operand = this.evaluateExpression(expr.operand)
        switch (expr.operator) {
          case '-': return -this.toNumber(operand)
          case 'NOT': return !operand ? 1 : 0
          default: return operand
        }
      }
      
      case 'FunctionCall':
        return this.evaluateFunctionCall(expr)
      
      default:
        return 0
    }
  }

  /**
   * Evaluate a function call
   */
  private evaluateFunctionCall(funcCall: FunctionCallNode): number | string {
    const args = funcCall.arguments.map((arg: ExpressionNode) => {
      return this.evaluateExpression(arg)
    })
    
    switch (funcCall.name) {
      // Mathematical functions
      case 'ABS': return Math.abs(this.toNumber(args[0] || 0))
      case 'SQR': return Math.sqrt(this.toNumber(args[0] || 0))
      case 'SIN': return Math.sin(this.toNumber(args[0] || 0))
      case 'COS': return Math.cos(this.toNumber(args[0] || 0))
      case 'TAN': return Math.tan(this.toNumber(args[0] || 0))
      case 'ATN': return Math.atan(this.toNumber(args[0] || 0))
      case 'LOG': return Math.log(this.toNumber(args[0] || 0))
      case 'EXP': return Math.exp(this.toNumber(args[0] || 0))
      case 'INT': {
        const intValue = this.toNumber(args[0] || 0)
        return intValue >= 0 ? Math.floor(intValue) : Math.ceil(intValue)
      }
      case 'FIX': return Math.trunc(this.toNumber(args[0] || 0))
      case 'SGN': return Math.sign(this.toNumber(args[0] || 0))
      case 'RND': return Math.random()
      
      // String functions
      case 'LEN': {
        const str = args[0]
        return typeof str === 'string' ? str.length : 0
      }
      case 'LEFT': {
        const str = args[0]
        const count = this.toNumber(args[1] || 0)
        if (typeof str !== 'string') return ''
        return str.substring(0, Math.max(0, count))
      }
      case 'RIGHT': {
        const str = args[0]
        const count = this.toNumber(args[1] || 0)
        if (typeof str !== 'string') return ''
        return str.substring(Math.max(0, str.length - count))
      }
      case 'MID': {
        const str = args[0]
        const start = this.toNumber(args[1] || 0)
        const count = this.toNumber(args[2] || 0)
        if (typeof str !== 'string') return ''
        const startIndex = Math.max(0, start - 1) // BASIC is 1-indexed
        return str.substring(startIndex, startIndex + count)
      }
      
      // Joystick functions (Family BASIC v3)
      case 'STICK': {
        const joystickId = this.toNumber(args[0] || 0)
        return this.context.deviceAdapter?.getStickState(joystickId) || 0
      }
      case 'STRIG': {
        const joystickId = this.toNumber(args[0] || 0)
        return this.context.deviceAdapter?.consumeStrigState(joystickId) || 0
      }
      
      default: return 0
    }
  }

  /**
   * Convert a value to a number
   */
  private toNumber(value: number | string | boolean | undefined): number {
    if (typeof value === 'number') return value
    if (typeof value === 'boolean') return value ? 1 : 0
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }
}
