# Background Image Rendering Analysis

## Task Overview
Replace text characters on screen with actual background images (letters, numbers, symbols, kana) rendered from tile data.

---

## What We Already Have ✅

### 1. Background Item Data Structures
**Location:** `src/shared/data/bg/`

- **Letters** (`letter.ts`): A-Z (26 characters, codes 65-90)
  - Each has `code`, `char`, `altChars`, and `tile` (8×8 array)
  - Example: `BGITEM_LETTER_A_65` with pixel data array

- **Numbers** (`number.ts`): 0-9 (10 characters, codes 48-57)
  - Same structure as letters

- **Symbols** (`symbol.ts`): Various symbols (codes 32-64, 91-95, 176-182)
  - Includes space, punctuation, special characters

- **Kana** (`kana.ts`): Japanese kana characters (codes 97+)
  - Hiragana and Katakana characters

**Data Structure:**
```typescript
interface BackgroundItem {
  code: number        // ASCII/character code
  char?: string       // Primary character representation
  altChars?: string[] // Alternative character representations
  tile: Tile          // 8×8 array of color indices (0-3)
}
```

### 2. Color System
**Location:** `src/shared/data/palette.ts`

- **COLORS array**: 61 NES/Famicom colors (indices 0-60)
- **BACKGROUND_PALETTES**: 2 palettes, each with 4 color combinations
- **Color Combination Structure**: `[C1, C2, C3, C4]`
  - C1: Background color (used when n=0)
  - C2, C3, C4: Color codes for tile values 1, 2, 3

### 3. Screen Component Infrastructure
**Location:** `src/features/ide/components/Screen.vue`

- **ScreenCell interface**: Already has `character` and `colorPattern` fields
- **Screen buffer**: 28×24 grid of ScreenCell objects
- **Rendering structure**: Grid-based layout ready for image rendering
- Currently displays: `{{ cell.character || ' ' }}` (text rendering)

### 4. Image Assets
**Location:** `assets/images/`

- `bg-letter-*.png` (1-6): Letter background images
- `bg-number-*.png` (5): Number background images  
- `bg-symbol-*.png` (1-10): Symbol background images
- `bg-kana-*.png` (1-20): Kana background images

**Note:** These appear to be source images, not necessarily the rendered output we need.

### 5. Sprite Rendering Reference
**Location:** `src/features/sprite-viewer/composables/useSpriteDisplay.ts`

- Example of how to render tiles with colors
- `getCellColor()` function shows color mapping pattern
- Uses `SPRITE_PALETTES` and `COLORS` for rendering

---

## What We're Missing ❌

### 1. Character-to-BackgroundItem Lookup Utility
**Missing:** A function to find `BackgroundItem` by character code or character string.

**Needed:**
```typescript
// Function to lookup background item by character
function getBackgroundItemByChar(char: string): BackgroundItem | null
function getBackgroundItemByCode(code: number): BackgroundItem | null
```

**Current State:** No lookup utility exists. Need to:
- Combine all `*_BG_ITEMS` arrays into a single lookup structure
- Create lookup by character code (ASCII)
- Create lookup by character string (with altChars support)

### 2. Tile-to-Image Rendering Component/Utility
**Missing:** A component or utility to render an 8×8 tile array as a visual image.

**Needed:**
- Component that takes a `Tile` (8×8 array) and renders it as pixels
- Apply color pattern using `colorPattern` field and `BACKGROUND_PALETTES`
- Map tile values (0, 1, 2, 3) to actual colors:
  - 0 → transparent or background color (C1)
  - 1 → C2 from color combination
  - 2 → C3 from color combination
  - 3 → C4 from color combination

**Reference Implementation:** Similar to `useSpriteDisplay.ts` but for background tiles.

### 3. Screen Component Integration
**Missing:** Integration of background image rendering into `Screen.vue`.

**Current State:**
- Line 80: `{{ cell.character || ' ' }}` - renders text
- Need to replace with background image rendering

**Needed Changes:**
1. Import background item lookup utility
2. Import tile rendering component/utility
3. Replace text rendering with image rendering
4. Apply color pattern from `cell.colorPattern`

### 4. Color Pattern Application
**Missing:** Logic to apply `colorPattern` to background tiles.

**Current State:**
- `ScreenCell` has `colorPattern: number` field
- Not currently used in rendering

**Needed:**
- Determine which color combination to use from `colorPattern`
- Apply colors from `BACKGROUND_PALETTES` based on palette selection
- Map tile pixel values to actual colors

### 5. Background Palette Selection State
**Missing:** State management for background palette selection.

**Current State:**
- No background palette selection in IDE
- Only sprite palette selection exists (`usePaletteSelection.ts`)

**Needed:**
- Background palette code (0 or 1) - default to 1 per documentation
- Color combination selection (0-3) - may need to derive from `colorPattern`
- Integration with CGSET command (if implemented)

### 6. Consolidated Background Items Export
**Missing:** Single export combining all background item arrays.

**Needed:**
```typescript
// src/shared/data/bg/index.ts
export const ALL_BG_ITEMS: BackgroundItem[] = [
  ...LETTER_BG_ITEMS,
  ...NUMBER_BG_ITEMS,
  ...SYMBOL_BG_ITEMS,
  ...KANA_BG_ITEMS,
]
```

---

## Implementation Plan

### Phase 1: Data Structure & Lookup
1. Create `src/shared/data/bg/index.ts` to export all background items
2. Create `src/shared/utils/backgroundLookup.ts` with lookup functions
3. Create lookup maps for fast character/code lookup

### Phase 2: Tile Rendering Component
1. Create `src/features/ide/components/BackgroundTile.vue` component
2. Implement tile-to-pixel rendering
3. Apply color pattern and palette colors
4. Handle transparent pixels (value 0)

### Phase 3: Screen Integration
1. Update `Screen.vue` to use `BackgroundTile` component
2. Replace text rendering with image rendering
3. Integrate background palette selection
4. Apply color patterns from screen cells

### Phase 4: Testing & Refinement
1. Test all character types (letters, numbers, symbols, kana)
2. Test color pattern application
3. Verify 28×24 grid rendering
4. Performance optimization if needed

---

## Technical Details

### Tile Data Format
- Each tile is an 8×8 array: `number[][]`
- Values: 0 (transparent/background), 1, 2, 3 (foreground colors)
- Each value maps to a color from the color combination

### Color Mapping
```typescript
// For a tile pixel value and colorPattern:
const palette = BACKGROUND_PALETTES[paletteCode] // 0 or 1
const colorCombination = palette[colorPattern] // 0-3
const colorCode = colorCombination[pixelValue]  // C1, C2, C3, or C4
const color = COLORS[colorCode]
```

### Character Code Mapping
- ASCII codes: 32-126 (standard ASCII)
- Extended codes: 176-182 (special symbols)
- Kana codes: 97+ (Japanese characters)

---

## Files to Create/Modify

### New Files:
1. `src/shared/data/bg/index.ts` - Consolidated exports
2. `src/shared/utils/backgroundLookup.ts` - Lookup utilities
3. `src/features/ide/components/BackgroundTile.vue` - Tile rendering component
4. `src/features/ide/composables/useBackgroundPalette.ts` - Palette selection (optional)

### Modified Files:
1. `src/features/ide/components/Screen.vue` - Replace text with images
2. `src/core/devices/WebWorkerDeviceAdapter.ts` - May need colorPattern updates

---

## Dependencies

### Existing Dependencies (Already Available):
- `COLORS` from `@/shared/data/palette`
- `BACKGROUND_PALETTES` from `@/shared/data/palette`
- `BackgroundItem` type from `@/shared/data/types`
- All `*_BG_ITEMS` arrays

### No New Dependencies Needed:
- Can use Canvas API or CSS for pixel rendering
- Vue 3 reactive system already in place

---

## Notes

1. **Image Assets**: The PNG files in `assets/images/` may be source images for reference, not the actual rendered output. We'll render from tile data arrays instead.

2. **Color Pattern**: The `colorPattern` field in `ScreenCell` likely corresponds to the color combination number (0-3) in the palette.

3. **Performance**: Rendering 672 cells (28×24) as individual images may need optimization. Consider:
   - Canvas-based rendering for entire screen
   - CSS-based rendering with background images
   - Caching rendered tiles

4. **Character Matching**: Need to handle case-insensitive matching for letters (A/a, B/b, etc.) using `altChars` field.
