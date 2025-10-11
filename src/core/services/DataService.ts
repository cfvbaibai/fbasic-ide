/**
 * Data Service
 * 
 * Handles DATA, READ, and RESTORE operations for storing and retrieving data.
 */

import type { ExpressionNode } from '../parser/ast-types'
import { ExpressionEvaluator, type EvaluationContext } from '../evaluation/ExpressionEvaluator'
import { ERROR_TYPES } from '../constants'
import type { BasicScalarValue } from '../types/BasicTypes'

export class DataService {
  constructor(
    private context: EvaluationContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Add data values from a DATA statement
   */
  addDataValues(expressions: ExpressionNode[]): void {
    for (const expr of expressions) {
      const value = this.evaluator.evaluateExpression(expr)
      this.context.dataValues.push(value)
    }
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`DATA: Added ${expressions.length} values`)
    }
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
    let valueIndex = 0
    
    for (let i = 0; i < this.context.statements.length; i++) {
      const statement = this.context.statements[i]
      
      if (statement && statement.type === 'Statement' && 
          statement.command.type === 'DataStatement') {
        if (statement.lineNumber >= lineNumber) {
          return valueIndex
        }
        // Count the values in this DATA statement
        valueIndex += (statement.command.constants || []).length
      }
    }
    
    return -1
  }

  /**
   * Preprocess all DATA statements to build the data array
   */
  preprocessDataStatements(): void {
    this.context.dataValues = []
    
    for (const statement of this.context.statements) {
      if (statement && statement.type === 'Statement' && 
          statement.command.type === 'DataStatement') {
        this.addDataValues(statement.command.constants || [])
      }
    }
    
    if (this.context.config.enableDebugMode) {
      this.context.addDebugOutput(`Preprocessed ${this.context.dataValues.length} data values`)
    }
  }
}
