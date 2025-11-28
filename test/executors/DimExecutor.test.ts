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

    it('should accept dimension 0 for 1D array', async () => {
      // DIM A(0) is valid - it creates an array with 1 element at index 0
      const dimStmtCst = await parseDimStatement('70 DIM A(0)')
      expect(dimStmtCst).not.toBeNull()
      
      executor.execute(dimStmtCst!, 70)
      
      // Dimension 0 is valid - creates array with 1 element
      expect(context.arrays.has('A')).toBe(true)
      const array = context.arrays.get('A')
      expect(array).toBeDefined()
      expect(Array.isArray(array)).toBe(true)
      expect((array as unknown[]).length).toBe(1)
      // Element at index 0 should be initialized to 0
      expect((array as number[])[0]).toBe(0)
    })

    it('should handle expression dimensions correctly', async () => {
      const dimStmtCst = await parseDimStatement('80 DIM A(10+5)')
      expect(dimStmtCst).not.toBeNull()
      
      executor.execute(dimStmtCst!, 80)
      
      expect(context.arrays.has('A')).toBe(true)
      const array = context.arrays.get('A')
      expect(array).toBeDefined()
      // Should create array with size 16 (indices 0-15)
      expect((array as unknown[]).length).toBe(16)
    })

    it('should handle complex expression dimensions', async () => {
      const dimStmtCst = await parseDimStatement('90 DIM A(2*3+1), B(10-5, 2+2)')
      expect(dimStmtCst).not.toBeNull()
      
      executor.execute(dimStmtCst!, 90)
      
      expect(context.arrays.has('A')).toBe(true)
      expect(context.arrays.has('B')).toBe(true)
      
      // A should have size 8 (indices 0-7, since 2*3+1 = 7)
      const arrayA = context.arrays.get('A')
      expect((arrayA as unknown[]).length).toBe(8)
      
      // B should be 2D: 6x5 (indices 0-5, 0-4)
      const arrayB = context.arrays.get('B')
      expect((arrayB as unknown[]).length).toBe(6)
      expect(((arrayB as unknown[])[0] as unknown[]).length).toBe(5)
    })

    it('should re-declare array and overwrite existing array', async () => {
      // First declaration
      const dimStmtCst1 = await parseDimStatement('100 DIM A(2)')
      expect(dimStmtCst1).not.toBeNull()
      executor.execute(dimStmtCst1!, 100)
      
      // Set some values
      variableService.setArrayElement('A', [0], 10)
      variableService.setArrayElement('A', [1], 20)
      
      // Re-declare with different size
      const dimStmtCst2 = await parseDimStatement('110 DIM A(4)')
      expect(dimStmtCst2).not.toBeNull()
      executor.execute(dimStmtCst2!, 110)
      
      // Array should be recreated and all elements should be 0
      const array = context.arrays.get('A')
      expect(array).toBeDefined()
      expect((array as unknown[]).length).toBe(5) // indices 0-4
      expect((array as number[])[0]).toBe(0)
      expect((array as number[])[1]).toBe(0)
      expect((array as number[])[2]).toBe(0)
    })

    it('should initialize 2D string array elements to empty string', async () => {
      const dimStmtCst = await parseDimStatement('120 DIM B$(2,2)')
      expect(dimStmtCst).not.toBeNull()
      
      executor.execute(dimStmtCst!, 120)
      
      const array = context.arrays.get('B$')
      expect(array).toBeDefined()
      const firstRow = (array as unknown[])[0] as string[]
      expect(firstRow[0]).toBe('')
      expect(firstRow[1]).toBe('')
      expect(firstRow[2]).toBe('')
      
      const secondRow = (array as unknown[])[1] as string[]
      expect(secondRow[0]).toBe('')
      expect(secondRow[1]).toBe('')
      expect(secondRow[2]).toBe('')
    })
  })
})

