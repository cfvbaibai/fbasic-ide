/**
 * PRINT Statement Parser Tests
 * 
 * Tests for parsing PRINT statements with various formats and expressions.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { FBasicParser } from '@/core/parser/FBasicParser'

describe('PRINT Statement Parser', () => {
  let parser: FBasicParser

  beforeEach(() => {
    parser = new FBasicParser()
  })

  describe('Basic PRINT Statements', () => {
    it('should parse PRINT statement with string literal', async () => {
      const result = await parser.parse('10 PRINT "Hello World"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse PRINT statement with number', async () => {
      const result = await parser.parse('20 PRINT 42')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse PRINT statement with variable', async () => {
      const result = await parser.parse('30 PRINT X')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse empty PRINT statement', async () => {
      const result = await parser.parse('70 PRINT')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })
  })

  describe('PRINT with Expressions', () => {
    it('should parse PRINT statement with expression', async () => {
      const result = await parser.parse('40 PRINT 10 + 20')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse PRINT statement with complex expression', async () => {
      const result = await parser.parse('80 PRINT (10 + 20) * 2')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })
  })

  describe('PRINT with Multiple Items', () => {
    it('should parse PRINT statement with multiple items separated by comma', async () => {
      const result = await parser.parse('50 PRINT "A", "B", 42')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse PRINT statement with multiple items separated by semicolon', async () => {
      const result = await parser.parse('60 PRINT "A"; "B"; 42')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })
  })
})

