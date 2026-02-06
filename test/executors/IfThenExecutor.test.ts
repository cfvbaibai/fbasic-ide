/**
 * IF-THEN Executor Tests
 *
 * Unit tests for the IfThenExecutor class execution behavior.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('IfThenExecutor', () => {
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
      deviceAdapter: deviceAdapter,
    })
  })

  it('should execute THEN clause when condition is true', async () => {
    const source = `
10 LET X = 5
20 IF X = 5 THEN PRINT "Equal"
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toEqual('Equal\n')
  })

  it('should not execute THEN clause when condition is false', async () => {
    const source = `
10 LET X = 5
20 IF X = 10 THEN PRINT "Equal"
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    // No PRINT executed, but END still prints "OK"
    expect(deviceAdapter.getAllOutputs()).toEqual('')
  })

  it('should execute THEN clause with LET statement', async () => {
    const source = `
10 LET X = 5
20 IF X = 5 THEN Y = 10
30 PRINT Y
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toEqual(' 10\n')
  })

  it('should handle greater than comparison', async () => {
    const source = `
10 LET X = 10
20 IF X > 5 THEN PRINT "Greater"
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toEqual('Greater\n')
  })

  it('should handle less than comparison', async () => {
    const source = `
10 LET X = 3
20 IF X < 5 THEN PRINT "Less"
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toEqual('Less\n')
  })

  it('should handle not equal comparison', async () => {
    const source = `
10 LET X = 5
20 IF X <> 10 THEN PRINT "Not Equal"
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toEqual('Not Equal\n')
  })

  it('should handle single expression condition (non-zero = true)', async () => {
    const source = `
10 LET X = 5
20 IF X THEN PRINT "True"
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toEqual('True\n')
  })

  it('should handle single expression condition (zero = false)', async () => {
    const source = `
10 LET X = 0
20 IF X THEN PRINT "True"
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toEqual('')
  })

  it('should handle string comparison', async () => {
    const source = `
10 LET A$ = "Hello"
20 IF A$ = "Hello" THEN PRINT "Match"
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toEqual('Match\n')
  })

  it('should handle nested IF-THEN', async () => {
    const source = `
10 LET X = 5
20 LET Y = 10
30 IF X = 5 THEN IF Y = 10 THEN PRINT "Both"
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toEqual('Both\n')
  })

  it('should handle IF-THEN with FOR loop in THEN clause', async () => {
    const source = `
10 LET X = 5
20 IF X = 5 THEN FOR I = 1 TO 3: PRINT I: NEXT
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    // Colon is just statement separator - PRINT I doesn't end with semicolon, so each adds newline
    // Last PRINT I doesn't end with semicolon, so adds newline
    expect(deviceAdapter.getAllOutputs()).toEqual(' 1\n 2\n 3\n')
  })

  it('should handle IF-THEN with line number jump', async () => {
    const source = `
10 LET X = 5
20 IF X = 5 THEN 50
30 PRINT "Skipped"
40 END
50 PRINT "Jumped here"
60 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual('Jumped here\n')
  })

  it('should handle IF-THEN with line number when condition is false', async () => {
    const source = `
10 LET X = 5
20 IF X = 10 THEN 50
30 PRINT "Not jumped"
40 END
50 PRINT "Jumped here"
60 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual('Not jumped\n')
  })

  it('should handle IF-GOTO with line number jump', async () => {
    const source = `
10 LET X = 5
20 IF X = 5 GOTO 50
30 PRINT "Skipped"
40 END
50 PRINT "Jumped here"
60 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual('Jumped here\n')
  })

  it('should handle IF-GOTO with line number when condition is false', async () => {
    const source = `
10 LET X = 5
20 IF X = 10 GOTO 50
30 PRINT "Not jumped"
40 END
50 PRINT "Jumped here"
60 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual('Not jumped\n')
  })

  it('should handle IF-THEN line number with backward jump', async () => {
    const source = `
10 LET I = 0
20 I = I + 1
30 PRINT I
40 IF I < 3 THEN 20
50 PRINT "Done"
60 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // PRINT I doesn't end with semicolon, so each adds newline
    // PRINT "Done" doesn't end with semicolon, so adds newline
    expect(outputs).toEqual(' 1\n 2\n 3\nDone\n')
  })

  it('should error on IF-THEN with non-existent line number', async () => {
    const source = `
10 LET X = 5
20 IF X = 5 THEN 999
30 PRINT "This should not print"
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    const errorMessages = result.errors.map(e => e.message).join(' ')
    expect(errorMessages).toEqual('IF-THEN: line number 999 not found')

    // Verify that PRINT statements after the error are not executed
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual('RUNTIME: IF-THEN: line number 999 not found')
  })

  it('should handle IF-THEN line number on same line as other statements', async () => {
    const source = `
10 LET X = 5
20 PRINT "Before": IF X = 5 THEN 50: PRINT "Never"
30 PRINT "Also never"
40 END
50 PRINT "After"
60 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // Colon is just statement separator - PRINT "Before" doesn't end with semicolon, so adds newline
    // PRINT "After" doesn't end with semicolon, so adds newline
    expect(outputs).toEqual('Before\nAfter\n')
  })

  it('should handle IF-THEN with FOR loop in THEN clause', async () => {
    const source = `
10 IF X=0 THEN PRINT "X is 0":FOR I=1 TO 3:IF I=1 THEN PRINT I:NEXT
20 PRINT "Done"
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // Colon is just statement separator - PRINT statements without semicolons add newlines
    // PRINT "Done" doesn't end with semicolon, so adds newline
    expect(outputs).toEqual('X is 0\n 1\nDone\n')
  })

  describe('IF-THEN with Multiple Statements in THEN', () => {
    it('should execute multiple statements in THEN clause when condition is true', async () => {
      // From manual page 64 example: IF A$<>"Y" THEN BEEP:GOTO 30
      const source = `
10 LET X = 5
20 IF X = 5 THEN PRINT "First": PRINT "Second"
30 PRINT "After"
40 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // When condition is true: executes THEN statements, then continues to next line
      // Colon is just statement separator - it does NOT affect newlines
      // Only semicolon suppresses newlines. Each PRINT without semicolon adds a newline.
      // PRINT "After" doesn't end with semicolon, so adds newline
      expect(outputs).toEqual('First\nSecond\nAfter\n')
    })

    it('should skip multiple statements in THEN clause when condition is false', async () => {
      const source = `
10 LET X = 5
20 IF X = 10 THEN PRINT "First": PRINT "Second"
30 PRINT "After"
40 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // When condition is false: bypasses THEN, goes directly to next line
      expect(outputs).toEqual('After\n')
    })
  })

  describe('IF-THEN with Logical Operators', () => {
    it('should handle IF-THEN with AND operator', async () => {
      // From manual page 52: IF X>0 AND X<10 THEN 1000
      const source = `
10 LET X = 5
20 IF X > 0 AND X < 10 THEN PRINT "Between"
30 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('Between\n')
    })

    it('should handle IF-THEN with AND operator (false case)', async () => {
      const source = `
10 LET X = 15
20 IF X > 0 AND X < 10 THEN PRINT "Between"
30 PRINT "After"
40 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('After\n')
    })

    it('should handle IF-THEN with OR operator', async () => {
      // From manual page 52: IF X<0 OR X>10 THEN 1000
      const source = `
10 LET X = 15
20 IF X < 0 OR X > 10 THEN PRINT "Outside"
30 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('Outside\n')
    })

    it('should handle IF-THEN with OR operator (false case)', async () => {
      const source = `
10 LET X = 5
20 IF X < 0 OR X > 10 THEN PRINT "Outside"
30 PRINT "After"
40 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('After\n')
    })

    it('should handle IF-THEN with complex AND/OR expression', async () => {
      const source = `
10 LET X = 5
20 IF X > 0 AND X < 10 OR X = 20 THEN PRINT "Valid"
30 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('Valid\n')
    })
  })

  describe('IF-THEN Program Flow', () => {
    it('should continue to next line after executing THEN when condition is true', async () => {
      // Manual: "If the logical equation is established (YES), it executes the command sentence
      // after THEN, then continues to the following line written after the IF sentence."
      const source = `
10 LET X = 5
20 IF X = 5 THEN PRINT "Then"
30 PRINT "Next"
40 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // Should execute THEN, then continue to next line
      // PRINT "Then" doesn't end with semicolon, so adds newline
      // PRINT "Next" doesn't end with semicolon, so adds newline
      expect(outputs).toEqual('Then\nNext\n')
    })

    it('should go directly to next line when condition is false', async () => {
      // Manual: "If the logical equation is not established (NO), it bypasses the command sentence
      // after THEN and directly executes the following line written after the IF sentence."
      const source = `
10 LET X = 5
20 IF X = 10 THEN PRINT "Then"
30 PRINT "Next"
40 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      // Should bypass THEN, go directly to next line
      expect(outputs).toEqual('Next\n')
    })
  })

  describe('IF-THEN with Comparison Operators', () => {
    it('should handle greater than or equal comparison', async () => {
      const source = `
10 LET X = 10
20 IF X >= 10 THEN PRINT "Greater or Equal"
30 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('Greater or Equal\n')
    })

    it('should handle less than or equal comparison', async () => {
      const source = `
10 LET X = 10
20 IF X <= 10 THEN PRINT "Less or Equal"
30 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('Less or Equal\n')
    })

    it('should handle string not equal comparison', async () => {
      // From manual example: IF A$<>"Y" THEN BEEP:GOTO 30
      const source = `
10 LET A$ = "N"
20 IF A$ <> "Y" THEN PRINT "Not Y"
30 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      const outputs = deviceAdapter.getAllOutputs()
      expect(outputs).toEqual('Not Y\n')
    })
  })
})
