/**
 * Explicit Character Animation Sequence Configuration
 * 
 * This file provides accurate, explicit configuration for sprite animation sequences.
 * Each character type (0-15) has direction-specific sprite lists (0-8).
 * 
 * Structure:
 * - Character type (0-15): MARIO, LADY, etc.
 * - For each direction (0-8): specific sprite names in frame order
 * - Frame rates and looping behavior per direction
 * - Per-frame inversion flags (frameInversions) - one per sprite name
 * 
 * Example: MARIO + Direction 1 (Up) alternates between normal and X-inversed LADDER
 */

import type { MoveCharacterCode } from '@/shared/data/types'

/**
 * Per-frame inversion configuration
 */
export interface FrameInversionConfig {
  invertX?: boolean
  invertY?: boolean
}

/**
 * Direction-specific sprite configuration
 */
export interface DirectionSpriteConfig {
  /** Exact sprite names in frame order for this direction */
  spriteNames: string[]
  /** Frame rate (frames per sprite switch, default: 8) */
  frameRate?: number
  /** Whether sequence loops (default: true) */
  looping?: boolean
  /** Per-frame inversion flags (one per sprite name) */
  /** Required - must specify inversion for each frame */
  frameInversions: FrameInversionConfig[]
}

/**
 * Complete character animation configuration
 * Maps each direction (0-8) to its sprite list
 */
export interface CharacterSequenceConfig {
  /** Character type (0-15) */
  characterType: MoveCharacterCode
  /** Direction-specific sprite configurations */
  directions: Map<number, DirectionSpriteConfig>
}

/**
 * Helper function to create frame inversions array
 */
function createFrameInversions(
  count: number,
  invertX: boolean = false,
  invertY: boolean = false
): FrameInversionConfig[] {
  return Array(count).fill(null).map(() => ({ invertX, invertY }))
}

/**
 * Complete configuration for all 16 character types
 */
export const CHARACTER_SEQUENCE_CONFIGS: CharacterSequenceConfig[] = [
  // MARIO (0)
  {
    characterType: 0, // MoveCharacterCode.MARIO
    directions: new Map([
      [0, { spriteNames: ['Mario (DOWN)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(1) }],
      [1, { 
        spriteNames: ['Mario (LADDER)', 'Mario (LADDER)'], 
        frameRate: 8, 
        looping: true,
        frameInversions: [
          { invertX: false, invertY: false },
          { invertX: true, invertY: false }
        ]
      }],
      [2, { spriteNames: ['Mario (JUMP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, true, false) }],
      [3, { spriteNames: ['Mario (WALK1)', 'Mario (WALK2)', 'Mario (WALK3)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(3, true, false) }],
      [4, { spriteNames: ['Mario (JUMP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, true, false) }],
      [5, { spriteNames: ['Mario (LADDER)', 'Mario (LADDER)'], frameRate: 8, looping: false, frameInversions: [
        { invertX: false, invertY: false },
        { invertX: true, invertY: false }
      ] }], // Down
      [6, { spriteNames: ['Mario (JUMP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
      [7, { spriteNames: ['Mario (WALK1)', 'Mario (WALK2)', 'Mario (WALK3)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(3) }],
      [8, { spriteNames: ['Mario (JUMP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
    ]),
  },

  // LADY (1)
  {
    characterType: 1, // MoveCharacterCode.LADY
    directions: new Map([
      [0, { spriteNames: ['Lady (DOWN)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(1) }],
      [1, { 
        spriteNames: ['Lady (LADDER)', 'Lady (LADDER)'], 
        frameRate: 8, 
        looping: true,
        frameInversions: [
          { invertX: false, invertY: false },
          { invertX: true, invertY: false }
        ]
      }],
      [2, { spriteNames: ['Lady (JUMP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, true, false) }],
      [3, { spriteNames: ['Lady (WALK1)', 'Lady (WALK2)', 'Lady (WALK3)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(3, true, false) }],
      [4, { spriteNames: ['Lady (JUMP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, true, false) }],
      [5, { spriteNames: ['Lady (LADDER)', 'Lady (LADDER)'], frameRate: 8, looping: false, frameInversions: [
        { invertX: false, invertY: false },
        { invertX: true, invertY: false }
      ] }], // Down
      [6, { spriteNames: ['Lady (JUMP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
      [7, { spriteNames: ['Lady (WALK1)', 'Lady (WALK2)', 'Lady (WALK3)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(3) }],
      [8, { spriteNames: ['Lady (JUMP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
    ]),
  },

  // FIGHTER_FLY (2)
  {
    characterType: 2, // MoveCharacterCode.FIGHTER_FLY
    directions: new Map([
      [0, { spriteNames: ['Fighter Fly (1)', 'Fighter Fly (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [1, { spriteNames: ['Fighter Fly (1)', 'Fighter Fly (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [2, { spriteNames: ['Fighter Fly (1)', 'Fighter Fly (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [3, { spriteNames: ['Fighter Fly (1)', 'Fighter Fly (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [4, { spriteNames: ['Fighter Fly (1)', 'Fighter Fly (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [5, { spriteNames: ['Fighter Fly (1)', 'Fighter Fly (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [6, { spriteNames: ['Fighter Fly (1)', 'Fighter Fly (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [7, { spriteNames: ['Fighter Fly (1)', 'Fighter Fly (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [8, { spriteNames: ['Fighter Fly (1)', 'Fighter Fly (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
    ]),
  },

  // ACHILLES (3)
  {
    characterType: 3, // MoveCharacterCode.ACHILLES
    directions: new Map([
      [0, { spriteNames: ['Achilles (LEFT1)', 'Achilles (LEFT2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [1, { spriteNames: ['Achilles (TOP1)', 'Achilles (TOP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [2, { spriteNames: ['Achilles (LEFTUP1)', 'Achilles (LEFTUP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [3, { spriteNames: ['Achilles (LEFT1)', 'Achilles (LEFT2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [4, { spriteNames: ['Achilles (LEFTUP1)', 'Achilles (LEFTUP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true, true) }],
      [5, { spriteNames: ['Achilles (TOP1)', 'Achilles (TOP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, false, true) }],
      [6, { spriteNames: ['Achilles (LEFTUP1)', 'Achilles (LEFTUP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, false, true) }],
      [7, { spriteNames: ['Achilles (LEFT1)', 'Achilles (LEFT2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [8, { spriteNames: ['Achilles (LEFTUP1)', 'Achilles (LEFTUP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
    ]),
  },

  // PENGUIN (4)
  {
    characterType: 4, // MoveCharacterCode.PENGUIN
    directions: new Map([
      [0, { spriteNames: ['Penguin (FRONT)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
      [1, { spriteNames: ['Penguin (BACK)', 'Penguin (BACK)'], frameRate: 8, looping: true, frameInversions: [
        { invertX: false, invertY: false },
        { invertX: true, invertY: false }
      ] }],
      [2, { spriteNames: ['Penguin (LEFTSTEP1)', 'Penguin (LEFTSTEP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [3, { spriteNames: ['Penguin (LEFTSTEP1)', 'Penguin (LEFTSTEP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [4, { spriteNames: ['Penguin (LEFTSTEP1)', 'Penguin (LEFTSTEP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [5, { spriteNames: ['Penguin (FRONT)', 'Penguin (FRONT)'], frameRate: 8, looping: true, frameInversions: [
        { invertX: false, invertY: false },
        { invertX: true, invertY: false }
      ] }],
      [6, { spriteNames: ['Penguin (LEFTSTEP1)', 'Penguin (LEFTSTEP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }], 
      [7, { spriteNames: ['Penguin (LEFTSTEP1)', 'Penguin (LEFTSTEP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }], 
      [8, { spriteNames: ['Penguin (LEFTSTEP1)', 'Penguin (LEFTSTEP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
    ]),
  },

  // FIREBALL (5)
  {
    characterType: 5, // MoveCharacterCode.FIREBALL
    directions: new Map([
      [0, { spriteNames: ['Fireball (1)', 'Fireball (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [1, { spriteNames: ['Fireball (1)', 'Fireball (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [2, { spriteNames: ['Fireball (1)', 'Fireball (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [3, { spriteNames: ['Fireball (1)', 'Fireball (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [4, { spriteNames: ['Fireball (1)', 'Fireball (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [5, { spriteNames: ['Fireball (1)', 'Fireball (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [6, { spriteNames: ['Fireball (1)', 'Fireball (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [7, { spriteNames: ['Fireball (1)', 'Fireball (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [8, { spriteNames: ['Fireball (1)', 'Fireball (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
    ]),
  },

  // CAR (6)
  {
    characterType: 6, // MoveCharacterCode.CAR
    directions: new Map([
      [0, { spriteNames: ['Car (LEFT1)', 'Car (LEFT2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [1, { spriteNames: ['Car (UP1)', 'Car (UP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [2, { spriteNames: ['Car (LEFTUP1)', 'Car (LEFTUP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [3, { spriteNames: ['Car (LEFT1)', 'Car (LEFT2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [4, { spriteNames: ['Car (LEFTUP1)', 'Car (LEFTUP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true, true) }],
      [5, { spriteNames: ['Car (UP1)', 'Car (UP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, false, true) }],
      [6, { spriteNames: ['Car (LEFTUP1)', 'Car (LEFTUP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, false, true) }],
      [7, { spriteNames: ['Car (LEFT1)', 'Car (LEFT2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [8, { spriteNames: ['Car (LEFTUP1)', 'Car (LEFTUP2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
    ]),
  },

  // SPINNER (7)
  {
    characterType: 7, // MoveCharacterCode.SPINNER
    directions: new Map([
      [0, { spriteNames: ['Spinner (1)', 'Spinner (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [1, { spriteNames: ['Spinner (1)', 'Spinner (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [2, { spriteNames: ['Spinner (1)', 'Spinner (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [3, { spriteNames: ['Spinner (1)', 'Spinner (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [4, { spriteNames: ['Spinner (1)', 'Spinner (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [5, { spriteNames: ['Spinner (1)', 'Spinner (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [6, { spriteNames: ['Spinner (1)', 'Spinner (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [7, { spriteNames: ['Spinner (1)', 'Spinner (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [8, { spriteNames: ['Spinner (1)', 'Spinner (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
    ]),
  },

  // STAR_KILLER (8)
  {
    characterType: 8, // MoveCharacterCode.STAR_KILLER
    directions: new Map([
      [0, { spriteNames: ['Star Killer (LEFT)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
      [1, { spriteNames: ['Star Killer (UP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
      [2, { spriteNames: ['Star Killer (LEFTUP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, true) }],
      [3, { spriteNames: ['Star Killer (LEFT)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, true) }],
      [4, { spriteNames: ['Star Killer (LEFTUP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, true, true) }],
      [5, { spriteNames: ['Star Killer (UP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, false, true) }],
      [6, { spriteNames: ['Star Killer (LEFTUP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, false, true) }],
      [7, { spriteNames: ['Star Killer (LEFT)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
      [8, { spriteNames: ['Star Killer (LEFTUP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
    ]),
  },

  // STARSHIP (9)
  {
    characterType: 9, // MoveCharacterCode.STARSHIP
    directions: new Map([
      [0, { spriteNames: ['Starship (LEFT)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
      [1, { spriteNames: ['Starship (UP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
      [2, { spriteNames: ['Starship (LEFTUP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, true) }],
      [3, { spriteNames: ['Starship (LEFT)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, true) }],
      [4, { spriteNames: ['Starship (LEFTUP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, true, true) }],
      [5, { spriteNames: ['Starship (UP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, false, true) }],
      [6, { spriteNames: ['Starship (LEFTUP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1, false, true) }],
      [7, { spriteNames: ['Starship (LEFT)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
      [8, { spriteNames: ['Starship (LEFTUP)'], frameRate: 8, looping: false, frameInversions: createFrameInversions(1) }],
    ]),
  },

  // EXPLOSION (10)
  {
    characterType: 10, // MoveCharacterCode.EXPLOSION
    directions: new Map([
      [0, { spriteNames: ['Explosion (1)', 'Explosion (2)'], frameRate: 4, looping: false, frameInversions: createFrameInversions(2) }],
      [1, { spriteNames: ['Explosion (1)', 'Explosion (2)'], frameRate: 4, looping: false, frameInversions: createFrameInversions(2) }],
      [2, { spriteNames: ['Explosion (1)', 'Explosion (2)'], frameRate: 4, looping: false, frameInversions: createFrameInversions(2) }],
      [3, { spriteNames: ['Explosion (1)', 'Explosion (2)'], frameRate: 4, looping: false, frameInversions: createFrameInversions(2) }],
      [4, { spriteNames: ['Explosion (1)', 'Explosion (2)'], frameRate: 4, looping: false, frameInversions: createFrameInversions(2) }],
      [5, { spriteNames: ['Explosion (1)', 'Explosion (2)'], frameRate: 4, looping: false, frameInversions: createFrameInversions(2) }],
      [6, { spriteNames: ['Explosion (1)', 'Explosion (2)'], frameRate: 4, looping: false, frameInversions: createFrameInversions(2) }],
      [7, { spriteNames: ['Explosion (1)', 'Explosion (2)'], frameRate: 4, looping: false, frameInversions: createFrameInversions(2) }],
      [8, { spriteNames: ['Explosion (1)', 'Explosion (2)'], frameRate: 4, looping: false, frameInversions: createFrameInversions(2) }],
    ]),
  },

  // SMILEY (11)
  {
    characterType: 11, // MoveCharacterCode.SMILEY
    directions: new Map([
      [0, { spriteNames: ['Smiley (1)', 'Smiley (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [1, { spriteNames: ['Smiley (1)', 'Smiley (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [2, { spriteNames: ['Smiley (1)', 'Smiley (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [3, { spriteNames: ['Smiley (1)', 'Smiley (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [4, { spriteNames: ['Smiley (1)', 'Smiley (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [5, { spriteNames: ['Smiley (1)', 'Smiley (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [6, { spriteNames: ['Smiley (1)', 'Smiley (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [7, { spriteNames: ['Smiley (1)', 'Smiley (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [8, { spriteNames: ['Smiley (1)', 'Smiley (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
    ]),
  },

  // LASER (12)
  {
    characterType: 12, // MoveCharacterCode.LASER
    directions: new Map([
      [0, { spriteNames: ['Laser (HORIZONTAL1)', 'Laser (HORIZONTAL2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [1, { spriteNames: ['Laser (VERTICAL1)', 'Laser (VERTICAL2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [2, { spriteNames: ['Laser (DIAGONAL1)', 'Laser (DIAGONAL2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [3, { spriteNames: ['Laser (HORIZONTAL1)', 'Laser (HORIZONTAL2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [4, { spriteNames: ['Laser (DIAGONAL1)', 'Laser (DIAGONAL2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true, true) }],
      [5, { spriteNames: ['Laser (VERTICAL1)', 'Laser (VERTICAL2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, false, true) }],
      [6, { spriteNames: ['Laser (DIAGONAL1)', 'Laser (DIAGONAL2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, false, true) }],
      [7, { spriteNames: ['Laser (HORIZONTAL1)', 'Laser (HORIZONTAL2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [8, { spriteNames: ['Laser (DIAGONAL1)', 'Laser (DIAGONAL2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
    ]),
  },

  // SHELL_CREEPER (13)
  {
    characterType: 13, // MoveCharacterCode.SHELL_CREEPER
    directions: new Map([
      [0, { spriteNames: ['Shell Creeper (1)', 'Shell Creeper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [1, { spriteNames: ['Shell Creeper (1)', 'Shell Creeper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [2, { spriteNames: ['Shell Creeper (1)', 'Shell Creeper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [3, { spriteNames: ['Shell Creeper (1)', 'Shell Creeper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [4, { spriteNames: ['Shell Creeper (1)', 'Shell Creeper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [5, { spriteNames: ['Shell Creeper (1)', 'Shell Creeper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [6, { spriteNames: ['Shell Creeper (1)', 'Shell Creeper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [7, { spriteNames: ['Shell Creeper (1)', 'Shell Creeper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [8, { spriteNames: ['Shell Creeper (1)', 'Shell Creeper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
    ]),
  },

  // SIDE_STEPPER (14)
  {
    characterType: 14, // MoveCharacterCode.SIDE_STEPPER
    directions: new Map([
      [0, { spriteNames: ['Side Stepper (1)', 'Side Stepper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [1, { spriteNames: ['Side Stepper (1)', 'Side Stepper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [2, { spriteNames: ['Side Stepper (1)', 'Side Stepper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [3, { spriteNames: ['Side Stepper (1)', 'Side Stepper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [4, { spriteNames: ['Side Stepper (1)', 'Side Stepper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [5, { spriteNames: ['Side Stepper (1)', 'Side Stepper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [6, { spriteNames: ['Side Stepper (1)', 'Side Stepper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [7, { spriteNames: ['Side Stepper (1)', 'Side Stepper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [8, { spriteNames: ['Side Stepper (1)', 'Side Stepper (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
    ]),
  },

  // NITPICKER (15)
  {
    characterType: 15, // MoveCharacterCode.NITPICKER
    directions: new Map([
      [0, { spriteNames: ['Nit Picker (1)', 'Nit Picker (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [1, { spriteNames: ['Nit Picker (1)', 'Nit Picker (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [2, { spriteNames: ['Nit Picker (1)', 'Nit Picker (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [3, { spriteNames: ['Nit Picker (1)', 'Nit Picker (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [4, { spriteNames: ['Nit Picker (1)', 'Nit Picker (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2, true) }],
      [5, { spriteNames: ['Nit Picker (1)', 'Nit Picker (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [6, { spriteNames: ['Nit Picker (1)', 'Nit Picker (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [7, { spriteNames: ['Nit Picker (1)', 'Nit Picker (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
      [8, { spriteNames: ['Nit Picker (1)', 'Nit Picker (2)'], frameRate: 8, looping: true, frameInversions: createFrameInversions(2) }],
    ]),
  },
]

/**
 * Get configuration for a specific character type
 */
/**
 * Get the explicit character sequence configuration for a character type (0-15).
 * @param characterType - MoveCharacterCode (0-15)
 * @returns CharacterSequenceConfig if found, otherwise null
 */
export function getCharacterSequenceConfig(
  characterType: MoveCharacterCode
): CharacterSequenceConfig | null {
  return CHARACTER_SEQUENCE_CONFIGS.find(config => config.characterType === characterType) ?? null
}
