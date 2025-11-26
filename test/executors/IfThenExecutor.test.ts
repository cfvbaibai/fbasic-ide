/**
 * IF-THEN Executor Tests
 * 
 * Unit tests for the IfThenExecutor class execution behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest'
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
      deviceAdapter: deviceAdapter
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
    expect(deviceAdapter.getAllOutputs()).toContain('Equal')
  })

  it('should not execute THEN clause when condition is false', async () => {
    const source = `
10 LET X = 5
20 IF X = 10 THEN PRINT "Equal"
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).not.toContain('Equal')
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
    expect(deviceAdapter.getAllOutputs()).toContain('10')
  })

  it('should handle greater than comparison', async () => {
    const source = `
10 LET X = 10
20 IF X > 5 THEN PRINT "Greater"
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toContain('Greater')
  })

  it('should handle less than comparison', async () => {
    const source = `
10 LET X = 3
20 IF X < 5 THEN PRINT "Less"
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toContain('Less')
  })

  it('should handle not equal comparison', async () => {
    const source = `
10 LET X = 5
20 IF X <> 10 THEN PRINT "Not Equal"
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toContain('Not Equal')
  })

  it('should handle single expression condition (non-zero = true)', async () => {
    const source = `
10 LET X = 5
20 IF X THEN PRINT "True"
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toContain('True')
  })

  it('should handle single expression condition (zero = false)', async () => {
    const source = `
10 LET X = 0
20 IF X THEN PRINT "True"
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).not.toContain('True')
  })

  it('should handle string comparison', async () => {
    const source = `
10 LET A$ = "Hello"
20 IF A$ = "Hello" THEN PRINT "Match"
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toContain('Match')
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
    expect(deviceAdapter.getAllOutputs()).toContain('Both')
  })

  it('should handle IF-THEN with FOR loop in THEN clause', async () => {
    const source = `
10 LET X = 5
20 IF X = 5 THEN FOR I = 1 TO 3: PRINT I: NEXT
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(deviceAdapter.getAllOutputs()).toContain('1')
    expect(deviceAdapter.getAllOutputs()).toContain('2')
    expect(deviceAdapter.getAllOutputs()).toContain('3')
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
    expect(outputs).toContain('Jumped here')
    expect(outputs).not.toContain('Skipped')
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
    expect(outputs).toContain('Not jumped')
    expect(outputs).not.toContain('Jumped here')
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
    expect(outputs).toContain('Jumped here')
    expect(outputs).not.toContain('Skipped')
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
    expect(outputs).toContain('Not jumped')
    expect(outputs).not.toContain('Jumped here')
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
    expect(outputs).toContain('1')
    expect(outputs).toContain('2')
    expect(outputs).toContain('3')
    expect(outputs).toContain('Done')
  })

  it('should error on IF-THEN with non-existent line number', async () => {
    const source = `
10 LET X = 5
20 IF X = 5 THEN 999
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    const errorMessages = result.errors.map(e => e.message).join(' ')
    expect(errorMessages).toContain('line number 999 not found')
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
    expect(outputs).toContain('Before')
    expect(outputs).toContain('After')
    expect(outputs).not.toContain('Never')
    expect(outputs).not.toContain('Also never')
  })
})

