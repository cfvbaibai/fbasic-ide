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
    expect(outputs).toContain('Start')
    expect(outputs).toContain('Jumped here')
    expect(outputs).not.toContain('Skipped')
    expect(outputs).not.toContain('Also skipped')
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
    expect(outputs).toContain('1')
    expect(outputs).toContain('2')
    expect(outputs).toContain('3')
    expect(outputs).toContain('Done')
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
    // Should print "Loop" 3 times (X = 0, 1, 2)
    const loopCount = (outputs.match(/Loop/g) || []).length
    expect(loopCount).toBe(3)
    expect(outputs).toContain('End')
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
    expect(outputs).toContain('Start')
    expect(outputs).toContain('Target')
    expect(outputs).not.toContain('Skipped')
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
    expect(outputs).toContain('Before')
    expect(outputs).toContain('After')
    expect(outputs).not.toContain('Never')
    expect(outputs).not.toContain('Also never')
  })

  it('should error on GOTO to non-existent line number', async () => {
    const source = `
10 PRINT "Start"
20 GOTO 999
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    const errorMessages = result.errors.map(e => e.message).join(' ')
    expect(errorMessages).toContain('line number 999 not found')
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
    expect(outputs).toContain('A')
    expect(outputs).toContain('C')
    expect(outputs).toContain('E')
    expect(outputs).not.toContain('B')
    expect(outputs).not.toContain('D')
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
    expect(outputs).toContain('True branch')
    expect(outputs).not.toContain('False branch')
  })
})

