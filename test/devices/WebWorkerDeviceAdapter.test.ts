/**
 * WebWorkerDeviceAdapter Integration Tests
 *
 * Tests for the actual device adapter behavior, especially cursor positioning
 * and screen buffer management.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { WebWorkerDeviceAdapter } from '@/core/devices/WebWorkerDeviceAdapter'
import type { AnyServiceWorkerMessage } from '@/core/interfaces'

type ScreenBuffer = { character: string; x: number; y: number }[][]

// Mock self.postMessage to capture messages
let capturedMessages: AnyServiceWorkerMessage[] = []
const originalPostMessage = (globalThis as typeof globalThis & { postMessage?: typeof self.postMessage }).postMessage

beforeEach(() => {
  capturedMessages = []
  // Mock self.postMessage for testing
  if (typeof self !== 'undefined') {
    ;(self as typeof self & { postMessage: (message: AnyServiceWorkerMessage) => void }).postMessage = (
      message: AnyServiceWorkerMessage
    ) => {
      capturedMessages.push(message)
    }
  }
})

afterEach(() => {
  // Restore original
  if (typeof self !== 'undefined' && originalPostMessage) {
    ;(self as typeof self & { postMessage: typeof originalPostMessage }).postMessage = originalPostMessage
  }
})

describe('WebWorkerDeviceAdapter - Cursor Position', () => {
  let adapter: WebWorkerDeviceAdapter

  beforeEach(() => {
    vi.useFakeTimers()
    adapter = new WebWorkerDeviceAdapter()
    adapter.setCurrentExecutionId('test-execution')
    capturedMessages = []
  })

  afterEach(() => {
    adapter.cancelPendingScreenUpdate()
    vi.useRealTimers()
  })

  it('should set cursor position correctly', () => {
    adapter.setCursorPosition(10, 5)

    // Check that a cursor update message was sent
    const cursorMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'cursor'
    )

    expect(cursorMessage).toBeDefined()
    if (cursorMessage && 'data' in cursorMessage) {
      const data = cursorMessage.data as { cursorX?: number; cursorY?: number }
      expect(data.cursorX).toBe(10)
      expect(data.cursorY).toBe(5)
    }
  })

  it('should write characters at cursor position after LOCATE', () => {
    // Set cursor position
    adapter.setCursorPosition(10, 5)
    capturedMessages = [] // Clear messages

    // Print text
    adapter.printOutput('HELLO')
    vi.advanceTimersByTime(50)

    // Check that screen update was sent
    const screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )

    expect(screenMessage).toBeDefined()
    expect(screenMessage && screenMessage.data && 'screenBuffer' in screenMessage.data).toBe(true)

    // Check that characters were written at position (10, 5)
    const screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined
    expect(screenBuffer).toBeDefined()
    expect(screenBuffer?.[5]).toBeDefined() // Row 5
    expect(screenBuffer?.[5]?.[10]?.character).toBe('H')
    expect(screenBuffer?.[5]?.[11]?.character).toBe('E')
    expect(screenBuffer?.[5]?.[12]?.character).toBe('L')
    expect(screenBuffer?.[5]?.[13]?.character).toBe('L')
    expect(screenBuffer?.[5]?.[14]?.character).toBe('O')
  })

  it('should write characters starting from (0, 0) by default', () => {
    // Don't set cursor position - should start at (0, 0)
    adapter.printOutput('TEST')
    vi.advanceTimersByTime(50)

    const screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )

    expect(screenMessage).toBeDefined()
    const screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined
    expect(screenBuffer?.[0]).toBeDefined() // Row 0
    expect(screenBuffer?.[0]?.[0]?.character).toBe('T')
    expect(screenBuffer?.[0]?.[1]?.character).toBe('E')
    expect(screenBuffer?.[0]?.[2]?.character).toBe('S')
    expect(screenBuffer?.[0]?.[3]?.character).toBe('T')
  })

  it('should advance cursor after printing', () => {
    adapter.setCursorPosition(10, 5)
    capturedMessages = []

    adapter.printOutput('HI')
    vi.advanceTimersByTime(50)

    // After printing "HI" at (10, 5), cursor should be at (12, 5)
    // Check the screen buffer to see where next character would go
    const screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )

    const screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined

    // Characters should be at (10,5) and (11,5)
    expect(screenBuffer?.[5]?.[10]?.character).toBe('H')
    expect(screenBuffer?.[5]?.[11]?.character).toBe('I')

    // Next print should continue from (12, 5)
    capturedMessages = []
    adapter.printOutput('BYE')
    vi.advanceTimersByTime(50)

    const nextScreenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const nextScreenBuffer =
      nextScreenMessage?.data && 'screenBuffer' in nextScreenMessage.data
        ? (nextScreenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined

    // Should continue from where we left off
    expect(nextScreenBuffer?.[5]?.[12]?.character).toBe('B')
    expect(nextScreenBuffer?.[5]?.[13]?.character).toBe('Y')
    expect(nextScreenBuffer?.[5]?.[14]?.character).toBe('E')
  })

  it('should handle LOCATE then PRINT sequence', () => {
    // Simulate: LOCATE 10, 10: PRINT "I LOVE YOU"
    adapter.setCursorPosition(10, 10)
    capturedMessages = []

    adapter.printOutput('I LOVE YOU')
    vi.advanceTimersByTime(50)

    const screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )

    expect(screenMessage).toBeDefined()
    const screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined

    // Check that text starts at position (10, 10)
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

  it('should handle multiple LOCATE and PRINT calls', () => {
    // LOCATE 5, 5: PRINT "FIRST"
    adapter.setCursorPosition(5, 5)
    capturedMessages = []
    adapter.printOutput('FIRST')
    vi.advanceTimersByTime(50)

    let screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    let screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined
    expect(screenBuffer?.[5]?.[5]?.character).toBe('F')

    // LOCATE 15, 10: PRINT "SECOND"
    adapter.setCursorPosition(15, 10)
    capturedMessages = []
    adapter.printOutput('SECOND')
    vi.advanceTimersByTime(50)

    screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined

    // First text should still be there
    expect(screenBuffer?.[5]?.[5]?.character).toBe('F')
    // Second text should be at new position
    expect(screenBuffer?.[10]?.[15]?.character).toBe('S')
  })

  it('should handle newlines correctly', () => {
    adapter.setCursorPosition(10, 5)
    capturedMessages = []

    adapter.printOutput('LINE1\nLINE2')
    vi.advanceTimersByTime(50)

    const screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined

    // First line at (10, 5)
    expect(screenBuffer?.[5]?.[10]?.character).toBe('L')
    expect(screenBuffer?.[5]?.[11]?.character).toBe('I')
    expect(screenBuffer?.[5]?.[12]?.character).toBe('N')
    expect(screenBuffer?.[5]?.[13]?.character).toBe('E')
    expect(screenBuffer?.[5]?.[14]?.character).toBe('1')

    // Second line should start at (0, 6) after newline
    expect(screenBuffer?.[6]?.[0]?.character).toBe('L')
    expect(screenBuffer?.[6]?.[1]?.character).toBe('I')
    expect(screenBuffer?.[6]?.[2]?.character).toBe('N')
    expect(screenBuffer?.[6]?.[3]?.character).toBe('E')
    expect(screenBuffer?.[6]?.[4]?.character).toBe('2')
  })

  it('should wrap text at column 28', () => {
    adapter.setCursorPosition(25, 5)
    capturedMessages = []

    // Print text that will wrap
    adapter.printOutput('ABCDEFGH')
    vi.advanceTimersByTime(50)

    const screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined

    // First 3 characters at end of row 5
    expect(screenBuffer?.[5]?.[25]?.character).toBe('A')
    expect(screenBuffer?.[5]?.[26]?.character).toBe('B')
    expect(screenBuffer?.[5]?.[27]?.character).toBe('C')

    // Next characters should wrap to row 6
    expect(screenBuffer?.[6]?.[0]?.character).toBe('D')
    expect(screenBuffer?.[6]?.[1]?.character).toBe('E')
  })

  it('should clear screen and reset cursor', () => {
    // Write something first
    adapter.printOutput('TEST')
    vi.advanceTimersByTime(50)
    capturedMessages = []

    // Clear screen
    adapter.clearScreen()

    const clearMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'clear'
    )
    expect(clearMessage).toBeDefined()

    // After clear, cursor should be at (0, 0)
    capturedMessages = []
    adapter.printOutput('AFTER')
    vi.advanceTimersByTime(50)

    const screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined

    // Should start at (0, 0)
    expect(screenBuffer?.[0]?.[0]?.character).toBe('A')
  })

  it('should clear screen buffer completely', () => {
    // Write content at multiple positions
    adapter.setCursorPosition(5, 5)
    adapter.printOutput('FIRST')
    vi.advanceTimersByTime(50)
    adapter.setCursorPosition(10, 10)
    adapter.printOutput('SECOND')
    vi.advanceTimersByTime(50)
    adapter.setCursorPosition(15, 15)
    adapter.printOutput('THIRD')
    vi.advanceTimersByTime(50)
    capturedMessages = []

    // Clear screen
    adapter.clearScreen()

    // Verify clear message was sent
    const clearMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'clear'
    )
    expect(clearMessage).toBeDefined()

    // Print something after clear and verify screen is empty except for new content
    capturedMessages = []
    adapter.printOutput('NEW')
    vi.advanceTimersByTime(50)

    const screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined

    // New content should be at (0, 0)
    expect(screenBuffer?.[0]?.[0]?.character).toBe('N')
    expect(screenBuffer?.[0]?.[1]?.character).toBe('E')
    expect(screenBuffer?.[0]?.[2]?.character).toBe('W')

    // Old content should be gone (check a few positions)
    expect(screenBuffer?.[5]?.[5]?.character).toBe(' ')
    expect(screenBuffer?.[10]?.[10]?.character).toBe(' ')
    expect(screenBuffer?.[15]?.[15]?.character).toBe(' ')
  })

  it('should reset cursor position to (0, 0) after clearScreen', () => {
    // Set cursor to a different position
    adapter.setCursorPosition(20, 15)
    capturedMessages = []

    // Clear screen
    adapter.clearScreen()

    // Verify clear message was sent
    const clearMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'clear'
    )
    expect(clearMessage).toBeDefined()

    // Print after clear - should start at (0, 0)
    capturedMessages = []
    adapter.printOutput('RESET')
    vi.advanceTimersByTime(50)

    const screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined

    // Should be at (0, 0), not at previous position (20, 15)
    expect(screenBuffer?.[0]?.[0]?.character).toBe('R')
    expect(screenBuffer?.[15]?.[20]?.character).toBe(' ')
  })

  it('should handle multiple clearScreen calls', () => {
    // Write content
    adapter.printOutput('CONTENT1')
    vi.advanceTimersByTime(50)
    capturedMessages = []

    // First clear
    adapter.clearScreen()
    let clearMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'clear'
    )
    expect(clearMessage).toBeDefined()

    // Write more content
    capturedMessages = []
    adapter.printOutput('CONTENT2')
    vi.advanceTimersByTime(50)
    capturedMessages = []

    // Second clear
    adapter.clearScreen()
    clearMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'clear'
    )
    expect(clearMessage).toBeDefined()

    // Print after second clear
    capturedMessages = []
    adapter.printOutput('FINAL')
    vi.advanceTimersByTime(50)

    const screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined

    // Should start at (0, 0)
    expect(screenBuffer?.[0]?.[0]?.character).toBe('F')
  })

  it('should clear screen even when already empty', () => {
    // Clear screen without writing anything first
    adapter.clearScreen()

    const clearMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'clear'
    )
    expect(clearMessage).toBeDefined()

    // Should still work and reset cursor
    capturedMessages = []
    adapter.printOutput('EMPTY')
    vi.advanceTimersByTime(50)

    const screenMessage = capturedMessages.find(
      msg => msg.type === 'SCREEN_UPDATE' && 'updateType' in msg.data && msg.data.updateType === 'full'
    )
    const screenBuffer =
      screenMessage?.data && 'screenBuffer' in screenMessage.data
        ? (screenMessage.data as { screenBuffer: ScreenBuffer }).screenBuffer
        : undefined

    expect(screenBuffer?.[0]?.[0]?.character).toBe('E')
  })
})
