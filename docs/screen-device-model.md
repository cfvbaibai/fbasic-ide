# Family BASIC Screen Device Integration - Design Document

## Overview

This document outlines the design for integrating SCREEN device functionality into the Family BASIC interpreter. The SCREEN device handles all screen-related operations including cursor positioning, color management, screen clearing, and character display coordination.

## Family BASIC Screen Specification

### Screen Dimensions
- **Columns**: 28 (0-27)
- **Lines**: 24 (0-23)
- **Coordinate System**: Top-left corner is (0, 0)
- **Total Character Cells**: 672 (28 × 24)

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

## Design Architecture

### 1. Screen Device Interface

```typescript
export interface ScreenDevice {
  // === CURSOR MANAGEMENT ===
  /**
   * Get current cursor position
   * @returns {x: number, y: number} Current cursor coordinates
   */
  getCursorPosition(): { x: number; y: number }
  
  /**
   * Set cursor position
   * @param x - Horizontal column (0-27)
   * @param y - Vertical line (0-23)
   */
  setCursorPosition(x: number, y: number): void
  
  /**
   * Write a character to the screen buffer at specified position
   * @param x - Horizontal column (0-27)
   * @param y - Vertical line (0-23)
   * @param char - Character to write (single character string)
   */
  writeCharacter(x: number, y: number, char: string): void
  
  // === SCREEN CLEARING ===
  /**
   * Clear the background screen
   * Resets cursor to (0, 0) and clears all text
   */
  clearScreen(): void
  
  // === COLOR MANAGEMENT ===
  /**
   * Set color pattern for screen area
   * @param x - Horizontal column (0-27)
   * @param y - Vertical line (0-23)
   * @param colorPattern - Color pattern number (0-3)
   */
  setColorPattern(x: number, y: number, colorPattern: number): void
  
  /**
   * Get color pattern for screen area
   * @param x - Horizontal column (0-27)
   * @param y - Vertical line (0-23)
   * @returns Color pattern number (0-3)
   */
  getColorPattern(x: number, y: number): number
  
  /**
   * Set CGEN allocation
   * @param allocation - Allocation combination (0-3)
   */
  setCgenAllocation(allocation: number): void
  
  /**
   * Get current CGEN allocation
   * @returns Allocation combination (0-3)
   */
  getCgenAllocation(): number
  
  /**
   * Set color palette
   * @param bgPalette - Background palette code (0-1)
   * @param spritePalette - Sprite palette code (0-2)
   */
  setColorPalette(bgPalette: number, spritePalette: number): void
  
  /**
   * Get current color palette
   * @returns {bgPalette: number, spritePalette: number}
   */
  getColorPalette(): { bgPalette: number; spritePalette: number }
  
  /**
   * Set PALET color codes
   * @param target - 'B' for background, 'S' for sprite
   * @param combination - Color combination number (0-3)
   * @param colors - Color codes [C1, C2, C3, C4] (0-60)
   */
  setPaletColors(
    target: 'B' | 'S',
    combination: number,
    colors: [number, number, number, number]
  ): void
  
  /**
   * Get PALET color codes
   * @param target - 'B' for background, 'S' for sprite
   * @param combination - Color combination number (0-3)
   * @returns Color codes [C1, C2, C3, C4]
   */
  getPaletColors(target: 'B' | 'S', combination: number): [number, number, number, number]
  
  // === SCREEN STATE ===
  /**
   * Get screen buffer (for rendering)
   * @returns 2D array representing screen state
   */
  getScreenBuffer(): ScreenCell[][]
  
  /**
   * Reset screen to default state
   */
  reset(): void
}
```

### 2. Screen Cell Interface

```typescript
export interface ScreenCell {
  character: string
  colorPattern: number
  x: number
  y: number
}
```

### 3. Screen State Interface

```typescript
export interface ScreenState {
  // Cursor position
  cursorX: number
  cursorY: number
  
  // CGEN allocation
  cgenAllocation: number
  
  // Color palettes
  bgPalette: number
  spritePalette: number
  
  // PALET color codes
  bgPaletColors: Map<number, [number, number, number, number]>
  spritePaletColors: Map<number, [number, number, number, number]>
  
  // Color pattern map (area-based)
  colorPatternMap: Map<string, number> // Key: "x,y", Value: color pattern
  
  // Screen buffer (28x24)
  screenBuffer: ScreenCell[][]
}
```

### 4. BasicDeviceAdapter Extension

Extend `BasicDeviceAdapter` interface to include screen operations:

```typescript
export interface BasicDeviceAdapter {
  // === EXISTING METHODS ===
  // ... joystick and text output methods ...
  
  // === SCREEN OPERATIONS ===
  /**
   * Get screen device instance
   */
  getScreenDevice(): ScreenDevice | null
  
  /**
   * LOCATE command handler
   * @param x - Horizontal column (0-27)
   * @param y - Vertical line (0-23)
   */
  locate(x: number, y: number): void
  
  /**
   * COLOR command handler
   * @param x - Horizontal column (0-27)
   * @param y - Vertical line (0-23)
   * @param colorPattern - Color pattern number (0-3)
   */
  setColor(x: number, y: number, colorPattern: number): void
  
  /**
   * CLS command handler
   */
  cls(): void
  
  /**
   * CGEN command handler
   * @param allocation - Allocation combination (0-3)
   */
  setCgen(allocation: number): void
  
  /**
   * CGSET command handler
   * @param bgPalette - Background palette code (0-1), optional
   * @param spritePalette - Sprite palette code (0-2), optional
   */
  setCgset(bgPalette?: number, spritePalette?: number): void
  
  /**
   * PALET command handler
   * @param target - 'B' for background, 'S' for sprite
   * @param combination - Color combination number (0-3)
   * @param colors - Color codes [C1, C2, C3, C4] (0-60)
   */
  setPalet(
    target: 'B' | 'S',
    combination: number,
    colors: [number, number, number, number]
  ): void
}
```

### 5. Screen Device Implementation

#### WebScreenDevice

A concrete implementation for web browsers:

```typescript
export class WebScreenDevice implements ScreenDevice {
  private state: ScreenState
  
  constructor() {
    this.state = this.createInitialState()
  }
  
  private createInitialState(): ScreenState {
    // Initialize with defaults
    return {
      cursorX: 0,
      cursorY: 0,
      cgenAllocation: 2, // Default CGEN 2
      bgPalette: 1,      // Default CGSET 1,1
      spritePalette: 1,
      bgPaletColors: new Map(),
      spritePaletColors: new Map(),
      colorPatternMap: new Map(),
      screenBuffer: this.createEmptyBuffer()
    }
  }
  
  private createEmptyBuffer(): ScreenCell[][] {
    const buffer: ScreenCell[][] = []
    for (let y = 0; y < 24; y++) {
      buffer[y] = []
      for (let x = 0; x < 28; x++) {
        buffer[y][x] = {
          character: ' ',
          colorPattern: 0,
          x,
          y
        }
      }
    }
    return buffer
  }
  
  // Implement all ScreenDevice interface methods...
}
```

### 6. Integration with PrintExecutor

Modify `PrintExecutor` to respect cursor position and screen dimensions:

```typescript
export class PrintExecutor {
  // ... existing code ...
  
  private printOutput(output: string, shouldAppendToPrevious: boolean): void {
    if (!this.context.deviceAdapter) {
      // Fallback to console
      console.log(output)
      return
    }
    
    // Get current cursor position from screen device
    const screenDevice = this.context.deviceAdapter.getScreenDevice()
    if (screenDevice) {
      const { x, y } = screenDevice.getCursorPosition()
      // Handle text output with cursor tracking
      // Handle line wrapping at column 28
      // Handle scrolling when reaching line 24
    }
    
    // Output to device adapter
    this.context.deviceAdapter.printOutput(output)
  }
}
```

### 6.1. How LOCATE Affects PRINT Behavior

The interaction between `LOCATE` and `PRINT` is fundamental to Family BASIC screen output. Understanding this relationship is critical for correct implementation.

#### Current State

The current `PrintExecutor` implementation does **not** track cursor position. It:
- Builds output strings sequentially
- Tracks `currentColumn` only for tab stop calculations (comma separators)
- Does not respect screen coordinates or LOCATE positions
- Outputs text as simple strings without positional awareness

#### Required Behavior

When `LOCATE` is used, `PRINT` must:

1. **Start outputting at the cursor position set by LOCATE**
   ```basic
   LOCATE 5, 10: PRINT "Hello"
   ```
   - `LOCATE` sets cursor to (5, 10)
   - `PRINT` starts outputting "Hello" at position (5, 10)
   - Each character is written to the screen buffer at the current cursor position

2. **Update cursor position as characters are written**
   - After printing "Hello" (5 characters), cursor moves to (10, 10)
   - Cursor advances horizontally for each character printed

3. **Handle cursor movement after PRINT completes**
   - **Without semicolon**: Cursor moves to start of next line
     ```basic
     LOCATE 5, 10
     PRINT "Hello"    ' Prints at (5,10), cursor moves to (0,11)
     ```
   - **With semicolon**: Cursor stays on same line
     ```basic
     LOCATE 5, 10
     PRINT "Hello";   ' Prints at (5,10), cursor stays at (10,10)
     PRINT "World"    ' Continues at (10,10)
     ```

4. **Respect screen boundaries**
   - **Column wrapping**: When reaching column 28, wrap to column 0 of next line
   - **Line scrolling**: When reaching line 24, scroll screen up (or wrap to line 0)

5. **Coordinate tab stops relative to cursor position**
   ```basic
   LOCATE 3, 5
   PRINT "A", "B", "C"
   ```
   - Starts at (3, 5)
   - "A" prints at (3, 5)
   - Comma moves to next tab stop: (8, 5) - calculated from current X=3
   - "B" prints at (8, 5)
   - Comma moves to next tab stop: (16, 5) - calculated from current X=8
   - "C" prints at (16, 5)

#### Example from Manual

The manual provides a clear example (page 70):

```basic
10 REM * LOCATE *
20 CLS
30 FOR I=0 TO 20
40 LOCATE I, I: PRINT"*"
50 NEXT
60 LOCATE 0,10
```

**Expected Behavior:**
- Line 40 sets cursor to (I, I) and prints "*" at that position
- This creates a diagonal line of asterisks from (0,0) to (20,20)
- Each asterisk is positioned exactly at coordinates (I, I)

#### Implementation Details

The `PrintExecutor.printOutput()` method must be enhanced to:

```typescript
private printOutput(output: string, shouldAppendToPrevious: boolean): void {
  if (!this.context.deviceAdapter) {
    // Fallback to console
    console.log(output)
    return
  }
  
  const screenDevice = this.context.deviceAdapter.getScreenDevice()
  
  if (screenDevice) {
    // Get current cursor position from screen device
    let { x, y } = screenDevice.getCursorPosition()
    
    // Write each character to screen buffer at current position
    for (const char of output) {
      // Write character to screen buffer at (x, y)
      screenDevice.writeCharacter(x, y, char)
      
      // Advance cursor horizontally
      x++
      
      // Handle column wrapping
      if (x >= 28) {
        x = 0
        y++
        // Handle line scrolling/wrapping
        if (y >= 24) {
          y = 0 // or scroll screen up
        }
      }
    }
    
    // Update cursor position after PRINT
    const endsWithSemicolon = this.context.lastPrintEndedWithSemicolon
    if (!endsWithSemicolon) {
      // Move to start of next line
      x = 0
      y++
      if (y >= 24) {
        y = 0 // or scroll screen up
      }
    }
    
    // Update screen device cursor position
    screenDevice.setCursorPosition(x, y)
  }
  
  // Also output to text output for compatibility (existing behavior)
  this.context.deviceAdapter.printOutput(output)
}
```

#### Tab Stop Calculation with LOCATE

When calculating tab stops for comma separators, the current implementation uses `currentColumn` starting from 0. With LOCATE support, tab stops must be calculated relative to the **current cursor X position**:

```typescript
private getNextTabStop(currentColumn: number, cursorX: number): number {
  // Calculate tab stops relative to current cursor position
  // Block boundaries: 0-7, 8-15, 16-23, 24-27
  const relativeColumn = currentColumn + cursorX
  
  if (relativeColumn < 8) return 8 - cursorX      // Block 1 -> Block 2
  if (relativeColumn < 16) return 16 - cursorX   // Block 2 -> Block 3
  if (relativeColumn < 24) return 24 - cursorX    // Block 3 -> Block 4
  return 28 - cursorX                              // Block 4 -> next line
}
```

#### Screen Device Interface Extension

The `ScreenDevice` interface needs a method to write characters:

```typescript
export interface ScreenDevice {
  // ... existing methods ...
  
  /**
   * Write a character to the screen buffer at specified position
   * @param x - Horizontal column (0-27)
   * @param y - Vertical line (0-23)
   * @param char - Character to write
   */
  writeCharacter(x: number, y: number, char: string): void
}
```

#### Key Points

1. **LOCATE sets the starting position** for all subsequent PRINT statements
2. **PRINT writes to screen buffer** at the current cursor position
3. **Cursor advances** as each character is written
4. **Tab stops are calculated** relative to current cursor X position, not from column 0
5. **Screen boundaries** must be respected (wrapping/scrolling)
6. **Semicolon behavior** determines whether cursor moves to next line after PRINT

### 7. Screen Command Executors

Create executors for each screen command:

#### LocateExecutor
```typescript
export class LocateExecutor {
  execute(locateCst: CstNode, context: ExecutionContext): void {
    // Parse LOCATE X, Y
    // Validate X (0-27) and Y (0-23)
    // Call deviceAdapter.locate(x, y)
  }
}
```

#### ColorExecutor
```typescript
export class ColorExecutor {
  execute(colorCst: CstNode, context: ExecutionContext): void {
    // Parse COLOR X, Y, n
    // Validate X (0-27), Y (0-23), n (0-3)
    // Call deviceAdapter.setColor(x, y, n)
  }
}
```

#### ClsExecutor
```typescript
export class ClsExecutor {
  execute(clsCst: CstNode, context: ExecutionContext): void {
    // Call deviceAdapter.cls()
  }
}
```

#### CgenExecutor
```typescript
export class CgenExecutor {
  execute(cgenCst: CstNode, context: ExecutionContext): void {
    // Parse CGEN n
    // Validate n (0-3)
    // Call deviceAdapter.setCgen(n)
  }
}
```

#### CgsetExecutor
```typescript
export class CgsetExecutor {
  execute(cgsetCst: CstNode, context: ExecutionContext): void {
    // Parse CGSET [m][,n]
    // Validate m (0-1), n (0-2)
    // Call deviceAdapter.setCgset(m, n)
  }
}
```

#### PaletExecutor
```typescript
export class PaletExecutor {
  execute(paletCst: CstNode, context: ExecutionContext): void {
    // Parse PALET {B|S} n, C1, C2, C3, C4
    // Validate all parameters
    // Call deviceAdapter.setPalet(target, combination, colors)
  }
}
```

### 8. ExecutionContext Extension

Add screen state to `ExecutionContext`:

```typescript
export class ExecutionContext {
  // ... existing properties ...
  
  // Screen state (optional, can be managed by device)
  public screenDevice?: ScreenDevice
}
```

### 9. WebWorkerDeviceAdapter Extension

Extend `WebWorkerDeviceAdapter` to support screen operations:

```typescript
export class WebWorkerDeviceAdapter implements BasicDeviceAdapter {
  private screenDevice: WebScreenDevice
  
  constructor() {
    this.screenDevice = new WebScreenDevice()
  }
  
  getScreenDevice(): ScreenDevice | null {
    return this.screenDevice
  }
  
  locate(x: number, y: number): void {
    this.screenDevice.setCursorPosition(x, y)
    // Send screen update message to main thread if needed
  }
  
  setColor(x: number, y: number, colorPattern: number): void {
    this.screenDevice.setColorPattern(x, y, colorPattern)
    // Send screen update message to main thread if needed
  }
  
  cls(): void {
    this.screenDevice.clearScreen()
    // Send screen clear message to main thread
    this.clearScreen() // Also call existing clearScreen for text output
  }
  
  // ... other screen methods ...
}
```

### 10. Message Types for Web Worker Communication

Add new message types for screen updates:

```typescript
// Screen update message
export interface ScreenUpdateMessage extends ServiceWorkerMessage {
  type: 'SCREEN_UPDATE'
  data: {
    executionId: string
    updateType: 'cursor' | 'color' | 'clear' | 'cgen' | 'cgset' | 'palet'
    payload: {
      // Cursor update
      cursorX?: number
      cursorY?: number
      // Color update
      colorX?: number
      colorY?: number
      colorPattern?: number
      // CGEN update
      cgenAllocation?: number
      // CGSET update
      bgPalette?: number
      spritePalette?: number
      // PALET update
      paletTarget?: 'B' | 'S'
      paletCombination?: number
      paletColors?: [number, number, number, number]
    }
  }
}
```

## Implementation Phases

### Phase 1: Core Screen Device
1. Create `ScreenDevice` interface
2. Implement `WebScreenDevice` class
3. Add screen state management
4. Implement cursor position tracking
5. Implement screen buffer (28×24)

### Phase 2: Basic Commands
1. Implement `LOCATE` executor
2. Implement `CLS` executor
3. Integrate with `PrintExecutor` for cursor-aware output
4. Add parser support for `LOCATE` and `CLS`

### Phase 3: Color System
1. Implement `COLOR` executor
2. Implement color pattern area mapping
3. Add parser support for `COLOR`

### Phase 4: Advanced Color Management
1. Implement `CGEN` executor
2. Implement `CGSET` executor
3. Implement `PALET` executor
4. Add parser support for all color commands
5. Implement color palette system

### Phase 5: Integration & Testing
1. Integrate with web worker communication
2. Add screen update messages
3. Create UI components for screen rendering
4. Write comprehensive tests
5. Update documentation

## Testing Strategy

### Unit Tests
- Screen device state management
- Cursor position validation
- Color pattern area mapping
- Palette management
- Screen buffer operations

### Integration Tests
- LOCATE command execution
- COLOR command execution
- CLS command execution
- CGEN/CGSET/PALET command execution
- PRINT with cursor positioning
- Screen state persistence across executions

### Manual Tests
- Visual verification of screen rendering
- Color palette display
- Cursor movement
- Screen clearing
- Character display at various positions

## Benefits

1. **Authentic Family BASIC Experience**: Matches original screen behavior exactly
2. **Modular Design**: Screen operations cleanly separated from core interpreter
3. **Extensible**: Easy to add new screen features or rendering backends
4. **Testable**: Screen state can be tested independently
5. **Web-Compatible**: Works in browser environment with web worker support
6. **Type-Safe**: Full TypeScript support with comprehensive interfaces

## Future Enhancements

- Sprite rendering integration
- Background graphics (BG GRAPHIC) support
- Character table rendering
- Screen capture/export functionality
- Custom rendering backends (Canvas, WebGL, etc.)
- Screen recording/playback

## Conclusion

This design provides a comprehensive foundation for SCREEN device integration that maintains Family BASIC authenticity while leveraging modern web technologies. The modular architecture ensures clean separation of concerns and enables future extensions for graphics and sprite rendering.

