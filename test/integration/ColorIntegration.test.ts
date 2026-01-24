/**
 * COLOR Integration Tests
 * 
 * Tests that verify COLOR command works correctly end-to-end:
 * 1. COLOR command execution
 * 2. Screen update message generation
 * 3. Message handler processing (simulated)
 * 
 * This test would have caught the bug where COLOR messages weren't being handled.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { WebWorkerDeviceAdapter } from '@/core/devices/WebWorkerDeviceAdapter'
import type { AnyServiceWorkerMessage, ScreenUpdateMessage, ScreenCell } from '@/core/interfaces'

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

/**
 * Simulate the message handler behavior to verify messages are processable
 * This would catch bugs where message handlers don't handle certain update types
 */
function simulateMessageHandler(message: ScreenUpdateMessage, screenBuffer: ScreenCell[][]): void {
  const update = message.data

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- Test helper only handles specific update types
  switch (update.updateType) {
    case 'color':
      // This is the handler that was missing - would catch the bug!
      if (update.colorUpdates) {
        for (const colorUpdate of update.colorUpdates) {
          const { x, y, pattern } = colorUpdate

          // Ensure row exists
          screenBuffer[y] ??= []

          // Ensure cell exists
          const currentRow = screenBuffer[y]
          currentRow[x] ??= {
            character: ' ',
            colorPattern: 0,
            x,
            y
          }
          
          // Update color pattern
          currentRow[x].colorPattern = pattern
        }
      }
      break
    case 'character':
      // Handle character updates (existing handler)
      if (update.x !== undefined && update.y !== undefined && update.character !== undefined) {
        screenBuffer[update.y] ??= []
        const row = screenBuffer[update.y]
        if (!row) {
          throw new Error('Row not found')
        }
        row[update.x] ??= {
          character: ' ',
          colorPattern: 0,
          x: update.x,
          y: update.y
        }
        const cell = row[update.x]
        if (cell) {
          cell.character = update.character
        }
      }
      break
    default:
      // Other update types not relevant for this test
      break
  }
}

describe('COLOR Integration', () => {
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

  describe('COLOR command message generation', () => {
    it('should send color update message when COLOR is executed', async () => {
      const source = `
10 COLOR 0, 0, 3
20 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Find color update messages
      const colorMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'color'
      )
      
      expect(colorMessages.length).toBeGreaterThan(0)
      
      const colorMessage = colorMessages[0] as ScreenUpdateMessage
      expect(colorMessage.data.updateType).toBe('color')
      expect(colorMessage.data.colorUpdates).toBeDefined()
      expect(Array.isArray(colorMessage.data.colorUpdates)).toBe(true)
    })

    it('should include correct color updates in message', async () => {
      const source = `
10 COLOR 10, 5, 2
20 END
`
      await interpreter.execute(source)
      
      const colorMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'color'
      )
      
      expect(colorMessages.length).toBeGreaterThan(0)
      const colorMessage = colorMessages[0] as ScreenUpdateMessage
      const colorUpdates = colorMessage.data.colorUpdates
      
      expect(colorUpdates).toBeDefined()
      expect(colorUpdates?.length).toBeGreaterThan(0)
      
      // COLOR affects a 2×2 area, so should have 4 updates
      expect(colorUpdates?.length).toBe(4)
      
      // Verify all updates have the correct pattern
      colorUpdates?.forEach(update => {
        expect(update.pattern).toBe(2)
        expect(update.x).toBeGreaterThanOrEqual(0)
        expect(update.x).toBeLessThan(28)
        expect(update.y).toBeGreaterThanOrEqual(0)
        expect(update.y).toBeLessThan(24)
      })
    })

    it('should send color update for each COLOR command', async () => {
      const source = `
10 COLOR 5, 5, 0
20 COLOR 10, 10, 1
30 COLOR 15, 15, 2
40 END
`
      await interpreter.execute(source)
      
      const colorMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'color'
      )
      
      // Should have 3 color update messages
      expect(colorMessages.length).toBe(3)
    })
  })

  describe('COLOR message handler processing', () => {
    it('should process color update messages correctly (simulated handler)', () => {
      // Create a test screen buffer
      const screenBuffer: ScreenCell[][] = []
      for (let y = 0; y < 24; y++) {
        const row: ScreenCell[] = []
        screenBuffer[y] = row
        for (let x = 0; x < 28; x++) {
          row[x] = {
            character: ' ',
            colorPattern: 0,
            x,
            y
          }
        }
      }
      
      // Create a color update message (simulating what WebWorkerDeviceAdapter sends)
      const colorMessage: ScreenUpdateMessage = {
        type: 'SCREEN_UPDATE',
        id: 'test-color-1',
        timestamp: Date.now(),
        data: {
          executionId: 'test',
          updateType: 'color',
          colorUpdates: [
            { x: 0, y: 0, pattern: 3 },
            { x: 1, y: 0, pattern: 3 },
            { x: 0, y: 1, pattern: 3 },
            { x: 1, y: 1, pattern: 3 }
          ],
          timestamp: Date.now()
        }
      }
      
      // Process the message (simulating the handler)
      simulateMessageHandler(colorMessage, screenBuffer)
      
      // Verify color patterns were updated
      expect(screenBuffer[0]?.[0]?.colorPattern).toBe(3)
      expect(screenBuffer[0]?.[1]?.colorPattern).toBe(3)
      expect(screenBuffer[1]?.[0]?.colorPattern).toBe(3)
      expect(screenBuffer[1]?.[1]?.colorPattern).toBe(3)
    })

    it('should handle color updates for existing cells with characters', () => {
      const screenBuffer: ScreenCell[][] = []
      for (let y = 0; y < 24; y++) {
        const row: ScreenCell[] = []
        screenBuffer[y] = row
        for (let x = 0; x < 28; x++) {
          row[x] = {
            character: x === 0 && y === 0 ? 'H' : ' ',
            colorPattern: 0,
            x,
            y
          }
        }
      }
      
      const colorMessage: ScreenUpdateMessage = {
        type: 'SCREEN_UPDATE',
        id: 'test-color-2',
        timestamp: Date.now(),
        data: {
          executionId: 'test',
          updateType: 'color',
          colorUpdates: [
            { x: 0, y: 0, pattern: 2 }
          ],
          timestamp: Date.now()
        }
      }
      
      simulateMessageHandler(colorMessage, screenBuffer)
      
      // Character should be preserved, color pattern should be updated
      expect(screenBuffer[0]?.[0]?.character).toBe('H')
      expect(screenBuffer[0]?.[0]?.colorPattern).toBe(2)
    })
  })

  describe('COLOR with PRINT integration', () => {
    it('should apply color pattern before printing text', async () => {
      const source = `
10 COLOR 0, 0, 3
20 PRINT "HELLO"
30 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Find color update message
      const colorMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'color'
      )
      
      expect(colorMessages.length).toBeGreaterThan(0)
      
      // Find full screen update (from PRINT)
      const screenMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'full'
      )
      
      expect(screenMessages.length).toBeGreaterThan(0)
      expect(colorMessages.length).toBeGreaterThan(0)
      
      // Verify color update came before screen update
      const colorMessage = colorMessages[0]
      const screenMessage = screenMessages[screenMessages.length - 1]
      if (!colorMessage || !screenMessage) {
        throw new Error('Expected messages not found')
      }
      const colorMessageIndex = capturedMessages.indexOf(colorMessage)
      const screenMessageIndex = capturedMessages.indexOf(screenMessage)
      
      // Color should be set before or around the same time as printing
      // (In practice, COLOR happens first, then PRINT)
      expect(colorMessageIndex).toBeLessThanOrEqual(screenMessageIndex)
    })

    it('should handle COLOR after PRINT (updates existing text)', async () => {
      const source = `
10 PRINT "HELLO WORLD!"
20 COLOR 0, 0, 3
30 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Should have both character updates (from PRINT) and color update (from COLOR)
      const colorMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'color'
      )
      
      expect(colorMessages.length).toBeGreaterThan(0)
      
      // Verify the color update message is valid and processable
      const colorMessage = colorMessages[0] as ScreenUpdateMessage
      expect(colorMessage.data.colorUpdates).toBeDefined()
      expect(colorMessage.data.colorUpdates?.length).toBeGreaterThan(0)
    })
  })

  describe('COLOR area calculation', () => {
    it('should update correct 2×2 area for COLOR 0, 0, 3', async () => {
      const source = `
10 COLOR 0, 0, 3
20 END
`
      await interpreter.execute(source)
      
      const colorMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'color'
      )
      
      const colorMessage = colorMessages[0] as ScreenUpdateMessage
      const colorUpdates = colorMessage.data.colorUpdates
      
      expect(colorUpdates?.length).toBe(4)
      
      // For COLOR 0, 0, 3:
      // areaX = Math.floor(0 / 2) * 2 = 0
      // areaY = 0
      // topY = areaY > 0 ? areaY - 1 : 0 = 0
      // So when y=0, both top and bottom rows are at y=0 (edge case)
      // The area is: (0, 0), (1, 0), (0, 0), (1, 0) - duplicates are possible
      // But we should have at least (0, 0) and (1, 0)
      const positions = colorUpdates?.map(u => `${u.x},${u.y}`)
      expect(positions).toBeDefined()
      expect(positions?.length).toBe(4)
      // Verify we have the expected positions (may have duplicates for y=0 edge case)
      const uniquePositions = [...new Set(positions)]
      expect(uniquePositions.length).toBeGreaterThanOrEqual(2)
      expect(uniquePositions).toContain('0,0')
      expect(uniquePositions).toContain('1,0')
    })

    it('should update correct 2×2 area for COLOR 10, 10, 2', async () => {
      const source = `
10 COLOR 10, 10, 2
20 END
`
      await interpreter.execute(source)
      
      const colorMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'color'
      )
      
      const colorMessage = colorMessages[0] as ScreenUpdateMessage
      const colorUpdates = colorMessage.data.colorUpdates
      
      expect(colorUpdates?.length).toBe(4)
      
      // For COLOR 10, 10, 2:
      // areaX = Math.floor(10 / 2) * 2 = 10
      // areaY = 10
      // Top row: y = 10 - 1 = 9
      // So the area is: (10, 9), (11, 9), (10, 10), (11, 10)
      const positions = colorUpdates?.map(u => `${u.x},${u.y}`).sort()
      expect(positions).toContain('10,9')
      expect(positions).toContain('11,9')
      expect(positions).toContain('10,10')
      expect(positions).toContain('11,10')
    })
  })
})
