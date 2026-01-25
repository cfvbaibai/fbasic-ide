/**
 * Multi-line Program Parser Tests
 * 
 * Tests for parsing multi-line BASIC programs with multiple statements.
 */

import { beforeEach,describe, expect, it } from 'vitest'

import { FBasicParser } from '@/core/parser/FBasicParser'

describe('Multi-line Program Parser', () => {
  let parser: FBasicParser

  beforeEach(() => {
    parser = new FBasicParser()
  })

  describe('Multiple Statements', () => {
    it('should parse multiple PRINT statements', async () => {
      const code = `10 PRINT "Hello"
20 PRINT "World"
30 PRINT 42`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(3)
    })

    it('should parse multiple LET statements', async () => {
      const code = `10 LET X = 10
20 LET Y = 20
30 LET Z = X + Y`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(3)
    })

    it('should parse mixed LET and PRINT statements', async () => {
      const code = `10 LET X = 10
20 PRINT X
30 LET Y = 20
40 PRINT Y`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(4)
    })
  })

  describe('Empty Lines Handling', () => {
    it('should skip empty lines', async () => {
      const code = `10 PRINT "A"

20 PRINT "B"`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(2)
    })
  })
})

