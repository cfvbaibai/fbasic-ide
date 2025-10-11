/**
 * Parser Tests Suite
 * 
 * Comprehensive tests for the F-Basic parser functionality including:
 * - Basic statement parsing
 * - Multi-line program parsing
 * - Error handling
 * - Parser capabilities
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { FBasicParser } from '../core/parser/FBasicParser'

describe('Parser Tests', () => {
  let parser: FBasicParser

  beforeEach(() => {
    parser = new FBasicParser()
  })

  describe('Basic Statement Parsing', () => {
    it('should parse PRINT statement with string', async () => {
      const result = await parser.parse('10 PRINT "Hello World"')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse PRINT statement with number', async () => {
      const result = await parser.parse('20 PRINT 42')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse LET statement', async () => {
      const result = await parser.parse('30 LET X = 10')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse IF statement', async () => {
      const result = await parser.parse('40 IF X > 5 THEN PRINT "Yes"')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse FOR loop', async () => {
      const result = await parser.parse('50 FOR I = 1 TO 10')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse NEXT statement', async () => {
      const result = await parser.parse('60 NEXT I')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse END statement', async () => {
      const result = await parser.parse('70 END')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse GOSUB statement', async () => {
      const result = await parser.parse('80 GOSUB 100')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse RETURN statement', async () => {
      const result = await parser.parse('90 RETURN')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse DATA statement', async () => {
      const result = await parser.parse('100 DATA 1, 2, 3')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse READ statement', async () => {
      const result = await parser.parse('110 READ A, B, C')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse DIM statement', async () => {
      const result = await parser.parse('120 DIM A(10)')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse CLS statement', async () => {
      const result = await parser.parse('130 CLS')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse REM statement', async () => {
      const result = await parser.parse('140 REM This is a comment')
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })
  })

  describe('Multi-line Program Parsing', () => {
    it('should parse a complete program', async () => {
      const code = `10 PRINT "Hello"
20 LET X = 5
30 IF X > 0 THEN PRINT "Positive"
40 END`
      
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse program with expressions', async () => {
      const code = `10 LET A = 10 + 5
20 LET B = A * 2
30 PRINT A + B
40 END`
      
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse program with FOR loops', async () => {
      const code = `10 FOR I = 1 TO 5
20   PRINT I
30 NEXT I
40 END`
      
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse program with nested control structures', async () => {
      const code = `10 FOR I = 1 TO 3
20   FOR J = 1 TO 2
30     IF I > J THEN PRINT I, J
40   NEXT J
50 NEXT I
60 END`
      
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse program with functions', async () => {
      const code = `10 LET X = ABS(-5)
20 LET Y = SQR(16)
30 PRINT X, Y
40 END`
      
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })

    it('should parse program with string functions', async () => {
      const code = `10 LET S$ = "Hello"
20 LET L = LEN(S$)
30 PRINT L
40 END`
      
      const result = await parser.parse(code)
      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid syntax gracefully', async () => {
      const result = await parser.parse('10 INVALID STATEMENT')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })

    it('should handle missing line numbers', async () => {
      const result = await parser.parse('PRINT "Hello"')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should handle incomplete statements', async () => {
      const result = await parser.parse('10 PRINT')
      expect(result.success).toBe(true) // Empty PRINT is valid
    })

    it('should handle unmatched parentheses', async () => {
      const result = await parser.parse('10 PRINT (1 + 2')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should handle malformed string literals', async () => {
      const result = await parser.parse('10 PRINT "unclosed string')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should handle invalid operators', async () => {
      const result = await parser.parse('10 LET X = 5 @ 3')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })

  describe('Parser Capabilities', () => {
    it('should provide parser information', () => {
      const info = parser.getParserInfo()
      expect(info).toBeDefined()
      expect(info.name).toBe('F-Basic Parser')
      expect(info.version).toBe('1.0.0')
      expect(info.capabilities).toBeDefined()
      expect(info.features).toBeDefined()
      expect(info.supportedStatements).toBeDefined()
      expect(info.supportedFunctions).toBeDefined()
      expect(info.supportedOperators).toBeDefined()
    })

    it('should list supported statements', () => {
      const info = parser.getParserInfo()
      expect(info.supportedStatements).toContain('PRINT')
      expect(info.supportedStatements).toContain('LET')
      expect(info.supportedStatements).toContain('IF')
      expect(info.supportedStatements).toContain('FOR')
      expect(info.supportedStatements).toContain('NEXT')
      expect(info.supportedStatements).toContain('END')
    })

    it('should list supported functions', () => {
      const info = parser.getParserInfo()
      expect(info.supportedFunctions).toContain('ABS')
      expect(info.supportedFunctions).toContain('SQR')
      expect(info.supportedFunctions).toContain('LEN')
      expect(info.supportedFunctions).toContain('LEFT')
      expect(info.supportedFunctions).toContain('RIGHT')
      expect(info.supportedFunctions).toContain('MID')
    })

    it('should list supported operators', () => {
      const info = parser.getParserInfo()
      expect(info.supportedOperators).toContain('+')
      expect(info.supportedOperators).toContain('-')
      expect(info.supportedOperators).toContain('*')
      expect(info.supportedOperators).toContain('/')
      expect(info.supportedOperators).toContain('MOD')
      expect(info.supportedOperators).toContain('=')
      expect(info.supportedOperators).toContain('<>')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty program', async () => {
      const result = await parser.parse('')
      expect(result.success).toBe(true)
    })

    it('should handle program with only whitespace', async () => {
      const result = await parser.parse('   \n  \t  \n  ')
      expect(result.success).toBe(true)
    })

    it('should handle very long lines', async () => {
      const longLine = '10 PRINT "' + 'A'.repeat(1000) + '"'
      const result = await parser.parse(longLine)
      expect(result.success).toBe(true)
    })

    it('should handle special characters in strings', async () => {
      const result = await parser.parse('10 PRINT "Special: !@#$%^&*()"')
      expect(result.success).toBe(true)
    })

    it('should handle numeric expressions with decimals', async () => {
      const result = await parser.parse('10 LET X = 3.14159')
      expect(result.success).toBe(true)
    })

    it('should handle negative numbers', async () => {
      const result = await parser.parse('10 LET X = -42')
      expect(result.success).toBe(true)
    })
  })
})
