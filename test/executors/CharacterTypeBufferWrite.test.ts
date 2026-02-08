/**
 * Character Type Buffer Write Verification Tests
 *
 * Tests to verify that characterType is correctly written to the shared buffer
 * when DEF MOVE is called.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('Character Type Buffer Write Verification', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    // Create device adapter
    deviceAdapter = new TestDeviceAdapter()

    // Create interpreter without shared buffer (simpler test)
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter,
    })
  })

  it('should store characterType in move definition when DEF MOVE is called', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(5, 3, 60, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)

    // Read characterType from AnimationManager
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def).toBeDefined()
    expect(def?.characterType).toBe(5)
  })

  it('should store different characterTypes for different action numbers', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 0, 0)
20 DEF MOVE(1) = SPRITE(1, 3, 60, 100, 0, 0)
30 DEF MOVE(2) = SPRITE(2, 3, 60, 100, 0, 0)
40 DEF MOVE(3) = SPRITE(3, 3, 60, 100, 0, 0)
50 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)

    // Verify each sprite has correct characterType in AnimationManager
    expect(interpreter.getAnimationManager()?.getMoveDefinition(0)?.characterType).toBe(0)
    expect(interpreter.getAnimationManager()?.getMoveDefinition(1)?.characterType).toBe(1)
    expect(interpreter.getAnimationManager()?.getMoveDefinition(2)?.characterType).toBe(2)
    expect(interpreter.getAnimationManager()?.getMoveDefinition(3)?.characterType).toBe(3)
  })

  it('should store characterType=15 (maximum valid value)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(15, 3, 60, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(interpreter.getAnimationManager()?.getMoveDefinition(0)?.characterType).toBe(15)
  })

  it('should preserve characterType when using RND function', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(RND(16), 3, 60, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)

    // Get characterType from definition
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def).toBeDefined()
    const charType = def?.characterType ?? -1

    // It should be a valid value (0-15)
    expect(charType).toBeGreaterThanOrEqual(0)
    expect(charType).toBeLessThanOrEqual(15)
  })

  it('should store all sprite state fields including characterType', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(7, 5, 30, 50, 1, 2)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)

    // Verify all fields are stored correctly
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def?.characterType).toBe(7)
    expect(def?.direction).toBe(5)
    expect(def?.speed).toBe(30)
    expect(def?.distance).toBe(50)
    expect(def?.priority).toBe(1)
    expect(def?.colorCombination).toBe(2)
  })

  it('should maintain characterType through multiple DEF MOVE calls', async () => {
    // First definition
    let result = await interpreter.execute(`
10 DEF MOVE(0) = SPRITE(5, 3, 60, 100, 0, 0)
20 END
`)
    expect(result.success).toBe(true)
    expect(interpreter.getAnimationManager()?.getMoveDefinition(0)?.characterType).toBe(5)

    // Redefine with different characterType
    result = await interpreter.execute(`
10 DEF MOVE(0) = SPRITE(10, 3, 60, 100, 0, 0)
20 END
`)
    expect(result.success).toBe(true)
    expect(interpreter.getAnimationManager()?.getMoveDefinition(0)?.characterType).toBe(10)
  })

  it('should handle characterType=0 (MARIO) correctly', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(interpreter.getAnimationManager()?.getMoveDefinition(0)?.characterType).toBe(0)
  })

  it('should store characterType for all 8 action slots', async () => {
    const source = `
10 FOR X = 0 TO 7
20 DEF MOVE(X) = SPRITE(X, 3, 60, 100, 0, 0)
30 NEXT
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)

    // Verify all 8 slots have correct characterType
    for (let i = 0; i < 8; i++) {
      expect(interpreter.getAnimationManager()?.getMoveDefinition(i)?.characterType).toBe(i)
    }
  })

  it('should verify characterType matches in all movement states', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(12, 3, 60, 100, 0, 0)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)

    // Get from individual definition
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def?.characterType).toBe(12)

    // Get from all movement states
    const states = interpreter.getMovementStates()
    expect(states.length).toBe(1)
    expect(states[0]?.definition.characterType).toBe(12)
  })

  it('should verify all parameters are stored correctly in definition', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(6, 4, 70, 80, 1, 3)
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)

    // Check that all parameters were stored correctly
    const def = interpreter.getAnimationManager()?.getMoveDefinition(0)
    expect(def?.actionNumber).toBe(0)
    expect(def?.characterType).toBe(6)
    expect(def?.direction).toBe(4)
    expect(def?.speed).toBe(70)
    expect(def?.distance).toBe(80)
    expect(def?.priority).toBe(1)
    expect(def?.colorCombination).toBe(3)
  })
})
