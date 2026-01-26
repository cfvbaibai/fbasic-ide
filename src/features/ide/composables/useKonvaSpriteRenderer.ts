/**
 * Konva sprite renderer - Handles rendering of sprites using Konva.js
 * Supports both static sprites (DEF SPRITE) and animated sprites (DEF MOVE)
 */

import Konva from 'konva'

import { buildAllCharacterAnimationConfigs, getSequenceForMovement } from '@/core/animation/CharacterAnimationBuilder'
import type { ColorCombination, MovementState, SpriteState } from '@/core/sprite/types'
import { COLORS, SPRITE_PALETTES } from '@/shared/data/palette'
import type { Tile } from '@/shared/data/types'

/**
 * Cache for pre-rendered sprite images (HTMLImageElement)
 * Key: `${tileData}-${colorCombination}-${invertX}-${invertY}`
 */
const spriteImageCache = new Map<string, HTMLImageElement>()

/**
 * Cache for frame images per movement (for animated sprites)
 * Key: `${actionNumber}-${characterType}-${direction}-${colorCombination}` -> HTMLImageElement[]
 * Includes character type to prevent using wrong frames when action is redefined
 */
const frameImageCache = new Map<string, HTMLImageElement[]>()

/**
 * Cache for static sprite images (DEF SPRITE)
 * Key: `${spriteNumber}-${tiles}-${colorCombination}-${invertX}-${invertY}`
 */
const staticSpriteImageCache = new Map<string, HTMLImageElement>()

/**
 * Animation configs (cached, built once)
 */
let animationConfigs: ReturnType<typeof buildAllCharacterAnimationConfigs> | null = null

/**
 * Convert tile data to HTMLImageElement for Konva
 * Handles both single tile (8×8) and multiple tiles (16×16 = 4 tiles)
 */
async function createSpriteImageFromTiles(
  tiles: Tile[],
  colorCombination: ColorCombination,
  invertX: boolean,
  invertY: boolean
): Promise<HTMLImageElement> {
  // Create cache key
  const tilesKey = tiles.map(t => t.map(row => row.join('')).join('-')).join('|')
  const colorKey = colorCombination.join(',')
  const cacheKey = `${tilesKey}-${colorKey}-${invertX ? '1' : '0'}-${invertY ? '1' : '0'}`

  if (spriteImageCache.has(cacheKey)) {
    return spriteImageCache.get(cacheKey)!
  }

  // Determine sprite size
  const spriteSize = tiles.length === 4 ? 16 : 8

  // Create canvas to render sprite
  const canvas = document.createElement('canvas')
  canvas.width = spriteSize
  canvas.height = spriteSize
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) throw new Error('Failed to get canvas context')

  // Initialize to transparent
  ctx.clearRect(0, 0, spriteSize, spriteSize)

  if (tiles.length === 4) {
    // 16×16 sprite: 4 tiles in 2×2 grid
    // Tile layout: [0] [1] / [2] [3]
    const tileArray = tiles as [Tile, Tile, Tile, Tile]

    // Apply tile reordering for inversions
    // X-inversion: [0,1,2,3] → [1,0,3,2] (swaps left-right in each row)
    // Y-inversion: [0,1,2,3] → [2,3,0,1] (swaps top-bottom rows)
    // Both: apply Y first, then X → [2,3,0,1] → [3,2,1,0]
    let reorderedTiles = tileArray
    if (invertY && invertX) {
      // Both inversions: [0,1,2,3] → [3,2,1,0]
      reorderedTiles = [tileArray[3], tileArray[2], tileArray[1], tileArray[0]]
    } else if (invertY) {
      // Y-inversion only: [0,1,2,3] → [2,3,0,1]
      reorderedTiles = [tileArray[2], tileArray[3], tileArray[0], tileArray[1]]
    } else if (invertX) {
      // X-inversion only: [0,1,2,3] → [1,0,3,2]
      reorderedTiles = [tileArray[1], tileArray[0], tileArray[3], tileArray[2]]
    }

    // Render each tile
    for (let tileIdx = 0; tileIdx < 4; tileIdx++) {
      const tile = reorderedTiles[tileIdx]
      if (!tile) continue

      const tileX = (tileIdx % 2) * 8
      const tileY = Math.floor(tileIdx / 2) * 8

      for (let row = 0; row < 8; row++) {
        const tileRow = tile[row]
        if (!tileRow) continue

        for (let col = 0; col < 8; col++) {
          // Calculate source coordinates (with inversion)
          // Note: tiles are already reordered above, so we still flip pixels within each tile
          const srcRow = invertY ? 7 - row : row
          const srcCol = invertX ? 7 - col : col
          const pixelValue = tile[srcRow]?.[srcCol] ?? 0

          if (pixelValue === 0) continue // Transparent

          const colorCode = colorCombination[pixelValue]
          if (colorCode === undefined) continue

          const color = COLORS[colorCode] ?? COLORS[0] ?? '#000000'
          ctx.fillStyle = color
          ctx.fillRect(tileX + col, tileY + row, 1, 1)
        }
      }
    }
  } else if (tiles.length === 1) {
    // 8×8 sprite: single tile
    const tile = tiles[0]
    if (tile) {
      for (let row = 0; row < 8; row++) {
        const tileRow = tile[row]
        if (!tileRow) continue

        for (let col = 0; col < 8; col++) {
          // Calculate source coordinates (with inversion)
          const srcRow = invertY ? 7 - row : row
          const srcCol = invertX ? 7 - col : col
          const pixelValue = tile[srcRow]?.[srcCol] ?? 0

          if (pixelValue === 0) continue // Transparent

          const colorCode = colorCombination[pixelValue]
          if (colorCode === undefined) continue

          const color = COLORS[colorCode] ?? COLORS[0] ?? '#000000'
          ctx.fillStyle = color
          ctx.fillRect(col, row, 1, 1)
        }
      }
    }
  }

  // Convert canvas to image
  const img = new Image()
  img.src = canvas.toDataURL()

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      spriteImageCache.set(cacheKey, img)
      resolve()
    }
    img.onerror = reject
  })

  return img
}

/**
 * Create Konva.Image for a static sprite (DEF SPRITE)
 */
export async function createStaticSpriteKonvaImage(
  sprite: SpriteState,
  spritePaletteCode: number
): Promise<Konva.Image | null> {
  if (!sprite.definition) return null

  const spriteDef = sprite.definition

  // Get palette and color combination
  const spritePalette = SPRITE_PALETTES[spritePaletteCode] ?? SPRITE_PALETTES[1]
  const colorCombination = spritePalette[spriteDef.colorCombination] ?? spritePalette[0]

  // Create sprite image from tiles
  const spriteImage = await createSpriteImageFromTiles(
    spriteDef.tiles,
    colorCombination,
    spriteDef.invertX === 1,
    spriteDef.invertY === 1
  )

  // Create Konva Image (no scaling, native 1:1)
  const konvaImage = new Konva.Image({
    x: sprite.x,
    y: sprite.y,
    image: spriteImage,
    scaleX: 1,
    scaleY: 1,
  })

  return konvaImage
}

/**
 * Create Konva.Image for an animated sprite (DEF MOVE)
 */
export async function createAnimatedSpriteKonvaImage(
  movement: MovementState,
  spritePaletteCode: number
): Promise<Konva.Image | null> {
  // Build animation configs if not already built
  animationConfigs ??= buildAllCharacterAnimationConfigs()

  // Get sequence for this movement
  const { sequence, invertX, invertY } = getSequenceForMovement(
    movement.definition.characterType,
    movement.definition.direction,
    animationConfigs
  )

  if (!sequence || sequence.frames.length === 0) {
    console.warn(`[useKonvaSpriteRenderer] No sequence found for movement ${movement.actionNumber}`)
    return null
  }

  // Get color combination
  const spritePalette = SPRITE_PALETTES[spritePaletteCode] ?? SPRITE_PALETTES[1]
  const colorCombination = spritePalette[movement.definition.colorCombination] ?? spritePalette[0]

  // Create cache key that includes character type, direction, and color combination
  // This ensures correct frames are used even if action number is redefined
  const cacheKey = `${movement.actionNumber}-${movement.definition.characterType}-${movement.definition.direction}-${movement.definition.colorCombination}`

  // Load all frame images for this movement (cache them)
  if (!frameImageCache.has(cacheKey)) {
    const frameImages: HTMLImageElement[] = []
    for (let i = 0; i < sequence.frames.length; i++) {
      const frameTiles = sequence.frames[i]
      if (frameTiles && frameTiles.length > 0) {
        // Use per-frame inversions if available, otherwise fall back to direction-level inversions
        const frameInversion = sequence.frameInversions?.[i]
        const frameInvertX = frameInversion?.invertX ?? invertX
        const frameInvertY = frameInversion?.invertY ?? invertY
        
        const frameImg = await createSpriteImageFromTiles(frameTiles, colorCombination, frameInvertX, frameInvertY)
        frameImages.push(frameImg)
      }
    }
    frameImageCache.set(cacheKey, frameImages)
  }

  const frameImages = frameImageCache.get(cacheKey)
  if (!frameImages || frameImages.length === 0) return null

  // Get current frame
  const frameIndex = movement.currentFrameIndex % frameImages.length
  const currentFrameImage = frameImages[frameIndex]

  if (!currentFrameImage) return null

  // Create Konva Image (no scaling, native 1:1)
  // Position will be set from Konva node if it exists, otherwise use start position
  const konvaImage = new Konva.Image({
    x: movement.startX,
    y: movement.startY,
    image: currentFrameImage,
    scaleX: 1,
    scaleY: 1,
  })

  return konvaImage
}

/**
 * Update existing Konva.Image node for animated sprite
 * Updates frame image only (position is updated by animation loop)
 */
export async function updateAnimatedSpriteKonvaImage(
  movement: MovementState,
  konvaImage: Konva.Image,
  _spritePaletteCode: number
): Promise<void> {
  // Build animation configs if not already built
  animationConfigs ??= buildAllCharacterAnimationConfigs()

  // Position is managed by animation loop, don't update it here

  // Get sequence for this movement
  const { sequence } = getSequenceForMovement(
    movement.definition.characterType,
    movement.definition.direction,
    animationConfigs
  )

  if (sequence && sequence.frames.length > 0) {
    // Create cache key that matches the one used in createAnimatedSpriteKonvaImage
    const cacheKey = `${movement.actionNumber}-${movement.definition.characterType}-${movement.definition.direction}-${movement.definition.colorCombination}`
    const frameImages = frameImageCache.get(cacheKey)
    if (frameImages && frameImages.length > 0) {
      const frameIndex = movement.currentFrameIndex % frameImages.length
      const newFrameImage = frameImages[frameIndex]
      if (newFrameImage && konvaImage.image() !== newFrameImage) {
        konvaImage.image(newFrameImage)
      }
    }
  }
}

/**
 * Clear sprite image caches
 */
export function clearSpriteImageCache(): void {
  spriteImageCache.clear()
  frameImageCache.clear()
  staticSpriteImageCache.clear()
}
