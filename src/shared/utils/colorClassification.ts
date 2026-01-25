import { BACKGROUND_PALETTES, COLORS, SPRITE_PALETTES } from '@/shared/data/palette'

/**
 * Color classification utilities for F-BASIC sprite generation.
 * Maps RGB colors to F-BASIC color indices: black=0, white=1, red=2, blue=3
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1] ?? '0', 16), parseInt(result[2] ?? '0', 16), parseInt(result[3] ?? '0', 16)]
    : [0, 0, 0]
}

/**
 * Calculate color distance using Euclidean distance in RGB space
 */
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2
  const dg = g1 - g2
  const db = b1 - b2
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

/**
 * Classify an RGB color to F-BASIC color index using palette colors
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @param paletteType 'background' or 'sprite'
 * @param paletteCode Palette code (0-1 for background, 0-2 for sprite)
 * @param colorCombination Color combination index (0-3)
 * @returns Color index: 0=background, 1=color1, 2=color2, 3=color3
 */
export function classifyColorWithPalette(
  r: number,
  g: number,
  b: number,
  paletteType: 'background' | 'sprite',
  paletteCode: number,
  colorCombination: number
): number {
  // Always treat black color as 0, regardless of palette or color combination
  // But first check if it's blue (dark blue can have low luminance)
  // Blue: high blue component relative to red and green
  const isBlue = b > r * 1.3 && b > g * 1.3 && b > 80

  // Check if it's truly black (all RGB components very low, and not blue)
  // Black: all components low and not blue
  if (!isBlue && r < 30 && g < 30 && b < 30) {
    return 0 // black
  }

  let palette
  if (paletteType === 'sprite') {
    palette = SPRITE_PALETTES[paletteCode] ?? SPRITE_PALETTES[0]
  } else {
    palette = BACKGROUND_PALETTES[paletteCode] ?? BACKGROUND_PALETTES[1]
  }

  const combination = palette[colorCombination] ?? palette[0]

  if (!combination) {
    return 0
  }

  // Get actual color codes from the combination
  const colorCodes = [
    combination[0], // background (index 0)
    combination[1], // color 1 (index 1)
    combination[2], // color 2 (index 2)
    combination[3], // color 3 (index 3)
  ]

  // Convert color codes to RGB
  const paletteRgbs = colorCodes.map(code => {
    const hex = COLORS[code] ?? COLORS[0] ?? '#000000'
    return hexToRgb(hex)
  })

  // Find the closest matching color
  let minDistance = Infinity
  let closestIndex = 0

  for (let i = 0; i < paletteRgbs.length; i++) {
    const [pr, pg, pb] = paletteRgbs[i] ?? [0, 0, 0]
    const distance = colorDistance(r, g, b, pr, pg, pb)
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = i
    }
  }

  return closestIndex
}

/**
 * Classify an RGB color to F-BASIC color index
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Color index: 0=black, 1=white, 2=red, 3=blue
 */
export function classifyColor(r: number, g: number, b: number): number {
  // Calculate luminance for black/white detection
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Check if it's blue FIRST (before black/white check, as blue can have low luminance)
  // Blue: high blue component relative to red and green
  if (b > r * 1.3 && b > g * 1.3 && b > 80) {
    return 3 // blue
  }

  // Check if it's red (high red, low green and blue)
  if (r > g * 1.5 && r > b * 1.5 && r > 100) {
    return 2 // red
  }

  // Check if it's white (high luminance, low saturation)
  if (luminance > 0.7) {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    if (saturation < 0.3) {
      return 1 // white
    }
  }

  // Check if it's black (low luminance, and not blue/red)
  if (luminance < 0.3) {
    return 0 // black
  }

  // Default: classify by dominant color
  if (b > r && b > g && b > 50) return 3 // blue
  if (r > g && r > b && r > 50) return 2 // red
  if (luminance > 0.5) return 1 // white
  return 0 // black
}
