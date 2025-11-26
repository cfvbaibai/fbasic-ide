/**
 * CST Helper Functions
 * 
 * Utility functions for navigating and extracting data from Chevrotain CST nodes.
 */

import type { CstNode, CstElement, IToken } from 'chevrotain';

export function isCstNode(cst: CstElement): cst is CstNode {
  return 'children' in cst;
}

export function isCstToken(cst: CstElement): cst is IToken {
  return 'image' in cst;
}

/**
 * Safely extract the first CST node from children
 */
export function getFirstCstNode(children: CstElement[] | undefined): CstNode | undefined {
  if (!children) return undefined;
  const node = children.find(isCstNode);
  return node;
}

/**
 * Extract all CST nodes from children
 */
export function getCstNodes(children: CstElement[] | undefined): CstNode[] {
  if (!children) return [];
  return children.filter(isCstNode);
}

/**
 * Safely extract the first token from children
 */
export function getFirstToken(children: CstElement[] | undefined): IToken | undefined {
  if (!children) return undefined;
  const token = children.find(isCstToken);
  return token;
}

/**
 * Extract all tokens from children
 */
export function getTokens(children: CstElement[] | undefined): IToken[] {
  if (!children) return [];
  return children.filter(isCstToken);
}

/**
 * Get line number from a statement CST node
 */
export function getLineNumberFromStatement(stmtCst: CstNode): number | null {
  const lineNumberToken = getFirstToken(stmtCst.children.NumberLiteral);
  if (!lineNumberToken) return null;
  return parseInt(lineNumberToken.image, 10);
}

