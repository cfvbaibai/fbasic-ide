# Platform Team

## Ownership
- **Files**: `src/core/animation/*`, `src/core/sprite/*`, `src/core/devices/*`, `test/animation/*`, `test/sprite/*`
- **Responsibilities**: Device adapters, sprite system, animation, shared buffers, screen/joystick I/O

## Architecture

### Device System Overview
```
┌─────────────────────────────────────────┐
│  BasicDeviceAdapter Interface           │
│  (Platform-agnostic I/O contract)       │
└─────────────────────────────────────────┘
         │
         ├─ WebWorkerDeviceAdapter (worker side)
         └─ Main Thread (Konva rendering)
              ↕
         SharedArrayBuffer (sprite positions)
```

### Multi-Layer Screen System
- **Background Screen** (28×24 characters) - All PRINT output
- **Sprite Screen** (Front/Back, 256×240 dots) - 8 sprite slots
- **Backdrop Screen** (32×30 characters)
- **BG GRAPHIC Screen** (28×21 characters)

### Key Pattern: Worker + SharedBuffer
- **Worker side**: Holds state, executes commands, writes to buffer
- **Main thread**: Reads buffer, renders with Konva (60fps via RAF)

## Core Interfaces

### BasicDeviceAdapter
```typescript
interface BasicDeviceAdapter {
  // Screen output
  printOutput(text: string): void
  clearScreen(): void
  setCursorPosition(x: number, y: number): void

  // Joystick input (polling)
  getStickState(joystickId: number): number
  consumeStrigState(joystickId: number): number

  // Sprite commands (queued)
  getSpritePosition(actionNumber: number): { x: number; y: number } | null
}
```

### SharedDisplayBuffer Layout
```
Bytes 0-191:    Sprite positions (8 slots × 24 bytes)
Bytes 192+:     Screen cells, cursor, sequence, scalars
Total:          1548 bytes
```

## Animation System

### Architecture
- **AnimationManager** (worker) - 8 action slots, movement state
- **Main thread** - `requestAnimationFrame` rendering loop
- **Sync**: SharedArrayBuffer for positions

### Key Files
- `AnimationManager.ts` - DEF MOVE / MOVE commands, 8 action slots
- `CharacterAnimationBuilder.ts` - Builds animation configs from CHARACTER_SPRITES
- `characterSequenceConfig.ts` - Direction/sprite mapping per character (0-15)
- `sharedAnimationBuffer.ts` - Legacy (192 bytes sprite-only)
- `sharedDisplayBuffer.ts` - Combined buffer (1548 bytes)

### Commands
- `DEF SPRITE` - Define static sprite
- `SPRITE` - Place static sprite
- `DEF MOVE` - Define movement pattern
- `MOVE` - Execute movement pattern
- `POSITION` - Set sprite position
- `CUT` - Hide sprite
- `ERA` - Clear movement slot

## Sprite System

### Two Types of Sprites

**Static Sprites** (SpriteStateManager):
- 8 slots
- No animation
- Executors: `DefSpriteExecutor`, `SpriteExecutor`, `SpriteOnOffExecutor`

**Animated Sprites** (AnimationManager):
- 8 action slots
- Movement patterns
- Executors: `DefMoveExecutor`, `MoveExecutor`, `CutExecutor`, `EraExecutor`, `PositionExecutor`

### Character Animation Frames
- Each character (0-15) has directional sprites
- Defined in `characterSequenceConfig.ts`
- Built by `CharacterAnimationBuilder`

## Joystick System

### F-BASIC v3 Spec
- `STICK(n)` - Cross-button bitmask: 1=right, 2=left, 4=down, 8=top
- `STRIG(n)` - Action button bitmask: 1=start, 2=select, 4=B, 8=A
- Supports 0-3 joystick IDs (4 joysticks max)

### Implementation
- Browser Gamepad API
- Polling-based (not frame-synchronized)
- Provided via `BasicDeviceAdapter`

## Common Tasks

### Add New Device Method

1. **Update interface** in `BasicDeviceAdapter.ts`:
   ```typescript
   interface BasicDeviceAdapter {
     // ... existing methods
     drawCircle(x: number, y: number, radius: number): void
   }
   ```

2. **Implement in worker adapter** (`WebWorkerDeviceAdapter.ts`):
   ```typescript
   drawCircle(x: number, y: number, radius: number): void {
     this.postMessage({
       type: 'DRAW_CIRCLE',
       payload: { x, y, radius }
     })
   }
   ```

3. **Handle in main thread** (UI team integrates):
   - Add message handler
   - Implement Konva rendering

4. **Hand off to Runtime Team** to use in executors

### Add New Sprite Command

1. **Update AnimationManager** or **SpriteStateManager**:
   ```typescript
   // In AnimationManager.ts
   public newCommand(params: CommandParams): void {
     // Update state
     // Write to shared buffer if needed
   }
   ```

2. **Create executor** (Runtime Team):
   - Executor calls `AnimationManager.newCommand()`

3. **Add tests**:
   - Test state updates
   - Test buffer writes

### Extend SharedBuffer Layout

1. **Update** `sharedDisplayBuffer.ts`:
   ```typescript
   export const BUFFER_LAYOUT = {
     // ... existing
     NEW_SECTION_OFFSET: 1548,
     NEW_SECTION_SIZE: 32,
   }
   ```

2. **Update writer** (worker side):
   ```typescript
   function writeNewSection(buffer: SharedArrayBuffer, data: number[]) {
     const view = new Float64Array(buffer, BUFFER_LAYOUT.NEW_SECTION_OFFSET)
     // Write data
   }
   ```

3. **Update reader** (main thread, UI team):
   ```typescript
   function readNewSection(buffer: SharedArrayBuffer) {
     const view = new Float64Array(buffer, BUFFER_LAYOUT.NEW_SECTION_OFFSET)
     // Read data
   }
   ```

## Integration Points

### Provides to Runtime Team
- **BasicDeviceAdapter** interface for I/O
- **AnimationManager** for sprite commands
- **SpriteStateManager** for static sprites

### Provides to UI Team
- **SharedArrayBuffer** layout and updates
- **Device message types** for rendering

### Uses from Runtime Team
- **Executor calls** to device adapter methods
- **Command execution** triggers state updates

## Patterns & Conventions

### Worker State Management
```typescript
// State lives in worker, not shared
class AnimationManager {
  private moveDefinitions: Map<number, MoveDefinition> = new Map()
  private movementStates: Map<number, MovementState> = new Map()

  public scheduleMove(actionNumber: number, moveNumber: number): void {
    // Update internal state
    // Write positions to SharedArrayBuffer
  }
}
```

### SharedBuffer Writes (Worker)
```typescript
import { writeSpritePosition } from '@/core/animation/sharedDisplayBuffer'

function updateSpritePosition(actionNumber: number, x: number, y: number) {
  writeSpritePosition(sharedBuffer, actionNumber, { x, y, visible: true, ... })
}
```

### SharedBuffer Reads (Main Thread)
```typescript
import { readSpritePosition } from '@/core/animation/sharedDisplayBuffer'

function renderFrame() {
  for (let i = 0; i < 8; i++) {
    const sprite = readSpritePosition(sharedBuffer, i)
    if (sprite.visible) {
      // Update Konva sprite position
    }
  }
  requestAnimationFrame(renderFrame)
}
```

## Testing

- **Location**: `test/animation/*`, `test/sprite/*`
- **Pattern**: Test state updates, buffer writes, command logic
- **Mock**: SharedArrayBuffer when needed

### Test Template
```typescript
import { describe, test, expect } from 'vitest'
import { AnimationManager } from '@/core/animation/AnimationManager'

describe('AnimationManager', () => {
  test('schedules move correctly', () => {
    const buffer = new SharedArrayBuffer(1548)
    const manager = new AnimationManager(buffer)

    manager.defineMove(1, movePattern)
    manager.scheduleMove(0, 1)

    const position = readSpritePosition(buffer, 0)
    expect(position.x).toEqual(expectedX)
    expect(position.y).toEqual(expectedY)
  })
})
```

## Code Constraints

- Files: **MAX 500 lines**
- TypeScript: strict mode, no `any`, `import type` for types
- Buffer access: Use typed arrays (Float64Array, Uint8Array)
- Thread safety: Only worker writes to buffer positions

## Reference

- **F-BASIC manual**: `docs/reference/family-basic-manual/` (device behavior)
- **Shared buffer layout**: See `sharedDisplayBuffer.ts` comments
