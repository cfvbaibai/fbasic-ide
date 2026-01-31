/**
 * Tests for MusicDSLParser
 */

import { describe, expect, test } from 'vitest'

import {
  calculateNoteDuration,
  calculateNoteFrequency,
  lengthCodeToDuration,
  parseChannelMusic,
  parseMusic,
} from '@/core/sound/MusicDSLParser'
import { SoundStateManager } from '@/core/sound/SoundStateManager'
import { isNote, isRest } from '@/core/sound/types'

describe('calculateNoteFrequency', () => {
  test('calculates C4 (middle C) frequency', () => {
    const freq = calculateNoteFrequency('C', 4, false)
    expect(freq).toBeCloseTo(261.63, 1)
  })

  test('calculates A4 (440Hz standard)', () => {
    const freq = calculateNoteFrequency('A', 4, false)
    expect(freq).toBeCloseTo(440.0, 1)
  })

  test('calculates C#4 frequency', () => {
    const freq = calculateNoteFrequency('C', 4, true)
    expect(freq).toBeCloseTo(277.18, 1)
  })

  test('calculates different octaves', () => {
    const c0 = calculateNoteFrequency('C', 0, false)
    const c1 = calculateNoteFrequency('C', 1, false)
    const c2 = calculateNoteFrequency('C', 2, false)
    const c3 = calculateNoteFrequency('C', 3, false)

    // Each octave doubles the frequency
    expect(c1 / c0).toBeCloseTo(2, 1)
    expect(c2 / c1).toBeCloseTo(2, 1)
    expect(c3 / c2).toBeCloseTo(2, 1)
  })

  test('throws on invalid note name', () => {
    expect(() => calculateNoteFrequency('H', 4, false)).toThrow('Invalid note name: H')
  })
})

describe('calculateNoteDuration', () => {
  test('calculates whole note duration', () => {
    const duration = calculateNoteDuration(1, 4) // Whole note at tempo 4
    expect(duration).toEqual(1600)
  })

  test('calculates quarter note duration', () => {
    const duration = calculateNoteDuration(4, 4) // Quarter note at tempo 4
    expect(duration).toEqual(400)
  })

  test('calculates eighth note duration', () => {
    const duration = calculateNoteDuration(8, 4) // Eighth note at tempo 4
    expect(duration).toEqual(200)
  })

  test('different tempos affect duration', () => {
    const fast = calculateNoteDuration(4, 1) // Tempo 1 (fast)
    const slow = calculateNoteDuration(4, 8) // Tempo 8 (slow)

    expect(slow).toBeGreaterThan(fast)
  })
})

describe('lengthCodeToDuration (F-BASIC manual page 81)', () => {
  test('code 5 = quarter note at T4', () => {
    expect(lengthCodeToDuration(5, 4)).toEqual(400)
  })

  test('code 9 = whole note at T4', () => {
    expect(lengthCodeToDuration(9, 4)).toEqual(1600)
  })

  test('code 7 = half note at T4', () => {
    expect(lengthCodeToDuration(7, 4)).toEqual(800)
  })

  test('code 0 = 32nd note at T4', () => {
    expect(lengthCodeToDuration(0, 4)).toEqual(50) // 1600/32
  })

  test('default length code 5 when omitted in parser (no previous note)', () => {
    const manager = new SoundStateManager()
    const events = parseChannelMusic('O3C', manager, 0) // C with no length = quarter (default)
    expect(events).toHaveLength(1)
    if (isNote(events[0]!)) expect(events[0].duration).toEqual(400)
  })

  test('same length as previous when no digit (manual page 81)', () => {
    const manager = new SoundStateManager()
    // C5 = quarter; D and E omit length → same as previous (quarter)
    const events = parseChannelMusic('C5DE', manager, 0)
    expect(events).toHaveLength(3)
    if (isNote(events[0]!)) expect(events[0].duration).toEqual(400) // C5 quarter
    if (isNote(events[1]!)) expect(events[1].duration).toEqual(400) // D = previous
    if (isNote(events[2]!)) expect(events[2].duration).toEqual(400) // E = previous
  })

  test('same length as previous: whole then notes without length', () => {
    const manager = new SoundStateManager()
    // C9 = whole; C C omit length → both whole
    const events = parseChannelMusic('C9CC', manager, 0)
    expect(events).toHaveLength(3)
    if (isNote(events[0]!)) expect(events[0].duration).toEqual(1600)
    if (isNote(events[1]!)) expect(events[1].duration).toEqual(1600)
    if (isNote(events[2]!)) expect(events[2].duration).toEqual(1600)
  })

  test('same length as previous: rest updates last length', () => {
    const manager = new SoundStateManager()
    // C5 R7 D E — R7 sets last length to half; D and E get half
    const events = parseChannelMusic('C5R7DE', manager, 0)
    expect(events).toHaveLength(4)
    if (isNote(events[0]!)) expect(events[0].duration).toEqual(400) // C5 quarter
    if (isRest(events[1]!)) expect(events[1].duration).toEqual(800) // R7 half
    if (isNote(events[2]!)) expect(events[2].duration).toEqual(800) // D = previous (half)
    if (isNote(events[3]!)) expect(events[3].duration).toEqual(800) // E = previous (half)
  })
})

describe('parseChannelMusic', () => {
  test('parses simple note sequence', () => {
    const manager = new SoundStateManager()
    const events = parseChannelMusic('CDE', manager, 0)

    expect(events).toHaveLength(3)
    expect(isNote(events[0]!)).toBe(true)
    expect(isNote(events[1]!)).toBe(true)
    expect(isNote(events[2]!)).toBe(true)
  })

  test('parses notes with F-BASIC length codes 0-9 (manual page 81)', () => {
    const manager = new SoundStateManager()
    // C9=whole, C7=half, C5=quarter at default T4
    const events = parseChannelMusic('C9D7E5', manager, 0)

    expect(events).toHaveLength(3)
    if (isNote(events[0]!)) expect(events[0].duration).toEqual(1600) // Whole (code 9)
    if (isNote(events[1]!)) expect(events[1].duration).toEqual(800) // Half (code 7)
    if (isNote(events[2]!)) expect(events[2].duration).toEqual(400) // Quarter (code 5)
  })

  test('parses sharp notes', () => {
    const manager = new SoundStateManager()
    const events = parseChannelMusic('#C#D#F', manager, 0)

    expect(events).toHaveLength(3)
    expect(isNote(events[0]!)).toBe(true)
    expect(isNote(events[1]!)).toBe(true)
    expect(isNote(events[2]!)).toBe(true)
  })

  test('parses rests', () => {
    const manager = new SoundStateManager()
    const events = parseChannelMusic('CR5D', manager, 0)

    expect(events).toHaveLength(3)
    expect(isNote(events[0]!)).toBe(true)
    expect(isRest(events[1]!)).toBe(true)
    expect(isNote(events[2]!)).toBe(true)
  })

  test('updates tempo state', () => {
    const manager = new SoundStateManager()
    parseChannelMusic('T1C', manager, 0)

    expect(manager.getTempo()).toEqual(1)
  })

  test('updates duty state', () => {
    const manager = new SoundStateManager()
    parseChannelMusic('Y3C', manager, 0)

    expect(manager.getDuty()).toEqual(3)
  })

  test('updates envelope state', () => {
    const manager = new SoundStateManager()
    parseChannelMusic('M1C', manager, 0)

    expect(manager.getEnvelope()).toEqual(1)
  })

  test('updates volume/length state', () => {
    const manager = new SoundStateManager()
    parseChannelMusic('V10C', manager, 0)

    expect(manager.getVolumeOrLength()).toEqual(10)
  })

  test('updates octave state', () => {
    const manager = new SoundStateManager()
    parseChannelMusic('O5C', manager, 0)

    expect(manager.getOctave()).toEqual(5)
  })

  test('state persists across notes', () => {
    const manager = new SoundStateManager()
    const events = parseChannelMusic('O5CDE', manager, 0)

    // All notes should use octave 5
    expect(isNote(events[0]!) && events[0].frequency).toBeGreaterThan(500) // High octave
    expect(isNote(events[1]!) && events[1].frequency).toBeGreaterThan(500)
    expect(isNote(events[2]!) && events[2].frequency).toBeGreaterThan(500)
  })

  test('parses F-BASIC manual example: T4Y2M0V15O3C5R5D5R5E5', () => {
    const manager = new SoundStateManager()
    const events = parseChannelMusic('T4Y2M0V15O3C5R5D5R5E5', manager, 0)

    expect(manager.getTempo()).toEqual(4)
    expect(manager.getDuty()).toEqual(2)
    expect(manager.getEnvelope()).toEqual(0)
    expect(manager.getVolumeOrLength()).toEqual(15)
    expect(manager.getOctave()).toEqual(3)

    // Should have: C5, R5, D5, R5, E5
    expect(events).toHaveLength(5)
    expect(isNote(events[0]!)).toBe(true)
    expect(isRest(events[1]!)).toBe(true)
    expect(isNote(events[2]!)).toBe(true)
    expect(isRest(events[3]!)).toBe(true)
    expect(isNote(events[4]!)).toBe(true)
  })

  test('ignores whitespace', () => {
    const manager = new SoundStateManager()
    const events = parseChannelMusic('C D E', manager, 0)

    expect(events).toHaveLength(3)
  })

  test('is case-insensitive', () => {
    const manager = new SoundStateManager()
    const events = parseChannelMusic('cde', manager, 0)

    expect(events).toHaveLength(3)
    expect(isNote(events[0]!)).toBe(true)
  })

  test('assigns correct channel number', () => {
    const manager = new SoundStateManager()
    const events = parseChannelMusic('C', manager, 2)

    expect(events[0]!.channel).toEqual(2)
  })

  test('handles empty string', () => {
    const manager = new SoundStateManager()
    const events = parseChannelMusic('', manager, 0)

    expect(events).toHaveLength(0)
  })

  test('notes carry duty/envelope/volume state', () => {
    const manager = new SoundStateManager()
    const events = parseChannelMusic('T1Y3M1V8C', manager, 0)

    expect(events).toHaveLength(1)
    if (isNote(events[0]!)) {
      expect(events[0].duty).toEqual(3)
      expect(events[0].envelope).toEqual(1)
      expect(events[0].volumeOrLength).toEqual(8)
    }
  })
})

describe('parseMusic', () => {
  test('parses single channel', () => {
    const manager = new SoundStateManager()
    const command = parseMusic('CDE', manager)

    expect(command.channels).toHaveLength(1)
    expect(command.channels[0]!).toHaveLength(3)
  })

  test('parses multiple channels with separator', () => {
    const manager = new SoundStateManager()
    const command = parseMusic('C:E:G', manager)

    expect(command.channels).toHaveLength(3)
    expect(command.channels[0]!).toHaveLength(1)
    expect(command.channels[1]!).toHaveLength(1)
    expect(command.channels[2]!).toHaveLength(1)
  })

  test('assigns correct channel numbers', () => {
    const manager = new SoundStateManager()
    const command = parseMusic('C:D:E', manager)

    expect(command.channels[0]![0]!.channel).toEqual(0)
    expect(command.channels[1]![0]!.channel).toEqual(1)
    expect(command.channels[2]![0]!.channel).toEqual(2)
  })

  test('limits to 3 channels', () => {
    const manager = new SoundStateManager()
    const command = parseMusic('C:D:E:F', manager)

    expect(command.channels).toHaveLength(3)
  })

  test('parses F-BASIC manual example: C:E:G', () => {
    const manager = new SoundStateManager()
    const command = parseMusic('C:E:G', manager)

    expect(command.channels).toHaveLength(3)
    expect(isNote(command.channels[0]![0]!)).toBe(true)
    expect(isNote(command.channels[1]![0]!)).toBe(true)
    expect(isNote(command.channels[2]![0]!)).toBe(true)
  })

  test('parses F-BASIC manual example: O5C5:O4E5:O1G5', () => {
    const manager = new SoundStateManager()
    const command = parseMusic('O5C5:O4E5:O1G5', manager)

    expect(command.channels).toHaveLength(3)

    // Each channel has its own octave setting
    const c0 = command.channels[0]![0]!
    const c1 = command.channels[1]![0]!
    const c2 = command.channels[2]![0]!

    expect(isNote(c0) && c0.frequency).toBeCloseTo(calculateNoteFrequency('C', 5, false), 1)
    expect(isNote(c1) && c1.frequency).toBeCloseTo(calculateNoteFrequency('E', 4, false), 1)
    expect(isNote(c2) && c2.frequency).toBeCloseTo(calculateNoteFrequency('G', 1, false), 1)
  })

  test('state persists across calls (F-BASIC spec)', () => {
    const manager = new SoundStateManager()

    // First PLAY call sets state
    parseMusic('T1Y0M1V9O5', manager)

    // Second PLAY call should use persisted state
    const command = parseMusic('C', manager)

    expect(manager.getTempo()).toEqual(1)
    expect(manager.getDuty()).toEqual(0)
    expect(manager.getEnvelope()).toEqual(1)
    expect(manager.getVolumeOrLength()).toEqual(9)
    expect(manager.getOctave()).toEqual(5)

    if (isNote(command.channels[0]![0]!)) {
      const note = command.channels[0]![0]
      expect(note.duty).toEqual(0)
      expect(note.envelope).toEqual(1)
      expect(note.volumeOrLength).toEqual(9)
      expect(note.frequency).toBeCloseTo(calculateNoteFrequency('C', 5, false), 1)
    }
  })

  test('handles empty channels', () => {
    const manager = new SoundStateManager()
    const command = parseMusic('C::E', manager)

    expect(command.channels).toHaveLength(3)
    expect(command.channels[0]!).toHaveLength(1)
    expect(command.channels[1]!).toHaveLength(0) // Empty channel
    expect(command.channels[2]!).toHaveLength(1)
  })
})
