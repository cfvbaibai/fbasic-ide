/**
 * Array Assignment Tests
 * 
 * Tests for assigning values to array elements using LET statement.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { FBasicParser } from '@/core/parser/FBasicParser'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'
import type { BasicScalarValue, BasicArrayValue } from '@/core/types/BasicTypes'

describe('Array Assignment', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter
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

  describe('Execution Tests - 1D Numeric Arrays', () => {
    it('should assign value to 1D numeric array element', async () => {
      const code = `10 DIM A(3)
20 LET A(0) = 10
30 LET A(1) = 20
40 LET A(2) = 30
50 PRINT A(0), A(1), A(2)
60 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify array values
      const array = result.arrays?.get('A') as BasicScalarValue[]
      expect(array).toBeDefined()
      expect(array[0]).toBe(10)
      expect(array[1]).toBe(20)
      expect(array[2]).toBe(30)
      
      // Verify PRINT output
      // Comma separator uses tab stops, numbers get leading space
      const outputs = deviceAdapter.getAllOutputs()
      // PRINT doesn't end with semicolon, so adds newline
      expect(outputs).toEqual(' 10\t 20\t 30\n')
    })

    it('should assign value using expression index', async () => {
      const code = `10 DIM A(5)
20 LET I = 2
30 LET A(I) = 100
40 LET A(I + 1) = 200
50 PRINT A(2), A(3)
60 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify array values
      const array = result.arrays?.get('A') as BasicScalarValue[]
      expect(array).toBeDefined()
      expect(array[2]).toBe(100)
      expect(array[3]).toBe(200)
      
      // Verify PRINT output
      const outputs = deviceAdapter.getAllOutputs()
      // PRINT doesn't end with semicolon, so adds newline
      expect(outputs).toEqual(' 100\t 200\n')
    })

    it('should assign value using expression as value', async () => {
      const code = `10 DIM A(5)
20 LET I = 3
30 LET A(0) = I * 2
40 LET A(1) = I + 5
50 PRINT A(0), A(1)
60 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify array values
      const array = result.arrays?.get('A') as BasicScalarValue[]
      expect(array).toBeDefined()
      expect(array[0]).toBe(6) // 3 * 2
      expect(array[1]).toBe(8) // 3 + 5
      
      // Verify PRINT output
      const outputs = deviceAdapter.getAllOutputs()
      // PRINT doesn't end with semicolon, so adds newline
      expect(outputs).toEqual(' 6\t 8\n')
    })

    it('should assign values in a loop', async () => {
      const code = `10 DIM A(5)
20 FOR I = 0 TO 4
30 LET A(I) = I * 10
40 NEXT
50 PRINT A(0); A(1); A(2); A(3); A(4)
60 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify array values
      const array = result.arrays?.get('A') as BasicScalarValue[]
      expect(array).toBeDefined()
      expect(array[0]).toBe(0)
      expect(array[1]).toBe(10)
      expect(array[2]).toBe(20)
      expect(array[3]).toBe(30)
      expect(array[4]).toBe(40)
      
      // Verify PRINT output (semicolon separator, numbers get leading space)
      // PRINT doesn't end with semicolon (last item is A(4), not a semicolon), so adds newline
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual(' 0 10 20 30 40\n')
    })

    it('should overwrite array element values', async () => {
      const code = `10 DIM A(3)
20 LET A(0) = 10
30 LET A(0) = 99
40 PRINT A(0)
50 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify array value was overwritten
      const array = result.arrays?.get('A') as BasicScalarValue[]
      expect(array[0]).toBe(99)
      
      // Verify PRINT output
      // PRINT doesn't end with semicolon, so adds newline
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual(' 99\n')
    })
  })

  describe('Execution Tests - 2D Numeric Arrays', () => {
    it('should assign value to 2D numeric array element', async () => {
      const code = `10 DIM A(2, 2)
20 LET A(0, 0) = 1
30 LET A(0, 1) = 2
40 LET A(1, 0) = 3
50 LET A(1, 1) = 4
60 PRINT A(0, 0), A(0, 1), A(1, 0), A(1, 1)
70 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify array values
      const array = result.arrays?.get('A') as BasicArrayValue[]
      expect(array).toBeDefined()
      const row0 = array[0] as BasicScalarValue[]
      const row1 = array[1] as BasicScalarValue[]
      expect(row0[0]).toBe(1)
      expect(row0[1]).toBe(2)
      expect(row1[0]).toBe(3)
      expect(row1[1]).toBe(4)
      
      // Verify PRINT output
      // PRINT doesn't end with comma (last item is A(1,1), not a comma), so adds newline
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual(' 1\t 2\t 3\t 4\n')
    })

    it('should assign values to 2D array using expressions', async () => {
      const code = `10 DIM A(2, 2)
20 LET I = 0
30 LET J = 1
40 LET A(I, J) = 42
50 LET A(I + 1, J - 1) = 99
60 PRINT A(0, 1), A(1, 0)
70 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify array values
      const array = result.arrays?.get('A') as BasicArrayValue[]
      const row0 = array[0] as BasicScalarValue[]
      const row1 = array[1] as BasicScalarValue[]
      expect(row0[1]).toBe(42)
      expect(row1[0]).toBe(99)
      
      // Verify PRINT output
      // PRINT doesn't end with comma (last item is A(1,0), not a comma), so adds newline
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual(' 42\t 99\n')
    })
  })

  describe('Execution Tests - String Arrays', () => {
    it('should assign value to string array element', async () => {
      const code = `10 DIM A$(2)
20 LET A$(0) = "Hello"
30 LET A$(1) = "World"
40 PRINT A$(0), A$(1)
50 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify array values
      const array = result.arrays?.get('A$') as BasicScalarValue[]
      expect(array).toBeDefined()
      expect(array[0]).toBe('Hello')
      expect(array[1]).toBe('World')
      
      // Verify PRINT output (comma separator uses tab stops)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('Hello\tWorld\n')
    })

    it('should assign string values using expressions', async () => {
      const code = `10 DIM A$(3)
20 LET I = 1
30 LET A$(I) = "Test"
40 LET A$(I + 1) = "Value"
50 PRINT A$(1), A$(2)
60 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify array values
      const array = result.arrays?.get('A$') as BasicScalarValue[]
      expect(array[1]).toBe('Test')
      expect(array[2]).toBe('Value')
      
      // Verify PRINT output
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('Test\tValue\n')
    })

    it('should assign empty string to array element', async () => {
      const code = `10 DIM A$(2)
20 LET A$(0) = ""
30 PRINT A$(0)
40 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Verify array value
      const array = result.arrays?.get('A$') as BasicScalarValue[]
      expect(array[0]).toBe('')
      
      // Verify PRINT output (empty string prints nothing)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('')
    })
  })

  describe('Execution Tests - Edge Cases', () => {
    it('should handle array assignment at index 0', async () => {
      const code = `10 DIM A(1)
20 LET A(0) = 42
30 PRINT A(0)
40 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      const array = result.arrays?.get('A') as BasicScalarValue[]
      expect(array[0]).toBe(42)
      
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual(' 42\n')
    })

    it('should handle array assignment at maximum index', async () => {
      const code = `10 DIM A(5)
20 LET A(5) = 100
30 PRINT A(5)
40 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      const array = result.arrays?.get('A') as BasicScalarValue[]
      expect(array[5]).toBe(100)
      
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual(' 100\n')
    })

    it('should handle negative number assignment', async () => {
      const code = `10 DIM A(2)
20 LET A(0) = -10
30 PRINT A(0)
40 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      const array = result.arrays?.get('A') as BasicScalarValue[]
      expect(array[0]).toBe(-10)
      
      // Negative numbers don't get leading space
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('-10\n')
    })

    it('should handle zero assignment', async () => {
      const code = `10 DIM A(2)
20 LET A(0) = 0
30 PRINT A(0)
40 END`
      
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      const array = result.arrays?.get('A') as BasicScalarValue[]
      expect(array[0]).toBe(0)
      
      // Zero gets leading space
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual(' 0\n')
    })
  })
})
