# Phase 6.1 Performance Plan: PRINT vs Moving Sprites

**Date**: 2026-01-28  
**Status**: ✅ **Implemented** — dirty background (4.1), prioritization (4.2), and buffer-only render (4.3) are in place. Optional 4.4/4.5 not implemented.  
**Context**: Manual UI test shows moving sprites stick momentarily when a big PRINT runs. This plan goes deep into 6.1 (Performance Optimization) to fix main-thread contention between background redraws and the sprite animation loop.

---

## 1. Symptom and Root Cause

### Symptom
- While sprites are moving (MOVE command active), executing a **large PRINT** (many characters or many PRINTs in quick succession) causes sprites to **stick or stutter** for a moment.
- Animation resumes normally after the hitch.

### Root Cause: Main-Thread Contention

Both the **static render** (triggered by PRINT/screenBuffer change) and the **sprite animation loop** run on the main thread and share the same `requestAnimationFrame` queue.

**Current flow when PRINT runs:**

1. **Worker**: PRINT executor updates screen buffer and sends SCREEN_UPDATE (or buffer is synced); main thread `screenBuffer` is updated.
2. **Main**: Deep watch on `props.screenBuffer` fires → `scheduleRender()`.
3. **Main**: Next rAF runs `executeRender()` → `render()`:
   - `renderAllScreenLayers()`:
     - **Backdrop** (light).
     - **Back sprites**: `renderSpriteLayer()` — **destroyChildren()**, rebuild all back sprites (async image creation), **layer.add()**, **layer.draw()**.
     - **Background**: `renderBackgroundLayer()` → **updateBackgroundLayer()**:
       - **layer.clearCache()**, **layer.destroyChildren()**
       - **createBackgroundKonvaImages(buffer, palette)** — creates **672 Konva.Image** nodes (28×24 cells), each with tile lookup/cache get and `new Konva.Image(...)`.
       - **layer.add(...konvaImages)**, **layer.draw()**.
     - **Front sprites**: same as back — full destroy + rebuild.
4. That single rAF callback can take **tens of milliseconds** (672 background cells + two full sprite layer rebuilds). The **animation loop** is a separate rAF chain; when the browser runs the “static render” rAF first, the animation frame is delayed → one or more frames of animation are skipped → **sprites appear to stick**.

**Why “big PRINT” is worse**: One PRINT that changes many cells still triggers **one** full redraw (same code path). The cost is proportional to the **full background size** (672 cells), not the number of changed cells, because we always do a full replace. So any PRINT causes full background + full sprite layer work; “big” PRINT often means the user is watching the hitch more (e.g. scrolling text) or multiple PRINTs in a tight loop causing repeated full redraws.

---

## 2. Current Architecture (Relevant Parts)

| Component | Trigger | What it does | Thread |
|----------|---------|----------------|--------|
| **Render queue** (`useRenderQueue`) | `scheduleRender()` from screenBuffer watch, spriteState watch, movement sync, etc. | One rAF → `executeRender()` → `render()` → full `renderAllScreenLayers()` (backdrop, back sprites, **full background**, front sprites). | Main |
| **Animation loop** (`useScreenAnimationLoop`) | Active movements → `requestAnimationFrame(animationLoop)` each frame | `updateMovements()` (read/write Konva node positions), `updateAnimatedSprites()` (frame + position), position sync to worker, then `requestAnimationFrame(animationLoop)` again. | Main |

- **Shared**: Same main thread; both use rAF. Order of rAF callbacks in a given frame is not guaranteed; if the “static render” rAF runs and takes 30ms, the animation rAF is delayed.
- **Background**: No dirty tracking. **Every** buffer change → **full** `updateBackgroundLayer()` (destroy 672 nodes, create 672 new ones, add, draw).
- **Sprites**: Static render **rebuilds** both sprite layers from scratch (destroyChildren, recreate all static + movement sprites). So a PRINT-induced render also tears down and recreates moving sprite nodes (positions are preserved via `preservedPositions`), adding more work in the same frame.

---

## 3. Plan Overview

Address the hitch by:

1. **Dirty-region background updates** — Only update background **cells that changed**, not the full 28×24. This reduces PRINT cost from O(672) to O(changed cells) per render.
2. **Prioritize animation over full static render** — Run the animation loop’s work **before** doing a heavy full-screen static render in the same frame, or defer the static render so it doesn’t steal the animation frame.
3. **Avoid full sprite layer rebuild on buffer-only changes** — When only `screenBuffer` changed (PRINT), do **not** rebuild sprite layers; only redraw background (or dirty background). Sprite layers can be redrawn (e.g. `layer.draw()`) to composite on top, without destroy/recreate.

Optional (if still needed):

4. **Incremental background update** — If a single “dirty” update still has many cells, spread work across multiple frames (e.g. max N cells per frame).
5. **requestIdleCallback for non-urgent full redraw** — Use idle callback for “full redraw” when there are no active movements, so we don’t block animation.

---

## 4. Detailed Plan

### 4.1 Dirty-Region Background (Primary Win)

**Goal**: On screenBuffer change, only update background **cells that actually changed**, instead of destroying and recreating all 672 nodes.

**Approach**:

- **Dirty set**: Maintain a set of dirty cell keys, e.g. `Set<string>` with keys `"y,x"` (row, col). When we’re about to run a static render due to **screenBuffer** change, compute dirty cells by comparing current buffer to a **last rendered buffer** (copy or snapshot of buffer state at last background render).
- **Alternative**: Have the **worker / message path** send a list of changed (y, x) when it sends buffer updates (if we have that info). Otherwise, on main thread, diff `screenBuffer` vs stored “last background buffer” to get dirty cells.
- **Update path**:
  - If dirty set is **empty** (buffer reference or content equal), skip background update.
  - If dirty set is **small** (e.g. &lt; threshold, or “first time”): only create/update Konva nodes for **dirty cells**. Keep existing background layer structure: either (a) keep a 28×24 grid of Konva.Image refs and only replace images at dirty (y,x), or (b) keep a flat list and update by position.
  - If dirty set is **large** (e.g. &gt; 50% of 672): fall back to **full redraw** (current behavior) to avoid complexity and possible bugs (e.g. missing nodes).
- **Cache**: Continue using `backgroundTileImageCache`; per-cell tile creation remains cached. We only change **how many** cells we touch per render.

**Files**:

- `src/features/ide/composables/useKonvaBackgroundRenderer.ts`
  - Add `updateBackgroundLayerDirty(layer, buffer, lastBuffer, paletteCode)` (or pass dirty set) that:
    - Diffs `buffer` vs `lastBuffer` (or uses provided dirty set) to get dirty (y,x).
    - For each dirty cell: get or create Konva.Image for that cell (reuse existing node if we have a grid ref), set position and image, add to layer if new.
    - If dirty count &gt; threshold, call existing `updateBackgroundLayer()` (full replace).
  - Optionally add `createBackgroundKonvaImagesForCells(buffer, paletteCode, cells: {y,x}[])` to create only specified cells.
- **Caller** (`useKonvaScreenRenderer.ts` → `renderBackgroundLayer`): Pass current buffer and “last rendered buffer” (or dirty set). Store “last rendered buffer” in Screen.vue or in a composable (e.g. ref holding a deep copy or snapshot of buffer at last background render).

**Data flow**:

- Screen (or composable) holds `lastBackgroundBufferRef` (e.g. `Ref<ScreenCell[][] | null>`). Before calling `renderAllScreenLayers`, compute dirty cells by comparing `props.screenBuffer` with `lastBackgroundBufferRef.value`. After successful background render, set `lastBackgroundBufferRef.value = deepCopy(props.screenBuffer)` (or equivalent). Pass dirty set (or both buffers) into `renderBackgroundLayer` so it can call `updateBackgroundLayerDirty` when appropriate.

**Edge cases**:

- First render: no “last buffer” → full redraw (current behavior).
- Palette or global change (e.g. CGSET): treat as full dirty and do full redraw.
- CLS / full buffer replace: full redraw.

**Acceptance**:

- Single-line PRINT (e.g. 28 chars) only updates ~28 cells (one row) or the actual changed range; no 672-node destroy/create.
- Manual test: big PRINT while sprites move → no visible stick (or clearly reduced).

---

### 4.2 Prioritize Animation Over Full Static Render

**Goal**: In frames where both “static render” and “animation step” are pending, run **animation first** so sprite positions advance every frame; then do static render so it doesn’t delay the animation callback.

**Approach A – Same frame, animation first**  
Use a **single** rAF loop that:

1. Runs **animation step** first (update positions, update animated sprites, sync to worker).
2. Then, if a static render is **pending** (e.g. screenBuffer or sprite state changed), runs **render()** in the same frame.

So static render and animation are serialized in one rAF: animation always runs first; static render runs after, possibly in the same frame. Cost: static render can still take long and push the **next** frame, but we no longer skip an animation step because of a pending static render.

**Implementation sketch**:

- **Option 1**: Move “static render” scheduling into the **animation loop** (or a shared “frame coordinator”). When there are active movements, the only rAF is the animation loop; it checks “pending static render” at the end and calls `render()` before scheduling the next rAF. When there are no active movements, keep using the current render queue for static render.
- **Option 2**: Keep two rAF chains but make the **render queue** schedule its rAF with a **lower** priority: e.g. run animation rAF first by scheduling it immediately, and schedule the render queue’s rAF with a one-frame delay (or use `requestAnimationFrame` in a way that runs after the animation frame). This is fragile (rAF order is not guaranteed).
- **Recommended**: Option 1 — when `hasActiveMovements`, the animation loop owns the frame and at the end of the frame calls `render()` if `pendingStaticRender` is set; clear the flag. The render queue’s `scheduleRender()` only sets `pendingStaticRender` when there are active movements; when there are none, it keeps using rAF as today.

**Files**:

- `src/features/ide/composables/useScreenAnimationLoop.ts`: Accept an optional “pending static render” flag and callback; at end of each animation frame, if flag is set, call render callback and clear flag, then schedule next rAF.
- `src/features/ide/composables/useRenderQueue.ts`: When scheduling, if “animation is active” (need a way to know, e.g. callback or ref), set pending static render instead of scheduling own rAF.
- `src/features/ide/components/Screen.vue`: Wire the two: pass “pending render” state and “run render” into animation loop; render queue checks “has active movements” and either sets pending or schedules rAF as now.

**Acceptance**:

- With dirty background (4.1), static render is lighter; with prioritization, animation step always runs first in the frame. Combined: no visible stick during big PRINT.

---

### 4.3 No Full Sprite Rebuild on Buffer-Only Change

**Goal**: When the **only** change is `screenBuffer` (PRINT), do **not** destroy and recreate sprite layers. Only update the **background** layer (full or dirty). Sprite layers stay as-is; we just run `layer.draw()` so they’re composited (or skip redraw if nothing changed).

**Rationale**: Rebuilding both sprite layers (destroyChildren, recreate all static + movement sprites) is expensive and unnecessary when only the background changed. Moving sprites are already updated by the animation loop; static sprites don’t change. So for “buffer-only” render we only need to redraw the background (with dirty or full) and then redraw the stage (or sprite layers) so the existing nodes are composited.

**Approach**:

- Differentiate “render reason”: e.g. `bufferOnly` vs `full`.
  - When watch fires only for `screenBuffer` (no sprite state / movement sync / palette change), set reason to `bufferOnly`.
- In `renderAllScreenLayers` (or in Screen.vue before calling it): if `bufferOnly`, call only **background** update (dirty or full) and then **stage.batchDraw()** or redraw only background + one draw of sprite layers. Do **not** call `renderSpriteLayer` for back/front (so no destroy/recreate of sprite nodes).

**Edge cases**:

- First paint: must run full render (all layers).
- After CUT/ERA or POSITION/SPRITE: need full sprite layer update; don’t treat as bufferOnly.

**Files**:

- `src/features/ide/composables/useKonvaScreenRenderer.ts`: Add a parameter or mode to `renderAllScreenLayers` like `backgroundOnly?: boolean`. When true, only run background update (and optionally backdrop); skip `renderSpriteLayer` for back and front; then call `layer.draw()` only for layers that were updated (background + maybe backdrop).
- `src/features/ide/components/Screen.vue`: In the screenBuffer watch, pass `backgroundOnly: true` when we know only buffer changed (e.g. a ref “lastRenderReason” or explicit “buffer-only” schedule). Other watchers (sprite state, movement sync, palette) pass `backgroundOnly: false`.

**Acceptance**:

- PRINT-only update does not tear down or recreate any sprite nodes; only background (and optionally backdrop) is updated. Animation loop keeps updating the same Konva sprite nodes. Reduces work and avoids any flicker from sprite rebuild.

---

### 4.4 Optional: Incremental Background Update

If a single “dirty” update still has many cells (e.g. 200+), we can cap work per frame: update at most K cells (e.g. 64) per frame, push the rest to the next frame, and keep the animation loop running. This avoids one huge spike. Implement only if 4.1 + 4.2 + 4.3 still show hitches on very large PRINTs.

---

### 4.5 Optional: requestIdleCallback for Full Redraw

When there are **no** active movements, a full redraw (e.g. after CLS or palette change) could be scheduled with `requestIdleCallback` so we don’t block the next rAF. When there **are** active movements, we don’t use idle (we want deterministic ordering with animation). Use only if needed.

---

## 5. Implementation Order

| Step | Task | Dependency | Est. |
|------|------|------------|------|
| 1 | **4.1 Dirty background** – Add dirty set computation (buffer diff), `updateBackgroundLayerDirty`, and “last buffer” in Screen/composable; wire into `renderBackgroundLayer`. | None | 1 day |
| 2 | **4.3 Buffer-only render** – Add `backgroundOnly` (or equivalent) to `renderAllScreenLayers`; screenBuffer watch schedules buffer-only render so sprite layers are not rebuilt. | None (can parallel with 1) | 0.5 day |
| 3 | **4.2 Prioritization** – Animation loop runs first; static render runs after in same frame when movements are active; render queue defers to “pending render” when animation is active. | 1, 2 | 0.5 day |
| 4 | Manual test: big PRINT while sprites move; verify no stick. Tune dirty threshold and edge cases. | 1–3 | 0.5 day |
| 5 | (Optional) 4.4 Incremental dirty update if needed. | 1–3 | 0.5 day |

**Total (core)**: ~2.5 days. Optional 4.4/4.5 add 0.5–1 day if needed.

---

## 6. Files to Touch (Summary)

| File | Change |
|------|--------|
| `useKonvaBackgroundRenderer.ts` | Add dirty diff and `updateBackgroundLayerDirty` (or update-only path); optionally `createBackgroundKonvaImagesForCells`. |
| `useKonvaScreenRenderer.ts` | Support “background only” mode; pass dirty set or last buffer into background render. |
| `Screen.vue` (or small composable) | Hold “last background buffer”; compute dirty set; pass to render; schedule “buffer-only” vs “full” render. |
| `useScreenAnimationLoop.ts` | Accept “pending static render” flag/callback; run render at end of frame when movements active. |
| `useRenderQueue.ts` | When “animation active”, set pending static render instead of scheduling own rAF (needs hook to know “animation active”). |

---

## 7. Success Criteria

- **Primary**: Manual test – run program with moving sprites and repeated or large PRINT; sprites do **not** visibly stick or stutter.
- **Secondary**: Dirty background: single-line PRINT only updates that row’s cells (or changed range), not 672 cells.
- **Secondary**: Buffer-only updates do not rebuild sprite layers (no destroyChildren on sprite layers for PRINT-only).
- No regression: static sprite and movement behavior unchanged; CUT/ERA/POSITION/SPRITE still trigger correct full updates when needed.

---

## 8. References

- `docs/planning/sprite-animation-implementation-plan.md` – Phase 6.1 scope.
- `src/features/ide/composables/useRenderQueue.ts` – Current render scheduling.
- `src/features/ide/composables/useScreenAnimationLoop.ts` – Animation loop.
- `src/features/ide/composables/useKonvaBackgroundRenderer.ts` – Full background replace (672 cells).
- `src/features/ide/composables/useKonvaScreenRenderer.ts` – `renderAllScreenLayers`, `renderBackgroundLayer`.
