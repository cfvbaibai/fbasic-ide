/**
 * Sound System Types
 *
 * Type definitions for the PLAY command sound system.
 * Supports F-BASIC music DSL with tempo, duty cycle, envelope, volume, octave, and notes.
 */

/**
 * Persistent sound state that carries over between PLAY calls
 * Follows F-BASIC v3 specification where T, Y, M, V, O persist
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
}

/**
 * A single note to be played
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
 * Either a note or a rest
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
 * Parsed music command with events per channel
 */
export interface MusicCommand {
  /** Sound events organized by channel (0-2) */
  channels: SoundEvent[][]
}
