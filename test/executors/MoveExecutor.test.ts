/**
 * MOVE Executor Tests
 *
 * Unit tests for the MoveExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('MoveExecutor', () => {
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

  it('should start movement for defined action', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.animationCommandCalls.length).toBeGreaterThan(0)
    const startCmd = deviceAdapter.animationCommandCalls.find(c => c.type === 'START_MOVEMENT')
    expect(startCmd).toBeDefined()
    expect(startCmd?.type).toBe('START_MOVEMENT')
    if (startCmd?.type === 'START_MOVEMENT') {
      expect(startCmd.actionNumber).toBe(0)
      expect(startCmd.definition).toBeDefined()
      expect(startCmd.startX).toBeDefined()
      expect(startCmd.startY).toBeDefined()
    }
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

  it('should send START_MOVEMENT message to frontend', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 END
`
    await interpreter.execute(source)

    const startCalls = deviceAdapter.animationCommandCalls.filter(c => c.type === 'START_MOVEMENT')
    expect(startCalls).toHaveLength(1)
    expect(startCalls[0]).toBeDefined()
    expect(startCalls[0]!.type).toBe('START_MOVEMENT')
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
    const startCalls = deviceAdapter.animationCommandCalls.filter(c => c.type === 'START_MOVEMENT')
    expect(startCalls.length).toBeGreaterThanOrEqual(2)
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
    const startCalls = deviceAdapter.animationCommandCalls.filter(c => c.type === 'START_MOVEMENT')
    expect(startCalls).toHaveLength(2)
    const actionNumbers = startCalls
      .filter((c): c is typeof c & { type: 'START_MOVEMENT' } => c.type === 'START_MOVEMENT')
      .map(c => c.actionNumber)
    expect(actionNumbers).toContain(0)
    expect(actionNumbers).toContain(1)
  })
})
