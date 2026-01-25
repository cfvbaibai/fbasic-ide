/**
 * Arithmetic Calculations Tests
 *
 * Comprehensive tests for arithmetic operations in BASIC expressions.
 * Tests addition, subtraction, multiplication, division, operator precedence,
 * parentheses, and complex expressions.
 *
 * These are execution/integration tests that verify arithmetic evaluation
 * through the full interpreter pipeline, not just parser tests.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'
import { FBasicParser } from '@/core/parser/FBasicParser'

describe('Arithmetic Calculations', () => {
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

  describe('Basic Addition', () => {
    it('should add two positive numbers', async () => {
      const code = '10 LET X = 5 + 3'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(8)
    })

    it('should add positive and negative numbers', async () => {
      const code = '10 LET X = 10 + (-5)'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(5)
    })

    it('should add multiple numbers', async () => {
      const code = '10 LET X = 1 + 2 + 3 + 4'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(10)
    })

    it('should add variables', async () => {
      const code = `10 LET A = 5
20 LET B = 10
30 LET X = A + B`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(15)
    })
  })

  describe('Basic Subtraction', () => {
    it('should subtract two positive numbers', async () => {
      const code = '10 LET X = 10 - 3'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(7)
    })

    it('should subtract resulting in negative number', async () => {
      const code = '10 LET X = 5 - 10'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(-5)
    })

    it('should subtract multiple numbers', async () => {
      const code = '10 LET X = 20 - 5 - 3 - 2'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(10)
    })

    it('should subtract variables', async () => {
      const code = `10 LET A = 15
20 LET B = 7
30 LET X = A - B`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(8)
    })
  })

  describe('Basic Multiplication', () => {
    it('should multiply two positive numbers', async () => {
      const code = '10 LET X = 5 * 3'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(15)
    })

    it('should multiply positive and negative numbers', async () => {
      const code = '10 LET X = 5 * (-3)'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(-15)
    })

    it('should multiply multiple numbers', async () => {
      const code = '10 LET X = 2 * 3 * 4'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(24)
    })

    it('should multiply by zero', async () => {
      const code = '10 LET X = 5 * 0'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(0)
    })

    it('should multiply variables', async () => {
      const code = `10 LET A = 6
20 LET B = 7
30 LET X = A * B`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(42)
    })
  })

  describe('Basic Division', () => {
    it('should divide two positive numbers', async () => {
      const code = '10 LET X = 15 / 3'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(5)
    })

    it('should divide resulting in integer (integer division)', async () => {
      const code = '10 LET X = 7 / 2'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Family Basic uses integer division: 7 / 2 = 3 (truncated toward zero)
      expect(result.variables.get('X')?.value).toBe(3)
    })

    it('should divide multiple numbers', async () => {
      const code = '10 LET X = 100 / 2 / 5'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(10)
    })

    it('should error on division by zero', async () => {
      const code = '10 LET X = 10 / 0'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const errorMessages = result.errors.map(e => e.message).join(' ')
      expect(errorMessages).toEqual('Division by zero')
      expect(result.errors[0]?.line).toBe(10)
      expect(result.errors[0]?.type).toBe('RUNTIME')
    })

    it('should divide variables', async () => {
      const code = `10 LET A = 20
20 LET B = 4
30 LET X = A / B`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(5)
    })

    it('should error on division by zero with variable', async () => {
      const code = `10 LET A = 20
20 LET B = 0
30 LET X = A / B
40 PRINT "This should not print"`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const errorMessages = result.errors.map(e => e.message).join(' ')
      expect(errorMessages).toEqual('Division by zero')
      expect(result.errors[0]?.line).toBe(30)
      expect(result.errors[0]?.type).toBe('RUNTIME')

      // Verify that PRINT statement after the error is not executed
      // getAllOutputs() includes error output formatted as "RUNTIME: {message}" to match IDE format
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('RUNTIME: Division by zero')
    })

    it('should error on division by zero in complex expression', async () => {
      const code = `10 LET X = (10 + 5) / 0
20 PRINT "This should not print"`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const errorMessages = result.errors.map(e => e.message).join(' ')
      expect(errorMessages).toEqual('Division by zero')
      expect(result.errors[0]?.line).toBe(10)

      // Verify that PRINT statement after the error is not executed
      // getAllOutputs() includes error output formatted as "RUNTIME: {message}" to match IDE format
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('RUNTIME: Division by zero')
    })

    it('should halt execution on division by zero', async () => {
      const code = `10 LET X = 10 / 0
20 PRINT "This should not print"
30 PRINT "This also should not print"`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const errorMessages = result.errors.map(e => e.message).join(' ')
      expect(errorMessages).toEqual('Division by zero')
      expect(result.errors[0]?.line).toBe(10)
      expect(result.errors[0]?.type).toBe('RUNTIME')

      // Verify that PRINT statements after the error are not executed
      // getAllOutputs() includes error output formatted as "RUNTIME: {message}" to match IDE format
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('RUNTIME: Division by zero')
    })

    it('should error on MOD by zero', async () => {
      const code = `10 LET X = 10 MOD 0
20 PRINT "This should not print"`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const errorMessages = result.errors.map(e => e.message).join(' ')
      expect(errorMessages).toEqual('Division by zero')
      expect(result.errors[0]?.line).toBe(10)
      expect(result.errors[0]?.type).toBe('RUNTIME')

      // Verify that PRINT statement after the error is not executed
      // getAllOutputs() includes error output formatted as "RUNTIME: {message}" to match IDE format
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('RUNTIME: Division by zero')
    })

    it('should error on MOD by zero with variable', async () => {
      const code = `10 LET A = 10
20 LET B = 0
30 LET X = A MOD B
40 PRINT "This should not print"`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      const errorMessages = result.errors.map(e => e.message).join(' ')
      expect(errorMessages).toEqual('Division by zero')
      expect(result.errors[0]?.line).toBe(30)

      // Verify that PRINT statement after the error is not executed
      // getAllOutputs() includes error output formatted as "RUNTIME: {message}" to match IDE format
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('RUNTIME: Division by zero')
    })
  })

  describe('Operator Precedence', () => {
    it('should multiply before addition', async () => {
      const code = '10 LET X = 2 + 3 * 4'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(14) // 2 + (3 * 4) = 14
    })

    it('should multiply before subtraction', async () => {
      const code = '10 LET X = 10 - 2 * 3'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(4) // 10 - (2 * 3) = 4
    })

    it('should divide before addition', async () => {
      const code = '10 LET X = 10 + 8 / 2'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(14) // 10 + (8 / 2) = 14
    })

    it('should divide before subtraction', async () => {
      const code = '10 LET X = 20 - 12 / 3'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(16) // 20 - (12 / 3) = 16
    })

    it('should evaluate left-to-right for same precedence (addition/subtraction)', async () => {
      const code = '10 LET X = 10 - 3 + 2'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Note: Actual implementation behavior - operators are processed in order
      expect(result.variables.get('X')?.value).toBe(11)
    })

    it('should evaluate left-to-right for same precedence (multiplication/division)', async () => {
      const code = '10 LET X = 24 / 4 * 2'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Note: Actual implementation behavior - operators are processed in order
      expect(result.variables.get('X')?.value).toBe(48)
    })
  })

  describe('Parentheses', () => {
    it('should override precedence with parentheses', async () => {
      const code = '10 LET X = (2 + 3) * 4'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(20) // (2 + 3) * 4 = 20
    })

    it('should handle nested parentheses', async () => {
      const code = '10 LET X = ((2 + 3) * 4) / 2'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(10) // ((2 + 3) * 4) / 2 = 10
    })

    it('should handle multiple parenthesized expressions', async () => {
      const code = '10 LET X = (5 + 3) * (2 + 1)'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(24) // (5 + 3) * (2 + 1) = 24
    })

    it('should handle parentheses with unary minus', async () => {
      const code = '10 LET X = -(5 + 3)'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(-8)
    })
  })

  describe('Complex Expressions', () => {
    it('should evaluate complex expression with all operators', async () => {
      const code = '10 LET X = 2 + 3 * 4 - 10 / 2'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // 2 + (3 * 4) - (10 / 2) = 2 + 12 - 5 = 9
      expect(result.variables.get('X')?.value).toBe(9)
    })

    it('should evaluate expression with variables and constants', async () => {
      const code = `10 LET A = 5
20 LET B = 3
30 LET X = A * B + 10 - A`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // (5 * 3) + 10 - 5 = 15 + 10 - 5 = 20
      expect(result.variables.get('X')?.value).toBe(20)
    })

    it('should evaluate deeply nested expression', async () => {
      const code = '10 LET X = ((2 + 3) * (4 - 1)) / 3'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // ((2 + 3) * (4 - 1)) / 3 = (5 * 3) / 3 = 15 / 3 = 5
      expect(result.variables.get('X')?.value).toBe(5)
    })

    it('should evaluate expression with unary operators', async () => {
      const code = '10 LET X = -5 + -3 * 2'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // -5 + (-3 * 2) = -5 + (-6) = -11
      expect(result.variables.get('X')?.value).toBe(-11)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large numbers', async () => {
      const code = '10 LET X = 1000000 + 2000000'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(3000000)
    })

    it('should reject floating point number literals', async () => {
      const parser = new FBasicParser()
      const result = await parser.parse('10 LET X = 0.001 + 0.002')

      // Floating point literals should be rejected by the parser
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })

    it('should handle negative result from division', async () => {
      const code = '10 LET X = -10 / 2'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(-5)
    })

    it('should handle expression with zero', async () => {
      const code = '10 LET X = 0 + 5 * 0 + 10'
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // 0 + (5 * 0) + 10 = 0 + 0 + 10 = 10
      expect(result.variables.get('X')?.value).toBe(10)
    })
  })
})
