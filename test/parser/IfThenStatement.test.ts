/**
 * IF-THEN Statement Parser Tests
 */

import { describe, it, expect } from 'vitest'
import { parseWithChevrotain } from '@/core/parser/FBasicChevrotainParser'
import { getFirstCstNode } from '@/core/parser/cst-helpers'

describe('IF-THEN Statement', () => {
  describe('Parser Tests', () => {
    it('should parse IF-THEN with numeric comparison', () => {
      const source = '10 IF X = 5 THEN PRINT "Equal"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      
      const statements = result.cst?.children.statement
      expect(statements).toBeDefined()
      
      const statementCst = getFirstCstNode(statements)
      expect(statementCst).toBeDefined()
      
      if (!statementCst) return
      
      const commandListCst = getFirstCstNode(statementCst.children.commandList)
      expect(commandListCst).toBeDefined()
      
      if (!commandListCst) return
      
      const commandCst = getFirstCstNode(commandListCst.children.command)
      expect(commandCst).toBeDefined()
      
      if (!commandCst) return
      
      const singleCommandCst = getFirstCstNode(commandCst.children.singleCommand)
      expect(singleCommandCst).toBeDefined()
      
      if (!singleCommandCst) return
      
      const ifThenStmtCst = getFirstCstNode(singleCommandCst.children.ifThenStatement)
      expect(ifThenStmtCst).toBeDefined()
      
      if (!ifThenStmtCst) return
      
      // After refactoring, IF-THEN uses logicalExpression instead of comparisonExpression
      expect(ifThenStmtCst.children.logicalExpression).toBeDefined()
      expect(ifThenStmtCst.children.commandList).toBeDefined()
    })

    it('should parse IF-THEN with greater than comparison', () => {
      const source = '10 IF X > 10 THEN PRINT "Greater"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse IF-THEN with less than comparison', () => {
      const source = '10 IF X < 10 THEN PRINT "Less"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse IF-THEN with not equal comparison', () => {
      const source = '10 IF X <> 5 THEN PRINT "Not Equal"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse IF-THEN with greater than or equal comparison', () => {
      const source = '10 IF X >= 10 THEN PRINT "Greater or Equal"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse IF-THEN with less than or equal comparison', () => {
      const source = '10 IF X <= 10 THEN PRINT "Less or Equal"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse IF-THEN with single expression (boolean)', () => {
      const source = '10 IF X THEN PRINT "True"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse IF-THEN with LET statement in THEN clause', () => {
      const source = '10 IF X = 5 THEN Y = 10'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse IF-THEN with PRINT statement in THEN clause', () => {
      const source = '10 IF X = 5 THEN PRINT "Hello"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse IF-THEN with expression in condition', () => {
      const source = '10 IF X + Y > 10 THEN PRINT "Sum"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse IF-THEN with string comparison', () => {
      const source = '10 IF A$ = "Hello" THEN PRINT "Match"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse IF-THEN with colon-separated statements', () => {
      const source = '10 IF X = 5 THEN PRINT "Yes": PRINT "No"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should reject IF without THEN', () => {
      const source = '10 IF X = 5 PRINT "Error"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })

    it('should reject IF-THEN without condition', () => {
      const source = '10 IF THEN PRINT "Error"'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(false)
    })
  })
})

