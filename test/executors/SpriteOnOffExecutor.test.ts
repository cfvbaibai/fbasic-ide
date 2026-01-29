/**
 * SPRITE ON/OFF Executor Tests
 *
 * Unit tests for the SpriteOnOffExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('SpriteOnOffExecutor', () => {
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

  it('should enable sprite display with SPRITE ON', async () => {
    const source = `
10 SPRITE ON
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(interpreter.isSpriteEnabled()).toBe(true)
  })

  it('should disable sprite display with SPRITE OFF', async () => {
    const source = `
10 SPRITE ON
20 SPRITE OFF
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(interpreter.isSpriteEnabled()).toBe(false)
  })

  it('should not affect sprite state, only visibility flag', async () => {
    const source = `
10 DEF SPRITE 0, (0, 0, 0, 0, 0) = CHR$(240)
20 SPRITE 0, 100, 50
30 SPRITE OFF
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(interpreter.isSpriteEnabled()).toBe(false)
    const states = interpreter.getSpriteStates()
    const s0 = states.find(s => s.spriteNumber === 0)
    expect(s0?.visible).toBe(true)
    expect(s0?.x).toBe(100)
    expect(s0?.y).toBe(50)
  })

  it('should allow toggling multiple times', async () => {
    const source = `
10 SPRITE ON
20 SPRITE OFF
30 SPRITE ON
40 SPRITE OFF
50 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(interpreter.isSpriteEnabled()).toBe(false)
  })
})
