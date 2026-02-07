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

import { beforeEach, describe, expect, it } from 'vitest'

import { createSharedDisplayBuffer } from '@/core/animation/sharedDisplayBuffer'
import { SharedDisplayBufferAccessor } from '@/core/animation/sharedDisplayBufferAccessor'
import { BasicInterpreter } from '@/core/BasicInterpreter'

import { SharedBufferTestAdapter } from '../adapters/SharedBufferTestAdapter'

describe('COLOR Integration', () => {
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

  describe('COLOR command screen state updates', () => {
    it('should update color patterns in shared buffer when COLOR is executed', async () => {
      const source = `
10 COLOR 0, 0, 3
20 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // COLOR 0, 0, 3: when y=0, both topY and bottomY are 0 (edge case)
      // So only row 0 is updated: (0, 0) and (1, 0)
      expect(screenState.buffer[0]?.[0]?.colorPattern).toBe(3)
      expect(screenState.buffer[0]?.[1]?.colorPattern).toBe(3)
    })

    it('should update correct 2×2 area for COLOR 10, 5, 2', async () => {
      const source = `
10 COLOR 10, 5, 2
20 END
`
      await interpreter.execute(source)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // COLOR 10, 5, 2 should affect:
      // x = Math.floor(10 / 2) * 2 = 10
      // y = 5
      // Top row: y = 5 - 1 = 4
      // So the area is: (10, 4), (11, 4), (10, 5), (11, 5)
      expect(screenState.buffer[4]?.[10]?.colorPattern).toBe(2)
      expect(screenState.buffer[4]?.[11]?.colorPattern).toBe(2)
      expect(screenState.buffer[5]?.[10]?.colorPattern).toBe(2)
      expect(screenState.buffer[5]?.[11]?.colorPattern).toBe(2)
    })

    it('should update color patterns for each COLOR command', async () => {
      const source = `
10 COLOR 5, 5, 0
20 COLOR 10, 10, 1
30 COLOR 15, 15, 2
40 END
`
      await interpreter.execute(source)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Verify each COLOR command updated the correct area
      // First COLOR: affects area around (5, 5)
      expect(screenState.buffer[4]?.[4]?.colorPattern).toBe(0)
      expect(screenState.buffer[4]?.[5]?.colorPattern).toBe(0)
      expect(screenState.buffer[5]?.[4]?.colorPattern).toBe(0)
      expect(screenState.buffer[5]?.[5]?.colorPattern).toBe(0)

      // Second COLOR: affects area around (10, 10)
      expect(screenState.buffer[9]?.[10]?.colorPattern).toBe(1)
      expect(screenState.buffer[9]?.[11]?.colorPattern).toBe(1)
      expect(screenState.buffer[10]?.[10]?.colorPattern).toBe(1)
      expect(screenState.buffer[10]?.[11]?.colorPattern).toBe(1)

      // Third COLOR: affects area around (15, 15)
      expect(screenState.buffer[14]?.[14]?.colorPattern).toBe(2)
      expect(screenState.buffer[14]?.[15]?.colorPattern).toBe(2)
      expect(screenState.buffer[15]?.[14]?.colorPattern).toBe(2)
      expect(screenState.buffer[15]?.[15]?.colorPattern).toBe(2)
    })
  })

  describe('COLOR state verification', () => {
    it('should update color patterns correctly in shared buffer', async () => {
      // Set up a test scenario with color patterns
      const source = `
10 COLOR 0, 0, 3
20 END
`
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // COLOR 0, 0, 3: when y=0, only row 0 is updated (edge case)
      expect(screenState.buffer[0]?.[0]?.colorPattern).toBe(3)
      expect(screenState.buffer[0]?.[1]?.colorPattern).toBe(3)
    })

    it('should handle color updates for existing cells with characters', async () => {
      // First print a character
      const source1 = `
10 PRINT "H"
20 END
`
      await interpreter.execute(source1)

      // Update color pattern
      const source2 = `
10 COLOR 0, 0, 2
20 END
`
      await interpreter.execute(source2)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Character should be preserved, color pattern should be updated
      expect(screenState.buffer[0]?.[0]?.character).toBe('H')
      expect(screenState.buffer[0]?.[0]?.colorPattern).toBe(2)
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

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Verify both color was set and text was printed
      expect(screenState.buffer[0]?.[0]?.colorPattern).toBe(3) // COLOR sets pattern at 0,0
      expect(screenState.buffer[0]?.[0]?.character).toBe('H')  // PRINT puts character at 0,0
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

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // Verify text exists and only first 2 cells in row 0 have color (edge case for y=0)
      expect(screenState.buffer[0]?.[0]?.character).toBe('H')
      expect(screenState.buffer[0]?.[0]?.colorPattern).toBe(3)
      expect(screenState.buffer[0]?.[6]?.character).toBe('W')
      // "W" is at position 6, which is outside the 2×2 area (columns 0-1)
      // So it should NOT have the color pattern applied
      expect(screenState.buffer[0]?.[6]?.colorPattern).toBe(0)
    })
  })

  describe('COLOR area calculation', () => {
    it('should update correct 2×2 area for COLOR 0, 0, 3', async () => {
      const source = `
10 COLOR 0, 0, 3
20 END
`
      await interpreter.execute(source)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // For COLOR 0, 0, 3:
      // areaX = Math.floor(0 / 2) * 2 = 0
      // areaY = 0
      // topY = areaY > 0 ? areaY - 1 : 0 = 0
      // So when y=0, both top and bottom rows are at y=0 (edge case)
      // Only row 0 is updated: (0, 0) and (1, 0)
      expect(screenState.buffer[0]?.[0]?.colorPattern).toBe(3)
      expect(screenState.buffer[0]?.[1]?.colorPattern).toBe(3)
    })

    it('should update correct 2×2 area for COLOR 10, 10, 2', async () => {
      const source = `
10 COLOR 10, 10, 2
20 END
`
      await interpreter.execute(source)

      // Read screen state from shared buffer
      const screenState = accessor.readScreenState()

      // For COLOR 10, 10, 2:
      // areaX = Math.floor(10 / 2) * 2 = 10
      // areaY = 10
      // Top row: y = 10 - 1 = 9
      // So the area is: (10, 9), (11, 9), (10, 10), (11, 10)
      expect(screenState.buffer[9]?.[10]?.colorPattern).toBe(2)
      expect(screenState.buffer[9]?.[11]?.colorPattern).toBe(2)
      expect(screenState.buffer[10]?.[10]?.colorPattern).toBe(2)
      expect(screenState.buffer[10]?.[11]?.colorPattern).toBe(2)
    })
  })
})
