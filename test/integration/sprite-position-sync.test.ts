/**
 * Sprite Position Synchronization Integration Tests (Layer 2)
 *
 * Tests that CUT/ERA sync position (XPOS/YPOS) and that next MOVE starts from CUT position.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'

import { MockDeviceAdapter } from '../mocks/MockDeviceAdapter'

describe('Sprite Position Synchronization', () => {
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

  it('should sync position on CUT', async () => {
    await execute(`
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 0, 0)
20 MOVE 0
30 END
`)
    mockAdapter.simulateAnimationFrame({
      actionNumber: 0,
      currentX: 50,
      currentY: 25,
      remainingDistance: 100,
    })
    await execute('10 CUT 0\n20 END')

    expect(await evaluate('XPOS(0)')).toBe(50)
    expect(await evaluate('YPOS(0)')).toBe(25)
  })

  it('should sync position on ERA', async () => {
    await execute(`
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 0, 0)
20 MOVE 0
30 END
`)
    mockAdapter.simulateAnimationFrame({
      actionNumber: 0,
      currentX: 75,
      currentY: 35,
    })
    await execute('10 ERA 0\n20 END')

    expect(await evaluate('XPOS(0)')).toBe(75)
    expect(await evaluate('YPOS(0)')).toBe(35)
  })

  it('should use last position for next MOVE', async () => {
    // Set position so after first MOVE and CUT, second MOVE gets this start position from device.
    mockAdapter.simulatePositionUpdate(0, { x: 50, y: 25 })
    const result = await interpreter.execute(`
10 DEF MOVE(0) = SPRITE(0, 3, 60, 100, 0, 0)
20 MOVE 0
30 CUT 0
40 MOVE 0
50 END
`)
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)

    const startCalls = mockAdapter.getStartMovementCalls()
    expect(startCalls.length).toBe(2)
    const lastStart = startCalls[1]
    expect(lastStart).toBeDefined()
    expect(lastStart?.type).toBe('START_MOVEMENT')
    if (lastStart?.type === 'START_MOVEMENT') {
      expect(lastStart.startX).toBe(50)
      expect(lastStart.startY).toBe(25)
    }
  })
})
