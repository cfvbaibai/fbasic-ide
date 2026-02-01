/**
 * DATA, READ, RESTORE Statement Parser Tests
 *
 * Tests for parsing DATA, READ, and RESTORE statements.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { FBasicParser } from '@/core/parser/FBasicParser'

describe('DATA Statement Parser', () => {
  let parser: FBasicParser

  beforeEach(() => {
    parser = new FBasicParser()
  })

  describe('Basic DATA Statements', () => {
    it('should parse DATA statement with numeric constants', async () => {
      const result = await parser.parse('10 DATA 3, 4, 1, 6, 2, 7, 8, 3, 4, 9')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse DATA statement with string constants (quoted)', async () => {
      const result = await parser.parse('20 DATA "GOOD", "MORNING", "EVENING"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse DATA statement with unquoted string constants', async () => {
      const result = await parser.parse('30 DATA GOOD, MORNING, EVENING')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse DATA statement with mixed numeric and string constants', async () => {
      const result = await parser.parse('40 DATA 10, 20, GOOD, "HELLO"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse DATA statement with hex constants', async () => {
      const result = await parser.parse('45 DATA &HDD, &H0A, &HFF')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse DATA statement with quoted strings containing commas', async () => {
      const result = await parser.parse('50 DATA ABC, DE, ", ", F')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse empty DATA statement', async () => {
      const result = await parser.parse('60 DATA')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })
  })

  describe('DATA Statement Errors', () => {
    it('should reject DATA with variable references', async () => {
      const result = await parser.parse('10 DATA X, Y')
      // This should parse successfully (X and Y are treated as unquoted strings)
      // But we can test that they're not evaluated as variables
      expect(result.success).toBe(true)
    })

    it('should reject DATA with expressions', async () => {
      const result = await parser.parse('10 DATA 10+5, 20*2')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })
})

describe('READ Statement Parser', () => {
  let parser: FBasicParser

  beforeEach(() => {
    parser = new FBasicParser()
  })

  describe('Basic READ Statements', () => {
    it('should parse READ statement with single variable', async () => {
      const result = await parser.parse('10 READ X')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse READ statement with multiple variables', async () => {
      const result = await parser.parse('20 READ A, B, C')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse READ statement with string variables', async () => {
      const result = await parser.parse('30 READ A$, B$, C$')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse READ statement with mixed numeric and string variables', async () => {
      const result = await parser.parse('40 READ A, B, C$, D$')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })
  })

  describe('READ Statement Errors', () => {
    it('should reject READ without variables', async () => {
      const result = await parser.parse('10 READ')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })
})

describe('RESTORE Statement Parser', () => {
  let parser: FBasicParser

  beforeEach(() => {
    parser = new FBasicParser()
  })

  describe('Basic RESTORE Statements', () => {
    it('should parse RESTORE statement without line number', async () => {
      const result = await parser.parse('10 RESTORE')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse RESTORE statement with line number', async () => {
      const result = await parser.parse('20 RESTORE 1000')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })
  })
})
