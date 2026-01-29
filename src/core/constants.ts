/**
 * Constants for the Family Basic Interpreter
 *
 * This module contains all configuration constants, limits, and default values
 * used throughout the interpreter. Centralizing these values improves
 * maintainability and makes configuration changes easier.
 *
 * @author Family Basic IDE Team
 * @version 1.0.0
 */

// Execution limits
export const EXECUTION_LIMITS = {
  // Test environment limits (strict to prevent infinite loops in tests)
  MAX_ITERATIONS_TEST: 10000,
  MAX_OUTPUT_LINES_TEST: 1000,

  // Production environment limits (more permissive for real user interaction)
  MAX_ITERATIONS_PRODUCTION: 1000000, // Much higher limit for production
  MAX_OUTPUT_LINES_PRODUCTION: 10000,

  // Legacy limits (for backward compatibility)
  MAX_ITERATIONS: 10000,
  MAX_OUTPUT_LINES: 1000,

  // Other limits (same for both environments)
  MAX_LINE_NUMBER: 99999,
  MAX_VARIABLE_NAME_LENGTH: 255,
  MAX_STRING_LENGTH: 32767,
} as const

// Line number increments (BASIC typically uses 10)
export const LINE_NUMBER_INCREMENT = 10

// Default values
export const DEFAULTS = {
  FOR_LOOP_STEP: 1,
  TAB_SIZE: 2,
  MAX_OUTPUT_LINES: 1000,
  ASYNC_EXECUTION: {
    ENABLED_PRODUCTION: true,
    ENABLED_TEST: false,
    YIELD_INTERVAL: 100, // Yield every 100 iterations in production
    YIELD_DURATION: 1, // Yield for 1ms to allow browser to process events
  },
  WEB_WORKER: {
    ENABLED_PRODUCTION: true,
    ENABLED_TEST: false,
    WORKER_SCRIPT: '/basic-interpreter-worker.js',
    MESSAGE_TIMEOUT: 30000, // 30 seconds timeout for web worker messages
  },
} as const

// Error types
export const ERROR_TYPES = {
  SYNTAX: 'SYNTAX',
  RUNTIME: 'RUNTIME',
  COMPILATION: 'COMPILATION',
} as const

// Variable types
export const VARIABLE_TYPES = {
  NUMBER: 'number',
  STRING: 'string',
} as const

// Command names
export const COMMANDS = {
  PRINT: 'PRINT',
  LET: 'LET',
  FOR: 'FOR',
  NEXT: 'NEXT',
  IF: 'IF',
  THEN: 'THEN',
  GOTO: 'GOTO',
  END: 'END',
  STEP: 'STEP',
  TO: 'TO',
} as const

// Operators
export const OPERATORS = {
  EQUALS: '=',
  PLUS: '+',
  MINUS: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  GREATER_THAN: '>',
  LESS_THAN: '<',
  GREATER_EQUAL: '>=',
  LESS_EQUAL: '<=',
  NOT_EQUAL: '<>',
} as const

// String delimiters
export const STRING_DELIMITERS = {
  DOUBLE_QUOTE: '"',
  SINGLE_QUOTE: "'",
} as const

// Output separators
export const OUTPUT_SEPARATORS = {
  SEMICOLON: ';',
  COMMA: ',',
  TAB: '\t',
  NEWLINE: '\n',
} as const

// Regular expressions
export const REGEX_PATTERNS = {
  LINE_NUMBER: /^(\d+)/,
  VARIABLE_NAME: /^[A-Za-z][A-Za-z0-9$]*$/,
  STRING_LITERAL: /^["'].*["']$/,
  NUMBER_LITERAL: /^-?\d+(\.\d+)?$/,
  OPERATOR: /[+\-*/()]/,
} as const

// Whitespace characters
export const WHITESPACE = {
  SPACE: ' ',
  TAB: '\t',
  NEWLINE: '\n',
} as const

// Common separators
export const SEPARATORS = {
  COMMA: ',',
  SEMICOLON: ';',
} as const

// Timing constants
export const TIMING = {
  FRAME_RATE: 30, // Family BASIC frame rate (frames per second)
  FRAME_DURATION_MS: 1000 / 30, // Duration of one frame in milliseconds (~33.33ms)
} as const

// Screen dimensions and coordinate limits
export const SCREEN_DIMENSIONS = {
  BACKGROUND: {
    MAX_X: 27, // Maximum X coordinate (0-27, 28 columns)
    MAX_Y: 23, // Maximum Y coordinate (0-23, 24 lines)
    COLUMNS: 28, // Total columns
    LINES: 24, // Total lines
  },
  BACKDROP: {
    MAX_X: 31, // Maximum X coordinate (0-31, 32 columns)
    MAX_Y: 29, // Maximum Y coordinate (0-29, 30 lines)
    COLUMNS: 32, // Total columns
    LINES: 30, // Total lines
  },
  BG_GRAPHIC: {
    MAX_X: 27, // Maximum X coordinate (0-27, 28 columns)
    MAX_Y: 20, // Maximum Y coordinate (0-20, 21 lines)
    COLUMNS: 28, // Total columns
    LINES: 21, // Total lines
  },
  SPRITE: {
    MAX_X: 255, // Maximum X coordinate (0-255, 256 dots)
    MAX_Y: 239, // Maximum Y coordinate (0-239, 240 dots)
    WIDTH: 256, // Total width in dots
    HEIGHT: 240, // Total height in dots
    /** Default position when POSITION not set: center of screen (256×240) */
    DEFAULT_X: 128,
    DEFAULT_Y: 120,
  },
} as const

// Color patterns and codes
export const COLOR_PATTERNS = {
  MIN: 0, // Minimum color pattern number
  MAX: 3, // Maximum color pattern number (0-3)
} as const

export const COLOR_CODES = {
  MIN: 0, // Minimum color code
  MAX: 60, // Maximum color code (0-60)
} as const

// PRINT statement tab stops (8-character blocks)
export const PRINT_TAB_STOPS = {
  BLOCK_1_END: 8, // End of block 1 (columns 0-7)
  BLOCK_2_END: 16, // End of block 2 (columns 8-15)
  BLOCK_3_END: 24, // End of block 3 (columns 16-23)
  BLOCK_4_END: 28, // End of block 4 (columns 24-27)
} as const

// Colors for syntax highlighting
export const SYNTAX_COLORS = {
  COMMAND: '#0066cc',
  OPERATOR: '#cc6600',
  STRING: '#009900',
  LINE_NUMBER: '#666666',
  VARIABLE: '#9900cc',
} as const
