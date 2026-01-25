/**
 * ASC and CHR$ Functions Tests
 *
 * Tests for Family BASIC character conversion functions:
 * - ASC(string) - converts first character to character code (0-255)
 * - CHR$(x) - converts character code (0-255) to character
 *
 * Based on Family Basic Manual page 83
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('ASC and CHR$ Functions', () => {
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

  describe('ASC function', () => {
    it('should return character code for single character string', async () => {
      const source = '10 LET A = ASC("H")\n20 PRINT A\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // ASC("H") = 72 per manual page 83
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 72\n')
    })

    it('should return character code of first character only', async () => {
      const source = '10 LET A = ASC("Hello")\n20 PRINT A\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // ASC("Hello") should return code of "H" only (72)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 72\n')
    })

    it('should return 0 for empty string', async () => {
      const source = '10 LET A = ASC("")\n20 PRINT A\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // ASC("") = 0 per manual page 83
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\n')
    })

    it('should work with string variable', async () => {
      const source = '10 LET A$ = "A"\n20 LET A = ASC(A$)\n30 PRINT A\n40 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // ASC("A") = 65
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 65\n')
    })

    it('should return character code for space character', async () => {
      const source = '10 LET A = ASC(" ")\n20 PRINT A\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Space character code is 32
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 32\n')
    })

    it('should return character code for digit', async () => {
      const source = '10 LET A = ASC("0")\n20 PRINT A\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // "0" character code is 48
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 48\n')
    })

    it('should handle ASC with uninitialized string variable', async () => {
      const source = '10 LET A = ASC(B$)\n20 PRINT A\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Uninitialized string variable is empty string, ASC("") = 0
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\n')
    })

    it('should return character code in range 0-255', async () => {
      // Test various character codes
      const source = '10 LET A = ASC("A")\n20 LET B = ASC("Z")\n30 PRINT A; B\n40 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // ASC("A") = 65, ASC("Z") = 90
      // Verify the values are in the correct range
      const aValue = result.variables.get('A')?.value
      const bValue = result.variables.get('B')?.value
      expect(aValue).toBe(65)
      expect(bValue).toBe(90)
      expect(aValue).toBeGreaterThanOrEqual(0)
      expect(aValue).toBeLessThanOrEqual(255)
      expect(bValue).toBeGreaterThanOrEqual(0)
      expect(bValue).toBeLessThanOrEqual(255)
    })
  })

  describe('CHR$ function', () => {
    it('should convert character code 65 to "A"', async () => {
      const source = '10 LET A$ = CHR$(65)\n20 PRINT A$\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // CHR$(65) = "A" per manual page 83
      expect(deviceAdapter.getAllOutputs()).toEqual('A\n')
    })

    it('should convert character code 72 to "H"', async () => {
      const source = '10 LET A$ = CHR$(72)\n20 PRINT A$\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // CHR$(72) = "H" per manual page 83
      expect(deviceAdapter.getAllOutputs()).toEqual('H\n')
    })

    it('should convert character code 96 to "ア" (kana)', async () => {
      const source = '10 LET A$ = CHR$(96)\n20 PRINT A$\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // CHR$(96) = "ア" per manual page 108 (Character Code List B)
      expect(deviceAdapter.getAllOutputs()).toEqual('ア\n')
    })

    it('should convert character code 0 to null character', async () => {
      const source = '10 LET A$ = CHR$(0)\n20 LET L = LEN(A$)\n30 PRINT L\n40 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // CHR$(0) should produce a character (length 1)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n')
    })

    it('should convert character code 32 to space', async () => {
      const source = '10 LET A$ = CHR$(32)\n20 LET L = LEN(A$)\n30 PRINT L\n40 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // CHR$(32) = space character
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n')
    })

    it('should convert character code 255', async () => {
      const source = '10 LET A$ = CHR$(255)\n20 LET L = LEN(A$)\n30 PRINT L\n40 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // CHR$(255) should produce a character
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n')
    })

    it('should work with variable', async () => {
      const source = '10 LET N = 65\n20 LET A$ = CHR$(N)\n30 PRINT A$\n40 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('A\n')
    })

    it('should handle CHR$ in expressions', async () => {
      const source = '10 LET A$ = CHR$(64 + 1)\n20 PRINT A$\n30 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // CHR$(64 + 1) = CHR$(65) = "A"
      expect(deviceAdapter.getAllOutputs()).toEqual('A\n')
    })

    it('should clamp values outside 0-255 range', async () => {
      const source = '10 LET A$ = CHR$(256)\n20 LET L = LEN(A$)\n30 PRINT L\n40 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Should handle out of range gracefully
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n')
    })

    it('should handle negative values', async () => {
      const source = '10 LET A$ = CHR$(-1)\n20 LET L = LEN(A$)\n30 PRINT L\n40 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Should handle negative values gracefully
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n')
    })
  })

  describe('ASC and CHR$ roundtrip', () => {
    it('should roundtrip character through ASC and CHR$', async () => {
      const source = '10 LET A$ = "H"\n20 LET C = ASC(A$)\n30 LET B$ = CHR$(C)\n40 PRINT B$\n50 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // ASC("H") = 72, CHR$(72) = "H"
      expect(deviceAdapter.getAllOutputs()).toEqual('H\n')
    })

    it('should roundtrip multiple characters', async () => {
      const source = '10 LET A$ = "A"\n20 LET C = ASC(A$)\n30 LET B$ = CHR$(C)\n40 PRINT B$\n50 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('A\n')
    })

    it('should handle roundtrip with expression', async () => {
      const source = '10 LET A$ = "Z"\n20 LET C = ASC(A$)\n30 LET B$ = CHR$(C + 1 - 1)\n40 PRINT B$\n50 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Should still produce "Z"
      expect(deviceAdapter.getAllOutputs()).toEqual('Z\n')
    })
  })

  describe('Sample programs from manual', () => {
    it('should handle ASC sample program pattern', async () => {
      const source = '10 REM * ASC *\n20 LET A$ = "H"\n30 LET A = ASC(A$)\n40 PRINT A$; " CHARACTER CODE IS"; A\n50 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Should output: "H CHARACTER CODE IS 72"
      // Verify variables are set correctly
      expect(result.variables.get('A$')?.value).toBe('H')
      expect(result.variables.get('A')?.value).toBe(72)
      // Check output format
      const output = deviceAdapter.getAllOutputs()
      expect(output).toBe('H CHARACTER CODE IS 72\n')
    })

    it('should handle CHR$ sample program pattern', async () => {
      const source =
        '10 REM * CHR$ *\n20 LET A = 65\n30 LET A$ = CHR$(A)\n40 PRINT A; " THE MATCHING CHARACTER IS"; A$\n50 END'
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)
      // Verify variables are set correctly
      expect(result.variables.get('A')?.value).toBe(65)
      expect(result.variables.get('A$')?.value).toBe('A')
      // Check output format - PRINT with semicolon concatenates without spaces
      const output = deviceAdapter.getAllOutputs()
      expect(output).toBe(' 65 THE MATCHING CHARACTER ISA\n')
    })
  })
})
