/**
 * Sprite and animation type definitions for Family BASIC sprite system
 */

import type { MoveCharacterCode, Tile } from '@/shared/data/types'

/**
 * Color combination: 4 color codes (0x00-0x3C)
 * From palette.ts: ColorCombination = [number, number, number, number]
 */
export type ColorCombination = [number, number, number, number]

/**
 * DEF SPRITE definition (static sprites)
 * Grammar: DEF SPRITE n, (A, B, C, D, E) = char. set
 */
export interface DefSpriteDefinition {
  spriteNumber: number // n: 0-7
  colorCombination: number // A: 0-3 (color chart index)
  size: 0 | 1 // B: 0=8×8, 1=16×16
  priority: 0 | 1 // C: 0=front, 1=behind background
  invertX: 0 | 1 // D: 0=normal, 1=left-right inverted
  invertY: 0 | 1 // E: 0=normal, 1=up-down inverted
  characterSet: number[] | string // char. set: CHR$(N) codes or "@ABC"
  tiles: Tile[] // Converted tile data
}

/**
 * Sprite state (combines DEF SPRITE and SPRITE commands)
 */
export interface SpriteState {
  spriteNumber: number // 0-7
  x: number // Pixel X coordinate (0-255)
  y: number // Pixel Y coordinate (0-239)
  visible: boolean // Whether sprite is displayed
  priority: number // 0=front, 1=behind background
  definition: DefSpriteDefinition | null // DEF SPRITE definition
}

/**
 * DEF MOVE definition (animated character movement)
 * Grammar: DEF MOVE(n) = SPRITE(A, B, C, D, E, F)
 */
export interface MoveDefinition {
  actionNumber: number // n: 0-7
  characterType: MoveCharacterCode // A: 0-15 (Mario, Lady, etc.)
  direction: number // B: 0-8 (0=none, 1=up, 2=up-right, etc.)
  speed: number // C: 1-255 (60/C dots per second)
  distance: number // D: 1-255 (total distance = 2×D dots)
  priority: number // E: 0=front, 1=behind background
  colorCombination: number // F: 0-3
}

/**
 * Movement state (active animation)
 */
export interface MovementState {
  actionNumber: number
  definition: MoveDefinition
  startX: number // Starting X position
  startY: number // Starting Y position
  currentX: number // Current X position (updated each frame)
  currentY: number // Current Y position (updated each frame)
  remainingDistance: number // Remaining distance in dots
  totalDistance: number // Total distance (2×D)
  speedDotsPerSecond: number // 60/C dots per second
  directionDeltaX: number // X direction component (-1, 0, or 1)
  directionDeltaY: number // Y direction component (-1, 0, or 1)
  isActive: boolean // Whether movement is active
  currentFrameIndex: number // Current frame in animation sequence
  frameCounter: number // Frame counter for timing (0-7)
}

/**
 * Per-frame inversion configuration
 */
export interface FrameInversionConfig {
  invertX?: boolean
  invertY?: boolean
}

/**
 * Animation sequence for a character
 */
export interface AnimationSequence {
  name: string // "WALK", "LADDER", "JUMP", etc.
  frames: Tile[][] // Frame data: each frame is an array of tiles (1 tile for 8×8, 4 tiles for 16×16)
  frameRate: number // Frames per sprite switch (default: 8)
  looping: boolean // Whether sequence loops
  frameInversions?: FrameInversionConfig[] // Per-frame inversion flags (one per frame)
}

/**
 * Direction-to-sequence mapping
 */
export interface DirectionMapping {
  sequence: string // Sequence name (e.g., "WALK")
  invertX: boolean // Horizontal inversion
  invertY: boolean // Vertical inversion
}

/**
 * Character animation configuration
 */
export interface CharacterAnimationConfig {
  characterType: MoveCharacterCode
  sequences: Map<string, AnimationSequence>
  directionMappings: Map<number, DirectionMapping>
}
