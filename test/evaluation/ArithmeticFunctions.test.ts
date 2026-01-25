/**
 * Arithmetic Functions Tests
 * 
 * Tests for Family BASIC arithmetic functions: ABS, SGN, RND
 */

import { beforeEach,describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('Arithmetic Functions', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter: deviceAdapter
    })
  })

  describe('ABS function', () => {
    it('should return absolute value of positive number', async () => {
      const source = '10 LET X = ABS(5)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 5\n')
    })

    it('should return absolute value of negative number', async () => {
      const source = '10 LET X = ABS(-5)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 5\n')
    })

    it('should return 0 for ABS(0)', async () => {
      const source = '10 LET X = ABS(0)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\n')
    })

    it('should handle ABS with expression as per manual example', async () => {
      const source = '10 LET X = ABS(10-34)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // ABS(10-34) = ABS(-24) = 24 per manual page 82
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 24\n')
    })
  })


  describe('SGN function', () => {
    it('should return 1 for positive number', async () => {
      const source = '10 LET X = SGN(5)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n')
    })

    it('should return -1 for negative number', async () => {
      const source = '10 LET X = SGN(-5)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Negative numbers don't get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual('-1\n')
    })

    it('should return 0 for zero', async () => {
      const source = '10 LET X = SGN(0)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\n')
    })
  })

  describe('RND function', () => {
    it('should return random number between 0 and (x-1) when x > 1', async () => {
      const source = '10 LET X = RND(10)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Check that output contains a number between 0 and 9 (10-1)
      const outputs = deviceAdapter.printOutputs
      expect(outputs.length).toBeGreaterThan(0)
      const outputValue = parseInt(outputs[0] ?? '0', 10)
      expect(outputValue).toBeGreaterThanOrEqual(0)
      expect(outputValue).toBeLessThanOrEqual(9)
    })

    it('should always return 0 for RND(1)', async () => {
      const source = '10 LET X = RND(1)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // RND(1) always returns 0 according to spec
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\n')
    })

    it('should return random number between 0 and 7 for RND(8)', async () => {
      const source = '10 LET X = RND(8)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Check that output contains a number between 0 and 7 (8-1)
      const outputs = deviceAdapter.printOutputs
      expect(outputs.length).toBeGreaterThan(0)
      const outputValue = parseInt(outputs[0] ?? '0', 10)
      expect(outputValue).toBeGreaterThanOrEqual(0)
      expect(outputValue).toBeLessThanOrEqual(7)
    })

    it('should error for RND(0)', async () => {
      const source = '10 LET X = RND(0)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should error for RND with negative argument', async () => {
      const source = '10 LET X = RND(-5)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should error for RND with argument > 32767', async () => {
      const source = '10 LET X = RND(32768)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })


  describe('Function composition', () => {
    it('should handle nested function calls', async () => {
      const source = '10 LET X = ABS(SGN(-5))\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // SGN(-5) = -1, ABS(-1) = 1
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n')
    })

    it('should handle functions in expressions', async () => {
      const source = '10 LET X = ABS(-5) + SGN(10)\n20 PRINT X\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // ABS(-5) = 5, SGN(10) = 1, 5 + 1 = 6
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 6\n')
    })

    it('should handle functions with variables', async () => {
      const source = '10 LET A = -10\n20 LET X = ABS(A)\n30 PRINT X\n40 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 10\n')
    })
  })
})

