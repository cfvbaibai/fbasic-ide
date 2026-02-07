# Shared Display Buffer

Single `SharedArrayBuffer` (2136 bytes) for zero-copy data sharing between:
- **Executor Worker** → Main Thread (screen state)
- **Animation Worker** → Main Thread (sprite positions)
- **Executor Worker** ↔ Animation Worker (direct sync commands)

## Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SHARED DISPLAY BUFFER (2136 bytes)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  [0-703]     Sprites (88 Float64)        Animation Worker writes        │
│  [704-1375]  Screen chars (672 Uint8)    Executor Worker writes         │
│  [1376-2047] Screen patterns (672 Uint8) Executor Worker writes         │
│  [2048-2049] Cursor (2 Uint8)            Executor Worker writes         │
│  [2052-2055] Sequence (4 Int32)          Executor Worker writes         │
│  [2056-2059] Scalars (4 Uint8)           Executor Worker writes         │
│  [2060-2063] Padding (4 bytes)           -                              │
│  [2064-2135] Animation sync (9 Float64)  Executor ↔ Animation direct    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ Main thread reads all sections
                                    │ for rendering
```

## Section Details

### 1. Sprite Data (0-703 bytes)

**Type:** `Float64Array` (88 elements)
**Writer:** Animation Worker (single writer)
**Reader:** Main Thread (render only), Inspector (read-only)

```
Float64Array indices (relative to buffer start):
┌─────┬─────┬───────────┬──────────────┬───────────────┬──────────┬──────────┬──────────┬──────────┬───────────┬────────────┬────────────────┐
│  x  │  y  │ isActive  │ frameIndex   │ remainingDist │ totalDist │ direction │  speed   │ priority │ charType  │ colorCombo  │ padding        │  Sprite 0
└─────┴─────┴───────────┴──────────────┴───────────────┴──────────┴──────────┴──────────┴───────────┴────────────┴────────────────┘
  [0]   [1]      [2]         [3]            [4]            [5]        [6]        [7]        [8]        [9]        [10]         [11]

┌─────┬─────┬───────────┬──────────────┬───────────────┬──────────┬──────────┬──────────┬──────────┬───────────┬────────────┬────────────────┐
│  x  │  y  │ isActive  │ frameIndex   │ remainingDist │ totalDist │ direction │  speed   │ priority │ charType  │ colorCombo  │ padding        │  Sprite 1
└─────┴─────┴───────────┴──────────────┴───────────────┴──────────┴──────────┴──────────┴───────────┴────────────┴────────────────┘
  [12]  [13]     [14]        [15]           [16]           [17]       [18]       [19]       [20]       [21]       [22]        [23]

... repeated for sprites 0-7 (88 total floats)
```

- `x`, `y`: Pixel coordinates (0-255)
- `isActive`: Movement state (0 = inactive, 1 = active)
- `frameIndex`: Which animation frame to display (0-based index)
- `remainingDistance`: Remaining distance in dots (tracked by Animation Worker)
- `totalDistance`: Total distance in dots (from MOVE command)
- `direction`: Direction code (0-8, where 0=none, 1=up, 2=up-right, etc.)
- `speed`: Speed parameter C from MOVE command
- `priority`: Sprite priority (0=front, 1=back)
- `characterType`: Character type from DEF MOVE
- `colorCombination`: Color combination
- Slot base formula: `slotBase(actionNumber) = actionNumber × 11`

### 2. Screen Characters (704-1375 bytes)

**Type:** `Uint8Array` (672 elements = 28 × 24)
**Writer:** Executor Worker
**Reader:** Main Thread

F-BASIC character codes for each cell:
- 0-255: Character codes (including picture tiles)
- 0x20 (32): Space (empty cell)

Grid layout: 28 columns × 24 rows

### 3. Screen Color Patterns (1376-2047 bytes)

**Type:** `Uint8Array` (672 elements = 28 × 24)
**Writer:** Executor Worker
**Reader:** Main Thread

Color pattern for each cell (0-3):
- 0: Pattern 0
- 1: Pattern 1
- 2: Pattern 2
- 3: Pattern 3

### 4. Cursor Position (2048-2049 bytes)

**Type:** `Uint8Array` (2 elements)
**Writer:** Executor Worker
**Reader:** Main Thread

| Index | Value | Range |
|-------|-------|-------|
| 0 | cursorX | 0-27 |
| 1 | cursorY | 0-23 |

### 5. Sequence Number (2052-2055 bytes)

**Type:** `Int32Array` (1 element)
**Writer:** Executor Worker (only)
**Reader:** Main Thread

Change detection counter:
- Increments on each screen update
- Main thread polls to detect changes

### 6. Scalars (2056-2059 bytes)

**Type:** `Uint8Array` (4 elements)
**Writer:** Executor Worker
**Reader:** Main Thread

| Index | Name | Range | Description |
|-------|------|-------|-------------|
| 0 | bgPalette | 0-1 | Background palette |
| 1 | spritePalette | 0-3 | Sprite palette |
| 2 | backdropColor | 0-60 | Backdrop color |
| 3 | cgenMode | 0-3 | Character generation mode |

### 7. Padding (2060-2063 bytes)

**Type:** 4 bytes (unused)
**Purpose:** Alignment for Float64Array sync section

### 8. Animation Sync Section (2064-2135 bytes)

**Type:** `Float64Array` (9 elements)
**Writer:** Executor Worker (commands), Animation Worker (ack)
**Reader:** Both workers

```
Float64Array indices (relative to animation section):
┌─────────┬───────────────┐
│ Index   │ Value         │
├─────────┼───────────────┤
│ 0 (32)  │ commandType   │ 0=none, 1=START, 2=STOP, 3=ERASE, 4=SET
│ 1 (33)  │ actionNumber  │ 0-7
│ 2 (34)  │ param1        │ startX / x
│ 3 (35)  │ param2        │ startY / y
│ 4 (36)  │ param3        │ direction
│ 5 (37)  │ param4        │ speed
│ 6 (38)  │ param5        │ distance
│ 7 (39)  │ param6        │ priority
│ 8 (40)  │ ack           │ 0=pending, 1=received
└─────────┴───────────────┘
```

**Global Float64 indices:** 258-266 (buffer start + 2064 bytes ÷ 8)

#### Sync Command Types

| Type | Value | Params Used |
|------|-------|-------------|
| NONE | 0 | - |
| START_MOVEMENT | 1 | startX, startY, direction, speed, distance, priority |
| STOP_MOVEMENT | 2 | - |
| ERASE_MOVEMENT | 3 | - |
| SET_POSITION | 4 | x (param1), y (param2) |

## Communication Flow

```
┌─────────────────────┐         ┌─────────────────────┐
│  Executor Worker    │         │  Animation Worker   │
│  (AnimationManager) │         │  (AnimationWorker)  │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           │ writeSyncCommand()            │ readSyncCommand()
           │ Atomics.notify()              │ Atomics.wait()
           ├──────────────Sync────────────>┤
           │              Section          │
           │<─────────────┘                │
           │                               │
           │ waitForAck()                  │ writeSyncAck()
           │ Atomics.wait()                │ Atomics.notify()
           ├──────────────────────────────>┤
                                           │
           views.spriteView     reads      │ writes positions
           (main thread)                   │ (x, y, isActive)
```

## Usage

### Main Thread (Creation)

```typescript
import { createSharedDisplayBuffer } from '@/core/animation/sharedDisplayBuffer'

const sharedViews = createSharedDisplayBuffer()
// sharedViews.buffer → SharedArrayBuffer (1624 bytes)
// sharedViews.spriteView → Float64Array (24)
// sharedViews.charView → Uint8Array (672)
// sharedViews.patternView → Uint8Array (672)
// sharedViews.cursorView → Uint8Array (2)
// sharedViews.sequenceView → Int32Array (1)
// sharedViews.scalarsView → Uint8Array (4)
// sharedViews.animationSyncView → Float64Array (9)
```

### Executor Worker (Write Screen State)

```typescript
import { writeScreenState, incrementSequence } from '@/core/animation/sharedDisplayBuffer'

writeScreenState(
  views,
  screenBuffer,    // ScreenCell[][]
  cursorX,         // number
  cursorY,         // number
  bgPalette,       // number
  spritePalette,   // number
  backdropColor,   // number
  cgenMode         // number
)
incrementSequence(views) // Notify main thread of change
```

### Executor Worker (Send Animation Commands)

```typescript
import { writeSyncCommand, waitForAck } from '@/core/animation/sharedAnimationBuffer'

// Write command to sync section
writeSyncCommand(
  views.animationSyncView,
  SyncCommandType.START_MOVEMENT,
  actionNumber,
  { startX, startY, direction, speed, distance, priority }
)

// Notify and wait for acknowledgment
Atomics.notify(syncView, 0)
waitForAck(syncView, 100)
```

### Animation Worker (Read Commands, Write Positions)

```typescript
import { readSyncCommand, writeSpriteState, notifyAck } from '@/core/animation/sharedAnimationBuffer'

// Poll for commands
const command = readSyncCommand(syncView)
if (command) {
  // Process command...

  // Write sprite positions
  writeSpriteState(spriteView, actionNumber, x, y, isActive)

  // Acknowledge
  notifyAck(syncView)
}
```

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `SHARED_DISPLAY_BUFFER_BYTES` | 2136 | Total buffer size |
| `MAX_SPRITES` | 8 | Maximum sprite count |
| `SPRITE_DATA_FLOATS` | 88 | Sprite section size (Float64) |
| `ANIMATION_SECTION_FLOATS` | 97 | Full animation section (88 + 9) |
| `COLS` | 28 | Screen columns |
| `ROWS` | 24 | Screen rows |
| `CELLS` | 672 | Total screen cells |
| `OFFSET_ANIMATION_SYNC` | 2064 | Animation sync byte offset |

## Related Files

| File | Purpose |
|------|---------|
| `src/core/animation/sharedDisplayBuffer.ts` | Buffer creation and screen sync functions |
| `src/core/animation/sharedAnimationBuffer.ts` | Animation sync and sprite helpers |
| `src/core/animation/AnimationManager.ts` | Executor Worker animation state manager |
| `src/core/workers/AnimationWorker.ts` | Animation Worker (sprite physics) |
