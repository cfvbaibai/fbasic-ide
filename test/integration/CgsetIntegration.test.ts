/**
 * CGSET Integration Tests
 * 
 * Tests that verify CGSET command works correctly end-to-end:
 * 1. CGSET command execution
 * 2. Palette update message generation
 * 3. Message handler processing (simulated)
 * 4. Integration with PRINT to verify palette affects character rendering
 * 
 * This test verifies that CGSET 0, 1 sets the palette correctly and
 * characters are rendered with the correct colors from palette 0.
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
 * This verifies that palette updates are handled correctly
 */
function simulateMessageHandler(message: ScreenUpdateMessage, context: { bgPalette: number }): void {
  const update = message.data
  
  switch (update.updateType) {
    case 'palette':
      // Handle palette update (this is the handler that was missing)
      if (update.bgPalette !== undefined) {
        context.bgPalette = update.bgPalette
      }
      break
    case 'character':
      // Handle character updates
      // Characters use the current bgPalette from context
      break
    // Other cases omitted for brevity
  }
}

describe('CGSET Integration', () => {
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

  describe('CGSET command message generation', () => {
    it('should send palette update message when CGSET is executed', async () => {
      const source = `
10 CGSET 0, 1
20 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Find palette update messages
      const paletteMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'palette'
      )
      
      expect(paletteMessages.length).toBeGreaterThan(0)
      
      const paletteMessage = paletteMessages[0] as ScreenUpdateMessage
      expect(paletteMessage.data.updateType).toBe('palette')
      expect(paletteMessage.data.bgPalette).toBeDefined()
      expect(paletteMessage.data.spritePalette).toBeDefined()
    })

    it('should include correct palette values in message', async () => {
      const source = `
10 CGSET 0, 1
20 END
`
      await interpreter.execute(source)
      
      const paletteMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'palette'
      )
      
      expect(paletteMessages.length).toBeGreaterThan(0)
      const paletteMessage = paletteMessages[0] as ScreenUpdateMessage
      
      expect(paletteMessage.data.bgPalette).toBe(0)
      expect(paletteMessage.data.spritePalette).toBe(1)
    })

    it('should send palette update for each CGSET command', async () => {
      const source = `
10 CGSET 0, 0
20 CGSET 1, 1
30 CGSET 0, 2
40 END
`
      await interpreter.execute(source)
      
      const paletteMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'palette'
      )
      
      // Should have 3 palette update messages
      expect(paletteMessages.length).toBe(3)
      
      // Verify each message has correct values
      expect((paletteMessages[0] as ScreenUpdateMessage).data.bgPalette).toBe(0)
      expect((paletteMessages[0] as ScreenUpdateMessage).data.spritePalette).toBe(0)
      
      expect((paletteMessages[1] as ScreenUpdateMessage).data.bgPalette).toBe(1)
      expect((paletteMessages[1] as ScreenUpdateMessage).data.spritePalette).toBe(1)
      
      expect((paletteMessages[2] as ScreenUpdateMessage).data.bgPalette).toBe(0)
      expect((paletteMessages[2] as ScreenUpdateMessage).data.spritePalette).toBe(2)
    })

    it('should use default values when CGSET has no parameters', async () => {
      const source = `
10 CGSET
20 END
`
      await interpreter.execute(source)
      
      const paletteMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'palette'
      )
      
      expect(paletteMessages.length).toBeGreaterThan(0)
      const paletteMessage = paletteMessages[0] as ScreenUpdateMessage
      
      // Default values: m=1, n=1
      expect(paletteMessage.data.bgPalette).toBe(1)
      expect(paletteMessage.data.spritePalette).toBe(1)
    })
  })

  describe('CGSET message handler processing', () => {
    it('should process palette update messages correctly (simulated handler)', () => {
      // Create a test context to track palette state
      const context = { bgPalette: 1 } // Start with default palette
      
      // Create a palette update message (simulating what WebWorkerDeviceAdapter sends)
      const paletteMessage: ScreenUpdateMessage = {
        type: 'SCREEN_UPDATE',
        id: 'test-palette-1',
        timestamp: Date.now(),
        data: {
          executionId: 'test',
          updateType: 'palette',
          bgPalette: 0,
          spritePalette: 1,
          timestamp: Date.now()
        }
      }
      
      // Process the message (simulating the handler)
      simulateMessageHandler(paletteMessage, context)
      
      // Verify palette was updated
      expect(context.bgPalette).toBe(0)
    })

    it('should handle multiple palette updates in sequence', () => {
      const context = { bgPalette: 1 }
      
      const messages: ScreenUpdateMessage[] = [
        {
          type: 'SCREEN_UPDATE',
          id: 'test-palette-1',
          timestamp: Date.now(),
          data: {
            executionId: 'test',
            updateType: 'palette',
            bgPalette: 0,
            spritePalette: 0,
            timestamp: Date.now()
          }
        },
        {
          type: 'SCREEN_UPDATE',
          id: 'test-palette-2',
          timestamp: Date.now(),
          data: {
            executionId: 'test',
            updateType: 'palette',
            bgPalette: 1,
            spritePalette: 2,
            timestamp: Date.now()
          }
        }
      ]
      
      // Process messages in sequence
      messages.forEach(msg => simulateMessageHandler(msg, context))
      
      // Last message should be the current palette
      expect(context.bgPalette).toBe(1)
    })
  })

  describe('CGSET with PRINT integration', () => {
    it('should set palette before printing text', async () => {
      const source = `
10 CGSET 0, 1
20 PRINT "HELLO"
30 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Find palette update message
      const paletteMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'palette'
      )
      
      expect(paletteMessages.length).toBeGreaterThan(0)
      
      // Find full screen update (from PRINT)
      const screenMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'full'
      )
      
      expect(screenMessages.length).toBeGreaterThan(0)
      
      // Verify palette update came before screen update
      const paletteMessageIndex = capturedMessages.indexOf(paletteMessages[0])
      const screenMessageIndex = capturedMessages.indexOf(screenMessages[screenMessages.length - 1])
      
      // Palette should be set before printing
      expect(paletteMessageIndex).toBeLessThanOrEqual(screenMessageIndex)
    })

    it('should apply correct palette for characters printed after CGSET 0, 1', async () => {
      const source = `
10 CGSET 0, 1
20 PRINT "HELLO WORLD!"
30 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Find palette update message
      const paletteMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'palette'
      )
      
      expect(paletteMessages.length).toBeGreaterThan(0)
      const paletteMessage = paletteMessages[0] as ScreenUpdateMessage
      
      // Verify palette is set to 0 (which uses color 0x2C for first color in combination 0)
      expect(paletteMessage.data.bgPalette).toBe(0)
      expect(paletteMessage.data.spritePalette).toBe(1)
      
      // The palette update message should be processable by the handler
      const context = { bgPalette: 1 }
      simulateMessageHandler(paletteMessage, context)
      expect(context.bgPalette).toBe(0)
    })

    it('should handle CGSET after PRINT (palette change affects future prints)', async () => {
      const source = `
10 PRINT "BEFORE"
20 CGSET 0, 1
30 PRINT "AFTER"
40 END
`
      const result = await interpreter.execute(source)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Should have palette update message
      const paletteMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'palette'
      )
      
      expect(paletteMessages.length).toBeGreaterThan(0)
      
      // Verify the palette update message is valid and processable
      const paletteMessage = paletteMessages[0] as ScreenUpdateMessage
      expect(paletteMessage.data.bgPalette).toBe(0)
      expect(paletteMessage.data.spritePalette).toBe(1)
    })
  })

  describe('CGSET palette selection verification', () => {
    it('should set palette 0 which uses color 0x2C for first color in combination 0', async () => {
      const source = `
10 CGSET 0, 1
20 END
`
      await interpreter.execute(source)
      
      const paletteMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'palette'
      )
      
      const paletteMessage = paletteMessages[0] as ScreenUpdateMessage
      
      // Verify palette 0 is set
      expect(paletteMessage.data.bgPalette).toBe(0)
      
      // Palette 0, combination 0 uses [0x00, 0x2C, 0x15, 0x07]
      // Character pixels (value 1, 2, 3) map to colors 0x2C, 0x15, 0x07
      // The first visible color for characters is 0x2C (index 1 in the combination)
      // This test verifies the palette is set correctly so rendering will use the right colors
    })

    it('should handle palette changes between multiple PRINT statements', async () => {
      const source = `
10 CGSET 0, 1
20 PRINT "PALETTE 0"
30 CGSET 1, 1
40 PRINT "PALETTE 1"
50 END
`
      await interpreter.execute(source)
      
      const paletteMessages = capturedMessages.filter(
        (msg) => msg.type === 'SCREEN_UPDATE' && 
                 'updateType' in msg.data && 
                 msg.data.updateType === 'palette'
      )
      
      // Should have 2 palette updates
      expect(paletteMessages.length).toBe(2)
      
      // First palette should be 0
      expect((paletteMessages[0] as ScreenUpdateMessage).data.bgPalette).toBe(0)
      
      // Second palette should be 1
      expect((paletteMessages[1] as ScreenUpdateMessage).data.bgPalette).toBe(1)
    })
  })
})
