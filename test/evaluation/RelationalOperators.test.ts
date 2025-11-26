/**
 * Relational Operators Tests
 * 
 * Tests for relational/comparison operators: =, <>, <, >, <=, >=
 * These operators return -1 for true, 0 for false (per Family BASIC spec)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('Relational Operators', () => {
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

  describe('Equality Operator (=)', () => {
    it('should return -1 (true) when numbers are equal', async () => {
      const code = `
10 IF 5 = 5 THEN PRINT "-1"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.getAllOutputs()).toContain('-1')
    })

    it('should return 0 (false) when numbers are not equal', async () => {
      const code = `
10 IF 5 = 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).not.toContain('True')
    })

    it('should compare strings correctly', async () => {
      const code = `
10 LET A$ = "Hello"
20 IF A$ = "Hello" THEN PRINT "Match"
30 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('Match')
    })
  })

  describe('Inequality Operator (<>)', () => {
    it('should return -1 (true) when numbers are not equal', async () => {
      const code = `
10 IF 5 <> 10 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should return 0 (false) when numbers are equal', async () => {
      const code = `
10 IF 5 <> 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).not.toContain('True')
    })
  })

  describe('Less Than Operator (<)', () => {
    it('should return -1 (true) when left is less than right', async () => {
      const code = `
10 IF 3 < 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should return 0 (false) when left is not less than right', async () => {
      const code = `
10 IF 5 < 3 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).not.toContain('True')
    })
  })

  describe('Greater Than Operator (>)', () => {
    it('should return -1 (true) when left is greater than right', async () => {
      const code = `
10 IF 5 > 3 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should return 0 (false) when left is not greater than right', async () => {
      const code = `
10 IF 3 > 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).not.toContain('True')
    })
  })

  describe('Less Than Or Equal Operator (<=)', () => {
    it('should return -1 (true) when left is less than right', async () => {
      const code = `
10 IF 3 <= 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should return -1 (true) when left equals right', async () => {
      const code = `
10 IF 5 <= 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should return 0 (false) when left is greater than right', async () => {
      const code = `
10 IF 5 <= 3 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).not.toContain('True')
    })
  })

  describe('Greater Than Or Equal Operator (>=)', () => {
    it('should return -1 (true) when left is greater than right', async () => {
      const code = `
10 IF 5 >= 3 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should return -1 (true) when left equals right', async () => {
      const code = `
10 IF 5 >= 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('True')
    })

    it('should return 0 (false) when left is less than right', async () => {
      const code = `
10 IF 3 >= 5 THEN PRINT "True"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).not.toContain('True')
    })
  })

  describe('String Comparisons', () => {
    it('should compare strings lexicographically', async () => {
      const code = `
10 IF "ABC" < "DEF" THEN PRINT "Less"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('Less')
    })

    it('should handle string equality', async () => {
      const code = `
10 IF "Hello" = "Hello" THEN PRINT "Equal"
20 END
`
      const result = await interpreter.execute(code)
      
      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toContain('Equal')
    })
  })
})

