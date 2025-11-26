/**
 * Let Executor Tests
 * 
 * Unit tests for the LetExecutor class.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { CstNode, IToken } from 'chevrotain'
import { LetExecutor } from '@/core/execution/executors/LetExecutor'
import { VariableService } from '@/core/services/VariableService'
import { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { ExecutionContext } from '@/core/state/ExecutionContext'
import { parseLetStatement } from '../test-helpers'
import { FBasicParser } from '@/core/parser/FBasicParser'

describe('LetExecutor', () => {
  let executor: LetExecutor
  let variableService: VariableService
  let evaluator: ExpressionEvaluator
  let context: ExecutionContext

  beforeEach(() => {
    context = new ExecutionContext({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false
    })
    evaluator = new ExpressionEvaluator(context)
    variableService = new VariableService(context, evaluator)
    executor = new LetExecutor(variableService)
    
    // Clear variables before each test
    context.variables.clear()
  })

  describe('Basic Variable Assignment', () => {
    it('should execute LET statement with number literal', async () => {
      const letStmtCst = await parseLetStatement('10 LET X = 42')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('X')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(42)
      expect(variable?.type).toBe('number')
    })

    it('should execute LET statement without LET keyword', async () => {
      const letStmtCst = await parseLetStatement('10 X = 100')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('X')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(100)
    })

    it('should reject floating point number literals', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 LET Y = 3.14')
      
      // Floating point literals should be rejected by the parser
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })

    it('should execute LET statement assigning variable to variable', async () => {
      // Set up source variable
      context.variables.set('SOURCE', { value: 50, type: 'number' })

      const letStmtCst = await parseLetStatement('10 LET TARGET = SOURCE')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('TARGET')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(50)
    })
  })

  describe('LET with Arithmetic Expressions', () => {
    it('should execute LET statement with addition expression', async () => {
      const letStmtCst = await parseLetStatement('10 LET A = 10 + 20')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('A')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(30)
    })

    it('should execute LET statement with subtraction expression', async () => {
      const letStmtCst = await parseLetStatement('10 LET B = 50 - 20')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('B')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(30)
    })

    it('should execute LET statement with multiplication expression', async () => {
      const letStmtCst = await parseLetStatement('10 LET C = 5 * 6')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('C')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(30)
    })

    it('should execute LET statement with division expression', async () => {
      const letStmtCst = await parseLetStatement('10 LET D = 20 / 4')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('D')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(5)
    })
  })

  describe('LET with Complex Expressions', () => {
    it('should execute LET statement with parentheses', async () => {
      const letStmtCst = await parseLetStatement('10 LET E = (10 + 20) * 2')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('E')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(60)
    })

    it('should execute LET statement with nested parentheses', async () => {
      const letStmtCst = await parseLetStatement('10 LET F = ((10 + 5) * 2) / 3')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('F')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(10)
    })

    it('should execute LET statement with multiple operations', async () => {
      const letStmtCst = await parseLetStatement('10 LET G = 10 + 20 - 5')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('G')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(25)
    })
  })

  describe('LET with Variable References', () => {
    it('should execute LET statement using existing variable in expression', async () => {
      context.variables.set('X', { value: 10, type: 'number' })
      context.variables.set('Y', { value: 20, type: 'number' })

      const letStmtCst = await parseLetStatement('10 LET Z = X + Y')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('Z')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(30)
    })

    it('should update existing variable with new value', async () => {
      context.variables.set('X', { value: 10, type: 'number' })

      const letStmtCst = await parseLetStatement('10 LET X = 100')
      expect(letStmtCst).not.toBeNull()

      executor.execute(letStmtCst!)

      const variable = context.variables.get('X')
      expect(variable).toBeDefined()
      expect(variable?.value).toBe(100)
    })
  })

  describe('LET Error Handling', () => {
    it('should throw error for invalid LET statement without identifier', () => {
      // Create invalid CST node (missing identifier)
      const invalidCst: CstNode = {
        name: 'letStatement',
        children: {
          expression: []
        }
      }

      expect(() => {
        executor.execute(invalidCst)
      }).toThrow('Invalid LET statement: missing identifier or expression')
    })

    it('should throw error for invalid LET statement without expression', () => {
      // Create invalid CST node (missing expression)
      // Create a minimal token for Identifier
      const identifierToken: IToken = {
        image: 'X',
        startOffset: 0,
        endOffset: 1,
        startLine: 1,
        endLine: 1,
        startColumn: 0,
        endColumn: 1,
        tokenTypeIdx: 0,
        tokenType: {
          name: 'Identifier'
        } as IToken['tokenType']
      }

      const invalidCst: CstNode = {
        name: 'letStatement',
        children: {
          Identifier: [identifierToken]
        }
      }

      expect(() => {
        executor.execute(invalidCst)
      }).toThrow('Invalid LET statement: missing identifier or expression')
    })
  })

  describe('LET Debug Mode', () => {
    it('should add debug output when debug mode is enabled', async () => {
      context.config.enableDebugMode = true
      
      const letStmtCst = await parseLetStatement('10 LET X = 42')
      expect(letStmtCst).not.toBeNull()

      const debugSpy = vi.spyOn(context, 'addDebugOutput')

      executor.execute(letStmtCst!)

      expect(debugSpy).toHaveBeenCalled()
      const debugCall = debugSpy.mock.calls.find(call => 
        call[0]?.includes('LET:') && call[0]?.includes('X')
      )
      expect(debugCall).toBeDefined()
    })

    it('should not add debug output when debug mode is disabled', async () => {
      context.config.enableDebugMode = false
      
      const letStmtCst = await parseLetStatement('10 LET X = 42')
      expect(letStmtCst).not.toBeNull()

      const debugSpy = vi.spyOn(context, 'addDebugOutput')

      executor.execute(letStmtCst!)

      // Debug output should not be called for LET in non-debug mode
      // (only called if debug mode is enabled)
      expect(debugSpy).not.toHaveBeenCalled()
    })
  })
})

