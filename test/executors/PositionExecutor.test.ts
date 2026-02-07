/**
 * POSITION Executor Tests
 *
 * Unit tests for the PositionExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { createSharedDisplayBuffer } from '@/core/animation/sharedDisplayBuffer'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('PositionExecutor', () => {
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

  it('should set position for animated sprite', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 POSITION 0, 100, 50
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    // Position is stored via setSpritePosition for MOVE command to use
    const storedPos = deviceAdapter.getSpritePosition(0)
    expect(storedPos).toEqual({ x: 100, y: 50 })
  })

  it('should validate action number (0-7)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 POSITION 8, 100, 50
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('action number') && m.includes('0-7'))).toBe(true)
  })

  it('should clamp X coordinate to 0-255', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 POSITION 0, 300, 50
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('X') && m.includes('0-255'))).toBe(true)
  })

  it('should validate Y coordinate to 0-255 (per F-BASIC manual)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 POSITION 0, 100, 300
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('Y') && m.includes('0-255'))).toBe(true)
  })

  it('should send POSITION command to frontend', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 POSITION 0, 100, 50
30 END
`
    await interpreter.execute(source)

    // Position is stored via setSpritePosition for MOVE command to use
    const storedPos = deviceAdapter.getSpritePosition(0)
    expect(storedPos).toEqual({ x: 100, y: 50 })
  })

  it('should work on both active and inactive movements', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 POSITION 0, 50, 50
30 MOVE 0
40 POSITION 0, 75, 75
50 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    // Both POSITION commands should have stored position (last one wins)
    const storedPos = deviceAdapter.getSpritePosition(0)
    expect(storedPos).toEqual({ x: 75, y: 75 })
  })

  it('should handle negative coordinates', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 POSITION 0, -10, 50
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should handle coordinates beyond bounds', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 POSITION 0, 256, 240
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
