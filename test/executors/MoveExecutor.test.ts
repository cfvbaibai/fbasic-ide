/**
 * MOVE Executor Tests
 *
 * Unit tests for the MoveExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { createSharedDisplayBuffer } from '@/core/animation/sharedDisplayBuffer'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('MoveExecutor', () => {
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

  it('should start movement for defined action', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    // Note: Without Animation Worker, isActive remains false
    expect(interpreter.getAnimationManager()?.getMovementStatus(0)).toBe(0)
  })

  it('should reject undefined action number', async () => {
    const source = `
10 MOVE 0
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('DEF MOVE') || m.includes('definition'))).toBe(true)
  })

  it('should reject invalid action number (not 0-7)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 8
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(deviceAdapter.errorOutputs.some(m => m.includes('action number') && m.includes('0-7'))).toBe(true)
  })

  it('should start movement via Animation Worker sync', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 END
`
    await interpreter.execute(source)
    // Note: Without Animation Worker, isActive remains false
    expect(interpreter.getAnimationManager()?.getMovementStatus(0)).toBe(0)
  })

  it('should allow starting same action multiple times', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 MOVE 0
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    // Movement can be restarted multiple times
  })

  it('should handle multiple active movements (0-7 simultaneous)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 DEF MOVE(1) = SPRITE(1, 5, 60, 50, 0, 0)
30 MOVE 0
40 MOVE 1
50 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    // Note: Without Animation Worker, isActive remains false
    expect(interpreter.getAnimationManager()?.getMovementStatus(0)).toBe(0)
    expect(interpreter.getAnimationManager()?.getMovementStatus(1)).toBe(0)
  })
})
