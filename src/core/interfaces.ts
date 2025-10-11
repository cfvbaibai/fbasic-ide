/**
 * Core interfaces for the Family Basic Interpreter
 */

import { VARIABLE_TYPES, ERROR_TYPES } from './constants'

/**
 * Represents a BASIC variable with its value and type
 */
export interface BasicVariable {
  value: number | string
  type: typeof VARIABLE_TYPES[keyof typeof VARIABLE_TYPES]
}

/**
 * Represents a BASIC error with line number, message, and type
 */
export interface BasicError {
  line: number
  message: string
  type: typeof ERROR_TYPES[keyof typeof ERROR_TYPES]
}

/**
 * Represents a parsed BASIC statement
 */
export interface BasicStatement {
  lineNumber: number
  command: string
  args: string[]
}

/**
 * Represents the state of a FOR loop
 */
export interface LoopState {
  variable: string
  start: number
  end: number
  step: number
  forLine: number
  bodyStartLine: number
  nextLine: number
}

/**
 * Configuration for the BASIC interpreter
 */
export interface InterpreterConfig {
  maxIterations: number
  maxOutputLines: number
  enableDebugMode: boolean
  strictMode: boolean
}

/**
 * Result of code execution
 */
export interface ExecutionResult {
  success: boolean
  output: string
  debugOutput?: string
  errors: BasicError[]
  variables: Map<string, BasicVariable>
  executionTime: number
}

/**
 * Interface for command handlers
 */
export interface CommandHandler {
  execute(_statement: BasicStatement, _context: ExecutionContext): Promise<void>
  validate(_statement: BasicStatement): BasicError[]
}

/**
 * Execution context passed to command handlers
 */
export interface ExecutionContext {
  variables: Map<string, BasicVariable>
  output: string[]
  errors: BasicError[]
  loopStack: LoopState[]
  currentStatementIndex: number
  statements: BasicStatement[]
  shouldStop: boolean
  evaluateExpression(_expr: string): number | string
  jumpToLine(_lineNumber: number): void
}

/**
 * Interface for expression evaluators
 */
export interface ExpressionEvaluator {
  evaluate(_expression: string, _context: ExecutionContext): number | string
  validate(_expression: string): BasicError[]
}

/**
 * Interface for code parsers
 */
export interface CodeParser {
  parse(_code: string): BasicStatement[]
  validate(_statements: BasicStatement[]): BasicError[]
}

/**
 * Interface for syntax highlighters
 */
export interface SyntaxHighlighter {
  highlight(_code: string): string
  getKeywords(): Array<{ word: string; type: string; color: string }>
}

/**
 * Interface for parser information
 */
export interface ParserInfo {
  name: string
  version: string
  capabilities: string[]
  features: string[]
  supportedStatements: string[]
  supportedFunctions: string[]
  supportedOperators: string[]
}

/**
 * Interface for syntax highlighter information
 */
export interface HighlighterInfo {
  name: string
  version: string
  features: string[]
}

/**
 * Interface for error reporters
 */
export interface ErrorReporter {
  report(_error: BasicError): void
  getErrors(): BasicError[]
  clearErrors(): void
}

/**
 * Interface for output managers
 */
export interface OutputManager {
  write(_text: string): void
  writeln(_text?: string): void
  getOutput(): string
  clear(): void
}
