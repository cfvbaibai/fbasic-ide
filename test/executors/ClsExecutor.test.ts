/**
 * CLS Executor Tests
 * 
 * Unit tests for the ClsExecutor class execution behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('ClsExecutor', () => {
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

  it('should clear screen when CLS is executed', async () => {
    const source = `
10 PRINT "Hello"
20 CLS
30 PRINT "World"
40 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.clearScreenCalls).toBe(1)
  })

  it('should clear screen multiple times', async () => {
    const source = `
10 PRINT "First"
20 CLS
30 PRINT "Second"
40 CLS
50 PRINT "Third"
60 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.clearScreenCalls).toBe(2)
  })

  it('should handle CLS on same line as other commands', async () => {
    const source = `
10 PRINT "Before": CLS: PRINT "After"
20 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.clearScreenCalls).toBe(1)
    const outputs = deviceAdapter.getAllOutputs()
    // CLS clears the screen, so "Before" should be cleared
    // Only "After" should remain
    expect(outputs).toEqual('After\n')
  })

  it('should handle CLS at start of program', async () => {
    const source = `
10 CLS
20 PRINT "Hello"
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.clearScreenCalls).toBe(1)
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual('Hello\n')
  })

  it('should handle CLS at end of program', async () => {
    const source = `
10 PRINT "Hello"
20 PRINT "World"
30 CLS
40 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.clearScreenCalls).toBe(1)
  })

  it('should handle CLS in a loop', async () => {
    const source = `
10 FOR I = 1 TO 3
20 PRINT I
30 CLS
40 NEXT
50 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.clearScreenCalls).toBe(3)
  })

  it('should handle CLS with conditional execution', async () => {
    const source = `
10 LET X = 1
20 IF X = 1 THEN CLS
30 PRINT "Done"
40 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.clearScreenCalls).toBe(1)
    const outputs = deviceAdapter.getAllOutputs()
    expect(outputs).toEqual('Done\n')
  })
})
