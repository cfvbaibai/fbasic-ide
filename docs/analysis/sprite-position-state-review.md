# Sprite Position State Management Review

**Date**: 2026-01-26
**Last Updated**: 2026-01-26 (added code quality improvements section)
**Reviewer**: Code Review
**Scope**: Position state management for MOVEing sprites

## Executive Summary

The position state management for MOVEing sprites uses a **dual-state architecture** where:
- **Web Worker** (`AnimationManager`) manages movement definitions and initial states
- **Main Thread** (frontend) handles actual position updates via animation loop

This architecture was necessary because animation runs on the main thread for smooth rendering, but creates synchronization challenges that were addressed with a multi-layer position retrieval system.

## Current Architecture

### State Storage Locations

1. **Web Worker (`AnimationManager`)**:
   - `movementStates: Map<actionNumber, MovementState>` - Initial states, **never updated** after creation
   - `storedPositions: Map<actionNumber, {x, y}>` - Synced from frontend on CUT/ERA

2. **Main Thread (Frontend)**:
   - `localMovementStates: MovementState[]` - **Active position updates** happen here
   - `frontSpriteNodes/backSpriteNodes: Map<actionNumber, Konva.Image>` - **Actual rendered positions**

### Position Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ MOVE Command Execution Flow                                  │
└─────────────────────────────────────────────────────────────┘

1. MOVE n executes in Worker
   └─> AnimationManager.startMovement()
       ├─> Creates MovementState with initial position
       │   └─> From: startX/startY param OR storedPositions OR default (120,120)
       └─> Sends START_MOVEMENT command to frontend

2. Frontend receives START_MOVEMENT
   └─> Creates/updates movementStates
       └─> Animation loop starts updating positions
           └─> updateMovements() in useScreenAnimationLoop.ts
               └─> Updates localMovementStates[].currentX/Y each frame

3. Position Updates (Each Frame)
   └─> useScreenAnimationLoop.updateMovements()
       ├─> Calculates distance per frame
       ├─> Updates currentX, currentY
       └─> Updates Konva sprite node positions
           └─> frontSpriteNodes/backSpriteNodes store actual rendered positions

4. CUT Command (Position Preservation)
   └─> Worker: AnimationManager.stopMovement()
       └─> Sends STOP_MOVEMENT command
           └─> Frontend: handleAnimationCommandMessage()
               ├─> Priority 1: Get position from Konva sprite nodes (most accurate)
               ├─> Priority 2: Get position from movement state (fallback)
               └─> Sends UPDATE_ANIMATION_POSITIONS message back to worker
                   └─> Worker: AnimationManager.updateStoredPositions()
                       └─> Updates storedPositions for next MOVE

5. Next MOVE Command
   └─> Uses updated storedPositions from step 4
```

## Key Components

### 1. AnimationManager (Worker)

**Location**: `src/core/animation/AnimationManager.ts`

**Responsibilities**:
- Define movements (DEF MOVE)
- Start movements (MOVE command)
- Store positions for next MOVE
- Query positions (XPOS/YPOS functions)

**Critical Issue**: `updateMovements()` method exists but **never runs** in worker. Animation happens entirely on main thread.

```typescript
// Line 153-183: This method is never called!
updateMovements(deltaTime: number): void {
  // Updates movement.currentX/Y - but this never happens
  // because animation runs on main thread
}
```

### 2. useScreenAnimationLoop (Main Thread)

**Location**: `src/features/ide/composables/useScreenAnimationLoop.ts`

**Responsibilities**:
- Update movement positions each frame
- Update Konva sprite node positions
- Only runs when movements are active

**Key Function**: `updateMovements()` (lines 17-54)
- Updates `localMovementStates[].currentX/Y` each frame
- Clamps to screen bounds (0-255, 0-239)
- Updates frame animation indices

### 3. useMovementStateSync (Main Thread)

**Location**: `src/features/ide/composables/useMovementStateSync.ts`

**Responsibilities**:
- Sync movement states from worker to local mutable copy
- Preserve positions of active movements when new states arrive
- Handle stopped movements (preserve position from local state)

**Key Logic** (lines 39-68):
- Merges new states with existing local states
- Preserves `currentX/Y` for active movements
- Preserves `currentX/Y` for stopped movements (CUT)

### 4. Position Retrieval (CUT Command)

**Location**: `src/features/ide/composables/useBasicIdeMessageHandlers.ts` (lines 386-433)

**Multi-Layer Retrieval Priority**:
1. **Konva front sprite node** - Most accurate (actual rendered position)
2. **Konva back sprite node** - Fallback for priority=1 sprites
3. **Movement state position** - Fallback when nodes don't exist yet

**Why This Is Necessary**:
- Animation loop updates Konva nodes directly
- Movement states may lag behind (especially if CUT happens immediately)
- Konva nodes have the most up-to-date positions

## Issues Identified

### 🔴 Critical Issue: XPOS/YPOS Return Stale Positions During Active Movement

**Problem**: `XPOS(n)` and `YPOS(n)` functions query the worker's `AnimationManager.getSpritePosition()`, which returns positions from `movementStates` that are **never updated** after initial creation.

**Location**: `src/core/evaluation/FunctionEvaluator.ts` (lines 519-551)

```typescript
private evaluateXpos(args: Array<number | string>): number {
  // ...
  const position = this.context.animationManager.getSpritePosition(actionNumber)
  return position?.x ?? 0
}
```

**Impact**:
- During active movement, `XPOS(n)`/`YPOS(n)` return **initial position**, not current animated position
- This breaks programs that query positions during movement (e.g., collision detection)
- Example from manual (page-34.md): `POSITION 2, XPOS(3), YPOS(3)` - would get wrong position if sprite 3 is moving

**Root Cause**: Worker's `movementStates` are never updated because `updateMovements()` never runs in worker.

**Solution Options**:
1. **Sync positions to worker periodically** - Send position updates from frontend to worker during active movement
2. **Query frontend positions** - Make XPOS/YPOS query frontend state instead of worker state
3. **Hybrid approach** - Query worker for stored positions, but sync active movement positions from frontend

### 🟡 Medium Issue: Position Sync Complexity

**Problem**: The multi-layer position retrieval system (Konva nodes → movement states → stored positions) is complex and has multiple fallback paths that may have edge cases.

**Potential Issues**:
- If Konva node doesn't exist yet (immediate CUT after MOVE), falls back to movement state
- If movement state hasn't been updated yet (immediate CUT), may use initial position
- Type checking for Konva node properties is fragile (`typeof frontNode.x === 'function'`)

**Recommendation**: Add comprehensive logging and error handling to make debugging easier.

### 🟢 Low Issue: Worker State Never Updates

**Problem**: Worker's `movementStates` are created but never updated, making them effectively read-only after creation.

**Impact**: 
- Worker state is always stale during active movement
- Only `storedPositions` are synced back (on CUT/ERA)
- This is by design (animation on main thread), but creates confusion

**Recommendation**: Add clear documentation explaining why worker states are never updated.

## Recommendations

### Priority 1: Fix XPOS/YPOS Stale Positions

**Option A: Periodic Position Sync (Recommended)**
- Send position updates from frontend to worker every N frames (e.g., every 10 frames)
- Worker updates `movementStates[].currentX/Y` when positions arrive
- XPOS/YPOS can then query worker state with recent positions
- **Pros**: Keeps worker as source of truth, minimal changes
- **Cons**: Slight delay (up to N frames), requires message passing

**Option B: Query Frontend State**
- Make XPOS/YPOS send query message to frontend
- Frontend responds with current position from `localMovementStates` or Konva nodes
- **Pros**: Always accurate, no delay
- **Cons**: Requires async message passing, breaks synchronous function evaluation

**Option C: Hybrid Approach**
- For active movements: Query frontend state (via message)
- For stopped movements: Query worker `storedPositions`
- **Pros**: Accurate for both cases
- **Cons**: Most complex, requires async handling

**Recommendation**: **Option A** - Periodic position sync is cleanest and maintains current architecture.

### Priority 2: Improve Position Sync Reliability

1. **Add position sync on movement completion**:
   - When movement completes naturally (remainingDistance <= 0), sync position to worker
   - Currently only syncs on CUT/ERA

2. **Add validation**:
   - Validate positions are within bounds (0-255, 0-239) before syncing
   - Log warnings if positions seem incorrect

3. **Improve error handling**:
   - Handle cases where Konva nodes don't exist
   - Handle cases where movement state is missing
   - Add fallback to stored position if all else fails

### Priority 3: Documentation and Testing

1. **Document position flow**:
   - Add architecture diagram to codebase
   - Document why worker states are never updated
   - Document position retrieval priority

2. **Add tests**:
   - Test XPOS/YPOS during active movement
   - Test position preservation after CUT
   - Test position sync timing

## Code Quality Observations

### Strengths

1. **Clear separation of concerns**: Worker handles definitions/commands, frontend handles rendering
2. **Multi-layer fallback system**: Handles edge cases (immediate CUT, missing nodes)
3. **Position preservation**: CUT correctly preserves positions via Konva node retrieval
4. **Type safety**: Good TypeScript usage throughout

### Areas for Improvement

1. **Position sync timing**: Only syncs on CUT/ERA, not on natural completion
2. **XPOS/YPOS accuracy**: Returns stale positions during active movement
3. **Documentation**: Limited inline comments explaining position flow
4. **Error handling**: Could be more robust in position retrieval

## Conclusion

The position state management system works correctly for the primary use case (MOVE → CUT → MOVE), but has a **critical issue** with XPOS/YPOS functions returning stale positions during active movement. The recommended fix is to implement periodic position sync from frontend to worker, allowing XPOS/YPOS to query accurate positions while maintaining the current architecture.

The multi-layer position retrieval system is well-designed for handling edge cases, but could benefit from better documentation and more comprehensive error handling.

---

## Recent Code Quality Improvements (2026-01-26)

### Refactoring & Best Practices

**Konva Test Page Refactoring:**
- Reduced `KonvaSpriteTestPage.vue` from 514 to 266 lines (52% reduction)
- Extracted animation loop logic to `useSpriteAnimation.ts` (107 lines)
- Extracted Konva stage initialization to `useKonvaStage.ts` (173 lines)
- Improved separation of concerns and maintainability

**Vue 3 Best Practices:**
- Fixed props reactivity loss in `Screen.vue` by wrapping `onPositionSync` prop access with `toValue()`
- Prevents loss of reactivity when passing props to composables
- All TypeScript type checks pass
- All ESLint and Stylelint checks pass

**File Organization:**
- All files now respect 500-line limit
- Clear composable boundaries for animation, stage, and rendering concerns
- Improved testability through smaller, focused modules

### Architecture Clarity

The refactoring improves understanding of the position state management system:

1. **useSpriteAnimation.ts** - Clearly shows animation loop implementation
2. **useKonvaStage.ts** - Clearly shows Konva initialization and cleanup
3. **useScreenAnimationLoop.ts** - Main thread position update logic
4. **useMovementStateSync.ts** - Movement state synchronization logic

This separation makes it easier to identify where position updates happen and how they flow through the system.

### Next Steps for Position State

Based on this review, recommended improvements:

1. **Implement XPOS/YPOS fix** (Priority 1)
   - Add periodic position sync from frontend to worker
   - Update worker's `movementStates` with current positions
   - Ensure XPOS/YPOS return accurate positions during movement

2. **Add comprehensive tests** (Priority 2)
   - Test XPOS/YPOS during active movement
   - Test position preservation after CUT
   - Test position sync timing and accuracy

3. **Improve documentation** (Priority 3)
   - Add inline comments explaining position flow
   - Document why worker states are never updated by updateMovements()
   - Create sequence diagrams for position sync flow
