/**
 * Sound System Module
 *
 * Exports for the PLAY command sound system.
 */

export {
  compileToAudio,
  parseMusic,
  parseMusicToAst,
  validateMusicString,
} from './MusicDSLParser'
export { SoundStateManager } from './SoundStateManager'
export type {
  CompiledAudio,
  MusicEvent,
  MusicScore,
  Note,
  NoteName,
  ParsedDutyEvent,
  ParsedEnvelopeEvent,
  ParsedNoteEvent,
  ParsedOctaveEvent,
  ParsedRestEvent,
  ParsedTempoEvent,
  ParsedVolumeEvent,
  Rest,
  SoundEvent,
  SoundState,
} from './types'
export { isNote, isRest } from './types'
