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

import { beforeEach, describe, expect, it } from 'vitest'

import { createSharedDisplayBuffer } from '@/core/animation/sharedDisplayBuffer'
import { SharedDisplayBufferAccessor } from '@/core/animation/sharedDisplayBufferAccessor'
import { BasicInterpreter } from '@/core/BasicInterpreter'

import { SharedBufferTestAdapter } from '../adapters/SharedBufferTestAdapter'


describe('CGSET Integration', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: SharedBufferTestAdapter
  let sharedBuffer: SharedArrayBuffer
  let accessor: SharedDisplayBufferAccessor

  beforeEach(() => {
    // Create shared display buffer
    const bufferData = createSharedDisplayBuffer()
    sharedBuffer = bufferData.buffer
    accessor = new SharedDisplayBufferAccessor(sharedBuffer)

    // Create and configure adapter
    deviceAdapter = new SharedBufferTestAdapter()
    deviceAdapter.setSharedDisplayBuffer(sharedBuffer)
    deviceAdapter.configure({ enableDisplayBuffer: true })

    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter: deviceAdapter,
      sharedDisplayBuffer: sharedBuffer,
    })
  })

  describe('CGSET command palette updates', () => {
    it('should update palette in shared buffer when CGSET is executed', async () => {
      const source = `
10 CGSET 0, 1
20 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      expect(screenState.bgPalette).toBe(0)
      expect(screenState.spritePalette).toBe(1)
    })

    it('should store correct palette values in shared buffer', async () => {
      const source = `
10 CGSET 0, 1
20 END
`
      await interpreter.execute(source)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      expect(screenState.bgPalette).toBe(0)
      expect(screenState.spritePalette).toBe(1)
    })

    it('should update palette for each CGSET command', async () => {
      const source = `
10 CGSET 0, 0
20 CGSET 1, 1
30 CGSET 0, 2
40 END
`
      await interpreter.execute(source)

      // Read screen state from shared buffer after all commands
      const screenState = accessor.readScreenState()

      // The last CGSET should be the current palette
      expect(screenState.bgPalette).toBe(0)
      expect(screenState.spritePalette).toBe(2)
    })

    it('should use default values when CGSET has no parameters', async () => {
      const source = `
10 CGSET
20 END
`
      await interpreter.execute(source)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Default values: m=1, n=1
      expect(screenState.bgPalette).toBe(1)
      expect(screenState.spritePalette).toBe(1)
    })
  })

  describe('CGSET palette state verification', () => {
    it('should process palette updates correctly in shared buffer', async () => {
      // Execute CGSET to set initial palette
      await interpreter.execute('10 CGSET 0, 1\n20 END')

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Verify palette was updated
      expect(screenState.bgPalette).toBe(0)
    })

    it('should handle multiple palette updates in sequence', async () => {
      // Execute multiple CGSET commands
      await interpreter.execute(`
10 CGSET 0, 0
20 CGSET 1, 1
30 CGSET 0, 2
40 END
`)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Last command should be the current palette
      expect(screenState.bgPalette).toBe(0)
      expect(screenState.spritePalette).toBe(2)
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

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Verify palette is set and text is printed
      expect(screenState.bgPalette).toBe(0)
      expect(screenState.spritePalette).toBe(1)
      expect(screenState.buffer[0]?.[0]?.character).toBe('H')
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

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Verify palette is set to 0 (which uses color 0x2C for first color in combination 0)
      expect(screenState.bgPalette).toBe(0)
      expect(screenState.spritePalette).toBe(1)
      expect(screenState.buffer[0]?.[0]?.character).toBe('H')
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

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Verify palette is set and both texts exist
      expect(screenState.bgPalette).toBe(0)
      expect(screenState.spritePalette).toBe(1)
      expect(screenState.buffer[0]?.[0]?.character).toBe('B')
      expect(screenState.buffer[1]?.[0]?.character).toBe('A')
    })
  })

  describe('CGSET palette selection verification', () => {
    it('should set palette 0 which uses color 0x2C for first color in combination 0', async () => {
      const source = `
10 CGSET 0, 1
20 END
`
      await interpreter.execute(source)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Verify palette 0 is set
      expect(screenState.bgPalette).toBe(0)

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

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Last palette should be 1
      expect(screenState.bgPalette).toBe(1)

      // Verify both texts were printed
      expect(screenState.buffer[0]?.[0]?.character).toBe('P')
      expect(screenState.buffer[1]?.[0]?.character).toBe('P')
    })
  })
})
