/**
 * Unary Minus Parser Tests
 * 
 * Tests for parsing expressions with unary minus operator.
 */

import { beforeEach,describe, expect, it } from 'vitest'

import { FBasicParser } from '@/core/parser/FBasicParser'

describe('Unary Minus Parser', () => {
  let parser: FBasicParser

  beforeEach(() => {
    parser = new FBasicParser()
  })

  describe('Unary Minus in Expressions', () => {
    it('should parse negative number literal', async () => {
      const result = await parser.parse('10 LET X = -5')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse negative variable', async () => {
      const result = await parser.parse('10 LET X = -Y')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse negative expression in parentheses', async () => {
      const result = await parser.parse('10 LET X = -(5 + 3)')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse FOR with negative step', async () => {
      const result = await parser.parse('10 FOR I = 10 TO 1 STEP -1')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse FOR with negative start value', async () => {
      const result = await parser.parse('10 FOR I = -5 TO 5')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse FOR with negative end value', async () => {
      const result = await parser.parse('10 FOR I = 1 TO -5 STEP -1')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse complex expression with unary minus', async () => {
      const result = await parser.parse('10 LET X = -5 * -2')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse unary plus (no-op)', async () => {
      const result = await parser.parse('10 LET X = +5')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse mixed unary and binary operators', async () => {
      const result = await parser.parse('10 LET X = -5 + -3')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })
})

