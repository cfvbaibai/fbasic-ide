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

/**
 * Get DEF SPRITE statement CST from single command CST
 */
export function getDefSpriteStatementCst(singleCommandCst: CstNode): CstNode | null {
  const cst = singleCommandCst.children.defSpriteStatement?.[0]
  return cst && 'children' in cst ? cst : null
}

/**
 * Get SPRITE statement CST from single command CST
 */
export function getSpriteStatementCst(singleCommandCst: CstNode): CstNode | null {
  const cst = singleCommandCst.children.spriteStatement?.[0]
  return cst && 'children' in cst ? cst : null
}

/**
 * Get SPRITE ON/OFF statement CST from single command CST
 */
export function getSpriteOnOffStatementCst(singleCommandCst: CstNode): CstNode | null {
  const cst = singleCommandCst.children.spriteOnOffStatement?.[0]
  return cst && 'children' in cst ? cst : null
}

/**
 * Get DEF MOVE statement CST from single command CST
 */
export function getDefMoveStatementCst(singleCommandCst: CstNode): CstNode | null {
  const cst = singleCommandCst.children.defMoveStatement?.[0]
  return cst && 'children' in cst ? cst : null
}

/**
 * Get MOVE statement CST from single command CST
 */
export function getMoveStatementCst(singleCommandCst: CstNode): CstNode | null {
  const cst = singleCommandCst.children.moveStatement?.[0]
  return cst && 'children' in cst ? cst : null
}

/**
 * Get CUT statement CST from single command CST
 */
export function getCutStatementCst(singleCommandCst: CstNode): CstNode | null {
  const cst = singleCommandCst.children.cutStatement?.[0]
  return cst && 'children' in cst ? cst : null
}

/**
 * Get ERA statement CST from single command CST
 */
export function getEraStatementCst(singleCommandCst: CstNode): CstNode | null {
  const cst = singleCommandCst.children.eraStatement?.[0]
  return cst && 'children' in cst ? cst : null
}

/**
 * Get POSITION statement CST from single command CST
 */
export function getPositionStatementCst(singleCommandCst: CstNode): CstNode | null {
  const cst = singleCommandCst.children.positionStatement?.[0]
  return cst && 'children' in cst ? cst : null
}

/**
 * Parse and extract DEF SPRITE statement CST
 */
export async function parseDefSpriteStatement(code: string): Promise<CstNode | null> {
  const stmtCst = await parseStatement(code)
  if (!stmtCst) return null
  const cmdCst = getCommandCst(stmtCst)
  if (!cmdCst) return null
  const singleCmdCst = getSingleCommandCst(cmdCst)
  if (!singleCmdCst) return null
  return getDefSpriteStatementCst(singleCmdCst)
}

/**
 * Parse and extract SPRITE statement CST
 */
export async function parseSpriteStatement(code: string): Promise<CstNode | null> {
  const stmtCst = await parseStatement(code)
  if (!stmtCst) return null
  const cmdCst = getCommandCst(stmtCst)
  if (!cmdCst) return null
  const singleCmdCst = getSingleCommandCst(cmdCst)
  if (!singleCmdCst) return null
  return getSpriteStatementCst(singleCmdCst)
}

/**
 * Parse and extract SPRITE ON/OFF statement CST
 */
export async function parseSpriteOnOffStatement(code: string): Promise<CstNode | null> {
  const stmtCst = await parseStatement(code)
  if (!stmtCst) return null
  const cmdCst = getCommandCst(stmtCst)
  if (!cmdCst) return null
  const singleCmdCst = getSingleCommandCst(cmdCst)
  if (!singleCmdCst) return null
  return getSpriteOnOffStatementCst(singleCmdCst)
}

/**
 * Parse and extract DEF MOVE statement CST
 */
export async function parseDefMoveStatement(code: string): Promise<CstNode | null> {
  const stmtCst = await parseStatement(code)
  if (!stmtCst) return null
  const cmdCst = getCommandCst(stmtCst)
  if (!cmdCst) return null
  const singleCmdCst = getSingleCommandCst(cmdCst)
  if (!singleCmdCst) return null
  return getDefMoveStatementCst(singleCmdCst)
}

/**
 * Parse and extract MOVE statement CST
 */
export async function parseMoveStatement(code: string): Promise<CstNode | null> {
  const stmtCst = await parseStatement(code)
  if (!stmtCst) return null
  const cmdCst = getCommandCst(stmtCst)
  if (!cmdCst) return null
  const singleCmdCst = getSingleCommandCst(cmdCst)
  if (!singleCmdCst) return null
  return getMoveStatementCst(singleCmdCst)
}

/**
 * Parse and extract CUT statement CST
 */
export async function parseCutStatement(code: string): Promise<CstNode | null> {
  const stmtCst = await parseStatement(code)
  if (!stmtCst) return null
  const cmdCst = getCommandCst(stmtCst)
  if (!cmdCst) return null
  const singleCmdCst = getSingleCommandCst(cmdCst)
  if (!singleCmdCst) return null
  return getCutStatementCst(singleCmdCst)
}

/**
 * Parse and extract ERA statement CST
 */
export async function parseEraStatement(code: string): Promise<CstNode | null> {
  const stmtCst = await parseStatement(code)
  if (!stmtCst) return null
  const cmdCst = getCommandCst(stmtCst)
  if (!cmdCst) return null
  const singleCmdCst = getSingleCommandCst(cmdCst)
  if (!singleCmdCst) return null
  return getEraStatementCst(singleCmdCst)
}

/**
 * Parse and extract POSITION statement CST
 */
export async function parsePositionStatement(code: string): Promise<CstNode | null> {
  const stmtCst = await parseStatement(code)
  if (!stmtCst) return null
  const cmdCst = getCommandCst(stmtCst)
  if (!cmdCst) return null
  const singleCmdCst = getSingleCommandCst(cmdCst)
  if (!singleCmdCst) return null
  return getPositionStatementCst(singleCmdCst)
}
