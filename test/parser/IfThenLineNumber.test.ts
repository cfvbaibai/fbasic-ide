/**
 * IF-THEN with Line Number Parser Tests
 * 
 * Tests for parsing IF-THEN and IF-GOTO statements with line numbers.
 */

import { beforeEach,describe, expect, it } from 'vitest'

import { FBasicParser } from '@/core/parser/FBasicParser'

describe('IF-THEN with Line Number Parser', () => {
  let parser: FBasicParser

  beforeEach(() => {
    parser = new FBasicParser()
  })

  describe('IF-THEN with line number', () => {
    it('should parse IF-THEN with line number', async () => {
      const result = await parser.parse('10 IF X = 5 THEN 50')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse IF-THEN with line number and statements', async () => {
      const result = await parser.parse('10 IF X = 5 THEN 50: PRINT "After"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('IF-GOTO with line number', () => {
    it('should parse IF-GOTO with line number', async () => {
      const result = await parser.parse('10 IF X = 5 GOTO 50')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse IF-GOTO with line number and statements', async () => {
      const result = await parser.parse('10 IF X = 5 GOTO 50: PRINT "After"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('Mixed IF-THEN formats', () => {
    it('should parse IF-THEN with statements', async () => {
      const result = await parser.parse('10 IF X = 5 THEN PRINT "Yes"')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse IF-THEN with line number', async () => {
      const result = await parser.parse('10 IF X = 5 THEN 500')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse IF-GOTO with line number', async () => {
      const result = await parser.parse('10 IF X = 5 GOTO 500')
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('Complete programs', () => {
    it('should parse program with IF-THEN line number', async () => {
      const code = `10 LET X = 5
20 IF X = 5 THEN 50
30 PRINT "Skipped"
40 END
50 PRINT "Jumped"
60 END`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse program with IF-GOTO line number', async () => {
      const code = `10 LET X = 5
20 IF X = 5 GOTO 50
30 PRINT "Skipped"
40 END
50 PRINT "Jumped"
60 END`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse program matching manual example', async () => {
      // From manual page 64 example structure
      const code = `10 REM * IF - THEN *
20 PRINT "PUSH Y!";
30 A$="N"
40 IF A$<>"Y" THEN PRINT "BEEP":GOTO 30
50 PRINT:PRINT"Y was pressed."
60 END`
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })
})

