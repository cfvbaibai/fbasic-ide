/**
 * DIM Statement Parser Tests
 * 
 * Tests for parsing DIM statements with various array declarations.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { FBasicParser } from '@/core/parser/FBasicParser'

describe('DIM Statement Parser', () => {
  let parser: FBasicParser

  beforeEach(() => {
    parser = new FBasicParser()
  })

  describe('Basic DIM Statements', () => {
    it('should parse DIM statement with 1D numeric array', async () => {
      const result = await parser.parse('10 DIM A(3)')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse DIM statement with 2D numeric array', async () => {
      const result = await parser.parse('20 DIM B(3,3)')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse DIM statement with 1D string array', async () => {
      const result = await parser.parse('30 DIM A$(3)')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse DIM statement with 2D string array', async () => {
      const result = await parser.parse('40 DIM B$(3,3)')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse DIM statement with multiple arrays', async () => {
      const result = await parser.parse('50 DIM A(3), B(3,3), A$(3), B$(3,3)')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse DIM statement with expression dimensions', async () => {
      const result = await parser.parse('60 DIM A(10+5)')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })
  })

  describe('DIM Statement Errors', () => {
    it('should reject DIM without array declaration', async () => {
      const result = await parser.parse('10 DIM')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })

    it('should reject DIM with invalid array syntax', async () => {
      const result = await parser.parse('10 DIM A')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })
})

