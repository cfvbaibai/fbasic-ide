/**
 * LOCATE and PRINT Integration Tests
 * 
 * Tests that verify LOCATE and PRINT work together correctly in actual BASIC programs.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { WebWorkerDeviceAdapter } from '@/core/devices/WebWorkerDeviceAdapter'
import type { AnyServiceWorkerMessage } from '@/core/interfaces'

type ScreenBuffer = { character: string; x: number; y: number }[][]

// Mock self.postMessage to capture screen updates
let capturedMessages: AnyServiceWorkerMessage[] = []
const originalPostMessage = (globalThis as typeof globalThis & { postMessage?: typeof self.postMessage }).postMessage

beforeEach(() => {
  capturedMessages = []
  // Mock self.postMessage for testing
  if (typeof self !== 'undefined') {
    (self as typeof self & { postMessage: (message: AnyServiceWorkerMessage) => void }).postMessage = (message: AnyServiceWorkerMessage) => {
      capturedMessages.push(message)
    }
  }
})

afterEach(() => {
  // Restore original
  if (typeof self !== 'undefined' && originalPostMessage) {
    (self as typeof self & { postMessage: typeof originalPostMessage }).postMessage = originalPostMessage
  }
})

describe('LOCATE and PRINT Integration', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: WebWorkerDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new WebWorkerDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter: deviceAdapter
    })
    capturedMessages = []
  })

  it('should display text at LOCATE position', async () => {
    const source = `
10 LOCATE 10, 10
20 PRINT "I LOVE YOU"
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    
    // Find the last screen update message
    const screenMessages = capturedMessages.filter(
      (msg) => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    
    expect(screenMessages.length).toBeGreaterThan(0)
    const lastScreenMessage = screenMessages[screenMessages.length - 1]
    const screenBuffer = lastScreenMessage && 'data' in lastScreenMessage && 'screenBuffer' in lastScreenMessage.data
      ? (lastScreenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
      : undefined
    
    // Text should be at position (10, 10)
    expect(screenBuffer?.[10]).toBeDefined()
    expect(screenBuffer?.[10]?.[10]?.character).toBe('I')
    expect(screenBuffer?.[10]?.[11]?.character).toBe(' ')
    expect(screenBuffer?.[10]?.[12]?.character).toBe('L')
    expect(screenBuffer?.[10]?.[13]?.character).toBe('O')
    expect(screenBuffer?.[10]?.[14]?.character).toBe('V')
    expect(screenBuffer?.[10]?.[15]?.character).toBe('E')
    expect(screenBuffer?.[10]?.[16]?.character).toBe(' ')
    expect(screenBuffer?.[10]?.[17]?.character).toBe('Y')
    expect(screenBuffer?.[10]?.[18]?.character).toBe('O')
    expect(screenBuffer?.[10]?.[19]?.character).toBe('U')
  })

  it('should display text at different LOCATE positions', async () => {
    const source = `
10 LOCATE 5, 5
20 PRINT "FIRST"
30 LOCATE 15, 10
40 PRINT "SECOND"
50 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    
    const screenMessages = capturedMessages.filter(
      (msg) => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const lastScreenMessage = screenMessages[screenMessages.length - 1]
    const screenBuffer = lastScreenMessage && 'data' in lastScreenMessage && 'screenBuffer' in lastScreenMessage.data
      ? (lastScreenMessage.data as { screenBuffer: Array<Array<{ character: string; x: number; y: number }>> }).screenBuffer
      : undefined
    
    // First text at (5, 5)
    expect(screenBuffer?.[5]?.[5]?.character).toBe('F')
    expect(screenBuffer?.[5]?.[6]?.character).toBe('I')
    expect(screenBuffer?.[5]?.[7]?.character).toBe('R')
    expect(screenBuffer?.[5]?.[8]?.character).toBe('S')
    expect(screenBuffer?.[5]?.[9]?.character).toBe('T')
    
    // Second text at (15, 10)
    expect(screenBuffer?.[10]?.[15]?.character).toBe('S')
    expect(screenBuffer?.[10]?.[16]?.character).toBe('E')
    expect(screenBuffer?.[10]?.[17]?.character).toBe('C')
    expect(screenBuffer?.[10]?.[18]?.character).toBe('O')
    expect(screenBuffer?.[10]?.[19]?.character).toBe('N')
    expect(screenBuffer?.[10]?.[20]?.character).toBe('D')
  })

  it('should continue printing from cursor position after LOCATE', async () => {
    const source = `
10 LOCATE 10, 5
20 PRINT "HELLO"
30 PRINT "WORLD"
40 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    
    const screenMessages = capturedMessages.filter(
      (msg) => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const lastScreenMessage = screenMessages[screenMessages.length - 1]
    const screenBuffer = lastScreenMessage && 'data' in lastScreenMessage && 'screenBuffer' in lastScreenMessage.data
      ? (lastScreenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
      : undefined
    
    // First PRINT at (10, 5)
    expect(screenBuffer?.[5]?.[10]?.character).toBe('H')
    expect(screenBuffer?.[5]?.[11]?.character).toBe('E')
    expect(screenBuffer?.[5]?.[12]?.character).toBe('L')
    expect(screenBuffer?.[5]?.[13]?.character).toBe('L')
    expect(screenBuffer?.[5]?.[14]?.character).toBe('O')
    
    // Second PRINT should continue on next line (after newline from first PRINT)
    expect(screenBuffer?.[6]?.[0]?.character).toBe('W')
    expect(screenBuffer?.[6]?.[1]?.character).toBe('O')
    expect(screenBuffer?.[6]?.[2]?.character).toBe('R')
    expect(screenBuffer?.[6]?.[3]?.character).toBe('L')
    expect(screenBuffer?.[6]?.[4]?.character).toBe('D')
  })

  it('should handle LOCATE with expressions', async () => {
    const source = `
10 LET X = 10
20 LET Y = 5
30 LOCATE X, Y
40 PRINT "TEST"
50 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    
    const screenMessages = capturedMessages.filter(
      (msg) => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const lastScreenMessage = screenMessages[screenMessages.length - 1]
    const screenBuffer = lastScreenMessage && 'data' in lastScreenMessage && 'screenBuffer' in lastScreenMessage.data
      ? (lastScreenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
      : undefined
    
    // Text should be at (10, 5)
    expect(screenBuffer?.[5]?.[10]?.character).toBe('T')
    expect(screenBuffer?.[5]?.[11]?.character).toBe('E')
    expect(screenBuffer?.[5]?.[12]?.character).toBe('S')
    expect(screenBuffer?.[5]?.[13]?.character).toBe('T')
  })

  it('should handle LOCATE and PRINT on same line', async () => {
    const source = `
10 LOCATE 10, 10: PRINT "SAME LINE"
20 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    
    const screenMessages = capturedMessages.filter(
      (msg) => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const lastScreenMessage = screenMessages[screenMessages.length - 1]
    const screenBuffer = lastScreenMessage && 'data' in lastScreenMessage && 'screenBuffer' in lastScreenMessage.data
      ? (lastScreenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
      : undefined
    
    // Text should be at (10, 10)
    expect(screenBuffer?.[10]?.[10]?.character).toBe('S')
    expect(screenBuffer?.[10]?.[11]?.character).toBe('A')
    expect(screenBuffer?.[10]?.[12]?.character).toBe('M')
    expect(screenBuffer?.[10]?.[13]?.character).toBe('E')
  })

  it('should handle CLS then LOCATE and PRINT', async () => {
    const source = `
10 PRINT "BEFORE"
20 CLS
30 LOCATE 10, 10
40 PRINT "AFTER"
50 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    
    const screenMessages = capturedMessages.filter(
      (msg) => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const lastScreenMessage = screenMessages[screenMessages.length - 1]
    const screenBuffer = lastScreenMessage && 'data' in lastScreenMessage && 'screenBuffer' in lastScreenMessage.data
      ? (lastScreenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
      : undefined
    
    // "BEFORE" should be cleared, only "AFTER" should be visible at (10, 10)
    // Check that "BEFORE" is not in the buffer (should be cleared)
    const beforeFound = screenBuffer?.some((row, y) => 
      row?.some((cell, x) => cell?.character === 'B' && 
        screenBuffer?.[y]?.[x + 1]?.character === 'E' &&
        screenBuffer?.[y]?.[x + 2]?.character === 'F'
      )
    )
    expect(beforeFound).toBe(false)
    
    // "AFTER" should be at (10, 10)
    expect(screenBuffer?.[10]?.[10]?.character).toBe('A')
    expect(screenBuffer?.[10]?.[11]?.character).toBe('F')
    expect(screenBuffer?.[10]?.[12]?.character).toBe('T')
    expect(screenBuffer?.[10]?.[13]?.character).toBe('E')
    expect(screenBuffer?.[10]?.[14]?.character).toBe('R')
  })

  it('should handle the exact user-reported scenario', async () => {
    // This is the exact program the user reported as not working
    const source = `
10 LOCATE 10, 10
20 PRINT "I LOVE YOU"
30 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    
    const screenMessages = capturedMessages.filter(
      (msg) => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    
    expect(screenMessages.length).toBeGreaterThan(0)
    const lastScreenMessage = screenMessages[screenMessages.length - 1]
    const screenBuffer = lastScreenMessage && 'data' in lastScreenMessage && 'screenBuffer' in lastScreenMessage.data
      ? (lastScreenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
      : undefined
    
    // Verify "I LOVE YOU" is displayed at position (10, 10)
    expect(screenBuffer?.[10]).toBeDefined()
    expect(screenBuffer?.[10]?.[10]?.character).toBe('I')
    expect(screenBuffer?.[10]?.[11]?.character).toBe(' ')
    expect(screenBuffer?.[10]?.[12]?.character).toBe('L')
    expect(screenBuffer?.[10]?.[13]?.character).toBe('O')
    expect(screenBuffer?.[10]?.[14]?.character).toBe('V')
    expect(screenBuffer?.[10]?.[15]?.character).toBe('E')
    expect(screenBuffer?.[10]?.[16]?.character).toBe(' ')
    expect(screenBuffer?.[10]?.[17]?.character).toBe('Y')
    expect(screenBuffer?.[10]?.[18]?.character).toBe('O')
    expect(screenBuffer?.[10]?.[19]?.character).toBe('U')
    
    // Verify nothing is at (0, 0) - text should only be at (10, 10)
    const hasTextAtOrigin = screenBuffer?.[0]?.[0]?.character && 
                            screenBuffer?.[0]?.[0]?.character !== ' '
    expect(hasTextAtOrigin).toBeFalsy()
  })

  it('should handle LOCATE at edge positions', async () => {
    const source = `
10 LOCATE 0, 0
20 PRINT "TOP"
30 LOCATE 25, 23
40 PRINT "END"
50 END
`
    const result = await interpreter.execute(source)
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    
    const screenMessages = capturedMessages.filter(
      (msg) => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const lastScreenMessage = screenMessages[screenMessages.length - 1]
    const screenBuffer = lastScreenMessage && 'data' in lastScreenMessage && 'screenBuffer' in lastScreenMessage.data
      ? (lastScreenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
      : undefined
    
    // "TOP" at (0, 0)
    expect(screenBuffer?.[0]?.[0]?.character).toBe('T')
    expect(screenBuffer?.[0]?.[1]?.character).toBe('O')
    expect(screenBuffer?.[0]?.[2]?.character).toBe('P')
    
    // "END" at (25, 23) - all 3 chars should fit
    expect(screenBuffer?.[23]?.[25]?.character).toBe('E')
    expect(screenBuffer?.[23]?.[26]?.character).toBe('N')
    expect(screenBuffer?.[23]?.[27]?.character).toBe('D')
  })
})
