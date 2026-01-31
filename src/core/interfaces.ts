/**
 * Core interfaces for the Family Basic Interpreter
 */

import type { ERROR_TYPES, VARIABLE_TYPES } from './constants'
import type { MoveDefinition, MovementState, SpriteState } from './sprite/types'
import type { ExecutionContext } from './state/ExecutionContext'
import type { BasicArrayValue } from './types/BasicTypes'

/**
 * Represents a BASIC variable with its value and type
 */
export interface BasicVariable {
  value: number | string
  type: (typeof VARIABLE_TYPES)[keyof typeof VARIABLE_TYPES]
}

/**
 * Represents a BASIC error with line number, message, and type
 */
export interface BasicError {
  line: number
  message: string
  type: (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES]
  /** Stack trace for runtime errors (worker or interpreter catch). */
  stack?: string
  /** Source line text at the failing statement. */
  sourceLine?: string
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

  // === SPRITE POSITION QUERY ===
  getSpritePosition(actionNumber: number): { x: number; y: number } | null
  /** Store position for sprite (called when POSITION runs); used so MOVE uses it when no prior START_MOVEMENT. */
  setSpritePosition?(actionNumber: number, x: number, y: number): void
  /** Clear stored position for sprite (e.g. after START_MOVEMENT so next MOVE uses buffer/default). */
  clearSpritePosition?(actionNumber: number): void

  // === TEXT OUTPUT ===
  printOutput(output: string): void
  debugOutput(output: string): void
  errorOutput(output: string): void
  clearScreen(): void
  setCursorPosition(x: number, y: number): void
  setColorPattern(x: number, y: number, pattern: number): void
  setColorPalette(bgPalette: number, spritePalette: number): void
  setBackdropColor(colorCode: number): void
  setCharacterGeneratorMode(mode: number): void

  // === KEYBOARD INPUT (INPUT / LINPUT) ===
  /**
   * Request user input from the IDE. Blocks until main thread sends INPUT_VALUE or execution is stopped.
   * @param prompt - Prompt string to show (e.g. "A=" or "?").
   * @param options - variableCount for INPUT (number of variables), or isLinput: true for LINPUT (single string).
   * @returns Promise resolving to entered values (one per variable for INPUT, single-element for LINPUT).
   *   Rejects if cancelled (e.g. user Stop).
   */
  requestInput?(
    prompt: string,
    options?: { variableCount?: number; isLinput?: boolean }
  ): Promise<string[]>

  // === ANIMATION COMMANDS ===
  sendAnimationCommand?(command: AnimationCommand): void
}

/**
 * Animation command types for real-time communication from web worker to main thread
 */
export type AnimationCommand =
  | {
      type: 'START_MOVEMENT'
      actionNumber: number
      definition: MoveDefinition
      startX: number
      startY: number
    }
  | {
      type: 'STOP_MOVEMENT'
      actionNumbers: number[]
      positions?: Array<{ actionNumber: number; x: number; y: number; remainingDistance: number }>
    }
  | { type: 'ERASE_MOVEMENT'; actionNumbers: number[] }
  | {
      type: 'UPDATE_MOVEMENT_POSITION'
      actionNumber: number
      x: number
      y: number
      remainingDistance: number
    }
  | {
      type: 'SET_POSITION'
      actionNumber: number
      x: number
      y: number
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
  /** Shared animation state buffer (positions + isActive). Used by worker for XPOS/YPOS and MOVE(n). */
  sharedAnimationBuffer?: SharedArrayBuffer
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
  spriteStates?: SpriteState[] // Sprite states from DEF SPRITE and SPRITE commands
  spriteEnabled?: boolean // Whether sprite display is enabled (SPRITE ON/OFF)
  movementStates?: MovementState[] // Movement states from DEF MOVE and MOVE commands
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
  | 'SCREEN_UPDATE'
  | 'SCREEN_CHANGED'
  | 'STOP'
  | 'INIT'
  | 'READY'
  | 'STRIG_EVENT'
  | 'STICK_EVENT'
  | 'ANIMATION_COMMAND'
  | 'SET_SHARED_ANIMATION_BUFFER'
  | 'REQUEST_INPUT'
  | 'INPUT_VALUE'

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

// Screen update message - sent from service worker to UI for screen updates
export interface ScreenUpdateMessage extends ServiceWorkerMessage {
  type: 'SCREEN_UPDATE'
  data: {
    executionId: string
    updateType: 'character' | 'cursor' | 'clear' | 'full' | 'color' | 'palette' | 'cgen' | 'backdrop'
    x?: number
    y?: number
    character?: string
    cursorX?: number
    cursorY?: number
    screenBuffer?: ScreenCell[][]
    colorUpdates?: Array<{ x: number; y: number; pattern: number }>
    bgPalette?: number
    spritePalette?: number
    backdropColor?: number
    cgenMode?: number
    timestamp: number
  }
}

// Screen cell interface for screen buffer
export interface ScreenCell {
  character: string
  colorPattern: number
  x: number
  y: number
}

// Screen changed message - sent from worker to UI when shared screen buffer was updated (no payload)
export interface ScreenChangedMessage extends ServiceWorkerMessage {
  type: 'SCREEN_CHANGED'
  data?: {
    id?: string
    timestamp?: number
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

// Animation command message - sent from web worker to main thread during execution
export interface AnimationCommandMessage extends ServiceWorkerMessage {
  type: 'ANIMATION_COMMAND'
  data: AnimationCommand
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
    /** BASIC line number where the error occurred (1-based). */
    lineNumber?: number
    /** Source line text at the failing statement (for display). */
    sourceLine?: string
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

// Set shared animation buffer - sent from main thread to worker once after worker is created
export interface SetSharedAnimationBufferMessage extends ServiceWorkerMessage {
  type: 'SET_SHARED_ANIMATION_BUFFER'
  data: {
    buffer: SharedArrayBuffer
  }
}

// Request input - sent from worker to main when INPUT/LINPUT executes
export interface RequestInputMessage extends ServiceWorkerMessage {
  type: 'REQUEST_INPUT'
  data: {
    requestId: string
    executionId: string
    prompt: string
    variableCount: number
    isLinput: boolean
  }
}

// Input value - sent from main to worker to resolve a REQUEST_INPUT
export interface InputValueMessage extends ServiceWorkerMessage {
  type: 'INPUT_VALUE'
  data: {
    requestId: string
    values: string[]
    cancelled: boolean
  }
}

// Union type for all possible messages
export type AnyServiceWorkerMessage =
  | ExecuteMessage
  | ResultMessage
  | ProgressMessage
  | OutputMessage
  | ScreenUpdateMessage
  | ScreenChangedMessage
  | StopMessage
  | StrigEventMessage
  | StickEventMessage
  | ErrorMessage
  | InitMessage
  | ReadyMessage
  | AnimationCommandMessage
  | SetSharedAnimationBufferMessage
  | RequestInputMessage
  | InputValueMessage

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
