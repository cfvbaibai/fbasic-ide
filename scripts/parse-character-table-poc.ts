/**
 * Proof of Concept: Character Table Parser
 * 
 * This script demonstrates extracting 1-2 sprites from the Character Table image
 * 
 * IMPORTANT: This script uses browser APIs (Canvas, Image) and requires:
 * - Browser environment, OR
 * - Node.js with jsdom + canvas polyfill, OR
 * - Node.js with 'canvas' package installed
 * 
 * Usage:
 *   pnpm tsx scripts/parse-character-table-poc.ts <image-path>
 * 
 * Example:
 *   pnpm tsx scripts/parse-character-table-poc.ts public/character-table.png
 * 
 * For browser usage, see: docs/sprite-parser-poc.md
 */

import { readFileSync } from 'fs'
import {
  extractSpritesFromImage,
  type ColorQuantizationConfig
} from '../src/utils/sprite-parser/CharacterTableParser'
import type { SpriteData } from '../src/core/interfaces/SpriteData'

// Check if we're in a browser-like environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
const hasCanvas = typeof HTMLCanvasElement !== 'undefined'

if (!isBrowser && !hasCanvas) {
  console.warn('⚠️  Warning: Browser APIs not available in Node.js')
  console.warn('   This script requires Canvas API support.')
  console.warn('   Options:')
  console.warn('   1. Run in browser environment')
  console.warn('   2. Install canvas package: pnpm add -D canvas')
  console.warn('   3. Use jsdom with canvas polyfill')
  console.warn('')
  console.warn('   See docs/sprite-parser-poc.md for details')
  console.warn('')
}

// Default color quantization configuration
const DEFAULT_COLOR_CONFIG: ColorQuantizationConfig = {
  colorCount: 4, // Family BASIC uses 4 color indices (0-3)
  backgroundThreshold: 200 // Pixels brighter than this are background
}

/**
 * Visualize a tile as ASCII art
 */
function visualizeTile(tile: SpriteData['tiles'][0]): string {
  const symbols = [' ', '░', '▒', '▓'] // Light to dark
  let output = ''
  
  for (const row of tile.pixelIndices) {
    for (const index of row) {
      output += symbols[Math.min(index, 3)]
    }
    output += '\n'
  }
  
  return output
}

/**
 * Print sprite data in a readable format
 */
function printSpriteData(sprite: SpriteData): void {
  console.log(`\n=== Sprite ${sprite.spriteNumber}: ${sprite.name} ===\n`)
  
  console.log('Tile 0 (Top-Left - CHR$(0)):')
  console.log(visualizeTile(sprite.tiles[0]))
  
  console.log('Tile 1 (Top-Right - CHR$(1)):')
  console.log(visualizeTile(sprite.tiles[1]))
  
  console.log('Tile 2 (Bottom-Left - CHR$(2)):')
  console.log(visualizeTile(sprite.tiles[2]))
  
  console.log('Tile 3 (Bottom-Right - CHR$(3)):')
  console.log(visualizeTile(sprite.tiles[3]))
  
  // Print pixel indices as arrays
  console.log('\nPixel Indices (for code generation):')
  console.log('Tile 0:', JSON.stringify(sprite.tiles[0].pixelIndices))
  console.log('Tile 1:', JSON.stringify(sprite.tiles[1].pixelIndices))
  console.log('Tile 2:', JSON.stringify(sprite.tiles[2].pixelIndices))
  console.log('Tile 3:', JSON.stringify(sprite.tiles[3].pixelIndices))
}

/**
 * Main POC function
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('Usage: pnpm tsx scripts/parse-character-table-poc.ts <image-path>')
    console.error('\nExample:')
    console.error('  pnpm tsx scripts/parse-character-table-poc.ts assets/images/sprites.png')
    console.error('\nNote: Image dimensions must be multiples of 16')
    console.error('      Image will be split into 16x16 pieces automatically')
    process.exit(1)
  }
  
  const imagePath = args[0]
  
  try {
    // Read image file and convert to data URL
    const imageBuffer = readFileSync(imagePath)
    const base64 = imageBuffer.toString('base64')
    const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 
                     imagePath.toLowerCase().endsWith('.jpg') || imagePath.toLowerCase().endsWith('.jpeg') ? 'image/jpeg' :
                     'image/png'
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    console.log(`Loading image: ${imagePath}`)
    console.log(`Image size: ${imageBuffer.length} bytes`)
    console.log(`MIME type: ${mimeType}`)
    console.log('\nNote: Image dimensions must be multiples of 16')
    console.log('      Image will be split into 16x16 pieces')
    console.log('      Each 16x16 piece will be split into 4 tiles of 8x8 each\n')
    
    // Extract all sprites from image (split into 16x16 pieces)
    console.log('--- Splitting Image into 16x16 Pieces ---')
    const sprites = await extractSpritesFromImage(
      dataUrl,
      DEFAULT_COLOR_CONFIG,
      1 // Start sprite number
    )
    
    console.log(`\n✅ Extracted ${sprites.length} sprite(s) successfully\n`)
    
    // Display first sprite as example
    if (sprites.length > 0) {
      console.log('--- First Sprite (Example) ---')
      printSpriteData(sprites[0])
      
      if (sprites.length > 1) {
        console.log(`\n... and ${sprites.length - 1} more sprite(s)`)
      }
    }
    
    console.log('\n\n✅ POC completed successfully!')
    console.log(`\nExtracted ${sprites.length} sprite(s) from the image`)
    console.log('Each 16x16 sprite has been split into 4 tiles:')
    console.log('  - Tile 0: Top-left (CHR$(0))')
    console.log('  - Tile 1: Top-right (CHR$(1))')
    console.log('  - Tile 2: Bottom-left (CHR$(2))')
    console.log('  - Tile 3: Bottom-right (CHR$(3))')
    
  } catch (error) {
    console.error('\n❌ Error during POC:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  }
}

// Run POC
main().catch(console.error)

