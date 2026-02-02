/**
 * POSITION Executor Tests
 *
 * Unit tests for the PositionExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('PositionExecutor', () => {
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

  it('should set position for animated sprite', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 POSITION 0, 100, 50
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const posCmd = deviceAdapter.animationCommandCalls.find(c => c.type === 'SET_POSITION')
    expect(posCmd).toBeDefined()
    if (posCmd?.type === 'SET_POSITION') {
      expect(posCmd.actionNumber).toBe(0)
      expect(posCmd.x).toBe(100)
      expect(posCmd.y).toBe(50)
    }
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

    const posCalls = deviceAdapter.animationCommandCalls.filter(c => c.type === 'SET_POSITION')
    expect(posCalls).toHaveLength(1)
    const pos0 = posCalls[0]
    expect(pos0).toBeDefined()
    if (pos0?.type === 'SET_POSITION') {
      expect(pos0.actionNumber).toBe(0)
      expect(pos0.x).toBe(100)
      expect(pos0.y).toBe(50)
    }
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
    const posCalls = deviceAdapter.animationCommandCalls.filter(c => c.type === 'SET_POSITION')
    expect(posCalls.length).toBe(2)
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
