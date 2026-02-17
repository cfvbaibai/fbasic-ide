/**
 * VIEW Statement Tests
 *
 * Tests for the VIEW statement in Family Basic.
 * VIEW copies BG GRAPHIC to the Background Screen.
 * Per F-BASIC Manual page 36: "Upon executing the VIEW command,
 * the BG GRAPHIC Screen will be copied to the Background Screen."
 */

import { describe, expect, it } from 'vitest'

import { FBasicParser } from '@/core/parser/FBasicParser'

describe('VIEW Statement', () => {
  describe('Parser Tests', () => {
    it('should parse VIEW statement', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 VIEW')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse VIEW statement (lowercase)', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 view')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse VIEW statement (mixed case)', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 View')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse VIEW with other statements on same line', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 CLS: VIEW')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse multiple VIEW statements', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse(`10 VIEW
20 VIEW
30 VIEW`)

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should reject VIEW with arguments', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 VIEW 100')

      // VIEW takes no arguments
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })

  describe('CST Structure', () => {
    it('should produce correct CST structure for VIEW', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 VIEW')

      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()

      // Check CST structure
      const statements = result.cst?.children.statement
      expect(statements).toBeDefined()
      expect(statements).toHaveLength(1)

      const statement = statements![0] as { name: string; children: Record<string, unknown[]> }
      expect(statement.name).toBe('statement')

      // Check that it contains a commandList with singleCommand containing viewStatement
      const commandList = statement.children.commandList
      expect(commandList).toBeDefined()
      expect(commandList).toHaveLength(1)
    })
  })
})
