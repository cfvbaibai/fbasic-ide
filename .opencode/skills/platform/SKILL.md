---
name: platform
description: Platform team skill for device adapters, sprite systems, animation, and shared buffers. Use when the user invokes '/platform <task>' or requests sprite commands, animation features, device I/O, joystick handling, or SharedArrayBuffer modifications. Works with `src/core/animation/`, `src/core/sprite/`, `src/core/devices/`. Must read docs/teams/platform-team.md for detailed patterns.
---

# Platform Team Skill

Implement device adapters, sprite systems, animation, and shared buffers.

## Ownership

- **Files**: `src/core/animation/*`, `src/core/sprite/*`, `src/core/devices/*`
- **Responsibilities**: Devices, sprites, animation, shared buffers, screen/joystick I/O

## Architecture

### Device System

```
BasicDeviceAdapter Interface
    ├─ WebWorkerDeviceAdapter (worker side)
    └─ Main Thread (Konva rendering)
         ↕
    SharedArrayBuffer (sprite positions)
```

### Multi-Layer Screen

- **Background Screen** (28×24 chars) - All PRINT output
- **Sprite Screen** (256×240 dots) - 8 sprite slots
- **Backdrop Screen** (32×30 chars)
- **BG GRAPHIC Screen** (28×21 chars)

## Key Files

- `AnimationManager.ts` - DEF MOVE / MOVE commands, 8 action slots
- `SpriteStateManager.ts` - Static sprites (8 slots)
- `BasicDeviceAdapter.ts` - Device interface
- `sharedDisplayBuffer.ts` - Combined buffer (1548 bytes)

## Commands

- `DEF SPRITE` - Define static sprite
- `SPRITE` - Place static sprite
- `DEF MOVE` - Define movement pattern
- `MOVE` - Execute movement pattern
- `POSITION` - Set sprite position
- `CUT` - Hide sprite
- `ERA` - Clear movement slot

## Common Tasks

### Add New Device Method

1. **Update interface** in `BasicDeviceAdapter.ts`
2. **Implement in worker adapter** (`WebWorkerDeviceAdapter.ts`)
3. **Handle in main thread** (UI team integrates)
4. **Hand off to Runtime Team** to use in executors

### Add New Sprite Command

1. **Update AnimationManager** or **SpriteStateManager**
2. **Create executor** (Runtime Team)
3. **Add tests** for state updates and buffer writes

## Patterns

### Worker State Management

```typescript
class AnimationManager {
  private moveDefinitions: Map<number, MoveDefinition> = new Map()

  public scheduleMove(actionNumber: number, moveNumber: number): void {
    // Update internal state
    // Write positions to SharedArrayBuffer
  }
}
```

### SharedBuffer Writes (Worker)

```typescript
import { writeSpritePosition } from '@/core/animation/sharedDisplayBuffer'
writeSpritePosition(sharedBuffer, actionNumber, { x, y, visible: true, ... })
```

### SharedBuffer Reads (Main Thread)

```typescript
import { readSpritePosition } from '@/core/animation/sharedDisplayBuffer'
const sprite = readSpritePosition(sharedBuffer, i)
```

## Joystick System

- `STICK(n)` - Cross-button bitmask: 1=right, 2=left, 4=down, 8=top
- `STRIG(n)` - Action button bitmask: 1=start, 2=select, 4=B, 8=A
- Supports 0-3 joystick IDs (4 joysticks max)

## Testing

- **Location**: `test/animation/*`, `test/sprite/*`
- **Pattern**: Test state updates, buffer writes, command logic
- **Mock**: SharedArrayBuffer when needed

## Reference

- Read `docs/teams/platform-team.md` for complete guide
- **F-BASIC manual**: `docs/reference/family-basic-manual/`
