import { computed } from 'vue'
import type { SpriteDefinition } from '../../../shared/data/sprites'
import { SPRITE_PALETTES, COLORS } from '../../../shared/data/palette'

export function useSpriteDisplay(
  selectedSprite: { value: SpriteDefinition | null },
  selectedPaletteCode: { value: number },
  selectedColorCombination: { value: number }
) {
  // Combine 4 8x8 tiles into a 16x16 grid
  const sprite16x16 = computed(() => {
    const grid: number[][] = Array(16).fill(null).map(() => Array(16).fill(0) as number[])
    
    if (!selectedSprite.value) {
      return grid
    }
    
    // Get the 4 tiles from the sprite definition
    const tiles = selectedSprite.value.tiles
    const tile0 = tiles[0]
    const tile1 = tiles[1]
    const tile2 = tiles[2]
    const tile3 = tiles[3]
    
    // Copy tile 0 (top-left) to positions [0-7, 0-7]
    if (tile0) {
      for (let row = 0; row < 8 && row < tile0.length; row++) {
        const tileRow = tile0[row]
        if (tileRow) {
          for (let col = 0; col < 8 && col < tileRow.length; col++) {
            const value: number | undefined = tileRow[col]
            if (value !== undefined && grid[row]) {
              grid[row]![col] = value
            }
          }
        }
      }
    }
    
    // Copy tile 1 (top-right) to positions [0-7, 8-15]
    if (tile1) {
      for (let row = 0; row < 8 && row < tile1.length; row++) {
        const tileRow = tile1[row]
        if (tileRow) {
          for (let col = 0; col < 8 && col < tileRow.length; col++) {
            const value: number | undefined = tileRow[col]
            if (value !== undefined && grid[row]) {
              grid[row]![col + 8] = value
            }
          }
        }
      }
    }
    
    // Copy tile 2 (bottom-left) to positions [8-15, 0-7]
    if (tile2) {
      for (let row = 0; row < 8 && row < tile2.length; row++) {
        const tileRow = tile2[row]
        if (tileRow) {
          for (let col = 0; col < 8 && col < tileRow.length; col++) {
            const value: number | undefined = tileRow[col]
            if (value !== undefined && grid[row + 8]) {
              grid[row + 8]![col] = value
            }
          }
        }
      }
    }
    
    // Copy tile 3 (bottom-right) to positions [8-15, 8-15]
    if (tile3) {
      for (let row = 0; row < 8 && row < tile3.length; row++) {
        const tileRow = tile3[row]
        if (tileRow) {
          for (let col = 0; col < 8 && col < tileRow.length; col++) {
            const value: number | undefined = tileRow[col]
            if (value !== undefined && grid[row + 8]) {
              grid[row + 8]![col + 8] = value
            }
          }
        }
      }
    }
    
    return grid
  })

  // Get background color based on sprite value using selected palette and color combination
  const getCellColor = (value: number): string => {
    if (value === 0) {
      return 'transparent'
    }
    
    // Get the color combination from the selected palette
    const palette = SPRITE_PALETTES[selectedPaletteCode.value]
    if (!palette) {
      return 'transparent'
    }
    
    const colorCombination = palette[selectedColorCombination.value]
    if (!colorCombination) {
      return 'transparent'
    }
    
    // Map sprite value to color combination index:
    // value 1 -> C2 (index 1)
    // value 2 -> C3 (index 2)
    // value 3 -> C4 (index 3)
    const colorIndex = value
    if (colorIndex >= 1 && colorIndex <= 3) {
      const colorCode = colorCombination[colorIndex]
      if (colorCode !== undefined && colorCode >= 0 && colorCode < COLORS.length) {
        return COLORS[colorCode] ?? 'transparent'
      }
    }
    
    return 'transparent'
  }

  return {
    sprite16x16,
    getCellColor
  }
}

