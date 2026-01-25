/**
 * Print Statement Executor
 * 
 * Handles execution of PRINT statements from CST.
 */

import type { CstNode, IToken } from 'chevrotain'

import { ERROR_TYPES, PRINT_TAB_STOPS } from '@/core/constants'
import type { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { getCstNodes, getFirstCstNode, getFirstToken, getTokens, isCstNode,isCstToken } from '@/core/parser/cst-helpers'
import type { ExecutionContext } from '@/core/state/ExecutionContext'

export type PrintSeparator = ',' | ';' | null

export interface PrintItem {
  value: number | string
  separator: PrintSeparator
}

export class PrintExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  /**
   * Execute a PRINT statement from CST
   */
  execute(printStmtCst: CstNode): void {
    const printListCst = getFirstCstNode(printStmtCst.children.printList)
    
    if (!printListCst) {
      // Empty PRINT statement - print newline immediately
      this.printOutput('\n')
      return
    }

    const printItems = getCstNodes(printListCst.children.printItem)
    const commaTokens = getTokens(printListCst.children.Comma)
    const semicolonTokens = getTokens(printListCst.children.Semicolon)
    
    // Build array of all elements (items and separators) in order
    // We need to merge items and separators based on their positions
    interface Element {
      type: 'item' | 'separator'
      itemIndex?: number
      separator?: PrintSeparator
      startOffset: number
    }
    
    const elements: Element[] = []
    
    // Add all print items with their positions
    printItems.forEach((item, index) => {
      // Get the start position from the first token in the item
      const strToken = getFirstToken(item.children.StringLiteral)
      const exprCst = getFirstCstNode(item.children.expression)
      let startOffset = 0
      
      if (strToken) {
        startOffset = strToken.startOffset!
      } else if (exprCst) {
        // Get first token from expression (could be identifier, number, etc.)
        const firstToken = this.getFirstTokenFromNode(exprCst)
        if (firstToken) {
          startOffset = firstToken.startOffset!
        }
      }
      
      elements.push({
        type: 'item',
        itemIndex: index,
        startOffset
      })
    })
    
    // Add all separator tokens with their positions
    commaTokens.forEach(token => {
      elements.push({
        type: 'separator',
        separator: ',',
        startOffset: token.startOffset
      })
    })
    
    semicolonTokens.forEach(token => {
      elements.push({
        type: 'separator',
        separator: ';',
        startOffset: token.startOffset
      })
    })
    
    // Sort all elements by position
    elements.sort((a, b) => a.startOffset - b.startOffset)
    
    // Build PrintItem array with separators
    // Separators come AFTER items, so we need to look ahead
    const items: PrintItem[] = []
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      if (!element) continue
      
      if (element.type === 'item' && element.itemIndex !== undefined) {
        const item = printItems[element.itemIndex]
        if (!item) continue
        
        let value: number | string | undefined
        
        // Check if it's a string literal
        const strToken = getFirstToken(item.children.StringLiteral)
        if (strToken) {
          value = strToken.image.slice(1, -1) // Remove quotes
        } else {
          // It's an expression
          const exprCst = getFirstCstNode(item.children.expression)
          if (exprCst) {
            value = this.evaluator.evaluateExpression(exprCst)
          }
        }
        
        if (value !== undefined) {
          // Look ahead to find separator after this item
          let separator: PrintSeparator = null
          const nextElement = elements[i + 1]
          if (nextElement && nextElement.type === 'separator') {
            separator = nextElement.separator ?? null
          }
          
          items.push({ value, separator })
        }
      }
    }

    // Process PRINT items and convert to output string
    let output = this.buildOutputString(items)
    
    // Check if PRINT ends with semicolon or comma by checking the last element
    // The last element in the elements array tells us if there's a trailing separator
    const lastElement = elements[elements.length - 1]
    const endsWithSemicolon = lastElement?.type === 'separator' && lastElement.separator === ';'
    const endsWithComma = lastElement?.type === 'separator' && lastElement.separator === ','
    const endsWithSeparator = endsWithSemicolon || endsWithComma
    
    // In BASIC, PRINT statements automatically add a newline at the end
    // unless they end with a semicolon or comma. Add newline immediately if needed.
    if (!endsWithSeparator && output.length > 0) {
      output += '\n'
    }
    
    // Output the string immediately (newline is already included if needed)
    this.printOutput(output)
  }

  /**
   * Build output string from PRINT items, handling all PRINT semantics.
   * 
   * This method separates two concerns:
   * 1. Building the string representation of each item (via toString method)
   * 2. Processing separators between items
   */
  private buildOutputString(items: PrintItem[]): string {
    if (items.length === 0) {
      return '' // Empty PRINT - will add newline via printOutput
    }

    let output = ''
    let currentColumn = 0

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item?.value === undefined) continue
      
      // Step 1: Build the string representation of the item
      // The toString method already handles the sign char for numbers
      const itemString = this.toString(item.value)

      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`PRINT: value = ${item.value}, separator = ${item.separator}`)
      }

      // Step 2: Process the separator from the previous item (if any)
      if (i === 0) {
        // First item: no separator to process, just output the item string
        // The toString method already includes the sign char for numbers
        output += itemString
        currentColumn += itemString.length
      } else {
        // Process separator from previous item
        const prevSeparator = items[i - 1]?.separator
        
        if (prevSeparator === ',') {
          // Comma separator: use tab character to move to next tab stop
          // Blocks defined by PRINT_TAB_STOPS constants
          output += '\t'
          const nextTabStop = this.getNextTabStop(currentColumn)
          currentColumn = nextTabStop
          // Then output the item string (which already has the sign char for numbers)
          output += itemString
          currentColumn += itemString.length
        } else if (prevSeparator === ';') {
          // Semicolon separator: output immediately (no spacing)
          // The toString method already handles the sign char, so we just append
          output += itemString
          currentColumn += itemString.length
        } else {
          this.context.addError({
            line: this.context.getCurrentLineNumber(),
            message: `PRINT: Invalid separator: ${  prevSeparator}`,
            type: ERROR_TYPES.RUNTIME
          })
          return ''
        }
      }
    }

    return output
  }

  /**
   * Get the next tab stop (8-character block boundary)
   * Uses PRINT_TAB_STOPS constants for block boundaries
   */
  private getNextTabStop(currentColumn: number): number {
    if (currentColumn < PRINT_TAB_STOPS.BLOCK_1_END) return PRINT_TAB_STOPS.BLOCK_1_END
    if (currentColumn < PRINT_TAB_STOPS.BLOCK_2_END) return PRINT_TAB_STOPS.BLOCK_2_END
    if (currentColumn < PRINT_TAB_STOPS.BLOCK_3_END) return PRINT_TAB_STOPS.BLOCK_3_END
    return PRINT_TAB_STOPS.BLOCK_4_END    // Block 4 -> next line (or wrap)
  }

  /**
   * Convert a printable value to its string representation.
   * This acts as the "toString" method for printable items.
   * 
   * For numbers: always outputs a sign char (space for 0 and positive, dash for negative)
   * followed by the absolute value of the number.
   * For strings: outputs the string itself.
   */
  private toString(value: number | string | boolean): string {
    if (typeof value === 'string') {
      return value
    } else if (typeof value === 'boolean') {
      // Boolean values are converted to numbers (1 or 0) before printing
      return this.toString(value ? 1 : 0)
    } else if (typeof value === 'number') {
      // Numbers always have a sign char: space for 0 and positive, dash for negative
      const sign = value >= 0 ? ' ' : '-'
      const absValue = Math.abs(value)
      // Format the absolute value (handle integers and floats)
      const absValueStr = Number.isInteger(absValue) 
        ? absValue.toString() 
        : absValue.toString()
      return sign + absValueStr
    }
    // This should never happen due to TypeScript type checking, but handle it gracefully
    this.context.addError({
      line: this.context.getCurrentLineNumber(),
      message: `PRINT: Invalid value type: ${typeof value} for value: ${value}`,
      type: ERROR_TYPES.RUNTIME
    })
    return ' 0'
  }

  /**
   * Recursively get the first token from a CST node
   */
  private getFirstTokenFromNode(node: CstNode): IToken | undefined {
    // Try to find a token in direct children
    const children = Object.values(node.children).flat()
    for (const child of children) {
      if (isCstToken(child)) {
        return child
      }
      if (isCstNode(child)) {
        const token = this.getFirstTokenFromNode(child)
        if (token) return token
      }
    }
    return undefined
  }

  /**
   * Output text, handling appending to previous output for test device adapter
   */
  private printOutput(text: string, shouldAppend: boolean = false): void {
    if (shouldAppend && this.context.deviceAdapter && 'printOutputs' in this.context.deviceAdapter) {
      // Type guard for TestDeviceAdapter
      const adapter = this.context.deviceAdapter as { printOutputs?: string[] }
      if (adapter.printOutputs && adapter.printOutputs.length > 0) {
        // Append to previous output
        adapter.printOutputs[adapter.printOutputs.length - 1] += text
        return
      }
    }
    
    // Create new output line
    this.context.addOutput(text)
  }
}
