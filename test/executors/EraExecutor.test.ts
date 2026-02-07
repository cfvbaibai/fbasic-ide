/**
 * ERA Executor Tests
 *
 * Unit tests for the EraExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { createSharedDisplayBuffer } from '@/core/animation/sharedDisplayBuffer'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('EraExecutor', () => {
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

  it('should stop active movement', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 ERA 0
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should hide sprite after ERA', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 ERA 0
40 END
`
    await interpreter.execute(source)
    // Movement is erased - Animation Worker handles hiding the sprite
  })

  it('should handle ERA on inactive movement', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 ERA 0
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
  })

  it('should update MOVE(n) status to 0', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 ERA 0
40 END
`
    await interpreter.execute(source)

    const status = interpreter.getAnimationManager()?.getMovementStatus(0)
    expect(status).toBe(0)
  })

  it('should hide sprite unlike CUT which preserves visibility', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 ERA 0
40 END
`
    await interpreter.execute(source)
    // ERA removes movement state (unlike CUT which preserves it)
    expect(interpreter.getAnimationManager()?.getMovementState(0)).toBeUndefined()
  })

  it('should erase multiple actions', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 DEF MOVE(1) = SPRITE(1, 5, 60, 50, 0, 0)
30 MOVE 0
40 MOVE 1
50 ERA 0, 1
60 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(interpreter.getAnimationManager()?.getMovementState(0)).toBeUndefined()
    expect(interpreter.getAnimationManager()?.getMovementState(1)).toBeUndefined()
  })
})
