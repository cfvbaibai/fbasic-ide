# CUT Command Position Preservation Fix

## Problem
When the CUT command was executed after MOVE, the sprite position was being reset to the initial position instead of preserving the current animated position. This caused the next MOVE command to start from the wrong position.

## Root Cause
The issue was a timing problem with position synchronization between the web worker and the main thread:

1. **Worker has stale positions**: The web worker's `AnimationManager.updateMovements()` never runs (animation happens in main thread), so its stored positions are always the initial positions
2. **Frontend movement states lag behind rendering**: When CUT happens immediately after MOVE starts, the `movementStates` currentX/currentY are still at initial values because the animation loop hasn't run yet
3. **Position sync-back used stale values**: The UPDATE_ANIMATION_POSITIONS message was sending back initial positions (120, 120) instead of actual animated positions

## Solution
Added a multi-layer position retrieval system that checks Konva sprite nodes (actual rendered positions) before falling back to movement states:

### Architecture Changes

1. **Added sprite node refs to IDE composable** (`useBasicIdeEnhanced.ts`)
   - Created `frontSpriteNodes` and `backSpriteNodes` refs
   - Added them to message handler context
   - Exported them for Screen component to update

2. **Updated STOP_MOVEMENT handler** (`useBasicIdeMessageHandlers.ts`)
   - First tries to get position from Konva sprite nodes (front or back layer)
   - Falls back to movement state position if node doesn't exist
   - Logs which source was used for debugging

3. **Connected Screen component to IDE composable**
   - Screen component accepts `externalFrontSpriteNodes` and `externalBackSpriteNodes` props
   - After rendering, Screen syncs its internal sprite nodes to the external refs
   - Props flow: `IdePage.vue` → `RuntimeOutput.vue` → `ScreenTab.vue` → `Screen.vue`

### Position Retrieval Priority

When STOP_MOVEMENT (CUT command) is received:

1. **Try Konva front sprite node** - Most accurate, has actual rendered position
2. **Try Konva back sprite node** - Fallback for priority=1 sprites
3. **Use movement state position** - Fallback when nodes don't exist yet (immediate CUT after MOVE)

This ensures:
- If sprite has animated (e.g., during PAUSE), we get the real animated position
- If CUT happens immediately, we still get the initial position (which is correct since no animation occurred)

## Files Modified

1. `src/features/ide/composables/useBasicIdeEnhanced.ts` - Added sprite node refs
2. `src/features/ide/composables/useBasicIdeMessageHandlers.ts` - Updated position retrieval logic
3. `src/features/ide/components/Screen.vue` - Added external sprite node sync
4. `src/features/ide/components/ScreenTab.vue` - Pass through sprite node props
5. `src/features/ide/components/RuntimeOutput.vue` - Pass through sprite node props
6. `src/features/ide/IdePage.vue` - Connect composable to components

## Testing
Test with the "Move Control Test" sample program which:
1. Sets initial position with POSITION
2. Starts movement with MOVE
3. Waits with PAUSE 500 (allows animation to run)
4. Stops with CUT
5. Starts new movement - should start from CUT position, not initial position

Expected behavior:
- Sprite moves during PAUSE
- CUT preserves animated position
- Next MOVE starts from where sprite was CUT
