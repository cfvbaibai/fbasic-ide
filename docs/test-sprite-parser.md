# Testing the Sprite Parser POC

## Quick Start

1. **Start the dev server** (if not already running):
   ```bash
   pnpm dev
   ```

2. **Open the test page** in your browser:
   ```
   http://localhost:5173/sprite-parser-test
   ```

3. **Select the Character Table image**:
   - Click "Choose File" or drag and drop
   - Select `assets/images/character-table.png`

4. **Click "Extract Sprites"** to test extraction

## What to Expect

The test page will:
- Extract Sprite 1 (Mario WALK1) from Row 0, Column 0
- Extract Sprite 4 (Mario WALK2) from Row 0, Column 1
- Display ASCII visualizations of each tile
- Show pixel index arrays for each tile

## Troubleshooting

### Image not loading
- Ensure the image path is correct
- Check browser console for errors
- Verify image file exists at `assets/images/character-table.png`

### Extraction fails
- Check browser console for detailed error messages
- Verify grid position parameters (row, column) are correct
- Adjust `backgroundThreshold` in config if color quantization is off

### Tiles look incorrect
- Grid detection may need adjustment
- Try different `gridOffsetX` and `gridOffsetY` values
- Verify `spriteCellSize` matches actual sprite size in image

## Next Steps After Testing

1. **Verify extracted sprites** match the original image visually
2. **Adjust grid detection** if sprite positions are incorrect
3. **Fine-tune color quantization** thresholds
4. **Scale to extract all 213 sprites** once POC is validated

