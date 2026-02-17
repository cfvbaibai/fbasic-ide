/**
 * useBgRenderer composable
 *
 * Canvas rendering for the BG Editor grid
 */

import { useTemplateRef } from 'vue'

import { BACKGROUND_PALETTES, COLORS } from '@/shared/data/palette'
import { getBackgroundItemByCode } from '@/shared/utils/backgroundLookup'

import { BG_GRID, DEFAULT_BG_PALETTE_CODE, DEFAULT_RENDER_SCALE } from '../constants'
import type { BgCell, ColorPattern, ReadonlyBgGridData } from '../types'

/**
 * Get scaled cell size
 */
export function getScaledCellSize(scale: number): number {
  return BG_GRID.CELL_SIZE * scale
}

/**
 * Get color from palette for a given color pattern and pixel value
 */
function getColorForPixel(colorPattern: ColorPattern, pixelValue: number, paletteCode: number): string {
  const palette = BACKGROUND_PALETTES[paletteCode] ?? BACKGROUND_PALETTES[DEFAULT_BG_PALETTE_CODE]
  const colorCombination = palette[colorPattern] ?? palette[0]
  const colorIndex = colorCombination[pixelValue] ?? colorCombination[0] ?? 0
  return COLORS[colorIndex] ?? COLORS[0] ?? '#000000'
}

/**
 * Parse hex color to RGB components
 */
function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

/**
 * Render a single cell to ImageData
 */
function renderCellToImageData(
  imageData: ImageData,
  cell: BgCell,
  paletteCode: number,
  scale: number
): void {
  const scaledCellSize = getScaledCellSize(scale)
  const { r: bgR, g: bgG, b: bgB } = parseHexColor(getColorForPixel(cell.colorPattern, 0, paletteCode))

  const bgItem = getBackgroundItemByCode(cell.charCode)
  const data = imageData.data

  if (!bgItem) {
    // Empty cell - fill with background color
    for (let i = 0; i < data.length; i += 4) {
      data[i] = bgR
      data[i + 1] = bgG
      data[i + 2] = bgB
      data[i + 3] = 255
    }
    return
  }

  // Render tile with color pattern
  const tile = bgItem.tile
  for (let row = 0; row < BG_GRID.CELL_SIZE; row++) {
    const tileRow = tile[row]
    if (!tileRow) continue

    for (let col = 0; col < BG_GRID.CELL_SIZE; col++) {
      const pixelValue = tileRow[col] ?? 0
      const color = getColorForPixel(cell.colorPattern, pixelValue, paletteCode)
      const { r, g, b } = parseHexColor(color)

      // Scale each pixel to scale x scale
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const pixelIndex = ((row * scale + sy) * scaledCellSize + col * scale + sx) * 4
          data[pixelIndex] = r
          data[pixelIndex + 1] = g
          data[pixelIndex + 2] = b
          data[pixelIndex + 3] = 255
        }
      }
    }
  }
}

/**
 * Create an offscreen canvas for a cell
 */
function createCellCanvas(cell: BgCell, paletteCode: number, scale: number): HTMLCanvasElement {
  const scaledCellSize = getScaledCellSize(scale)
  const canvas = document.createElement('canvas')
  canvas.width = scaledCellSize
  canvas.height = scaledCellSize
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Failed to get canvas context')

  const imageData = ctx.createImageData(scaledCellSize, scaledCellSize)
  renderCellToImageData(imageData, cell, paletteCode, scale)
  ctx.putImageData(imageData, 0, 0)

  return canvas
}

/**
 * Render the entire grid to a canvas
 */
export function renderGridToCanvas(
  canvas: HTMLCanvasElement,
  grid: ReadonlyBgGridData,
  options?: {
    paletteCode?: number
    showGridLines?: boolean
    hoverCell?: { x: number; y: number } | null
    scale?: number
  }
): void {
  const {
    paletteCode = DEFAULT_BG_PALETTE_CODE,
    showGridLines = false,
    hoverCell = null,
    scale = DEFAULT_RENDER_SCALE,
  } = options ?? {}

  const scaledCellSize = getScaledCellSize(scale)
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return

  // Clear canvas with backdrop color (black)
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Render all cells
  for (let y = 0; y < BG_GRID.ROWS; y++) {
    for (let x = 0; x < BG_GRID.COLS; x++) {
      const cell = grid[y]?.[x] ?? { charCode: 0, colorPattern: 0 }
      const cellCanvas = createCellCanvas(cell, paletteCode, scale)
      ctx.drawImage(cellCanvas, x * scaledCellSize, y * scaledCellSize)
    }
  }

  // Draw hover highlight
  if (hoverCell && hoverCell.x >= 0 && hoverCell.y >= 0) {
    const hx = hoverCell.x * scaledCellSize
    const hy = hoverCell.y * scaledCellSize

    // Semi-transparent highlight overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fillRect(hx, hy, scaledCellSize, scaledCellSize)

    // Border highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 2
    ctx.strokeRect(hx + 1, hy + 1, scaledCellSize - 2, scaledCellSize - 2)
  }

  // Draw grid lines if enabled
  if (showGridLines) {
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)'
    ctx.lineWidth = 1

    // Vertical lines
    for (let x = 0; x <= BG_GRID.COLS; x++) {
      ctx.beginPath()
      ctx.moveTo(x * scaledCellSize, 0)
      ctx.lineTo(x * scaledCellSize, canvas.height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= BG_GRID.ROWS; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * scaledCellSize)
      ctx.lineTo(canvas.width, y * scaledCellSize)
      ctx.stroke()
    }
  }
}

/**
 * Render a single tile preview to canvas
 */
export function renderTilePreview(
  canvas: HTMLCanvasElement,
  charCode: number,
  colorPattern: ColorPattern,
  paletteCode: number = DEFAULT_BG_PALETTE_CODE,
  scale: number = DEFAULT_RENDER_SCALE
): void {
  const scaledCellSize = getScaledCellSize(scale)
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return

  const cell: BgCell = { charCode, colorPattern }
  const imageData = ctx.createImageData(scaledCellSize, scaledCellSize)
  renderCellToImageData(imageData, cell, paletteCode, scale)
  ctx.putImageData(imageData, 0, 0)
}

/**
 * Get canvas dimensions for a given scale
 */
export function getCanvasDimensions(scale: number): { width: number; height: number } {
  const scaledCellSize = getScaledCellSize(scale)
  return {
    width: BG_GRID.COLS * scaledCellSize,
    height: BG_GRID.ROWS * scaledCellSize,
  }
}

/**
 * Composable for BG Editor rendering
 */
export function useBgRenderer(canvasRefName: string = 'bgCanvas') {
  const canvasRef = useTemplateRef<HTMLCanvasElement>(canvasRefName)

  /**
   * Render the grid to the referenced canvas
   */
  function render(
    grid: ReadonlyBgGridData,
    options?: {
      paletteCode?: number
      showGridLines?: boolean
      hoverCell?: { x: number; y: number } | null
      scale?: number
    }
  ): void {
    const canvas = canvasRef.value
    if (!canvas) return

    renderGridToCanvas(canvas, grid, options)
  }

  /**
   * Setup canvas with proper dimensions
   */
  function setupCanvas(scale: number = DEFAULT_RENDER_SCALE): void {
    const canvas = canvasRef.value
    if (!canvas) return

    const { width, height } = getCanvasDimensions(scale)
    canvas.width = width
    canvas.height = height
  }

  /**
   * Get canvas position from mouse event
   */
  function getGridPosition(event: MouseEvent, scale: number = DEFAULT_RENDER_SCALE): { x: number; y: number } | null {
    const canvas = canvasRef.value
    if (!canvas) return null

    const scaledCellSize = getScaledCellSize(scale)
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = Math.floor(((event.clientX - rect.left) * scaleX) / scaledCellSize)
    const y = Math.floor(((event.clientY - rect.top) * scaleY) / scaledCellSize)

    if (x >= 0 && x < BG_GRID.COLS && y >= 0 && y < BG_GRID.ROWS) {
      return { x, y }
    }
    return null
  }

  return {
    canvasRef,
    render,
    setupCanvas,
    getGridPosition,
    renderGridToCanvas,
    renderTilePreview,
    getScaledCellSize,
    getCanvasDimensions,
  }
}
