/**
 * Sample BG Data for programs that use the VIEW command
 *
 * These are pre-designed BG graphics that pair with sample programs.
 * Each BG is a 28x21 grid of cells with character codes and color patterns.
 */

import { BG_GRID, DEFAULT_BG_CHAR_CODE } from '@/features/bg-editor/constants'
import type { BgCell, BgGridData } from '@/features/bg-editor/types'

/** Create an empty 28x21 grid */
function createEmptyGrid(): BgGridData {
  const grid: BgGridData = []
  for (let y = 0; y < BG_GRID.ROWS; y++) {
    const row: BgCell[] = []
    for (let x = 0; x < BG_GRID.COLS; x++) {
      row.push({ charCode: DEFAULT_BG_CHAR_CODE, colorPattern: 0 })
    }
    grid.push(row)
  }
  return grid
}

/** Helper to set a cell in the grid */
function setCell(grid: BgGridData, x: number, y: number, charCode: number, colorPattern: 0 | 1 | 2 | 3 = 0): void {
  if (x >= 0 && x < BG_GRID.COLS && y >= 0 && y < BG_GRID.ROWS) {
    const row = grid[y]
    if (row) {
      row[x] = { charCode, colorPattern }
    }
  }
}

/**
 * Demo BG with a simple border and centered text area
 * Shows the grid boundaries clearly
 */
function createDemoBorderGrid(): BgGridData {
  const grid = createEmptyGrid()

  // Draw border using block characters (176-183 are BG items)
  // Top and bottom borders
  for (let x = 0; x < BG_GRID.COLS; x++) {
    setCell(grid, x, 0, 176, 1) // Top border
    setCell(grid, x, BG_GRID.ROWS - 1, 176, 1) // Bottom border
  }

  // Left and right borders
  for (let y = 0; y < BG_GRID.ROWS; y++) {
    setCell(grid, 0, y, 177, 1) // Left border
    setCell(grid, BG_GRID.COLS - 1, y, 177, 1) // Right border
  }

  // Corner pieces
  setCell(grid, 0, 0, 178, 2)
  setCell(grid, BG_GRID.COLS - 1, 0, 178, 2)
  setCell(grid, 0, BG_GRID.ROWS - 1, 178, 2)
  setCell(grid, BG_GRID.COLS - 1, BG_GRID.ROWS - 1, 178, 2)

  // Center decoration - simple pattern
  const centerX = Math.floor(BG_GRID.COLS / 2)
  const centerY = Math.floor(BG_GRID.ROWS / 2)

  // Draw a diamond shape in center
  setCell(grid, centerX, centerY - 2, 42, 2) // *
  setCell(grid, centerX - 1, centerY - 1, 42, 2)
  setCell(grid, centerX, centerY - 1, 42, 2)
  setCell(grid, centerX + 1, centerY - 1, 42, 2)
  setCell(grid, centerX - 2, centerY, 42, 2)
  setCell(grid, centerX - 1, centerY, 65, 3) // A
  setCell(grid, centerX, centerY, 42, 2)
  setCell(grid, centerX + 1, centerY, 42, 2)
  setCell(grid, centerX + 2, centerY, 42, 2)
  setCell(grid, centerX - 1, centerY + 1, 42, 2)
  setCell(grid, centerX, centerY + 1, 42, 2)
  setCell(grid, centerX + 1, centerY + 1, 42, 2)
  setCell(grid, centerX, centerY + 2, 42, 2)

  return grid
}

/**
 * Platform game level background
 * Has ground, platforms, and decorative elements
 */
function createPlatformLevelGrid(): BgGridData {
  const grid = createEmptyGrid()

  // Ground (bottom 2 rows) - solid blocks
  for (let x = 0; x < BG_GRID.COLS; x++) {
    setCell(grid, x, BG_GRID.ROWS - 1, 219, 1) // Solid block
    setCell(grid, x, BG_GRID.ROWS - 2, 220, 1) // Half block
  }

  // Platforms at different heights
  // Platform 1: left side, mid height
  for (let x = 2; x < 8; x++) {
    setCell(grid, x, 14, 223, 2) // Top half block
    setCell(grid, x, 15, 219, 2) // Solid block
  }

  // Platform 2: center, higher
  for (let x = 10; x < 18; x++) {
    setCell(grid, x, 10, 223, 2)
    setCell(grid, x, 11, 219, 2)
  }

  // Platform 3: right side, mid height
  for (let x = 20; x < 26; x++) {
    setCell(grid, x, 14, 223, 2)
    setCell(grid, x, 15, 219, 2)
  }

  // Floating blocks (coin-like)
  setCell(grid, 5, 8, 36, 3) // $ - coin
  setCell(grid, 14, 6, 36, 3)
  setCell(grid, 22, 8, 36, 3)

  // Clouds (using * and @ characters)
  setCell(grid, 4, 3, 42, 0) // *
  setCell(grid, 5, 3, 42, 0)
  setCell(grid, 6, 3, 42, 0)
  setCell(grid, 5, 2, 42, 0)

  setCell(grid, 18, 4, 42, 0)
  setCell(grid, 19, 4, 42, 0)
  setCell(grid, 20, 4, 42, 0)
  setCell(grid, 19, 3, 42, 0)

  // Pipes (using | and _)
  setCell(grid, 24, 17, 186, 1) // Vertical line
  setCell(grid, 24, 18, 186, 1)
  setCell(grid, 24, 19, 186, 1)
  setCell(grid, 23, 17, 205, 1) // Horizontal line (top)
  setCell(grid, 25, 17, 205, 1)

  return grid
}

/**
 * Title screen background
 * Decorative border with space for title text
 */
function createTitleScreenGrid(): BgGridData {
  const grid = createEmptyGrid()

  // Double-line border using box drawing characters
  // Top border
  for (let x = 1; x < BG_GRID.COLS - 1; x++) {
    setCell(grid, x, 1, 205, 2)
    setCell(grid, x, 2, 196, 1)
  }

  // Bottom border
  for (let x = 1; x < BG_GRID.COLS - 1; x++) {
    setCell(grid, x, BG_GRID.ROWS - 2, 205, 2)
    setCell(grid, x, BG_GRID.ROWS - 3, 196, 1)
  }

  // Side borders
  for (let y = 2; y < BG_GRID.ROWS - 2; y++) {
    setCell(grid, 1, y, 186, 2)
    setCell(grid, 2, y, 179, 1)
    setCell(grid, BG_GRID.COLS - 2, y, 186, 2)
    setCell(grid, BG_GRID.COLS - 3, y, 179, 1)
  }

  // Corner pieces
  setCell(grid, 1, 1, 201, 2) // Top-left
  setCell(grid, BG_GRID.COLS - 2, 1, 187, 2) // Top-right
  setCell(grid, 1, BG_GRID.ROWS - 2, 200, 2) // Bottom-left
  setCell(grid, BG_GRID.COLS - 2, BG_GRID.ROWS - 2, 188, 2) // Bottom-right

  // Stars scattered around
  const starPositions: Array<[number, number]> = [
    [4, 4], [8, 5], [20, 4], [24, 6],
    [5, 16], [22, 17], [10, 18], [18, 16],
  ]
  for (const [x, y] of starPositions) {
    setCell(grid, x, y, 42, 3) // *
  }

  // Decorative hearts
  const heartPositions: Array<[number, number]> = [
    [6, 8], [22, 8], [6, 14], [22, 14],
  ]
  for (const [x, y] of heartPositions) {
    setCell(grid, x, y, 3, 1) // Heart character
  }

  return grid
}

/**
 * Simple test pattern for VIEW command testing
 * Numbers and letters to verify correct rendering
 */
function createTestPatternGrid(): BgGridData {
  const grid = createEmptyGrid()

  // Row of numbers at top
  for (let i = 0; i < 10; i++) {
    setCell(grid, i + 9, 2, 48 + i, 2) // 0-9
  }

  // Row of letters
  for (let i = 0; i < 10; i++) {
    setCell(grid, i + 9, 4, 65 + i, 3) // A-J
  }

  // Color test - same character with different colors
  for (let i = 0; i < 4; i++) {
    setCell(grid, i + 12, 6, 35, i as 0 | 1 | 2 | 3) // # with 4 colors
  }

  // Simple smiley face
  setCell(grid, 13, 10, 219, 2) // Left eye
  setCell(grid, 15, 10, 219, 2) // Right eye
  setCell(grid, 12, 12, 95, 2) // _
  setCell(grid, 13, 12, 95, 2)
  setCell(grid, 14, 12, 95, 2)
  setCell(grid, 15, 12, 95, 2)
  setCell(grid, 16, 12, 95, 2)

  // Border
  for (let x = 0; x < BG_GRID.COLS; x++) {
    setCell(grid, x, 0, 45, 1) // -
    setCell(grid, x, BG_GRID.ROWS - 1, 45, 1)
  }

  return grid
}

// ============================================================================
// F-BASIC Reference Manual Sample Games BG Data (pages 94-101)
// ============================================================================

/**
 * KNIGHT game BG (page 94)
 * 8x8 chessboard with labels A-H and 8-1
 * Uses K codes for board pattern, L codes for borders
 */
function createKnightGrid(): BgGridData {
  const grid = createEmptyGrid()

  // Top border row numbers (8 7 6 5 4 3 2 1)
  for (let i = 0; i < 8; i++) {
    setCell(grid, i * 2 + 1, 1, 56 - i, 0) // 8,7,6,5,4,3,2,1
  }

  // Chessboard pattern - alternating squares
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col * 2 + 1
      const y = row * 2 + 2
      // Alternating pattern using K62 for dark squares
      if ((row + col) % 2 === 0) {
        setCell(grid, x, y, 176, 1) // Dark square
        setCell(grid, x + 1, y, 176, 1)
      }
    }
    // Row label (A-H)
    setCell(grid, 17, row * 2 + 3, 65 + row, 0)
  }

  // Title "KNIGHT" in top right
  setCell(grid, 19, 2, 75, 0) // K
  setCell(grid, 20, 2, 78, 0) // N
  setCell(grid, 21, 2, 73, 0) // I
  setCell(grid, 22, 2, 71, 0) // G
  setCell(grid, 23, 2, 72, 0) // H
  setCell(grid, 24, 2, 84, 0) // T

  return grid
}

/**
 * SUPER MEMORY game BG (page 95)
 * Four L-shaped corner panels with center box
 */
function createSuperMemoryGrid(): BgGridData {
  const grid = createEmptyGrid()

  // Four corner panels (L-shaped patterns)
  // Top-left panel
  for (let i = 3; i <= 6; i++) {
    setCell(grid, i, 1, 176, 1)
    setCell(grid, i, 2, 176, 1)
    setCell(grid, i, 3, 176, 1)
    setCell(grid, i, 4, 176, 1)
  }
  for (let i = 1; i <= 4; i++) {
    setCell(grid, 1, i, 176, 1)
    setCell(grid, 2, i, 176, 1)
  }

  // Top-right panel
  for (let i = 14; i <= 17; i++) {
    setCell(grid, i, 1, 176, 1)
    setCell(grid, i, 2, 176, 1)
    setCell(grid, i, 3, 176, 1)
    setCell(grid, i, 4, 176, 1)
  }
  for (let i = 1; i <= 4; i++) {
    setCell(grid, 18, i, 176, 1)
    setCell(grid, 19, i, 176, 1)
  }

  // Bottom-left panel
  for (let i = 8; i <= 12; i++) {
    setCell(grid, i, 9, 176, 1)
    setCell(grid, i, 10, 176, 1)
    setCell(grid, i, 11, 176, 1)
  }
  for (let i = 9; i <= 11; i++) {
    setCell(grid, 8, i, 176, 1)
  }

  // Bottom-right panel
  for (let i = 15; i <= 19; i++) {
    setCell(grid, i, 15, 176, 1)
    setCell(grid, i, 16, 176, 1)
    setCell(grid, i, 17, 176, 1)
    setCell(grid, i, 18, 176, 1)
    setCell(grid, i, 19, 176, 1)
  }
  for (let i = 15; i <= 19; i++) {
    setCell(grid, 14, i, 176, 1)
    setCell(grid, 20, i, 176, 1)
  }

  // Title "SUPER MEMORY"
  const title = 'SUPER MEMORY'
  for (let i = 0; i < title.length; i++) {
    setCell(grid, 21 + i, 2, title.charCodeAt(i), 0)
  }

  return grid
}

/**
 * UFO game BG (page 96)
 * Starry sky with mountain terrain at bottom
 */
function createUfoGrid(): BgGridData {
  const grid = createEmptyGrid()

  // Random stars in sky (rows 0-13)
  const starPositions: Array<[number, number]> = [
    [3, 1], [4, 1], [9, 1], [12, 1], [18, 1], [24, 1],
    [1, 2], [6, 2], [15, 2], [19, 2], [26, 2],
    [3, 3], [8, 3], [12, 3], [22, 3],
    [4, 4], [10, 4], [17, 4], [25, 4],
    [2, 5], [7, 5], [14, 5], [21, 5],
    [5, 6], [11, 6], [16, 6], [23, 6],
    [3, 7], [9, 7], [18, 7], [26, 7],
    [1, 8], [6, 8], [13, 8], [20, 8],
    [4, 9], [10, 9], [15, 9], [24, 9],
    [2, 10], [8, 10], [17, 10], [22, 10],
    [5, 11], [12, 11], [19, 11], [25, 11],
    [3, 12], [9, 12], [14, 12], [23, 12],
    [1, 13], [7, 13], [16, 13], [21, 13],
  ]
  for (const [x, y] of starPositions) {
    setCell(grid, x, y, 42, 0) // * star
  }

  // Mountain terrain (rows 14-20)
  // Row 14-15: Rolling hills start
  for (let x = 0; x < BG_GRID.COLS; x++) {
    setCell(grid, x, 18, 176, 1) // Ground level
    setCell(grid, x, 19, 177, 1) // Ground detail
    setCell(grid, x, 20, 178, 1) // Bottom edge
  }

  // Jagged peaks
  for (let x = 0; x < BG_GRID.COLS; x += 3) {
    const height = Math.floor(Math.random() * 3) + 2
    for (let h = 0; h < height; h++) {
      setCell(grid, x, 17 - h, 176, 2)
      setCell(grid, x + 1, 17 - h, 176, 2)
    }
  }

  return grid
}

/**
 * ROUTE 66 game BG (page 97)
 * Road with dashed center lines and solid edges
 */
function createRoute66Grid(): BgGridData {
  const grid = createEmptyGrid()

  // Road pattern - all rows
  for (let y = 0; y < BG_GRID.ROWS; y++) {
    // Left edge
    setCell(grid, 13, y, 176, 1)
    // Road surface
    for (let x = 14; x <= 24; x++) {
      setCell(grid, x, y, 32, 0) // Space (road)
    }
    // Center line (dashed)
    if (y % 2 === 0) {
      setCell(grid, 19, y, 45, 2) // Dash
    }
    // Right edge
    setCell(grid, 25, y, 176, 1)
  }

  return grid
}

/**
 * TYPE MASTER game BG (page 98)
 * Text boxes and frames for typing display
 */
function createTypeMasterGrid(): BgGridData {
  const grid = createEmptyGrid()

  // "TYPE" title box (top left)
  setCell(grid, 1, 1, 84, 0) // T
  setCell(grid, 2, 1, 89, 0) // Y
  setCell(grid, 3, 1, 80, 0) // P
  setCell(grid, 4, 1, 69, 0) // E

  // Border around title
  for (let x = 0; x <= 5; x++) {
    setCell(grid, x, 0, 205, 2) // Top border
    setCell(grid, x, 2, 205, 2) // Bottom border
  }
  setCell(grid, 0, 0, 201, 2) // Top-left corner
  setCell(grid, 5, 0, 187, 2) // Top-right corner
  setCell(grid, 0, 2, 200, 2) // Bottom-left corner
  setCell(grid, 5, 2, 188, 2) // Bottom-right corner
  setCell(grid, 0, 1, 186, 2) // Left side
  setCell(grid, 5, 1, 186, 2) // Right side

  // Main display area frame (rows 3-6)
  for (let x = 0; x <= 23; x++) {
    setCell(grid, x, 3, 205, 2)
    setCell(grid, x, 6, 205, 2)
  }
  for (let y = 3; y <= 6; y++) {
    setCell(grid, 0, y, 186, 2)
    setCell(grid, 23, y, 186, 2)
  }

  return grid
}

/**
 * TURTLE game BG (page 99)
 * Racing track with lanes and finish line
 */
function createTurtleGrid(): BgGridData {
  const grid = createEmptyGrid()

  // Sky background (rows 0-4)
  for (let y = 0; y <= 4; y++) {
    for (let x = 0; x < BG_GRID.COLS; x++) {
      setCell(grid, x, y, 176, 0) // Light blue
    }
  }

  // Racing track (rows 5-20)
  // Track dividers and lane numbers
  for (let lane = 0; lane < 5; lane++) {
    const baseY = 5 + lane * 3
    // Lane separator line
    for (let x = 0; x <= 23; x++) {
      setCell(grid, x, baseY, 205, 1) // Horizontal line
    }
    // Lane number
    setCell(grid, 0, baseY + 1, 49 + lane, 0) // 1-5
    // Vertical lane marker
    setCell(grid, 3, baseY + 1, 179, 1)
  }

  // Finish line (right edge)
  for (let y = 5; y < 20; y++) {
    setCell(grid, 26, y, 186, 2) // Vertical finish
    setCell(grid, 27, y, 186, 2)
  }

  return grid
}

/**
 * CARD game BG (page 100)
 * 6x6 card grid frame
 */
function createCardGrid(): BgGridData {
  const grid = createEmptyGrid()

  // Create 6x6 grid of card cells
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const baseX = col * 4
      const baseY = row * 3

      // Top border of cell
      setCell(grid, baseX, baseY, 218, 1) // Top-left corner
      setCell(grid, baseX + 1, baseY, 196, 1) // Top
      setCell(grid, baseX + 2, baseY, 196, 1) // Top
      setCell(grid, baseX + 3, baseY, 191, 1) // Top-right corner

      // Sides
      setCell(grid, baseX, baseY + 1, 179, 1) // Left
      setCell(grid, baseX + 3, baseY + 1, 179, 1) // Right

      // Bottom border of cell
      setCell(grid, baseX, baseY + 2, 192, 1) // Bottom-left corner
      setCell(grid, baseX + 1, baseY + 2, 196, 1) // Bottom
      setCell(grid, baseX + 2, baseY + 2, 196, 1) // Bottom
      setCell(grid, baseX + 3, baseY + 2, 217, 1) // Bottom-right corner
    }
  }

  // Player labels on right side
  setCell(grid, 25, 9, 76, 0) // L
  setCell(grid, 26, 9, 69, 0) // E
  setCell(grid, 27, 9, 70, 0) // F
  setCell(grid, 25, 12, 82, 0) // R

  return grid
}

/**
 * SCR$ Sample game BG (page 101)
 * Maze with flags and brick walls
 */
function createScrSampleGrid(): BgGridData {
  const grid = createEmptyGrid()

  // Border walls (F32 = brick pattern)
  for (let x = 0; x < BG_GRID.COLS; x++) {
    setCell(grid, x, 0, 178, 1) // Top wall
    setCell(grid, x, 20, 178, 1) // Bottom wall
  }
  for (let y = 0; y < BG_GRID.ROWS; y++) {
    setCell(grid, 0, y, 178, 1) // Left wall
    setCell(grid, 27, y, 178, 1) // Right wall
  }

  // Internal maze walls (brick pattern)
  const wallPositions: Array<[number, number]> = [
    [4, 6], [5, 6], [12, 6], [13, 6],
    [4, 7], [5, 7], [12, 7], [13, 7],
    [14, 4], [15, 4], [16, 4], [17, 4], [18, 4], [19, 4], [20, 4], [21, 4],
    [17, 9], [18, 9], [17, 10], [18, 10],
    [12, 11], [13, 11], [12, 12], [13, 12], [5, 15], [6, 15], [7, 15], [5, 16], [6, 16], [7, 16],
    [21, 15], [22, 15], [21, 16], [22, 16],
    [17, 18], [18, 18], [17, 19], [18, 19],
  ]
  for (const [x, y] of wallPositions) {
    setCell(grid, x, y, 176, 1)
  }

  // Flags (CHR$(199) positions) - marked with special character
  const flagPositions: Array<[number, number]> = [
    [3, 2], [14, 2], [18, 2], [22, 2],
    [8, 5], [18, 6], [25, 6],
    [4, 9], [13, 9], [22, 10],
    [19, 13], [25, 13],
    [2, 14], [10, 14], [19, 16], [23, 18], [7, 18], [10, 18], [13, 18], [23, 18],
  ]
  for (const [x, y] of flagPositions) {
    setCell(grid, x, y, 199, 2) // Flag character
  }

  return grid
}

// ============================================================================
// Export Sample BG Data Map
// ============================================================================

/**
 * Map of sample keys to their pre-designed BG data
 * Only samples that use VIEW need BG data
 * Keys must match the bgKey property in sampleCodes.ts
 */
export const SAMPLE_BG_DATA: Record<string, BgGridData> = {
  // Main VIEW demo - border with center decoration
  bgView: createDemoBorderGrid(),

  // Title screen - decorative border
  titleScreen: createTitleScreenGrid(),

  // Platform game level - ground, platforms, coins
  platformGame: createPlatformLevelGrid(),

  // Test pattern for debugging
  testPattern: createTestPatternGrid(),

  // ============================================================================
  // F-BASIC Reference Manual Sample Games (pages 94-101)
  // ============================================================================

  // KNIGHT - 8x8 chessboard with labels (page 94)
  knight: createKnightGrid(),

  // SUPER MEMORY - Four corner panels with center box (page 95)
  superMemory: createSuperMemoryGrid(),

  // UFO - Starry sky with mountain terrain (page 96)
  ufo: createUfoGrid(),

  // ROUTE 66 - Road with dashed center lines (page 97)
  route66: createRoute66Grid(),

  // TYPE MASTER - Text boxes and frames (page 98)
  typeMaster: createTypeMasterGrid(),

  // TURTLE - Racing track with lanes (page 99)
  turtle: createTurtleGrid(),

  // CARD - 6x6 card grid frame (page 100)
  card: createCardGrid(),

  // SCR$ Sample - Maze with flags and bricks (page 101)
  scrSample: createScrSampleGrid(),
}

/**
 * Get BG data for a sample key
 * Returns empty grid if no BG data is defined for the sample
 */
export function getSampleBgData(key: string): BgGridData {
  return SAMPLE_BG_DATA[key] ?? createEmptyGrid()
}

/**
 * Check if a sample has associated BG data
 */
export function hasSampleBgData(key: string): boolean {
  return key in SAMPLE_BG_DATA
}
