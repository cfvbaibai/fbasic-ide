/**
 * DEF SPRITE Executor Tests
 *
 * Unit tests for the DefSpriteExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('DefSpriteExecutor', () => {
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

  it('should define sprite with valid parameters', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 0, 0) = CHR$(240)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const states = interpreter.getSpriteStates()
    expect(states).toBeDefined()
    expect(states.length).toBeGreaterThan(0)
    const s0 = states.find(s => s.spriteNumber === 0)
    expect(s0?.definition).toBeDefined()
    expect(s0?.definition?.spriteNumber).toBe(0)
    expect(s0?.definition?.colorCombination).toBe(0)
    expect(s0?.definition?.size).toBe(0)
    expect(s0?.definition?.priority).toBe(0)
    expect(s0?.definition?.invertX).toBe(0)
    expect(s0?.definition?.invertY).toBe(0)
  })

  it('should handle invalid sprite number', async () => {
    const source = `
10 DEF SPRITE 8, (0, 0, 0, 0, 0) = CHR$(240)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('Sprite number') && m.includes('0-7'))).toBe(true)
  })

  it('should validate color combination', async () => {
    const source = `
10 DEF SPRITE 0, (5, 0, 0, 0, 0) = CHR$(240)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('color combination'))).toBe(true)
  })

  it('should validate size parameter', async () => {
    const source = `
10 DEF SPRITE 0, (0, 2, 0, 0, 0) = CHR$(240)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('size'))).toBe(true)
  })

  it('should parse string literals in character set', async () => {
    const source = `
10 DEF SPRITE 0, (0, 1, 0, 0, 0) = CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const states = interpreter.getSpriteStates()
    const s0 = states.find(s => s.spriteNumber === 0)
    expect(s0?.definition).toBeDefined()
  })

  it('should validate character set length (1 or 4 tiles)', async () => {
    // 1 tile is valid
    const source1 = `
10 DEF SPRITE 0, (0, 0, 0, 0, 0) = CHR$(240)
20 END
`
    const result1 = await interpreter.execute(source1)
    expect(result1.success).toBe(true)

    // 4 tiles is valid for 16x16
    const source2 = `
10 DEF SPRITE 0, (0, 1, 0, 0, 0) = CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
20 END
`
    const result2 = await interpreter.execute(source2)
    expect(result2.success).toBe(true)
  })

  it('should reject invalid priority values', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 2, 0, 0) = CHR$(240)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('priority'))).toBe(true)
  })

  it('should reject invalid inversion flags', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 2, 0) = CHR$(240)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('invert'))).toBe(true)
  })

  it('should store definition with X-inversion', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 1, 0) = CHR$(240)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const states = interpreter.getSpriteStates()
    const s0 = states.find(s => s.spriteNumber === 0)
    expect(s0?.definition?.invertX).toBe(1)
    expect(s0?.definition?.invertY).toBe(0)
  })

  it('should store definition with Y-inversion', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 0, 1) = CHR$(240)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const states = interpreter.getSpriteStates()
    const s0 = states.find(s => s.spriteNumber === 0)
    expect(s0?.definition?.invertY).toBe(1)
  })

  it('should store definition with XY-inversion', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 1, 1) = CHR$(240)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const states = interpreter.getSpriteStates()
    const s0 = states.find(s => s.spriteNumber === 0)
    expect(s0?.definition?.invertX).toBe(1)
    expect(s0?.definition?.invertY).toBe(1)
  })
})
