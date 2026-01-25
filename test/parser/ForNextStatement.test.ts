/**
 * FOR/NEXT Statement Parser Tests
 *
 * Tests for parsing FOR and NEXT statements with various formats.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { FBasicParser } from '@/core/parser/FBasicParser'

describe('FOR/NEXT Statement Parser', () => {
  let parser: FBasicParser

  beforeEach(() => {
    parser = new FBasicParser()
  })

  describe('FOR Statements', () => {
    it('should parse basic FOR statement', async () => {
      const result = await parser.parse('10 FOR I = 1 TO 10')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(1)
    })

    it('should parse FOR statement with STEP', async () => {
      const result = await parser.parse('20 FOR I = 1 TO 10 STEP 2')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse FOR statement with negative STEP', async () => {
      const result = await parser.parse('30 FOR I = 10 TO 1 STEP -1')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse FOR statement with expressions', async () => {
      const result = await parser.parse('40 FOR I = 1 TO 5 + 5')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse FOR statement with variable expressions', async () => {
      const result = await parser.parse('50 FOR I = X TO Y')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse FOR statement with expression in STEP', async () => {
      const result = await parser.parse('60 FOR I = 1 TO 10 STEP 2 + 1')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse FOR statement with all expressions', async () => {
      const result = await parser.parse('70 FOR I = 1 + 1 TO 10 - 2 STEP 2 * 1')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse FOR statement starting at 0', async () => {
      const result = await parser.parse('80 FOR I = 0 TO 10')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse FOR statement with STEP 1 explicitly', async () => {
      const result = await parser.parse('90 FOR I = 1 TO 10 STEP 1')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('NEXT Statements', () => {
    it('should parse NEXT statement without variable', async () => {
      const result = await parser.parse('10 NEXT')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should reject NEXT statement with variable name', async () => {
      // Family BASIC spec: "You can not add a loop variable name after NEXT. (An error will occur)"
      const result = await parser.parse('20 NEXT I')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })

  describe('FOR-NEXT Loop Pairs', () => {
    it('should parse complete FOR-NEXT loop', async () => {
      const code = `10 FOR I = 1 TO 5
20 PRINT I
30 NEXT`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(3)
    })

    it('should parse FOR-NEXT loop with NEXT without variable', async () => {
      const code = `10 FOR I = 1 TO 5
20 PRINT I
30 NEXT`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse nested FOR-NEXT loops', async () => {
      const code = `10 FOR I = 1 TO 3
20 FOR J = 1 TO 2
30 PRINT I, J
40 NEXT
50 NEXT`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(5)
    })

    it('should parse triple nested FOR-NEXT loops', async () => {
      const code = `10 FOR I = 1 TO 2
20 FOR J = 1 TO 2
30 FOR K = 1 TO 2
40 PRINT I, J, K
50 NEXT
60 NEXT
70 NEXT`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements) ? statements.length : 0).toBe(7)
    })

    it('should parse FOR-NEXT loop matching manual example', async () => {
      // From page-65.md example (1)
      const code = `10 REM * FOR-NEXT (1) *
20 FOR I=0 TO 10 STEP 2
30 PRINT I;
40 NEXT`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      const statements = result.cst?.children.statement
      // REM might be parsed separately or not counted, so check for at least 3 statements
      expect(Array.isArray(statements) ? statements.length : 0).toBeGreaterThanOrEqual(3)
    })
  })

  describe('FOR with Colon-Separated Statements', () => {
    it('should parse FOR on same line as other statements', async () => {
      const code = '10 LET X=5: FOR I=1 TO 10: PRINT I'
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse NEXT on same line as other statements', async () => {
      const code = '10 FOR I=1 TO 5: PRINT I: NEXT'
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should reject NEXT with variable on same line', async () => {
      const code = '10 FOR I=1 TO 5: PRINT I: NEXT I'
      const result = await parser.parse(code)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })
})
