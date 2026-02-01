/**
 * CST Helper Functions
 *
 * Utility functions for navigating and extracting data from Chevrotain CST nodes.
 */

import type { CstElement, CstNode, IToken } from 'chevrotain'

export function isCstNode(cst: CstElement): cst is CstNode {
  return 'children' in cst
}

export function isCstToken(cst: CstElement): cst is IToken {
  return 'image' in cst
}

/**
 * Safely extract the first CST node from children
 */
export function getFirstCstNode(children: CstElement[] | undefined): CstNode | undefined {
  if (!children) return undefined
  const node = children.find(isCstNode)
  return node
}

/**
 * Extract all CST nodes from children
 */
export function getCstNodes(children: CstElement[] | undefined): CstNode[] {
  if (!children) return []
  return children.filter(isCstNode)
}

/**
 * Safely extract the first token from children
 */
export function getFirstToken(children: CstElement[] | undefined): IToken | undefined {
  if (!children) return undefined
  const token = children.find(isCstToken)
  return token
}

/**
 * Extract all tokens from children
 */
export function getTokens(children: CstElement[] | undefined): IToken[] {
  if (!children) return []
  return children.filter(isCstToken)
}

/**
 * Get line number from a statement CST node
 */
export function getLineNumberFromStatement(stmtCst: CstNode): number | null {
  const lineNumberToken = getFirstToken(stmtCst.children.NumberLiteral)
  if (!lineNumberToken) return null
  return parseInt(lineNumberToken.image, 10)
}

/**
 * Get the first additive CST from an expression (expression = logicalExpression -> ... -> additive).
 * Used when code needs to traverse expression as additive (e.g. DEF SPRITE character set).
 */
export function getAdditiveFromExpression(exprCst: CstNode): CstNode | undefined {
  const logicalCst = getFirstCstNode(exprCst.children.logicalExpression)
  if (!logicalCst) return undefined
  const logicalOrCst = getFirstCstNode(logicalCst.children.logicalOrExpression)
  if (!logicalOrCst) return undefined
  const logicalAndCst = getFirstCstNode(logicalOrCst.children.logicalAndExpression)
  if (!logicalAndCst) return undefined
  const logicalNotCst = getFirstCstNode(logicalAndCst.children.logicalNotExpression)
  if (!logicalNotCst) return undefined
  const comparisonCst = getFirstCstNode(logicalNotCst.children.comparisonExpression)
  if (!comparisonCst) return undefined
  const bitwiseXorCst = getFirstCstNode(comparisonCst.children.bitwiseXorExpression)
  if (!bitwiseXorCst) return undefined
  const bitwiseOrCst = getFirstCstNode(bitwiseXorCst.children.bitwiseOrExpression)
  if (!bitwiseOrCst) return undefined
  const bitwiseAndCst = getFirstCstNode(bitwiseOrCst.children.bitwiseAndExpression)
  if (!bitwiseAndCst) return undefined
  const bitwiseNotCst = getFirstCstNode(bitwiseAndCst.children.bitwiseNotExpression)
  if (!bitwiseNotCst) return undefined
  return getFirstCstNode(bitwiseNotCst.children.additive)
}

/**
 * Recursively collect token images from a CST node to form source text.
 * Used for error reporting to show the failing BASIC line.
 */
export function getSourceTextFromCst(node: CstNode): string {
  const parts: string[] = []
  if (!node.children) return ''
  for (const key of Object.keys(node.children)) {
    const elements = node.children[key] as CstElement[]
    for (const el of elements) {
      if (isCstToken(el)) {
        parts.push(el.image)
      } else if (isCstNode(el)) {
        parts.push(getSourceTextFromCst(el))
      }
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}
