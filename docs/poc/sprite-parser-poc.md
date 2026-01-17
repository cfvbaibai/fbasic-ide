# Character Table Sprite Parser - Proof of Concept

## Overview

This POC demonstrates extracting sprite data from an image by **approximately splitting it into 16x16 pieces**. Each 16x16 piece is then split into 4 character tiles (8x8 pixels each) arranged in a 2x2 grid.

**Simplified Approach**: You provide any image, and the parser automatically:
1. Splits the image into 16x16 pieces (using floor division)
2. Each 16x16 piece is split into 4 tiles of 8x8 pixels each
3. Any remaining pixels at the edges are ignored

## Architecture

### Core Components

1. **Interfaces** (`src/core/interfaces/SpriteData.ts`)
   - `TileData`: Represents a single 8x8 character tile
   - `SpriteData`: Represents a complete sprite with 4 tiles
   - `CharacterTableData`: Complete character table with all sprites

2. **Image Processing** (`src/utils/sprite-parser/`)
   - `ImageLoader.ts`: Load images and extract pixel data using Canvas API
   - `ColorQuantizer.ts`: Convert pixel values to Family BASIC color indices (0-3)
   - `TileExtractor.ts`: Split 16x16 sprites into 4x 8x8 tiles
   - `SpriteExtractor.ts`: Extract individual sprites from grid
   - `CharacterTableParser.ts`: Main orchestrator

3. **POC Script** (`scripts/parse-character-table-poc.ts`)
   - Command-line tool to extract and visualize 1-2 sprites

## Usage

### Simplified Approach

1. **Prepare a 16x16 pixel image** of the sprite you want to extract
2. **Load the image** using the parser
3. **The parser automatically splits it** into 4 tiles of 8x8 pixels each

### Browser Environment (Recommended)

The parser uses Canvas API and works best in a browser environment. Use the test page at `/sprite-parser-test` to upload and process your 16x16 images.

## Running the POC

### Prerequisites

1. Prepare an image containing one or more sprites
2. The image should be at least 16x16 pixels (any size is acceptable)
3. The image will be automatically split into 16x16 pieces (approximately)
4. Any remaining pixels at the edges that don't form a complete 16x16 region will be ignored

### Browser-based Usage

1. Start the dev server:
   ```bash
   pnpm dev
   ```

2. Use the test page:
   - Navigate to `http://localhost:5173/sprite-parser-test`
   - Click "Choose File" and select your 16x16 image
   - Click "Extract Sprites"
   - View the extracted tiles

### Programmatic Usage

```typescript
import { extractSpriteFromImage } from './src/utils/sprite-parser/CharacterTableParser'

const sprite = await extractSpriteFromImage(
  imageFile, // File object or data URL
  1, // Sprite number
  'Sprite 1', // Sprite name
  {
    colorCount: 4,
    backgroundThreshold: 200
  }
)
```

### Node.js Usage (with canvas support)

```bash
# Run the POC script with a 16x16 image
pnpm tsx scripts/parse-character-table-poc.ts assets/images/sprite-16x16.png
```

## Output Format

The POC outputs:

1. **Visual ASCII representation** of each tile
   - Uses characters: ` ` (space), `░`, `▒`, `▓` to represent color indices

2. **Pixel index arrays** for each tile
   - 8x8 array of color indices (0-3)
   - Ready for code generation

3. **Tile ordering** matches Family BASIC:
   - Tile 0: Top-left (CHR$(0))
   - Tile 1: Top-right (CHR$(1))
   - Tile 2: Bottom-left (CHR$(2))
   - Tile 3: Bottom-right (CHR$(3))

## Configuration

### Color Quantization Config

```typescript
{
  colorCount: 4,                // Family BASIC uses 4 colors (0-3)
  backgroundThreshold: 200      // Pixels brighter than this = background
}
```

### Image Requirements

- **Dimensions**: Any size (minimum 16x16 pixels)
- **Format**: PNG or JPEG
- **Content**: Image will be approximately split into 16x16 pieces
- **Edge Handling**: Remaining pixels that don't form complete 16x16 regions are ignored

### Examples

- **16x16 image**: 1 sprite (1x1 grid)
- **32x32 image**: 4 sprites (2x2 grid)
- **64x64 image**: 16 sprites (4x4 grid)
- **50x50 image**: 9 sprites (3x3 grid, 2x2 pixels ignored at edges)
- **100x75 image**: 20 sprites (6x4 grid, 4x15 pixels ignored at edges)
- **128x128 image**: 64 sprites (8x8 grid)
- **256x256 image**: 256 sprites (16x16 grid)

### Tile Layout

The 16x16 image is automatically split into 4 tiles:
- **Tile 0**: Top-left (8x8) - pixels (0,0) to (7,7) → CHR$(0)
- **Tile 1**: Top-right (8x8) - pixels (8,0) to (15,7) → CHR$(1)
- **Tile 2**: Bottom-left (8x8) - pixels (0,8) to (7,15) → CHR$(2)
- **Tile 3**: Bottom-right (8x8) - pixels (8,8) to (15,15) → CHR$(3)

## Next Steps

After POC validation:

1. **Verify extracted sprites** match original image
2. **Adjust grid detection** if sprite positions are incorrect
3. **Fine-tune color quantization** thresholds
4. **Scale to extract all 213 sprites**
5. **Generate final data file** (JSON or TypeScript constants)
6. **Integrate with sprite rendering system**

## Troubleshooting

### Image not loading
- Ensure image path is correct
- Check image format (PNG, JPEG supported)
- Verify image is accessible

### Incorrect sprite extraction
- Check grid offset values (`gridOffsetX`, `gridOffsetY`)
- Verify cell size matches actual sprite size in image
- Adjust cell spacing if sprites have gaps

### Color quantization issues
- Adjust `backgroundThreshold` based on image brightness
- Check color palette detection results
- Verify color count matches Family BASIC (4 colors)

### Tile alignment issues
- Ensure sprite positions are multiples of 8 (tile size)
- Check for sub-pixel alignment issues
- Verify 16x16 sprite boundaries

## Files Created

- `src/core/interfaces/SpriteData.ts` - TypeScript interfaces
- `src/utils/sprite-parser/ImageLoader.ts` - Image loading utilities
- `src/utils/sprite-parser/ColorQuantizer.ts` - Color quantization
- `src/utils/sprite-parser/TileExtractor.ts` - Tile extraction
- `src/utils/sprite-parser/SpriteExtractor.ts` - Sprite extraction
- `src/utils/sprite-parser/CharacterTableParser.ts` - Main parser
- `scripts/parse-character-table-poc.ts` - POC script

