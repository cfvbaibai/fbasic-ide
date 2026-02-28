/**
 * Sound System Types
 *
 * Type definitions for the PLAY command sound system.
 * Supports F-BASIC music DSL with tempo, duty cycle, envelope, volume, octave, and notes.
 */

// ============================================================================
// STAGE 1: MusicScore (Parsed notation - like sheet music)
// ============================================================================

/** Note names in F-BASIC */
export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

/** A parsed note event (before frequency/duration calculation) */
export interface ParsedNoteEvent {
  type: 'note'
  /** Note letter */
  note: NoteName
  /** Whether the note is sharp */
  sharp: boolean
  /** Optional length code 0-9; when omitted, uses previous length */
  length?: number
}

/** A parsed rest event */
export interface ParsedRestEvent {
  type: 'rest'
  /** Optional length code 0-9; when omitted, uses previous length */
  length?: number
}

/** Tempo command: T1-T8 */
export interface ParsedTempoEvent {
  type: 'tempo'
  /** Tempo value 1-8 */
  value: number
}

/** Octave command: O0-O5 */
export interface ParsedOctaveEvent {
  type: 'octave'
  /** Octave value 0-5 */
  value: number
}

/** Duty cycle command: Y0-Y3 */
export interface ParsedDutyEvent {
  type: 'duty'
  /** Duty value 0-3 */
  value: number
}

/** Envelope command: M0-M1 */
export interface ParsedEnvelopeEvent {
  type: 'envelope'
  /** Envelope value 0-1 */
  value: number
}

/** Volume command: V0-V15 */
export interface ParsedVolumeEvent {
  type: 'volume'
  /** Volume value 0-15 */
  value: number
}

/** A single event in the parsed music score */
export type MusicEvent =
  | ParsedNoteEvent
  | ParsedRestEvent
  | ParsedTempoEvent
  | ParsedOctaveEvent
  | ParsedDutyEvent
  | ParsedEnvelopeEvent
  | ParsedVolumeEvent

/**
 * MusicScore - Parsed notation (like sheet music)
 *
 * This is the Stage 1 output: a structured representation of the music DSL
 * with symbolic values (note letters, length codes) before any calculation.
 */
export interface MusicScore {
  /** Events organized by channel (0-2) */
  channels: MusicEvent[][]
}

// ============================================================================
// STAGE 2: CompiledAudio (Ready for playback)
// ============================================================================

/**
 * Persistent sound state that carries over between PLAY calls
 * Follows F-BASIC v3 specification where T, Y, M, V, O persist
 * Note: Last note length (0-9) also persists across PLAY calls
 */
export interface SoundState {
  /** Tempo: 1-8 (1=fast, 8=slow) */
  tempo: number
  /** Duty cycle: 0-3 (0=12.5%, 1=25%, 2=50%, 3=75%) */
  duty: number
  /** Envelope mode: 0=no envelope+volume, 1=envelope+length */
  envelope: number
  /** Volume (M0) or Envelope length (M1): 0-15 */
  volumeOrLength: number
  /** Octave: 0-5 (0=low, 5=high) */
  octave: number
  /** Last note length code: 0-9 (5=quarter note is default) */
  lastLength: number
}

/**
 * A single note to be played (with calculated frequency and duration)
 */
export interface Note {
  /** Frequency in Hz (calculated from note and octave) */
  frequency: number
  /** Duration in milliseconds */
  duration: number
  /** Channel number: 0-2 (supports 3 channels) */
  channel: number
  /** Duty cycle: 0-3 (12.5%, 25%, 50%, 75%) */
  duty: number
  /** Envelope mode: 0 or 1 */
  envelope: number
  /** Volume (0-15) if M0, or envelope length (0-15) if M1 */
  volumeOrLength: number
}

/**
 * A rest (silence) to be played
 */
export interface Rest {
  /** Duration in milliseconds */
  duration: number
  /** Channel number: 0-2 */
  channel: number
}

/**
 * Either a note or a rest (audio-ready event)
 */
export type SoundEvent = Note | Rest

/**
 * Type guard for Note
 */
export function isNote(event: SoundEvent): event is Note {
  return 'frequency' in event
}

/**
 * Type guard for Rest
 */
export function isRest(event: SoundEvent): event is Rest {
  return !('frequency' in event)
}

/**
 * CompiledAudio - Audio-ready data for playback
 *
 * This is the Stage 2 output: concrete sound events with calculated
 * frequencies (Hz) and durations (ms), ready for the audio player.
 */
export interface CompiledAudio {
  /** Sound events organized by channel (0-2) */
  channels: SoundEvent[][]
}
