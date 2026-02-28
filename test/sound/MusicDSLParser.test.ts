/**
 * Tests for MusicDSLParser
 *
 * Tests the two-stage parsing:
 *   Stage 1: parseMusicToAst() → MusicScore (symbolic notation)
 *   Stage 2: compileToAudio() → CompiledAudio (audio-ready events)
 */

import { describe, expect, test } from 'vitest'

import { compileToAudio, parseMusic, parseMusicToAst, validateMusicString } from '@/core/sound'
import { SoundStateManager } from '@/core/sound/SoundStateManager'
import { isNote, isRest } from '@/core/sound/types'

/**
 * Helper to create an array of 3 SoundStateManagers for testing
 */
function createTestStateManagers(): SoundStateManager[] {
  return [new SoundStateManager(), new SoundStateManager(), new SoundStateManager()]
}

// ============================================================================
// Validation Tests
// ============================================================================

describe('validateMusicString', () => {
  test('accepts valid note sequence', () => {
    expect(() => validateMusicString('CDEFGAB')).not.toThrow()
  })

  test('accepts valid commands', () => {
    expect(() => validateMusicString('T3O2Y2M0V15C')).not.toThrow()
  })

  test('accepts multi-channel with colon', () => {
    expect(() => validateMusicString('C:E:G')).not.toThrow()
  })

  test('accepts sharps', () => {
    expect(() => validateMusicString('#C#D#F#G#A')).not.toThrow()
  })

  test('accepts rests', () => {
    expect(() => validateMusicString('CRCR5R9')).not.toThrow()
  })

  test('accepts spaces (ignored)', () => {
    expect(() => validateMusicString('C D E')).not.toThrow()
  })

  test('rejects invalid character Z', () => {
    expect(() => validateMusicString('AAAZ')).toThrow("Invalid character 'Z' in PLAY string")
  })

  test('rejects invalid character X', () => {
    expect(() => validateMusicString('CXC')).toThrow("Invalid character 'X' in PLAY string")
  })

  test('rejects lowercase z (normalized to uppercase)', () => {
    expect(() => validateMusicString('aaaz')).toThrow("Invalid character 'Z' in PLAY string")
  })

  test('rejects special characters', () => {
    expect(() => validateMusicString('C@D')).toThrow("Invalid character '@' in PLAY string")
  })

  // Tempo validation
  test('accepts valid tempo T1 through T8', () => {
    expect(() => validateMusicString('T1C')).not.toThrow()
    expect(() => validateMusicString('T4C')).not.toThrow()
    expect(() => validateMusicString('T8C')).not.toThrow()
  })

  test('rejects tempo T0 (too low)', () => {
    expect(() => validateMusicString('T0C')).toThrow('Invalid tempo T0')
  })

  test('rejects tempo T9 (too high)', () => {
    expect(() => validateMusicString('T9C')).toThrow('Invalid tempo T9')
  })

  test('rejects tempo without number', () => {
    expect(() => validateMusicString('TC')).toThrow('Tempo value required')
  })

  // Octave validation
  test('accepts valid octave O0 through O5', () => {
    expect(() => validateMusicString('O0C')).not.toThrow()
    expect(() => validateMusicString('O3C')).not.toThrow()
    expect(() => validateMusicString('O5C')).not.toThrow()
  })

  test('rejects octave O6 (too high)', () => {
    expect(() => validateMusicString('O6C')).toThrow('Invalid octave O6')
  })

  test('rejects octave without number', () => {
    expect(() => validateMusicString('OC')).toThrow('Octave value required')
  })

  // Duty validation
  test('accepts valid duty Y0 through Y3', () => {
    expect(() => validateMusicString('Y0C')).not.toThrow()
    expect(() => validateMusicString('Y2C')).not.toThrow()
    expect(() => validateMusicString('Y3C')).not.toThrow()
  })

  test('rejects duty Y4 (too high)', () => {
    expect(() => validateMusicString('Y4C')).toThrow('Invalid duty Y4')
  })

  test('rejects duty without number', () => {
    expect(() => validateMusicString('YC')).toThrow('Duty value required')
  })

  // Envelope validation
  test('accepts valid envelope M0 and M1', () => {
    expect(() => validateMusicString('M0C')).not.toThrow()
    expect(() => validateMusicString('M1C')).not.toThrow()
  })

  test('rejects envelope M2 (too high)', () => {
    expect(() => validateMusicString('M2C')).toThrow('Invalid envelope M2')
  })

  test('rejects envelope without number', () => {
    expect(() => validateMusicString('MC')).toThrow('Envelope value required')
  })

  // Volume validation
  test('accepts valid volume V0 through V15', () => {
    expect(() => validateMusicString('V0C')).not.toThrow()
    expect(() => validateMusicString('V7C')).not.toThrow()
    expect(() => validateMusicString('V15C')).not.toThrow()
  })

  test('rejects volume V16 (too high)', () => {
    expect(() => validateMusicString('V16C')).toThrow('Invalid volume V16')
  })

  test('rejects volume without number', () => {
    expect(() => validateMusicString('VC')).toThrow('Volume value required')
  })

  // Sharp validation
  test('accepts #E (E sharp = F)', () => {
    expect(() => validateMusicString('#E')).not.toThrow()
  })

  test('accepts #B (B sharp = C, used in F-BASIC manual songs)', () => {
    expect(() => validateMusicString('#B')).not.toThrow()
  })

  test('rejects # at end of string', () => {
    expect(() => validateMusicString('C#')).toThrow('Sharp (#) at position')
  })

  // Unexpected digits
  test('rejects standalone digit', () => {
    expect(() => validateMusicString('5')).toThrow("Unexpected digit '5'")
  })
})

// ============================================================================
// Stage 1: parseMusicToAst Tests
// ============================================================================

describe('parseMusicToAst (Stage 1)', () => {
  test('parses simple note sequence', () => {
    const score = parseMusicToAst('CDE')
    expect(score.channels).toHaveLength(1)
    expect(score.channels[0]).toHaveLength(3)
  })

  test('parses notes with length codes', () => {
    const score = parseMusicToAst('C9D7E5')
    expect(score.channels).toHaveLength(1)
    expect(score.channels[0]).toHaveLength(3)

    // Check that notes have correct lengths
    expect(score.channels[0]![0]).toEqual({ type: 'note', note: 'C', sharp: false, length: 9 })
    expect(score.channels[0]![1]).toEqual({ type: 'note', note: 'D', sharp: false, length: 7 })
    expect(score.channels[0]![2]).toEqual({ type: 'note', note: 'E', sharp: false, length: 5 })
  })

  test('parses sharp notes', () => {
    const score = parseMusicToAst('#C#D#F')
    expect(score.channels).toHaveLength(1)
    expect(score.channels[0]).toHaveLength(3)

    expect(score.channels[0]![0]).toEqual({ type: 'note', note: 'C', sharp: true })
    expect(score.channels[0]![1]).toEqual({ type: 'note', note: 'D', sharp: true })
    expect(score.channels[0]![2]).toEqual({ type: 'note', note: 'F', sharp: true })
  })

  test('parses #B and #E (enharmonic sharps)', () => {
    const score = parseMusicToAst('#B#E')
    expect(score.channels).toHaveLength(1)
    expect(score.channels[0]).toHaveLength(2)

    expect(score.channels[0]![0]).toEqual({ type: 'note', note: 'B', sharp: true })
    expect(score.channels[0]![1]).toEqual({ type: 'note', note: 'E', sharp: true })
  })

  test('parses rests', () => {
    const score = parseMusicToAst('CR5D')
    expect(score.channels[0]).toHaveLength(3)

    expect(score.channels[0]![0]).toEqual({ type: 'note', note: 'C', sharp: false })
    expect(score.channels[0]![1]).toEqual({ type: 'rest', length: 5 })
    expect(score.channels[0]![2]).toEqual({ type: 'note', note: 'D', sharp: false })
  })

  test('parses tempo command', () => {
    const score = parseMusicToAst('T3C')
    expect(score.channels[0]!).toContainEqual({ type: 'tempo', value: 3 })
  })

  test('parses octave command', () => {
    const score = parseMusicToAst('O5C')
    expect(score.channels[0]!).toContainEqual({ type: 'octave', value: 5 })
  })

  test('parses duty command', () => {
    const score = parseMusicToAst('Y2C')
    expect(score.channels[0]!).toContainEqual({ type: 'duty', value: 2 })
  })

  test('parses envelope command', () => {
    const score = parseMusicToAst('M1C')
    expect(score.channels[0]!).toContainEqual({ type: 'envelope', value: 1 })
  })

  test('parses volume command', () => {
    const score = parseMusicToAst('V10C')
    expect(score.channels[0]!).toContainEqual({ type: 'volume', value: 10 })
  })

  test('parses multi-channel with colon', () => {
    const score = parseMusicToAst('C:E:G')
    expect(score.channels).toHaveLength(3)
  })

  test('limits to 3 channels', () => {
    const score = parseMusicToAst('C:D:E:F')
    expect(score.channels).toHaveLength(3)
  })

  test('ignores whitespace', () => {
    const score = parseMusicToAst('C D E')
    expect(score.channels[0]).toHaveLength(3)
  })

  test('is case-insensitive', () => {
    const score = parseMusicToAst('cde')
    expect(score.channels[0]).toHaveLength(3)
  })
})

// ============================================================================
// Stage 2: compileToAudio Tests
// ============================================================================

describe('compileToAudio (Stage 2)', () => {
  test('calculates correct note frequencies for octaves', () => {
    // O2 C should be ~261.63 Hz (middle C)
    const score = parseMusicToAst('O2C')
    const audio = compileToAudio(score, createTestStateManagers())

    expect(audio.channels[0]).toHaveLength(1)
    if (isNote(audio.channels[0]![0]!)) {
      expect(audio.channels[0]![0].frequency).toBeCloseTo(261.63, 1)
    }
  })

  test('calculates correct note frequencies for A440', () => {
    // O2 A should be 440 Hz
    const score = parseMusicToAst('O2A')
    const audio = compileToAudio(score, createTestStateManagers())

    if (isNote(audio.channels[0]![0]!)) {
      expect(audio.channels[0]![0].frequency).toBeCloseTo(440.0, 1)
    }
  })

  test('#B is enharmonically equivalent to C (next octave)', () => {
    // O2#B should equal O3C (B# in octave 2 = C in octave 3)
    const scoreBsharp = parseMusicToAst('O2#B')
    const scoreC = parseMusicToAst('O3C')
    const audioBsharp = compileToAudio(scoreBsharp, createTestStateManagers())
    const audioC = compileToAudio(scoreC, createTestStateManagers())

    if (isNote(audioBsharp.channels[0]![0]!) && isNote(audioC.channels[0]![0]!)) {
      expect(audioBsharp.channels[0]![0].frequency).toBeCloseTo(
        audioC.channels[0]![0].frequency,
        1
      )
    }
  })

  test('#E is enharmonically equivalent to F (same octave)', () => {
    // O3#E should equal O3F (E# in octave 3 = F in octave 3)
    const scoreEsharp = parseMusicToAst('O3#E')
    const scoreF = parseMusicToAst('O3F')
    const audioEsharp = compileToAudio(scoreEsharp, createTestStateManagers())
    const audioF = compileToAudio(scoreF, createTestStateManagers())

    if (isNote(audioEsharp.channels[0]![0]!) && isNote(audioF.channels[0]![0]!)) {
      expect(audioEsharp.channels[0]![0].frequency).toBeCloseTo(
        audioF.channels[0]![0].frequency,
        1
      )
    }
  })

  test('each octave doubles frequency', () => {
    const audio0 = compileToAudio(parseMusicToAst('O0C'), createTestStateManagers())
    const audio1 = compileToAudio(parseMusicToAst('O1C'), createTestStateManagers())

    const freq0 = audio0.channels[0]![0]!
    const freq1 = audio1.channels[0]![0]!

    if (isNote(freq0) && isNote(freq1)) {
      expect(freq1.frequency / freq0.frequency).toBeCloseTo(2, 1)
    }
  })

  test('calculates correct durations for length codes', () => {
    // At T4 (default): code 5 = quarter = 550ms, code 7 = half = 1100ms, code 9 = whole = 2200ms
    const score = parseMusicToAst('C5C7C9')
    const audio = compileToAudio(score, createTestStateManagers())

    const notes = audio.channels[0]!
    if (isNote(notes[0]!)) expect(notes[0].duration).toEqual(550)
    if (isNote(notes[1]!)) expect(notes[1].duration).toEqual(1100)
    if (isNote(notes[2]!)) expect(notes[2].duration).toEqual(2200)
  })

  test('length code 0 is 32nd note (68.75ms at T4)', () => {
    const audio = compileToAudio(parseMusicToAst('C0'), createTestStateManagers())

    if (isNote(audio.channels[0]![0]!)) {
      expect(audio.channels[0]![0].duration).toEqual(68.75)
    }
  })

  test('tempo affects note durations', () => {
    const audioFast = compileToAudio(parseMusicToAst('T1C5'), createTestStateManagers())
    const audioSlow = compileToAudio(parseMusicToAst('T8C5'), createTestStateManagers())

    if (isNote(audioFast.channels[0]![0]!) && isNote(audioSlow.channels[0]![0]!)) {
      expect(audioSlow.channels[0]![0].duration).toBeGreaterThan(audioFast.channels[0]![0].duration)
    }
  })

  test('length carries from previous note', () => {
    const audio = compileToAudio(parseMusicToAst('C5DE'), createTestStateManagers())

    // All notes should be quarter notes (550ms at T4)
    const notes = audio.channels[0]!
    if (isNote(notes[0]!)) expect(notes[0].duration).toEqual(550)
    if (isNote(notes[1]!)) expect(notes[1].duration).toEqual(550)
    if (isNote(notes[2]!)) expect(notes[2].duration).toEqual(550)
  })

  test('rest length carries from previous', () => {
    const audio = compileToAudio(parseMusicToAst('C5R7DE'), createTestStateManagers())

    const events = audio.channels[0]!
    if (isNote(events[0]!)) expect(events[0].duration).toEqual(550) // C5 quarter
    if (isRest(events[1]!)) expect(events[1].duration).toEqual(1100) // R7 half
    if (isNote(events[2]!)) expect(events[2].duration).toEqual(1100) // D uses R7's length
    if (isNote(events[3]!)) expect(events[3].duration).toEqual(1100) // E uses R7's length
  })

  test('carries duty/envelope/volume to notes', () => {
    const audio = compileToAudio(parseMusicToAst('T1Y3M1V8C'), createTestStateManagers())

    const note = audio.channels[0]![0]!
    if (isNote(note)) {
      expect(note.duty).toEqual(3)
      expect(note.envelope).toEqual(1)
      expect(note.volumeOrLength).toEqual(8)
    }
  })

  test('assigns correct channel numbers', () => {
    const audio = compileToAudio(parseMusicToAst('C:D:E'), createTestStateManagers())

    expect(audio.channels[0]![0]!.channel).toEqual(0)
    expect(audio.channels[1]![0]!.channel).toEqual(1)
    expect(audio.channels[2]![0]!.channel).toEqual(2)
  })

  test('updates SoundStateManager state', () => {
    const managers = createTestStateManagers()
    compileToAudio(parseMusicToAst('T1O5Y3M1V8'), managers)

    expect(managers[0]!.getTempo()).toEqual(1)
    expect(managers[0]!.getOctave()).toEqual(5)
    expect(managers[0]!.getDuty()).toEqual(3)
    expect(managers[0]!.getEnvelope()).toEqual(1)
    expect(managers[0]!.getVolumeOrLength()).toEqual(8)
  })
})

// ============================================================================
// Combined parseMusic Tests (Convenience)
// ============================================================================

describe('parseMusic (convenience)', () => {
  test('parses single channel', () => {
    const audio = parseMusic('CDE', createTestStateManagers())

    expect(audio.channels).toHaveLength(1)
    expect(audio.channels[0]).toHaveLength(3)
  })

  test('parses multiple channels with separator', () => {
    const audio = parseMusic('C:E:G', createTestStateManagers())

    expect(audio.channels).toHaveLength(3)
    expect(audio.channels[0]).toHaveLength(1)
    expect(audio.channels[1]).toHaveLength(1)
    expect(audio.channels[2]).toHaveLength(1)
  })

  test('state persists across calls (F-BASIC spec)', () => {
    const managers = createTestStateManagers()

    // First PLAY call sets state
    parseMusic('T1Y0M1V9O5', managers)

    // Second PLAY call should use persisted state
    const audio = parseMusic('C', managers)

    expect(managers[0]!.getTempo()).toEqual(1)
    expect(managers[0]!.getDuty()).toEqual(0)
    expect(managers[0]!.getEnvelope()).toEqual(1)
    expect(managers[0]!.getVolumeOrLength()).toEqual(9)
    expect(managers[0]!.getOctave()).toEqual(5)

    const note = audio.channels[0]![0]!
    if (isNote(note)) {
      expect(note.duty).toEqual(0)
      expect(note.envelope).toEqual(1)
      expect(note.volumeOrLength).toEqual(9)
    }
  })

  test('handles empty channels', () => {
    const audio = parseMusic('C::E', createTestStateManagers())

    expect(audio.channels).toHaveLength(3)
    expect(audio.channels[0]).toHaveLength(1)
    expect(audio.channels[1]).toHaveLength(0) // Empty channel
    expect(audio.channels[2]).toHaveLength(1)
  })

  test('note length persists across PLAY calls (F-BASIC spec)', () => {
    const managers = createTestStateManagers()

    // First PLAY call sets length to 7 (half note)
    parseMusic('C7', managers)
    expect(managers[0]!.getLastLength()).toEqual(7)

    // Second PLAY call should use persisted length for notes without explicit length
    const audio = parseMusic('DE', managers)

    // All notes should be half notes (1100ms at T4)
    const notes = audio.channels[0]!
    if (isNote(notes[0]!)) expect(notes[0].duration).toEqual(1100) // D uses inherited length 7
    if (isNote(notes[1]!)) expect(notes[1].duration).toEqual(1100) // E uses inherited length 7
  })

  test('note length persists independently per channel', () => {
    const managers = createTestStateManagers()

    // Set different lengths for each channel
    parseMusic('C9:D7:E5', managers)

    expect(managers[0]!.getLastLength()).toEqual(9) // Channel 0: whole note
    expect(managers[1]!.getLastLength()).toEqual(7) // Channel 1: half note
    expect(managers[2]!.getLastLength()).toEqual(5) // Channel 2: quarter note

    // Each channel should use its own persisted length
    const audio = parseMusic('C:D:E', managers)

    // Channel 0: whole note = 2200ms
    if (isNote(audio.channels[0]![0]!)) {
      expect(audio.channels[0]![0].duration).toEqual(2200)
    }
    // Channel 1: half note = 1100ms
    if (isNote(audio.channels[1]![0]!)) {
      expect(audio.channels[1]![0].duration).toEqual(1100)
    }
    // Channel 2: quarter note = 550ms
    if (isNote(audio.channels[2]![0]!)) {
      expect(audio.channels[2]![0].duration).toEqual(550)
    }
  })
})

// ============================================================================
// Channel C Constraint Tests (F-BASIC Manual Page 81)
// ============================================================================

describe('Channel C constraint (ignores M/Y commands)', () => {
  test('Channel C ignores envelope (M) commands', () => {
    const managers = createTestStateManagers()
    // Set envelope to M1 on all channels
    const audio = parseMusic('M1V5C:M1V5C:M1V5C', managers)

    // Channel 0 and 1 should have envelope=1 (M1)
    if (isNote(audio.channels[0]![0]!)) {
      expect(audio.channels[0]![0].envelope).toEqual(1)
    }
    if (isNote(audio.channels[1]![0]!)) {
      expect(audio.channels[1]![0].envelope).toEqual(1)
    }
    // Channel C (index 2) should have envelope=0 (M0, fixed)
    if (isNote(audio.channels[2]![0]!)) {
      expect(audio.channels[2]![0].envelope).toEqual(0)
    }
  })

  test('Channel C ignores duty (Y) commands', () => {
    const managers = createTestStateManagers()
    // Set duty to Y3 on all channels
    const audio = parseMusic('Y3C:Y3C:Y3C', managers)

    // Channel 0 and 1 should have duty=3 (Y3)
    if (isNote(audio.channels[0]![0]!)) {
      expect(audio.channels[0]![0].duty).toEqual(3)
    }
    if (isNote(audio.channels[1]![0]!)) {
      expect(audio.channels[1]![0].duty).toEqual(3)
    }
    // Channel C (index 2) should have duty=2 (Y2, fixed 50%)
    if (isNote(audio.channels[2]![0]!)) {
      expect(audio.channels[2]![0].duty).toEqual(2)
    }
  })

  test('Channel C uses fixed M0 Y2 even after state changes', () => {
    const managers = createTestStateManagers()
    // Try to change envelope and duty on channel C
    parseMusic('::M1Y0C', managers)

    // Channel C state manager should NOT have been updated
    // (M1 and Y0 should be ignored for channel C)
    expect(managers[2]!.getEnvelope()).toEqual(0) // Default M0
    expect(managers[2]!.getDuty()).toEqual(2) // Default Y2
  })

  test('Channel C still respects other commands (T, O, V, length)', () => {
    const managers = createTestStateManagers()
    const audio = parseMusic('::T1O5V7C9', managers)

    // Channel C should respect tempo, octave, volume, length
    expect(managers[2]!.getTempo()).toEqual(1)
    expect(managers[2]!.getOctave()).toEqual(5)
    expect(managers[2]!.getVolumeOrLength()).toEqual(7)
    expect(managers[2]!.getLastLength()).toEqual(9)

    // Note should have the correct duration (based on T1, length 9)
    if (isNote(audio.channels[2]![0]!)) {
      // T1 whole note = 1100ms
      expect(audio.channels[2]![0].duration).toEqual(1100)
    }
  })
})
