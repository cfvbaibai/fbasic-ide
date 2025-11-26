/**
 * I/O Service
 * 
 * Handles input and output operations including PRINT, INPUT, and CLS.
 */

import { ExpressionEvaluator, type EvaluationContext } from '../evaluation/ExpressionEvaluator'
import type { BasicDeviceAdapter } from '../interfaces'

export class IoService {
  constructor(
    private context: EvaluationContext,
    private evaluator: ExpressionEvaluator,
    private deviceAdapter?: BasicDeviceAdapter
  ) {}

  /**
   * Print values to output (accepts array of values: number | string)
   */
  printValues(values: Array<number | string>): void {
    let output = ''

    for (let i = 0; i < values.length; i++) {
      const value = values[i]
      if (value === undefined) continue
      const formatted = this.formatValue(value)

      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`PRINT: value = ${value}`)
      }

      // Simple concatenation for now (separator handling can be added later)
      if (i > 0) {
        output += ' ' + formatted
      } else {
        output += formatted
      }
    }

    this.context.addOutput(output)

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`PRINT: ${output}`)
    }
  }

  /**
   * Clear the screen (output)
   */
  clearScreen(): void {
    this.context.deviceAdapter?.clearScreen()
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput('CLS: Screen cleared')
    }
  }

  /**
   * Handle INPUT statement (placeholder for now)
   */
  inputValue(prompt?: string): void {
    // For now, just add a placeholder message
    // In a real implementation, this would handle user input
    const message = prompt ? `INPUT: ${prompt}` : 'INPUT: Waiting for user input'
    this.context.addOutput(message)
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(message)
    }
  }

  /**
   * Format a value for output
   */
  private formatValue(value: number | string | boolean): string {
    if (typeof value === 'string') {
      return value
    } else if (typeof value === 'boolean') {
      return value ? '1' : '0'
    } else if (typeof value === 'number') {
      // Handle BASIC number formatting
      if (Number.isInteger(value)) {
        return value.toString()
      } else {
        // Format floating point numbers
        return value.toString()
      }
    }
    return '0'
  }

  /**
   * Add raw output
   */
  addRawOutput(text: string): void {
    this.context.addOutput(text)
  }
}
