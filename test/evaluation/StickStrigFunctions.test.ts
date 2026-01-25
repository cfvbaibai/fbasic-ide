/**
 * STICK and STRIG Functions Tests
 *
 * Tests for controller input functions: STICK and STRIG
 * According to Family BASIC spec:
 * - STICK(x): Returns D-pad input value (0=nothing, 1=RIGHT, 2=LEFT, 4=DOWN, 8=UP)
 * - STRIG(x): Returns trigger button input value (0=nothing, or button value when pressed)
 *   - Controller I: START (1), SELECT (2), B (4), A (8)
 *   - Controller II: B (4), A (8)
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('STICK and STRIG Functions', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter,
    })
  })

  describe('STICK Function', () => {
    it('should return 0 when nothing is pressed', async () => {
      deviceAdapter.setStickState(0, 0)
      const code = `
10 LET S = STICK(0)
20 PRINT S
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\n')
    })

    it('should return 1 for RIGHT direction', async () => {
      deviceAdapter.setStickState(0, 1)
      const code = `
10 LET S = STICK(0)
20 PRINT S
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n')
    })

    it('should return 2 for LEFT direction', async () => {
      deviceAdapter.setStickState(0, 2)
      const code = `
10 LET S = STICK(0)
20 PRINT S
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 2\n')
    })

    it('should return 4 for DOWN direction', async () => {
      deviceAdapter.setStickState(0, 4)
      const code = `
10 LET S = STICK(0)
20 PRINT S
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 4\n')
    })

    it('should return 8 for UP direction', async () => {
      deviceAdapter.setStickState(0, 8)
      const code = `
10 LET S = STICK(0)
20 PRINT S
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 8\n')
    })

    it('should work with controller II (joystickId = 1)', async () => {
      deviceAdapter.setStickState(1, 1)
      const code = `
10 LET S = STICK(1)
20 PRINT S
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n')
    })

    it('should error for invalid joystickId', async () => {
      const code = `
10 LET S = STICK(2)
20 PRINT S
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should work in IF-THEN condition', async () => {
      deviceAdapter.setStickState(0, 1)
      const code = `
10 IF STICK(0) = 1 THEN PRINT "RIGHT"
20 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('RIGHT\n')
    })
  })

  describe('STRIG Function', () => {
    it('should return 0 when nothing is pressed', async () => {
      // No button pressed - buffer is empty
      const code = `
10 LET T = STRIG(0)
20 PRINT T
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\n')
    })

    it('should return 1 for START button (Controller I)', async () => {
      deviceAdapter.pushStrigState(0, 1)
      const code = `
10 LET T = STRIG(0)
20 PRINT T
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n')
    })

    it('should return 2 for SELECT button (Controller I)', async () => {
      deviceAdapter.pushStrigState(0, 2)
      const code = `
10 LET T = STRIG(0)
20 PRINT T
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 2\n')
    })

    it('should return 4 for B button', async () => {
      deviceAdapter.pushStrigState(0, 4)
      const code = `
10 LET T = STRIG(0)
20 PRINT T
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 4\n')
    })

    it('should return 8 for A button', async () => {
      deviceAdapter.pushStrigState(0, 8)
      const code = `
10 LET T = STRIG(0)
20 PRINT T
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 8\n')
    })

    it('should work with controller II (joystickId = 1)', async () => {
      deviceAdapter.pushStrigState(1, 4)
      const code = `
10 LET T = STRIG(1)
20 PRINT T
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Numbers get leading space
      expect(deviceAdapter.getAllOutputs()).toEqual(' 4\n')
    })

    it('should consume button state (only returns value once)', async () => {
      deviceAdapter.pushStrigState(0, 1)
      const code = `
10 LET T1 = STRIG(0)
20 LET T2 = STRIG(0)
30 PRINT T1; T2
40 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // First call should return 1, second call should return 0 (consumed)
      // PRINT with semicolon keeps values on same line, numbers get leading space
      // But PRINT doesn't end with semicolon (last item is T2, not a semicolon), so adds newline
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1 0\n')
    })

    it('should error for invalid joystickId', async () => {
      const code = `
10 LET T = STRIG(2)
20 PRINT T
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should work in IF-THEN condition', async () => {
      deviceAdapter.pushStrigState(0, 8)
      const code = `
10 IF STRIG(0) = 8 THEN PRINT "A BUTTON"
20 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('A BUTTON\n')
    })
  })

  describe('Sample Programs from Spec', () => {
    it('should handle STICK sample program', async () => {
      deviceAdapter.setStickState(0, 1) // RIGHT
      const code = `
10 REM * STICK *
20 S = STICK(0)
30 IF S = 0 THEN PRINT "NOT PRESSED"
40 IF S = 1 THEN PRINT "RIGHT"
50 IF S = 2 THEN PRINT "LEFT"
60 IF S = 4 THEN PRINT "DOWN"
70 IF S = 8 THEN PRINT "UP"
80 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('RIGHT\n')
    })

    it('should handle STRIG sample program', async () => {
      deviceAdapter.pushStrigState(0, 8) // A button
      const code = `
10 REM * STRIG *
20 T = STRIG(0)
30 IF T = 1 THEN PRINT "START"
40 IF T = 2 THEN PRINT "SELECT"
50 IF T = 4 THEN PRINT "B"
60 IF T = 8 THEN PRINT "A"
70 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('A\n')
    })
  })
})
