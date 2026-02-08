/**
 * WebWorkerDeviceAdapter Integration Tests
 *
 * Tests for the actual device adapter behavior with shared buffer integration.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createSharedDisplayBuffer } from '@/core/animation/sharedDisplayBuffer'
import { SharedDisplayBufferAccessor } from '@/core/animation/sharedDisplayBufferAccessor'
import { WebWorkerDeviceAdapter } from '@/core/devices/WebWorkerDeviceAdapter'
import type { AnyServiceWorkerMessage } from '@/core/interfaces'

// Mock self.postMessage to capture messages
let capturedMessages: AnyServiceWorkerMessage[] = []
const originalPostMessage = (globalThis as typeof globalThis & {
  postMessage?: typeof self.postMessage
}).postMessage

beforeEach(() => {
  capturedMessages = []
  // Mock self.postMessage for testing.
  // In jsdom, self.postMessage has the window.postMessage signature (message, targetOrigin, transfer).
  // In real workers, postMessage has the worker signature (message, transfer).
  // The mock accepts the worker signature since that's what the production code uses.
  if (typeof self !== 'undefined') {
    const selfTyped = self as typeof self & {
      postMessage: ((message: unknown, transfer?: Transferable[]) => void) & typeof self.postMessage
    }
    selfTyped.postMessage = ((message: unknown, _transfer?: Transferable[]) => {
      capturedMessages.push(message as AnyServiceWorkerMessage)
    }) as typeof selfTyped.postMessage
  }
})

afterEach(() => {
  // Restore original
  if (typeof self !== 'undefined' && originalPostMessage) {
    ;(self as typeof self & { postMessage: typeof originalPostMessage }).postMessage =
      originalPostMessage
  }
})

describe('WebWorkerDeviceAdapter - Cursor Position', () => {
  let adapter: WebWorkerDeviceAdapter
  let accessor: SharedDisplayBufferAccessor

  beforeEach(() => {
    vi.useFakeTimers()

    // Create shared buffer and accessor
    const sharedViews = createSharedDisplayBuffer()
    accessor = new SharedDisplayBufferAccessor(sharedViews.buffer)

    adapter = new WebWorkerDeviceAdapter()
    adapter.setSharedDisplayBufferAccessor(accessor)
    adapter.setCurrentExecutionId('test-execution')
    capturedMessages = []
  })

  afterEach(() => {
    adapter.cancelPendingScreenUpdate()
    vi.useRealTimers()
  })

  it('should set cursor position correctly', () => {
    adapter.setCursorPosition(10, 5)

    // Flush screen update to ensure buffer is synced
    vi.advanceTimersByTime(50)

    // Check that cursor position is in shared buffer
    const cursor = accessor.readCursor()
    expect(cursor.x).toBe(10)
    expect(cursor.y).toBe(5)

    // Check that SCREEN_CHANGED was sent
    const screenChangedMessage = capturedMessages.find(msg => msg.type === 'SCREEN_CHANGED')
    expect(screenChangedMessage).toBeDefined()
  })

  it('should write characters at cursor position after LOCATE', () => {
    // Set cursor position
    adapter.setCursorPosition(10, 5)
    vi.advanceTimersByTime(50)
    capturedMessages = []

    // Print text
    adapter.printOutput('HELLO')
    vi.advanceTimersByTime(50)

    // Read screen buffer from shared buffer
    const screenState = accessor.readScreenState()

    // Check that characters were written at position (10, 5)
    expect(screenState.buffer[5]?.[10]?.character).toBe('H')
    expect(screenState.buffer[5]?.[11]?.character).toBe('E')
    expect(screenState.buffer[5]?.[12]?.character).toBe('L')
    expect(screenState.buffer[5]?.[13]?.character).toBe('L')
    expect(screenState.buffer[5]?.[14]?.character).toBe('O')
  })

  it('should write characters starting from (0, 0) by default', () => {
    // Don't set cursor position - should start at (0, 0)
    adapter.printOutput('TEST')
    vi.advanceTimersByTime(50)

    const screenState = accessor.readScreenState()

    expect(screenState.buffer[0]?.[0]?.character).toBe('T')
    expect(screenState.buffer[0]?.[1]?.character).toBe('E')
    expect(screenState.buffer[0]?.[2]?.character).toBe('S')
    expect(screenState.buffer[0]?.[3]?.character).toBe('T')
  })

  it('should advance cursor after printing', () => {
    adapter.setCursorPosition(10, 5)
    vi.advanceTimersByTime(50)

    adapter.printOutput('HI')
    vi.advanceTimersByTime(50)

    // After printing "HI" at (10, 5), cursor should be at (12, 5)
    // Check the screen buffer to see where next character would go
    let screenState = accessor.readScreenState()

    // Characters should be at (10,5) and (11,5)
    expect(screenState.buffer[5]?.[10]?.character).toBe('H')
    expect(screenState.buffer[5]?.[11]?.character).toBe('I')

    // Next print should continue from (12, 5)
    capturedMessages = []
    adapter.printOutput('BYE')
    vi.advanceTimersByTime(50)

    screenState = accessor.readScreenState()

    // Should continue from where we left off
    expect(screenState.buffer[5]?.[12]?.character).toBe('B')
    expect(screenState.buffer[5]?.[13]?.character).toBe('Y')
    expect(screenState.buffer[5]?.[14]?.character).toBe('E')
  })

  it('should handle LOCATE then PRINT sequence', () => {
    // Simulate: LOCATE 10, 10: PRINT "I LOVE YOU"
    adapter.setCursorPosition(10, 10)
    vi.advanceTimersByTime(50)
    capturedMessages = []

    adapter.printOutput('I LOVE YOU')
    vi.advanceTimersByTime(50)

    const screenState = accessor.readScreenState()

    // Check that text starts at position (10, 10)
    expect(screenState.buffer[10]?.[10]?.character).toBe('I')
    expect(screenState.buffer[10]?.[11]?.character).toBe(' ')
    expect(screenState.buffer[10]?.[12]?.character).toBe('L')
    expect(screenState.buffer[10]?.[13]?.character).toBe('O')
    expect(screenState.buffer[10]?.[14]?.character).toBe('V')
    expect(screenState.buffer[10]?.[15]?.character).toBe('E')
    expect(screenState.buffer[10]?.[16]?.character).toBe(' ')
    expect(screenState.buffer[10]?.[17]?.character).toBe('Y')
    expect(screenState.buffer[10]?.[18]?.character).toBe('O')
    expect(screenState.buffer[10]?.[19]?.character).toBe('U')
  })

  it('should handle multiple LOCATE and PRINT calls', () => {
    // LOCATE 5, 5: PRINT "FIRST"
    adapter.setCursorPosition(5, 5)
    vi.advanceTimersByTime(50)
    adapter.printOutput('FIRST')
    vi.advanceTimersByTime(50)

    let screenState = accessor.readScreenState()
    expect(screenState.buffer[5]?.[5]?.character).toBe('F')

    // LOCATE 15, 10: PRINT "SECOND"
    adapter.setCursorPosition(15, 10)
    vi.advanceTimersByTime(50)
    adapter.printOutput('SECOND')
    vi.advanceTimersByTime(50)

    screenState = accessor.readScreenState()

    // First text should still be there
    expect(screenState.buffer[5]?.[5]?.character).toBe('F')
    // Second text should be at new position
    expect(screenState.buffer[10]?.[15]?.character).toBe('S')
  })

  it('should handle newlines correctly', () => {
    adapter.setCursorPosition(10, 5)
    vi.advanceTimersByTime(50)
    capturedMessages = []

    adapter.printOutput('LINE1\nLINE2')
    vi.advanceTimersByTime(50)

    const screenState = accessor.readScreenState()

    // First line at (10, 5)
    expect(screenState.buffer[5]?.[10]?.character).toBe('L')
    expect(screenState.buffer[5]?.[11]?.character).toBe('I')
    expect(screenState.buffer[5]?.[12]?.character).toBe('N')
    expect(screenState.buffer[5]?.[13]?.character).toBe('E')
    expect(screenState.buffer[5]?.[14]?.character).toBe('1')

    // Second line should start at (0, 6) after newline
    expect(screenState.buffer[6]?.[0]?.character).toBe('L')
    expect(screenState.buffer[6]?.[1]?.character).toBe('I')
    expect(screenState.buffer[6]?.[2]?.character).toBe('N')
    expect(screenState.buffer[6]?.[3]?.character).toBe('E')
    expect(screenState.buffer[6]?.[4]?.character).toBe('2')
  })

  it('should wrap text at column 28', () => {
    adapter.setCursorPosition(25, 5)
    vi.advanceTimersByTime(50)
    capturedMessages = []

    // Print text that will wrap
    adapter.printOutput('ABCDEFGH')
    vi.advanceTimersByTime(50)

    const screenState = accessor.readScreenState()

    // First 3 characters at end of row 5
    expect(screenState.buffer[5]?.[25]?.character).toBe('A')
    expect(screenState.buffer[5]?.[26]?.character).toBe('B')
    expect(screenState.buffer[5]?.[27]?.character).toBe('C')

    // Next characters should wrap to row 6
    expect(screenState.buffer[6]?.[0]?.character).toBe('D')
    expect(screenState.buffer[6]?.[1]?.character).toBe('E')
  })

  it('should clear screen and reset cursor', () => {
    // Write something first
    adapter.printOutput('TEST')
    vi.advanceTimersByTime(50)
    capturedMessages = []

    // Clear screen
    adapter.clearScreen()

    // Check SCREEN_CHANGED was sent
    const screenChangedMessage = capturedMessages.find(msg => msg.type === 'SCREEN_CHANGED')
    expect(screenChangedMessage).toBeDefined()

    // After clear, cursor should be at (0, 0)
    capturedMessages = []
    adapter.printOutput('AFTER')
    vi.advanceTimersByTime(50)

    const screenState = accessor.readScreenState()

    // Should start at (0, 0)
    expect(screenState.buffer[0]?.[0]?.character).toBe('A')
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

    // Check SCREEN_CHANGED was sent
    const screenChangedMessage = capturedMessages.find(msg => msg.type === 'SCREEN_CHANGED')
    expect(screenChangedMessage).toBeDefined()

    // Print something after clear and verify screen is empty except for new content
    capturedMessages = []
    adapter.printOutput('NEW')
    vi.advanceTimersByTime(50)

    const screenState = accessor.readScreenState()

    // New content should be at (0, 0)
    expect(screenState.buffer[0]?.[0]?.character).toBe('N')
    expect(screenState.buffer[0]?.[1]?.character).toBe('E')
    expect(screenState.buffer[0]?.[2]?.character).toBe('W')

    // Old content should be gone (check a few positions)
    expect(screenState.buffer[5]?.[5]?.character).toBe(' ')
    expect(screenState.buffer[10]?.[10]?.character).toBe(' ')
    expect(screenState.buffer[15]?.[15]?.character).toBe(' ')
  })

  it('should reset cursor position to (0, 0) after clearScreen', () => {
    // Set cursor to a different position
    adapter.setCursorPosition(20, 15)
    vi.advanceTimersByTime(50)
    capturedMessages = []

    // Clear screen
    adapter.clearScreen()

    // Verify SCREEN_CHANGED was sent
    const screenChangedMessage = capturedMessages.find(msg => msg.type === 'SCREEN_CHANGED')
    expect(screenChangedMessage).toBeDefined()

    // Print after clear - should start at (0, 0)
    capturedMessages = []
    adapter.printOutput('RESET')
    vi.advanceTimersByTime(50)

    const screenState = accessor.readScreenState()

    // Should be at (0, 0), not at previous position (20, 15)
    expect(screenState.buffer[0]?.[0]?.character).toBe('R')
    expect(screenState.buffer[15]?.[20]?.character).toBe(' ')
  })

  it('should handle multiple clearScreen calls', () => {
    // Write content
    adapter.printOutput('CONTENT1')
    vi.advanceTimersByTime(50)
    capturedMessages = []

    // First clear
    adapter.clearScreen()
    let screenChangedMessage = capturedMessages.find(msg => msg.type === 'SCREEN_CHANGED')
    expect(screenChangedMessage).toBeDefined()

    // Write more content
    capturedMessages = []
    adapter.printOutput('CONTENT2')
    vi.advanceTimersByTime(50)
    capturedMessages = []

    // Second clear
    adapter.clearScreen()
    screenChangedMessage = capturedMessages.find(msg => msg.type === 'SCREEN_CHANGED')
    expect(screenChangedMessage).toBeDefined()

    // Print after second clear
    capturedMessages = []
    adapter.printOutput('FINAL')
    vi.advanceTimersByTime(50)

    const screenState = accessor.readScreenState()

    // Should start at (0, 0)
    expect(screenState.buffer[0]?.[0]?.character).toBe('F')
  })

  it('should clear screen even when already empty', () => {
    // Clear screen without writing anything first
    adapter.clearScreen()

    const screenChangedMessage = capturedMessages.find(msg => msg.type === 'SCREEN_CHANGED')
    expect(screenChangedMessage).toBeDefined()

    // Should still work and reset cursor
    capturedMessages = []
    adapter.printOutput('EMPTY')
    vi.advanceTimersByTime(50)

    const screenState = accessor.readScreenState()

    expect(screenState.buffer[0]?.[0]?.character).toBe('E')
  })
})
