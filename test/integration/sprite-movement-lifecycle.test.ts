/**
 * Sprite Movement Lifecycle Integration Tests (Layer 2)
 *
 * Tests worker-frontend communication for sprite movement:
 * DEF MOVE → MOVE → simulate completion → MOVE(n)=0, XPOS/YPOS updated.
 * CUT/ERA with position sync, POSITION command.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'

import { MockDeviceAdapter } from '../mocks/MockDeviceAdapter'

describe('Sprite Movement Lifecycle', () => {
  let interpreter: BasicInterpreter
  let mockAdapter: MockDeviceAdapter

  beforeEach(() => {
    mockAdapter = new MockDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter: mockAdapter,
    })
  })

  /**
   * Evaluate a numeric expression by running PRINT <expr> and parsing output.
   * Clears adapter output first so we read only the value just printed.
   */
  async function evaluate(expr: string): Promise<number> {
    mockAdapter.clearOutputs()
    const source = `
10 PRINT ${expr}
20 END
`
    const result = await interpreter.execute(source)
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    const out = mockAdapter.getAllOutputs().trim()
    const num = parseFloat(out)
    if (Number.isNaN(num)) {
      throw new Error(`evaluate("${expr}") produced non-numeric output: "${out}"`)
    }
    return num
  }

  async function execute(code: string) {
    const result = await interpreter.execute(code)
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    return result
  }

  it('should complete full movement lifecycle', async () => {
    await execute(`
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 0, 0)
20 MOVE 0
30 END
`)
    expect(mockAdapter.getStartMovementCalls()).toHaveLength(1)
    expect(mockAdapter.lastMessage.type).toBe('START_MOVEMENT')

    mockAdapter.simulateMovementComplete(0, { x: 150, y: 50 })
    await execute('10 CUT 0\n20 END')

    expect(await evaluate('MOVE(0)')).toBe(0)
    expect(await evaluate('XPOS(0)')).toBe(150)
    expect(await evaluate('YPOS(0)')).toBe(50)
  })

  it('should handle CUT with position sync', async () => {
    await execute(`
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 0, 0)
20 MOVE 0
30 END
`)
    mockAdapter.simulatePositionUpdate(0, { x: 75, y: 25 })
    await execute('10 CUT 0\n20 END')

    expect(await evaluate('XPOS(0)')).toBe(75)
    expect(await evaluate('YPOS(0)')).toBe(25)
    expect(await evaluate('MOVE(0)')).toBe(0)
  })

  it('should handle ERA with position sync', async () => {
    await execute(`
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 0, 0)
20 MOVE 0
30 END
`)
    mockAdapter.simulatePositionUpdate(0, { x: 75, y: 25 })
    await execute('10 ERA 0\n20 END')

    const anim = interpreter.getAnimationManager()
    expect(anim).not.toBeNull()
    expect(anim!.getMovementStatus(0)).toBe(0)
    expect(await evaluate('XPOS(0)')).toBe(75)
    expect(await evaluate('YPOS(0)')).toBe(25)
  })

  it('should handle POSITION command', async () => {
    await execute(`
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 0, 0)
20 POSITION 0, 100, 50
30 END
`)
    expect(mockAdapter.lastMessage.type).toBe('SET_POSITION')
    const msg = mockAdapter.lastMessage
    if (msg.type === 'SET_POSITION') {
      expect(msg.actionNumber).toBe(0)
      expect(msg.x).toBe(100)
      expect(msg.y).toBe(50)
    }
  })
})
