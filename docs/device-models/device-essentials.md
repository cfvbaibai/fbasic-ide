# Device Architecture Essentials

Essential device model patterns for AI assistants.

## Screen System

**Multi-Layer Architecture**:
- **Background Screen** (28×24 characters) - All PRINT output
- **Sprite Screen** (Front/Back, 256×240 dots) - 8 sprite slots
- **Backdrop Screen** (32×30 characters)
- **BG GRAPHIC Screen** (28×21 characters)

**Key Pattern**: Worker holds state; main thread renders via Konva and SharedArrayBuffer.

### Animation System

**Architecture**:
- `AnimationManager` runs in web worker (with ExecutionEngine)
- Main thread uses `requestAnimationFrame` for rendering
- State sync via `SharedArrayBuffer`:
  - Sprites: 0-192 bytes (Float64Array × 24)
  - Screen cells, cursor, sequence, scalars follow
- Position updates happen on main thread (reads buffer each frame)

**Commands**: `SPRITE`, `MOVE`, `DEF MOVE`, `DEF SPRITE`, `POSITION`, `CUT`, `ERA`

**Files**:
- `src/core/animation/AnimationManager.ts` - 8 action slots, movement state
- `src/core/animation/sharedDisplayBuffer.ts` - Combined buffer layout
- `src/core/sprite/SpriteStateManager.ts` - 8 static sprite slots

## Joystick System

**F-BASIC v3 Spec**:
- `STICK(n)` - Cross-button bitmask: 1=right, 2=left, 4=down, 8=top
- `STRIG(n)` - Action button bitmask: 1=start, 2=select, 4=B, 8=A
- Supports 0-3 joystick IDs (4 joysticks max)

**Implementation**:
- `BasicDeviceAdapter` interface provides `getStickState()` / `consumeStrigState()`
- Web implementation uses browser Gamepad API
- Polling-based (not frame-synchronized)

## Device Adapter Pattern

**Core Interface**: `BasicDeviceAdapter`
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

**Key Rule**: Core interpreter is platform-agnostic. All I/O goes through device adapter.

## Worker Architecture

**Pattern**: Interpreter runs in web worker for non-blocking execution.

**Communication**:
1. Main → Worker: `EXECUTE` message with code
2. Worker → Main: `OUTPUT` messages for PRINT
3. Worker → Main: `SCREEN_UPDATE` messages for display changes
4. Worker ↔ Main: SharedArrayBuffer for sprite positions (read/write both directions)

**Files**:
- `src/core/devices/WebWorkerDeviceAdapter.ts` - Worker-side adapter
- `src/features/ide/composables/useBasicIdeWebWorkerUtils.ts` - Main thread coordinator

## Animation Frame System

**Pattern**: Character animation configs per sprite (0-15).

**Files**:
- `src/core/animation/CharacterAnimationBuilder.ts` - Builds animation configs
- `src/core/animation/characterSequenceConfig.ts` - Direction/sprite mapping
- `src/shared/data/characters/CHARACTER_SPRITES.ts` - Sprite data

**Rule**: Each character (Mario, Luigi, etc.) has 4-8 directional sprites defined in config.
