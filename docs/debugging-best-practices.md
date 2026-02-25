# Debugging Best Practices

## Core Principle: Instrument First, Conclude Second

**When investigating bugs, ALWAYS add logging/measurement before forming conclusions.**

### The Wrong Way (What NOT to do)

```
1. Read code, hypothesize "this must be the bug"
2. Make fix based on hypothesis
3. Mark issue as "FIXED"
4. User tests → bug still exists
5. Repeat with new hypothesis
```

### The Right Way

```
1. Add logging at data flow boundaries
2. Run program to see ACTUAL values
3. Identify WHERE value changes from correct → wrong
4. Fix the actual problem
5. Verify with user testing BEFORE marking as fixed
```

## Data Flow Debugging Pattern

For any bug involving incorrect values:

```typescript
// Step 1: Log where value is CREATED
function createValue() {
  const value = calculateSomething()
  console.log('[DEBUG] Created value:', value)  // ← Add this
  return value
}

// Step 2: Log where value FLOWS through each step
function processValue(value: number) {
  console.log('[DEBUG] Received value:', value)  // ← Add this
  const result = transform(value)
  console.log('[DEBUG] Transformed to:', result)  // ← Add this
  return result
}

// Step 3: Log where value is WRITTEN to storage/buffer
function writeToBuffer(value: number) {
  console.log('[DEBUG] Writing to buffer:', value)  // ← Add this
  buffer[0] = value
}

// Step 4: Log where value is READ from storage/buffer
function readFromBuffer() {
  const value = buffer[0]
  console.log('[DEBUG] Read from buffer:', value)  // ← Add this
  return value
}
```

### Example: Shooting Game Bug Investigation

**Wrong approach** (what happened initially):
- Looked at code, guessed cache issue
- Made fix, marked as "FIXED"
- User tested → still broken
- Guessed SET_POSITION issue
- Made fix, user tested → still broken

**Right approach** (what should have happened):

```typescript
// Add logging in AnimationManager.defineMovement (DEF MOVE)
this.accessor.writeSpriteState(
  definition.actionNumber,
  x, y, isActive, isVisible, frameIndex,
  remainingDistance, totalDistance,
  definition.direction,
  definition.speed,
  definition.priority,
  definition.characterType,  // ← Log this
  definition.colorCombination
)
console.log('[DEF MOVE] Wrote characterType:', definition.characterType, 'for action', definition.actionNumber)

// Add logging in AnimationWorker.handleStartMovementFromSync (START_MOVEMENT)
private handleStartMovementFromSync(actionNumber: number, params: {...}) {
  // BEFORE: Hardcoded characterType: 0
  const definition: MoveDefinition = {
    actionNumber,
    characterType: 0,  // ← BUG FOUND HERE
    // ...
  }

  // AFTER: Would show:
  console.log('[START_MOVEMENT] characterType from params:', params.characterType) // undefined
  console.log('[START_MOVEMENT] characterType in definition:', definition.characterType) // 0
  console.log('[START_MOVEMENT] characterType in buffer:', this.accessor.readSpriteCharacterType(actionNumber)) // correct value!
}
```

The logs would immediately show:
- DEF MOVE writes `characterType: 7` (correct random value)
- Buffer has `characterType: 7` (correct)
- START_MOVEMENT uses `characterType: 0` (hardcoded wrong value)

**Conclusion**: START_MOVEMENT should read from buffer instead of hardcoding 0.

## SharedArrayBuffer Debugging

For shared buffer bugs, log both sides of the write/read:

```typescript
// Writer side (e.g., AnimationManager)
this.accessor.writeSpriteState(actionNumber, /* ... */, characterType, colorCombination)
console.log('[WRITE] action', actionNumber, 'characterType:', characterType, 'colorCombination:', colorCombination)

// Verify what was written
const verifyCharType = this.accessor.readSpriteCharacterType(actionNumber)
console.log('[WRITE VERIFY] action', actionNumber, 'buffer has characterType:', verifyCharType)

// Reader side (e.g., AnimationWorker)
const charType = this.accessor.readSpriteCharacterType(actionNumber)
console.log('[READ] action', actionNumber, 'characterType from buffer:', charType)
```

## Worker Communication Debugging

For worker sync bugs, log the full command lifecycle:

```typescript
// Sender (AnimationManager)
console.log('[SEND] Writing START_MOVEMENT command for action', actionNumber, 'with params:', params)
this.accessor.writeStartMovementCommand(actionNumber, params)
await this.waitForAck()
console.log('[SEND] ACK received for action', actionNumber)

// Receiver (AnimationWorker)
private pollSyncCommands() {
  const command = this.accessor.readSyncCommand()
  if (command) {
    console.log('[RECEIVE] Processing command:', command.commandType, 'for action', command.actionNumber)
    this.handleStartMovementFromSync(command.actionNumber, command.params)
    this.accessor.notifyAck()
    console.log('[RECEIVE] ACK written for action', command.actionNumber)
  }
}
```

## Hypothesis Language

When uncertain, use qualifying language:

| Wrong | Right |
|-------|-------|
| "The bug is in SET_POSITION" | "The bug **might be** in SET_POSITION because..." |
| "FIXED: Cache issue" | "HYPOTHESIS: Cache issue. Need to verify." |
| "Found the root cause!" | "Possible root cause: Need to add logging to confirm." |

## Before Marking as "FIXED"

Must complete ALL of:

1. ✅ Code compiles (`pnpm type-check`)
2. ✅ Tests pass (`pnpm test:run`)
3. ✅ Logs show correct values flowing through
4. ✅ **USER confirms in browser/end-to-end**

Never skip step 4.

## Removing Debug Logging

After fix is verified:

```typescript
// Remove ALL console.log statements added for debugging
// If you need to keep logging for permanent monitoring, use proper logger:
import { logWorker } from '@/shared/logger'

logWorker.debug('[AnimationWorker] Movement state created:', { actionNumber, x, y })
```

## Common Patterns

### "Value is always 0" Bug

**Symptom**: A value that should vary (random, calculated) is always 0.

**Debugging**:
1. Log where value is first created with correct value
2. Log each step where value flows
3. Find where it becomes 0
4. Fix: Usually a hardcoded default or missing read from buffer

### "Works in test, fails in browser" Bug

**Symptom**: Test passes, but browser shows different behavior.

**Debugging**:
1. Check if test uses mocks that hide the real bug
2. Add logging in real browser code
3. Run in browser with DevTools console open
4. Compare test execution vs browser execution paths

### "Intermittent/Random" Bug

**Symptom**: Bug happens sometimes but not always.

**Debugging**:
1. Log all state changes with timestamps
2. Look for timing-dependent operations (race conditions)
3. Check for uninitialized variables (undefined treated differently than 0)
4. Add more logging to narrow down the pattern
