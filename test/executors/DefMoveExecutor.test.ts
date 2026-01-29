/**
 * DEF MOVE Executor Tests
 *
 * Unit tests for the DefMoveExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('DefMoveExecutor', () => {
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

  it('should define movement with valid parameters', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const states = interpreter.getMovementStates()
    expect(states).toBeDefined()
    expect(states.length).toBeGreaterThanOrEqual(0)
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def).toBeDefined()
    expect(def?.actionNumber).toBe(0)
    expect(def?.characterType).toBe(0)
    expect(def?.direction).toBe(3)
    expect(def?.speed).toBe(60)
    expect(def?.distance).toBe(100)
    expect(def?.priority).toBe(0)
    expect(def?.colorCombination).toBe(0)
  })

  it('should reject invalid action number (not 0-7)', async () => {
    const source = `
10 DEF MOVE(8) = SPRITE(0, 3, 60, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('action number') && m.includes('0-7'))).toBe(true)
  })

  it('should validate character type (0-15)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(16, 3, 60, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('character type'))).toBe(true)
  })

  it('should validate direction (0-8)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 9, 60, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('direction'))).toBe(true)
  })

  it('should validate speed (1-255)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 0, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('speed'))).toBe(true)
  })

  it('should validate distance (1-255)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 0, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('distance'))).toBe(true)
  })

  it('should validate priority (0-1)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 2, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('priority'))).toBe(true)
  })

  it('should validate color combination (0-3)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 0, 5)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('color combination'))).toBe(true)
  })

  it('should store definition in AnimationManager', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(1, 5, 30, 50, 1, 2)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def).toBeDefined()
    expect(def?.characterType).toBe(1)
    expect(def?.direction).toBe(5)
    expect(def?.speed).toBe(30)
    expect(def?.distance).toBe(50)
    expect(def?.priority).toBe(1)
    expect(def?.colorCombination).toBe(2)
  })

  it('should handle speed=1 (slowest: 60 dots/second)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 1, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def?.speed).toBe(1)
  })

  it('should handle speed=255 (fastest: 0.235 dots/second)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 255, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def?.speed).toBe(255)
  })

  it('should handle distance=1 (2 dots total)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 1, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def?.distance).toBe(1)
  })

  it('should handle distance=255 (510 dots total)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 255, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def?.distance).toBe(255)
  })
})
