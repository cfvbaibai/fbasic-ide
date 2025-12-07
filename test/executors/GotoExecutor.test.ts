/**
 * GOTO Executor Tests
 * 
 * Unit tests for the GotoExecutor class execution behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('GotoExecutor', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter: deviceAdapter
    })
  })

  it('should jump to specified line number', async () => {
    const source = `
10 PRINT "Start"
20 GOTO 50
30 PRINT "Skipped"
40 PRINT "Also skipped"
50 PRINT "Jumped here"
60 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // PRINT "Jumped here" doesn't end with semicolon, so adds newline
    expect(outputs).toEqual('Start\nJumped here\n')
  })

  it('should handle GOTO in a loop', async () => {
    const source = `
10 LET I = 0
20 I = I + 1
30 PRINT I
40 IF I < 3 THEN GOTO 20
50 PRINT "Done"
60 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // Numbers always get a space BEFORE them
    // PRINT "Done" doesn't end with semicolon, so adds newline
    expect(outputs).toEqual(' 1\n 2\n 3\nDone\n')
  })

  it('should handle GOTO to earlier line (backward jump)', async () => {
    const source = `
10 PRINT "Loop"
20 LET X = X + 1
30 IF X < 3 THEN GOTO 10
40 PRINT "End"
50 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // Should print "Loop" 3 times (X = 0, 1, 2), then "End"
    // PRINT "End" doesn't end with semicolon, so adds newline
    expect(outputs).toEqual('Loop\nLoop\nLoop\nEnd\n')
  })

  it('should handle GOTO to later line (forward jump)', async () => {
    const source = `
10 PRINT "Start"
20 GOTO 100
30 PRINT "Skipped 1"
40 PRINT "Skipped 2"
50 PRINT "Skipped 3"
100 PRINT "Target"
110 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // PRINT "Target" doesn't end with semicolon, so adds newline
    expect(outputs).toEqual('Start\nTarget\n')
  })

  it('should handle GOTO on same line as other statements', async () => {
    const source = `
10 PRINT "Before": GOTO 30: PRINT "Never"
20 PRINT "Also never"
30 PRINT "After"
40 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // PRINT "After" doesn't end with semicolon, so adds newline
    expect(outputs).toEqual('Before\nAfter\n')
  })

  it('should error on GOTO to non-existent line number', async () => {
    const source = `
10 PRINT "Start"
20 GOTO 999
30 PRINT "This should not print"
40 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    const errorMessages = result.errors.map(e => e.message).join(' ')
    expect(errorMessages).toEqual('GOTO: line number 999 not found')
    
    // Verify that PRINT statements after the error are not executed
    // getAllOutputs() includes error output formatted as "RUNTIME: {message}" to match IDE format
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual('Start\nRUNTIME: GOTO: line number 999 not found')
  })

  it('should handle multiple GOTO statements', async () => {
    const source = `
10 PRINT "A"
20 GOTO 40
30 PRINT "B"
40 PRINT "C"
50 GOTO 70
60 PRINT "D"
70 PRINT "E"
80 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // PRINT "E" doesn't end with semicolon, so adds newline
    expect(outputs).toEqual('A\nC\nE\n')
  })

  it('should handle GOTO with IF-THEN', async () => {
    const source = `
10 LET X = 5
20 IF X = 5 THEN GOTO 50
30 PRINT "False branch"
40 END
50 PRINT "True branch"
60 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const outputs = deviceAdapter.getAllOutputs()
    // PRINT "True branch" doesn't end with semicolon, so adds newline
    expect(outputs).toEqual('True branch\n')
  })
})

