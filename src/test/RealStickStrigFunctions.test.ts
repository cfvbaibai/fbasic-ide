/**
 * Real STICK and STRIG Function Tests with Device Adapter
 * 
 * Tests for Family BASIC v3 joystick functions with actual device adapter integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BasicInterpreter } from '../core/BasicInterpreter'
import type { DeviceAdapterInterface } from '../core/interfaces'

describe('Real STICK and STRIG Function Tests', () => {
  let interpreter: BasicInterpreter
  let mockDeviceAdapter: DeviceAdapterInterface

  beforeEach(() => {
    interpreter = new BasicInterpreter()
    
    // Create a mock device adapter
    mockDeviceAdapter = {
      getStickState: async (joystickId: number) => {
        // Return different values for different joysticks for testing
        const mockValues = [1, 2, 4, 8] // right, left, down, top
        return mockValues[joystickId] || 0
      },
      getTriggerState: async (joystickId: number) => {
        // Return different values for different joysticks for testing
        const mockValues = [1, 2, 4, 8] // start, select, B, A
        return mockValues[joystickId] || 0
      }
    }
    
    // Set the device adapter
    interpreter.updateConfig({ deviceAdapter: mockDeviceAdapter })
  })

  describe('Real Device Adapter Integration', () => {
    it('should call device adapter methods when updating joystick states', async () => {
      // Mock the device adapter methods
      const getStickStateSpy = vi.fn().mockResolvedValue(5)
      const getTriggerStateSpy = vi.fn().mockResolvedValue(3)
      
      mockDeviceAdapter.getStickState = getStickStateSpy
      mockDeviceAdapter.getTriggerState = getTriggerStateSpy
      
      // Update joystick states
      await interpreter.updateJoystickStates()
      
      // Verify that the device adapter methods were called
      expect(getStickStateSpy).toHaveBeenCalledTimes(4) // Called for joysticks 0-3
      expect(getTriggerStateSpy).toHaveBeenCalledTimes(4) // Called for joysticks 0-3
      
      // Verify the calls were made with correct joystick IDs
      expect(getStickStateSpy).toHaveBeenCalledWith(0)
      expect(getStickStateSpy).toHaveBeenCalledWith(1)
      expect(getStickStateSpy).toHaveBeenCalledWith(2)
      expect(getStickStateSpy).toHaveBeenCalledWith(3)
      
      expect(getTriggerStateSpy).toHaveBeenCalledWith(0)
      expect(getTriggerStateSpy).toHaveBeenCalledWith(1)
      expect(getTriggerStateSpy).toHaveBeenCalledWith(2)
      expect(getTriggerStateSpy).toHaveBeenCalledWith(3)
    })

    it('should return cached joystick states from STICK function', async () => {
      // Update joystick states first
      await interpreter.updateJoystickStates()
      
      // Test STICK function with different joystick IDs
      const code = `10 LET A = STICK(0)
20 LET B = STICK(1)
30 LET C = STICK(2)
40 LET D = STICK(3)
50 PRINT A; B; C; D
60 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Should return the mock values: 1, 2, 4, 8
      expect(result.output).toContain('1248')
    })

    it('should return cached trigger states from STRIG function', async () => {
      // Update joystick states first
      await interpreter.updateJoystickStates()
      
      // Test STRIG function with different joystick IDs
      const code = `10 LET A = STRIG(0)
20 LET B = STRIG(1)
30 LET C = STRIG(2)
40 LET D = STRIG(3)
50 PRINT A; B; C; D
60 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Should return the mock values: 1, 2, 4, 8
      expect(result.output).toContain('1248')
    })

    it('should handle device adapter errors gracefully', async () => {
      // Create a device adapter that throws errors
      const errorDeviceAdapter = {
        getStickState: async () => {
          throw new Error('Device error')
        },
        getTriggerState: async () => {
          throw new Error('Device error')
        }
      }
      
      interpreter.updateConfig({ deviceAdapter: errorDeviceAdapter })
      
      // Update joystick states should not throw
      await interpreter.updateJoystickStates()
      
      // STICK and STRIG should return 0 when device adapter fails
      const code = `10 PRINT STICK(0); STRIG(0)
20 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.output).toContain('00')
    })

    it('should handle invalid joystick IDs', async () => {
      // Update joystick states first
      await interpreter.updateJoystickStates()
      
      const code = `10 PRINT STICK(-1); STICK(5)
20 PRINT STRIG(-1); STRIG(5)
30 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Should return 0 for invalid joystick IDs
      expect(result.output).toContain('00')
      expect(result.output).toContain('00')
    })

    it('should work with combined STICK and STRIG in expressions', async () => {
      // Update joystick states first
      await interpreter.updateJoystickStates()
      
      const code = `10 LET A = STICK(0) + STRIG(0)
20 LET B = STICK(1) * STRIG(1)
30 PRINT A; B
40 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Should return 1+1=2 and 2*2=4
      expect(result.output).toContain('24')
    })

    it('should work in conditional statements', async () => {
      // Update joystick states first
      await interpreter.updateJoystickStates()
      
      const code = `10 IF STICK(0) > 0 THEN PRINT "Stick 0 active"
20 IF STRIG(0) > 0 THEN PRINT "Trigger 0 active"
30 IF STICK(1) > 0 THEN PRINT "Stick 1 active"
40 IF STRIG(1) > 0 THEN PRINT "Trigger 1 active"
50 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Should print all messages since mock values are > 0
      expect(result.output).toContain('Stick 0 active')
      expect(result.output).toContain('Trigger 0 active')
      expect(result.output).toContain('Stick 1 active')
      expect(result.output).toContain('Trigger 1 active')
    })

    it('should work in loops', async () => {
      // Update joystick states first
      await interpreter.updateJoystickStates()
      
      const code = `10 FOR I = 0 TO 3
20   PRINT "STICK("; I; ") = "; STICK(I)
30   PRINT "STRIG("; I; ") = "; STRIG(I)
40 NEXT I
50 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Should print all joystick states
      expect(result.output).toContain('STICK(0) = 1')
      expect(result.output).toContain('STICK(1) = 2')
      expect(result.output).toContain('STICK(2) = 4')
      expect(result.output).toContain('STICK(3) = 8')
      expect(result.output).toContain('STRIG(0) = 1')
      expect(result.output).toContain('STRIG(1) = 2')
      expect(result.output).toContain('STRIG(2) = 4')
      expect(result.output).toContain('STRIG(3) = 8')
    })
  })

  describe('Family BASIC v3 Real Implementation', () => {
    it('should implement Family BASIC v3 STICK specification correctly', async () => {
      // Create a device adapter that returns Family BASIC v3 bitmask values
      const familyBasicDeviceAdapter = {
        getStickState: async (joystickId: number) => {
          // Return combined bitmask values for testing
          const mockValues = [
            9,  // 1 (right) + 8 (top) = 9
            6,  // 2 (left) + 4 (down) = 6
            5,  // 1 (right) + 4 (down) = 5
            10  // 2 (left) + 8 (top) = 10
          ]
          return mockValues[joystickId] || 0
        },
        getTriggerState: async (joystickId: number) => {
          // Return combined bitmask values for testing
          const mockValues = [
            9,  // 1 (start) + 8 (A) = 9
            6,  // 2 (select) + 4 (B) = 6
            5,  // 1 (start) + 4 (B) = 5
            10  // 2 (select) + 8 (A) = 10
          ]
          return mockValues[joystickId] || 0
        }
      }
      
      interpreter.updateConfig({ deviceAdapter: familyBasicDeviceAdapter })
      await interpreter.updateJoystickStates()
      
      const code = `10 PRINT "Family BASIC v3 STICK values:"
20 FOR I = 0 TO 3
30   PRINT "STICK("; I; ") = "; STICK(I)
40 NEXT I
50 PRINT "Family BASIC v3 STRIG values:"
60 FOR I = 0 TO 3
70   PRINT "STRIG("; I; ") = "; STRIG(I)
80 NEXT I
90 END`

      const result = await interpreter.execute(code)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Should return the Family BASIC v3 bitmask values
      expect(result.output).toContain('STICK(0) = 9')
      expect(result.output).toContain('STICK(1) = 6')
      expect(result.output).toContain('STICK(2) = 5')
      expect(result.output).toContain('STICK(3) = 10')
      expect(result.output).toContain('STRIG(0) = 9')
      expect(result.output).toContain('STRIG(1) = 6')
      expect(result.output).toContain('STRIG(2) = 5')
      expect(result.output).toContain('STRIG(3) = 10')
    })
  })
})
