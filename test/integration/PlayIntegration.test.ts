/**
 * PLAY Integration Tests
 *
 * Full integration tests for PLAY command from parsing through execution.
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

describe('PLAY Integration', () => {
  let interpreter: BasicInterpreter
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    deviceAdapter = new TestDeviceAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      enableDebugMode: false,
      strictMode: false,
      suppressOkPrompt: true,
      deviceAdapter: deviceAdapter,
    })
  })

  it('should handle full parse → execute → device flow', async () => {
    const code = `
10 PLAY "CRDRE"
20 END
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'D', 'E'])
  })

  it('should handle PLAY with variable assignment', async () => {
    const code = `
10 A$ = "C:E:G"
20 PLAY A$
30 END
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'E', 'G'])
  })

  it('should handle multiple PLAY calls to verify state persistence', async () => {
    const code = `
10 PLAY "T4O3C"
20 PLAY "D"
30 PLAY "E"
40 END
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(3)
    // First call has tempo and octave commands plus C note
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[1]!)).toEqual(['D'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[2]!)).toEqual(['E'])
    // State (T4, O3) should persist across calls in Platform layer
  })

  it('should handle PLAY in program with mixed commands', async () => {
    const code = `
10 PRINT "Starting music"
20 PLAY "CDEFG"
30 PRINT "Music playing"
40 PLAY "GFEDC"
50 PRINT "Done"
60 END
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(2)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'D', 'E', 'F', 'G'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[1]!)).toEqual(['G', 'F', 'E', 'D', 'C'])
    expect(deviceAdapter.printOutputs).toEqual([
      'Starting music\n',
      'Music playing\n',
      'Done\n',
    ])
  })

  it('should handle PLAY with complex multi-channel music', async () => {
    const code = `
10 PLAY "C:E:G"
20 END
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    // C:E:G creates 3 channels with one note each
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'E', 'G'])
  })

  it('should handle PLAY with all music parameters', async () => {
    const code = `
10 PLAY "T4Y2M0V15O3C5R5D5R5E5"
20 END
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'D', 'E'])
  })

  it('should handle PLAY in conditional branches', async () => {
    const code = `
10 LET X = 1
20 IF X = 1 THEN PLAY "C"
30 IF X = 2 THEN PLAY "D"
40 END
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C'])
  })

  it('should handle PLAY in loops with dynamic music', async () => {
    const code = `
10 FOR I = 1 TO 3
20 A$ = "C"
30 PLAY A$
40 NEXT
50 END
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(3)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[1]!)).toEqual(['C'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[2]!)).toEqual(['C'])
  })

  it('should handle PLAY with GOSUB subroutine', async () => {
    const code = `
10 GOSUB 100
20 END
100 PLAY "CDEFG"
110 RETURN
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'D', 'E', 'F', 'G'])
  })

  it('should handle error when PLAY receives non-string', async () => {
    const code = `
10 PLAY 123
20 END
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]?.message).toContain('Expected string')
    expect(deviceAdapter.playSoundCalls).toEqual([])
  })

  it('should handle PLAY with string from DATA/READ', async () => {
    const code = `
10 READ A$
20 PLAY A$
30 DATA "CDEFG"
40 END
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(1)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C', 'D', 'E', 'F', 'G'])
  })

  it('should handle PLAY with multiple colons on same line', async () => {
    const code = `
10 PLAY "C": PLAY "D": PLAY "E"
20 END
`

    const result = await interpreter.execute(code)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(deviceAdapter.playSoundCalls.length).toBe(3)
    expect(extractNoteNames(deviceAdapter.playSoundCalls[0]!)).toEqual(['C'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[1]!)).toEqual(['D'])
    expect(extractNoteNames(deviceAdapter.playSoundCalls[2]!)).toEqual(['E'])
  })
})
