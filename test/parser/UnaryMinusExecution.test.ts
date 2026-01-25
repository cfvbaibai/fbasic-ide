/**
 * Unary Minus Execution Tests
 * 
 * Integration tests for executing expressions with unary minus operator.
 */

import { beforeEach,describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'

describe('Unary Minus Execution', () => {
  let interpreter: BasicInterpreter

  beforeEach(() => {
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false
    })
  })

  describe('Unary Minus in LET Statements', () => {
    it('should execute LET with negative number', async () => {
      const code = '10 LET X = -5'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(-5)
    })

    it('should execute LET with negative variable', async () => {
      const code = `10 LET Y = 10
20 LET X = -Y`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(-10)
    })

    it('should execute LET with negative expression', async () => {
      const code = '10 LET X = -(5 + 3)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(-8)
    })

    it('should execute LET with complex unary minus expression', async () => {
      const code = '10 LET X = -5 * -2'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(10) // -5 * -2 = 10
    })

    it('should execute LET with mixed unary and binary operators', async () => {
      const code = '10 LET X = -5 + -3'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(-8) // -5 + -3 = -8
    })
  })

  describe('Unary Minus in FOR Loops', () => {
    it('should execute FOR loop with negative step', async () => {
      const code = `10 FOR I = 5 TO 1 STEP -1
20 PRINT I
30 NEXT`
      const result = await interpreter.execute(code)
      
      if (!result.success) {
        console.log('Execution errors:', result.errors)
      }
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Loop should execute: 5, 4, 3, 2, 1
      expect(result.variables.get('I')?.value).toBe(0) // After loop completes, I = 1 - 1 = 0
    })

    it('should execute FOR loop with negative start', async () => {
      const code = `10 FOR I = -3 TO 3
20 PRINT I
30 NEXT`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Loop should execute: -3, -2, -1, 0, 1, 2, 3
      expect(result.variables.get('I')?.value).toBe(4) // After loop completes
    })
  })
})

