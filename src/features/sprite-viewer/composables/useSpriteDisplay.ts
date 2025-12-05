import { computed } from 'vue'
import { isEightTileSprite, isFourTileSprite, isSixTileSprite, type SpriteDefinition } from '@/shared/data/characters/types'
import { COLORS, SPRITE_PALETTES } from '@/shared/data/palette'

export function useSpriteDisplay(
  selectedSprite: { value: SpriteDefinition | null },
  selectedPaletteCode: { value: number },
  selectedColorCombination: { value: number },
  displayOptions: { value: { reverseX: boolean; reverseY: boolean } }
) {
  // Determine sprite size (8x8, 16x16, 16x32, or 48x8)
  const spriteSize = computed(() => {
    if (!selectedSprite.value) {
      return { width: 16, height: 16 } as const
    }
    if (isEightTileSprite(selectedSprite.value)) {
      return { width: 16, height: 32 } as const // 2 tiles wide × 4 tiles tall
    }
    if (isSixTileSprite(selectedSprite.value)) {
      return { width: 48, height: 8 } as const // 6 tiles wide × 1 tile tall
    }
    if (isFourTileSprite(selectedSprite.value)) {
      return { width: 16, height: 16 } as const // 2 tiles wide × 2 tiles tall
    }
    return { width: 8, height: 8 } as const // 1 tile
  })

  // Generate sprite grid (8x8, 16x16, 16x32, or 48x8)
  const spriteGrid = computed(() => {
    if (!selectedSprite.value) {
      return Array(16).fill(null).map(() => Array(16).fill(0) as number[])
    }
    
    if (isSixTileSprite(selectedSprite.value)) {
      // 6-tile sprite: Combine 6 8x8 tiles into a 48x8 grid (6 tiles wide × 1 tile tall)
      // Layout:
      // [0] [1] [2] [3] [4] [5]
      const grid: number[][] = Array(8).fill(null).map(() => Array(48).fill(0) as number[])
      const tiles = selectedSprite.value.tiles
      
      for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
        const tile = tiles[tileIndex]
        if (tile) {
          for (let row = 0; row < 8 && row < tile.length; row++) {
            const tileRow = tile[row]
            if (tileRow) {
              for (let col = 0; col < 8 && col < tileRow.length; col++) {
                const value: number | undefined = tileRow[col]
                if (value !== undefined && grid[row]) {
                  grid[row]![col + tileIndex * 8] = value
                }
              }
            }
          }
        }
      }
      
      return grid
    } else if (isEightTileSprite(selectedSprite.value)) {
      // 8-tile sprite: Combine 8 8x8 tiles into a 16x32 grid (2 tiles wide × 4 tiles tall)
      // Layout:
      // [0] [1]
      // [2] [3]
      // [4] [5]
      // [6] [7]
      const grid: number[][] = Array(32).fill(null).map(() => Array(16).fill(0) as number[])
      const tiles = selectedSprite.value.tiles
      
      // Process each tile pair (left and right columns)
      for (let tileIndex = 0; tileIndex < 8; tileIndex++) {
        const tile = tiles[tileIndex]
        if (tile) {
          // Determine which row (0-3) and column (0 or 1) this tile belongs to
          const rowIndex = Math.floor(tileIndex / 2) // 0, 0, 1, 1, 2, 2, 3, 3
          const colIndex = tileIndex % 2 // 0, 1, 0, 1, 0, 1, 0, 1
          
          for (let row = 0; row < 8 && row < tile.length; row++) {
            const tileRow = tile[row]
            if (tileRow) {
              for (let col = 0; col < 8 && col < tileRow.length; col++) {
                const value: number | undefined = tileRow[col]
                if (value !== undefined && grid[rowIndex * 8 + row]) {
                  grid[rowIndex * 8 + row]![colIndex * 8 + col] = value
                }
              }
            }
          }
        }
      }
      
      return grid
    } else if (isFourTileSprite(selectedSprite.value)) {
      // 4-tile sprite: Combine 4 8x8 tiles into a 16x16 grid
      const grid: number[][] = Array(16).fill(null).map(() => Array(16).fill(0) as number[])
      const tiles = selectedSprite.value.tiles
      
      // Copy tile 0 (top-left) to positions [0-7, 0-7]
      const tile0 = tiles[0]
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
      const tile1 = tiles[1]
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
      const tile2 = tiles[2]
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
      const tile3 = tiles[3]
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
    } else {
      // 1-tile sprite: Use the single 8x8 tile
      const tile = selectedSprite.value.tiles
      const grid: number[][] = Array(8).fill(null).map(() => Array(8).fill(0) as number[])
      
      if (tile) {
        for (let row = 0; row < 8 && row < tile.length; row++) {
          const tileRow = tile[row]
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
      
      return grid
    }
  })

  // Apply X and Y inversions if needed
  const spriteGridWithInversions = computed(() => {
    const grid = spriteGrid.value
    if (!grid || grid.length === 0) {
      return grid
    }

    let result = grid.map(row => [...row]) // Deep copy

    // Apply Y inversion (reverse rows)
    if (displayOptions.value.reverseY) {
      result = result.reverse()
    }

    // Apply X inversion (reverse columns in each row)
    if (displayOptions.value.reverseX) {
      result = result.map(row => row.reverse())
    }

    return result
  })

  // Legacy alias for backward compatibility
  const sprite16x16 = computed(() => spriteGridWithInversions.value)

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
    sprite16x16, // Legacy alias
    spriteGrid: spriteGridWithInversions,
    spriteSize,
    getCellColor
  }
}

