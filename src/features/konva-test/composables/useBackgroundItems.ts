import Konva from 'konva'

import { PICTURE_BG_ITEMS } from '@/shared/data/bg'
import { BACKGROUND_PALETTES, COLORS } from '@/shared/data/palette'
import type { BackgroundItem } from '@/shared/data/types'

const CELL_SIZE = 8 // 8×8 pixels per character cell

// Cache for background item images
const backgroundItemImageCache = new Map<string, HTMLImageElement>()

/**
 * Create background item image from tile data
 * Exported for use in random background changes
 */
export async function createBackgroundItemImage(
  bgItem: BackgroundItem,
  colorPattern: number,
  paletteCode: number
): Promise<HTMLImageElement> {
  const cacheKey = `${bgItem.code}-${colorPattern}-${paletteCode}`
  
  if (backgroundItemImageCache.has(cacheKey)) {
    return backgroundItemImageCache.get(cacheKey)!
  }

  const palette = BACKGROUND_PALETTES[paletteCode] ?? BACKGROUND_PALETTES[1]
  const colorCombination = palette[colorPattern] ?? palette[0]

  // Create canvas to render tile
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 8
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) throw new Error('Failed to get canvas context')

  // Initialize to transparent
  ctx.clearRect(0, 0, 8, 8)

  // Render tile pixels
  const tile = bgItem.tile

  for (let row = 0; row < 8; row++) {
    const tileRow = tile[row]
    if (!tileRow) continue

    for (let col = 0; col < 8; col++) {
      const pixelValue = tileRow[col] ?? 0

      // Map tile value (0-3) to color combination index
      const colorIndex = colorCombination[pixelValue] ?? colorCombination[0] ?? 0
      const color = COLORS[colorIndex] ?? COLORS[0] ?? '#000000'
      ctx.fillStyle = color
      ctx.fillRect(col, row, 1, 1)
    }
  }

  // Convert canvas to image
  const img = new Image()
  img.src = canvas.toDataURL()
  
  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      backgroundItemImageCache.set(cacheKey, img)
      resolve()
    }
    img.onerror = reject
  })

  return img
}

/**
 * Generate background items in a pattern
 * Optimized: Use fewer items with larger spacing for better performance
 * Positioned within F-Basic background screen area (28×24 characters)
 */
export function generateBackgroundItems(
  offsetX: number,
  offsetY: number,
  cols: number,
  rows: number
): Array<{ bgItem: BackgroundItem; x: number; y: number; colorPattern: number }> {
  const items: Array<{ bgItem: BackgroundItem; x: number; y: number; colorPattern: number }> = []
  
  // Use picture background items for decoration
  const pictureItems = PICTURE_BG_ITEMS.slice(0, 16) // Use first 16 picture items
  
  // Create a sparser grid pattern for better performance
  // Use every 2nd tile instead of every tile (reduces items by 75%)
  const spacing = 2 // Only place items every 2 tiles
  
  for (let row = 0; row < rows; row += spacing) {
    for (let col = 0; col < cols; col += spacing) {
      // Create a checkerboard pattern with some variety
      const rowIndex = Math.floor(row / spacing)
      const colIndex = Math.floor(col / spacing)
      const colsPerSpacing = Math.floor(cols / spacing)
      const index = (rowIndex * colsPerSpacing + colIndex) % pictureItems.length
      const bgItem = pictureItems[index]
      if (bgItem) {
        // Alternate color patterns for variety
        const colorPattern = (row + col) % 4
        items.push({
          bgItem,
          x: offsetX + col * CELL_SIZE,
          y: offsetY + row * CELL_SIZE,
          colorPattern,
        })
      }
    }
  }
  
  return items
}

/**
 * Create Konva images for background items
 * Positioned within F-Basic background screen area with proper offset
 */
export async function createBackgroundItemKonvaImages(
  showBackground: boolean,
  offsetX: number,
  offsetY: number,
  cols: number,
  rows: number
): Promise<Konva.Image[]> {
  if (!showBackground) {
    return []
  }

  const bgItems = generateBackgroundItems(offsetX, offsetY, cols, rows)
  const paletteCode = 1 // Use palette 1
  const konvaImages: Konva.Image[] = []
  
  for (const { bgItem, x, y, colorPattern } of bgItems) {
    const bgImage = await createBackgroundItemImage(bgItem, colorPattern, paletteCode)
    const konvaImage = new Konva.Image({
      x: x * 2, // Scale to match canvas scale (256×240 -> 512×480 display)
      y: y * 2,
      image: bgImage,
      scaleX: 2, // Scale to match canvas scale
      scaleY: 2,
    })
    konvaImages.push(konvaImage)
  }
  
  return konvaImages
}
