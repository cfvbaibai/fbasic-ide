/**
 * Logical Operators Tests
 * 
 * Tests for logical operators: NOT, AND, OR, XOR
 * These operators work on boolean values (non-zero = true, zero = false)
 * Return values: -1 for true, 0 for false (per Family BASIC spec)
 */

import { beforeEach,describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('Logical Operators', () => {
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

  describe('NOT Operator', () => {
    it('should return 0 (false) when operand is true (non-zero)', async () => {
      // NOT 5 = 5 should be evaluated as NOT (5 = 5) = NOT true = false (0)
      const code = `
10 IF NOT 5 = 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.getAllOutputs()).toEqual('')
    })

    it('should return -1 (true) when operand is false (zero)', async () => {
      // NOT 5 = 10 should be evaluated as NOT (5 = 10) = NOT false = true (-1)
      const code = `
10 IF NOT 5 = 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('True\n')
    })

    it('should work with comparison expressions', async () => {
      const code = `
10 IF NOT 5 = 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('True\n')
    })
  })

  describe('AND Operator', () => {
    it('should return -1 (true) when both operands are true', async () => {
      const code = `
10 IF 5 > 0 AND 10 > 0 THEN PRINT "Both True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('Both True\n')
    })

    it('should return 0 (false) when first operand is false', async () => {
      const code = `
10 IF 0 > 5 AND 10 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('')
    })

    it('should return 0 (false) when second operand is false', async () => {
      const code = `
10 IF 5 > 0 AND 0 > 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('')
    })

    it('should return 0 (false) when both operands are false', async () => {
      const code = `
10 IF 0 > 5 AND 0 > 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('')
    })

    it('should handle multiple AND operators', async () => {
      const code = `
10 IF 5 > 0 AND 10 > 0 AND 15 > 0 THEN PRINT "All True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('All True\n')
    })
  })

  describe('OR Operator', () => {
    it('should return -1 (true) when first operand is true', async () => {
      const code = `
10 IF 5 > 0 OR 0 > 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('True\n')
    })

    it('should return -1 (true) when second operand is true', async () => {
      const code = `
10 IF 0 > 5 OR 10 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('True\n')
    })

    it('should return -1 (true) when both operands are true', async () => {
      const code = `
10 IF 5 > 0 OR 10 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('True\n')
    })

    it('should return 0 (false) when both operands are false', async () => {
      const code = `
10 IF 0 > 5 OR 0 > 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('')
    })

    it('should handle multiple OR operators', async () => {
      const code = `
10 IF 0 > 5 OR 0 > 10 OR 15 > 0 THEN PRINT "At Least One True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('At Least One True\n')
    })
  })

  describe('XOR Operator', () => {
    it('should return 0 (false) when both operands are true', async () => {
      const code = `
10 IF 5 > 0 XOR 10 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('')
    })

    it('should return -1 (true) when first operand is true and second is false', async () => {
      const code = `
10 IF 5 > 0 XOR 0 > 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('True\n')
    })

    it('should return -1 (true) when first operand is false and second is true', async () => {
      const code = `
10 IF 0 > 5 XOR 10 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('True\n')
    })

    it('should return 0 (false) when both operands are false', async () => {
      const code = `
10 IF 0 > 5 XOR 0 > 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('')
    })
  })

  describe('Combined Logical Operators', () => {
    it('should evaluate AND before OR', async () => {
      // A OR B AND C should be evaluated as A OR (B AND C)
      const code = `
10 IF 0 > 5 OR 5 > 0 AND 0 > 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      // (0 > 5) OR (5 > 0 AND 0 > 10) = false OR (true AND false) = false OR false = false
      expect(deviceAdapter.getAllOutputs()).toEqual('')
    })

    it('should evaluate NOT before AND', async () => {
      const code = `
10 IF NOT 0 > 5 AND 5 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      // (NOT false) AND true = true AND true = true
      expect(deviceAdapter.getAllOutputs()).toEqual('True\n')
    })

    it('should evaluate OR before XOR', async () => {
      // A OR B XOR C should be evaluated as (A OR B) XOR C
      // According to spec: OR has higher precedence than XOR
      const code = `
10 IF 5 > 0 OR 0 > 10 XOR 10 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      // (true OR false) XOR true = true XOR true = false
      expect(deviceAdapter.getAllOutputs()).toEqual('')
    })
  })
})

