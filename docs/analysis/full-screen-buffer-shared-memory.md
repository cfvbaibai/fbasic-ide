# Full Screen Buffer in Shared Memory — Rendering Logic and Performance

**Date**: 2026-01-28  
**Scope**: If the full screen buffer (28×24 cells, cursor) is moved into shared memory, how would background rendering change, and would it be much faster?

---

## 1. Current flow (summary)

| Step | Where | What happens |
|------|--------|----------------|
| 1 | Worker | `ScreenStateManager` holds `screenBuffer` (28×24 `ScreenCell[][]`). On PRINT: `writeCharacter` → `scheduleScreenUpdate()` (FPS-batched). On flush: `createFullScreenUpdateMessage()` → `postMessage(SCREEN_UPDATE)` with full `screenBuffer`. Clear/cursor/color send immediate SCREEN_UPDATE. |
| 2 | Main | Handler receives SCREEN_UPDATE. For `full`: `context.screenBuffer.value = update.screenBuffer`. For `clear`/`character`/`color`/`cursor`: mutate refs. Vue reactivity: deep watch on `screenBuffer` → `scheduleRender()`. |
| 3 | Screen.vue | `render()` uses `props.screenBuffer`. If buffer-only update: `renderBackgroundLayer(..., lastBackgroundBuffer, backgroundNodeGridRef)` → **dirty path** (`computeDirtyCells` → update only changed Konva nodes). Else: **full path** (`updateBackgroundLayer`: destroyChildren, create 672 Konva images, add, draw). |
| 4 | useKonvaBackgroundRenderer | Full: `createBackgroundKonvaImages(buffer, paletteCode)` — 672× `createBackgroundTileImage(character, colorPattern, paletteCode)` (cached). Dirty: `computeDirtyCells(buffer, lastBuffer)` then for each dirty cell same tile creation + `node.image()` / add. |

So today: **buffer lives in Vue refs**, arrives via **postMessage**, and the **same Konva pipeline** (full or dirty) runs on that buffer.

---

## 2. Shared-memory layout for full screen buffer

- **Cell data**: 28×24 = 672 cells. Per cell: character code (0–255, 1 byte), colorPattern (0–3, 1 byte).  
  → **1344 bytes** (e.g. `Uint8Array`: 672 chars, 672 patterns).
- **Cursor**: 2 bytes (cursorX, cursorY).
- **Optional**: sequence number (4 bytes) so main can skip full read when nothing changed.
- **Total**: e.g. 1344 + 2 + 4 = **1350 bytes** in a `SharedArrayBuffer` (or separate from the existing animation buffer).

Worker: on every change to the screen (writeCharacter, setColorPattern, initializeScreen, setCursorPosition), write into this shared view and optionally increment the sequence number. No SCREEN_UPDATE payload for full/character/color/cursor (or only a lightweight “screen changed” message).

Main: **no longer** stores the screen grid in Vue refs for rendering; it **reads** from the shared buffer when it’s about to render.

---

## 3. How background rendering logic would change

### 3.1 Data source

- **Today**: Render path receives `buffer: ScreenCell[][]` from props (Vue refs).
- **With shared memory**: Render path receives either:
  - **Option A**: A **decoded** buffer — main reads the shared view (1344 bytes), decodes into a `ScreenCell[][]` (or a flat array of `{ character, colorPattern }`), then passes that into the **existing** `renderBackgroundLayer` / `createBackgroundKonvaImages` / `updateBackgroundLayerDirty`. So the rest of the pipeline stays the same; only the source of the buffer changes.
  - **Option B**: The **raw view** — new helpers that take `Uint8Array charCodes, Uint8Array colorPatterns` (or one packed view) and do full/dirty Konva updates without ever building `ScreenCell[][]`. Dirty detection would compare current shared bytes with a “last” copy (1344 bytes) and only update changed cells.

So the **logic** (full vs dirty, which cells to redraw, tile cache, Konva node create/update) stays the same; the **input** changes from “Vue ref holding a 28×24 array of objects” to “shared TypedArray(s) decoded or used directly.”

### 3.2 When to re-render (trigger)

- **Today**: Worker sends SCREEN_UPDATE → handler updates refs → Vue watch → `scheduleRender()`.
- **With shared memory** you still need a trigger:
  - **Option 1**: Worker sends a **lightweight** message (e.g. `SCREEN_CHANGED` with no payload) when it writes to the shared buffer; main runs `scheduleRender()` on that. Render then reads from shared memory.
  - **Option 2**: Main **polls** every frame (e.g. in the animation loop): read a **sequence number** from shared memory; if it changed, read the 1344 bytes and run the same full/dirty render. Avoids extra messages but adds one read per frame (cheap if it’s a single Int32).

So rendering **still** runs in the same place (scheduled render callback); the only change is that inside that callback the buffer comes from shared memory (decoded or raw) instead of from props.

### 3.3 Dirty detection with shared memory

- **Today**: `computeDirtyCells(buffer, lastBuffer)` with two `ScreenCell[][]` references.
- **With shared memory**:
  - **Option A (decode to buffer)**: Main keeps a “last” copy — either the last decoded `ScreenCell[][]` or the last 1344 bytes. Each render: read shared view → decode to buffer (or compare raw bytes) → if using decoded buffer, same `computeDirtyCells(currentBuffer, lastBuffer)`; then update last.
  - **Option B (raw bytes)**: Keep `lastBytes` (1344 bytes). Each render: read 1344 bytes from shared view; compare with `lastBytes`; build the set of dirty (y,x); update only those Konva nodes; copy current to `lastBytes`.

So dirty detection stays conceptually the same (current vs last); only the representation of “current” and “last” can be TypedArrays instead of `ScreenCell[][]`.

### 3.4 Code touch points (high level)

| Component | Current | With shared screen buffer |
|-----------|--------|----------------------------|
| Worker `ScreenStateManager` / adapter | Update in-memory buffer + postMessage(SCREEN_UPDATE) | Update in-memory buffer **and** write to shared view (+ optional sequence); optionally send SCREEN_CHANGED only. |
| Main message handler | Set `context.screenBuffer.value = update.screenBuffer` (and cursor, etc.) for full/clear/character/color | For full/character/color/cursor: do **not** update refs (or only set a “dirty” flag). Still handle clear/cursor for any non-shared fallback. |
| Screen.vue / composable that calls render | Pass `props.screenBuffer` into `renderAllScreenLayers` | Either: (1) read shared view → decode to buffer → pass that into `renderAllScreenLayers`, or (2) pass shared view (or decoded flat structure) into a new overload / helper that drives the same full/dirty Konva path. |
| useKonvaBackgroundRenderer | `createBackgroundKonvaImages(buffer, paletteCode)`, `computeDirtyCells(buffer, lastBuffer)`, `updateBackgroundLayerDirty(..., buffer, lastBuffer, ...)` | **Option A**: Same signatures; caller passes a buffer decoded from shared memory. **Option B**: Add variants that take `(charCodes, colorPatterns)` and optionally a `lastCharCodes`/`lastColorPatterns` for dirty; internally same tile creation and node update. |
| Vue refs | `screenBuffer`, `cursorX`, `cursorY` drive props and watch | Can be removed for the “shared” path and only used when SharedArrayBuffer is unavailable; or kept and updated from shared memory in the render path so existing Screen props still work. |

So: **background rendering logic** (full vs dirty, tile cache, Konva layer updates) does **not** need to change in a fundamental way; the **source** of the buffer and the **trigger** for render change. Option A (decode shared → existing API) keeps almost all of `useKonvaBackgroundRenderer` and `useKonvaScreenRenderer` unchanged.

---

## 4. Will it be much faster?

### What gets faster

| Item | Effect |
|------|--------|
| **No structured clone of screen buffer** | Worker no longer sends 28×24 array of objects; main no longer deserializes it. Saves allocations and copy cost. |
| **No Vue reactivity on the grid** | No deep watch on a 672-element structure; no reactive proxy overhead for that ref. |
| **Fewer/smaller messages** | Either no SCREEN_UPDATE payload for full/character/color/cursor, or a tiny “screen changed” message. Less work in the message handler and less GC. |

So: **message handling and Vue overhead** for the screen buffer can drop a lot.

### What stays the same (or similar)

| Item | Effect |
|------|--------|
| **Konva work per frame** | We still do full or dirty update: 672 or N tile lookups, 672 or N Konva node create/update, `layer.draw()`. Tile images are cached; the dominant cost is still Konva/canvas, not the buffer format. |
| **Dirty computation** | We still compare “current” vs “last” over 672 cells (or 1344 bytes). Same O(672) work, possibly with a tighter loop (bytes vs objects). |
| **Decode cost (Option A)** | If we decode shared → `ScreenCell[][]` each render, we add 672 small allocations (or a pool). Option B (raw view) avoids that but needs a small amount of extra logic in the renderer. |

So: **raw rendering cost** (Konva + cache) is **unchanged**; we only change how the main thread **gets** the buffer.

### When it would be “much” faster

- **Much faster overall** if the app is **bottlenecked** on:
  - postMessage volume/size for screen updates, or
  - Vue reactivity (deep watch, proxy) on the screen buffer.
- **Only somewhat faster** (or smoother) if the bottleneck is:
  - Konva/canvas drawing,
  - or if screen updates are already infrequent and batched (e.g. one full update per 1–2 frames).

### Conclusion on speed

- **Yes, it can be noticeably faster** where today we pay a lot for structured clone and Vue reactivity on a large screen ref.
- **No, it will not make the Konva/canvas pipeline “much” faster** — that part is the same. So “much faster” applies to the **end-to-end** only when message + reactivity were the main cost; otherwise expect **meaningful but not dramatic** gains and a simpler, more predictable data path.

### Maintainability and extensibility

- **Maintainability**: Slightly **worse** — shared layout (byte indices, sequence number) must stay in sync between worker and main; decoding/encoding is another surface to keep correct. Documenting the layout and keeping it in one place (e.g. `sharedScreenBuffer.ts`) helps.
- **Extensibility**: **Neutral to slightly better** — adding more screen-related fields (e.g. scroll, attributes) means extending the shared layout and decode; no new message types or Vue refs. One shared “display state” block (sprites + scalars + screen grid) keeps extension in a single place.

---

## 5. Decided approach

- **Single SharedArrayBuffer**: Full screen buffer (28×24 cells, cursor) **and** other background state (palette, backdrop, cgen) live in one SharedArrayBuffer. **No fallback path** — app requires cross-origin isolation (SharedArrayBuffer only).
- **Rendering logic**: **Option A** — main reads shared buffer → decode to `ScreenCell[][]` → pass into existing `renderBackgroundLayer` / dirty path. No changes to `useKonvaBackgroundRenderer` / `useKonvaScreenRenderer` signatures.
- **Trigger**: **Sequence number in shared memory** + **lightweight `SCREEN_CHANGED` message**. Worker increments sequence when it writes; sends `SCREEN_CHANGED` (no payload); main on receipt schedules render and, in render, reads sequence (and only reads full buffer when sequence changed).

---

## 6. References

- `src/features/ide/composables/useKonvaBackgroundRenderer.ts` — full/dirty background render, tile cache, `computeDirtyCells`, `createBackgroundKonvaImages`.
- `src/features/ide/composables/useKonvaScreenRenderer.ts` — `renderBackgroundLayer`, `renderAllScreenLayers`.
- `src/features/ide/components/Screen.vue` — watch on `screenBuffer`, `render()`, `lastBackgroundBufferRef`, `backgroundNodeGridRef`.
- `src/core/devices/ScreenStateManager.ts` — worker screen buffer and `createFullScreenUpdateMessage` / batching.
- `docs/analysis/background-state-shared-buffer-analysis.md` — scalar background state (palette, backdrop, cgen) in shared buffer.
