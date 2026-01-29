/**
 * CUT Executor Tests
 *
 * Unit tests for the CutExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('CutExecutor', () => {
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
    const stopCmd = deviceAdapter.animationCommandCalls.find(c => c.type === 'STOP_MOVEMENT')
    expect(stopCmd).toBeDefined()
    if (stopCmd && stopCmd.type === 'STOP_MOVEMENT') {
      expect(stopCmd.actionNumbers).toContain(0)
    }
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

    const stopCmd = deviceAdapter.animationCommandCalls.find(c => c.type === 'STOP_MOVEMENT')
    expect(stopCmd).toBeDefined()
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
    const startCalls = deviceAdapter.animationCommandCalls.filter(c => c.type === 'START_MOVEMENT')
    expect(startCalls.length).toBe(2)
  })

  it('should handle CUT on inactive movement (no-op)', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 CUT 0
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const stopCmd = deviceAdapter.animationCommandCalls.find(c => c.type === 'STOP_MOVEMENT')
    expect(stopCmd).toBeDefined()
    if (stopCmd && stopCmd.type === 'STOP_MOVEMENT') {
      expect(stopCmd.actionNumbers).toContain(0)
    }
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
    const stopCmd = deviceAdapter.animationCommandCalls.find(c => c.type === 'STOP_MOVEMENT')
    expect(stopCmd).toBeDefined()
    if (stopCmd && stopCmd.type === 'STOP_MOVEMENT') {
      expect(stopCmd.actionNumbers).toContain(0)
      expect(stopCmd.actionNumbers).toContain(1)
    }
  })
})
