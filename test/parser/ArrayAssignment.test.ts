/**
 * Array Assignment Tests
 * 
 * Tests for assigning values to array elements using LET statement.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { FBasicParser } from '@/core/parser/FBasicParser'

describe('Array Assignment', () => {
  let interpreter: BasicInterpreter

  beforeEach(() => {
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false
    })
  })

  describe('Parser Tests', () => {
    it('should parse LET statement with 1D array assignment', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 LET A(0) = 5')
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse LET statement with 2D array assignment', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 LET A(0, 1) = 10')
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse LET statement with string array assignment', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 LET A$(0) = "Hello"')
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })

    it('should parse LET statement with array assignment using expression', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 LET A(I) = I * 2')
      
      expect(result.success).toBe(true)
      expect(result.cst).toBeDefined()
    })
  })

  describe('Execution Tests', () => {
    it('should assign value to 1D numeric array element', async () => {
      const code = `10 DIM A(3)
20 LET A(0) = 10
30 LET A(1) = 20
40 LET A(2) = 30
50 PRINT A(0), A(1), A(2)`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should assign value to 2D numeric array element', async () => {
      const code = `10 DIM A(2, 2)
20 LET A(0, 0) = 1
30 LET A(0, 1) = 2
40 LET A(1, 0) = 3
50 LET A(1, 1) = 4
60 PRINT A(0, 0), A(0, 1), A(1, 0), A(1, 1)`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should assign value to string array element', async () => {
      const code = `10 DIM A$(2)
20 LET A$(0) = "Hello"
30 LET A$(1) = "World"
40 PRINT A$(0), A$(1)`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should assign value using expression index', async () => {
      const code = `10 DIM A(5)
20 LET I = 2
30 LET A(I) = 100
40 LET A(I + 1) = 200
50 PRINT A(2), A(3)`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should assign value using expression as value', async () => {
      const code = `10 DIM A(5)
20 LET I = 3
30 LET A(0) = I * 2
40 LET A(1) = I + 5
50 PRINT A(0), A(1)`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})

