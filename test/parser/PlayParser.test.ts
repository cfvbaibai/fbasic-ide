/**
 * PLAY Statement Parser Tests
 *
 * Tests for the PLAY statement grammar in the F-BASIC parser.
 * Tests parsing only - execution is handled by the Runtime Team.
 */

import { describe, expect, test } from 'vitest'

import { FBasicParser } from '@/core/parser/FBasicParser'

describe('PLAY Parser', () => {
  const parser = new FBasicParser()

  describe('Basic PLAY Syntax', () => {
    test('parses PLAY with string literal', async () => {
      const result = await parser.parse('10 PLAY "CRDRE"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    test('parses PLAY with complete music string', async () => {
      const result = await parser.parse('10 PLAY "T4Y2M0V1503C5R5D5R5E5"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    test('parses PLAY with envelope parameters', async () => {
      const result = await parser.parse('10 PLAY "T2Y0M1V901C3R5D6R1E4"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('Multi-channel PLAY', () => {
    test('parses PLAY with 3-channel chord', async () => {
      const result = await parser.parse('10 PLAY "C:E:G"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    test('parses PLAY with multi-channel parameters', async () => {
      const result = await parser.parse('10 PLAY "05C5:04E5:01G5"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    test('parses PLAY with complex multi-channel music', async () => {
      const result = await parser.parse('10 PLAY "T4O3C5:T4O4E5:T4O5G5"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('PLAY with Variables', () => {
    test('parses PLAY with string variable', async () => {
      const result = await parser.parse(`10 LET A$ = "CRDRE"
20 PLAY A$`)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    test('parses PLAY with string array element', async () => {
      const result = await parser.parse(`10 DIM MUSIC$(5)
20 MUSIC$(1) = "CRDRE"
30 PLAY MUSIC$(1)`)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('PLAY with Expressions', () => {
    test('parses PLAY with string concatenation', async () => {
      const result = await parser.parse('10 PLAY "C" + "D" + "E"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    test('parses PLAY with function call', async () => {
      const result = await parser.parse('10 PLAY LEFT$("CRDRE",3)')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('PLAY in Multiple Contexts', () => {
    test('parses PLAY on same line with other statements (colon separator)', async () => {
      const result = await parser.parse('10 PRINT "Music": PLAY "CDE": PRINT "Done"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    test('parses PLAY inside FOR loop', async () => {
      const result = await parser.parse(`10 FOR I = 1 TO 3
20   PLAY "C"
30 NEXT`)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    test('parses PLAY after IF statement', async () => {
      const result = await parser.parse('10 IF X = 1 THEN PLAY "C"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('PLAY with Special Characters', () => {
    test('parses PLAY with sharp notes', async () => {
      const result = await parser.parse('10 PLAY "#C#D#F"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    test('parses PLAY with rest (R)', async () => {
      const result = await parser.parse('10 PLAY "C5R5D5R5E5"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('CST Structure Verification', () => {
    test('verifies playStatement node exists in CST', async () => {
      const result = await parser.parse('10 PLAY "CRDRE"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()

      // The CST should contain a program with statements
      const cst = result.cst
      expect(cst?.children).toBeDefined()
      expect(cst?.children.statement).toBeDefined()

      // Check that we have at least one statement
      const statements = cst?.children.statement as unknown[]
      expect(statements).toBeDefined()
      expect(statements.length).toBeGreaterThan(0)
    })

    test('verifies multiple PLAY statements in CST', async () => {
      const result = await parser.parse(`10 PLAY "C"
20 PLAY "D"
30 PLAY "E"`)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()

      const cst = result.cst
      const statements = cst?.children.statement as unknown[]
      expect(statements).toBeDefined()
      expect(statements.length).toBe(3)
    })
  })

  describe('Error Cases', () => {
    test('rejects PLAY without argument', async () => {
      const result = await parser.parse('10 PLAY')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })

    test('rejects PLAY with invalid syntax', async () => {
      const result = await parser.parse('10 PLAY PLAY')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })
})
