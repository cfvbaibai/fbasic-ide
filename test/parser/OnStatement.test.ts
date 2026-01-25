/**
 * ON Statement Parser Tests
 * 
 * Unit tests for parsing ON statements.
 */

import { describe, expect,it } from 'vitest'

import { getFirstCstNode } from '@/core/parser/cst-helpers'
import { parseWithChevrotain } from '@/core/parser/FBasicChevrotainParser'

describe('ON Statement', () => {
  describe('Parser Tests', () => {
    it('should parse ON ... GOTO with single line number', () => {
      const source = '10 ON X GOTO 100'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      
      const statements = result.cst?.children.statement
      expect(statements).toBeDefined()
      
      const statementCst = getFirstCstNode(statements)
      expect(statementCst).toBeDefined()
      
      if (!statementCst) return
      
      const commandListCst = getFirstCstNode(statementCst.children.commandList)
      expect(commandListCst).toBeDefined()
      
      if (!commandListCst) return
      
      const commandCst = getFirstCstNode(commandListCst.children.command)
      expect(commandCst).toBeDefined()
      
      if (!commandCst) return
      
      const singleCommandCst = getFirstCstNode(commandCst.children.singleCommand)
      expect(singleCommandCst).toBeDefined()
      
      if (!singleCommandCst) return
      
      const onStmtCst = getFirstCstNode(singleCommandCst.children.onStatement)
      expect(onStmtCst).toBeDefined()
      expect(onStmtCst?.children.expression).toBeDefined()
      expect(onStmtCst?.children.Goto).toBeDefined()
      expect(onStmtCst?.children.lineNumberList).toBeDefined()
    })

    it('should parse ON ... GOTO with multiple line numbers', () => {
      const source = '10 ON X GOTO 100, 200, 300'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse ON ... GOSUB with single line number', () => {
      const source = '10 ON N GOSUB 100'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse ON ... GOSUB with multiple line numbers', () => {
      // From manual page 66 example: ON N GOSUB 100,200,300,400,500,600
      const source = '10 ON N GOSUB 100, 200, 300, 400, 500, 600'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse ON with expression', () => {
      const source = '10 ON X + 1 GOTO 100, 200'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse ON with variable expression', () => {
      const source = '10 ON I GOTO 100, 200, 300'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse ON with complex expression', () => {
      const source = '10 ON X * 2 + 1 GOTO 100, 200, 300'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
    })

    it('should parse ON statement matching manual example', () => {
      // From manual page 66: ON N GOSUB 100,200,300,400,500,600
      // Note: INPUT not yet implemented, so using LET instead
      const source = `10 REM * ON-GOSUB *
20 LET N = 2
30 ON N GOSUB 100,200,300,400,500,600
40 IF N<1 OR N>6 THEN 20
50 PRINT N; " IS THE SYMBOL OF ";X$;"."
60 END`
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
      
      const statements = result.cst?.children.statement
      expect(statements).toBeDefined()
      expect(statements?.length).toBeGreaterThan(0)
    })

    it('should reject ON without expression', () => {
      const source = '10 ON GOTO 100'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(false)
    })

    it('should reject ON without GOTO or GOSUB', () => {
      const source = '10 ON X 100'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(false)
    })

    it('should reject ON without line numbers', () => {
      const source = '10 ON X GOTO'
      const result = parseWithChevrotain(source)
      
      expect(result.success).toBe(false)
    })
  })
})

