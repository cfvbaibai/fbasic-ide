# Animation Commands – Queue Migration Review

**Status**: Complete — no further migration needed.

Review of all animation-related commands (worker → main thread) and whether they need to use the per-sprite action queue.

## Animation command list

| Command | Worker source | Main-thread handler | Node exists? |
|--------|----------------|---------------------|--------------|
| `SET_POSITION` | POSITION n,x,y (PositionExecutor) | SET_POSITION case | Maybe not (first run) |
| `START_MOVEMENT` | MOVE n (MoveExecutor) | START_MOVEMENT case | Created by this command |
| `STOP_MOVEMENT` | CUT n (CutExecutor) | STOP_MOVEMENT case | Yes (MOVE ran first) |
| `ERASE_MOVEMENT` | ERA n (EraExecutor) | ERASE_MOVEMENT case | Maybe not (ERA before MOVE) |
| `UPDATE_MOVEMENT_POSITION` | Animation loop (worker) | UPDATE_MOVEMENT_POSITION case | Yes |

## Per-command verdict

### SET_POSITION — **already queue-based**

- **When it runs:** POSITION n,x,y can run before any MOVE n, so the Konva sprite node often does not exist yet.
- **Current behavior:** If node exists → set node position and clear that action’s queue. If node does not exist → push `{ type: 'POSITION', x, y }` onto that action’s queue.
- **Verdict:** No change. Already migrated to the per-sprite action queue.

### START_MOVEMENT — **queue consumer, not queued**

- **When it runs:** MOVE n runs after DEF MOVE and optionally after POSITION. It is the command that causes the main thread to add a movement state and (on next render) create the Konva node.
- **Current behavior:** Reads that action’s queue for the last POSITION to get startX/startY, then clears the queue. Creates movement state; node is created when Screen renders.
- **Verdict:** No migration. START_MOVEMENT is the consumer of the queue; it does not need to be queued itself.

### STOP_MOVEMENT (CUT) — **no queue**

- **When it runs:** CUT n runs after MOVE n has been executed, so the movement state and Konva node exist.
- **Current behavior:** Marks movement as inactive; position stays in Konva node. Does not touch spriteActionQueues.
- **Verdict:** No migration. Always operates on an existing movement/node.

### ERASE_MOVEMENT (ERA) — **queue cleanup only**

- **When it runs:** ERA n can run even if MOVE n was never executed (e.g. DEF MOVE 0 … ERA 0). So there may be no movement state and no node, but there may be a queued POSITION.
- **Current behavior:** Removes movement state for the given action numbers and **deletes those actions’ queues** (`spriteActionQueues.value.delete(actionNumber)`).
- **Verdict:** No migration. ERA correctly clears the queue for erased actions; no need to queue ERA itself.

### UPDATE_MOVEMENT_POSITION — **no queue**

- **When it runs:** Sent from the main-thread animation loop (via worker) when a sprite’s position/remaining distance is updated. The node and movement state always exist.
- **Current behavior:** Updates `remainingDistance` for the movement state.
- **Verdict:** No migration. Always operates on an existing movement.

## Summary

| Command | Needs queue migration? | Notes |
|---------|-------------------------|--------|
| SET_POSITION | No (already done) | Only command that can run before node exists; already uses queue when node missing. |
| START_MOVEMENT | No | Consumes queue for start position; does not need to be queued. |
| STOP_MOVEMENT | No | Always runs after MOVE; node exists. |
| ERASE_MOVEMENT | No | Clears queue for erased actions; no queuing of ERA. |
| UPDATE_MOVEMENT_POSITION | No | Only runs when movement is active; node exists. |

**Conclusion:** No further animation commands need to be migrated to the queue. The only command that can semantically run before the Konva sprite node exists is POSITION → SET_POSITION, and it is already handled via the per-sprite action queue. The queue is consumed when START_MOVEMENT is handled and cleared when ERASE_MOVEMENT is handled.

## Future extensions

If new animation-related commands are added that can run **before** the first MOVE for that action (e.g. “set visibility” or “set character” for a slot before the sprite is created), they should be added as new `PendingSpriteAction` variants and pushed onto the same per-sprite queue, then applied when START_MOVEMENT is handled (or when the node is first created).
