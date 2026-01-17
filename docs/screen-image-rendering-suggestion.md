# Screen Image Rendering Suggestion

## Overview
Replace DOM-based text characters in `Screen.vue` with pixel-perfect image rendering using the existing 8×8 tile data for letters, numbers, symbols, and kana.

---

## Rendering Approaches

### Option 1: Single Canvas Rendering (Recommended) ⭐

**Best for:** Performance, pixel-perfect rendering, authentic game-like appearance

**How it works:**
- Use a single HTML5 `<canvas>` element to render the entire 28×24 screen
- Each character cell (8×8 pixels) is drawn directly to the canvas
- Update only changed cells when screen buffer changes
- Scale canvas using CSS for display

**Benefits:**
- ✅ Excellent performance (single render target, minimal DOM nodes)
- ✅ Pixel-perfect rendering at native resolution
- ✅ Authentic retro game appearance
- ✅ Easy to add scanlines, CRT effects, pixel scaling
- ✅ Efficient updates (only redraw changed cells)

**Drawbacks:**
- ❌ Less "Vue-like" (direct canvas manipulation)
- ❌ Slightly more complex state management

**Implementation Structure:**
```
Screen.vue
  └─ <canvas ref="screenCanvas">
  └─ useScreenCanvasRenderer composable
      ├─ renderCell(x, y, character, colorPattern)
      ├─ renderScreen(buffer)
      └─ getBackgroundItem(character)
```

**Key Functions:**
```typescript
// Render a single 8×8 cell at position (x, y)
function renderCell(
  ctx: CanvasRenderingContext2D,
  x: number,  // Column (0-27)
  y: number,  // Row (0-23)
  character: string,
  colorPattern: number,
  paletteCode: number = 1  // Default background palette
): void {
  // 1. Lookup BackgroundItem by character
  // 2. Get color combination from BACKGROUND_PALETTES
  // 3. Draw 8×8 pixels using tile data and colors
  // 4. Map tile values (0,1,2,3) to actual colors
}
```

---

### Option 2: Component-Based Rendering (Alternative)

**Best for:** Vue reactivity, component isolation, easier debugging

**How it works:**
- Create a `BackgroundTile.vue` component for each 8×8 cell
- Render each tile using CSS-based pixel rendering or small canvas
- Similar to existing `SpriteGrid.vue` pattern

**Benefits:**
- ✅ Follows Vue component patterns
- ✅ Individual cell reactivity
- ✅ Easier to debug (inspect individual cells)
- ✅ Consistent with sprite-viewer approach

**Drawbacks:**
- ❌ 672 DOM nodes (28×24) may impact performance
- ❌ More complex CSS for pixel-perfect rendering
- ❌ Harder to add screen-wide effects (scanlines, etc.)

**Implementation Structure:**
```
Screen.vue
  └─ BackgroundTile (672 instances)
      └─ Renders 8×8 pixel grid using CSS or mini-canvas
```

---

### Option 3: Hybrid Approach

**Best for:** Balance between performance and Vue patterns

**How it works:**
- Use canvas for rendering
- Wrap in Vue component for reactivity
- Use `watchEffect` or `watch` to trigger canvas updates
- Maintain Vue-like structure while leveraging canvas performance

**Benefits:**
- ✅ Good performance (canvas rendering)
- ✅ Vue reactivity for updates
- ✅ Clean component structure

---

## Recommendation: Option 1 (Single Canvas) 

Based on your requirements for "real game" appearance and performance, **Option 1 (Single Canvas)** is recommended because:

1. **Performance**: 672 cells rendered efficiently in one canvas
2. **Authenticity**: Pixel-perfect rendering matches real Famicom appearance
3. **Scalability**: Easy to add effects (CRT scanlines, pixel scaling, filters)
4. **Memory**: Single canvas element vs 672 DOM nodes

---

## Implementation Plan

### Phase 1: Create Lookup Utilities

**File:** `src/shared/utils/backgroundLookup.ts`

```typescript
import type { BackgroundItem } from '@/shared/data/types'
import { LETTER_BG_ITEMS, NUMBER_BG_ITEMS, SYMBOL_BG_ITEMS, KANA_BG_ITEMS } from '@/shared/data/bg'

// Combine all background items
const ALL_BG_ITEMS: BackgroundItem[] = [
  ...LETTER_BG_ITEMS,
  ...NUMBER_BG_ITEMS,
  ...SYMBOL_BG_ITEMS,
  ...KANA_BG_ITEMS
]

// Create lookup maps
const BY_CODE = new Map<number, BackgroundItem>()
const BY_CHAR = new Map<string, BackgroundItem>()

// Build lookup maps
ALL_BG_ITEMS.forEach(item => {
  BY_CODE.set(item.code, item)
  if (item.char) BY_CHAR.set(item.char, item)
  item.altChars?.forEach(alt => BY_CHAR.set(alt, item))
})

export function getBackgroundItemByCode(code: number): BackgroundItem | null {
  return BY_CODE.get(code) ?? null
}

export function getBackgroundItemByChar(char: string): BackgroundItem | null {
  return BY_CHAR.get(char) ?? null
}
```

### Phase 2: Create Canvas Renderer Composable

**File:** `src/features/ide/composables/useScreenCanvasRenderer.ts`

```typescript
import { ref, watch, type Ref } from 'vue'
import { BACKGROUND_PALETTES, COLORS } from '@/shared/data/palette'
import { getBackgroundItemByChar } from '@/shared/utils/backgroundLookup'

interface ScreenCell {
  character: string
  colorPattern: number
  x: number
  y: number
}

export function useScreenCanvasRenderer(
  canvasRef: Ref<HTMLCanvasElement | null>,
  screenBuffer: Ref<ScreenCell[][]>,
  paletteCode: Ref<number> = ref(1)  // Default palette 1
) {
  const CELL_SIZE = 8  // 8×8 pixels per cell
  const COLS = 28
  const ROWS = 24
  const CANVAS_WIDTH = COLS * CELL_SIZE  // 224 pixels
  const CANVAS_HEIGHT = ROWS * CELL_SIZE  // 192 pixels

  function renderCell(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    character: string,
    colorPattern: number
  ): void {
    // Lookup background item
    const bgItem = getBackgroundItemByChar(character)
    if (!bgItem) {
      // Space or unknown character - clear cell
      ctx.fillStyle = COLORS[BACKGROUND_PALETTES[paletteCode.value][colorPattern][0]]
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      return
    }

    // Get color combination
    const palette = BACKGROUND_PALETTES[paletteCode.value]
    const colorCombination = palette[colorPattern] || palette[0]
    
    // Render tile pixels
    const tile = bgItem.tile
    const pixelX = x * CELL_SIZE
    const pixelY = y * CELL_SIZE

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const pixelValue = tile[row]?.[col] ?? 0
        const colorIndex = colorCombination[pixelValue] ?? colorCombination[0]
        const color = COLORS[colorIndex] ?? COLORS[0]

        ctx.fillStyle = color
        ctx.fillRect(pixelX + col, pixelY + row, 1, 1)
      }
    }
  }

  function renderScreen(buffer: ScreenCell[][]): void {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Set canvas size
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    // Render all cells
    for (let y = 0; y < ROWS; y++) {
      const row = buffer[y]
      if (!row) continue
      
      for (let x = 0; x < COLS; x++) {
        const cell = row[x]
        if (cell) {
          renderCell(ctx, x, y, cell.character || ' ', cell.colorPattern)
        }
      }
    }
  }

  // Watch for screen buffer changes
  watch(
    [screenBuffer, paletteCode],
    () => {
      renderScreen(screenBuffer.value)
    },
    { immediate: true, deep: true }
  )

  return {
    renderScreen,
    renderCell
  }
}
```

### Phase 3: Update Screen.vue

**Modifications to:** `src/features/ide/components/Screen.vue`

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScreenCanvasRenderer } from '../composables/useScreenCanvasRenderer'

// ... existing interface and props ...

const screenCanvas = ref<HTMLCanvasElement | null>(null)

// Use canvas renderer
useScreenCanvasRenderer(screenCanvas, computed(() => props.screenBuffer))

// ... rest of component ...
</script>

<template>
  <div class="screen-container">
    <!-- ... header ... -->
    <div class="screen-display">
      <canvas
        ref="screenCanvas"
        class="screen-canvas"
      />
    </div>
  </div>
</template>

<style scoped>
.screen-canvas {
  display: block;
  image-rendering: pixelated;  /* Crisp pixel scaling */
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  width: 100%;
  height: auto;
  max-width: 672px;  /* 28 * 24px at 1x scale */
  background: var(--game-screen-bg-color);
}
</style>
```

---

## Color Mapping Details

**Color Pattern Flow:**
```
ScreenCell.colorPattern (0-3)
  ↓
BACKGROUND_PALETTES[paletteCode][colorPattern]
  ↓
ColorCombination [C1, C2, C3, C4]
  ↓
Tile pixel value (0, 1, 2, 3) → ColorCombination[index]
  ↓
COLORS[colorCode] → Actual RGB color
```

**Mapping:**
- Tile value `0` → `colorCombination[0]` (C1 - background/transparent)
- Tile value `1` → `colorCombination[1]` (C2)
- Tile value `2` → `colorCombination[2]` (C3)
- Tile value `3` → `colorCombination[3]` (C4)

---

## Performance Considerations

### Canvas Scaling
- Render at native resolution (224×192 pixels)
- Scale using CSS `width`/`height` or `transform: scale()`
- Use `image-rendering: pixelated` for crisp pixels

### Update Optimization
- Only redraw changed cells (track dirty cells)
- Consider double buffering for smooth updates
- Use `requestAnimationFrame` for animation timing

### Memory
- Single canvas: ~170KB (224×192×4 bytes RGBA)
- Much better than 672 DOM nodes

---

## Additional Enhancements (Future)

1. **CRT Effects**
   - Scanlines overlay
   - Curvature/distortion
   - Phosphor glow

2. **Pixel Scaling Options**
   - 1x, 2x, 3x, 4x scaling
   - Integer scaling to maintain aspect ratio

3. **Color Filters**
   - Original, composite, RGB, S-video
   - Palette swapping

4. **Performance Monitoring**
   - FPS counter
   - Render time tracking

---

## Files to Create/Modify

### New Files:
1. `src/shared/data/bg/index.ts` - Consolidated exports (if not exists)
2. `src/shared/utils/backgroundLookup.ts` - Lookup utilities
3. `src/features/ide/composables/useScreenCanvasRenderer.ts` - Canvas rendering logic

### Modified Files:
1. `src/features/ide/components/Screen.vue` - Replace text with canvas

### Optional:
- `src/features/ide/composables/useBackgroundPalette.ts` - Palette selection state (if needed)

---

## Testing Checklist

- [ ] All character types render correctly (letters, numbers, symbols, kana)
- [ ] Color patterns apply correctly (0-3)
- [ ] Screen clears properly
- [ ] Cursor position renders (if applicable)
- [ ] Performance is acceptable (60 FPS)
- [ ] Scaling works at different sizes
- [ ] Unknown characters render as space
- [ ] Color palette switching works

---

## References

- Existing sprite viewer implementation: `src/features/sprite-viewer/composables/useSpriteDisplay.ts`
- Background items: `src/shared/data/bg/*.ts`
- Color system: `src/shared/data/palette.ts`
- Screen documentation: `docs/screen-device-model/screen.md`
- Background rendering analysis: `docs/background-image-rendering-analysis.md`
