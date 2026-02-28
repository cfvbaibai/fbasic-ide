/**
 * INKEY$ Function Tests
 *
 * Tests for keyboard input function: INKEY$
 *
 * IMPORTANT: INKEY$ Behavior
 * - Non-blocking mode (no argument or n≠0): Returns currently pressed character or empty string
 * - Blocking mode (n=0): NOT YET IMPLEMENTED - returns empty string
 *
 * According to Family BASIC spec:
 * - INKEY$: Returns single character string from keyboard, or empty string if no key pressed
 * - INKEY$(0): Blocking mode - waits for key press (NOT IMPLEMENTED)
 * - INKEY$(n): Non-blocking mode for n≠0 (same as INKEY$ without argument)
 *
 * GitHub Issue #4
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('INKEY$ Function', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      suppressOkPrompt: true,
      deviceAdapter,
    })
  })

  describe('Non-blocking mode (INKEY$)', () => {
    it('should return empty string when no key is pressed', async () => {
      // Default state is empty (no key pressed)
      const code = `
10 LET K$ = INKEY$
20 PRINT K$
30 PRINT LEN(K$)
40 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Empty string: PRINT outputs nothing, then length is 0
      expect(deviceAdapter.getAllOutputs()).toEqual('\n 0\n')
    })

    it('should return character when key is pressed', async () => {
      deviceAdapter.setInkeyStateForTest('A')
      const code = `
10 LET K$ = INKEY$
20 PRINT K$
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('A\n')
    })

    it('should return empty string after key is cleared', async () => {
      // Set key, then clear it
      deviceAdapter.setInkeyStateForTest('A')
      deviceAdapter.clearInkeyStateForTest()

      const code = `
10 LET K$ = INKEY$
20 PRINT LEN(K$)
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\n')
    })

    it('should return numeric character', async () => {
      deviceAdapter.setInkeyStateForTest('5')
      const code = `
10 LET K$ = INKEY$
20 PRINT K$
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('5\n')
    })

    it('should return space character', async () => {
      deviceAdapter.setInkeyStateForTest(' ')
      const code = `
10 LET K$ = INKEY$
20 PRINT LEN(K$)
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Space character should have length 1
      expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n')
    })
  })

  describe('Non-blocking mode with argument (INKEY$(n) where n≠0)', () => {
    it('should work with INKEY$(1) - non-blocking mode', async () => {
      deviceAdapter.setInkeyStateForTest('B')
      const code = `
10 LET K$ = INKEY$(1)
20 PRINT K$
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('B\n')
    })

    it('should work with INKEY$(2) - non-blocking mode', async () => {
      deviceAdapter.setInkeyStateForTest('C')
      const code = `
10 LET K$ = INKEY$(2)
20 PRINT K$
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('C\n')
    })

    it('should return empty string with INKEY$(1) when no key pressed', async () => {
      // No key pressed
      const code = `
10 LET K$ = INKEY$(1)
20 PRINT LEN(K$)
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\n')
    })
  })

  describe('Blocking mode (INKEY$(0))', () => {
    it('should return pressed key for INKEY$(0) when key is available', async () => {
      deviceAdapter.setInkeyStateForTest('X')
      const code = `
10 LET K$ = INKEY$(0)
20 PRINT K$
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Blocking mode returns the key that was pressed
      expect(deviceAdapter.getAllOutputs()).toEqual('X\n')
    })

    it('should work with ASC function in blocking mode', async () => {
      deviceAdapter.setInkeyStateForTest('A')
      const code = `
10 LET K$ = INKEY$(0)
20 LET C = ASC(K$)
30 PRINT C
40 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // ASC("A") = 65
      expect(deviceAdapter.getAllOutputs()).toEqual(' 65\n')
    })

    it('should use queued key for blocking mode', async () => {
      deviceAdapter.waitForInkeyQueue = ['Q']
      const code = `
10 LET K$ = INKEY$(0)
20 PRINT K$
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('Q\n')
    })

    it('should return empty string when no key available in blocking mode', async () => {
      // No key pressed, no queued keys
      const code = `
10 LET K$ = INKEY$(0)
20 PRINT LEN(K$)
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // No key available, returns empty string
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\n')
    })
  })

  describe('INKEY$ in expressions', () => {
    it('should work in IF statement comparison', async () => {
      deviceAdapter.setInkeyStateForTest('A')
      const code = `
10 IF INKEY$ = "A" THEN PRINT "A PRESSED"
20 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('A PRESSED\n')
    })

    it('should work with ASC function', async () => {
      deviceAdapter.setInkeyStateForTest('H')
      const code = `
10 LET K$ = INKEY$
20 LET C = ASC(K$)
30 PRINT C
40 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // ASC("H") = 72
      expect(deviceAdapter.getAllOutputs()).toEqual(' 72\n')
    })

    it('should work with ASC for empty string', async () => {
      // No key pressed
      const code = `
10 LET K$ = INKEY$
20 LET C = ASC(K$)
30 PRINT C
40 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // ASC("") = 0
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\n')
    })

    it('should work in string concatenation', async () => {
      deviceAdapter.setInkeyStateForTest('X')
      const code = `
10 LET K$ = INKEY$
20 LET R$ = "KEY: " + K$
30 PRINT R$
40 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('KEY: X\n')
    })
  })

  describe('INKEY$ polling pattern', () => {
    it('should handle polling loop pattern', async () => {
      // Set key after first read (simulating polling)
      const code = `
10 LET K$ = INKEY$
20 IF K$ = "" THEN 10
30 PRINT K$
40 END
`
      // Set key before execution so first read gets it
      deviceAdapter.setInkeyStateForTest('Q')

      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('Q\n')
    })

    it('should handle multiple INKEY$ reads (lasting state)', async () => {
      deviceAdapter.setInkeyStateForTest('Z')
      const code = `
10 LET K1$ = INKEY$
20 LET K2$ = INKEY$
30 LET K3$ = INKEY$
40 PRINT K1$; K2$; K3$
50 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // All reads should get the same character (lasting state)
      expect(deviceAdapter.getAllOutputs()).toEqual('ZZZ\n')
    })
  })

  describe('INKEY$ with special keys', () => {
    it('should handle Enter key (CR)', async () => {
      deviceAdapter.setInkeyStateForTest('\r')
      const code = `
10 LET K$ = INKEY$
20 LET C = ASC(K$)
30 PRINT C
40 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // ASC("\r") = 13
      expect(deviceAdapter.getAllOutputs()).toEqual(' 13\n')
    })

    it('should handle Escape key', async () => {
      deviceAdapter.setInkeyStateForTest('\x1B')
      const code = `
10 LET K$ = INKEY$
20 LET C = ASC(K$)
30 PRINT C
40 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // ASC(ESC) = 27
      expect(deviceAdapter.getAllOutputs()).toEqual(' 27\n')
    })
  })

  describe('Sample programs', () => {
    it('should handle simple input check pattern', async () => {
      deviceAdapter.setInkeyStateForTest('Y')
      const code = `
10 REM * SIMPLE INKEY$ CHECK *
20 LET K$ = INKEY$
30 IF K$ = "" THEN PRINT "NO KEY": END
40 PRINT "KEY: "; K$
50 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('KEY: Y\n')
    })

    it('should handle key code display pattern', async () => {
      deviceAdapter.setInkeyStateForTest('A')
      const code = `
10 REM * KEY CODE DISPLAY *
20 LET K$ = INKEY$
30 IF K$ = "" THEN PRINT "NO KEY": END
40 PRINT "CHAR: "; K$; " CODE: "; ASC(K$)
50 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // Numbers get leading space from PRINT
      expect(deviceAdapter.getAllOutputs()).toEqual('CHAR: A CODE:  65\n')
    })

    it('should handle quit key pattern', async () => {
      deviceAdapter.setInkeyStateForTest('Q')
      const code = `
10 REM * QUIT KEY CHECK *
20 LET K$ = INKEY$
30 IF K$ = "Q" THEN PRINT "QUIT": END
40 IF K$ = "q" THEN PRINT "QUIT": END
50 PRINT "CONTINUE"
60 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('QUIT\n')
    })
  })

  describe('Edge cases', () => {
    it('should handle INKEY$ without assignment', async () => {
      deviceAdapter.setInkeyStateForTest('T')
      const code = `
10 LET X = ASC(INKEY$)
20 PRINT X
30 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      // ASC("T") = 84
      expect(deviceAdapter.getAllOutputs()).toEqual(' 84\n')
    })

    it('should handle INKEY$ in nested expression', async () => {
      deviceAdapter.setInkeyStateForTest('A')
      const code = `
10 IF ASC(INKEY$) = 65 THEN PRINT "A KEY"
20 END
`
      const result = await interpreter.execute(code)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual('A KEY\n')
    })
  })
})
