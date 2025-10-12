/**
 * STICK and STRIG Function Tests
 * 
 * Tests for Family BASIC v3 joystick functions
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '../core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices'

describe('STICK and STRIG Function Tests', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({ deviceAdapter })
  })

  describe('STICK Function', () => {
    it('should parse STICK function correctly', async () => {
      const code = `10 LET A = STICK(0)
20 PRINT A
30 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle STICK with different joystick IDs', async () => {
      const code = `10 LET A = STICK(0)
20 LET B = STICK(1)
30 LET C = STICK(2)
40 LET D = STICK(3)
50 PRINT A; B; C; D
60 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle STICK in expressions', async () => {
      const code = `10 LET A = STICK(0) + 1
20 LET B = STICK(1) * 2
30 PRINT A; B
40 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle STICK in PRINT statements', async () => {
      const code = `10 PRINT "STICK(0) = "; STICK(0)
20 PRINT "STICK(1) = "; STICK(1)
30 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.printOutputs).toEqual(['STICK(0) = 0', 'STICK(1) = 0'])
    })

    it('should handle STICK with variables', async () => {
      const code = `10 LET J = 0
20 LET A = STICK(J)
30 PRINT A
40 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle STICK with expressions as argument', async () => {
      const code = `10 LET J = 1 + 1
20 LET A = STICK(J)
30 PRINT A
40 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('STRIG Function', () => {
    it('should parse STRIG function correctly', async () => {
      const code = `10 LET A = STRIG(0)
20 PRINT A
30 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle STRIG with different joystick IDs', async () => {
      const code = `10 LET A = STRIG(0)
20 LET B = STRIG(1)
30 LET C = STRIG(2)
40 LET D = STRIG(3)
50 PRINT A; B; C; D
60 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle STRIG in expressions', async () => {
      const code = `10 LET A = STRIG(0) + 1
20 LET B = STRIG(1) * 2
30 PRINT A; B
40 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle STRIG in PRINT statements', async () => {
      const code = `10 PRINT "STRIG(0) = "; STRIG(0)
20 PRINT "STRIG(1) = "; STRIG(1)
30 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.printOutputs).toEqual(['STRIG(0) = 0', 'STRIG(1) = 0'])
    })

    it('should handle STRIG with variables', async () => {
      const code = `10 LET J = 0
20 LET A = STRIG(J)
30 PRINT A
40 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle STRIG with expressions as argument', async () => {
      const code = `10 LET J = 1 + 1
20 LET A = STRIG(J)
30 PRINT A
40 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Combined STICK and STRIG Usage', () => {
    it('should handle both STICK and STRIG in the same program', async () => {
      const code = `10 LET S = STICK(0)
20 LET T = STRIG(0)
30 PRINT "STICK(0) = "; S
40 PRINT "STRIG(0) = "; T
50 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.printOutputs).toEqual(['STICK(0) = 0', 'STRIG(0) = 0'])
    })

    it('should handle STICK and STRIG in conditional statements', async () => {
      const code = `10 IF STICK(0) > 0 THEN PRINT "Stick moved"
20 IF STRIG(0) > 0 THEN PRINT "Button pressed"
30 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle STICK and STRIG in loops', async () => {
      const code = `10 FOR I = 0 TO 3
20   PRINT "STICK("; I; ") = "; STICK(I)
30   PRINT "STRIG("; I; ") = "; STRIG(I)
40 NEXT I
50 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.printOutputs).toEqual([
        'STICK(0) = 0', 'STRIG(0) = 0', 'STICK(1) = 0', 'STRIG(1) = 0', 'STICK(2) = 0', 'STRIG(2) = 0', 'STICK(3) = 0', 'STRIG(3) = 0'])
    })
  })

  describe('Error Handling', () => {
    it('should handle STICK without device adapter gracefully', async () => {
      const code = `10 LET A = STICK(0)
20 PRINT A
30 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Should return 0 when no device adapter is available
      expect(deviceAdapter.printOutputs).toEqual(['0'])
    })

    it('should handle STRIG without device adapter gracefully', async () => {
      const code = `10 LET A = STRIG(0)
20 PRINT A
30 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Should return 0 when no device adapter is available
      expect(deviceAdapter.printOutputs).toEqual(['0'])
    })

    it('should handle invalid joystick IDs', async () => {
      const code = `10 LET A = STICK(5)
20 LET B = STRIG(-1)
30 PRINT A; B
40 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.printOutputs).toEqual(['00'])
    })
  })

  describe('Family BASIC v3 Compatibility', () => {
    it('should support Family BASIC v3 STICK syntax', async () => {
      const code = `10 REM Family BASIC v3 STICK Demo
20 PRINT "STICK(0) = "; STICK(0)
30 PRINT "STICK(1) = "; STICK(1)
40 PRINT "STICK(2) = "; STICK(2)
50 PRINT "STICK(3) = "; STICK(3)
60 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should support Family BASIC v3 STRIG syntax', async () => {
      const code = `10 REM Family BASIC v3 STRIG Demo
20 PRINT "STRIG(0) = "; STRIG(0)
30 PRINT "STRIG(1) = "; STRIG(1)
40 PRINT "STRIG(2) = "; STRIG(2)
50 PRINT "STRIG(3) = "; STRIG(3)
60 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle Family BASIC v3 joystick demo program', async () => {
      const code = `10 REM Family BASIC v3 Joystick Demo
20 PRINT "Move stick and press buttons!"
30 PRINT "STICK(0) = "; STICK(0)
40 PRINT "STRIG(0) = "; STRIG(0)
50 PRINT "STICK(1) = "; STICK(1)
60 PRINT "STRIG(1) = "; STRIG(1)
70 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.printOutputs).toEqual(['Move stick and press buttons!', 'STICK(0) = 0', 'STRIG(0) = 0', 'STICK(1) = 0', 'STRIG(1) = 0'])
    })
  })
})
