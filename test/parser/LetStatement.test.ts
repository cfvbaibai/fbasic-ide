/**
 * LET Statement Parser Tests
 *
 * Tests for parsing LET statements with various formats and expressions.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { FBasicParser } from '@/core/parser/FBasicParser'

describe('LET Statement Parser', () => {
  let parser: FBasicParser

  beforeEach(() => {
    parser = new FBasicParser()
  })

  describe('Basic LET Statements', () => {
    it('should parse LET statement with LET keyword', async () => {
      const result = await parser.parse('10 LET X = 10')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse LET statement without LET keyword', async () => {
      const result = await parser.parse('20 X = 10')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse LET statement with number literal', async () => {
      const result = await parser.parse('30 LET Y = 42')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse LET statement with variable assignment', async () => {
      const result = await parser.parse('40 LET Z = X')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })
  })

  describe('LET with Arithmetic Expressions', () => {
    it('should parse LET statement with addition expression', async () => {
      const result = await parser.parse('50 LET A = 10 + 20')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse LET statement with subtraction expression', async () => {
      const result = await parser.parse('60 LET B = 30 - 10')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse LET statement with multiplication expression', async () => {
      const result = await parser.parse('70 LET C = 5 * 6')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse LET statement with division expression', async () => {
      const result = await parser.parse('80 LET D = 20 / 4')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })
  })

  describe('LET with Complex Expressions', () => {
    it('should parse LET statement with complex expression', async () => {
      const result = await parser.parse('90 LET E = (10 + 20) * 2')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse LET statement with nested parentheses', async () => {
      const result = await parser.parse('100 LET F = ((10 + 5) * 2) / 3')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })
  })
})
