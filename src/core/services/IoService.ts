/**
 * I/O Service
 * 
 * Handles input and output operations including PRINT, INPUT, and CLS.
 */

import type { ExpressionNode } from '../parser/ast-types'
import { ExpressionEvaluator, type EvaluationContext } from '../evaluation/ExpressionEvaluator'

export class IoService {
  constructor(
    private context: EvaluationContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Print values to output
   */
  printValues(expressions: ExpressionNode[]): void {
    let output = ''

    for (let i = 0; i < expressions.length; i++) {
      const expr = expressions[i]

      // Handle separator-aware print items
      let actualExpr: ExpressionNode
      let separator: string | undefined

      // Type guard to check if expr has separator properties
      const hasSeparator = (obj: unknown): obj is { item: ExpressionNode; separator: string } => {
        return obj !== null && typeof obj === 'object' && 'item' in obj && 'separator' in obj
      }

      if (hasSeparator(expr)) {
        // This is a separator-aware item from the tail
        actualExpr = expr.item
        separator = expr.separator
      } else {
        // This is the head item or a regular item
        actualExpr = expr as ExpressionNode
        separator = undefined
      }

      const value = this.evaluator.evaluateExpression(actualExpr)
      const formatted = this.formatValue(value)

      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`PRINT: evaluating expression ${JSON.stringify(actualExpr)} = ${value}, separator: ${separator}`)
      }

      // Handle separator logic
      if (separator === ';') {
        // Semicolon means concatenate without space (official BASIC specification)
        output += formatted
      } else if (separator === ',') {
        // Comma means add a space before the value
        if (output.length > 0) {
          output += ' ' + formatted
        } else {
          output += formatted
        }
      } else {
        // First item or no separator info - just add
        output += formatted
      }
    }

    this.context.addOutput(output)

    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`PRINT: ${output}`)
    }
  }

  /**
   * Print a single value
   */
  printValue(expression: ExpressionNode): void {
    const value = this.evaluator.evaluateExpression(expression)
    const formatted = this.formatValue(value)
    this.context.addOutput(formatted)
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`PRINT: ${formatted}`)
    }
  }

  /**
   * Clear the screen (output)
   */
  clearScreen(): void {
    this.context.output = []
    
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
   * Get current output as string
   */
  getOutput(): string {
    return this.context.output.join('\n')
  }

  /**
   * Get current output as array
   */
  getOutputArray(): string[] {
    return [...this.context.output]
  }

  /**
   * Clear output
   */
  clearOutput(): void {
    this.context.output = []
  }

  /**
   * Add raw output
   */
  addRawOutput(text: string): void {
    this.context.addOutput(text)
  }
}
