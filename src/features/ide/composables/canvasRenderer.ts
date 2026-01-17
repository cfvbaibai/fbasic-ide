/**
 * Standalone canvas renderer without Vue reactivity
 * For performance testing and direct rendering
 */

import { BACKGROUND_PALETTES, COLORS } from '@/shared/data/palette'
import { getBackgroundItemByChar } from '@/shared/utils/backgroundLookup'

interface ScreenCell {
  character: string
  colorPattern: number
  x: number
  y: number
}

const CELL_SIZE = 8 // 8×8 pixels per cell
const COLS = 28
const ROWS = 24
const CONTENT_WIDTH = COLS * CELL_SIZE // 224 pixels
const CONTENT_HEIGHT = ROWS * CELL_SIZE // 192 pixels
const PADDING = 8 // 1 character width = 8 pixels (matches backdrop screen margin)
const CANVAS_WIDTH = CONTENT_WIDTH + PADDING * 2 // 240 pixels (224 + 16)
const CANVAS_HEIGHT = CONTENT_HEIGHT + PADDING * 2 // 208 pixels (192 + 16)

/**
 * Cache for pre-rendered tile ImageData objects
 * Key: `${character}-${colorPattern}-${paletteCode}`
 */
const tileCache = new Map<string, ImageData>()

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
 * Create ImageData for an 8×8 tile
 */
function createTileImageData(
  character: string,
  colorPattern: number,
  paletteCode: number
): ImageData {
  // Lookup background item
  const bgItem = getBackgroundItemByChar(character)
  
  // Get color combination from palette
  const palette = BACKGROUND_PALETTES[paletteCode] ?? BACKGROUND_PALETTES[1]
  const colorCombination = palette[colorPattern] ?? palette[0]
  
  // Create ImageData for 8×8 tile
  const imageData = new ImageData(CELL_SIZE, CELL_SIZE)
  const data = imageData.data
  
  if (!bgItem) {
    // Space or unknown character - fill with background color
    const bgColorIndex = colorCombination[0] ?? 0
    const bgColor = COLORS[bgColorIndex] ?? COLORS[0] ?? '#000000'
    const [r, g, b] = hexToRgba(bgColor)
    
    for (let i = 0; i < CELL_SIZE * CELL_SIZE; i++) {
      const idx = i * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
    return imageData
  }

  // Render tile pixels
  const tile = bgItem.tile
  
  for (let row = 0; row < CELL_SIZE; row++) {
    const tileRow = tile[row]
    if (!tileRow) continue
    
    for (let col = 0; col < CELL_SIZE; col++) {
      const pixelValue = tileRow[col] ?? 0
      
      // Map tile value (0-3) to color combination index
      const colorIndex = colorCombination[pixelValue] ?? colorCombination[0] ?? 0
      const color = COLORS[colorIndex] ?? COLORS[0] ?? '#000000'
      const [r, g, b] = hexToRgba(color)
      
      const idx = (row * CELL_SIZE + col) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }
  
  return imageData
}

/**
 * Get cached or create ImageData for a tile
 */
function getTileImageData(
  character: string,
  colorPattern: number,
  paletteCode: number
): ImageData {
  const cacheKey = `${character}-${colorPattern}-${paletteCode}`
  let imageData = tileCache.get(cacheKey)
  
  if (!imageData) {
    imageData = createTileImageData(character, colorPattern, paletteCode)
    tileCache.set(cacheKey, imageData)
  }
  
  return imageData
}

/**
 * Render a single 8×8 cell at position (x, y) on the canvas using cached ImageData
 */
function renderCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  character: string,
  colorPattern: number,
  paletteCode: number
): void {
  const imageData = getTileImageData(character, colorPattern, paletteCode)
  const pixelX = x * CELL_SIZE + PADDING
  const pixelY = y * CELL_SIZE + PADDING
  ctx.putImageData(imageData, pixelX, pixelY)
}

/**
 * Render screen buffer to canvas (no Vue reactivity)
 */
export function renderScreenBuffer(
  canvas: HTMLCanvasElement,
  buffer: ScreenCell[][],
  paletteCode: number = 1
): void {
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return

  // Set canvas size
  if (canvas.width !== CANVAS_WIDTH || canvas.height !== CANVAS_HEIGHT) {
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    ctx.imageSmoothingEnabled = false
  }

  // Fill entire canvas (including padding) with default background color
  const palette = BACKGROUND_PALETTES[paletteCode] ?? BACKGROUND_PALETTES[1]
  const defaultColorCombination = palette[0]
  const bgColorIndex = defaultColorCombination[0] ?? 0
  const bgColor = COLORS[bgColorIndex] ?? COLORS[0] ?? '#000000'
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // Render all cells using cached ImageData tiles
  for (let y = 0; y < ROWS; y++) {
    const row = buffer[y]
    if (!row) continue
    
    for (let x = 0; x < COLS; x++) {
      const cell = row[x]
      if (cell) {
        renderCell(
          ctx,
          x,
          y,
          cell.character || ' ',
          cell.colorPattern,
          paletteCode
        )
      }
    }
  }
}

export type { ScreenCell }
