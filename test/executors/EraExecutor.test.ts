/**
 * ERA Executor Tests
 *
 * Unit tests for the EraExecutor class.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

describe('EraExecutor', () => {
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
30 ERA 0
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const eraseCmd = deviceAdapter.animationCommandCalls.find(c => c.type === 'ERASE_MOVEMENT')
    expect(eraseCmd).toBeDefined()
    if (eraseCmd && eraseCmd.type === 'ERASE_MOVEMENT') {
      expect(eraseCmd.actionNumbers).toContain(0)
    }
  })

  it('should hide sprite after ERA', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 ERA 0
40 END
`
    await interpreter.execute(source)

    const eraseCmd = deviceAdapter.animationCommandCalls.find(c => c.type === 'ERASE_MOVEMENT')
    expect(eraseCmd).toBeDefined()
  })

  it('should trigger position sync from frontend', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 MOVE 0
30 ERA 0
40 END
`
    await interpreter.execute(source)

    expect(deviceAdapter.animationCommandCalls.some(c => c.type === 'ERASE_MOVEMENT')).toBe(true)
  })

  it('should handle ERA on inactive movement', async () => {
    const source = `
10 DEF MOVE(0) = SPRITE(0, 3, 60, 50, 0, 0)
20 ERA 0
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    const eraseCmd = deviceAdapter.animationCommandCalls.find(c => c.type === 'ERASE_MOVEMENT')
    expect(eraseCmd).toBeDefined()
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

    const eraseCalls = deviceAdapter.animationCommandCalls.filter(c => c.type === 'ERASE_MOVEMENT')
    expect(eraseCalls).toHaveLength(1)
    const stopCalls = deviceAdapter.animationCommandCalls.filter(c => c.type === 'STOP_MOVEMENT')
    expect(eraseCalls[0]).toBeDefined()
    expect(eraseCalls[0]!.type).toBe('ERASE_MOVEMENT')
    expect(stopCalls.length).toBe(0)
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
    const eraseCmd = deviceAdapter.animationCommandCalls.find(c => c.type === 'ERASE_MOVEMENT')
    expect(eraseCmd).toBeDefined()
    if (eraseCmd && eraseCmd.type === 'ERASE_MOVEMENT') {
      expect(eraseCmd.actionNumbers).toContain(0)
      expect(eraseCmd.actionNumbers).toContain(1)
    }
  })
})
