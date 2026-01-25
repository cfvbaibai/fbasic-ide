import Konva from 'konva'

import { buildAllCharacterAnimationConfigs, getSequenceForMovement } from '@/core/animation/CharacterAnimationBuilder'
import type { MovementState } from '@/core/sprite/types'
import { COLORS, SPRITE_PALETTES } from '@/shared/data/palette'

const SPRITE_SCALE = 3

// Sprite images (ImageBitmap cache)
const spriteImageCache = new Map<string, HTMLImageElement>()

// Cache for frame images per movement
const frameImageCache = new Map<number, HTMLImageElement[]>()

// Animation configs (cached)
let animationConfigs: ReturnType<typeof buildAllCharacterAnimationConfigs> | null = null

/**
 * Convert tile data to ImageData, then to HTMLImageElement for Konva
 */
async function createSpriteImage(
  frameTiles: number[][][],
  colorCombination: number[],
  invertX: boolean,
  invertY: boolean
): Promise<HTMLImageElement> {
  const cacheKey = `${JSON.stringify(frameTiles)}-${colorCombination.join(',')}-${invertX}-${invertY}`
  
  if (spriteImageCache.has(cacheKey)) {
    return spriteImageCache.get(cacheKey)!
  }

  // Determine sprite size (4 tiles = 16×16, 1 tile = 8×8)
  const spriteSize = frameTiles.length === 4 ? 16 : 8
  
  // Create canvas to render sprite
  const canvas = document.createElement('canvas')
  canvas.width = spriteSize
  canvas.height = spriteSize
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) throw new Error('Failed to get canvas context')

  // Initialize to transparent
  ctx.clearRect(0, 0, spriteSize, spriteSize)

  if (frameTiles.length === 4) {
    // 16×16 sprite: 4 tiles in 2×2 grid
    const tiles = frameTiles as [number[][], number[][], number[][], number[][]]
    
    // Render each tile
    for (let tileIdx = 0; tileIdx < 4; tileIdx++) {
      const tile = tiles[tileIdx]
      if (!tile) continue
      
      const tileX = (tileIdx % 2) * 8
      const tileY = Math.floor(tileIdx / 2) * 8
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
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
  } else if (frameTiles.length === 1) {
    // 8×8 sprite: single tile
    const tile = frameTiles[0]
    if (tile) {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
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
 * Create Konva image from movement state
 */
export async function createKonvaImage(movement: MovementState): Promise<Konva.Image | null> {
  animationConfigs ??= buildAllCharacterAnimationConfigs()

  const { sequence, invertX, invertY } = getSequenceForMovement(
    movement.definition.characterType,
    movement.definition.direction,
    animationConfigs
  )

  if (!sequence || sequence.frames.length === 0) {
    console.warn(`No sequence found for movement ${movement.actionNumber}`)
    return null
  }

  // Get color combination
  const spritePalette = SPRITE_PALETTES[1] ?? SPRITE_PALETTES[0]
  const colorCombination = spritePalette[movement.definition.colorCombination] ?? spritePalette[0]

  // Load all frame images for this movement (cache them)
  if (!frameImageCache.has(movement.actionNumber)) {
    const frameImages: HTMLImageElement[] = []
    for (let i = 0; i < sequence.frames.length; i++) {
      const frameTiles = sequence.frames[i]
      if (frameTiles) {
        const frameImg = await createSpriteImage(frameTiles, colorCombination, invertX, invertY)
        frameImages.push(frameImg)
      }
    }
    frameImageCache.set(movement.actionNumber, frameImages)
  }

  const frameImages = frameImageCache.get(movement.actionNumber)!
  if (frameImages.length === 0) return null

  // Get current frame
  const frameIndex = movement.currentFrameIndex % frameImages.length
  const currentFrameImage = frameImages[frameIndex]

  // Create Konva Image with scale
  // Canvas is displayed at 2x scale, so positions need to be scaled by 2
  const CANVAS_SCALE = 2
  const konvaImage = new Konva.Image({
    x: movement.currentX * CANVAS_SCALE,
    y: movement.currentY * CANVAS_SCALE,
    image: currentFrameImage,
    scaleX: SPRITE_SCALE,
    scaleY: SPRITE_SCALE,
  })

  return konvaImage
}

/**
 * Update sprite positions and frame images
 */
export async function updateSprites(
  movements: MovementState[],
  spriteRefs: Map<number, Konva.Image>
): Promise<void> {
  animationConfigs ??= buildAllCharacterAnimationConfigs()

  for (const movement of movements) {
    if (!movement.isActive) continue

    const sprite = spriteRefs.get(movement.actionNumber)
    if (!sprite) continue

    // Update position (scale by 2 to match canvas display scale)
    const CANVAS_SCALE = 2
    sprite.x(movement.currentX * CANVAS_SCALE)
    sprite.y(movement.currentY * CANVAS_SCALE)

    // Update frame image
    const { sequence } = getSequenceForMovement(
      movement.definition.characterType,
      movement.definition.direction,
      animationConfigs
    )

    if (sequence && sequence.frames.length > 0) {
      const frameImages = frameImageCache.get(movement.actionNumber)
      if (frameImages && frameImages.length > 0) {
        const frameIndex = movement.currentFrameIndex % frameImages.length
        const newFrameImage = frameImages[frameIndex]
        if (newFrameImage && sprite.image() !== newFrameImage) {
          sprite.image(newFrameImage)
        }
      }
    }
  }
}

export function clearSpriteCache(): void {
  frameImageCache.clear()
}
