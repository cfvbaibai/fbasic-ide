/**
 * Interfaces for sprite data structures
 * Used for Character Table parsing and sprite rendering
 */

/**
 * Represents a single 8x8 character tile
 * Each tile contains 64 pixels (8x8 grid)
 */
export interface TileData {
  /** 8x8 array of color indices (0-3 for Family BASIC) */
  pixelIndices: number[][]
  
  /** Alternative: flat array representation [64] */
  pixelIndicesFlat?: number[]
}

/**
 * Represents a complete sprite composed of 4 character tiles
 * Tiles are arranged in 2x2 grid:
 * [0] [1]
 * [2] [3]
 */
export interface SpriteData {
  /** Sprite number (1-213) */
  spriteNumber: number
  
  /** Sprite name/description (e.g., "Mario (WALK1)") */
  name: string
  
  /** Four 8x8 character tiles in order:
   * 0: Top-left (CHR$(0))
   * 1: Top-right (CHR$(1))
   * 2: Bottom-left (CHR$(2))
   * 3: Bottom-right (CHR$(3))
   */
  tiles: [TileData, TileData, TileData, TileData]
}

/**
 * Complete Character Table data
 * Contains all 213 sprites from Character Table A
 */
export interface CharacterTableData {
  /** Array of all sprites */
  sprites: SpriteData[]
  
  /** Metadata about the character table */
  metadata: {
    totalSprites: number
    tileSize: number // Always 8
    spriteSize: number // Always 16 (2x2 tiles)
    extractedAt?: string
  }
}

/**
 * Grid position for sprite extraction
 */
export interface SpriteGridPosition {
  /** Row index in the grid (0-based) */
  row: number
  
  /** Column index in the grid (0-based) */
  column: number
  
  /** Sprite number (1-213) */
  spriteNumber: number
}

/**
 * Image processing configuration
 */
export interface ImageProcessingConfig {
  /** Expected number of sprites */
  expectedSpriteCount: number
  
  /** Expected grid dimensions */
  gridRows: number
  gridColumns: number
  
  /** Sprite cell size in pixels (16x16) */
  spriteCellSize: number
  
  /** Tile size in pixels (8x8) */
  tileSize: number
  
  /** Color quantization settings */
  colorQuantization: {
    /** Number of color indices (typically 4 for Family BASIC) */
    colorCount: number
    /** Background color threshold (pixels below this are transparent/index 0) */
    backgroundThreshold: number
  }
}

