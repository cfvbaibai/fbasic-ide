/**
 * VAL and STR$ Functions Tests
 *
 * Tests for Family BASIC conversion functions:
 * - VAL(string) - converts string to numerical value
 * - STR$(x) - converts numerical value to string
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('VAL and STR$ Functions', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter: deviceAdapter,
    })
  })

  describe('STR$ function', () => {
    it('should convert positive number to string with leading space', async () => {
      const source = '10 LET A$ = STR$(5)\n20 PRINT A$\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // STR$(5) should return " 5" (with leading space)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 5\nOK\n')
    })

    it('should convert negative number to string without leading space', async () => {
      const source = '10 LET A$ = STR$(-5)\n20 PRINT A$\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // STR$(-5) should return "-5" (no leading space for negative)
      expect(deviceAdapter.getAllOutputs()).toEqual('-5\nOK\n')
    })

    it('should convert zero to string with leading space', async () => {
      const source = '10 LET A$ = STR$(0)\n20 PRINT A$\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // STR$(0) should return " 0" (with leading space)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\nOK\n')
    })

    it('should convert variable to string', async () => {
      const source = '10 LET A = 42\n20 LET A$ = STR$(A)\n30 PRINT A$\n40 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 42\nOK\n')
    })

    it('should handle STR$ in expressions', async () => {
      const source = '10 LET A$ = STR$(10) + STR$(20)\n20 PRINT A$\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // STR$(10) + STR$(20) = " 10" + " 20" = " 10 20"
      expect(deviceAdapter.getAllOutputs()).toEqual(' 10 20\nOK\n')
    })
  })

  describe('VAL function', () => {
    it('should convert decimal string to number', async () => {
      const source = '10 LET V = VAL("123")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 123\nOK\n')
    })

    it('should convert positive decimal string to number', async () => {
      const source = '10 LET V = VAL("+456")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 456\nOK\n')
    })

    it('should convert negative decimal string to number', async () => {
      const source = '10 LET V = VAL("-789")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Negative numbers don't get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual('-789\nOK\n')
    })

    it('should return 0 for invalid first character', async () => {
      const source = '10 LET V = VAL("ABC")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\nOK\n')
    })

    it('should ignore characters after non-numeric', async () => {
      const source = '10 LET V = VAL("123ABC")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Should parse "123" and ignore "ABC"
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 123\nOK\n')
    })

    it('should handle empty string', async () => {
      const source = '10 LET V = VAL("")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\nOK\n')
    })

    it('should convert hexadecimal string to number', async () => {
      const source = '10 LET V = VAL("&HAD")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // &HAD = 173 decimal
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 173\nOK\n')
    })

    it('should convert hexadecimal with lowercase', async () => {
      const source = '10 LET V = VAL("&Had")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // &Had = 173 decimal
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 173\nOK\n')
    })

    it('should handle hexadecimal with invalid characters', async () => {
      const source = '10 LET V = VAL("&HADXYZ")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Should parse "AD" and ignore "XYZ"
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 173\nOK\n')
    })

    it('should clamp hexadecimal to 32767', async () => {
      const source = '10 LET V = VAL("&HFFFF")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // &HFFFF = 65535, but should clamp to 32767
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 32767\nOK\n')
    })

    it('should clamp decimal to 32767', async () => {
      const source = '10 LET V = VAL("50000")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Should clamp to 32767
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 32767\nOK\n')
    })

    it('should clamp negative decimal to -32768', async () => {
      const source = '10 LET V = VAL("-50000")\n20 PRINT V\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Should clamp to -32768
      // Negative numbers don't get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual('-32768\nOK\n')
    })

    it('should handle VAL with variable', async () => {
      const source = '10 LET A$ = "42"\n20 LET V = VAL(A$)\n30 PRINT V\n40 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 42\nOK\n')
    })

    it('should handle VAL with STR$ roundtrip', async () => {
      const source = '10 LET A = 123\n20 LET A$ = STR$(A)\n30 LET B = VAL(A$)\n40 PRINT B\n50 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // STR$(123) = " 123", VAL(" 123") = 123
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 123\nOK\n')
    })
  })

  describe('Function composition', () => {
    it('should handle STR$ with arithmetic expression', async () => {
      const source = '10 LET A$ = STR$(5 + 3)\n20 PRINT A$\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // STR$(8) = " 8"
      expect(deviceAdapter.getAllOutputs()).toEqual(' 8\nOK\n')
    })

    it('should handle VAL with string concatenation', async () => {
      const source = '10 LET A$ = "12"\n20 LET B$ = "34"\n30 LET V = VAL(A$ + B$)\n40 PRINT V\n50 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // VAL("1234") = 1234
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1234\nOK\n')
    })
  })
})
