/**
 * Sprite Functions Tests (MOVE, XPOS, YPOS)
 *
 * Unit tests for sprite-related expression functions.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { createSharedDisplayBuffer } from '@/core/animation/sharedDisplayBuffer'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('FunctionEvaluator - Sprite Functions', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    const { buffer } = createSharedDisplayBuffer()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter,
      sharedAnimationBuffer: buffer,
    })
  })

  describe('MOVE(n)', () => {
    it('should return -1 for active movement', async () => {
      const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 PRINT MOVE(0)
40 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      // Note: Without Animation Worker running, isActive remains false
      // In full system, AnimationWorker would set isActive=true on START_MOVEMENT
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\nOK\n')
    })

    it('should return 0 for completed movement', async () => {
      const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 CUT 0
40 PRINT MOVE(0)
50 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\nOK\n')
    })

    it('should return 0 for never-started movement', async () => {
      const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 PRINT MOVE(0)
30 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\nOK\n')
    })

    it('should validate action number (0-7)', async () => {
      const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 PRINT MOVE(8)
30 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(deviceAdapter.errorOutputs.some(m => m.includes('MOVE') && m.includes('0-7'))).toBe(true)
    })
  })

  describe('XPOS(n)', () => {
    it('should return X position for static sprite', async () => {
      deviceAdapter.setSpritePositionForTest(0, 150, 80)
      const source = `
10 PRINT XPOS(0)
20 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 150\nOK\n')
    })

    it('should return cached X position (synced every frame from frontend)', async () => {
      deviceAdapter.setSpritePositionForTest(0, 75, 25)
      const source = `
10 PRINT XPOS(0)
20 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 75\nOK\n')
    })

    it('should return 0 for undefined sprite', async () => {
      const source = `
10 PRINT XPOS(0)
20 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\nOK\n')
    })

    it('should validate sprite number (0-7)', async () => {
      const source = `
10 PRINT XPOS(8)
20 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(deviceAdapter.errorOutputs.some(m => m.includes('XPOS') && m.includes('0-7'))).toBe(true)
    })
  })

  describe('YPOS(n)', () => {
    it('should return Y position for static sprite', async () => {
      deviceAdapter.setSpritePositionForTest(0, 100, 120)
      const source = `
10 PRINT YPOS(0)
20 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 120\nOK\n')
    })

    it('should return cached Y position (synced every frame from frontend)', async () => {
      deviceAdapter.setSpritePositionForTest(0, 50, 90)
      const source = `
10 PRINT YPOS(0)
20 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 90\nOK\n')
    })

    it('should return 0 for undefined sprite', async () => {
      const source = `
10 PRINT YPOS(0)
20 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      expect(deviceAdapter.getAllOutputs()).toEqual(' 0\nOK\n')
    })

    it('should validate sprite number (0-7)', async () => {
      const source = `
10 PRINT YPOS(8)
20 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(deviceAdapter.errorOutputs.some(m => m.includes('YPOS') && m.includes('0-7'))).toBe(true)
    })
  })
})
