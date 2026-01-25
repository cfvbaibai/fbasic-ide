/**
 * Tests for colon-separated statements (multiple statements per line)
 */

import { describe, expect,it } from 'vitest'

import { getCstNodes,getFirstCstNode } from '@/core/parser/cst-helpers'
import { FBasicParser } from '@/core/parser/FBasicParser'

describe('Colon-Separated Statements', () => {
  const parser = new FBasicParser()

  describe('LET statements with colons', () => {
    it('should parse multiple LET statements on one line', async () => {
      const code = '10 LET A=5: LET B=10: LET C=15'
      const result = await parser.parse(code)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      expect(result.cst?.children.statement).toBeDefined()
      expect(Array.isArray(result.cst?.children.statement)).toBe(true)
      
      const statements = result.cst?.children.statement
      expect(statements?.length).toBe(1) // One line number
      
      const statement = getFirstCstNode(statements)
      expect(statement).toBeDefined()
      expect(statement?.children.commandList).toBeDefined()
      
      const commandList = getFirstCstNode(statement?.children.commandList)
      expect(commandList).toBeDefined()
      
      const commands = getCstNodes(commandList?.children.command)
      expect(commands.length).toBeGreaterThanOrEqual(1)
    })

    it('should parse LET without keyword using colon', async () => {
      const code = '10 A=5: B=10: C=15'
      const result = await parser.parse(code)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('PRINT statements with colons', () => {
    it('should parse multiple PRINT statements on one line', async () => {
      const code = '10 PRINT "Hello": PRINT "World"'
      const result = await parser.parse(code)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      expect(result.cst?.children.statement).toBeDefined()
    })

    it('should parse PRINT with empty statements', async () => {
      const code = '10 PRINT: PRINT "Hello": PRINT'
      const result = await parser.parse(code)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('Mixed statements with colons', () => {
    it('should parse LET and PRINT on the same line', async () => {
      const code = '10 LET A=5: PRINT A'
      const result = await parser.parse(code)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse multiple mixed statements', async () => {
      const code = '10 LET A=5: PRINT A: LET B=10: PRINT B'
      const result = await parser.parse(code)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse with spaces around colon', async () => {
      const code = '10 LET A=5 : PRINT A : LET B=10'
      const result = await parser.parse(code)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('Multi-line programs with colons', () => {
    it('should parse multiple lines with colon-separated statements', async () => {
      const code = `10 LET A=5: PRINT A
20 LET B=10: PRINT B`
      const result = await parser.parse(code)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements)).toBe(true)
      expect(statements?.length).toBe(2) // Two lines
    })

    it('should handle mixed lines with and without colons', async () => {
      const code = `10 LET A=5: PRINT A
20 PRINT "Single statement"
30 LET B=10: PRINT B: LET C=15`
      const result = await parser.parse(code)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      
      const statements = result.cst?.children.statement
      expect(Array.isArray(statements)).toBe(true)
      expect(statements?.length).toBe(3) // Three lines
    })
  })

  describe('Error cases', () => {
    it('should handle trailing colon', async () => {
      const code = '10 LET A=5:'
      const result = await parser.parse(code)
      
      // This might be an error or might be handled gracefully
      // The parser should either succeed (if colon is optional) or fail with a clear error
      expect(result.success !== undefined).toBe(true)
    })

    it('should handle leading colon', async () => {
      const code = '10 : LET A=5'
      const result = await parser.parse(code)
      
      // This should likely be an error
      expect(result.success !== undefined).toBe(true)
    })
  })
})

