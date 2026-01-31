/**
 * Sound State Manager
 *
 * Manages persistent sound state (T, Y, M, V, O) across PLAY calls.
 * According to F-BASIC v3 spec, these parameters carry over between calls.
 */

import type { SoundState } from './types'

/**
 * Default initial sound state
 * Uses sensible defaults based on F-BASIC behavior
 */
const DEFAULT_STATE: SoundState = {
  tempo: 4, // Middle tempo
  duty: 2, // 50% duty cycle
  envelope: 0, // No envelope (volume mode)
  volumeOrLength: 15, // Maximum volume
  octave: 3, // Middle octave
}

/**
 * Manages persistent sound state across PLAY command calls
 */
export class SoundStateManager {
  private state: SoundState

  constructor(initialState?: Partial<SoundState>) {
    this.state = { ...DEFAULT_STATE, ...initialState }
  }

  /**
   * Get the current sound state
   */
  getState(): Readonly<SoundState> {
    return { ...this.state }
  }

  /**
   * Update sound state with new values
   * Only updates provided fields, leaving others unchanged
   */
  updateState(partial: Partial<SoundState>): void {
    this.state = { ...this.state, ...partial }
  }

  /**
   * Reset state to defaults
   */
  reset(): void {
    this.state = { ...DEFAULT_STATE }
  }

  /**
   * Get tempo value (1-8)
   */
  getTempo(): number {
    return this.state.tempo
  }

  /**
   * Set tempo value (1-8)
   */
  setTempo(tempo: number): void {
    if (tempo < 1 || tempo > 8) {
      throw new Error(`Invalid tempo: ${tempo}. Must be 1-8`)
    }
    this.state.tempo = tempo
  }

  /**
   * Get duty cycle (0-3)
   */
  getDuty(): number {
    return this.state.duty
  }

  /**
   * Set duty cycle (0-3)
   */
  setDuty(duty: number): void {
    if (duty < 0 || duty > 3) {
      throw new Error(`Invalid duty: ${duty}. Must be 0-3`)
    }
    this.state.duty = duty
  }

  /**
   * Get envelope mode (0-1)
   */
  getEnvelope(): number {
    return this.state.envelope
  }

  /**
   * Set envelope mode (0-1)
   */
  setEnvelope(envelope: number): void {
    if (envelope < 0 || envelope > 1) {
      throw new Error(`Invalid envelope: ${envelope}. Must be 0-1`)
    }
    this.state.envelope = envelope
  }

  /**
   * Get volume or envelope length (0-15)
   */
  getVolumeOrLength(): number {
    return this.state.volumeOrLength
  }

  /**
   * Set volume or envelope length (0-15)
   */
  setVolumeOrLength(value: number): void {
    if (value < 0 || value > 15) {
      throw new Error(`Invalid volume/length: ${value}. Must be 0-15`)
    }
    this.state.volumeOrLength = value
  }

  /**
   * Get octave (0-5)
   */
  getOctave(): number {
    return this.state.octave
  }

  /**
   * Set octave (0-5)
   */
  setOctave(octave: number): void {
    if (octave < 0 || octave > 5) {
      throw new Error(`Invalid octave: ${octave}. Must be 0-5`)
    }
    this.state.octave = octave
  }
}
