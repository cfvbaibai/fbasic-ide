/**
 * Test Helpers for Executor Tests
 * 
 * Utility functions for creating test fixtures and CST nodes.
 */

import type { CstNode } from 'chevrotain'
import { FBasicParser } from '../src/core/parser/FBasicParser'

const parser = new FBasicParser()

/**
 * Parse a single statement and return its CST node
 */
export async function parseStatement(code: string): Promise<CstNode | null> {
  const result = await parser.parse(code)
  if (!result.success || !result.cst) {
    return null
  }
  
  const statements = result.cst.children.statement
  if (Array.isArray(statements) && statements.length > 0) {
    const stmt = statements[0]
    if (stmt && 'children' in stmt) {
      return stmt
    }
  }
  return null
}

/**
 * Extract commandList CST from a statement CST
 */
export function getCommandListCst(statementCst: CstNode): CstNode | null {
  const commandListCst = statementCst.children.commandList?.[0]
  if (commandListCst && 'children' in commandListCst) {
    return commandListCst
  }
  return null
}

/**
 * Extract first command CST from a commandList CST
 */
export function getCommandCst(statementCst: CstNode): CstNode | null {
  const commandListCst = getCommandListCst(statementCst)
  if (!commandListCst) return null
  
  const commandCst = commandListCst.children.command?.[0]
  if (commandCst && 'children' in commandCst) {
    return commandCst
  }
  return null
}

/**
 * Extract single command CST from command CST
 */
export function getSingleCommandCst(commandCst: CstNode): CstNode | null {
  const singleCommandCst = commandCst.children.singleCommand?.[0]
  if (singleCommandCst && 'children' in singleCommandCst) {
    return singleCommandCst
  }
  return null
}

/**
 * Extract PRINT statement CST from single command CST
 */
export function getPrintStatementCst(singleCommandCst: CstNode): CstNode | null {
  const printStmtCst = singleCommandCst.children.printStatement?.[0]
  if (printStmtCst && 'children' in printStmtCst) {
    return printStmtCst
  }
  return null
}

/**
 * Extract LET statement CST from single command CST
 */
export function getLetStatementCst(singleCommandCst: CstNode): CstNode | null {
  const letStmtCst = singleCommandCst.children.letStatement?.[0]
  if (letStmtCst && 'children' in letStmtCst) {
    return letStmtCst
  }
  return null
}

/**
 * Helper to parse and extract PRINT statement CST
 */
export async function parsePrintStatement(code: string): Promise<CstNode | null> {
  const stmtCst = await parseStatement(code)
  if (!stmtCst) return null
  
  const cmdCst = getCommandCst(stmtCst)
  if (!cmdCst) return null
  
  const singleCmdCst = getSingleCommandCst(cmdCst)
  if (!singleCmdCst) return null
  
  return getPrintStatementCst(singleCmdCst)
}

/**
 * Helper to parse and extract LET statement CST
 */
export async function parseLetStatement(code: string): Promise<CstNode | null> {
  const stmtCst = await parseStatement(code)
  if (!stmtCst) return null
  
  const cmdCst = getCommandCst(stmtCst)
  if (!cmdCst) return null
  
  const singleCmdCst = getSingleCommandCst(cmdCst)
  if (!singleCmdCst) return null
  
  return getLetStatementCst(singleCmdCst)
}

