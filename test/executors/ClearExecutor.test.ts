/**
 * CLEAR Executor Tests
 *
 * Unit tests for the ClearExecutor: CLEAR clears all variables and arrays.
 * Optional address (e.g. CLEAR &H7600) is ignored in the emulator.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('ClearExecutor', () => {
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

  it('should clear all variables', async () => {
    const source = `
10 LET A = 10
20 LET B$ = "HELLO"
30 CLEAR
40 PRINT A, B$
50 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // After CLEAR, A and B$ are uninitialized: 0 and ""
    expect(outputs).toEqual(' 0\t\n')
  })

  it('should clear all arrays', async () => {
    const source = `
10 DIM X(5)
20 LET X(0) = 100
30 LET X(1) = 200
40 CLEAR
50 PRINT X(0), X(1)
60 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // After CLEAR, array is gone; getArrayElement returns 0 for missing
    expect(outputs).toEqual(' 0\t 0\n')
  })

  it('should accept CLEAR with optional address (ignored)', async () => {
    const source = `
10 LET N = 42
20 CLEAR 125
30 PRINT N
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual(' 0\n')
  })

  it('should handle CLEAR on same line as other commands', async () => {
    const source = `
10 LET X = 99
20 CLEAR: PRINT X
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual(' 0\n')
  })

  it('should allow variables to be set again after CLEAR', async () => {
    const source = `
10 LET A = 1
20 CLEAR
30 LET A = 2
40 PRINT A
50 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual(' 2\n')
  })

  it('should handle multiple CLEAR calls', async () => {
    const source = `
10 LET X = 10
20 CLEAR
30 LET X = 20
40 CLEAR
50 PRINT X
60 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual(' 0\n')
  })
})
