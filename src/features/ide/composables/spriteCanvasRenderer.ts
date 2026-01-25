/**
 * Sprite canvas renderer - Handles rendering of sprites on canvas
 * Supports both static sprites (DEF SPRITE) and animated sprites (DEF MOVE)
 */

import type { ColorCombination, MovementState,SpriteState } from '@/core/sprite/types'
import { COLORS,SPRITE_PALETTES } from '@/shared/data/palette'
import type { Tile } from '@/shared/data/types'

/**
 * Cache for pre-rendered sprite tile ImageBitmap objects
 * Key: `${tileData}-${colorCombination}-${invertX}-${invertY}`
 * Using ImageBitmap instead of ImageData to support proper alpha blending
 */
const spriteTileCache = new Map<string, ImageBitmap>()

/**
 * Convert hex color to RGBA array
 */
function hexToRgba(hex: string): [number, number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b, 255]
}

/**
 * Create cache key for sprite tile
 */
function createTileCacheKey(
  tile: Tile,
  colorCombination: ColorCombination,
  invertX: boolean,
  invertY: boolean
): string {
  // Create a simple hash from tile data
  const tileHash = tile.map(row => row.join('')).join('-')
  const colorHash = colorCombination.join('-')
  return `${tileHash}_${colorHash}_${invertX ? '1' : '0'}_${invertY ? '1' : '0'}`
}

/**
 * Render a single 8×8 sprite tile with optional inversion
 *
 * @param ctx - Canvas rendering context
 * @param tile - 8×8 tile data (values 0-3)
 * @param x - Pixel X coordinate
 * @param y - Pixel Y coordinate
 * @param colorCombination - Color combination array [C1, C2, C3, C4] (hex color codes)
 * @param invertX - Whether to invert horizontally
 * @param invertY - Whether to invert vertically
 */
export async function renderSpriteTile(
  ctx: CanvasRenderingContext2D,
  tile: Tile,
  x: number,
  y: number,
  colorCombination: ColorCombination,
  invertX: boolean,
  invertY: boolean
): Promise<void> {
  // Check cache first
  const cacheKey = createTileCacheKey(tile, colorCombination, invertX, invertY)
  let imageBitmap = spriteTileCache.get(cacheKey)

  if (!imageBitmap) {
    // Create ImageData for 8×8 tile
    const imageData = new ImageData(8, 8)
    const data = imageData.data

    // Initialize all pixels to transparent (alpha = 0)
    for (let i = 0; i < 8 * 8 * 4; i += 4) {
      data[i + 3] = 0  // Alpha = 0 (transparent)
    }

    for (let row = 0; row < 8; row++) {
      const tileRow = tile[row]
      if (!tileRow) continue

      for (let col = 0; col < 8; col++) {
        // Calculate source coordinates (with inversion)
        const srcRow = invertY ? 7 - row : row
        const srcCol = invertX ? 7 - col : col
        const pixelValue = tile[srcRow]?.[srcCol] ?? 0

        // Map tile value (0-3) to color combination index
        // Value 0 = transparent (C1, index 0) - skip rendering
        // Value 1 = C2 (index 1)
        // Value 2 = C3 (index 2)
        // Value 3 = C4 (index 3)
        if (pixelValue === 0) {
          // Transparent pixel - already initialized with alpha = 0
          continue
        }

        const colorCode = colorCombination[pixelValue]
        if (colorCode === undefined) continue

        // Color code is a hex value (0x00-0x3C), use as index into COLORS array
        const color = COLORS[colorCode] ?? COLORS[0] ?? '#000000'
        const [r, g, b] = hexToRgba(color)

        const idx = (row * 8 + col) * 4
        data[idx] = r
        data[idx + 1] = g
        data[idx + 2] = b
        data[idx + 3] = 255  // Opaque
      }
    }

    // Convert ImageData to ImageBitmap for proper alpha blending
    imageBitmap = await createImageBitmap(imageData)
    
    // Cache the rendered tile
    spriteTileCache.set(cacheKey, imageBitmap)
  }

  // Draw the tile using drawImage (supports alpha blending)
  ctx.drawImage(imageBitmap, x, y)
}

/**
 * Render static sprite from DEF SPRITE definition
 */
export async function renderStaticSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteState,
  spritePaletteCode: number
): Promise<void> {
  if (!sprite.definition) return

  const spriteDef = sprite.definition

  // Determine sprite size
  const is16x16 = spriteDef.size === 1

  // Get palette and color combination
  const spritePalette = SPRITE_PALETTES[spritePaletteCode] ?? SPRITE_PALETTES[1]
  const colorCombination = spritePalette[spriteDef.colorCombination] ?? spritePalette[0]

  // Render sprite tiles
  if (is16x16 && spriteDef.tiles.length === 4) {
    // 16×16 sprite: 4 tiles in 2×2 grid
    const tiles = spriteDef.tiles as [Tile, Tile, Tile, Tile]

    // Top-left (tile 0)
    await renderSpriteTile(ctx, tiles[0], sprite.x, sprite.y,
                     colorCombination, spriteDef.invertX === 1, spriteDef.invertY === 1)
    // Top-right (tile 1)
    await renderSpriteTile(ctx, tiles[1], sprite.x + 8, sprite.y,
                     colorCombination, spriteDef.invertX === 1, spriteDef.invertY === 1)
    // Bottom-left (tile 2)
    await renderSpriteTile(ctx, tiles[2], sprite.x, sprite.y + 8,
                     colorCombination, spriteDef.invertX === 1, spriteDef.invertY === 1)
    // Bottom-right (tile 3)
    await renderSpriteTile(ctx, tiles[3], sprite.x + 8, sprite.y + 8,
                     colorCombination, spriteDef.invertX === 1, spriteDef.invertY === 1)
  } else if (!is16x16 && spriteDef.tiles.length > 0) {
    // 8×8 sprite: single tile
    const tile = spriteDef.tiles[0]
    if (tile) {
      await renderSpriteTile(ctx, tile, sprite.x, sprite.y,
                       colorCombination, spriteDef.invertX === 1, spriteDef.invertY === 1)
    }
  }
}

/**
 * Render animated sprite from DEF MOVE definition
 * For Phase 3, renders a simple indicator at the movement position
 * Full character sprite rendering will be implemented in Phase 4
 */
export async function renderAnimatedSprite(
  ctx: CanvasRenderingContext2D,
  movement: MovementState,
  _spritePaletteCode: number
): Promise<void> {
  // Phase 3: Basic rendering - just show movement position
  // Full sprite rendering with character types will come in Phase 4
  
  const x = Math.floor(movement.currentX)
  const y = Math.floor(movement.currentY)
  
  // Render a simple colored rectangle to indicate movement
  // Color based on action number for visual distinction
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080']
  const color = colors[movement.actionNumber % colors.length] ?? '#FFFFFF'
  
  ctx.fillStyle = color
  ctx.fillRect(x, y, 16, 16)
  
  // Draw a border to make it more visible
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, 16, 16)
}

/**
 * Render sprites with given priority
 *
 * @param ctx - Canvas rendering context
 * @param spriteStates - Array of sprite states
 * @param movementStates - Array of movement states
 * @param priority - Priority to filter by (0=front, 1=behind)
 * @param spritePaletteCode - Sprite palette code (0-2)
 * @param spriteEnabled - Whether sprite display is enabled (SPRITE ON/OFF)
 */
export async function renderSprites(
  ctx: CanvasRenderingContext2D,
  spriteStates: SpriteState[],
  movementStates: MovementState[],
  priority: number,
  spritePaletteCode: number,
  spriteEnabled: boolean
): Promise<void> {
  // First, render static sprites (DEF SPRITE) - only if sprite display is enabled
  if (spriteEnabled) {
    const sprites = spriteStates.filter(s =>
      s.visible && s.priority === priority && s.definition
    )

    for (const spriteState of sprites) {
      // Check if this sprite is moving (has active movement state)
      // Note: In Family BASIC, action numbers and sprite numbers are separate
      // For now, we check if there's a movement with matching action number
      const movement = movementStates.find(m =>
        m.actionNumber === spriteState.spriteNumber && m.isActive
      )

      if (!movement) {
        // Render static sprite (DEF SPRITE) - only if not moving
        await renderStaticSprite(ctx, spriteState, spritePaletteCode)
      }
    }
  }

  // Second, render active movements (DEF MOVE) - these work independently of SPRITE ON/OFF
  // Filter movements by priority and active status
  const activeMovements = movementStates.filter(m => {
    // Check if movement exists, is active, and has correct priority
    if (!m?.isActive) return false
    if (!m.definition) return false
    return m.definition.priority === priority
  })

  for (const movement of activeMovements) {
    // Render animated sprite (DEF MOVE)
    await renderAnimatedSprite(ctx, movement, spritePaletteCode)
  }
}

/**
 * Clear sprite tile cache
 * Call this when memory needs to be freed
 */
export function clearSpriteTileCache(): void {
  spriteTileCache.clear()
}
