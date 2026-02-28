/**
 * Music DSL Parser
 *
 * Parses F-BASIC PLAY music strings into Note[] arrays.
 * Handles tempo, duty cycle, envelope, volume, octave, intervals, sharps, and rests.
 *
 * Frequency Calculation:
 * - Uses equal temperament tuning with A4 = 440Hz standard
 * - Formula: f = 440 * 2^((n-57)/12) where n is MIDI note number
 * - MIDI note numbers: C0=12, C4=60, A4=69
 */

import type { SoundStateManager } from './SoundStateManager'
import type { MusicCommand, Rest, SoundEvent } from './types'

/**
 * Note names to semitone offset mapping (C = 0)
 */
const NOTE_SEMITONES: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

/**
 * Tempo to milliseconds per whole note mapping
 * T1 (fast) to T8 (slow)
 * Based on typical BASIC tempo ranges
 */
const TEMPO_MS_PER_WHOLE_NOTE: Record<number, number> = {
  1: 800, // Very fast
  2: 1000,
  3: 1200,
  4: 1600, // Default/medium
  5: 2000,
  6: 2400,
  7: 2800,
  8: 3200, // Very slow
}

/**
 * F-BASIC length codes 0-9 to fraction of whole note (manual page 81)
 * 0=32nd, 1=16th, 2=dotted16th, 3=8th, 4=dotted8th, 5=quarter, 6=dotted quarter, 7=half, 8=dotted half, 9=whole
 */
const LENGTH_CODE_TO_FRACTION: Record<number, number> = {
  0: 1 / 32,
  1: 1 / 16,
  2: 3 / 32, // dotted 16th
  3: 1 / 8,
  4: 3 / 16, // dotted 8th
  5: 1 / 4, // quarter (default)
  6: 3 / 8, // dotted quarter
  7: 1 / 2, // half
  8: 3 / 4, // dotted half
  9: 1, // whole
}

/** Default length code when none specified (5 = quarter note, manual page 81) */
const DEFAULT_LENGTH_CODE = 5

/**
 * Calculate frequency in Hz for a given note and octave
 * Uses equal temperament tuning with A4 = 440Hz
 *
 * F-BASIC Octave Mapping:
 * F-BASIC uses octave numbers O0-O5, which map to standard MIDI octaves with a +2 offset:
 * - F-BASIC O0 = Standard O2 (low bass, ~65 Hz for C)
 * - F-BASIC O2 = Standard O4 (middle C range, ~262 Hz for C)
 * - F-BASIC O3 = Standard O5 (treble range, ~523 Hz for C)
 * - F-BASIC O5 = Standard O7 (high range, ~2093 Hz for C)
 *
 * This mapping aligns F-BASIC's O2 with the treble clef range where melodies are typically written.
 *
 * @param noteName - Note letter (C, D, E, F, G, A, B)
 * @param octave - F-BASIC octave number (0-5)
 * @param sharp - Whether the note is sharp (#)
 * @returns Frequency in Hz
 */
export function calculateNoteFrequency(noteName: string, octave: number, sharp: boolean = false): number {
  const baseSemitone = NOTE_SEMITONES[noteName]
  if (baseSemitone === undefined) {
    throw new Error(`Invalid note name: ${noteName}`)
  }

  // Calculate MIDI note number with F-BASIC octave offset (+2)
  // F-BASIC O2 maps to Standard O4 (Middle C range)
  // Formula: (fbasicOctave + 2) * 12 + semitone + 12
  const semitone = baseSemitone + (sharp ? 1 : 0)
  const midiNote = (octave + 2) * 12 + semitone + 12

  // Calculate frequency using equal temperament formula
  // f = 440 * 2^((n-69)/12) where n is MIDI note number and A4=69
  const frequency = 440 * Math.pow(2, (midiNote - 69) / 12)

  return frequency
}

/**
 * Calculate note duration in milliseconds (denominator semantics: 1=whole, 2=half, 4=quarter, 8=eighth).
 * Prefer lengthCodeToDuration for F-BASIC length codes 0-9.
 */
export function calculateNoteDuration(length: number, tempo: number): number {
  const wholeNoteDuration = TEMPO_MS_PER_WHOLE_NOTE[tempo]
  if (wholeNoteDuration === undefined) {
    const defaultDuration = TEMPO_MS_PER_WHOLE_NOTE[4]
    if (defaultDuration === undefined) {
      throw new Error('Invalid default tempo configuration')
    }
    return defaultDuration / length
  }
  return wholeNoteDuration / length
}

/**
 * Duration in ms for F-BASIC length code 0-9 (manual page 81).
 * 0=32nd, 1=16th, 2=dotted16th, 3=8th, 4=dotted8th, 5=quarter, 6=dotted quarter, 7=half, 8=dotted half, 9=whole.
 *
 * @param code - Length code 0-9 (clamped if out of range)
 * @param tempo - Tempo setting (1-8)
 * @returns Duration in milliseconds
 */
export function lengthCodeToDuration(code: number, tempo: number): number {
  const clamped = Math.max(0, Math.min(9, code))
  const fraction =
    LENGTH_CODE_TO_FRACTION[clamped] ?? LENGTH_CODE_TO_FRACTION[DEFAULT_LENGTH_CODE] ?? 1 / 4
  const wholeNoteDuration = TEMPO_MS_PER_WHOLE_NOTE[tempo] ?? TEMPO_MS_PER_WHOLE_NOTE[4]!
  return wholeNoteDuration * fraction
}

/**
 * Parse a single channel's music string into sound events
 *
 * @param channelString - Music string for one channel
 * @param stateManager - Sound state manager for persistent state
 * @param channelNumber - Channel number (0-2)
 * @returns Array of sound events (notes and rests)
 */
export function parseChannelMusic(
  channelString: string,
  stateManager: SoundStateManager,
  channelNumber: number
): SoundEvent[] {
  const events: SoundEvent[] = []
  const input = channelString.toUpperCase().replace(/\s+/g, '') // Remove spaces, convert to uppercase
  let i = 0
  // F-BASIC manual page 81: "When no integer is specified, it takes the same length of note as the one written before."
  let lastLengthCode = DEFAULT_LENGTH_CODE

  while (i < input.length) {
    const char = input[i]

    // Tempo: T1-T8
    if (char === 'T') {
      i++
      const tempoMatch = input.slice(i).match(/^(\d+)/)
      if (tempoMatch?.[1]) {
        const tempo = parseInt(tempoMatch[1], 10)
        stateManager.setTempo(tempo)
        i += tempoMatch[1].length
      }
      continue
    }

    // Duty cycle: Y0-Y3
    if (char === 'Y') {
      i++
      const dutyMatch = input.slice(i).match(/^(\d+)/)
      if (dutyMatch?.[1]) {
        const duty = parseInt(dutyMatch[1], 10)
        stateManager.setDuty(duty)
        i += dutyMatch[1].length
      }
      continue
    }

    // Envelope: M0-M1
    if (char === 'M') {
      i++
      const envelopeMatch = input.slice(i).match(/^(\d+)/)
      if (envelopeMatch?.[1]) {
        const envelope = parseInt(envelopeMatch[1], 10)
        stateManager.setEnvelope(envelope)
        i += envelopeMatch[1].length
      }
      continue
    }

    // Volume/Length: V0-V15
    if (char === 'V') {
      i++
      const volumeMatch = input.slice(i).match(/^(\d+)/)
      if (volumeMatch?.[1]) {
        const volume = parseInt(volumeMatch[1], 10)
        stateManager.setVolumeOrLength(volume)
        i += volumeMatch[1].length
      }
      continue
    }

    // Octave: O0-O5
    if (char === 'O') {
      i++
      const octaveMatch = input.slice(i).match(/^(\d+)/)
      if (octaveMatch?.[1]) {
        const octave = parseInt(octaveMatch[1], 10)
        stateManager.setOctave(octave)
        i += octaveMatch[1].length
      }
      continue
    }

    // Sharp: #C, #D, #F, #G, #A (skip #E and #B as they don't exist)
    if (char === '#') {
      i++
      const nextChar = input[i]
      if (nextChar && 'CDFGA'.includes(nextChar)) {
        const noteName = nextChar
        i++

        // Optional length code 0-9; when omitted, same as previous (manual page 81)
        const digitMatch = input.slice(i).match(/^(\d)/)
        const lengthCode = digitMatch ? parseInt(digitMatch[1]!, 10) : lastLengthCode
        if (digitMatch) i += 1
        lastLengthCode = lengthCode

        // Create note
        const state = stateManager.getState()
        const frequency = calculateNoteFrequency(noteName, state.octave, true)
        const duration = lengthCodeToDuration(lengthCode, state.tempo)

        events.push({
          frequency,
          duration,
          channel: channelNumber,
          duty: state.duty,
          envelope: state.envelope,
          volumeOrLength: state.volumeOrLength,
        })
      }
      continue
    }

    // Rest: Rn (R0-R9; when omitted, same length as previous — manual page 81)
    if (char === 'R') {
      i++
      const digitMatch = input.slice(i).match(/^(\d)/)
      const lengthCode = digitMatch ? parseInt(digitMatch[1]!, 10) : lastLengthCode
      if (digitMatch) i += 1
      lastLengthCode = lengthCode

      const state = stateManager.getState()
      const duration = lengthCodeToDuration(lengthCode, state.tempo)

      events.push({
        duration,
        channel: channelNumber,
      } as Rest)
      continue
    }

    // Natural notes: C, D, E, F, G, A, B (optional length 0-9; when omitted, same as previous — manual page 81)
    if (char && 'CDEFGAB'.includes(char)) {
      const noteName = char
      i++

      const digitMatch = input.slice(i).match(/^(\d)/)
      const lengthCode = digitMatch ? parseInt(digitMatch[1]!, 10) : lastLengthCode
      if (digitMatch) i += 1
      lastLengthCode = lengthCode

      // Create note
      const state = stateManager.getState()
      const frequency = calculateNoteFrequency(noteName, state.octave, false)
      const duration = lengthCodeToDuration(lengthCode, state.tempo)

      events.push({
        frequency,
        duration,
        channel: channelNumber,
        duty: state.duty,
        envelope: state.envelope,
        volumeOrLength: state.volumeOrLength,
      })
      continue
    }

    // Unknown character - skip
    i++
  }

  return events
}

/**
 * Parse PLAY music string into MusicCommand
 * Supports up to 3 channels separated by colons
 *
 * @param musicString - PLAY command music string (may contain channel separators ":")
 * @param stateManager - Sound state manager for persistent state
 * @returns Parsed music command with events per channel
 */
export function parseMusic(musicString: string, stateManager: SoundStateManager): MusicCommand {
  // Split by channel separator ":"
  const channelStrings = musicString.split(':')

  // Limit to 3 channels
  const limitedChannels = channelStrings.slice(0, 3)

  // Parse each channel
  const channels = limitedChannels.map((channelString, index) => {
    return parseChannelMusic(channelString, stateManager, index)
  })

  return { channels }
}
