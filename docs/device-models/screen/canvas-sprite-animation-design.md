# Canvas-Based Sprite Animation Design

## Overview

This document describes the design for implementing Family BASIC sprite animation using canvas-based rendering, building on the existing canvas infrastructure used for background screen rendering.

## Design Principles

1. **Canvas-Based Rendering**: Use HTML5 Canvas API (same as background screen) for pixel-perfect rendering
2. **Unified Canvas**: Single canvas element with layered rendering (backdrop, back sprites, background, front sprites)
3. **Tile-Based Sprites**: Render sprites using existing tile data from `CHARACTER_SPRITES`
4. **Frame-Based Animation**: Use `requestAnimationFrame` for smooth animation loop
5. **State-Driven**: Animation state managed in web worker, rendering on main thread

---

## Architecture Overview

### Canvas Layer Structure

Family BASIC uses a multi-layer screen system. For canvas rendering, we use **layered rendering on a single canvas**:

```
Rendering Order (back to front):
1. Backdrop Screen (background color)
2. Sprite Screen (Back) - sprites with priority E=1
3. Background Screen - PRINT content (28×24 characters)
4. Sprite Screen (Front) - sprites with priority E=0
```

**Canvas Implementation:**
- Single canvas element: 256×240 pixels (sprite screen dimensions)
- Background screen content area: 224×192 pixels at offset (16, 24)
- Sprites rendered in pixel coordinates (0-255, 0-239)
- Background rendered in character coordinates converted to pixels

### Canvas Dimensions

**Sprite Screen Canvas:**
- Width: 256 pixels (sprite screen width)
- Height: 240 pixels (sprite screen height)
- Coordinate system: Pixel-based (0-255, 0-239)

**Background Screen Area:**
- Content area: 224×192 pixels (28×24 characters × 8×8 pixels)
- Offset: (16, 24) pixels from canvas origin
- Coordinate system: Character-based (0-27, 0-23), converted to pixels

**Note:** The current screen canvas is 240×208 pixels (includes 8px padding). For sprite animation, we need to extend the canvas to 256×240 to accommodate the full sprite screen dimensions. The background screen rendering area remains at offset (16, 24) with the same 224×192 content area.

---

## Data Structures

### Sprite State

```typescript
interface SpriteState {
  spriteNumber: number  // 0-7
  x: number            // Pixel X coordinate (0-255)
  y: number            // Pixel Y coordinate (0-239)
  visible: boolean     // Whether sprite is displayed
  priority: number     // 0=front, 1=behind background
  definition: DefSpriteDefinition | null  // DEF SPRITE definition (from DEF SPRITE command)
}

interface MoveDefinition {
  actionNumber: number      // 0-7
  characterType: MoveCharacterCode  // 0-15 (Mario, Lady, etc.)
  direction: number         // 0-8 (0=none, 1-8=directions)
  speed: number             // 1-255 (1=fastest, 255=slowest)
  distance: number          // 1-255 (total distance = 2×D dots)
  priority: number          // 0=front, 1=behind
  colorCombination: number  // 0-3
}

interface MovementState {
  actionNumber: number
  definition: MoveDefinition
  startX: number           // Starting X position
  startY: number           // Starting Y position
  currentX: number          // Current X position
  currentY: number         // Current Y position
  remainingDistance: number // Remaining distance in dots
  totalDistance: number    // Total distance (2×D)
  speedDotsPerSecond: number // 60/C dots per second
  directionDeltaX: number  // X direction component (-1, 0, or 1)
  directionDeltaY: number  // Y direction component (-1, 0, or 1)
  isActive: boolean        // Whether movement is active
  currentFrameIndex: number // Current frame in animation sequence
  frameCounter: number    // Frame counter for frame timing
}

interface AnimationSequence {
  name: string  // "WALK", "LADDER", etc.
  sprites: SpriteDefinition[]  // Sequence frames
  frameRate: number  // Frames per sprite switch (e.g., 8)
  looping: boolean
}

interface CharacterAnimationConfig {
  characterType: MoveCharacterCode
  sequences: Map<string, AnimationSequence>
  directionMappings: Map<number, {
    sequence: string  // Sequence name
    invertX: boolean
    invertY: boolean
  }>
}

// Type references (from src/shared/data/palette.ts):
// ColorCombination = [number, number, number, number]  // [C1, C2, C3, C4] as hex color codes (0x00-0x3C)
// Palette = [ColorCombination, ColorCombination, ColorCombination, ColorCombination]  // 4 combinations
// SPRITE_PALETTES: [Palette, Palette, Palette]  // 3 palettes
// BACKGROUND_PALETTES: [Palette, Palette]  // 2 palettes
// COLORS: string[]  // 61 hex color values (indices 0-60, corresponding to hex codes 0x00-0x3C)
```

---

## Rendering System

### Canvas Renderer Architecture

**File Structure:**
```
src/features/ide/composables/
├── canvasRenderer.ts          // Background screen rendering (existing)
└── spriteCanvasRenderer.ts   // Sprite rendering (new)

src/features/ide/components/
└── Screen.vue                // Updated to render all layers
```

### Unified Canvas Renderer

```typescript
/**
 * Unified canvas renderer for all screen layers
 */
export function renderScreenLayers(
  canvas: HTMLCanvasElement,
  backgroundBuffer: ScreenCell[][],
  spriteStates: SpriteState[],
  movementStates: MovementState[],
  bgPaletteCode: number = 1,
  spritePaletteCode: number = 1
): void {
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return

  // Set canvas size (sprite screen dimensions)
  const SPRITE_CANVAS_WIDTH = 256
  const SPRITE_CANVAS_HEIGHT = 240
  
  if (canvas.width !== SPRITE_CANVAS_WIDTH || canvas.height !== SPRITE_CANVAS_HEIGHT) {
    canvas.width = SPRITE_CANVAS_WIDTH
    canvas.height = SPRITE_CANVAS_HEIGHT
    ctx.imageSmoothingEnabled = false
  }

  // Clear canvas
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, SPRITE_CANVAS_WIDTH, SPRITE_CANVAS_HEIGHT)

  // Render layers in order (back to front)
  
  // 1. Render backdrop screen (background color - currently black)
  // (Future: could be customizable background color)
  
  // 2. Render back sprites (priority E=1)
  renderSprites(ctx, spriteStates, movementStates, 1, spritePaletteCode)
  
  // 3. Render background screen (28×24 character grid)
  renderBackgroundScreen(ctx, backgroundBuffer, bgPaletteCode)
  
  // 4. Render front sprites (priority E=0)
  renderSprites(ctx, spriteStates, movementStates, 0, spritePaletteCode)
}
```

### Background Screen Rendering

```typescript
/**
 * Render background screen (28×24 characters) at offset (16, 24)
 */
function renderBackgroundScreen(
  ctx: CanvasRenderingContext2D,
  buffer: ScreenCell[][],
  paletteCode: number
): void {
  const BG_OFFSET_X = 16
  const BG_OFFSET_Y = 24
  const CELL_SIZE = 8
  const COLS = 28
  const ROWS = 24

  for (let y = 0; y < ROWS; y++) {
    const row = buffer[y]
    if (!row) continue
    
    for (let x = 0; x < COLS; x++) {
      const cell = row[x]
      if (cell) {
        const imageData = getTileImageData(
          cell.character || ' ',
          cell.colorPattern,
          paletteCode
        )
        const pixelX = x * CELL_SIZE + BG_OFFSET_X
        const pixelY = y * CELL_SIZE + BG_OFFSET_Y
        ctx.putImageData(imageData, pixelX, pixelY)
      }
    }
  }
}
```

### Sprite Rendering

```typescript
/**
 * Render sprites with given priority
 */
function renderSprites(
  ctx: CanvasRenderingContext2D,
  spriteStates: SpriteState[],
  movementStates: MovementState[],
  priority: number,
  spritePaletteCode: number
): void {
  // Filter sprites by priority
  const sprites = spriteStates.filter(s => 
    s.visible && s.priority === priority
  )

  for (const spriteState of sprites) {
    if (!spriteState.definition) continue
    
    // Get movement state if this sprite is moving
    const movement = movementStates.find(m => 
      m.actionNumber === spriteState.spriteNumber
    )
    
    if (movement && movement.isActive) {
      // Render animated sprite (DEF MOVE)
      renderAnimatedSprite(
        ctx,
        movement,
        spritePaletteCode
      )
    } else if (spriteState.definition) {
      // Render static sprite (DEF SPRITE)
      renderStaticSprite(
        ctx,
        spriteState
      )
    }
  }
}
```

### Static Sprite Rendering (DEF SPRITE)

```typescript
/**
 * Render static sprite from DEF SPRITE definition
 */
function renderStaticSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteState
): void {
  if (!sprite.definition) return

  const spriteDef = sprite.definition
  
  // Determine sprite size
  const is16x16 = Array.isArray(spriteDef.charCodes) && 
                  spriteDef.charCodes.length === 4
  const spriteSize = is16x16 ? 16 : 8
  
  // Get palette (DEF SPRITE uses colorCombination parameter A, palette from CGSET)
  // TODO: Get spritePaletteCode from CGSET state management
  const spritePaletteCode = 1  // Default from CGSET
  const spritePalette = SPRITE_PALETTES[spritePaletteCode]
  // DEF SPRITE parameter A is the colorCombination (0-3)
  const colorCombinationIndex = 0  // TODO: Get from DEF SPRITE definition
  const colorCombination = spritePalette[colorCombinationIndex]
  
  // Render sprite tiles
  if (is16x16 && Array.isArray(spriteDef.tiles)) {
    // 16×16 sprite: 4 tiles in 2×2 grid
    const tiles = spriteDef.tiles as [Tile, Tile, Tile, Tile]
    
    // Top-left (tile 0)
    renderSpriteTile(ctx, tiles[0], sprite.x, sprite.y, 
                     colorCombination, false, false)
    // Top-right (tile 1)
    renderSpriteTile(ctx, tiles[1], sprite.x + 8, sprite.y,
                     colorCombination, false, false)
    // Bottom-left (tile 2)
    renderSpriteTile(ctx, tiles[2], sprite.x, sprite.y + 8,
                     colorCombination, false, false)
    // Bottom-right (tile 3)
    renderSpriteTile(ctx, tiles[3], sprite.x + 8, sprite.y + 8,
                     colorCombination, false, false)
  } else if (!is16x16) {
    // 8×8 sprite: single tile
    // TODO: Convert DEF SPRITE characterSet to tiles using background item lookup
    // For now, this needs to be implemented to convert character codes to tiles
    const tiles = convertCharacterSetToTiles(spriteDef.characterSet)
    if (tiles.length > 0) {
      renderSpriteTile(ctx, tiles[0], sprite.x, sprite.y,
                       colorCombination, spriteDef.invertX === 1, spriteDef.invertY === 1)
    }
  }
}

/**
 * Convert DEF SPRITE character set to tiles
 * Character set can be: CHR$(N) codes (array of numbers) or character string
 */
function convertCharacterSetToTiles(characterSet: number[] | string): Tile[] {
  // TODO: Implement character set to tile conversion
  // Use background item lookup (getBackgroundItemByChar, getBackgroundItemByCode)
  // For 16×16 sprites: Convert 4 characters to 4 tiles
  // For 8×8 sprites: Convert 1 character to 1 tile
  return []
}
```

### Animated Sprite Rendering (DEF MOVE)

```typescript
/**
 * Render animated sprite from DEF MOVE definition
 */
function renderAnimatedSprite(
  ctx: CanvasRenderingContext2D,
  movement: MovementState,
  paletteCode: number
): void {
  // Lookup character animation config
  const charConfig = getCharacterAnimationConfig(movement.definition.characterType)
  const directionMapping = charConfig.directionMappings.get(movement.definition.direction)
  
  if (!directionMapping) return
  
  const sequence = charConfig.sequences.get(directionMapping.sequence)
  if (!sequence || sequence.sprites.length === 0) return
  
  // Get current sprite frame based on frame counter
  const currentSprite = sequence.sprites[movement.currentFrameIndex]
  
  // Calculate sprite size
  const is16x16 = Array.isArray(currentSprite.charCodes) && 
                  currentSprite.charCodes.length === 4
  const spriteSize = is16x16 ? 16 : 8
  
  // Get sprite palette code from CGSET (default to palette 1)
  // Note: CGSET selects sprite palette, color combination comes from DEF MOVE parameter F
  // TODO: Get spritePaletteCode from CGSET state management
  const spritePalette = SPRITE_PALETTES[spritePaletteCode]
  const colorCombination = spritePalette[movement.definition.colorCombination]
  
  // Render sprite at current position
  if (is16x16 && Array.isArray(currentSprite.tiles)) {
    const tiles = currentSprite.tiles as [Tile, Tile, Tile, Tile]
    renderSpriteTile(ctx, tiles[0], movement.currentX, movement.currentY,
                     colorCombination, directionMapping.invertX, directionMapping.invertY)
    renderSpriteTile(ctx, tiles[1], movement.currentX + 8, movement.currentY,
                     colorCombination, directionMapping.invertX, directionMapping.invertY)
    renderSpriteTile(ctx, tiles[2], movement.currentX, movement.currentY + 8,
                     colorCombination, directionMapping.invertX, directionMapping.invertY)
    renderSpriteTile(ctx, tiles[3], movement.currentX + 8, movement.currentY + 8,
                     colorCombination, directionMapping.invertX, directionMapping.invertY)
  } else {
    const tile = Array.isArray(currentSprite.tiles) ? currentSprite.tiles[0] : currentSprite.tiles
    renderSpriteTile(ctx, tile, movement.currentX, movement.currentY,
                     colorCombination, directionMapping.invertX, directionMapping.invertY)
  }
}
```

### Sprite Tile Rendering

```typescript
/**
 * Render a single 8×8 sprite tile with optional inversion
 * 
 * @param ctx - Canvas rendering context
 * @param tile - 8×8 tile data (values 0-3)
 * @param x - Pixel X coordinate
 * @param y - Pixel Y coordinate
 * @param colorCombination - Color combination array [C1, C2, C3, C4] (hex color codes)
 * @param invertX - Whether to invert horizontally
 * @param invertY - Whether to invert vertically
 */
function renderSpriteTile(
  ctx: CanvasRenderingContext2D,
  tile: Tile,
  x: number,
  y: number,
  colorCombination: ColorCombination,
  invertX: boolean,
  invertY: boolean
): void {
  // Create ImageData for 8×8 tile
  const imageData = new ImageData(8, 8)
  const data = imageData.data
  
  for (let row = 0; row < 8; row++) {
    const tileRow = tile[row]
    if (!tileRow) continue
    
    for (let col = 0; col < 8; col++) {
      // Calculate source coordinates (with inversion)
      const srcRow = invertY ? 7 - row : row
      const srcCol = invertX ? 7 - col : col
      const pixelValue = tile[srcRow]?.[srcCol] ?? 0
      
      // Map tile value (0-3) to color combination index
      // Value 0 = transparent (C1, index 0) - skip rendering
      // Value 1 = C2 (index 1)
      // Value 2 = C3 (index 2)
      // Value 3 = C4 (index 3)
      if (pixelValue === 0) {
        // Transparent pixel - skip (or use alpha channel)
        const idx = (row * 8 + col) * 4
        data[idx + 3] = 0  // Alpha = 0 (transparent)
        continue
      }
      
      const colorCode = colorCombination[pixelValue]
      if (colorCode === undefined) continue
      
      // Color code is a hex value (0x00-0x3C), use as index into COLORS array
      const color = COLORS[colorCode] ?? COLORS[0] ?? '#000000'
      const [r, g, b] = hexToRgba(color)
      
      const idx = (row * 8 + col) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }
  
  ctx.putImageData(imageData, x, y)
}
```

---

## Animation Loop

### Animation Frame System

**Frame Rate:**
- Base frame rate: ~30 FPS (33.33ms per frame)
- Use `requestAnimationFrame` for browser-optimized frame timing
- Animation updates synchronized with frame rendering

**Movement Calculation:**
- Speed: `60/C dots per second` (where C is speed parameter 1-255)
- Distance: `2×D dots total` (where D is distance parameter 1-255)
- Direction: 8 directions (0=none, 1-8=directions)

### Animation Manager (Web Worker)

```typescript
class AnimationManager {
  private movementStates: Map<number, MovementState> = new Map()
  private spriteStates: Map<number, SpriteState> = new Map()
  
  /**
   * Update movement state (called every frame)
   */
  updateMovements(deltaTime: number): void {
    for (const movement of this.movementStates.values()) {
      if (!movement.isActive || movement.remainingDistance <= 0) {
        movement.isActive = false
        continue
      }
      
      // Calculate movement per frame
      const dotsPerFrame = movement.speedDotsPerSecond * (deltaTime / 1000)
      const distanceThisFrame = Math.min(dotsPerFrame, movement.remainingDistance)
      
      // Update position
      movement.currentX += movement.directionDeltaX * distanceThisFrame
      movement.currentY += movement.directionDeltaY * distanceThisFrame
      movement.remainingDistance -= distanceThisFrame
      
      // Update frame animation
      movement.frameCounter++
      if (movement.frameCounter >= 8) { // 8 frames per sprite switch
        movement.frameCounter = 0
        const sequence = this.getSequenceForMovement(movement)
        if (sequence) {
          movement.currentFrameIndex = (movement.currentFrameIndex + 1) % sequence.sprites.length
        }
      }
      
      if (movement.remainingDistance <= 0) {
        movement.isActive = false
      }
    }
  }
  
  /**
   * Start movement
   */
  startMovement(
    actionNumber: number,
    definition: MoveDefinition,
    startX: number = 120,
    startY: number = 120
  ): void {
    // Calculate direction deltas
    const { dx, dy } = getDirectionDeltas(definition.direction)
    
    const movement: MovementState = {
      actionNumber,
      definition,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      remainingDistance: 2 * definition.distance,
      totalDistance: 2 * definition.distance,
      speedDotsPerSecond: 60 / definition.speed,
      directionDeltaX: dx,
      directionDeltaY: dy,
      isActive: true,
      currentFrameIndex: 0,
      frameCounter: 0
    }
    
    this.movementStates.set(actionNumber, movement)
  }
  
  /**
   * Stop movement (CUT command)
   */
  stopMovement(actionNumbers: number[]): void {
    for (const actionNumber of actionNumbers) {
      const movement = this.movementStates.get(actionNumber)
      if (movement) {
        movement.isActive = false
      }
    }
  }
  
  /**
   * Erase sprite (ERA command)
   */
  eraseMovement(actionNumbers: number[]): void {
    for (const actionNumber of actionNumbers) {
      const movement = this.movementStates.get(actionNumber)
      if (movement) {
        movement.isActive = false
      }
      const sprite = this.spriteStates.get(actionNumber)
      if (sprite) {
        sprite.visible = false
      }
    }
  }
  
  /**
   * Get movement status (MOVE(n) function)
   */
  getMovementStatus(actionNumber: number): -1 | 0 {
    const movement = this.movementStates.get(actionNumber)
    if (!movement || !movement.isActive || movement.remainingDistance <= 0) {
      return 0
    }
    return -1
  }
  
  /**
   * Get sprite position (XPOS(n), YPOS(n) functions)
   */
  getSpritePosition(actionNumber: number): { x: number; y: number } | null {
    const movement = this.movementStates.get(actionNumber)
    if (movement) {
      return { x: movement.currentX, y: movement.currentY }
    }
    const sprite = this.spriteStates.get(actionNumber)
    if (sprite) {
      return { x: sprite.x, y: sprite.y }
    }
    return null
  }
}
```

### Direction Calculation

```typescript
/**
 * Get direction deltas for movement
 */
function getDirectionDeltas(direction: number): { dx: number; dy: number } {
  switch (direction) {
    case 0: return { dx: 0, dy: 0 }      // None
    case 1: return { dx: 0, dy: -1 }    // Up
    case 2: return { dx: 1, dy: -1 }    // Up-right
    case 3: return { dx: 1, dy: 0 }     // Right
    case 4: return { dx: 1, dy: 1 }     // Down-right
    case 5: return { dx: 0, dy: 1 }     // Down
    case 6: return { dx: -1, dy: 1 }    // Down-left
    case 7: return { dx: -1, dy: 0 }    // Left
    case 8: return { dx: -1, dy: -1 }   // Up-left
    default: return { dx: 0, dy: 0 }
  }
}
```

---

## Main Thread Rendering Loop

### Vue Component Integration

```typescript
// src/features/ide/composables/useScreenCanvasRenderer.ts

import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { ScreenCell } from '@/core/interfaces'
import { renderScreenLayers } from './spriteCanvasRenderer'

export function useScreenCanvasRenderer(
  canvasRef: Ref<HTMLCanvasElement | null>,
  screenBuffer: Ref<ScreenCell[][]>,
  spriteStates: Ref<SpriteState[]>,
  movementStates: Ref<MovementState[]>,
  bgPaletteCode: Ref<number> = ref(1),
  spritePaletteCode: Ref<number> = ref(1)
) {
  let animationFrameId: number | null = null
  let lastFrameTime = 0
  
  function render(): void {
    const canvas = canvasRef.value
    if (!canvas) return
    
    renderScreenLayers(
      canvas,
      screenBuffer.value,
      spriteStates.value,
      movementStates.value,
      bgPaletteCode.value,
      spritePaletteCode.value
    )
  }
  
  function animationLoop(timestamp: number): void {
    if (lastFrameTime === 0) {
      lastFrameTime = timestamp
    }
    
    const deltaTime = timestamp - lastFrameTime
    lastFrameTime = timestamp
    
    // Update movements (if movement states are managed here)
    // Otherwise, movement updates come from web worker
    
    // Render frame
    render()
    
    // Continue animation loop
    animationFrameId = requestAnimationFrame(animationLoop)
  }
  
  onMounted(() => {
    lastFrameTime = 0
    animationFrameId = requestAnimationFrame(animationLoop)
  })
  
  onUnmounted(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }
  })
  
  // Watch for state changes and trigger re-render
  watch([screenBuffer, spriteStates, movementStates, bgPaletteCode, spritePaletteCode], () => {
    render()
  }, { deep: true })
  
  return {
    render
  }
}
```

---

## Web Worker Communication

### Message Types

```typescript
// Animation command messages (web worker → main thread)
interface SpriteUpdateMessage {
  type: 'SPRITE_UPDATE'
  data: {
    spriteStates: SpriteState[]
    movementStates: MovementState[]
  }
}

interface MovementStartMessage {
  type: 'MOVEMENT_START'
  data: {
    actionNumber: number
    definition: MoveDefinition
    startX?: number
    startY?: number
  }
}

interface MovementStopMessage {
  type: 'MOVEMENT_STOP'
  data: {
    actionNumbers: number[]
  }
}

interface MovementEraseMessage {
  type: 'MOVEMENT_ERASE'
  data: {
    actionNumbers: number[]
  }
}

// Status query messages (main thread → web worker)
interface QueryMovementStatusMessage {
  type: 'QUERY_MOVEMENT_STATUS'
  data: {
    actionNumber: number
    requestId: string
  }
}

interface MovementStatusResponse {
  type: 'MOVEMENT_STATUS_RESPONSE'
  data: {
    requestId: string
    status: -1 | 0
  }
}
```

### Communication Flow

**Movement Start:**
1. BASIC program executes `MOVE n` command
2. AnimationManager in web worker starts movement
3. Web worker sends `MOVEMENT_START` message to main thread
4. Main thread updates movement state and starts rendering

**Animation Loop:**
1. Web worker `AnimationManager.updateMovements()` called every frame (or periodically)
2. Movement states updated (position, frame index)
3. Web worker sends `SPRITE_UPDATE` message with updated states
4. Main thread receives update and re-renders canvas

**Status Queries:**
1. BASIC program calls `MOVE(n)` function
2. Main thread sends `QUERY_MOVEMENT_STATUS` to web worker
3. Web worker responds with `MOVEMENT_STATUS_RESPONSE`
4. Function returns status value

---

## Sprite Definition Management

### DEF SPRITE Command

```typescript
/**
 * DEF SPRITE definition structure
 * Grammar: DEF SPRITE n, (A, B, C, D, E) = char. set
 */
interface DefSpriteDefinition {
  spriteNumber: number  // n: 0-7
  colorCombination: number  // A: 0-3 (refers to color chart or CGSET)
  size: 0 | 1  // B: 0=8×8, 1=16×16
  priority: 0 | 1  // C: 0=front, 1=behind background
  invertX: 0 | 1  // D: 0=normal, 1=left-right inverted
  invertY: 0 | 1  // E: 0=normal, 1=up-down inverted
  characterSet: number[] | string  // char. set: CHR$(N) codes or character string like "@ABC"
}

/**
 * Sprite definition manager for DEF SPRITE commands
 */
class SpriteDefinitionManager {
  private definitions: Map<number, DefSpriteDefinition> = new Map()
  
  defineSprite(definition: DefSpriteDefinition): void {
    this.definitions.set(definition.spriteNumber, definition)
  }
  
  getDefinition(spriteNumber: number): DefSpriteDefinition | null {
    return this.definitions.get(spriteNumber) ?? null
  }
  
  /**
   * Convert DEF SPRITE definition to renderable sprite
   * Looks up background items by character codes and renders tiles
   */
  getSpriteTiles(definition: DefSpriteDefinition): Tile[] {
    // Convert character set to tiles using background items lookup
    // TODO: Implement character code to tile conversion
    return []
  }
}
```

**Note:** DEF SPRITE uses character codes/strings to define sprites, which are different from the `CHARACTER_SPRITES` data used by DEF MOVE. DEF SPRITE sprites are defined dynamically by the program, while DEF MOVE uses predefined animated characters from `CHARACTER_SPRITES`.

### Character Animation Configuration

```typescript
/**
 * Build character animation configs from CHARACTER_SPRITES
 */
function buildCharacterAnimationConfigs(): Map<MoveCharacterCode, CharacterAnimationConfig> {
  const configs = new Map<MoveCharacterCode, CharacterAnimationConfig>()
  
  // Group sprites by moveCharacterCode
  const spritesByCharacter = new Map<MoveCharacterCode, SpriteDefinition[]>()
  
  for (const sprite of CHARACTER_SPRITES) {
    if (sprite.moveCharacterCode !== undefined) {
      if (!spritesByCharacter.has(sprite.moveCharacterCode)) {
        spritesByCharacter.set(sprite.moveCharacterCode, [])
      }
      spritesByCharacter.get(sprite.moveCharacterCode)!.push(sprite)
    }
  }
  
  // Build configs for each character
  for (const [characterCode, sprites] of spritesByCharacter.entries()) {
    const sequences = buildSequences(sprites)
    const directionMappings = buildDirectionMappings(characterCode, sequences)
    
    configs.set(characterCode, {
      characterType: characterCode,
      sequences,
      directionMappings
    })
  }
  
  return configs
}
```

---

## Implementation Phases

### Phase 1: Canvas Infrastructure Extension
- [ ] Extend canvas to 256×240 pixels (sprite screen size)
- [ ] Update Screen.vue to use unified canvas renderer
- [ ] Implement layered rendering (backdrop, back sprites, background, front sprites)
- [ ] Add sprite tile rendering functions

### Phase 2: Static Sprite Rendering (DEF SPRITE)
- [ ] Implement DEF SPRITE parser support
- [ ] Implement SpriteDefinitionManager
- [ ] Implement static sprite rendering
- [ ] Support 8×8 and 16×16 sprites
- [ ] Support X/Y axis inversion
- [ ] Support priority (front/back)

### Phase 3: Basic Animation (DEF MOVE, MOVE)
- [ ] Implement DEF MOVE parser support
- [ ] Implement AnimationManager in web worker
- [ ] Implement movement calculation (speed, distance, direction)
- [ ] Implement frame-based animation loop
- [ ] Integrate with canvas renderer

### Phase 4: Animation Sequences
- [ ] Build character animation configs from CHARACTER_SPRITES
- [ ] Implement sequence lookup (WALK, LADDER, etc.)
- [ ] Implement frame cycling (frame rate timing)
- [ ] Support direction-based sequence selection
- [ ] Support automatic inversion based on direction

### Phase 5: Movement Control Commands
- [ ] Implement CUT command (stop movement)
- [ ] Implement ERA command (erase sprite)
- [ ] Implement POSITION command (set initial position)
- [ ] Implement MOVE(n) status query function
- [ ] Implement XPOS(n), YPOS(n) position query functions

### Phase 6: Integration & Optimization
- [ ] Optimize rendering performance (tile caching, dirty regions)
- [ ] Add sprite state synchronization between web worker and main thread
- [ ] Implement proper error handling
- [ ] Add comprehensive tests
- [ ] Performance profiling and optimization

---

## Performance Considerations

### Rendering Optimization

1. **Tile Caching**: Cache rendered sprite tiles (same as background tiles)
   - Cache key: `${spriteDef}-${colorCombination}-${invertX}-${invertY}`
   - Reduces redundant pixel calculations

2. **Dirty Region Tracking**: Only re-render changed areas
   - Track sprite positions and only re-render affected regions
   - Full-screen redraw only when necessary

3. **Frame Rate Control**: Cap animation frame rate if needed
   - Use `requestAnimationFrame` for optimal timing
   - Consider frame skipping for slower devices

4. **State Updates**: Batch state updates to reduce message passing
   - Update multiple sprites in single message
   - Reduce web worker ↔ main thread communication overhead

### Memory Management

- Cache size limits for tile cache
- Cleanup unused sprite definitions
- Release ImageData objects when not needed

---

## Coordinate System Conversion

### Background to Sprite Coordinates

```typescript
/**
 * Convert background screen character coordinates to sprite screen pixel coordinates
 */
function bgToSprite(bgX: number, bgY: number): { x: number; y: number } {
  return {
    x: (bgX * 8) + 16,
    y: (bgY * 8) + 24
  }
}

/**
 * Convert sprite screen pixel coordinates to background screen character coordinates
 */
function spriteToBg(spriteX: number, spriteY: number): { x: number; y: number } {
  return {
    x: Math.floor((spriteX - 16) / 8),
    y: Math.floor((spriteY - 24) / 8)
  }
}
```

---

## Testing Strategy

### Unit Tests
- Sprite tile rendering with inversion
- Movement calculation (speed, distance, direction)
- Frame animation sequencing
- Coordinate system conversion
- Animation state management

### Integration Tests
- DEF SPRITE command execution
- DEF MOVE command execution
- MOVE command execution
- Sprite rendering on canvas
- Movement animation rendering
- Priority layering (front/back sprites)

### Manual Tests
- Visual verification of sprite rendering
- Animation smoothness
- Movement accuracy (speed, distance)
- Frame cycling correctness
- Layering correctness (sprites behind/in front of background)

---

## Related Documents

- [Screen Specification](./screen.md) - Screen layer architecture and specifications
- [Animation System](./animation.md) - Animation frame system and timing details
- [Architecture Document](./architecture.md) - Overall architecture design
