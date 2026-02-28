/**
 * PLAY Executor Tests
 *
 * Unit tests for the PlayExecutor class execution behavior.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { BasicInterpreter } from '@/core/BasicInterpreter'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'

/**
 * Helper to extract note names from a MusicScore for simple assertion
 */
function extractNoteNames(score: { channels: Array<Array<{ type: string; note?: string }>> }): string[] {
  const notes: string[] = []
  for (const channel of score.channels) {
    for (const event of channel) {
      if (event.type === 'note' && event.note) {
        notes.push(event.note)
      }
    }
  }
  return notes
}

describe('PlayExecutor', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      deviceAdapter: deviceAdapter,
    })
  })

  it('should execute PLAY with string literal', async () => {
    const source = `
10 PLAY "CRDRE"
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'D', 'E'])
  })

  it('should execute PLAY with complex music string', async () => {
    const source = `
10 PLAY "T4Y2M0V15O3C5R5D5R5E5"
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'D', 'E'])
  })

  it('should execute PLAY with multi-channel music', async () => {
    const source = `
10 PLAY "C:E:G"
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'E', 'G'])
  })

  it('should execute PLAY with string variable', async () => {
    const source = `
10 A$ = "CDEFG"
20 PLAY A$
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'D', 'E', 'F', 'G'])
  })

  it('should handle PLAY with empty string', async () => {
    const source = `
10 PLAY ""
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual([])
  })

  it('should error for non-string expression', async () => {
    const source = `
10 PLAY 123
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]?.message).toContain('Expected string')
  })

  it('should handle PLAY with string concatenation', async () => {
    const source = `
10 A$ = "C"
20 B$ = "D"
30 PLAY A$ + B$ + "E"
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'D', 'E'])
  })

  it('should handle multiple PLAY commands', async () => {
    const source = `
10 PLAY "C"
20 PLAY "D"
30 PLAY "E"
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(3)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[1]!)).toEqual(['D'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[2]!)).toEqual(['E'])
  })

  it('should handle PLAY on same line as other commands', async () => {
    const source = `
10 PRINT "Before": PLAY "C": PRINT "After"
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C'])
  })

  it('should handle PLAY in a loop', async () => {
    const source = `
10 FOR I = 1 TO 3
20 PLAY "C"
30 NEXT
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(3)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[1]!)).toEqual(['C'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[2]!)).toEqual(['C'])
  })

  it('should handle PLAY with conditional execution', async () => {
    const source = `
10 LET X = 1
20 IF X = 1 THEN PLAY "C"
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C'])
  })

  it('should not execute PLAY when condition is false', async () => {
    const source = `
10 LET X = 0
20 IF X = 1 THEN PLAY "C"
30 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls).toEqual([])
  })

  it('should handle PLAY with octave and tempo commands', async () => {
    const source = `
10 PLAY "T4O3C"
20 PLAY "D"
30 PLAY "E"
40 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(3)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[1]!)).toEqual(['D'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[2]!)).toEqual(['E'])
  })

  it('should handle PLAY with rest command', async () => {
    const source = `
10 PLAY "CR5D"
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'D'])
  })

  it('should handle PLAY with volume and waveform commands', async () => {
    const source = `
10 PLAY "V15Y2C"
20 END
`
    const result = await interpreter.execute(source)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C'])
  })
})
