# Shared Display Buffer

Two `SharedArrayBuffer` instances for zero-copy data sharing:

1. **Display Buffer** (2200 bytes): Screen state, sprite positions, animation sync
2. **Joystick Buffer** (32 bytes): Controller input state (separate buffer)

## Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SHARED DISPLAY BUFFER (2200 bytes)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  [0-767]     Sprites (96 Float64)        Animation Worker writes        │
│  [768-1439]  Screen chars (672 Uint8)    Executor Worker writes         │
│  [1440-2111] Screen patterns (672 Uint8) Executor Worker writes         │
│  [2112-2113] Cursor (2 Uint8)            Executor Worker writes         │
│  [2116-2119] Sequence (4 Int32)          Executor Worker writes         │
│  [2120-2123] Scalars (4 Uint8)           Executor Worker writes         │
│  [2124-2127] Padding (4 bytes)           -                              │
│  [2128-2199] Animation sync (9 Float64)  Executor ↔ Animation direct    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ Main thread reads all sections
                                    │ for rendering

┌─────────────────────────────────────────────────────────────────────────┐
│                    SHARED JOYSTICK BUFFER (32 bytes)                    │
├─────────────────────────────────────────────────────────────────────────┤
│  [0-7]       stickState (2 Float64)       Main Thread writes           │
│  [8-15]      strigState (2 Float64)       Main Thread writes           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ Executor Worker reads via STICK()/STRIG()
```

## Section Details

### 0. Shared Joystick Buffer (Separate Buffer - 32 bytes)

**Note:** This is a **separate** `SharedArrayBuffer` from the display buffer (2200 bytes).

**Type:** `Float64Array` (4 elements = 2 joysticks × 2 fields)
**Size:** 32 bytes (JOYSTICK_COUNT × FIELDS_PER_JOYSTICK × BYTES_PER_FIELD)
**Writer:** Main Thread (single writer)
**Reader:** Executor Worker, Animation Worker

```
Layout: 2 joysticks × 2 fields × 8 bytes (Float64) = 32 bytes

Float64Array indices:
┌────────────┬────────────┐
│ Index      │ Value      │
├────────────┼────────────┤
│ [0]        │ stickState[0] │ D-pad state for Joystick 0 (0-15)
│ [1]        │ stickState[1] │ D-pad state for Joystick 1 (0-15)
│ [2]        │ strigState[0] │ Button state for Joystick 0 (0-15)
│ [3]        │ strigState[1] │ Button state for Joystick 1 (0-15)
└────────────┴────────────┘

STICK values (bit flags):
│ Value │ Direction     │
│-------|---------------│
│ 0     │ None          │
│ 1     │ RIGHT         │
│ 2     │ LEFT          │
│ 4     │ DOWN          │
│ 8     │ UP            │
│ 3     │ RIGHT + LEFT  │ (diagonal)
│ 12    │ DOWN + UP     │ (invalid)
│ etc.  │ Combinations │

STRIG values (bit flags):
│ Value │ Button        │
│-------|---------------│
│ 0     │ None          │
│ 1     │ START         │
│ 2     │ SELECT        │
│ 4     │ B             │
│ 8     │ A             │
│ etc.  │ Combinations │
```

**Key Functions:**
- `createSharedJoystickBuffer()`: Creates the 32-byte SharedArrayBuffer
- `createViewsFromJoystickBuffer()`: Creates typed views over the buffer
- `setStickState(view, joystickId, state)`: Main thread writes stick state
- `getStickState(view, joystickId)`: Workers read stick state
- `setStrigState(view, joystickId, state)`: Main thread writes button state
- `getStrigState(view, joystickId)`: Workers read button state

### 1. Sprite Data (0-767 bytes)

**Type:** `Float64Array` (96 elements = 8 sprites × 12 floats)
**Writer:** Animation Worker (single writer)
**Reader:** Main Thread (render only), Inspector (read-only)

```
Float64Array indices (relative to buffer start):
┌─────┬─────┬───────────┬──────────────┬───────────────┬──────────┬──────────┬──────────┬──────────┬───────────┬────────────┬────────────────┐
│  x  │  y  │ isActive  │ isVisible    │ frameIndex    │ remainingDist │ totalDist │ direction │  speed   │ priority │ charType  │ colorCombo  │  Sprite 0
└─────┴─────┴───────────┴──────────────┴───────────────┴──────────┴──────────┴──────────┴───────────┴────────────┴────────────────┘
  [0]   [1]      [2]         [3]            [4]            [5]        [6]        [7]        [8]        [9]        [10]         [11]

┌─────┬─────┬───────────┬──────────────┬───────────────┬──────────┬──────────┬──────────┬──────────┬───────────┬────────────┬────────────────┐
│  x  │  y  │ isActive  │ isVisible    │ frameIndex    │ remainingDist │ totalDist │ direction │  speed   │ priority │ charType  │ colorCombo  │  Sprite 1
└─────┴─────┴───────────┴──────────────┴───────────────┴──────────┴──────────┴──────────┴───────────┴────────────┴────────────────┘
  [12]  [13]     [14]        [15]           [16]           [17]       [18]       [19]       [20]       [21]       [22]        [23]

... repeated for sprites 0-7 (96 total floats)
```

- `x`, `y`: Pixel coordinates (0-255)
- `isActive`: Movement state (0 = inactive, 1 = active)
- `isVisible`: Sprite visibility (0 = invisible, 1 = visible)
- `frameIndex`: Which animation frame to display (0-based index)
- `remainingDistance`: Remaining distance in dots (tracked by Animation Worker)
- `totalDistance`: Total distance in dots (from MOVE command)
- `direction`: Direction code (0-8, where 0=none, 1=up, 2=up-right, etc.)
- `speed`: Speed parameter C from MOVE command
- `priority`: Sprite priority (0=front, 1=back)
- `characterType`: Character type from DEF MOVE (-1 = uninitialized, 0-7 = valid)
- `colorCombination`: Color combination
- Slot base formula: `slotBase(actionNumber) = actionNumber × 12`

### 2. Screen Characters (768-1439 bytes)

**Type:** `Uint8Array` (672 elements = 28 × 24)
**Writer:** Executor Worker
**Reader:** Main Thread

F-BASIC character codes for each cell:
- 0-255: Character codes (including picture tiles)
- 0x20 (32): Space (empty cell)

Grid layout: 28 columns × 24 rows

### 3. Screen Color Patterns (1440-2111 bytes)

**Type:** `Uint8Array` (672 elements = 28 × 24)
**Writer:** Executor Worker
**Reader:** Main Thread

Color pattern for each cell (0-3):
- 0: Pattern 0
- 1: Pattern 1
- 2: Pattern 2
- 3: Pattern 3

### 4. Cursor Position (2112-2113 bytes)

**Type:** `Uint8Array` (2 elements)
**Writer:** Executor Worker
**Reader:** Main Thread

| Index | Value | Range |
|-------|-------|-------|
| 0 | cursorX | 0-27 |
| 1 | cursorY | 0-23 |

### 5. Sequence Number (2116-2119 bytes)

**Type:** `Int32Array` (1 element)
**Writer:** Executor Worker (only)
**Reader:** Main Thread

Change detection counter:
- Increments on each screen update
- Main thread polls to detect changes

### 6. Scalars (2120-2123 bytes)

**Type:** `Uint8Array` (4 elements)
**Writer:** Executor Worker
**Reader:** Main Thread

| Index | Name | Range | Description |
|-------|------|-------|-------------|
| 0 | bgPalette | 0-1 | Background palette |
| 1 | spritePalette | 0-3 | Sprite palette |
| 2 | backdropColor | 0-60 | Backdrop color |
| 3 | cgenMode | 0-3 | Character generation mode |

### 7. Padding (2124-2127 bytes)

**Type:** 4 bytes (unused)
**Purpose:** Alignment for Float64Array sync section

### 8. Animation Sync Section (2128-2199 bytes)

**Type:** `Float64Array` (9 elements)
**Writer:** Executor Worker (commands), Animation Worker (ack)
**Reader:** Both workers

```
Float64Array indices (relative to sync section start at byte 2128):
┌─────────┬───────────────┐
│ Index   │ Value         │
├─────────┼───────────────┤
│ 0       │ commandType   │ 0=none, 1=START, 2=STOP, 3=ERASE, 4=SET, 5=CLEAR_ALL
│ 1       │ actionNumber  │ 0-7
│ 2       │ param1        │ startX / x
│ 3       │ param2        │ startY / y
│ 4       │ param3        │ direction
│ 5       │ param4        │ speed
│ 6       │ param5        │ distance
│ 7       │ param6        │ priority
│ 8       │ ack           │ 0=pending, 1=received
└─────────┴───────────────┘
```

**Note:** The sync section is at byte offset 2128, which is Float64 index 266 from buffer start.

#### Sync Command Types

| Type | Value | Params Used |
|------|-------|-------------|
| NONE | 0 | - |
| START_MOVEMENT | 1 | startX, startY, direction, speed, distance, priority |
| STOP_MOVEMENT | 2 | - |
| ERASE_MOVEMENT | 3 | - |
| SET_POSITION | 4 | x (param1), y (param2) |
| CLEAR_ALL_MOVEMENTS | 5 | - (clears all sprite data) |

## Communication Flow

### Joystick Input Flow (Shared Joystick Buffer)

**Separate buffer** from display buffer (32 bytes, zero-copy):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   SHARED JOYSTICK BUFFER (32 bytes)                     │
├─────────────────────────────────────────────────────────────────────────┤
│  [0-15]   stickState (Float64 × 2)     Main Thread writes              │
│  [16-31]  strigState (Float64 × 2)     Main Thread writes (fallback)  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ Executor Worker reads via STICK()/STRIG()
```

**IMPORTANT: STICK vs STRIG are fundamentally different!**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    STICK (LASTING STATE) vs STRIG (PULSE)                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────┐     ┌─────────────────────────────────────┐
    │  STICK - LASTING STATE              │     │  STRIG - PULSE/CONSUME             │
    ├─────────────────────────────────────┤     ├─────────────────────────────────────┤
    │  • Hold button → value persists     │     │  • Press → ONE read, then resets  │
    │  • Release → writes 0               │     │  • Subsequent reads return 0      │
    │  • Multiple reads get same value    │     │  • Next press → new value         │
    │  • Direct buffer read (zero-copy)   │     │  • Consumed from queue (Map)      │
    └─────────────────────────────────────┘     └─────────────────────────────────────┘

    USER ACTION                 BUFFER STATE           BASIC READS
    ────────────               ─────────────           ───────────

    [STICK - Direct Buffer Read]

    Hold RIGHT ───────────────▶ stickState[0] = 1      STICK(0) → 1
                              (persists)                STICK(0) → 1
                              (repeat @ 100ms)          STICK(0) → 1
    Release ─────────────────▶ stickState[0] = 0       STICK(0) → 0

    [STRIG - Consume from Queue]

    Press A ─────────────────▶ strigState[0] = 8      STRIG(0) → 8 ✓ consumed
    (300ms auto-reset)       (then → 0)               STRIG(0) → 0
    Press A again ───────────▶ strigState[0] = 8      STRIG(0) → 8 ✓ consumed
                                                    STRIG(0) → 0
```

**Visual Flow - STICK (Direct Buffer Read):**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           STICK: LASTING STATE (Direct Buffer)                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

    USER INPUT                    MAIN THREAD                    SHARED BUFFER
    ───────────                   ────────────                    ──────────────

      Hold RIGHT
         │
         ▼
    ┌─────────────┐
    │ Joystick    │  useJoystickEvents.startDpadHold()
    │ Component   │       │
    └─────────────┘       │
                           ▼
                  ┌─────────────────────┐
                  │ setStickState()      │
                  │   writes to buffer   │
                  │   value = 1          │
                  └─────────────────────┘
                           │
                           ▼
    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                         Shared Joystick Buffer                                 │
    │  ┌─────────────────────────────────┐                                          │
    │  │ stickState[0] = 1 (RIGHT)        │ ← Direct write, persists while held    │
    │  │ stickState[1] = 0                │                                          │
    │  │ strigState[0] = 0                │                                          │
    │  │ strigState[1] = 0                │                                          │
    │  └─────────────────────────────────┘                                          │
    └─────────────────────────────────────────────────────────────────────────────────┘
                           ▲
                           │ Direct read (no consume)
    ┌──────────────────────┼──────────────────────────────────────────────────────────┐
    │                      │               Executor Worker                             │
    │                      │                                                           │
    │                      │  BASIC: A = STICK(0)                                  │
    │                      │         B = STICK(0)                                  │
    │                      │         C = STICK(0)  ← Same value, no consumption!     │
    │                      │                                                           │
    │                      │  getStickState(view, 0) → 1 (direct buffer read)      │
    └──────────────────────┴──────────────────────────────────────────────────────────┘

    Release RIGHT
         │
         ▼
    ┌─────────────┐
    │ Joystick    │  useJoystickEvents.stopDpadHold()
    │ Component   │       │
    └─────────────┘       │
                           ▼
                  ┌─────────────────────┐
                  │ setStickState()      │
                  │   writes to buffer   │
                  │   value = 0          │
                  └─────────────────────┘
                           │
                           ▼
    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                         Shared Joystick Buffer                                 │
    │  ┌─────────────────────────────────┐                                          │
    │  │ stickState[0] = 0 (released)    │ ← Stays 0 until next press              │
    │  └─────────────────────────────────┘                                          │
    └─────────────────────────────────────────────────────────────────────────────────┘
```

**Visual Flow - STRIG (Consume from Queue):**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           STRIG: PULSE/CONSUME (Queue + Auto-Reset)                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

    USER INPUT                    MAIN THREAD                    SHARED BUFFER       WORKER QUEUE
    ───────────                   ────────────                    ─────────────       ─────────────

      Press A
         │
         ▼
    ┌─────────────┐
    │ Joystick    │  useJoystickEvents.toggleActionButton()
    │ Component   │       │
    └─────────────┘       │
                           ▼
                  ┌─────────────────────────────┐
                  │ setStrigState()              │
                  │   writes to buffer: value = 8│
                  └─────────────────────────────┘
                           │
                           ▼
    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                         Shared Joystick Buffer                                 │
    │  ┌─────────────────────────────────┐                                          │
    │  │ strigState[0] = 8 (A button)     │ ← Written immediately                   │
    │  └─────────────────────────────────┘                                          │
    └─────────────────────────────────────────────────────────────────────────────────┘
                           │
                           │ (300ms auto-reset)
                           ▼
                  ┌─────────────────────────────┐
                  │ setStrigState()              │
                  │   writes to buffer: value = 0│  ← Auto-resets after 300ms
                  └─────────────────────────────┘

                           │ NOTE: Buffer is NOT used for STRIG reads!
                           ▼
    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                     Executor Worker - WebWorkerDeviceAdapter                   │
    │                                                                                │
    │   STRIG EVENT handling (LEGACY - via message passing):                       │
    │   ┌──────────────────────────────────────────────────────────────────────┐   │
    │   │ 1. Main thread sends STRIG_EVENT message (legacy path)              │   │
    │   │ 2. Worker receives → pushStrigState(0, 8)                           │   │
    │   │ 3. Stored in strigClickBuffer Map: [[8], ...]                       │   │
    │   └──────────────────────────────────────────────────────────────────────┘   │
    │                                                                                │
    │   STRIG(0) READ:                                                               │
    │   ┌──────────────────────────────────────────────────────────────────────┐   │
    │   │ consumeStrigState(0):                                                │   │
    │   │   - Reads from strigClickBuffer Map (NOT from shared buffer!)      │   │
    │   │   - Returns first value and removes it (consume pattern)           │   │
    │   │   - If buffer empty, returns 0                                       │   │
    │   │                                                                      │   │
    │   │ Example:                                                             │   │
    │   │   strigClickBuffer = [[8]] → STRIG(0) → 8, buffer becomes []       │   │
    │   │   strigClickBuffer = []   → STRIG(0) → 0                            │   │
    │   └──────────────────────────────────────────────────────────────────────┘   │
    │                                                                                │
    │   NOTE: strigState in shared buffer is written by main thread but          │
    │         NOT read by STICK/STRIG functions. It's for future use or          │
    │         other components that need instantaneous button state.             │
    └─────────────────────────────────────────────────────────────────────────────────┘

    Why the difference?

    STICK:  Game loop needs continuous state while holding ("is RIGHT pressed now?")
    STRIG:  Game loop needs one-shot trigger ("was A button pressed since last check?")
```

**Key Architectural Points:**

1. **STICK** uses direct buffer read:
   - `setStickState()` writes to shared buffer
   - `getStickState()` reads from shared buffer
   - Value persists while button held
   - Zero-copy, no queue overhead

2. **STRIG** uses legacy message queue (currently):
   - Main thread sends `STRIG_EVENT` message
   - Worker stores in `strigClickBuffer` Map
   - `consumeStrigState()` reads and removes from Map (consume pattern)
   - The shared buffer `strigState` is written but NOT used by STRIG()

3. **Future optimization possible:**
   - STRIG could also use direct buffer writes with atomic operations
   - But current implementation keeps message queue for STRIG events
   - The shared buffer `strigState` field exists but is reserved for future use

### Display Buffer Communication Flow

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
import { SharedDisplayBufferAccessor } from '@/core/animation/sharedDisplayBufferAccessor'

const sharedViews = createSharedDisplayBuffer()
const accessor = new SharedDisplayBufferAccessor(sharedViews.buffer)
// sharedViews.buffer → SharedArrayBuffer (2200 bytes)
// sharedViews.spriteView → Float64Array (96)
// sharedViews.charView → Uint8Array (672)
// sharedViews.patternView → Uint8Array (672)
// sharedViews.cursorView → Uint8Array (2)
// sharedViews.sequenceView → Int32Array (1)
// sharedViews.scalarsView → Uint8Array (4)
// sharedViews.animationSyncView → Float64Array (9)
```

### Executor Worker (Write Screen State)

```typescript
import { SharedDisplayBufferAccessor } from '@/core/animation/sharedDisplayBufferAccessor'

const accessor = new SharedDisplayBufferAccessor(sharedDisplayBuffer)

accessor.writeScreenState(
  screenBuffer,    // ScreenCell[][]
  cursorX,         // number
  cursorY,         // number
  bgPalette,       // number
  spritePalette,   // number
  backdropColor,   // number
  cgenMode         // number
)
accessor.incrementSequence() // Notify main thread of change
```

### Executor Worker (Send Animation Commands)

```typescript
import { SharedDisplayBufferAccessor, SyncCommandType } from '@/core/animation/sharedDisplayBufferAccessor'

const accessor = new SharedDisplayBufferAccessor(sharedDisplayBuffer)

// Write command to sync section
accessor.writeSyncCommand(
  SyncCommandType.START_MOVEMENT,
  actionNumber,
  { startX, startY, direction, speed, distance, priority }
)

// Wait for acknowledgment
accessor.waitForAck(100)
```

### Animation Worker (Read Commands, Write Positions)

```typescript
import { SharedDisplayBufferAccessor } from '@/core/animation/sharedDisplayBufferAccessor'

const accessor = new SharedDisplayBufferAccessor(sharedDisplayBuffer)

// Poll for commands
const command = accessor.readSyncCommand()
if (command) {
  // Process command...

  // Write sprite positions
  accessor.writeSpriteState(actionNumber, x, y, isActive)

  // Acknowledge
  accessor.notifyAck()
}
```

## Constants

### Display Buffer Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `SHARED_DISPLAY_BUFFER_BYTES` | 2200 | Total buffer size |
| `MAX_SPRITES` | 8 | Maximum sprite count |
| `FLOATS_PER_SPRITE` | 12 | Float64 elements per sprite |
| `SPRITE_DATA_FLOATS` | 96 | Sprite section size (8 × 12) |
| `ANIMATION_SECTION_FLOATS` | 105 | Full animation section (96 + 9) |
| `COLS` | 28 | Screen columns |
| `ROWS` | 24 | Screen rows |
| `CELLS` | 672 | Total screen cells |
| `OFFSET_SPRITES` | 0 | Sprite data byte offset |
| `OFFSET_CHARS` | 768 | Screen characters byte offset |
| `OFFSET_PATTERNS` | 1440 | Screen patterns byte offset |
| `OFFSET_CURSOR` | 2112 | Cursor byte offset |
| `OFFSET_SEQUENCE` | 2116 | Sequence byte offset |
| `OFFSET_SCALARS` | 2120 | Scalars byte offset |
| `OFFSET_ANIMATION_SYNC` | 2128 | Animation sync byte offset |

### Joystick Buffer Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `JOYSTICK_COUNT` | 2 | Number of joysticks supported |
| `FIELDS_PER_JOYSTICK` | 2 | Number of fields per joystick (stick, strig) |
| `BYTES_PER_FIELD` | 8 | Bytes per field (Float64) |
| `JOYSTICK_BUFFER_BYTES` | 32 | Total joystick buffer size |
| `STICK_NONE` | 0 | No direction pressed |
| `STICK_RIGHT` | 1 | Right direction |
| `STICK_LEFT` | 2 | Left direction |
| `STICK_DOWN` | 4 | Down direction |
| `STICK_UP` | 8 | Up direction |
| `STRIG_START` | 1 | Start button |
| `STRIG_SELECT` | 2 | Select button |
| `STRIG_B` | 4 | B button |
| `STRIG_A` | 8 | A button |

## Related Files

### Display Buffer Files

| File | Purpose |
|------|---------|
| `src/core/animation/sharedDisplayBuffer.ts` | Buffer layout constants and factory functions |
| `src/core/animation/sharedDisplayBufferAccessor.ts` | All buffer operations (screen, sprite, sync, Atomics) |
| `src/core/animation/AnimationManager.ts` | Executor Worker animation state manager |
| `src/core/workers/AnimationWorker.ts` | Animation Worker (sprite physics) |

### Joystick Buffer Files

| File | Purpose |
|------|---------|
| `src/core/devices/sharedJoystickBuffer.ts` | Joystick buffer creation and access functions |
| `src/features/ide/composables/useJoystickEvents.ts` | Dpad/button event handling with zero-copy writes |
| `src/features/ide/composables/useKeyboardJoystick.ts` | Keyboard to joystick mapping |
| `src/features/ide/components/JoystickControl.vue` | Joystick control UI component |
| `src/core/evaluation/FunctionEvaluator.ts` | STICK() and STRIG() function evaluation |
| `src/core/devices/WebWorkerDeviceAdapter.ts` | Device adapter with joystick buffer access |
| `src/core/workers/WebWorkerInterpreter.ts` | Worker that receives joystick buffer via SET_SHARED_JOYSTICK_BUFFER |
