/**
 * SPRITE Executor Tests
 *
 * Unit tests for the SpriteExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('SpriteExecutor', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter,
    })
  })

  it('should display sprite at valid position', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 0, 0) = CHR$(240)
20 SPRITE 0, 100, 50
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const states = interpreter.getSpriteStates()
    const s0 = states.find(s => s.spriteNumber === 0)
    expect(s0?.visible).toBe(true)
    expect(s0?.x).toBe(100)
    expect(s0?.y).toBe(50)
  })

  it('should reject invalid sprite number (not 0-7)', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 0, 0) = CHR$(240)
20 SPRITE 8, 100, 50
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('Sprite number') && m.includes('0-7'))).toBe(true)
  })

  it('should clamp X coordinate to 0-255', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 0, 0) = CHR$(240)
20 SPRITE 0, 300, 50
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('X') && m.includes('0-255'))).toBe(true)
  })

  it('should clamp Y coordinate to 0-239', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 0, 0) = CHR$(240)
20 SPRITE 0, 100, 300
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('Y') && m.includes('0-239'))).toBe(true)
  })

  it('should mark sprite as visible', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 0, 0) = CHR$(240)
20 SPRITE 0, 50, 50
30 END
`
    await interpreter.execute(source)

    const states = interpreter.getSpriteStates()
    const s0 = states.find(s => s.spriteNumber === 0)
    expect(s0?.visible).toBe(true)
  })

  it('should require defined sprite before display', async () => {
    const source = `
10 SPRITE 0, 100, 50
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('no definition') || m.includes('DEF SPRITE'))).toBe(true)
  })

  it('should handle negative coordinates', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 0, 0) = CHR$(240)
20 SPRITE 0, -10, 50
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should accept coordinates at bounds (0,0) and (255,239)', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 0, 0) = CHR$(240)
20 SPRITE 0, 0, 0
30 SPRITE 0, 255, 239
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const states = interpreter.getSpriteStates()
    const s0 = states.find(s => s.spriteNumber === 0)
    expect(s0?.x).toBe(255)
    expect(s0?.y).toBe(239)
  })
})
