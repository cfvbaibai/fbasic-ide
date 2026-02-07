# Worker Message Types

Complete reference for all `postMessage` types between Main Thread, Executor Worker, and Animation Worker.

## Architecture Overview

```
┌──────────────┐ postMessage          ┌─────────────────┐
│  Main Thread │ ←─────────────────→  │ Executor Worker │
└──────────────┘                      └─────────────────┘
       │                                       │
       │ reads                                 │ writes
       ▼                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Shared Display Buffer                      │
│  - Sprites (Animation Worker writes)                        │
│  - Screen/Cursor (Executor Worker writes)                   │
│  - Animation Sync (Executor ↔ Animation direct)             │
└─────────────────────────────────────────────────────────────┘
       │                                       │
       │ postMessage (init only)               │ reads
       ▼                                       ▼
┌──────────────────┐                      ┌──────────────────────┐
│ Animation Worker │ ←─────sync──────────→ │ AnimationManager    │
│ (Single Writer)  │   (shared buffer)     │ (in Executor Worker) │
└──────────────────┘                      └──────────────────────┘
```

---

## Messages: Main Thread → Executor Worker

| Type | Purpose | Data Structure |
|------|---------|----------------|
| `EXECUTE` | Start BASIC code execution | `{ code: string, config: InterpreterConfig, options?: { timeout?, enableProgress? } }` |
| `STOP` | Stop ongoing execution | `{ executionId: string, reason?: 'user_request' \| 'timeout' \| 'error' }` |
| `PING` | Health check | `{}` |
| `STRIG_EVENT` | Joystick button press | `{ joystickId: number, state: number, timestamp: number }` |
| `STICK_EVENT` | Joystick stick movement | `{ joystickId: number, state: number, timestamp: number }` |
| `SET_SHARED_ANIMATION_BUFFER` | Init shared display buffer | `{ buffer: SharedArrayBuffer }` |
| `SET_SHARED_JOYSTICK_BUFFER` | Init joystick state buffer | `{ buffer: SharedArrayBuffer }` |
| `INPUT_VALUE` | User input for INPUT/LINPUT | `{ requestId: string, values: string[], cancelled: boolean }` |
| `CLEAR_DISPLAY` | Clear the display | `{}` |

### Base Structure
All messages follow this pattern:
```typescript
interface ServiceWorkerMessage {
  type: ServiceWorkerMessageType
  id: string
  timestamp: number
  data: T // varies by type
}
```

---

## Messages: Executor Worker → Main Thread

| Type | Purpose | Data Structure |
|------|---------|----------------|
| `RESULT` | Execution completed | `{ executionId: string, ...ExecutionResult }` |
| `ERROR` | Execution error | `{ executionId: string, message: string, errorType, lineNumber?, recoverable: boolean }` |
| `OUTPUT` | Print/debug/error output | `{ executionId: string, output: string, outputType: 'print' \| 'debug' \| 'error' }` |
| `PROGRESS` | Execution progress | `{ executionId: string, iterationCount, progress: { completed, total, percentage } }` |
| `SCREEN_UPDATE` | Legacy screen updates (deprecated) | `{ updateType, x?, y?, character?, screenBuffer?, ... }` |
| `SCREEN_CHANGED` | Shared buffer was updated | `{}` |
| `REQUEST_INPUT` | Request user input | `{ requestId: string, executionId: string, prompt: string, variableCount: number, isLinput: boolean }` |
| `PLAY_SOUND` | Play sound (BEEP/PLAY) | `{ executionId: string, musicString: string, events: SoundEvent[] }` |
| `INIT` | Worker initialization complete | `{ workerId: string, capabilities: string[], version: string }` |
| `READY` | Worker ready status | `{ workerId: string, status: 'ready' \| 'busy' \| 'error' }` |

### Deprecated: ANIMATION_COMMAND
**Status**: Legacy path, should be removed.

Animation lifecycle commands are now handled via direct shared buffer sync:
- `START_MOVEMENT` - via `writeSyncCommand()` + Atomics
- `STOP_MOVEMENT` - via `writeSyncCommand()` + Atomics
- `ERASE_MOVEMENT` - via `writeSyncCommand()` + Atomics

Only `SET_POSITION` may still use postMessage for Konva node initialization.

---

## Messages: Main Thread → Animation Worker

| Type | Purpose | Data Structure |
|------|---------|----------------|
| `SET_SHARED_BUFFER` | Initialize shared display buffer | `{ buffer: SharedArrayBuffer }` |
| `TICK` | Manual tick (for testing) | `{ deltaTime: number }` |

**Note**: The Animation Worker runs its own 60Hz tick loop. `TICK` is only used for testing.

---

## Messages: Animation Worker → Main Thread

None. Animation Worker writes exclusively to shared buffer.

---

## Direct Sync: Executor ↔ Animation Worker

No postMessage. Uses `SharedArrayBuffer` with `Atomics` for synchronization.

### Sync Command Types
| Type | Value | Params |
|------|-------|--------|
| `NONE` | 0 | - |
| `START_MOVEMENT` | 1 | `startX`, `startY`, `direction`, `speed`, `distance`, `priority` |
| `STOP_MOVEMENT` | 2 | - |
| `ERASE_MOVEMENT` | 3 | - |
| `SET_POSITION` | 4 | `x`, `y` |

### Sync Flow
```typescript
// Executor Worker writes
writeSyncCommand(view, SyncCommandType.START_MOVEMENT, actionNumber, params)
Atomics.notify(syncView, 0)

// Animation Worker reads and acknowledges
const command = readSyncCommand(view)
// ... process command ...
notifyAck(syncView)

// Executor Worker waits for acknowledgment
waitForAck(syncView, 100)
```

---

## Critical vs Non-Critical Messages

### Critical (Processed Immediately)
- `RESULT` - Resolves execution promise
- `ERROR` - Rejects execution promise
- `REQUEST_INPUT` - Shows input modal

### Non-Critical (Queued for Animation Frame)
- `OUTPUT` - Print/debug/error output
- `SCREEN_UPDATE` - Screen cell updates
- `SCREEN_CHANGED` - Shared buffer notification
- `ANIMATION_COMMAND` - Animation state changes (deprecated)
- `PROGRESS` - Progress updates
- `PLAY_SOUND` - Sound playback

---

## Key Files

| File | Purpose |
|------|---------|
| `src/core/interfaces.ts` | Message type definitions |
| `src/core/workers/WebWorkerManager.ts` | Main thread worker management |
| `src/core/devices/WebWorkerDeviceAdapter.ts` | Worker side device adapter |
| `src/core/workers/AnimationWorker.ts` | Animation worker (single writer) |
| `src/core/animation/AnimationManager.ts` | Animation manager (executor side) |
| `src/core/animation/sharedDisplayBuffer.ts` | Combined buffer layout |
| `src/core/animation/sharedAnimationBuffer.ts` | Animation sync helpers |
| `src/features/ide/composables/useBasicIdeMessageHandlers.ts` | Main thread message handlers |
| `src/features/ide/composables/useBasicIdeWebWorkerUtils.ts` | Worker utilities |

---

## Related Documentation

- **Shared Buffer Layout**: `docs/reference/shared-display-buffer.md`
- **Platform Team**: `docs/teams/platform-team.md`
- **UI Team**: `docs/teams/ui-team.md`
- **Runtime Team**: `docs/teams/runtime-team.md`
