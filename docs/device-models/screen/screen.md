## Family BASIC Screen Specification

**Reference**: F-BASIC Manual Page 36 (Screen Display Process)

**Note**: The manual page 36 contains coordinate range errors for sprite screens (lists character coordinates instead of pixel coordinates). This documentation provides the correct specifications verified against the manual's dimension descriptions and our implementation.

### Screen Layer Architecture

Family BASIC uses a **multi-layer screen system** with 4 main display screens plus a separate BG GRAPHIC screen. Understanding the layer structure is critical for correct implementation.

#### Screen Layers (from back to front)

1. **Backdrop Screen** (furthest back)
   - **Dimensions**: 32 columns × 30 lines (character-based)
   - **Purpose**: Displays background color, always visible
   - **Default**: Black (transparent)
   - **Use Case**: Skies, oceans, solid color backgrounds
   - **Structure**: Extends beyond Background Screen
     - Adds 3 lines to top and bottom of Background Screen
     - Adds 2 columns to left and right of Background Screen
   - **Coordinate Range**: (0,0) to (31,29)

2. **Sprite Screen (Back)**
   - **Dimensions**: 256 dots × 240 dots (pixel-based)
   - **Purpose**: Displays sprites behind the Background Screen
   - **Control**: Set via `DEF SPRITE` or `DEF MOVE` with priority parameter `E=1`
   - **Coordinate Range**: (0,0) to (255,239) in dots
   - **Available Display Area**: x: 0-240, y: 5-220 (actual visible range)

3. **Background Screen** (PRINT content layer)
   - **Dimensions**: 28 columns × 24 lines (character-based)
   - **Purpose**: Primary screen for BASIC programs, displays alphanumeric characters, Kana, and symbols
   - **Content**: All `PRINT` output goes here
   - **Grid Structure**: 1 CHARACTER = 8 DOTS horizontally
   - **Coordinate Range**: (0,0) to (27,23)
   - **Total Character Cells**: 672 (28 × 24)
   - **Functionality**: Central point in GAME BASIC mode; sprites can be displayed in front or behind it

4. **Sprite Screen (Front)** (furthest front)
   - **Dimensions**: 256 dots × 240 dots (pixel-based)
   - **Purpose**: Displays sprites in front of the Background Screen
   - **Control**: Set via `DEF SPRITE` or `DEF MOVE` with priority parameter `E=0`
   - **Coordinate Range**: (0,0) to (255,239) in dots
   - **Available Display Area**: x: 0-240, y: 5-220 (actual visible range)

5. **BG GRAPHIC Screen** (separate drawing layer)
   - **Dimensions**: 28 columns × 21 lines (character-based)
   - **Purpose**: Draws BG GRAPHIC patterns
   - **Functionality**: Content can be copied to Background Screen via `VIEW` command
   - **Optimization**: Allows pre-drawing graphics, then copying to background for performance

#### Layer Rendering Order

```
┌─────────────────────────────────────┐
│  Sprite Screen (Front)              │ ← Top layer (sprites with E=0)
├─────────────────────────────────────┤
│  Background Screen                  │ ← PRINT content, characters, text
│  (28×24 characters)                 │
├─────────────────────────────────────┤
│  Sprite Screen (Back)               │ ← Bottom sprite layer (sprites with E=1)
├─────────────────────────────────────┤
│  Backdrop Screen                    │ ← Background color (32×30 characters)
└─────────────────────────────────────┘
```

#### Coordinate System Conversion

**Background Screen to Sprite Screen:**
- Background Screen uses character coordinates (0-27, 0-23)
- Sprite Screen uses dot/pixel coordinates (0-255, 0-239)
- Conversion formula (from page 89):
  ```
  sprite_x = (bg_x × 8) + 16
  sprite_y = (bg_y × 8) + 24
  ```
- Example: Background position (10, 10) = Sprite position (96, 104)

**Character to Dot Conversion:**
- 1 character = 8 dots horizontally
- Background Screen: 28 characters = 224 dots
- Sprite Screen: 256 dots total (32 dots wider than background)

### Screen Dimensions Summary

| Screen | Type | Dimensions | Coordinate Range | Purpose |
|--------|------|------------|------------------|---------|
| Backdrop | Character | 32×30 | (0,0) to (31,29) | Background color |
| Sprite (Back) | Pixel | 256×240 | (0,0) to (255,239) | Sprites behind BG |
| Background | Character | 28×24 | (0,0) to (27,23) | **PRINT content** |
| Sprite (Front) | Pixel | 256×240 | (0,0) to (255,239) | Sprites in front |
| BG GRAPHIC | Character | 28×21 | (0,0) to (27,20) | Graphics drawing |

### Screen Control Statements

#### LOCATE
- **Syntax**: `LOCATE X, Y`
- **Parameters**:
  - `X`: Horizontal column (0 to 27)
  - `Y`: Vertical line (0 to 23)
- **Function**: Moves cursor to specified position on background screen
- **Abbreviation**: `LOC.`

#### COLOR
- **Syntax**: `COLOR X, Y, n`
- **Parameters**:
  - `X`: Horizontal column (0 to 27)
  - `Y`: Vertical line (0 to 23)
  - `n`: Color pattern number (0 to 3)
- **Function**: Sets color pattern for the area containing position (X, Y)
- **Area Grid**: Screen divided into areas with specific X/Y coordinates
  - Horizontal: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26
  - Vertical: 0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23
- **Abbreviation**: `COL.`

#### CLS
- **Syntax**: `CLS`
- **Function**: Clears background screen, erases alphanumerics/kana/symbols, returns cursor to (0, 0)
- **Abbreviation**: `CL.`

#### CGEN
- **Syntax**: `CGEN n`
- **Parameters**:
  - `n`: Allocation combination (0 to 3)
- **Function**: Decides allocation of sprites on background screen and sprite screen
- **Allocation Table**:
  | n | Background Screen | Sprite Screen |
  |---|-------------------|---------------|
  | 0 | Character Table A | Character Table A |
  | 1 | Character Table A | Character Table B |
  | 2 | Character Table B | Character Table A |
  | 3 | Character Table B | Character Table B |
- **Default**: `CGEN 2`
- **Abbreviation**: `CGE.`

#### CGSET
- **Syntax**: `CGSET [m][,n]`
- **Parameters**:
  - `m`: Background palette code (0 or 1)
  - `n`: Sprite palette code (0 to 2)
- **Function**: Selects color palette for background and sprites
- **Default**: `m=1, n=1`
- **Abbreviation**: `CG.`

#### PALET
- **Syntax**: `PALET {B|S} n, C1, C2, C3, C4`
- **Parameters**:
  - `B`: Background
  - `S`: Sprite
  - `n`: Color combination number (0 to 3)
  - `C1`: Background color (valid when n=0)
  - `C1, C2, C3, C4`: Color codes (0 to 60) for left edge, center, right edge
- **Function**: Resets color code within color combination to arbitrary color
- **Abbreviation**: `PAL.B`, `PAL.S`

### Color System

#### 52 Color Codes
- **Range**: 0-60 (hex: 00-3C)
- **Categories**:
  - Gray~White: 30 (48) to 34 (52)
  - Colored: 35 (53) to 38 (56)
  - Black: 2D (45) to 2F (47)
- **Color Groups**: BLUE, RED, GREEN

#### Color Palette Structure
- **Background Palettes**: 2 (m = 0, 1)
- **Sprite Palettes**: 3 (n = 0, 1, 2)
- **Color Combinations per Palette**: 4 (0 to 3)
- **Color Codes per Combination**: 4 (C1, C2, C3, C4)

---

## Screen Implementation Design

### Screen Device Interface

**Data Model References:**
- Color codes: `COLORS` array (61 colors, indices 0-60) from `src/shared/data/palette.ts`
- Background palettes: `BACKGROUND_PALETTES` (2 palettes, each with 4 color combinations) from `src/shared/data/palette.ts`
- Sprite palettes: `SPRITE_PALETTES` (3 palettes, each with 4 color combinations) from `src/shared/data/palette.ts`

```typescript
// Color system types (from src/shared/data/palette.ts)
type ColorCode = number  // 0-60 (hex 0x00-0x3C)
type ColorCombination = [ColorCode, ColorCode, ColorCode, ColorCode]  // C1, C2, C3, C4
type Palette = [ColorCombination, ColorCombination, ColorCombination, ColorCombination]  // 4 combinations

interface ScreenDevice {
  // Cursor management
  getCursorPosition(): { x: number; y: number }
  setCursorPosition(x: number, y: number): void
  writeCharacter(x: number, y: number, char: string): void
  
  // Screen clearing
  clearScreen(): void
  
  // Color management
  setColorPattern(x: number, y: number, colorPattern: number): void
  getColorPattern(x: number, y: number): number
  setCgenAllocation(allocation: number): void
  getCgenAllocation(): number
  setColorPalette(bgPalette: number, spritePalette: number): void
  getColorPalette(): { bgPalette: number; spritePalette: number }
  setPaletColors(target: 'B' | 'S', combination: number, colors: ColorCombination): void
  getPaletColors(target: 'B' | 'S', combination: number): ColorCombination
  
  // Screen state
  getScreenBuffer(): ScreenCell[][]
  reset(): void
}

interface ScreenCell {
  character: string
  colorPattern: number
  x: number
  y: number
}

interface ScreenState {
  cursorX: number  // 0-27
  cursorY: number  // 0-23
  cgenAllocation: number  // 0-3
  bgPalette: number      // 0-1 (index into BACKGROUND_PALETTES)
  spritePalette: number  // 0-2 (index into SPRITE_PALETTES)
  bgPaletColors: Map<number, ColorCombination>  // combination -> colors
  spritePaletColors: Map<number, ColorCombination>  // combination -> colors
  colorPatternMap: Map<string, number> // Key: "x,y", Value: color pattern (0-3)
  screenBuffer: ScreenCell[][]  // 28×24
}
```

### Background Screen Implementation

**Canvas Rendering:**
- Uses HTML5 Canvas API for pixel-perfect rendering
- Single canvas element renders the entire 28×24 character grid
- Canvas dimensions: 240×208 pixels (224×192 content area + 8px padding on each side)
- Each character cell: 8×8 pixels
- Content area: 224×192 pixels (28×8 × 24×8)

**Screen Buffer:**
- 2D array: `ScreenCell[24][28]`
- Each cell stores: character (string), colorPattern (number 0-3), x, y coordinates
- Cursor position tracked separately

**Character Rendering:**
- Characters rendered using pixel-perfect tile data from `BACKGROUND_ITEMS`
- Each character is rendered as an 8×8 pixel tile using canvas ImageData
- Tile data lookup: Characters mapped to background items via `getBackgroundItemByChar()`
- Color patterns applied using `BACKGROUND_PALETTES` and color combinations
- Rendering implementation: `src/features/ide/composables/canvasRenderer.ts`

### Coordinate System Implementation

**Background Screen Coordinates:**
- Character-based: (0-27, 0-23)
- Origin: Top-left corner
- X increases right, Y increases down
- Canvas pixel coordinates: Each character rendered at (x * 8 + 8, y * 8 + 8) due to 8px padding on all sides

**Sprite Screen Coordinates:**
- Pixel-based: (0-255, 0-239)
- Origin: Top-left corner
- Conversion formula (for reference, sprite system not yet implemented):
  ```typescript
  function bgToSprite(bgX: number, bgY: number): { x: number; y: number } {
    return {
      x: (bgX * 8) + 16,
      y: (bgY * 8) + 24
    }
  }
  ```

### Color Pattern Area Mapping

**Area Grid Coordinates:**
- Horizontal: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26
- Vertical: 0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23

**Implementation:**
```typescript
function getColorArea(x: number, y: number): { areaX: number; areaY: number } {
  // Find nearest area boundary
  const areaX = Math.floor(x / 2) * 2;  // Round down to even number
  const areaY = y <= 0 ? 0 : 
                y <= 1 ? 1 :
                Math.floor((y - 1) / 2) * 2 + 1;  // Special handling for first row
  
  return { areaX, areaY };
}

function setColorPattern(x: number, y: number, pattern: number): void {
  const area = getColorArea(x, y);
  const key = `${area.areaX},${area.areaY}`;
  this.colorPatternMap.set(key, pattern);
}
```

### PRINT Integration

**Cursor-Aware Output:**
```typescript
class PrintExecutor {
  printOutput(output: string, screenDevice: ScreenDevice): void {
    let { x, y } = screenDevice.getCursorPosition();
    
    for (const char of output) {
      // Write character to screen buffer
      screenDevice.writeCharacter(x, y, char);
      
      // Advance cursor
      x++;
      
      // Handle column wrapping
      if (x >= 28) {
        x = 0;
        y++;
        // Handle line scrolling
        if (y >= 24) {
          y = 0; // or scroll screen up
        }
      }
    }
    
    // Update cursor position
    screenDevice.setCursorPosition(x, y);
  }
}
```

**Tab Stop Calculation:**
- Tab stops: 0-7, 8-15, 16-23, 24-27
- Calculated relative to current cursor X position

### Color System Implementation

**Palette Management:**
```typescript
// Data structures from src/shared/data/palette.ts
type ColorCode = number  // 0-60 (hex 0x00-0x3C)
type ColorCombination = [ColorCode, ColorCode, ColorCode, ColorCode]
type Palette = [ColorCombination, ColorCombination, ColorCombination, ColorCombination]

// Actual data arrays:
// BACKGROUND_PALETTES: [Palette, Palette]  // 2 palettes
// SPRITE_PALETTES: [Palette, Palette, Palette]  // 3 palettes
// COLORS: string[]  // 61 hex color values (e.g., '#626262', '#002263', ...)
```

**CGEN Allocation:**
- Controls which character table is used for Background and Sprite screens
- Affects character rendering and sprite definitions

**CGSET Palette Selection:**
- Selects active palette from available palettes
- Background: 2 options (0-1)
- Sprite: 3 options (0-2)

**PALET Color Customization:**
- Allows custom color codes for each combination
- Background: 4 combinations × 4 colors = 16 color codes
- Sprite: 4 combinations × 4 colors = 16 color codes

### Web Implementation

**WebScreenDevice:**
```typescript
class WebScreenDevice implements ScreenDevice {
  private state: ScreenState
  
  constructor() {
    this.state = this.createInitialState()
  }
  
  writeCharacter(x: number, y: number, char: string): void {
    // Update screen buffer
    this.state.screenBuffer[y][x] = {
      character: char,
      colorPattern: this.getColorPattern(x, y),
      x,
      y
    }
    
    // Send update to main thread for canvas rendering
    this.sendScreenUpdate({ type: 'CHARACTER_UPDATE', x, y, char })
  }
  
  setCursorPosition(x: number, y: number): void {
    this.state.cursorX = x
    this.state.cursorY = y
    this.sendScreenUpdate({ type: 'CURSOR_UPDATE', x, y })
  }
}
```

**Main Thread Rendering:**
- Receives screen update messages from web worker
- Updates canvas element using `renderScreenBuffer()` function
- Applies color patterns and palettes using canvas pixel rendering
- Maintains visual representation of screen buffer via canvas ImageData