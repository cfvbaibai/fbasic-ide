/**
 * Statement Expander
 * 
 * Expands CST statements into a flat list of individual statements
 * and creates a label map for line numbers.
 */

import type { CstNode } from 'chevrotain'
import { getFirstCstNode, getCstNodes, getFirstToken } from '../parser/cst-helpers'

export interface ExpandedStatement {
  command: CstNode // Single command CST node
  lineNumber: number // Line number label
  statementIndex: number // Index in the expanded list
}

/**
 * Expand statements from CST into a flat list
 * Each statement contains a single command (colon-separated commands become separate statements)
 * 
 * @param statementsCst Array of statement CST nodes from parser
 * @returns Object containing expanded statements and label map
 */
export function expandStatements(statementsCst: CstNode[]): {
  statements: ExpandedStatement[]
  labelMap: Map<number, number[]> // line number -> statement indices
} {
  const expandedStatements: ExpandedStatement[] = []
  const labelMap = new Map<number, number[]>()

  for (const statementCst of statementsCst) {
    // Extract line number from statement
    const lineNumberToken = getFirstToken(statementCst.children.NumberLiteral)
    if (!lineNumberToken) {
      continue // Skip statements without line numbers
    }

    const lineNumber = parseInt(lineNumberToken.image, 10)
    if (isNaN(lineNumber)) {
      continue // Skip invalid line numbers
    }

    // Get commandList from statement
    const commandListCst = getFirstCstNode(statementCst.children.commandList)
    if (!commandListCst) {
      continue // Skip statements without commands
    }

    // Get all commands from the command list (colon-separated commands)
    const commands = getCstNodes(commandListCst.children.command)
    
    // Get statement indices for this line number
    const statementIndices: number[] = []

    // Expand each command into a separate statement
    for (const commandCst of commands) {
      const statementIndex = expandedStatements.length
      expandedStatements.push({
        command: commandCst,
        lineNumber,
        statementIndex
      })
      statementIndices.push(statementIndex)
    }

    // Map line number to statement indices
    // If multiple commands on the same line, all get the same line number label
    labelMap.set(lineNumber, statementIndices)
  }

  return {
    statements: expandedStatements,
    labelMap
  }
}

/**
 * Find statement indices by line number
 */
export function findStatementIndicesByLine(
  labelMap: Map<number, number[]>,
  lineNumber: number
): number[] {
  return labelMap.get(lineNumber) ?? []
}

/**
 * Get the first statement index for a line number (for GOTO/GOSUB)
 */
export function getFirstStatementIndexByLine(
  labelMap: Map<number, number[]>,
  lineNumber: number
): number | undefined {
  const indices = labelMap.get(lineNumber)
  return indices && indices.length > 0 ? indices[0] : undefined
}

