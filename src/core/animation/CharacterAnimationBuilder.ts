/**
 * Character Animation Builder
 * Builds animation sequences and direction mappings from CHARACTER_SPRITES data
 */

import type {
  AnimationSequence,
  CharacterAnimationConfig,
  DirectionMapping,
} from '@/core/sprite/types'
import { CHARACTER_SPRITES } from '@/shared/data/sprites'
import type { MoveCharacterCode, SpriteDefinition, Tile } from '@/shared/data/types'
import {
  isEightTileSprite,
  isFourTileSprite,
  isOneTileSprite,
  isSixTileSprite,
} from '@/shared/data/types'

/**
 * Extract sequence name from sprite name
 * Examples:
 * - "Mario (WALK1)" → "WALK"
 * - "Mario (LADDER)" → "LADDER"
 * - "Lady (JUMP)" → "JUMP"
 */
function extractSequenceName(spriteName: string): string {
  // Match pattern: "CharacterName (SEQUENCENAME)" or "CharacterName (SEQUENCENAME123)"
  const match = spriteName.match(/\((\w+)/)
  if (match?.[1]) {
    // Remove trailing numbers (e.g., "WALK1" → "WALK")
    return match[1].replace(/\d+$/, '')
  }
  return ''
}

/**
 * Extract all tiles from a sprite definition
 * Handles 1-tile, 4-tile, 6-tile, and 8-tile sprites
 */
function extractTilesFromSprite(sprite: SpriteDefinition): number[][][] {
  if (isOneTileSprite(sprite)) {
    return [sprite.tiles]
  } else if (isFourTileSprite(sprite)) {
    return sprite.tiles
  } else if (isSixTileSprite(sprite)) {
    return sprite.tiles
  } else if (isEightTileSprite(sprite)) {
    return sprite.tiles
  }
  return []
}

/**
 * Build animation sequences for a character type
 * Groups sprites by sequence name and creates AnimationSequence objects
 */
function buildSequencesForCharacter(
  characterCode: MoveCharacterCode,
  allSprites: SpriteDefinition[]
): Map<string, AnimationSequence> {
  // Filter sprites for this character
  const characterSprites = allSprites.filter(
    sprite => sprite.moveCharacterCode === characterCode
  )

  // Group sprites by sequence name
  const sequenceGroups = new Map<string, SpriteDefinition[]>()

  for (const sprite of characterSprites) {
    const sequenceName = extractSequenceName(sprite.name)
    if (!sequenceName) continue

    const existing = sequenceGroups.get(sequenceName) ?? []
    existing.push(sprite)
    sequenceGroups.set(sequenceName, existing)
  }

  // Build AnimationSequence objects
  const sequences = new Map<string, AnimationSequence>()

  for (const [sequenceName, sprites] of sequenceGroups.entries()) {
    // Sort sprites by name to ensure correct frame order
    // "WALK1" comes before "WALK2", etc.
    const sortedSprites = sprites.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })

    // Each sprite definition is one frame
    // Extract tiles from each sprite to form frames
    const frames: Tile[][] = []
    for (const sprite of sortedSprites) {
      const tiles = extractTilesFromSprite(sprite)
      // Each frame is an array of tiles (1 for 8×8, 4 for 16×16, etc.)
      frames.push(tiles)
    }

    sequences.set(sequenceName, {
      name: sequenceName,
      frames,
      frameRate: 8, // Default: 8 frames per sprite switch
      looping: true, // Most sequences loop
    })
  }

  return sequences
}

/**
 * Build direction mappings for a character type
 * Maps movement directions (0-8) to sequence names and inversion flags
 */
function buildDirectionMappings(
  characterCode: MoveCharacterCode,
  sequences: Map<string, AnimationSequence>
): Map<number, DirectionMapping> {
  const mappings = new Map<number, DirectionMapping>()

  // Default mappings for common character types
  // These can be customized per character type
  const hasWalk = sequences.has('WALK')
  const hasLadder = sequences.has('LADDER')
  const hasDown = sequences.has('DOWN')

  // Direction 0: None - use first available sequence or WALK
  if (hasWalk) {
    mappings.set(0, { sequence: 'WALK', invertX: false, invertY: false })
  } else if (sequences.size > 0) {
    const firstSequence = Array.from(sequences.keys())[0]
    if (firstSequence) {
      mappings.set(0, { sequence: firstSequence, invertX: false, invertY: false })
    }
  }

  // Direction 1: Up
  if (hasLadder) {
    mappings.set(1, { sequence: 'LADDER', invertX: false, invertY: false })
  } else if (hasWalk) {
    mappings.set(1, { sequence: 'WALK', invertX: false, invertY: false })
  }

  // Direction 2: Up-right
  if (hasWalk) {
    mappings.set(2, { sequence: 'WALK', invertX: false, invertY: false })
  }

  // Direction 3: Right
  if (hasWalk) {
    mappings.set(3, { sequence: 'WALK', invertX: false, invertY: false })
  }

  // Direction 4: Down-right
  if (hasWalk) {
    mappings.set(4, { sequence: 'WALK', invertX: false, invertY: false })
  }

  // Direction 5: Down
  if (hasDown) {
    mappings.set(5, { sequence: 'DOWN', invertX: false, invertY: false })
  } else if (hasWalk) {
    mappings.set(5, { sequence: 'WALK', invertX: false, invertY: false })
  }

  // Direction 6: Down-left
  if (hasWalk) {
    mappings.set(6, { sequence: 'WALK', invertX: true, invertY: false })
  }

  // Direction 7: Left
  if (hasWalk) {
    mappings.set(7, { sequence: 'WALK', invertX: true, invertY: false })
  }

  // Direction 8: Up-left
  if (hasLadder) {
    mappings.set(8, { sequence: 'LADDER', invertX: true, invertY: false })
  } else if (hasWalk) {
    mappings.set(8, { sequence: 'WALK', invertX: true, invertY: false })
  }

  return mappings
}

/**
 * Build character animation configuration for a character type
 */
export function buildCharacterAnimationConfig(
  characterCode: MoveCharacterCode
): CharacterAnimationConfig | null {
  const sequences = buildSequencesForCharacter(characterCode, CHARACTER_SPRITES)

  if (sequences.size === 0) {
    return null
  }

  const directionMappings = buildDirectionMappings(characterCode, sequences)

  return {
    characterType: characterCode,
    sequences,
    directionMappings,
  }
}

// Cache for character animation configs (built once, reused)
let cachedConfigs: Map<MoveCharacterCode, CharacterAnimationConfig> | null = null

/**
 * Build all character animation configurations
 * Returns a map of character code to configuration
 * Results are cached after first call
 */
export function buildAllCharacterAnimationConfigs(): Map<
  MoveCharacterCode,
  CharacterAnimationConfig
> {
  if (cachedConfigs) {
    return cachedConfigs
  }

  const configs = new Map<MoveCharacterCode, CharacterAnimationConfig>()

  // Build configs for all 16 character types (0-15)
  for (let code = 0; code <= 15; code++) {
    const config = buildCharacterAnimationConfig(code as MoveCharacterCode)
    if (config) {
      configs.set(code as MoveCharacterCode, config)
    }
  }

  cachedConfigs = configs
  return configs
}

/**
 * Get sequence for a movement based on character type and direction
 */
export function getSequenceForMovement(
  characterCode: MoveCharacterCode,
  direction: number,
  configs: Map<MoveCharacterCode, CharacterAnimationConfig>
): {
  sequence: AnimationSequence | null
  invertX: boolean
  invertY: boolean
} {
  const config = configs.get(characterCode)
  if (!config) {
    return { sequence: null, invertX: false, invertY: false }
  }

  const mapping = config.directionMappings.get(direction)
  if (!mapping) {
    // Fallback to first available sequence
    const firstSequence = Array.from(config.sequences.values())[0]
    return {
      sequence: firstSequence ?? null,
      invertX: false,
      invertY: false,
    }
  }

  const sequence = config.sequences.get(mapping.sequence)
  return {
    sequence: sequence ?? null,
    invertX: mapping.invertX,
    invertY: mapping.invertY,
  }
}
