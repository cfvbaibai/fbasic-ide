/**
 * Character Animation Builder
 * Builds animation sequences and direction mappings from characterSequenceConfig
 */

import {
  type CharacterSequenceConfig,
  getCharacterSequenceConfig,
} from '@/core/animation/characterSequenceConfig'
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
 * Find sprite by name in CHARACTER_SPRITES
 */
function findSpriteByName(spriteName: string, characterCode: MoveCharacterCode): SpriteDefinition | null {
  return CHARACTER_SPRITES.find(
    sprite => sprite.name === spriteName && sprite.moveCharacterCode === characterCode
  ) ?? null
}

/**
 * Build direction mappings from characterSequenceConfig
 * Maps movement directions (0-8) to sequence names and inversion flags
 */
function buildDirectionMappingsFromConfig(
  _characterCode: MoveCharacterCode,
  config: CharacterSequenceConfig,
  _sequences: Map<string, AnimationSequence>
): Map<number, DirectionMapping> {
  const mappings = new Map<number, DirectionMapping>()

  // Build mappings from config
  for (const [direction, directionConfig] of config.directions.entries()) {
    // Create a unique sequence name for this direction
    // Format: "DIR{0-8}" to avoid conflicts
    const sequenceName = `DIR${direction}`
    
    // Use the first frame's inversion as the direction-level inversion
    // (Per-frame inversions can be handled later in rendering if needed)
    const firstFrameInversion = directionConfig.frameInversions[0]
    const invertX = firstFrameInversion?.invertX ?? false
    const invertY = firstFrameInversion?.invertY ?? false

    mappings.set(direction, {
      sequence: sequenceName,
      invertX,
      invertY,
    })
  }

  return mappings
}

/**
 * Build sequences from characterSequenceConfig
 * Creates AnimationSequence objects from the sprite names in the config
 */
function buildSequencesFromConfig(
  characterCode: MoveCharacterCode,
  config: CharacterSequenceConfig
): Map<string, AnimationSequence> {
  const sequences = new Map<string, AnimationSequence>()

  // Build a sequence for each direction
  for (const [direction, directionConfig] of config.directions.entries()) {
    const sequenceName = `DIR${direction}`
    const frames: Tile[][] = []

    // Look up each sprite by name and extract tiles
    for (const spriteName of directionConfig.spriteNames) {
      const sprite = findSpriteByName(spriteName, characterCode)
      if (!sprite) {
        console.warn(`[CharacterAnimationBuilder] Sprite not found: ${spriteName} for character ${characterCode}`)
        continue
      }

      const tiles = extractTilesFromSprite(sprite)
      if (tiles.length > 0) {
        frames.push(tiles)
      }
    }

    if (frames.length > 0) {
      sequences.set(sequenceName, {
        name: sequenceName,
        frames,
        frameRate: directionConfig.frameRate ?? 8,
        looping: directionConfig.looping ?? true,
        frameInversions: directionConfig.frameInversions, // Store per-frame inversions
      })
    }
  }

  return sequences
}

/**
 * Build character animation configuration for a character type
 * Uses characterSequenceConfig if available, otherwise falls back to old method
 */
export function buildCharacterAnimationConfig(
  characterCode: MoveCharacterCode
): CharacterAnimationConfig | null {
  // Try to use characterSequenceConfig first
  const config = getCharacterSequenceConfig(characterCode)
  
  if (config) {
    // Use config-based approach
    const sequences = buildSequencesFromConfig(characterCode, config)
    
    if (sequences.size === 0) {
      return null
    }

    const directionMappings = buildDirectionMappingsFromConfig(characterCode, config, sequences)

    return {
      characterType: characterCode,
      sequences,
      directionMappings,
    }
  }

  // Fallback to old method for characters without config
  const sequences = buildSequencesForCharacter(characterCode, CHARACTER_SPRITES)

  if (sequences.size === 0) {
    return null
  }

  // For fallback, create simple mappings (this should rarely be used)
  const directionMappings = new Map<number, DirectionMapping>()
  const firstSequence = Array.from(sequences.keys())[0]
  if (firstSequence) {
    for (let dir = 0; dir <= 8; dir++) {
      directionMappings.set(dir, {
        sequence: firstSequence,
        invertX: false,
        invertY: false,
      })
    }
  }

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
