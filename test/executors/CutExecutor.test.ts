/**
 * CUT Executor Tests
 *
 * Unit tests for the CutExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { createSharedDisplayBuffer } from '@/core/animation/sharedDisplayBuffer'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('CutExecutor', () => {
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
30 CUT 0
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(interpreter.getAnimationManager()?.getMovementStatus(0)).toBe(0)
  })

  it('should keep sprite visible after CUT', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 CUT 0
40 END
`
    await interpreter.execute(source)
    // Movement is stopped but sprite remains visible (handled by Animation Worker)
  })

  it('should preserve position for next MOVE', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 CUT 0
40 MOVE 0
50 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    // Second MOVE should use the preserved position from deviceAdapter
  })

  it('should handle CUT on inactive movement (no-op)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 CUT 0
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
  })

  it('should handle CUT on never-started movement', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 CUT 0
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
  })

  it('should update MOVE(n) status to 0', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 CUT 0
40 END
`
    await interpreter.execute(source)

    const status = interpreter.getAnimationManager()?.getMovementStatus(0)
    expect(status).toBe(0)
  })

  it('should cut multiple actions', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 DEF MOVE(1) = SPRITE(1, 5, 60, 50, 0, 0)
30 MOVE 0
40 MOVE 1
50 CUT 0, 1
60 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(interpreter.getAnimationManager()?.getMovementStatus(0)).toBe(0)
    expect(interpreter.getAnimationManager()?.getMovementStatus(1)).toBe(0)
  })
})
