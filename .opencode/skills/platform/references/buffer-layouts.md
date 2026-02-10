# Shared Buffer Layouts Reference

This reference covers the shared buffer layouts used for cross-thread communication in the F-BASIC emulator.

## Display Buffer Layout (2200 bytes)

### Overview

The shared display buffer enables zero-copy communication between the Executor Worker (writer) and Main Thread (reader) for screen and sprite data.

```
Total Size: 2200 bytes

Offset Range          Size           Description
─────────────────────────────────────────────────────────────────────
0 - 767              768 bytes      Sprite positions (8 sprites × 12 floats)
768 - 1439           672 bytes      Screen character data
1440 - 2111          672 bytes      Screen pattern data
2112 - 2113          2 bytes        Cursor position (row, col)
2116 - 2119          4 bytes        Sequence number
2120 - 2123          4 bytes        Scalars (misc data)
2124 - 2127          4 bytes        Padding
2128 - 2199          72 bytes       Animation sync data
```

### Sprite Positions Section (0-767)

**Layout**: 8 sprites × 12 float64 values (8 bytes each) = 768 bytes

**Per-Sprite Layout** (12 floats × 8 bytes = 96 bytes per sprite):

```typescript
// Sprite n data starts at offset: n * 96
interface SpriteState {
  // Position (2 floats = 16 bytes)
  xpos: number;        // Offset n*96 + 0
  ypos: number;        // Offset n*96 + 8

  // Definition (3 floats = 24 bytes)
  characterType: number;  // Offset n*96 + 16
  colorCombination: number; // Offset n*96 + 24
  priority: number;        // Offset n*96 + 32

  // State (2 floats = 16 bytes)
  visible: number;      // Offset n*96 + 40 (0 or 1)
  actionNumber: number; // Offset n*96 + 48 (which DEF MOVE)

  // Animation State (5 floats = 40 bytes)
  isAnimating: number;     // Offset n*96 + 56 (0 or 1)
  frameIndex: number;      // Offset n*96 + 64
  direction: number;       // Offset n*96 + 72 (0-3 for 4 directions)
  lastFrameTime: number;   // Offset n*96 + 80
  frameDuration: number;   // Offset n*96 + 88
}
```

**Example** - Reading sprite 0 X position:
```typescript
import { readSpritePosition } from '@/core/animation/sharedDisplayBuffer'

const sprite0 = readSpritePosition(sharedBuffer, 0)
console.log('X:', sprite0.x, 'Y:', sprite0.y)
```

### Screen Character Data (768-1439)

**Size**: 672 cells × 1 byte = 672 bytes

Stores ASCII character codes for each screen cell (28×24 characters).

```typescript
// Read character at position (row, col)
const charOffset = 768 + (row * 28 + col)
const charCode = new Uint8Array(sharedBuffer, charOffset, 1)[0]
```

### Screen Pattern Data (1440-2111)

**Size**: 672 cells × 1 byte = 672 bytes

Stores color/pattern information for each screen cell.

```typescript
// Read pattern at position (row, col)
const patternOffset = 1440 + (row * 28 + col)
const pattern = new Uint8Array(sharedBuffer, patternOffset, 1)[0]
```

### Cursor Position (2112-2113)

**Size**: 2 bytes (2 × Uint8)

```typescript
// Read cursor position
const cursorRow = new Uint8Array(sharedBuffer, 2112, 1)[0]
const cursorCol = new Uint8Array(sharedBuffer, 2113, 1)[0]

// Write cursor position
new Uint8Array(sharedBuffer, 2112, 1)[0] = row
new Uint8Array(sharedBuffer, 2113, 1)[0] = col
```

### Sequence Number (2116-2119)

**Size**: 4 bytes (Float64)

Used for detecting buffer changes and synchronization.

```typescript
// Read and increment sequence
const seqView = new Float64Array(sharedBuffer, 2116, 1)
const currentSeq = seqView[0]
seqView[0] = currentSeq + 1
```

### Animation Sync Data (2128-2199)

**Size**: 72 bytes

Used for synchronizing animation state between workers.

## Joystick Buffer Layout (32 bytes)

### Overview

The shared joystick buffer enables zero-copy communication from Main Thread (writer) to Executor Worker (reader).

```
Total Size: 32 bytes

Offset Range          Size           Description
─────────────────────────────────────────────────────────────────────
0 - 7                8 bytes        STICK state (2 joysticks × Float64)
8 - 15               8 bytes        STRIG state (2 joysticks × Float64)
16 - 31              16 bytes        Reserved/Padding
```

### STICK State (0-7)

**Layout**: 2 Float64 values (8 bytes each)

```typescript
interface JoystickBufferView {
  stickState: Float64Array;   // [stick0, stick1] at offset 0
  strigState: Float64Array;   // [strig0, strig1] at offset 8
}

// Reading stick state (in Executor Worker)
const stickView = new Float64Array(sharedJoystickBuffer, 0, 2)
const stick0State = stickView[0]  // STICK(0) bitmask
const stick1State = stickView[1]  // STICK(1) bitmask
```

**STICK Bitmask Values**:
- 1 = Right
- 2 = Left
- 4 = Down
- 8 = Up

**Combinations**: 5 (Right+Down), 9 (Right+Up), 6 (Left+Down), 10 (Left+Up)

### STRIG State (8-15)

**Layout**: 2 Float64 values (8 bytes each)

```typescript
// Reading strig state (in Executor Worker)
const strigView = new Float64Array(sharedJoystickBuffer, 8, 2)
const strig0State = strigView[0]  // STRIG(0) bitmask
const strig1State = strigView[1]  // STRIG(1) bitmask
```

**STRIG Bitmask Values**:
- 1 = Start button
- 2 = Select button
- 4 = B button
- 8 = A button

## Writing to Buffers (Executor/Animation Worker)

### Writing Sprite Position

```typescript
import { writeSpritePosition } from '@/core/animation/sharedDisplayBuffer'

function updateSprite(
  buffer: SharedArrayBuffer,
  spriteId: number,
  x: number,
  y: number
): void {
  writeSpritePosition(buffer, spriteId, {
    x,
    y,
    characterType: 0,
    colorCombination: 7,
    priority: 0,
    visible: 1,
    actionNumber: -1,
    isAnimating: 0,
    frameIndex: 0,
    direction: 0,
    lastFrameTime: 0,
    frameDuration: 200
  })
}
```

### Writing Screen Character

```typescript
function setScreenChar(
  buffer: SharedArrayBuffer,
  row: number,
  col: number,
  charCode: number
): void {
  const offset = 768 + (row * 28 + col)
  new Uint8Array(buffer, offset, 1)[0] = charCode
}
```

## Reading from Buffers (Main Thread)

### Reading Sprite Position

```typescript
import { readSpritePosition } from '@/core/animation/sharedDisplayBuffer'

function renderSprite(
  buffer: SharedArrayBuffer,
  spriteId: number,
  konvaSprite: Konva.Sprite
): void {
  const sprite = readSpritePosition(buffer, spriteId)

  if (sprite.visible === 1) {
    konvaSprite.position({ x: sprite.xpos, y: sprite.ypos })
    konvaSprite.visible(true)
  } else {
    konvaSprite.visible(false)
  }
}
```

### Using Atomics for Change Detection

```typescript
function waitForBufferChange(buffer: SharedArrayBuffer): void {
  const seqView = new Int32Array(buffer, 2116, 1)
  const initialSeq = Atomics.load(seqView, 0)

  // Wait for sequence to change (with timeout)
  const start = performance.now()
  while (Atomics.load(seqView, 0) === initialSeq) {
    if (performance.now() - start > 1000) {
      throw new Error('Buffer sync timeout')
    }
    // Small sleep to prevent busy-waiting
    Atomics.wait(new Int32Array(1), 0, 0, 10)
  }
}
```

## Thread Safety Rules

### Display Buffer
- **Writer**: Executor Worker (screen data), Animation Worker (sprite positions)
- **Reader**: Main Thread (rendering)
- **Rule**: Each section has a single writer; Animation Worker owns sprite positions

### Joystick Buffer
- **Writer**: Main Thread (Gamepad polling)
- **Reader**: Executor Worker (STICK/STRIG functions)
- **Rule**: Single writer, single reader

### Synchronization

Use Atomics for critical sections:

```typescript
// Acquire lock
const lockView = new Int32Array(buffer, LOCK_OFFSET, 1)
while (Atomics.compareExchange(lockView, 0, 0, 1) !== 0) {
  // Spin until lock acquired
}

try {
  // Critical section - modify buffer
} finally {
  // Release lock
  Atomics.store(lockView, 0, 0)
}
```

## Debugging Buffer Issues

### Logging Pattern

```typescript
// Writer: Log what you write
writeSpritePosition(buffer, spriteId, { ... })
console.log('[WRITE] sprite', spriteId, 'x:', x, 'y:', y)

// Reader: Log what you read
const sprite = readSpritePosition(buffer, spriteId)
console.log('[READ] sprite', spriteId, 'x:', sprite.x, 'y:', sprite.y)
```

### Buffer Inspection

```typescript
function inspectBuffer(buffer: SharedArrayBuffer): void {
  console.log('=== Buffer Inspection ===')
  for (let i = 0; i < 8; i++) {
    const sprite = readSpritePosition(buffer, i)
    console.log(`Sprite ${i}:`, sprite)
  }
}
```
