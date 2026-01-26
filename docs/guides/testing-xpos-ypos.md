# Testing XPOS/YPOS Functions

This guide explains how to test that XPOS/YPOS functions correctly return current sprite positions during active movement.

## Quick Test Program

Use this program to verify XPOS/YPOS work correctly:

```basic
10 REM XPOS/YPOS Test - Verify positions during active movement
20 CLS
30 SPRITE ON
40 PRINT "XPOS/YPOS Test Program"
50 PRINT "======================"
60 PRINT ""
70 REM Define movement: Mario moving right at speed 15, distance 60
80 DEF MOVE(0) = SPRITE(0, 3, 15, 60, 0, 0)
90 PRINT "DEF MOVE(0) = SPRITE(0, 3, 15, 60, 0, 0)"
100 PRINT "  Direction 3 (right), Speed 15, Distance 60"
110 PRINT ""
120 REM Set initial position
130 POSITION 0, 50, 100
140 PRINT "POSITION 0, 50, 100"
150 PRINT "  Initial position: (50, 100)"
160 PRINT ""
170 REM Start movement
180 MOVE 0
190 PRINT "MOVE 0 executed"
200 PRINT ""
210 REM Query positions during movement (should update as sprite moves)
220 FOR I = 1 TO 10
230   PRINT "Frame "; I; ":"
240   PRINT "  XPOS(0) = "; XPOS(0)
250   PRINT "  YPOS(0) = "; YPOS(0)
260   PRINT "  MOVE(0) = "; MOVE(0); " (-1=moving, 0=stopped)"
270   PAUSE 200
280 NEXT
290 PRINT ""
300 PRINT "Test complete!"
310 END
```

## What to Verify

### ✅ Expected Behavior (Correct Implementation)

1. **Initial Position**: After `POSITION 0, 50, 100`, XPOS/YPOS should return (50, 100)
2. **During Movement**: XPOS should **increase** each frame (sprite moving right)
   - XPOS should start at ~50 and increase toward ~170 (50 + 120 dots)
   - YPOS should stay at ~100 (no vertical movement)
3. **Position Updates**: Values should change between frames, showing the sprite is actually moving
4. **Movement Status**: MOVE(0) should return -1 while moving, 0 when stopped

### ❌ Incorrect Behavior (Old Implementation)

If XPOS/YPOS always return the same value (e.g., always 50, 100), that indicates:
- Positions are not being synced from Konva nodes
- Worker cache is not being updated
- Functions are returning stale initial positions

## Using the Existing Test Program

The IDE includes a "Move Control Test" sample program that tests XPOS/YPOS:

1. Open the IDE
2. Click "Load Sample" → "Move Control Test"
3. Run the program
4. Watch the output - XPOS/YPOS values should update as sprites move

## Manual Testing Steps

1. **Load the test program** (copy the code above or use "Move Control Test" sample)

2. **Run the program** and observe:
   - Console output showing XPOS/YPOS values
   - Visual sprite movement on screen
   - Values should match visual position

3. **Check console logs** (browser DevTools):
   - Look for: `🎬 [WEB_WORKER_DEVICE] Sprite position cached:`
   - Should see positions being updated regularly
   - Look for: `🎬 [COMPOSABLE] Started movement:` messages

4. **Verify position sync**:
   - Open browser DevTools → Console
   - Filter for "WEB_WORKER_DEVICE" or "COMPOSABLE"
   - Should see position sync messages every frame during animation

## Advanced Test: Position Accuracy

Test that positions match visual sprite location:

```basic
10 REM Position Accuracy Test
20 CLS
30 SPRITE ON
40 DEF MOVE(0) = SPRITE(0, 3, 10, 30, 0, 0)
50 POSITION 0, 100, 120
60 MOVE 0
70 REM Print position every 100ms
80 FOR I = 1 TO 20
90   LOCATE 0, 10
100   PRINT "XPOS(0) = "; XPOS(0); "  "
110   PRINT "YPOS(0) = "; YPOS(0); "  "
120   PRINT "Expected X: ~"; 100 + (I * 6); "  "
130   PAUSE 100
140 NEXT
150 END
```

**Verification**: 
- XPOS should increase by approximately 6 pixels per 100ms (speed 10 = 6 dots/sec)
- Visual sprite position should match printed XPOS/YPOS values

## Debugging Tips

If XPOS/YPOS return 0 or stale values:

1. **Check position sync**:
   - Open DevTools → Console
   - Look for `UPDATE_ANIMATION_POSITIONS` messages
   - Should see messages being sent every frame

2. **Check worker cache**:
   - Add breakpoint in `WebWorkerDeviceAdapter.getSpritePosition()`
   - Verify `spritePositions` Map has entries

3. **Check Konva nodes**:
   - Verify `frontSpriteNodes`/`backSpriteNodes` have sprite nodes
   - Check that nodes have correct x/y values

4. **Check animation loop**:
   - Verify `onPositionSync` callback is being called
   - Check that positions are being read from Konva nodes

## Expected Console Output

When working correctly, you should see:

```
🎬 [WEB_WORKER_DEVICE] Sprite position cached: {actionNumber: 0, x: 50, y: 100}
🎬 [WEB_WORKER_DEVICE] Sprite position cached: {actionNumber: 0, x: 52, y: 100}
🎬 [WEB_WORKER_DEVICE] Sprite position cached: {actionNumber: 0, x: 54, y: 100}
...
```

Positions should update every frame (~60 times per second).
