/**
 * Data Service
 * 
 * Handles DATA, READ, and RESTORE operations for storing and retrieving data.
 */

import type { CstNode } from 'chevrotain'
import { ExpressionEvaluator, type EvaluationContext } from '../evaluation/ExpressionEvaluator'
import { ERROR_TYPES } from '../constants'
import type { BasicScalarValue } from '../types/BasicTypes'
import { getLineNumberFromStatement } from '../parser/cst-helpers'

export class DataService {
  constructor(
    private context: EvaluationContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Add data values from a DATA statement (CST version)
   */
  addDataValuesCst(expressionCsts: CstNode[]): void {
    for (const exprCst of expressionCsts) {
      const value = this.evaluator.evaluateExpression(exprCst)
      this.context.dataValues.push(value)
    }
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`DATA: Added ${expressionCsts.length} values`)
    }
  }

  /**
   * Add data values from a DATA statement (AST version - deprecated)
   */
  addDataValues(expressions: any[]): void {
    // This method is kept for compatibility but should not be used
    // Use addDataValuesCst instead
    console.warn('addDataValues called with AST - use addDataValuesCst instead')
  }

  /**
   * Read the next data value
   */
  readNextDataValue(): BasicScalarValue {
    if (this.context.dataIndex >= this.context.dataValues.length) {
      this.context.addError({
        line: 0,
        message: 'Out of data',
        type: ERROR_TYPES.RUNTIME
      })
      return 0
    }
    
    const value = this.context.dataValues[this.context.dataIndex]
    this.context.dataIndex++
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`READ: ${value}`)
    }
    
    return value ?? 0
  }

  /**
   * Restore data pointer to beginning or specific line
   */
  restoreData(lineNumber?: number): void {
    if (lineNumber !== undefined) {
      // Find the first DATA statement at or after the specified line
      const targetIndex = this.findDataStatementIndex(lineNumber)
      if (targetIndex !== -1) {
        this.context.dataIndex = targetIndex
      } else {
        this.context.addError({
          line: 0,
          message: `RESTORE target line ${lineNumber} not found`,
          type: ERROR_TYPES.RUNTIME
        })
      }
    } else {
      // Restore to beginning
      this.context.dataIndex = 0
    }
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`RESTORE: Data index set to ${this.context.dataIndex}`)
    }
  }

  /**
   * Get current data index
   */
  getCurrentDataIndex(): number {
    return this.context.dataIndex
  }

  /**
   * Get total number of data values
   */
  getDataValueCount(): number {
    return this.context.dataValues.length
  }

  /**
   * Get all data values
   */
  getAllDataValues(): BasicScalarValue[] {
    return [...this.context.dataValues]
  }

  /**
   * Clear all data values
   */
  clearDataValues(): void {
    this.context.dataValues = []
    this.context.dataIndex = 0
  }

  /**
   * Check if there are more data values to read
   */
  hasMoreData(): boolean {
    return this.context.dataIndex < this.context.dataValues.length
  }

  /**
   * Find the index of the first DATA statement at or after the specified line
   */
  private findDataStatementIndex(lineNumber: number): number {
    // For now, DATA statements are not yet implemented in CST parser
    // This will be implemented when DATA statement parsing is added
    return -1
  }

  /**
   * Preprocess all DATA statements to build the data array
   */
  preprocessDataStatements(): void {
    // For now, DATA statements are not yet implemented in CST parser
    // This will be implemented when DATA statement parsing is added
    this.context.dataValues = []
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`Preprocessed ${this.context.dataValues.length} data values`)
    }
  }
}
