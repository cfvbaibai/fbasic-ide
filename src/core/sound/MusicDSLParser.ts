/**
 * Music DSL Parser
 *
 * Two-stage parsing for F-BASIC PLAY command:
 *   Stage 1: parseMusicToAst() → MusicScore (symbolic notation)
 *   Stage 2: compileToAudio() → CompiledAudio (audio-ready events)
 *
 * Frequency Calculation:
 * - Uses equal temperament tuning with A4 = 440Hz standard
 * - Formula: f = 440 * 2^((n-57)/12) where n is MIDI note number
 */

import type { SoundStateManager } from './SoundStateManager'
import type {
  CompiledAudio,
  MusicEvent,
  MusicScore,
  Note,
  ParsedDutyEvent,
  ParsedEnvelopeEvent,
  ParsedNoteEvent,
  ParsedOctaveEvent,
  ParsedRestEvent,
  ParsedTempoEvent,
  ParsedVolumeEvent,
  Rest,
  SoundEvent,
} from './types'

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
 * T1 (fastest) to T8 (slowest) - per F-BASIC manual
 */
const TEMPO_MS_PER_WHOLE_NOTE: Record<number, number> = {
  1: 1100,
  2: 1375,
  3: 1650,
  4: 2200, // Default
  5: 2750,
  6: 3300,
  7: 3850,
  8: 4400,
}

/**
 * F-BASIC length codes 0-9 to fraction of whole note (manual page 81)
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

/** Default length code when none specified (5 = quarter note) */
const DEFAULT_LENGTH_CODE = 5

/**
 * Valid characters in PLAY music string (excluding colon which is channel separator)
 */
const VALID_MUSIC_CHARS = new Set([
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G', // Notes
  'O',
  'T',
  'Y',
  'M',
  'V',
  'R', // Commands
  '#', // Sharp
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9', // Digits
  ' ', // Space (ignored)
])

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate a music string and throw error if invalid format
 * F-BASIC raises SN (Syntax) error for invalid music strings
 *
 * Validates:
 * - Invalid characters
 * - Tempo: T1-T8
 * - Octave: O0-O5
 * - Duty: Y0-Y3
 * - Envelope: M0-M1
 * - Volume: V0-V15
 * - Length codes: 0-9
 * - Sharp notes: #C, #D, #F, #G, #A (not #E or #B)
 */
export function validateMusicString(musicString: string): void {
  const input = musicString.toUpperCase()
  let i = 0

  while (i < input.length) {
    const char = input[i]!

    // Skip spaces
    if (char === ' ') {
      i++
      continue
    }

    // Colon is channel separator
    if (char === ':') {
      i++
      continue
    }

    // Check for invalid characters
    if (!VALID_MUSIC_CHARS.has(char)) {
      throw new Error(`Invalid character '${char}' in PLAY string at position ${i + 1}`)
    }

    // Validate Tempo: T1-T8
    if (char === 'T') {
      i++
      const match = input.slice(i).match(/^(\d+)/)
      if (!match?.[1]) {
        throw new Error(`Tempo value required after T at position ${i + 1}`)
      }
      const value = parseInt(match[1], 10)
      if (value < 1 || value > 8) {
        throw new Error(`Invalid tempo T${value}: must be 1-8`)
      }
      i += match[1].length
      continue
    }

    // Validate Octave: O0-O5
    if (char === 'O') {
      i++
      const match = input.slice(i).match(/^(\d+)/)
      if (!match?.[1]) {
        throw new Error(`Octave value required after O at position ${i + 1}`)
      }
      const value = parseInt(match[1], 10)
      if (value < 0 || value > 5) {
        throw new Error(`Invalid octave O${value}: must be 0-5`)
      }
      i += match[1].length
      continue
    }

    // Validate Duty: Y0-Y3
    if (char === 'Y') {
      i++
      const match = input.slice(i).match(/^(\d+)/)
      if (!match?.[1]) {
        throw new Error(`Duty value required after Y at position ${i + 1}`)
      }
      const value = parseInt(match[1], 10)
      if (value < 0 || value > 3) {
        throw new Error(`Invalid duty Y${value}: must be 0-3`)
      }
      i += match[1].length
      continue
    }

    // Validate Envelope: M0-M1
    if (char === 'M') {
      i++
      const match = input.slice(i).match(/^(\d+)/)
      if (!match?.[1]) {
        throw new Error(`Envelope value required after M at position ${i + 1}`)
      }
      const value = parseInt(match[1], 10)
      if (value < 0 || value > 1) {
        throw new Error(`Invalid envelope M${value}: must be 0-1`)
      }
      i += match[1].length
      continue
    }

    // Validate Volume: V0-V15
    if (char === 'V') {
      i++
      const match = input.slice(i).match(/^(\d+)/)
      if (!match?.[1]) {
        throw new Error(`Volume value required after V at position ${i + 1}`)
      }
      const value = parseInt(match[1], 10)
      if (value < 0 || value > 15) {
        throw new Error(`Invalid volume V${value}: must be 0-15`)
      }
      i += match[1].length
      continue
    }

    // Validate Sharp: # must be followed by C, D, F, G, or A
    if (char === '#') {
      i++
      const nextChar = input[i]
      if (!nextChar) {
        throw new Error(`Sharp (#) at position ${i} must be followed by a note`)
      }
      if (!'CDFGA'.includes(nextChar)) {
        throw new Error(
          `Invalid sharp #${nextChar} at position ${i}: # must be followed by C, D, F, G, or A`
        )
      }
      i++
      // Optional length code
      if (input[i] && /[0-9]/.test(input[i]!)) {
        i++
      }
      continue
    }

    // Rest: R with optional length
    if (char === 'R') {
      i++
      if (input[i] && /[0-9]/.test(input[i]!)) {
        i++
      }
      continue
    }

    // Natural notes: C, D, E, F, G, A, B with optional length
    if ('CDEFGAB'.includes(char)) {
      i++
      if (input[i] && /[0-9]/.test(input[i]!)) {
        i++
      }
      continue
    }

    // Digits should only appear after commands/notes
    if (/[0-9]/.test(char)) {
      throw new Error(
        `Unexpected digit '${char}' at position ${i}: digits must follow a command or note`
      )
    }

    i++
  }
}

// ============================================================================
// STAGE 1: Parse string to MusicScore (symbolic notation)
// ============================================================================

/**
 * Parse a single channel's music string into MusicEvent array
 */
function parseChannelToAst(channelString: string): MusicEvent[] {
  const events: MusicEvent[] = []
  const input = channelString.toUpperCase().replace(/\s+/g, '')
  let i = 0

  while (i < input.length) {
    const char = input[i]

    // Tempo: T1-T8
    if (char === 'T') {
      i++
      const match = input.slice(i).match(/^(\d+)/)
      if (match?.[1]) {
        events.push({ type: 'tempo', value: parseInt(match[1], 10) } as ParsedTempoEvent)
        i += match[1].length
      }
      continue
    }

    // Duty cycle: Y0-Y3
    if (char === 'Y') {
      i++
      const match = input.slice(i).match(/^(\d+)/)
      if (match?.[1]) {
        events.push({ type: 'duty', value: parseInt(match[1], 10) } as ParsedDutyEvent)
        i += match[1].length
      }
      continue
    }

    // Envelope: M0-M1
    if (char === 'M') {
      i++
      const match = input.slice(i).match(/^(\d+)/)
      if (match?.[1]) {
        events.push({ type: 'envelope', value: parseInt(match[1], 10) } as ParsedEnvelopeEvent)
        i += match[1].length
      }
      continue
    }

    // Volume: V0-V15
    if (char === 'V') {
      i++
      const match = input.slice(i).match(/^(\d+)/)
      if (match?.[1]) {
        events.push({ type: 'volume', value: parseInt(match[1], 10) } as ParsedVolumeEvent)
        i += match[1].length
      }
      continue
    }

    // Octave: O0-O5
    if (char === 'O') {
      i++
      const match = input.slice(i).match(/^(\d+)/)
      if (match?.[1]) {
        events.push({ type: 'octave', value: parseInt(match[1], 10) } as ParsedOctaveEvent)
        i += match[1].length
      }
      continue
    }

    // Sharp: #C, #D, #F, #G, #A
    if (char === '#') {
      i++
      const nextChar = input[i]
      if (nextChar && 'CDFGA'.includes(nextChar)) {
        const noteName = nextChar as 'C' | 'D' | 'F' | 'G' | 'A'
        i++

        const digitMatch = input.slice(i).match(/^(\d)/)
        const event: ParsedNoteEvent = {
          type: 'note',
          note: noteName,
          sharp: true,
        }
        if (digitMatch) {
          event.length = parseInt(digitMatch[1]!, 10)
          i += 1
        }
        events.push(event)
      }
      continue
    }

    // Rest: R with optional length
    if (char === 'R') {
      i++
      const event: ParsedRestEvent = { type: 'rest' }
      const digitMatch = input.slice(i).match(/^(\d)/)
      if (digitMatch) {
        event.length = parseInt(digitMatch[1]!, 10)
        i += 1
      }
      events.push(event)
      continue
    }

    // Natural notes: C, D, E, F, G, A, B
    if (char && 'CDEFGAB'.includes(char)) {
      const noteName = char as 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
      i++

      const event: ParsedNoteEvent = {
        type: 'note',
        note: noteName,
        sharp: false,
      }
      const digitMatch = input.slice(i).match(/^(\d)/)
      if (digitMatch) {
        event.length = parseInt(digitMatch[1]!, 10)
        i += 1
      }
      events.push(event)
      continue
    }

    // Unknown character - skip (should not happen if validated)
    i++
  }

  return events
}

/**
 * Parse music string into MusicScore (Stage 1)
 *
 * @param musicString - Music DSL string
 * @returns Parsed music score with symbolic events
 */
export function parseMusicToAst(musicString: string): MusicScore {
  // Validate first
  validateMusicString(musicString)

  // Split by channel separator ":"
  const channelStrings = musicString.split(':')

  // Limit to 3 channels
  const channels = channelStrings.slice(0, 3).map((channelString) => {
    return parseChannelToAst(channelString)
  })

  return { channels }
}

// ============================================================================
// STAGE 2: Compile MusicScore to CompiledAudio (audio-ready)
// ============================================================================

/**
 * Calculate frequency in Hz for a given note and octave
 * Uses equal temperament tuning with A4 = 440Hz
 */
function calculateNoteFrequency(noteName: string, octave: number, sharp: boolean): number {
  const baseSemitone = NOTE_SEMITONES[noteName]
  if (baseSemitone === undefined) {
    throw new Error(`Invalid note name: ${noteName}`)
  }

  const semitone = baseSemitone + (sharp ? 1 : 0)
  const midiNote = (octave + 2) * 12 + semitone + 12
  const frequency = 440 * Math.pow(2, (midiNote - 69) / 12)

  return frequency
}

/**
 * Duration in ms for F-BASIC length code 0-9
 */
function lengthCodeToDuration(code: number, tempo: number): number {
  const clamped = Math.max(0, Math.min(9, code))
  const fraction =
    LENGTH_CODE_TO_FRACTION[clamped] ?? LENGTH_CODE_TO_FRACTION[DEFAULT_LENGTH_CODE] ?? 1 / 4
  const wholeNoteDuration = TEMPO_MS_PER_WHOLE_NOTE[tempo] ?? TEMPO_MS_PER_WHOLE_NOTE[4]!
  return wholeNoteDuration * fraction
}

/**
 * Compile a single channel's MusicEvent array to SoundEvent array
 */
function compileChannelToAudio(
  events: MusicEvent[],
  stateManager: SoundStateManager,
  channelNumber: number
): SoundEvent[] {
  const soundEvents: SoundEvent[] = []
  // Get lastLength from state manager (persists across PLAY calls)
  let lastLengthCode = stateManager.getLastLength()

  for (const event of events) {
    switch (event.type) {
      case 'tempo':
        stateManager.setTempo(event.value)
        break

      case 'duty':
        stateManager.setDuty(event.value)
        break

      case 'envelope':
        stateManager.setEnvelope(event.value)
        break

      case 'volume':
        stateManager.setVolumeOrLength(event.value)
        break

      case 'octave':
        stateManager.setOctave(event.value)
        break

      case 'note': {
        const lengthCode = event.length ?? lastLengthCode
        // Update lastLength in state manager for cross-PLAY persistence
        lastLengthCode = lengthCode
        stateManager.setLastLength(lengthCode)

        const state = stateManager.getState()
        const frequency = calculateNoteFrequency(event.note, state.octave, event.sharp)
        const duration = lengthCodeToDuration(lengthCode, state.tempo)

        soundEvents.push({
          frequency,
          duration,
          channel: channelNumber,
          duty: state.duty,
          envelope: state.envelope,
          volumeOrLength: state.volumeOrLength,
        } as Note)
        break
      }

      case 'rest': {
        const lengthCode = event.length ?? lastLengthCode
        // Update lastLength in state manager for cross-PLAY persistence
        lastLengthCode = lengthCode
        stateManager.setLastLength(lengthCode)

        const state = stateManager.getState()
        const duration = lengthCodeToDuration(lengthCode, state.tempo)

        soundEvents.push({
          duration,
          channel: channelNumber,
        } as Rest)
        break
      }
    }
  }

  return soundEvents
}

/**
 * Compile MusicScore to CompiledAudio (Stage 2)
 *
 * @param score - Parsed music score
 * @param stateManagers - Array of sound state managers (one per channel) for state persistence
 * @returns Compiled audio ready for playback
 */
export function compileToAudio(
  score: MusicScore,
  stateManagers: SoundStateManager[]
): CompiledAudio {
  const channels = score.channels.map((channelEvents, index) => {
    const stateManager = stateManagers[index]!
    return compileChannelToAudio(channelEvents, stateManager, index)
  })

  return { channels }
}

// ============================================================================
// CONVENIENCE: Combined parse + compile
// ============================================================================

/**
 * Parse music string and compile to audio in one step
 * Convenience function for backward compatibility
 *
 * @param musicString - Music DSL string
 * @param stateManagers - Array of sound state managers (one per channel)
 * @returns Compiled audio ready for playback
 */
export function parseMusic(
  musicString: string,
  stateManagers: SoundStateManager[]
): CompiledAudio {
  const score = parseMusicToAst(musicString)
  return compileToAudio(score, stateManagers)
}
