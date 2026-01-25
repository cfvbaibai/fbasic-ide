/**
 * Standalone canvas renderer without Vue reactivity
 * For performance testing and direct rendering
 */

import type { MovementState,SpriteState } from '@/core/sprite/types'
import { BACKGROUND_PALETTES, COLORS } from '@/shared/data/palette'
import { getBackgroundItemByChar } from '@/shared/utils/backgroundLookup'

import { renderSprites } from './spriteCanvasRenderer'

interface ScreenCell {
  character: string
  colorPattern: number
  x: number
  y: number
}

const CELL_SIZE = 8 // 8×8 pixels per cell
const COLS = 28
const ROWS = 24
const _CONTENT_WIDTH = COLS * CELL_SIZE // 224 pixels
const _CONTENT_HEIGHT = ROWS * CELL_SIZE // 192 pixels

// Backdrop screen dimensions: 32×30 characters = 256×240 pixels
const BACKDROP_COLS = 32
const BACKDROP_ROWS = 30
const BACKDROP_WIDTH = BACKDROP_COLS * CELL_SIZE // 256 pixels
const BACKDROP_HEIGHT = BACKDROP_ROWS * CELL_SIZE // 240 pixels

// Background screen offset within backdrop (adds 2 columns left, 3 lines top)
const BG_OFFSET_X = 2 * CELL_SIZE // 16 pixels
const BG_OFFSET_Y = 3 * CELL_SIZE // 24 pixels

// Canvas uses full backdrop/sprite screen dimensions
const CANVAS_WIDTH = BACKDROP_WIDTH // 256 pixels
const CANVAS_HEIGHT = BACKDROP_HEIGHT // 240 pixels

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
 * Render a single 8×8 cell at position (x, y) on the background screen using cached ImageData
 * Background screen is offset by (BG_OFFSET_X, BG_OFFSET_Y) within the backdrop canvas
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
  const pixelX = x * CELL_SIZE + BG_OFFSET_X
  const pixelY = y * CELL_SIZE + BG_OFFSET_Y
  ctx.putImageData(imageData, pixelX, pixelY)
}

/**
 * Render screen buffer to canvas (no Vue reactivity)
 * Implements full backdrop screen (32×30) with background screen (28×24) at offset (16, 24)
 */
export function renderScreenBuffer(
  canvas: HTMLCanvasElement,
  buffer: ScreenCell[][],
  paletteCode: number = 1,
  backdropColor: number = 0 // Default backdrop color code (0 = black)
): void {
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return

  // Set canvas size to full backdrop/sprite screen dimensions
  if (canvas.width !== CANVAS_WIDTH || canvas.height !== CANVAS_HEIGHT) {
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    ctx.imageSmoothingEnabled = false
  }

  // 1. Render backdrop screen (32×30 characters, single color)
  // Backdrop uses color code directly (not from palette combination)
  const backdropColorHex = COLORS[backdropColor] ?? COLORS[0] ?? '#000000'
  ctx.fillStyle = backdropColorHex
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // 2. Render background screen (28×24 characters) at offset (16, 24)
  // Background screen uses palette colors
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

/**
 * Render background screen (28×24 characters) at offset (16, 24)
 * Used internally by renderScreenLayers
 */
function renderBackgroundScreen(
  ctx: CanvasRenderingContext2D,
  buffer: ScreenCell[][],
  paletteCode: number
): void {
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

/**
 * Render all screen layers in correct order
 * Implements Family BASIC multi-layer screen system:
 * 1. Backdrop Screen (solid color)
 * 2. Sprite Screen (Back) - sprites with priority E=1
 * 3. Background Screen - PRINT content (28×24)
 * 4. Sprite Screen (Front) - sprites with priority E=0
 *
 * @param canvas - Canvas element
 * @param buffer - Background screen buffer
 * @param spriteStates - Sprite states (DEF SPRITE + SPRITE)
 * @param movementStates - Movement states (DEF MOVE + MOVE)
 * @param bgPaletteCode - Background palette code (0-1)
 * @param spritePaletteCode - Sprite palette code (0-2)
 * @param backdropColor - Backdrop color code (0-60)
 * @param spriteEnabled - Whether sprite display is enabled (SPRITE ON/OFF)
 */
export async function renderScreenLayers(
  canvas: HTMLCanvasElement,
  buffer: ScreenCell[][],
  spriteStates: SpriteState[],
  movementStates: MovementState[],
  bgPaletteCode: number = 1,
  spritePaletteCode: number = 1,
  backdropColor: number = 0,
  spriteEnabled: boolean = false
): Promise<void> {
  // Use alpha: true for sprite transparency support
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  // Set canvas size to full backdrop/sprite screen dimensions
  if (canvas.width !== CANVAS_WIDTH || canvas.height !== CANVAS_HEIGHT) {
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    ctx.imageSmoothingEnabled = false
  }

  // 1. Render backdrop screen (32×30 characters, single color)
  const backdropColorHex = COLORS[backdropColor] ?? COLORS[0] ?? '#000000'
  ctx.fillStyle = backdropColorHex
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // 2. Render back sprites (priority E=1)
  await renderSprites(ctx, spriteStates, movementStates, 1, spritePaletteCode, spriteEnabled)

  // 3. Render background screen (28×24 characters)
  renderBackgroundScreen(ctx, buffer, bgPaletteCode)

  // 4. Render front sprites (priority E=0)
  await renderSprites(ctx, spriteStates, movementStates, 0, spritePaletteCode, spriteEnabled)
}

export type { ScreenCell }
