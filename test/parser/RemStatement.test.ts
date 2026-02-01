/**
 * REM Statement Tests
 *
 * Tests for the REM (remark/comment) statement in Family Basic.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { FBasicParser } from '@/core/parser/FBasicParser'

describe('REM Statement', () => {
  let interpreter: BasicInterpreter

  beforeEach(() => {
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
    })
  })

  describe('Parser Tests', () => {
    it('should parse REM statement without comment text', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM statement with comment text', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM This is a comment')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM statement with complex comment text', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM PRINT "Hello" LET X = 5')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM statement with special characters', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM This is a comment with (parentheses) and = signs')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with colon punctuation', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM This comment has: colons in it')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with semicolon punctuation', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM This comment has; semicolons; in it')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with comma punctuation', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM This comment has, commas, in it')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with period punctuation', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM This comment has. periods. in it.')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with parentheses', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM This comment has (parentheses) and (more parentheses)')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with square brackets', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM This comment has [square brackets]')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with hash sign', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM This comment has # hash signs #')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with dollar sign', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM This comment has $ dollar signs $')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with multiple punctuation types', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse(
        '10 REM Comment with: colons, commas; semicolons. periods (parens) [brackets] #hash$'
      )

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with arithmetic operators', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM Comment with + - * / = operators')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with comparison operators', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM Comment with < > <= >= <> comparison operators')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with exclamation and question marks', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM Comment with ! exclamation and ? question marks!')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with at sign and percent', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM Comment with @ at sign and % percent')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with quotes and apostrophes', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM Comment with "quotes" and \'apostrophes\'')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with backslash and forward slash', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM Comment with / forward slash and \\ backslash')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with curly braces', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM Comment with {curly braces}')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with pipe and tilde', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM Comment with | pipe and ~ tilde')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse REM with underscore', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 REM Comment with _ underscore')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    // F-BASIC manual p.67: apostrophe (') is abbreviation for REM; "You can use (apostrophe) instead of REM."
    it('should parse apostrophe comment line (whole line comment)', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse("10 ' This is a comment")

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse apostrophe comment line with no text after quote', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse("10 '")

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse apostrophe comment with special characters', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse("20 ' SAMPLE PROGRAM (p.67 style)")

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('Execution Tests', () => {
    it('should execute REM statement without affecting program', async () => {
      const code = `10 REM This is a comment
20 LET X = 42
30 PRINT X`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(42)
    })

    it('should execute REM statement with comment text', async () => {
      const code = `10 REM Initialize variable
20 LET X = 100
30 REM Print the value
40 PRINT X`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(100)
    })

    it('should handle multiple REM statements', async () => {
      const code = `10 REM Program start
20 REM Set variable
30 LET X = 10
40 REM Print result
50 PRINT X
60 REM Program end`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(10)
    })

    it('should NOT allow REM on same line as other statements (Family BASIC spec)', async () => {
      // In Family BASIC, REM cannot appear after colons
      // Lines like "10 LET X = 5: REM comment" are invalid
      const code = `10 LET X = 5: REM Set X to 5
20 PRINT X: REM Print X`
      const result = await interpreter.execute(code)

      // This should fail because REM cannot appear after colon
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle REM with keywords in comment', async () => {
      const code = `10 REM This comment contains PRINT LET FOR NEXT
20 LET X = 1
30 PRINT X`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(1)
    })

    it('should handle REM with expressions in comment', async () => {
      const code = `10 REM Calculate: X = 5 + 3 * 2
20 LET X = 5 + 3 * 2
30 PRINT X`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(11)
    })

    it('should handle REM statement alone on a line', async () => {
      const code = `10 REM
20 LET X = 42
30 REM
40 PRINT X`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(42)
    })

    it('should execute apostrophe comment line without affecting program (F-BASIC manual p.67)', async () => {
      const code = `10 ' This is a comment
20 LET X = 42
30 PRINT X`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(42)
    })

    it('should handle mixed REM and apostrophe comment lines', async () => {
      const code = `10 REM Program start
20 ' Set variable (apostrophe = REM abbreviation)
30 LET X = 10
40 REM Print result
50 PRINT X
60 ' Program end`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(10)
    })

    it('should handle apostrophe-only comment line', async () => {
      const code = `10 '
20 LET X = 7
30 PRINT X`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(7)
    })
  })
})
