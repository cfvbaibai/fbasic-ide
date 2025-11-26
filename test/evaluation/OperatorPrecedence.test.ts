/**
 * Operator Precedence Tests
 * 
 * Comprehensive tests for operator precedence according to Family BASIC spec:
 * 1. Part between ( ) - Parentheses (highest)
 * 2. Functions
 * 3. *, / - Multiplications and divisions
 * 4. MOD - Remainders
 * 5. +, - - Additions and subtractions
 * 6. =, <>, >, <, >=, <= - Relational operators
 * 7. NOT - Negations
 * 8. AND - Logical products
 * 9. OR - Logical sums
 * 10. XOR - Exclusive logical sums (lowest)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('Operator Precedence', () => {
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

  describe('Priority 1: Parentheses', () => {
    it('should evaluate parentheses before all other operators', async () => {
      // (2 + 3) * 4 = 5 * 4 = 20
      const code = '10 LET X = (2 + 3) * 4'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.variables.get('X')?.value).toBe(20)
    })

    it('should handle nested parentheses', async () => {
      // ((2 + 3) * 4) - 1 = 20 - 1 = 19
      const code = '10 LET X = ((2 + 3) * 4) - 1'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(19)
    })

    it('should override operator precedence with parentheses', async () => {
      // 2 + (3 * 4) = 2 + 12 = 14
      const code = '10 LET X = 2 + (3 * 4)'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(14)
    })
  })

  describe('Priority 2: Functions', () => {
    it('should evaluate functions before arithmetic operators', async () => {
      // ABS(-5) + 3 = 5 + 3 = 8
      const code = '10 LET X = ABS(-5) + 3'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(8)
    })

    it('should evaluate functions before multiplication', async () => {
      // ABS(-5) * 2 = 5 * 2 = 10
      const code = '10 LET X = ABS(-5) * 2'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(10)
    })
  })

  describe('Priority 3: Multiplication and Division (*, /)', () => {
    it('should multiply before addition', async () => {
      // 2 + 3 * 4 = 2 + 12 = 14
      const code = '10 LET X = 2 + 3 * 4'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(14)
    })

    it('should divide before addition', async () => {
      // 10 + 8 / 2 = 10 + 4 = 14
      const code = '10 LET X = 10 + 8 / 2'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(14)
    })

    it('should multiply before subtraction', async () => {
      // 10 - 2 * 3 = 10 - 6 = 4
      const code = '10 LET X = 10 - 2 * 3'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(4)
    })
  })

  describe('Priority 4: MOD (Remainder)', () => {
    it('should evaluate MOD after multiplication/division but before addition', async () => {
      // 10 + 15 MOD 4 = 10 + 3 = 13
      const code = '10 LET X = 10 + 15 MOD 4'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(13)
    })

    it('should evaluate MOD after multiplication', async () => {
      // 2 * 15 MOD 4 = (2 * 15) MOD 4 = 30 MOD 4 = 2
      // MOD has lower precedence than multiplication
      const code = '10 LET X = 2 * 15 MOD 4'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(2)
    })

    it('should evaluate MOD before addition/subtraction', async () => {
      // 20 - 15 MOD 4 = 20 - 3 = 17
      const code = '10 LET X = 20 - 15 MOD 4'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(17)
    })
  })

  describe('Priority 5: Addition and Subtraction (+, -)', () => {
    it('should evaluate addition/subtraction after multiplication', async () => {
      // 2 + 3 * 4 = 2 + 12 = 14
      const code = '10 LET X = 2 + 3 * 4'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(14)
    })

    it('should evaluate addition/subtraction after MOD', async () => {
      // 10 + 15 MOD 4 = 10 + 3 = 13
      const code = '10 LET X = 10 + 15 MOD 4'
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.variables.get('X')?.value).toBe(13)
    })
  })

  describe('Priority 6: Relational Operators (=, <>, >, <, >=, <=)', () => {
    it('should evaluate relational operators after arithmetic', async () => {
      // 2 + 3 = 5 should be evaluated as (2 + 3) = 5 = true (-1)
      const code = `
10 IF 2 + 3 = 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should evaluate relational operators after multiplication', async () => {
      // 2 * 3 > 5 should be evaluated as (2 * 3) > 5 = 6 > 5 = true (-1)
      const code = `
10 IF 2 * 3 > 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should evaluate relational operators after MOD', async () => {
      // 15 MOD 4 = 3 should be evaluated as (15 MOD 4) = 3 = true (-1)
      const code = `
10 IF 15 MOD 4 = 3 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })
  })

  describe('Priority 7: NOT (Negation)', () => {
    it('should evaluate NOT after relational operators', async () => {
      // NOT 5 = 10 should be evaluated as NOT (5 = 10) = NOT false = true
      const code = `
10 IF NOT 5 = 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should evaluate NOT after arithmetic and relational', async () => {
      // NOT 2 + 3 = 5 should be evaluated as NOT ((2 + 3) = 5) = NOT true = false
      const code = `
10 IF NOT 2 + 3 = 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).not.toContain('True')
    })
  })

  describe('Priority 8: AND (Logical Product)', () => {
    it('should evaluate AND after NOT', async () => {
      // NOT 0 > 5 AND 5 > 0 should be evaluated as (NOT (0 > 5)) AND (5 > 0) = true AND true = true (-1)
      const code = `
10 IF NOT 0 > 5 AND 5 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should evaluate AND after relational operators', async () => {
      // 5 > 0 AND 10 > 0 should be evaluated as (5 > 0) AND (10 > 0) = true AND true = true
      const code = `
10 IF 5 > 0 AND 10 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should evaluate AND after arithmetic and relational', async () => {
      // 2 + 3 = 5 AND 10 - 5 = 5 should be evaluated as ((2 + 3) = 5) AND ((10 - 5) = 5) = true AND true = true
      const code = `
10 IF 2 + 3 = 5 AND 10 - 5 = 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })
  })

  describe('Priority 9: OR (Logical Sum)', () => {
    it('should evaluate OR after AND', async () => {
      // 0 > 5 OR 5 > 0 AND 0 > 10 should be evaluated as (0 > 5) OR ((5 > 0) AND (0 > 10)) = false OR (true AND false) = false OR false = false
      const code = `
10 IF 0 > 5 OR 5 > 0 AND 0 > 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).not.toContain('True')
    })

    it('should evaluate OR after NOT and AND', async () => {
      // NOT 0 > 5 OR 0 > 10 AND 5 > 0 should be evaluated as (NOT (0 > 5)) OR ((0 > 10) AND (5 > 0)) = true OR (false AND true) = true OR false = true
      const code = `
10 IF NOT 0 > 5 OR 0 > 10 AND 5 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })
  })

  describe('Priority 10: XOR (Exclusive Logical Sum)', () => {
    it('should evaluate XOR after OR', async () => {
      // 5 > 0 OR 0 > 10 XOR 10 > 0 should be evaluated as ((5 > 0) OR (0 > 10)) XOR (10 > 0) = (true OR false) XOR true = true XOR true = false
      const code = `
10 IF 5 > 0 OR 0 > 10 XOR 10 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).not.toContain('True')
    })

    it('should evaluate XOR after AND and OR', async () => {
      // 5 > 0 AND 10 > 0 OR 0 > 5 XOR 15 > 0 should be evaluated as (((5 > 0) AND (10 > 0)) OR (0 > 5)) XOR (15 > 0) = ((true AND true) OR false) XOR true = (true OR false) XOR true = true XOR true = false
      const code = `
10 IF 5 > 0 AND 10 > 0 OR 0 > 5 XOR 15 > 0 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).not.toContain('True')
    })
  })

  describe('Complex Precedence Examples', () => {
    it('should handle complex expression with all operator types', async () => {
      // (2 + 3) * 4 = 20 AND 10 MOD 3 = 1 OR NOT 5 = 10 XOR 15 > 10
      // = (5 * 4) = 20 AND (10 MOD 3) = 1 OR NOT (5 = 10) XOR (15 > 10)
      // = 20 = 20 AND 1 = 1 OR NOT false XOR true
      // = true AND true OR true XOR true
      // = true OR true XOR true
      // = true XOR true
      // = false
      const code = `
10 IF (2 + 3) * 4 = 20 AND 10 MOD 3 = 1 OR NOT 5 = 10 XOR 15 > 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).not.toContain('True')
    })

    it('should handle nested logical operators with arithmetic', async () => {
      // 2 * 3 + 4 = 10 AND 5 - 1 > 3 OR NOT 2 = 3
      // = (2 * 3) + 4 = 10 AND (5 - 1) > 3 OR NOT (2 = 3)
      // = 6 + 4 = 10 AND 4 > 3 OR NOT false
      // = 10 = 10 AND true OR true
      // = true AND true OR true
      // = true OR true
      // = true
      const code = `
10 IF 2 * 3 + 4 = 10 AND 5 - 1 > 3 OR NOT 2 = 3 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should handle function calls in logical expressions', async () => {
      // ABS(-5) + 3 = 8 AND 10 MOD 3 = 1
      // = (ABS(-5) + 3) = 8 AND (10 MOD 3) = 1
      // = (5 + 3) = 8 AND 1 = 1
      // = 8 = 8 AND true
      // = true AND true
      // = true
      const code = `
10 IF ABS(-5) + 3 = 8 AND 10 MOD 3 = 1 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })
  })
})

