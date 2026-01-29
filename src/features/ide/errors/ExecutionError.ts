/**
 * Error subclass that carries execution context (BASIC line, stack, source line).
 * Used when rejecting after a worker ERROR so the catch block can show the root source line.
 */
export class ExecutionError extends Error {
  readonly lineNumber?: number
  readonly sourceLine?: string
  readonly stackTrace?: string

  constructor(
    message: string,
    options?: { lineNumber?: number; sourceLine?: string; stackTrace?: string }
  ) {
    super(message)
    this.name = 'ExecutionError'
    this.lineNumber = options?.lineNumber
    this.sourceLine = options?.sourceLine
    this.stackTrace = options?.stackTrace
  }
}
