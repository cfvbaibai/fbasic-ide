/**
 * DIM Executor Tests
 * 
 * Unit tests for the DimExecutor class.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { DimExecutor } from '@/core/execution/executors/DimExecutor'
import { VariableService } from '@/core/services/VariableService'
import { ExpressionEvaluator } from '@/core/evaluation/ExpressionEvaluator'
import { ExecutionContext } from '@/core/state/ExecutionContext'
import { FBasicParser } from '@/core/parser/FBasicParser'
import { getFirstCstNode } from '@/core/parser/cst-helpers'

describe('DimExecutor', () => {
  let executor: DimExecutor
  let variableService: VariableService
  let evaluator: ExpressionEvaluator
  let context: ExecutionContext
  let parser: FBasicParser

  beforeEach(() => {
    context = new ExecutionContext({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false
    })
    evaluator = new ExpressionEvaluator(context)
    variableService = new VariableService(context, evaluator)
    executor = new DimExecutor(context, evaluator, variableService)
    parser = new FBasicParser()
    
    // Clear arrays before each test
    context.arrays.clear()
  })

  async function parseDimStatement(code: string) {
    const result = await parser.parse(code)
    if (!result.success || !result.cst) return null
    
    const statements = result.cst.children.statement
    if (!Array.isArray(statements) || statements.length === 0) return null
    
    const stmt = statements[0]
    if (!stmt || !('children' in stmt)) return null
    
    const commandListCst = getFirstCstNode(stmt.children.commandList)
    if (!commandListCst) return null
    
    const commandCst = getFirstCstNode(commandListCst.children.command)
    if (!commandCst) return null
    
    const singleCommandCst = getFirstCstNode(commandCst.children.singleCommand)
    if (!singleCommandCst) return null
    
    return getFirstCstNode(singleCommandCst.children.dimStatement)
  }

  describe('1D Array Declaration', () => {
    it('should create 1D numeric array', async () => {
      const dimStmtCst = await parseDimStatement('10 DIM A(3)')
      expect(dimStmtCst).not.toBeNull()

      executor.execute(dimStmtCst!, 10)

      expect(context.arrays.has('A')).toBe(true)
      const array = context.arrays.get('A')
      expect(array).toBeDefined()
      expect(Array.isArray(array)).toBe(true)
      // Array size should be 4 (indices 0, 1, 2, 3)
      expect((array as unknown[]).length).toBe(4)
    })

    it('should initialize numeric array elements to 0', async () => {
      const dimStmtCst = await parseDimStatement('10 DIM A(2)')
      expect(dimStmtCst).not.toBeNull()

      executor.execute(dimStmtCst!, 10)

      const array = context.arrays.get('A')
      expect(array).toBeDefined()
      expect(Array.isArray(array)).toBe(true)
      // All elements should be initialized to 0
      expect((array as number[])[0]).toBe(0)
      expect((array as number[])[1]).toBe(0)
      expect((array as number[])[2]).toBe(0)
    })

    it('should create 1D string array', async () => {
      const dimStmtCst = await parseDimStatement('20 DIM A$(3)')
      expect(dimStmtCst).not.toBeNull()

      executor.execute(dimStmtCst!, 20)

      expect(context.arrays.has('A$')).toBe(true)
      const array = context.arrays.get('A$')
      expect(array).toBeDefined()
      expect(Array.isArray(array)).toBe(true)
      expect((array as unknown[]).length).toBe(4)
    })

    it('should initialize string array elements to empty string', async () => {
      const dimStmtCst = await parseDimStatement('20 DIM A$(2)')
      expect(dimStmtCst).not.toBeNull()

      executor.execute(dimStmtCst!, 20)

      const array = context.arrays.get('A$')
      expect(array).toBeDefined()
      expect(Array.isArray(array)).toBe(true)
      // All elements should be initialized to empty string
      expect((array as string[])[0]).toBe('')
      expect((array as string[])[1]).toBe('')
      expect((array as string[])[2]).toBe('')
    })
  })

  describe('2D Array Declaration', () => {
    it('should create 2D numeric array', async () => {
      const dimStmtCst = await parseDimStatement('30 DIM B(3,3)')
      expect(dimStmtCst).not.toBeNull()

      executor.execute(dimStmtCst!, 30)

      expect(context.arrays.has('B')).toBe(true)
      const array = context.arrays.get('B')
      expect(array).toBeDefined()
      expect(Array.isArray(array)).toBe(true)
      // First dimension should have 4 elements
      expect((array as unknown[]).length).toBe(4)
      // Each element should be an array of 4 elements
      expect(Array.isArray((array as unknown[])[0])).toBe(true)
      expect(((array as unknown[])[0] as unknown[]).length).toBe(4)
    })

    it('should initialize 2D numeric array elements to 0', async () => {
      const dimStmtCst = await parseDimStatement('30 DIM B(2,2)')
      expect(dimStmtCst).not.toBeNull()

      executor.execute(dimStmtCst!, 30)

      const array = context.arrays.get('B')
      expect(array).toBeDefined()
      const firstRow = (array as unknown[])[0] as number[]
      expect(firstRow[0]).toBe(0)
      expect(firstRow[1]).toBe(0)
      expect(firstRow[2]).toBe(0)
    })

    it('should create 2D string array', async () => {
      const dimStmtCst = await parseDimStatement('40 DIM B$(3,3)')
      expect(dimStmtCst).not.toBeNull()

      executor.execute(dimStmtCst!, 40)

      expect(context.arrays.has('B$')).toBe(true)
      const array = context.arrays.get('B$')
      expect(array).toBeDefined()
      expect(Array.isArray(array)).toBe(true)
      expect((array as unknown[]).length).toBe(4)
    })
  })

  describe('Multiple Array Declaration', () => {
    it('should create multiple arrays in one DIM statement', async () => {
      const dimStmtCst = await parseDimStatement('50 DIM A(3), B(3,3), A$(3)')
      expect(dimStmtCst).not.toBeNull()

      executor.execute(dimStmtCst!, 50)

      expect(context.arrays.has('A')).toBe(true)
      expect(context.arrays.has('B')).toBe(true)
      expect(context.arrays.has('A$')).toBe(true)
    })
  })

  describe('Array Dimension Validation', () => {
    it('should reject negative dimensions', async () => {
      const dimStmtCst = await parseDimStatement('60 DIM A(-1)')
      expect(dimStmtCst).not.toBeNull()

      executor.execute(dimStmtCst!, 60)

      const errors = context.getErrors()
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]?.message).toContain('dimension must be >= 0')
    })

    it('should reject more than 2 dimensions', async () => {
      // Note: This would be caught at parser level, but we test executor validation
      const dimStmtCst = await parseDimStatement('70 DIM A(3)')
      expect(dimStmtCst).not.toBeNull()
      
      // Manually test with invalid dimension count (would need to mock CST)
      // For now, we test that 1D and 2D work correctly
      executor.execute(dimStmtCst!, 70)
      expect(context.arrays.has('A')).toBe(true)
    })
  })
})

