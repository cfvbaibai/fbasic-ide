/**
 * Konva background renderer - Handles rendering of background screen using Konva.js
 * Renders background screen (28×24 characters) from screen buffer
 */

import Konva from 'konva'

import type { ScreenCell } from '@/core/interfaces'
import { BACKGROUND_PALETTES, COLORS } from '@/shared/data/palette'
import { getBackgroundItemByChar, getCharacterByCode } from '@/shared/utils/backgroundLookup'

const CELL_SIZE = 8 // 8×8 pixels per character cell
const COLS = 28 // Background screen: 28 columns
const ROWS = 24 // Background screen: 24 rows
const BG_OFFSET_X = 2 * CELL_SIZE // 16 pixels (2 columns offset)
const BG_OFFSET_Y = 3 * CELL_SIZE // 24 pixels (3 rows offset)
/** If dirty cell count exceeds this, fall back to full redraw (50% of 28×24) */
const FULL_REDRAW_THRESHOLD = 336

/**
 * Cache for background tile canvases (HTMLCanvasElement)
 * Key: `${character}-${colorPattern}-${paletteCode}`
 * Using canvas directly instead of Image to avoid expensive toDataURL() conversion
 */
const backgroundTileImageCache = new Map<string, HTMLCanvasElement>()

/**
 * Track initialization status
 */
let initializationPromise: Promise<void> | null = null

/**
 * Create background tile canvas from character and color pattern
 * Returns HTMLCanvasElement for use in Konva (much faster than converting to Image)
 * Uses caching to avoid recreating the same tiles
 * Optimized: Uses ImageData for faster pixel rendering, avoids expensive toDataURL() conversion
 */
function createBackgroundTileImage(
  character: string,
  colorPattern: number,
  paletteCode: number
): HTMLCanvasElement {
  const cacheKey = `${character}-${colorPattern}-${paletteCode}`

  if (backgroundTileImageCache.has(cacheKey)) {
    return backgroundTileImageCache.get(cacheKey)!
  }

  // Lookup background item
  const bgItem = getBackgroundItemByChar(character)

  // Get color combination from palette
  const palette = BACKGROUND_PALETTES[paletteCode] ?? BACKGROUND_PALETTES[1]
  const colorCombination = palette[colorPattern] ?? palette[0]

  // Create canvas to render tile
  const canvas = document.createElement('canvas')
  canvas.width = CELL_SIZE
  canvas.height = CELL_SIZE
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) throw new Error('Failed to get canvas context')

  // Optimized: Use ImageData for faster pixel rendering
  const imageData = ctx.createImageData(CELL_SIZE, CELL_SIZE)
  const data = imageData.data

  if (!bgItem) {
    // Space or unknown character - fill with background color
    const bgColorIndex = colorCombination[0] ?? 0
    const bgColor = COLORS[bgColorIndex] ?? COLORS[0] ?? '#000000'
    
    // Parse hex color to RGB
    const r = parseInt(bgColor.slice(1, 3), 16)
    const g = parseInt(bgColor.slice(3, 5), 16)
    const b = parseInt(bgColor.slice(5, 7), 16)
    
    // Fill all pixels with background color
    for (let i = 0; i < data.length; i += 4) {
      data[i] = r     // R
      data[i + 1] = g // G
      data[i + 2] = b // B
      data[i + 3] = 255 // A (opaque)
    }
  } else {
    // Render tile pixels using ImageData (much faster than fillRect)
    const tile = bgItem.tile

    for (let row = 0; row < CELL_SIZE; row++) {
      const tileRow = tile[row]
      if (!tileRow) continue

      for (let col = 0; col < CELL_SIZE; col++) {
        const pixelValue = tileRow[col] ?? 0

        // Map tile value (0-3) to color combination index
        const colorIndex = colorCombination[pixelValue] ?? colorCombination[0] ?? 0
        const color = COLORS[colorIndex] ?? COLORS[0] ?? '#000000'
        
        // Parse hex color to RGB
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
        
        // Set pixel in ImageData (row * width + col) * 4
        const pixelIndex = (row * CELL_SIZE + col) * 4
        data[pixelIndex] = r     // R
        data[pixelIndex + 1] = g // G
        data[pixelIndex + 2] = b // B
        data[pixelIndex + 3] = 255 // A (opaque)
      }
    }
  }

  // Put ImageData to canvas (single operation, much faster than multiple fillRect calls)
  ctx.putImageData(imageData, 0, 0)
  
  // Cache the canvas directly (Konva.Image accepts HTMLCanvasElement)
  backgroundTileImageCache.set(cacheKey, canvas)

  return canvas
}

/**
 * Compute set of dirty cell keys "y,x" by diffing current buffer with last rendered buffer
 */
export function computeDirtyCells(
  buffer: ScreenCell[][],
  lastBuffer: ScreenCell[][] | null
): Set<string> {
  if (!lastBuffer) return new Set()
  const dirty = new Set<string>()
  for (let y = 0; y < ROWS; y++) {
    const row = buffer[y]
    const lastRow = lastBuffer[y]
    for (let x = 0; x < COLS; x++) {
      const cell = row?.[x]
      const lastCell = lastRow?.[x]
      const char = cell?.character ?? ' '
      const pattern = cell?.colorPattern ?? 0
      const lastChar = lastCell?.character ?? ' '
      const lastPattern = lastCell?.colorPattern ?? 0
      if (char !== lastChar || pattern !== lastPattern) {
        dirty.add(`${y},${x}`)
      }
    }
  }
  return dirty
}

/**
 * Create Konva.Image nodes for specified background cells only
 */
export function createBackgroundKonvaImagesForCells(
  buffer: ScreenCell[][],
  paletteCode: number,
  cells: Array<{ y: number; x: number }>
): Konva.Image[] {
  const konvaImages: Konva.Image[] = []
  for (const { y, x } of cells) {
    const row = buffer[y]
    const cell = row?.[x]
    const character = cell?.character ?? ' '
    const colorPattern = cell?.colorPattern ?? 0
    const tileImage = createBackgroundTileImage(
      character,
      colorPattern,
      paletteCode
    )
    const pixelX = BG_OFFSET_X + x * CELL_SIZE
    const pixelY = BG_OFFSET_Y + y * CELL_SIZE
    const konvaImage = new Konva.Image({
      x: pixelX,
      y: pixelY,
      image: tileImage,
      scaleX: 1,
      scaleY: 1,
    })
    konvaImages.push(konvaImage)
  }
  return konvaImages
}

/**
 * Create Konva.Image nodes for all background screen cells
 * Renders from screen buffer (28×24 characters) at offset (16, 24)
 * Optimized: Creates all images synchronously (no async/await in loop)
 */
export function createBackgroundKonvaImages(
  buffer: ScreenCell[][],
  paletteCode: number
): Konva.Image[] {
  const konvaImages: Konva.Image[] = []

  // Process all rows and columns, even if buffer is sparse
  // Create all images synchronously - no await in loop for better performance
  for (let y = 0; y < ROWS; y++) {
    const row = buffer[y]
    
    for (let x = 0; x < COLS; x++) {
      const cell = row?.[x]
      
      // If cell doesn't exist, create a default empty cell
      // This ensures all positions are rendered
      const character = cell?.character ?? ' '
      const colorPattern = cell?.colorPattern ?? 0

      // Create tile image synchronously (uses cache, creates if needed)
      const tileImage = createBackgroundTileImage(
        character,
        colorPattern,
        paletteCode
      )

      // Calculate pixel position with offset
      const pixelX = BG_OFFSET_X + x * CELL_SIZE
      const pixelY = BG_OFFSET_Y + y * CELL_SIZE

      // Create Konva Image (no scaling, native 1:1)
      const konvaImage = new Konva.Image({
        x: pixelX,
        y: pixelY,
        image: tileImage,
        scaleX: 1,
        scaleY: 1,
      })

      konvaImages.push(konvaImage)
    }
  }

  return konvaImages
}

/**
 * Update background layer with new screen buffer (full replace)
 * Clears existing nodes and creates new ones
 * Optionally populates nodeGridRef with "y,x" -> Konva.Image for dirty updates later
 */
export function updateBackgroundLayer(
  layer: Konva.Layer,
  buffer: ScreenCell[][],
  paletteCode: number,
  nodeGridRef?: Map<string, Konva.Image>
): void {
  layer.clearCache()
  layer.destroyChildren()
  if (nodeGridRef) nodeGridRef.clear()

  const konvaImages = createBackgroundKonvaImages(buffer, paletteCode)
  if (konvaImages.length > 0) {
    layer.add(...konvaImages)
  }
  if (nodeGridRef) {
    for (let i = 0; i < konvaImages.length; i++) {
      const img = konvaImages[i]
      if (img) {
        const y = Math.floor(i / COLS)
        const x = i % COLS
        nodeGridRef.set(`${y},${x}`, img)
      }
    }
  }
  layer.draw()
}

/**
 * Update only dirty background cells (no full destroy/recreate)
 * If lastBuffer is null or dirty count > threshold, falls back to full redraw
 */
export function updateBackgroundLayerDirty(
  layer: Konva.Layer,
  buffer: ScreenCell[][],
  lastBuffer: ScreenCell[][] | null,
  paletteCode: number,
  nodeGridRef: Map<string, Konva.Image>
): void {
  if (!lastBuffer) {
    updateBackgroundLayer(layer, buffer, paletteCode, nodeGridRef)
    return
  }
  const dirty = computeDirtyCells(buffer, lastBuffer)
  if (dirty.size > FULL_REDRAW_THRESHOLD) {
    updateBackgroundLayer(layer, buffer, paletteCode, nodeGridRef)
    return
  }
  if (dirty.size === 0) {
    layer.draw()
    return
  }
  for (const key of dirty) {
    const parts = key.split(',')
    const y = Number(parts[0])
    const x = Number(parts[1])
    const row = buffer[y]
    const cell = row?.[x]
    const character = cell?.character ?? ' '
    const colorPattern = cell?.colorPattern ?? 0
    const tileImage = createBackgroundTileImage(
      character,
      colorPattern,
      paletteCode
    )
    const pixelX = BG_OFFSET_X + x * CELL_SIZE
    const pixelY = BG_OFFSET_Y + y * CELL_SIZE
    const node = nodeGridRef.get(key)
    if (node) {
      node.image(tileImage)
      node.x(pixelX)
      node.y(pixelY)
    } else {
      const konvaImage = new Konva.Image({
        x: pixelX,
        y: pixelY,
        image: tileImage,
        scaleX: 1,
        scaleY: 1,
      })
      layer.add(konvaImage)
      nodeGridRef.set(key, konvaImage)
    }
  }
  layer.clearCache()
  layer.draw()
}

/**
 * Pre-initialize background tile images
 * Creates images for all characters (0-255), color patterns (0-3), and palettes (0-1)
 * This is done asynchronously in batches to avoid blocking the UI
 * Total: 256 chars × 4 patterns × 2 palettes = 2048 images
 */
export async function preInitializeBackgroundTiles(): Promise<void> {
  // If already initializing or initialized, return existing promise
  if (initializationPromise) {
    return initializationPromise
  }

  // If cache is already well-populated, skip initialization
  if (backgroundTileImageCache.size > 500) {
    return Promise.resolve()
  }

  initializationPromise = (async () => {
    try {
      const paletteCodes = [0, 1] // Two background palettes
      const colorPatterns = [0, 1, 2, 3] // Four color patterns

      // Process all character codes (0-255) using F-BASIC mapping so cache keys match screen buffer
      for (let code = 0; code <= 255; code++) {
        const char = getCharacterByCode(code) ?? String.fromCharCode(code)

        // Create images for all palette/pattern combinations for this character
        for (const paletteCode of paletteCodes) {
          for (const colorPattern of colorPatterns) {
            const cacheKey = `${char}-${colorPattern}-${paletteCode}`
            if (!backgroundTileImageCache.has(cacheKey)) {
              // Create image (will be cached)
              createBackgroundTileImage(char, colorPattern, paletteCode)
            }
          }
        }

        // Yield to event loop every N characters to avoid blocking
        if (code > 0 && code % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }

      console.log(`[BackgroundRenderer] Pre-initialized ${backgroundTileImageCache.size} tile images`)
    } finally {
      // Initialization complete
    }
  })()

  return initializationPromise
}

/**
 * Clear background tile image cache
 */
export function clearBackgroundTileCache(): void {
  backgroundTileImageCache.clear()
  initializationPromise = null
}
