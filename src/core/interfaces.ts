/**
 * Core interfaces for the Family Basic Interpreter
 */

import { VARIABLE_TYPES, ERROR_TYPES } from './constants'
import type { ExecutionContext } from './state/ExecutionContext'
import type { BasicArrayValue } from './types/BasicTypes'

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
 * Basic Device Adapter interface for Family BASIC interpreter
 * 
 * Handles all input/output/debugging/audio features needed for Family BASIC
 */
export interface BasicDeviceAdapter {
  // === JOYSTICK INPUT ===
  getJoystickCount(): number
  getStickState(joystickId: number): number
  setStickState(joystickId: number, state: number): void
  pushStrigState(joystickId: number, state: number): void
  consumeStrigState(joystickId: number): number
  
  // === TEXT OUTPUT ===
  printOutput(output: string): void
  debugOutput(output: string): void
  errorOutput(output: string): void
  clearScreen(): void
}

/**
 * Configuration for the BASIC interpreter
 */
export interface InterpreterConfig {
  maxIterations: number
  maxOutputLines: number
  enableDebugMode: boolean
  strictMode: boolean
  deviceAdapter?: BasicDeviceAdapter
}

/**
 * Result of code execution
 */
export interface ExecutionResult {
  success: boolean
  errors: BasicError[]
  variables: Map<string, BasicVariable>
  arrays?: Map<string, BasicArrayValue> // Arrays declared/used during execution
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

/**
 * Service Worker message types for BASIC interpreter
 */

// Base message interface for all service worker communication
export interface ServiceWorkerMessage {
  type: ServiceWorkerMessageType
  id: string
  timestamp: number
}

// Message types enum for better type safety
export type ServiceWorkerMessageType = 
  | 'EXECUTE'
  | 'RESULT'
  | 'ERROR'
  | 'PROGRESS'
  | 'OUTPUT'
  | 'STOP'
  | 'INIT'
  | 'READY'
  | 'STRIG_EVENT'
  | 'STICK_EVENT'

// Execute message - sent from UI to service worker
export interface ExecuteMessage extends ServiceWorkerMessage {
  type: 'EXECUTE'
  data: {
    code: string
    config: InterpreterConfig
    options?: {
      timeout?: number
      enableProgress?: boolean
    }
  }
}

// Result message - sent from service worker to UI
export interface ResultMessage extends ServiceWorkerMessage {
  type: 'RESULT'
  data: ExecutionResult & {
    executionId: string
    workerId?: string
  }
}

// Progress message - sent from service worker to UI during execution
export interface ProgressMessage extends ServiceWorkerMessage {
  type: 'PROGRESS'
  data: {
    executionId: string
    iterationCount: number
    currentStatement?: string
    progress: {
      completed: number
      total: number
      percentage: number
    }
    estimatedTimeRemaining?: number
  }
}

// Output message - sent from service worker to UI for real-time output
export interface OutputMessage extends ServiceWorkerMessage {
  type: 'OUTPUT'
  data: {
    executionId: string
    output: string
    outputType: 'print' | 'debug' | 'error'
    timestamp: number
  }
}

// Stop message - sent from UI to service worker
export interface StopMessage extends ServiceWorkerMessage {
  type: 'STOP'
  data: {
    executionId: string
    reason?: 'user_request' | 'timeout' | 'error'
  }
}

// STRIG event message - sent from main thread to service worker
export interface StrigEventMessage extends ServiceWorkerMessage {
  type: 'STRIG_EVENT'
  data: {
    joystickId: number
    state: number
    timestamp: number
  }
}

// STICK event message - sent from main thread to service worker
export interface StickEventMessage extends ServiceWorkerMessage {
  type: 'STICK_EVENT'
  data: {
    joystickId: number
    state: number
    timestamp: number
  }
}

// Error message - sent from service worker to UI
export interface ErrorMessage extends ServiceWorkerMessage {
  type: 'ERROR'
  data: {
    executionId: string
    message: string
    stack?: string
    errorType: 'execution' | 'timeout' | 'initialization' | 'communication'
    recoverable: boolean
  }
}

// Init message - sent from service worker to UI on startup
export interface InitMessage extends ServiceWorkerMessage {
  type: 'INIT'
  data: {
    workerId: string
    capabilities: string[]
    version: string
  }
}

// Ready message - sent from service worker to UI when ready
export interface ReadyMessage extends ServiceWorkerMessage {
  type: 'READY'
  data: {
    workerId: string
    status: 'ready' | 'busy' | 'error'
  }
}

// Union type for all possible messages
export type AnyServiceWorkerMessage = 
  | ExecuteMessage
  | ResultMessage
  | ProgressMessage
  | OutputMessage
  | StopMessage
  | StrigEventMessage
  | StickEventMessage
  | ErrorMessage
  | InitMessage
  | ReadyMessage

// Message handler interface for type-safe message handling
export interface ServiceWorkerMessageHandler {
  handleExecute(message: ExecuteMessage): Promise<void>
  handleResult(message: ResultMessage): void
  handleProgress(message: ProgressMessage): void
  handleOutput(message: OutputMessage): void
  handleStop(message: StopMessage): void
  handleError(message: ErrorMessage): void
  handleInit(message: InitMessage): void
  handleReady(message: ReadyMessage): void
}
