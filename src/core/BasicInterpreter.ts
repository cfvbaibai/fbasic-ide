/**
 * Basic BASIC Interpreter Core - Refactored
 * 
 * A streamlined interpreter for Family Basic (F-BASIC) that delegates
 * to focused utility classes for better maintainability.
 * 
 * @author Family Basic IDE Team
 * @version 2.0.0
 */

import { 
  EXECUTION_LIMITS, 
  ERROR_TYPES
} from './constants'
import type { 
  BasicVariable, 
  BasicError, 
  InterpreterConfig, 
  ExecutionResult
} from './interfaces'

// Import the FBasicParser
import { FBasicParser } from './parser/FBasicParser'
import type {
  StatementNode,
  PrintStatementNode,
  LetStatementNode,
  IfStatementNode,
  ForStatementNode,
  NextStatementNode,
  GotoStatementNode,
  GosubStatementNode,
  ReturnStatementNode,
  InputStatementNode,
  DataStatementNode,
  ReadStatementNode,
  RestoreStatementNode,
  DimStatementNode,
  ClsStatementNode,
  ColorStatementNode,
  StatementBlockNode,
  ExpressionNode,
  FunctionCallNode,
  CommandNode,
} from './parser/ast-types'

import { isEmpty } from 'lodash-es'

interface LoopState {
  variableName: string
  startValue: number
  endValue: number
  stepValue: number
  currentValue: number
  returnLine: number
}

/**
 * Main interpreter class for executing Family Basic programs
 * 
 * This refactored version delegates to utility functions to keep
 * the main class focused on orchestration rather than implementation.
 */
export class BasicInterpreter {
  private variables: Map<string, BasicVariable> = new Map()
  private output: string[] = []
  private errors: BasicError[] = []
  private isRunning = false
  private shouldStop = false
  private currentStatementIndex = 0
  private statements: StatementNode[] = []
  private config: InterpreterConfig
  private iterationCount = 0
  private parser: FBasicParser
  private loopStack: LoopState[] = []
  private gosubStack: number[] = [] // Stack for GOSUB/RETURN
  private dataValues: (number | string)[] = [] // Storage for DATA values
  private dataIndex = 0 // Current position in DATA
  private arrays: Map<string, (number | string)[]> = new Map() // Array storage
  private debugOutput: string[] = [] // Debug output buffer

  constructor(config?: Partial<InterpreterConfig>) {
    this.config = {
      maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS,
      maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES,
      enableDebugMode: false,
      strictMode: false,
      ...config
    }
    this.parser = new FBasicParser()
  }

  /**
   * Executes a BASIC program
   */
  async execute(code: string): Promise<ExecutionResult> {
    const startTime = Date.now()
    this.reset()
    await this.parseCode(code)
    
    if (!isEmpty(this.errors)) {
      return {
        success: false,
        output: this.output.join('\n'),
        debugOutput: this.config.enableDebugMode ? this.debugOutput.join('\n') : undefined,
        errors: this.errors,
        variables: this.variables,
        executionTime: Date.now() - startTime
      }
    }

    // Global flattening: expand all statement blocks before any execution
    this.flattenAllStatements()

    // Preprocess DATA statements - execute them first to populate dataValues
    this.preprocessDataStatements()

    this.isRunning = true
    this.shouldStop = false
    this.currentStatementIndex = 0
    this.iterationCount = 0

    this.debugLog('=== EXECUTION STARTED ===')
    this.debugLog(`Total statements: ${this.statements.length}`)
    this.debugData()

    try {
      await this.executeStatements()
    } catch (error) {
      this.errors.push({
        line: 0,
        message: `Execution error: ${error}`,
        type: ERROR_TYPES.RUNTIME
      })
    } finally {
      this.isRunning = false
      this.debugLog('=== EXECUTION COMPLETED ===')
      this.debugVariables()
      this.debugArrays()
      this.debugStack()
    }

    return {
      success: isEmpty(this.errors),
      output: this.output.join('\n'),
      debugOutput: this.config.enableDebugMode ? this.debugOutput.join('\n') : undefined,
      errors: this.errors,
      variables: this.variables,
      executionTime: Date.now() - startTime
    }
  }

  /**
   * Stops the current execution
   */
  stop(): void {
    this.shouldStop = true
  }

  /**
   * Resets the interpreter state
   */
  reset(): void {
    this.variables.clear()
    this.output = []
    this.errors = []
    this.isRunning = false
    this.shouldStop = false
    this.currentStatementIndex = 0
    this.statements = []
    this.iterationCount = 0
    this.loopStack = []
    this.gosubStack = []
    this.dataValues = []
    this.dataIndex = 0
    this.arrays.clear()
    this.debugOutput = []
  }

  /**
   * Gets the current output
   */
  getOutput(): string {
    return this.output.join('\n')
  }

  /**
   * Gets the debug output (only available when debug mode is enabled)
   */
  getDebugOutput(): string {
    return this.debugOutput.join('\n')
  }

  /**
   * Gets all errors
   */
  getErrors(): BasicError[] {
    return [...this.errors]
  }

  /**
   * Gets all variables
   */
  getVariables(): Map<string, BasicVariable> {
    return new Map(this.variables)
  }

  /**
   * Gets the current configuration
   */
  getConfig(): InterpreterConfig {
    return { ...this.config }
  }

  /**
   * Checks if the interpreter is currently running
   */
  isCurrentlyRunning(): boolean {
    return this.isRunning
  }

  /**
   * Checks if the interpreter is currently executing (alias for isCurrentlyRunning)
   */
  isExecuting(): boolean {
    return this.isRunning
  }

  // Private methods - delegated to utilities
  private async parseCode(code: string): Promise<StatementNode[]> {
    this.statements = []
    
    // Handle empty code
    if (!code.trim()) {
      return this.statements
    }
    
    try {
      const parseResult = await this.parser.parse(code)
      
      if (parseResult.success && parseResult.ast) {
        // Use AST statements directly
        this.statements = parseResult.ast.statements
      } else {
        // Handle parsing errors
        if (parseResult.errors) {
          parseResult.errors.forEach(error => {
            let lineNumber = 0
            if (error.location?.start?.line) {
              // Extract BASIC line number from the source text
              const lines = code.split('\n')
              const textLine = error.location.start.line - 1 // Convert to 0-based
              if (textLine >= 0 && textLine < lines.length) {
                const lineText = lines[textLine]
                if (lineText) {
                  const match = lineText.match(/^(\d+)/)
                  if (match && match[1]) {
                    lineNumber = parseInt(match[1], 10)
                  }
                }
              }
            }
            this.errors.push({
              line: lineNumber,
              message: error.message,
              type: ERROR_TYPES.SYNTAX
            })
          })
        } else {
          this.errors.push({
            line: 0,
            message: 'Failed to parse code',
            type: ERROR_TYPES.SYNTAX
          })
        }
      }
    } catch (error) {
      this.errors.push({
        line: 0,
        message: `Parser error: ${error}`,
        type: ERROR_TYPES.SYNTAX
      })
    }

    return this.statements
  }

  /**
   * Globally flattens all statement blocks before execution
   * This ensures that all colon-separated statements are expanded
   * before any interpretation logic runs
   */
  private flattenAllStatements(): void {
    const flattenedStatements: StatementNode[] = []
    
    for (const statement of this.statements) {
      if (statement.command.type === 'StatementBlock') {
        // Expand the statement block into individual statements
        const block = statement.command as StatementBlockNode
        const expandedStatements = this.expandStatementBlock(block.statements, statement.lineNumber)
        flattenedStatements.push(...expandedStatements)
      } else if (statement.command.type === 'IfStatement') {
        // Handle IF statements that might have StatementBlock in thenStatement
        const ifStmt = statement.command as IfStatementNode
        if (ifStmt.thenStatement.type === 'StatementBlock') {
          // Flatten the thenStatement but keep it as a single IF statement
          const block = ifStmt.thenStatement as StatementBlockNode
          const expandedStatements = this.expandStatementBlock(block.statements, statement.lineNumber)
          
          // Create a single IF statement with the flattened statements as a new StatementBlock
          flattenedStatements.push({
            type: 'Statement',
            lineNumber: statement.lineNumber,
            command: {
              type: 'IfStatement',
              condition: ifStmt.condition,
              thenStatement: {
                type: 'StatementBlock',
                statements: expandedStatements.map(stmt => stmt.command)
              }
            }
          })
        } else {
          // Keep non-block IF statements as-is
          flattenedStatements.push(statement)
        }
      } else {
        // Keep non-block statements as-is
        flattenedStatements.push(statement)
      }
    }
    
    // Replace the original statements with flattened ones
    this.statements = flattenedStatements
  }

  /**
   * Preprocesses DATA statements to populate dataValues before execution
   */
  private preprocessDataStatements(): void {
    // Execute all DATA statements first to populate dataValues
    for (const statement of this.statements) {
      if (statement.command.type === 'DataStatement') {
        this.executeDataStatement(statement.command)
      }
    }
  }

  /**
   * Recursively expands a statement block into individual statements
   */
  private expandStatementBlock(commands: CommandNode[], lineNumber: number): StatementNode[] {
    const expanded: StatementNode[] = []
    
    for (const command of commands) {
      if (command.type === 'StatementBlock') {
        // Recursively expand nested statement blocks
        const nestedExpanded = this.expandStatementBlock(command.statements, lineNumber)
        expanded.push(...nestedExpanded)
      } else {
        // Create a statement node for each command
        expanded.push({
          type: 'Statement',
          lineNumber: lineNumber,
          command: command
        })
      }
    }
    
    return expanded
  }

  private async executeStatements(): Promise<void> {
    while (this.currentStatementIndex < this.statements.length && !this.shouldStop) {
      this.iterationCount++
      if (this.iterationCount > this.config.maxIterations) {
        this.errors.push({
          line: 0,
          message: 'Maximum iterations exceeded. Possible infinite loop detected.',
          type: ERROR_TYPES.RUNTIME
        })
        break
      }

      const statement = this.statements[this.currentStatementIndex]
      if (!statement) {
        this.currentStatementIndex++
        continue
      }

      try {
        this.debugStatement(statement, 'Executing')
        await this.executeStatement(statement)
        
        // Advance to next statement
        this.currentStatementIndex++

        await new Promise(resolve => setTimeout(resolve, 0))
      } catch (error) {
        this.errors.push({
          line: statement.lineNumber,
          message: `Runtime error: ${error}`,
          type: ERROR_TYPES.RUNTIME
        })
        break
      }
    }
  }

  private async executeStatement(statement: StatementNode): Promise<void> {
    const { command, lineNumber } = statement

    switch (command.type) {
      case 'PrintStatement':
        this.executePrintStatement(command)
        break

      case 'LetStatement':
        this.executeLetStatement(command)
        break

      case 'IfStatement':
        this.executeIfStatement(command)
        break

      case 'ForStatement':
        this.executeForStatement(command)
        break

      case 'NextStatement':
        this.executeNextStatement(command)
        break

      case 'EndStatement':
        this.shouldStop = true
        break

      case 'RemStatement':
        // Comments are ignored during execution
        break

      case 'StatementBlock':
        this.executeStatementBlock(command)
        break
        
      case 'GotoStatement':
        this.executeGotoStatement(command)
        break

      case 'GosubStatement':
        this.executeGosubStatement(command)
        break

      case 'ReturnStatement':
        this.executeReturnStatement(command)
        break

      case 'InputStatement':
        this.executeInputStatement(command)
        break

      case 'DataStatement':
        // DATA statements are already processed during preprocessing
        break

      case 'ReadStatement':
        this.executeReadStatement(command)
        break

      case 'RestoreStatement':
        this.executeRestoreStatement(command)
        break

      case 'DimStatement':
        this.executeDimStatement(command)
        break

      case 'ClsStatement':
        this.executeClsStatement(command)
        break

      case 'ColorStatement':
        this.executeColorStatement(command)
        break

      case 'InvalidCommand':
        this.errors.push({
          line: lineNumber,
          message: `Invalid command: ${command.command}`,
          type: ERROR_TYPES.SYNTAX
        })
        break

      default:
        this.errors.push({
          line: lineNumber,
          message: `Unknown command: ${command.type}`,
          type: ERROR_TYPES.SYNTAX
        })
    }
  }

  private jumpToLine(lineNumber: number): void {
    const targetIndex = this.statements.findIndex(stmt => stmt.lineNumber === lineNumber)
    if (targetIndex !== -1) {
      this.currentStatementIndex = targetIndex
    }
  }

  // AST-based statement execution methods
  private executePrintStatement(printStmt: PrintStatementNode): void {
    if (!printStmt.printList || printStmt.printList.length === 0) {
      this.debugLog('PRINT: Empty print list, outputting blank line')
      this.output.push('')
      return
    }

    const printItems = printStmt.printList.map((item) => {
      if (item.type === 'StringLiteral') {
        return item.value
      } else if (item.type === 'Expression' && item.expression.type === 'StringLiteral') {
        // Handle string literals wrapped in Expression nodes
        return item.expression.value
      } else {
        // It's an ExpressionNode (BinaryExpression, UnaryExpression, FunctionCall, etc.)
        return this.evaluateExpression(item)
      }
    })

    const outputText = printItems.join('')
    this.debugLog(`PRINT: Outputting "${outputText}"`)
    this.output.push(outputText)
  }

  private executeLetStatement(letStmt: LetStatementNode): void {
    const variableName = letStmt.variable.name
    const value = this.evaluateExpression(letStmt.expression)
    
    // Convert boolean to number for BASIC compatibility
    const basicValue = typeof value === 'boolean' ? (value ? 1 : 0) : value
    
    if (letStmt.variable.subscript) {
      // Array assignment
      const array = this.arrays.get(variableName)
      if (array) {
        const indices = letStmt.variable.subscript.map(index => this.evaluateExpression(index))
        let target: (number | string)[] | (number | string) = array
        for (let i = 0; i < indices.length - 1; i++) {
          const numIndex = this.toNumber(indices[i] ?? 0)
          if (Array.isArray(target)) {
            const element: number | string | undefined = target[Math.floor(numIndex)]
            target = element !== undefined ? element : 0
          } else {
            target = 0 // Default fallback
          }
        }
        const lastIndex = this.toNumber(indices[indices.length - 1] ?? 0)
        if (Array.isArray(target)) {
          target[Math.floor(lastIndex)] = basicValue
        }
        this.debugLog(`LET: Array ${variableName}[${indices.join(',')}] = ${basicValue}`)
      }
    } else {
      // Simple variable assignment
      this.variables.set(variableName, {
        value: basicValue,
        type: typeof basicValue === 'string' ? 'string' : 'number'
      })
      this.debugLog(`LET: Variable ${variableName} = ${basicValue}`)
    }
  }

  private executeIfStatement(ifStmt: IfStatementNode): void {
    const condition = this.evaluateExpression(ifStmt.condition)
    this.debugLog(`IF: Condition evaluated to ${condition}`)
    
    if (condition) {
      this.debugLog('IF: Condition is true, executing THEN statement')
      // Execute the then statement
      this.executeStatement({
        type: 'Statement',
        lineNumber: 0, // Will be set by the caller
        command: ifStmt.thenStatement
      })
    } else {
      this.debugLog('IF: Condition is false, skipping THEN statement')
    }
  }

  private executeStatementBlock(block: StatementBlockNode): void {
    // Execute each statement in the block sequentially
    for (const command of block.statements) {
      this.executeStatement({
        type: 'Statement',
        lineNumber: 0, // Will be set by the caller
        command: command
      })
    }
  }

  private executeForStatement(forStmt: ForStatementNode): void {
    // Initialize the loop variable
    const variableName = forStmt.variable.name
    const startValue = this.evaluateExpression(forStmt.start)
    const endValue = this.evaluateExpression(forStmt.end)
    const stepValue = forStmt.step ? this.evaluateExpression(forStmt.step) : 1
    
    // Convert boolean to number for BASIC compatibility
    const basicStartValue = typeof startValue === 'boolean' ? (startValue ? 1 : 0) : (typeof startValue === 'string' ? parseFloat(startValue) || 0 : startValue)
    const basicEndValue = typeof endValue === 'boolean' ? (endValue ? 1 : 0) : (typeof endValue === 'string' ? parseFloat(endValue) || 0 : endValue)
    const basicStepValue = typeof stepValue === 'boolean' ? (stepValue ? 1 : 0) : (typeof stepValue === 'string' ? parseFloat(stepValue) || 1 : stepValue)

    this.variables.set(variableName, {
      value: basicStartValue,
      type: 'number'
    })

    // Check if loop should execute at all
    const shouldExecute = basicStepValue > 0
      ? basicStartValue <= basicEndValue
      : basicStartValue >= basicEndValue

    if (!shouldExecute) {
      // Skip the entire loop by jumping to the NEXT statement
      // Find the matching NEXT statement
      let nextIndex = this.currentStatementIndex + 1
      let loopDepth = 1
      
      while (nextIndex < this.statements.length && loopDepth > 0) {
        const stmt = this.statements[nextIndex]
        if (stmt && stmt.command.type === 'ForStatement') {
          loopDepth++
        } else if (stmt && stmt.command.type === 'NextStatement') {
          loopDepth--
        }
        nextIndex++
      }
      
      // Jump to the NEXT statement (or end of program)
      this.currentStatementIndex = nextIndex - 1 // -1 because we'll increment after this
      return
    }

    // Store loop state for NEXT statement
    this.loopStack.push({
      variableName,
      startValue: basicStartValue,
      endValue: basicEndValue,
      stepValue: basicStepValue,
      currentValue: basicStartValue,
      returnLine: this.currentStatementIndex + 1 // Line after FOR
    })
  }

  private executeNextStatement(nextStmt: NextStatementNode): void {
    if (this.loopStack.length === 0) {
      this.errors.push({
        line: 0,
        message: 'NEXT without FOR',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    const loopState = this.loopStack[this.loopStack.length - 1]
    
    if (!loopState) {
      this.errors.push({
        line: 0,
        message: 'NEXT without FOR',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }
    
    // Check if the NEXT variable matches the current loop variable
    if (nextStmt.variable && nextStmt.variable.name !== loopState.variableName) {
      this.errors.push({
        line: 0,
        message: `NEXT variable ${nextStmt.variable.name} does not match FOR variable ${loopState.variableName}`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Increment the loop variable
    loopState.currentValue += loopState.stepValue
    this.variables.set(loopState.variableName, {
      value: loopState.currentValue,
      type: 'number'
    })

    // Check if we should continue the loop
    const shouldContinue = loopState.stepValue > 0 
      ? loopState.currentValue <= loopState.endValue
      : loopState.currentValue >= loopState.endValue

    if (shouldContinue) {
      // Jump back to the line after the FOR statement
      this.currentStatementIndex = loopState.returnLine - 1 // -1 because we'll increment after this
    } else {
      // Loop is done, remove from stack
      this.loopStack.pop()
    }
  }

  private executeGotoStatement(gotoStmt: GotoStatementNode): void {
    const targetLine = this.evaluateExpression(gotoStmt.target)
    this.debugLog(`GOTO: Jumping to line ${targetLine}`)
    
    if (typeof targetLine !== 'number') {
      this.debugLog('GOTO: Error - target must be a number')
      this.errors.push({
        line: 0, // Will be set by caller
        message: 'GOTO target must be a number',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }
    
    // Find the statement with the target line number
    const targetIndex = this.statements.findIndex(stmt => stmt.lineNumber === targetLine)
    
    if (targetIndex === -1) {
      this.debugLog(`GOTO: Error - target line ${targetLine} not found`)
      this.errors.push({
        line: 0, // Will be set by caller
        message: `Line ${targetLine} not found`,
        type: ERROR_TYPES.RUNTIME
      })
      return
    }
    
    this.debugLog(`GOTO: Found target at statement index ${targetIndex}`)
    // Set the current statement index to jump to the target
    this.currentStatementIndex = targetIndex - 1 // Will be incremented in the main loop
  }

  private toNumber(value: number | string | boolean): number {
    if (typeof value === 'number') return value
    if (typeof value === 'boolean') return value ? 1 : 0
    if (typeof value === 'string') return parseFloat(value) || 0
    return 0
  }

  // ===== DEBUG MODE METHODS =====

  private debugLog(message: string): void {
    if (this.config.enableDebugMode) {
      this.debugOutput.push(`[DEBUG] ${message}`)
    }
  }

  private debugStatement(statement: StatementNode, action: string): void {
    if (this.config.enableDebugMode) {
      const commandType = statement.command.type
      this.debugLog(`Line ${statement.lineNumber}: ${action} ${commandType}`)
    }
  }

  private debugVariables(): void {
    if (this.config.enableDebugMode) {
      this.debugLog('Current variables:')
      for (const [name, variable] of this.variables) {
        this.debugLog(`  ${name} = ${variable.value} (${variable.type})`)
      }
      if (this.variables.size === 0) {
        this.debugLog('  (no variables defined)')
      }
    }
  }

  private debugArrays(): void {
    if (this.config.enableDebugMode) {
      this.debugLog('Current arrays:')
      for (const [name, array] of this.arrays) {
        this.debugLog(`  ${name} = [${array.slice(0, 10).join(', ')}${array.length > 10 ? '...' : ''}]`)
      }
      if (this.arrays.size === 0) {
        this.debugLog('  (no arrays defined)')
      }
    }
  }

  private debugData(): void {
    if (this.config.enableDebugMode) {
      this.debugLog(`DATA values: [${this.dataValues.join(', ')}] (index: ${this.dataIndex})`)
    }
  }

  private debugStack(): void {
    if (this.config.enableDebugMode) {
      this.debugLog(`GOSUB stack: [${this.gosubStack.join(', ')}]`)
      this.debugLog(`Loop stack: [${this.loopStack.map(l => `${l.variableName}=${l.currentValue}`).join(', ')}]`)
    }
  }

  private evaluateExpression(expr: ExpressionNode): number | string | boolean {
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
          const array = this.arrays.get(expr.name)
          if (array) {
            const indices = expr.subscript.map(index => this.evaluateExpression(index))
            let value: (number | string)[] | (number | string) = array
            for (const index of indices) {
              const numIndex = this.toNumber(index)
              if (Array.isArray(value)) {
                const element: number | string | undefined = value[Math.floor(numIndex)]
                value = element !== undefined ? element : 0
              } else {
                value = 0 // Default fallback
              }
            }
            return (value !== undefined && typeof value !== 'object') ? value : 0
          }
          return 0
        } else {
          // Simple variable
          const variable = this.variables.get(expr.name)
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

  private evaluateFunctionCall(funcCall: FunctionCallNode): number | string | boolean {
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
      
      default: return 0
    }
  }

  // ===== MISSING STATEMENT IMPLEMENTATIONS =====

  private executeGosubStatement(gosubStmt: GosubStatementNode): void {
    // Push current statement index onto GOSUB stack
    this.gosubStack.push(this.currentStatementIndex)

    // Jump to the target line
    const targetLine = this.evaluateExpression(gosubStmt.target)
    const targetIndex = this.findStatementIndexByLine(this.toNumber(targetLine))

    if (targetIndex !== -1) {
      this.currentStatementIndex = targetIndex - 1 // -1 because the loop will increment it
    } else {
      this.errors.push({
        line: 0,
        message: `GOSUB target line ${targetLine} not found`,
        type: ERROR_TYPES.RUNTIME
      })
    }
  }

  private executeReturnStatement(_returnStmt: ReturnStatementNode): void {
    if (this.gosubStack.length === 0) {
      this.errors.push({
        line: 0,
        message: 'RETURN without GOSUB',
        type: ERROR_TYPES.RUNTIME
      })
      return
    }

    // Pop return address from GOSUB stack
    const returnIndex = this.gosubStack.pop()!
    this.currentStatementIndex = returnIndex
  }

  private executeInputStatement(inputStmt: InputStatementNode): void {
    // For now, just set variables to default values
    // In a real implementation, this would prompt for user input
    // TODO: Implement real reading value from user input
    for (const variable of inputStmt.variables) {
      this.variables.set(variable.name, {
        value: 0,
        type: 'number'
      })
    }
  }

  private executeDataStatement(dataStmt: DataStatementNode): void {
    // Add data values to the data storage
    for (const constant of dataStmt.constants) {
      if (constant.type === 'NumberLiteral') {
        this.dataValues.push(constant.value)
      } else if (constant.type === 'StringLiteral') {
        this.dataValues.push(constant.value)
      } else {
        // Evaluate expression for computed values
        const value = this.evaluateExpression(constant)
        this.dataValues.push(typeof value === 'boolean' ? (value ? 1 : 0) : value)
      }
    }
  }

  private executeReadStatement(readStmt: ReadStatementNode): void {
    // Read values from DATA and assign to variables
    this.debugLog(`READ: Reading ${readStmt.variables.length} variables from DATA`)
    for (const variable of readStmt.variables) {
      if (this.dataIndex < this.dataValues.length) {
        const value = this.dataValues[this.dataIndex] ?? 0
        this.debugLog(`READ: Reading value ${value} from DATA index ${this.dataIndex}`)
        this.dataIndex++
        
        if (variable.subscript) {
          // Array assignment
          const array = this.arrays.get(variable.name)
          if (array) {
            const indices = variable.subscript.map(index => this.evaluateExpression(index))
            let target: (number | string)[] | (number | string) = array
            for (let i = 0; i < indices.length - 1; i++) {
              const numIndex = this.toNumber(indices[i] ?? 0)
              if (Array.isArray(target)) {
                const element: number | string | undefined = target[Math.floor(numIndex)]
                target = element !== undefined ? element : 0
              } else {
                target = 0 // Default fallback
              }
            }
            const lastIndex = this.toNumber(indices[indices.length - 1] ?? 0)
            if (Array.isArray(target)) {
              target[Math.floor(lastIndex)] = value
            }
            this.debugLog(`READ: Array ${variable.name}[${indices.join(',')}] = ${value}`)
          }
        } else {
          // Simple variable assignment
          this.variables.set(variable.name, {
            value: value,
            type: typeof value === 'string' ? 'string' : 'number'
          })
          this.debugLog(`READ: Variable ${variable.name} = ${value}`)
        }
      } else {
        this.debugLog('READ: Error - Out of DATA')
        this.errors.push({
          line: 0,
          message: 'Out of DATA',
          type: ERROR_TYPES.RUNTIME
        })
        break
      }
    }
  }

  private executeRestoreStatement(_restoreStmt: RestoreStatementNode): void {
    // Reset DATA pointer
    if (_restoreStmt.lineNumber) {
      // Find the specified line and reset to that point
      // const targetLine = this.evaluateExpression(_restoreStmt.lineNumber)
      this.dataIndex = 0 // Simplified: just reset to beginning
    } else {
      this.dataIndex = 0
    }
  }

  private executeDimStatement(dimStmt: DimStatementNode): void {
    // Create arrays with specified dimensions
    for (const arrayDecl of dimStmt.arrays) {
      const arrayName = arrayDecl.variable.name
      const dimensions = arrayDecl.dimensions.map(dim => this.toNumber(this.evaluateExpression(dim)))
      
      // Create multi-dimensional array
      let array: (number | string)[] = []
      for (let i = 0; i < (dimensions[0] ?? 0); i++) {
        if (dimensions.length === 1) {
          array[i] = 0
        } else {
          // For multi-dimensional arrays, we need to create nested arrays
          // This is a simplified implementation - in a real BASIC interpreter,
          // you'd need more sophisticated multi-dimensional array handling
          array[i] = 0 // Simplified: just initialize as 0 for now
        }
      }
      
      this.arrays.set(arrayName, array)
    }
  }

  private executeClsStatement(_clsStmt: ClsStatementNode): void {
    // Clear screen - remove all output
    this.output = []
  }

  private executeColorStatement(colorStmt: ColorStatementNode): void {
    // Set colors - for now just store the values
    const foreground = this.toNumber(this.evaluateExpression(colorStmt.foreground))
    const background = colorStmt.background ? this.toNumber(this.evaluateExpression(colorStmt.background)) : 0
    
    // Store color settings in variables
    this.variables.set('_FOREGROUND', {
      value: foreground,
      type: 'number'
    })
    
    if (colorStmt.background) {
      this.variables.set('_BACKGROUND', {
        value: background,
        type: 'number'
      })
    }
  }

  private findStatementIndexByLine(lineNumber: number): number {
    for (let i = 0; i < this.statements.length; i++) {
      if (this.statements[i]?.lineNumber === lineNumber) {
        return i
      }
    }
    return -1
  }

  /**
   * Updates the interpreter configuration
   */
  updateConfig(newConfig: Partial<InterpreterConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    }
  }

}