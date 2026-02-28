/**
 * Test Case Data for PLAY Command Verification
 */

import type { SoundTestCase } from './soundTestTypes'

// ============================================
// Basic Notes
// ============================================
export const BASIC_NOTES_TESTS: SoundTestCase[] = [
  {
    id: 'note-c',
    category: 'Basic Notes',
    name: 'Note C',
    description: 'Single C note - should hear one clear tone',
    musicString: 'C',
    expectedBehavior: 'One clear tone at default octave (O3) and length (quarter note)',
  },
  {
    id: 'note-d',
    category: 'Basic Notes',
    name: 'Note D',
    description: 'Single D note',
    musicString: 'D',
    expectedBehavior: 'One clear tone, higher than C',
  },
  {
    id: 'note-e',
    category: 'Basic Notes',
    name: 'Note E',
    description: 'Single E note',
    musicString: 'E',
    expectedBehavior: 'One clear tone, higher than D',
  },
  {
    id: 'note-f',
    category: 'Basic Notes',
    name: 'Note F',
    description: 'Single F note',
    musicString: 'F',
    expectedBehavior: 'One clear tone',
  },
  {
    id: 'note-g',
    category: 'Basic Notes',
    name: 'Note G',
    description: 'Single G note',
    musicString: 'G',
    expectedBehavior: 'One clear tone',
  },
  {
    id: 'note-a',
    category: 'Basic Notes',
    name: 'Note A',
    description: 'Single A note',
    musicString: 'A',
    expectedBehavior: 'One clear tone',
  },
  {
    id: 'note-b',
    category: 'Basic Notes',
    name: 'Note B',
    description: 'Single B note',
    musicString: 'B',
    expectedBehavior: 'One clear tone, highest natural note in octave',
  },
  {
    id: 'scale-c-major',
    category: 'Basic Notes',
    name: 'C Major Scale',
    description: 'Complete C major scale ascending',
    musicString: 'CDEFGAB',
    expectedBehavior: 'Seven ascending notes forming a major scale (do-re-mi-fa-sol-la-ti)',
  },
]

// ============================================
// Octaves
// ============================================
export const OCTAVES_TESTS: SoundTestCase[] = [
  {
    id: 'octave-o0',
    category: 'Octaves',
    name: 'Octave 0 (Lowest)',
    description: 'C note at octave 0 - very low pitch',
    musicString: 'O0C',
    expectedBehavior: 'Very low bass tone',
  },
  {
    id: 'octave-o1',
    category: 'Octaves',
    name: 'Octave 1',
    description: 'C note at octave 1',
    musicString: 'O1C',
    expectedBehavior: 'Low bass tone, one octave higher than O0',
  },
  {
    id: 'octave-o2',
    category: 'Octaves',
    name: 'Octave 2',
    description: 'C note at octave 2 - middle C range',
    musicString: 'O2C',
    expectedBehavior: 'Middle range tone',
  },
  {
    id: 'octave-o3',
    category: 'Octaves',
    name: 'Octave 3 (Default)',
    description: 'C note at octave 3 - default octave',
    musicString: 'O3C',
    expectedBehavior: 'Treble range tone (this is the default)',
  },
  {
    id: 'octave-o4',
    category: 'Octaves',
    name: 'Octave 4',
    description: 'C note at octave 4',
    musicString: 'O4C',
    expectedBehavior: 'High pitch, one octave above default',
  },
  {
    id: 'octave-o5',
    category: 'Octaves',
    name: 'Octave 5 (Highest)',
    description: 'C note at octave 5 - highest octave',
    musicString: 'O5C',
    expectedBehavior: 'Very high pitch, may sound thin',
  },
  {
    id: 'octave-ascending',
    category: 'Octaves',
    name: 'Octave Ascending',
    description: 'Same note across all octaves ascending',
    musicString: 'O0CO1CO2CO3CO4CO5C',
    expectedBehavior: 'Six C notes, each one octave higher than the previous',
  },
]

// ============================================
// Tempo
// ============================================
export const TEMPO_TESTS: SoundTestCase[] = [
  {
    id: 'tempo-t1',
    category: 'Tempo',
    name: 'Tempo 1 (Fastest)',
    description: 'Very fast tempo',
    musicString: 'T1CDEFGAB',
    expectedBehavior: 'Notes play very quickly',
  },
  {
    id: 'tempo-t4',
    category: 'Tempo',
    name: 'Tempo 4 (Default)',
    description: 'Default medium tempo',
    musicString: 'T4CDEFGAB',
    expectedBehavior: 'Notes at moderate speed',
  },
  {
    id: 'tempo-t8',
    category: 'Tempo',
    name: 'Tempo 8 (Slowest)',
    description: 'Very slow tempo',
    musicString: 'T8CDEFGAB',
    expectedBehavior: 'Notes play slowly with long durations',
  },
  {
    id: 'tempo-change',
    category: 'Tempo',
    name: 'Tempo Change Mid-Play',
    description: 'Change tempo during playback',
    musicString: 'T1CD T8EFGAB',
    expectedBehavior: 'First two notes fast, then slower for the rest',
  },
]

// ============================================
// Length Codes
// ============================================
export const LENGTH_CODES_TESTS: SoundTestCase[] = [
  {
    id: 'length-0',
    category: 'Length Codes',
    name: 'Length 0 (32nd note)',
    description: 'Very short note',
    musicString: 'C0',
    expectedBehavior: 'Extremely short note (32nd note)',
  },
  {
    id: 'length-1',
    category: 'Length Codes',
    name: 'Length 1 (16th note)',
    description: 'Short note',
    musicString: 'C1',
    expectedBehavior: 'Short note (16th note)',
  },
  {
    id: 'length-3',
    category: 'Length Codes',
    name: 'Length 3 (8th note)',
    description: 'Eighth note',
    musicString: 'C3',
    expectedBehavior: 'Medium-short note (8th note)',
  },
  {
    id: 'length-5',
    category: 'Length Codes',
    name: 'Length 5 (Quarter note)',
    description: 'Quarter note - default length',
    musicString: 'C5',
    expectedBehavior: 'Standard quarter note (this is the default)',
  },
  {
    id: 'length-7',
    category: 'Length Codes',
    name: 'Length 7 (Half note)',
    description: 'Half note',
    musicString: 'C7',
    expectedBehavior: 'Long note (half note)',
  },
  {
    id: 'length-9',
    category: 'Length Codes',
    name: 'Length 9 (Whole note)',
    description: 'Whole note - longest',
    musicString: 'C9',
    expectedBehavior: 'Very long note (whole note)',
  },
  {
    id: 'length-mixed',
    category: 'Length Codes',
    name: 'Mixed Lengths',
    description: 'Different note lengths in sequence',
    musicString: 'C1C3C5C7C9',
    expectedBehavior: 'Notes get progressively longer: short -> medium -> long',
  },
]

// ============================================
// Sharp Notes
// ============================================
export const SHARP_NOTES_TESTS: SoundTestCase[] = [
  {
    id: 'sharp-c',
    category: 'Sharp Notes',
    name: 'Sharp C (#C)',
    description: 'C sharp note',
    musicString: '#C',
    expectedBehavior: 'C#, slightly higher than natural C',
  },
  {
    id: 'sharp-d',
    category: 'Sharp Notes',
    name: 'Sharp D (#D)',
    description: 'D sharp note',
    musicString: '#D',
    expectedBehavior: 'D#, slightly higher than natural D',
  },
  {
    id: 'sharp-f',
    category: 'Sharp Notes',
    name: 'Sharp F (#F)',
    description: 'F sharp note',
    musicString: '#F',
    expectedBehavior: 'F#, slightly higher than natural F',
  },
  {
    id: 'sharp-g',
    category: 'Sharp Notes',
    name: 'Sharp G (#G)',
    description: 'G sharp note',
    musicString: '#G',
    expectedBehavior: 'G#, slightly higher than natural G',
  },
  {
    id: 'sharp-a',
    category: 'Sharp Notes',
    name: 'Sharp A (#A)',
    description: 'A sharp note',
    musicString: '#A',
    expectedBehavior: 'A#, slightly higher than natural A',
  },
  {
    id: 'sharp-compare',
    category: 'Sharp Notes',
    name: 'Natural vs Sharp',
    description: 'Compare natural and sharp notes',
    musicString: 'C#CD#DE#F',
    expectedBehavior:
      'Each pair: natural note, then its sharp (except F which goes to F natural)',
  },
]

// ============================================
// Rests
// ============================================
export const RESTS_TESTS: SoundTestCase[] = [
  {
    id: 'rest-basic',
    category: 'Rests',
    name: 'Basic Rest',
    description: 'Rest between notes (same length as notes)',
    musicString: 'CRC',
    expectedBehavior:
      'Two quarter-note C notes with quarter-note silence between (R uses previous length)',
  },
  {
    id: 'rest-length-0',
    category: 'Rests',
    name: 'Short Rest (R0)',
    description: 'Very short rest',
    musicString: 'C5R0C5',
    expectedBehavior:
      'Two quarter-note C notes with very brief 32nd-note silence (explicit C5 restores length)',
  },
  {
    id: 'rest-length-9',
    category: 'Rests',
    name: 'Long Rest (R9)',
    description: 'Long rest',
    musicString: 'C5R9C5',
    expectedBehavior:
      'Two quarter-note C notes with whole-note silence (explicit C5 restores length)',
  },
  {
    id: 'rest-length-carries',
    category: 'Rests',
    name: 'Rest Length Carries Over',
    description: 'Rest length affects subsequent notes (F-BASIC spec)',
    musicString: 'C5R0C',
    expectedBehavior:
      'First C is quarter note, R0 is 32nd rest, second C is also 32nd (length carries)',
  },
  {
    id: 'rest-melody',
    category: 'Rests',
    name: 'Melody with Rests',
    description: 'Simple melody with rests',
    musicString: 'C5R5D5R5E5R5',
    expectedBehavior: 'C, silence, D, silence, E, silence - all quarter notes separated by rests',
  },
]

// ============================================
// Duty Cycle
// ============================================
export const DUTY_CYCLE_TESTS: SoundTestCase[] = [
  {
    id: 'duty-y0',
    category: 'Duty Cycle',
    name: 'Duty Y0 (12.5%)',
    description: 'Narrow pulse wave',
    musicString: 'Y0CDEFGAB',
    expectedBehavior: 'Thin, buzzy sound (12.5% duty cycle)',
  },
  {
    id: 'duty-y1',
    category: 'Duty Cycle',
    name: 'Duty Y1 (25%)',
    description: 'Quarter pulse wave',
    musicString: 'Y1CDEFGAB',
    expectedBehavior: 'Slightly fuller buzzy sound (25% duty cycle)',
  },
  {
    id: 'duty-y2',
    category: 'Duty Cycle',
    name: 'Duty Y2 (50% - Default)',
    description: 'Square wave - default',
    musicString: 'Y2CDEFGAB',
    expectedBehavior: 'Classic 8-bit square wave sound (50% duty, this is default)',
  },
  {
    id: 'duty-y3',
    category: 'Duty Cycle',
    name: 'Duty Y3 (75%)',
    description: 'Wide pulse wave',
    musicString: 'Y3CDEFGAB',
    expectedBehavior: 'Fuller, more hollow sound (75% duty cycle)',
  },
  {
    id: 'duty-compare',
    category: 'Duty Cycle',
    name: 'Duty Cycle Comparison',
    description: 'Compare all duty cycles',
    musicString: 'Y0CY1CY2CY3C',
    expectedBehavior: 'Same note with 4 different timbres',
  },
]

// ============================================
// Envelope
// ============================================
export const ENVELOPE_TESTS: SoundTestCase[] = [
  {
    id: 'envelope-m0',
    category: 'Envelope',
    name: 'Envelope M0 (Volume Mode)',
    description: 'Constant volume',
    musicString: 'M0V15C',
    expectedBehavior: 'Note at constant maximum volume (no decay)',
  },
  {
    id: 'envelope-m1',
    category: 'Envelope',
    name: 'Envelope M1 (Decay Mode)',
    description: 'Decaying volume',
    musicString: 'M1V15C9',
    expectedBehavior: 'Note starts loud and gradually fades (exponential decay)',
  },
  {
    id: 'envelope-compare',
    category: 'Envelope',
    name: 'M0 vs M1 Comparison',
    description: 'Compare volume modes',
    musicString: 'M0V15C9 M1V15C9',
    expectedBehavior: 'First note constant volume, second note fades',
  },
  {
    id: 'envelope-short',
    category: 'Envelope',
    name: 'M1 Short Decay (V0)',
    description: 'Quick decay',
    musicString: 'M1V0C9',
    expectedBehavior: 'Note fades very quickly',
  },
  {
    id: 'envelope-long',
    category: 'Envelope',
    name: 'M1 Long Decay (V15)',
    description: 'Slow decay',
    musicString: 'M1V15C9',
    expectedBehavior: 'Note fades slowly over the full duration',
  },
]

// ============================================
// Volume
// ============================================
export const VOLUME_TESTS: SoundTestCase[] = [
  {
    id: 'volume-v0',
    category: 'Volume',
    name: 'Volume V0 (Silent)',
    description: 'Minimum volume - should be silent',
    musicString: 'M0V0C',
    expectedBehavior: 'Should be silent or nearly silent',
  },
  {
    id: 'volume-v7',
    category: 'Volume',
    name: 'Volume V7 (Medium)',
    description: 'Medium volume',
    musicString: 'M0V7C',
    expectedBehavior: 'Medium volume tone',
  },
  {
    id: 'volume-v15',
    category: 'Volume',
    name: 'Volume V15 (Maximum)',
    description: 'Maximum volume',
    musicString: 'M0V15C',
    expectedBehavior: 'Loud, full volume tone',
  },
  {
    id: 'volume-crescendo',
    category: 'Volume',
    name: 'Volume Crescendo',
    description: 'Gradually increasing volume',
    musicString: 'M0V1CM0V5CM0V10CM0V15C',
    expectedBehavior: 'Four notes getting progressively louder',
  },
]

// ============================================
// Multi-Channel
// ============================================
export const MULTI_CHANNEL_TESTS: SoundTestCase[] = [
  {
    id: 'channel-2ch-harmony',
    category: 'Multi-Channel',
    name: '2-Channel Harmony',
    description: 'Two notes played simultaneously',
    musicString: 'C:E',
    expectedBehavior: 'Two tones at once (C and E) forming a harmony',
  },
  {
    id: 'channel-3ch-harmony',
    category: 'Multi-Channel',
    name: '3-Channel Harmony',
    description: 'Three notes played simultaneously',
    musicString: 'C:E:G',
    expectedBehavior: 'Three tones at once (C, E, G) forming a C major chord',
  },
  {
    id: 'channel-melody-bass',
    category: 'Multi-Channel',
    name: 'Melody + Bass',
    description: 'High melody with low bass',
    musicString: 'O3CDEFGAB:O1C9',
    expectedBehavior: 'High melody (scale) with sustained low bass note',
  },
  {
    id: 'channel-counterpoint',
    category: 'Multi-Channel',
    name: 'Counterpoint',
    description: 'Two independent melodies',
    musicString: 'O2C5D5E5F5G5:O3E5F5G5A5B5',
    expectedBehavior: 'Two melodies playing at once, starting at different notes',
  },
  {
    id: 'channel-full-chord',
    category: 'Multi-Channel',
    name: 'Full Chord Progression',
    description: 'Chord progression with 3 voices',
    musicString: 'O3C9:O3E9:O3G9 O3F9:O3A9:O4C9 O3G9:O3B9:O4D9 O3C9:O3E9:O3G9',
    expectedBehavior: 'C major -> F major -> G major -> C major chord progression',
  },
]

// ============================================
// Complete Songs
// ============================================
export const COMBINED_TESTS: SoundTestCase[] = [
  {
    id: 'combined-twinkle',
    category: 'Complete Songs',
    name: 'Twinkle Twinkle Little Star',
    description: 'Simple nursery rhyme',
    musicString: 'T3 CCGGAAG7 FFEEDDC7',
    expectedBehavior: 'Should recognize "Twinkle Twinkle Little Star" melody',
  },
  {
    id: 'combined-scale-updown',
    category: 'Complete Songs',
    name: 'Scale Up and Down',
    description: 'C major scale ascending and descending',
    musicString: 'T4 O2C5D5E5F5G5A5B5O3C5 O3C5O2B5A5G5F5E5D5C5',
    expectedBehavior: 'Scale goes up, then back down',
  },
]
