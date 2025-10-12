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
  SERVICE_WORKER: {
    ENABLED_PRODUCTION: true,
    ENABLED_TEST: false,
    WORKER_SCRIPT: '/basic-interpreter-worker.js',
    MESSAGE_TIMEOUT: 30000, // 30 seconds timeout for service worker messages
  }
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

// Colors for syntax highlighting
export const SYNTAX_COLORS = {
  COMMAND: '#0066cc',
  OPERATOR: '#cc6600',
  STRING: '#009900',
  LINE_NUMBER: '#666666',
  VARIABLE: '#9900cc',
} as const
