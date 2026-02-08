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

  it('should validate speed (0-255)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 256, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('speed'))).toBe(true)
  })

  it('should accept speed=0 (every 256 frames, 60/256 dots/sec per manual)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 0, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def?.speed).toBe(0)
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

  describe('RND function in DEF MOVE', () => {
    it('should evaluate RND function in SPRITE arguments', async () => {
      const source = `
10 DEF MOVE(0) = SPRITE(RND(16), RND(9), 5, 50, 0, 0)
20 END
`
      const result = await interpreter.execute(source)

      expect(result.success).toBe(true)
      const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
      expect(def).toBeDefined()
      // Character type should be between 0 and 15 (RND(16) returns 0-15)
      expect(def?.characterType).toBeGreaterThanOrEqual(0)
      expect(def?.characterType).toBeLessThanOrEqual(15)
      // Direction should be between 0 and 8 (RND(9) returns 0-8)
      expect(def?.direction).toBeGreaterThanOrEqual(0)
      expect(def?.direction).toBeLessThanOrEqual(8)
    })

    it('should evaluate RND multiple times with different results', async () => {
      const source = `
10 FOR X = 0 TO 7
20 DEF MOVE(X) = SPRITE(RND(16), RND(9), 5, 50, 0, 0)
30 NEXT
40 END
`
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)

      const characterTypes: number[] = []
      const directions: number[] = []

      for (let i = 0; i < 8; i++) {
        const def = interpreter.getAnimationManager()?.getMoveDefinition(i)
        expect(def).toBeDefined()
        characterTypes.push(def?.characterType ?? -1)
        directions.push(def?.direction ?? -1)
      }

      // All character types should be valid (0-15)
      for (let i = 0; i < 8; i++) {
        expect(characterTypes[i]).toBeGreaterThanOrEqual(0)
        expect(characterTypes[i]).toBeLessThanOrEqual(15)
        expect(directions[i]).toBeGreaterThanOrEqual(0)
        expect(directions[i]).toBeLessThanOrEqual(8)
      }

      // With 8 iterations and RND(16) (16 possible values),
      // we should NOT always get the same value (all MARIO=0)
      // This is the bug: all enemies show as MARIO
      const uniqueCharacterTypes = new Set(characterTypes)
      expect(uniqueCharacterTypes.size).toBeGreaterThan(1)
    })

    it('should reproduce the shooting game bug - same subroutine called in loop', async () => {
      // This mimics the actual shooting game pattern
      const source = `
10 FOR X = 0 TO 7
20 GOSUB 1000
30 NEXT
40 END
1000 DEF MOVE(X)=SPRITE(RND(16),RND(9),5,50,0,0)
1010 RETURN
`
      const result = await interpreter.execute(source)
      expect(result.success).toBe(true)

      const characterTypes: number[] = []

      for (let i = 0; i < 8; i++) {
        const def = interpreter.getAnimationManager()?.getMoveDefinition(i)
        expect(def).toBeDefined()
        characterTypes.push(def?.characterType ?? -1)
      }

      // All character types should be valid (0-15)
      for (let i = 0; i < 8; i++) {
        expect(characterTypes[i]).toBeGreaterThanOrEqual(0)
        expect(characterTypes[i]).toBeLessThanOrEqual(15)
      }

      // BUG: All 8 enemies are MARIO (character type 0)
      // With RND(16) giving 16 possible values, we should get variety
      const uniqueCharacterTypes = new Set(characterTypes)

      // Debug: print what we got
      console.log('Character types:', characterTypes)
      console.log('Unique character types:', uniqueCharacterTypes.size)

      // This assertion will fail if the bug exists
      expect(uniqueCharacterTypes.size).toBeGreaterThan(1)
    })
  })
})
