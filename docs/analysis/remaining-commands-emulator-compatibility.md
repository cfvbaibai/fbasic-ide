# Remaining F-BASIC Commands: Emulator Compatibility Review

**Date**: 2026-01-29  
**Purpose**: Assess whether the F-BASIC commands listed in the Remaining Work Plan are compatible with the current web-based emulator architecture.

**Source**: [Remaining Work Plan](../planning/remaining-work-plan.md)

---

## Summary

| Command | Compatible? | Notes |
|---------|-------------|--------|
| **VIEW** | Partially | Needs BG GRAPHIC buffer + device method; no buffer today |
| **INPUT** | Yes (with new work) | Needs async input flow + device API + IDE UI |
| **LINPUT** | Yes (with new work) | Same as INPUT |
| **STOP** | Yes | Needs `stoppedAtStatementIndex` (or similar) in ExecutionContext |
| **CONT** | Yes | Resume from STOP; depends on STOP state |
| **SWAP** | Yes | Pure variable swap; VariableService already has get/set |
| **CLEAR** | Yes | VariableService has `clearVariables()` and `clearArrays()` |
| **POKE** | Yes (limited) | Implement as no-op or limited emulated memory; plan already recommends no-op |

---

## 1. Phase 2: Screen Commands — VIEW

**F-BASIC semantics** (manual p.79): VIEW copies the BG GRAPHIC screen (28×21) to the background screen (28×24). The BG GRAPHIC screen is edited in CGEN mode; VIEW does not take arguments.

**Current emulator**:

- **Background screen**: Single `screenBuffer` in `ScreenStateManager` (28×24), used for PRINT/LOCATE/COLOR/CLS.
- **Backdrop**: Implemented (32×30, `setBackdropColor()`).
- **CGEN**: Only mode value (0–3) is stored in `ScreenStateManager`; there is **no separate BG GRAPHIC buffer**.
- **Constants**: `SCREEN_DIMENSIONS.BG_GRAPHIC` (28×21) exists in `src/core/constants.ts`.

**Compatibility**: **Partially compatible.**

- To implement VIEW correctly we need:
  1. A **BG GRAPHIC buffer** (28×21 cells, same shape as background cells) in the device/screen layer.
  2. A **device method** e.g. `copyBgGraphicToBackground()` that copies that buffer into the existing background `screenBuffer` (e.g. copy 28×21 into the top 28×21 of the 28×24 buffer).
  3. Optional: CGEN mode editing could write to this BG GRAPHIC buffer (current CGEN only sets mode; no editing UI in core).
- The existing screen pipeline (buffer → messages → main thread → Konva) can display the result after the copy; no change required there.

**Recommendation**: Add `bgGraphicBuffer` (and optional CGEN editing semantics) when implementing VIEW; document that VIEW is “not yet implemented” until that buffer and copy step exist.

---

## 2. Phase 3: Input Commands — INPUT, LINPUT

**F-BASIC semantics** (manual p.60–61): INPUT/LINPUT are **blocking**: show prompt (or `?`), wait for user to type and press Enter, then assign to variable(s). INPUT supports multiple variables and comma-separated input; LINPUT is for a single string (allows commas in input).

**Current emulator**:

- **Device adapter** (`BasicDeviceAdapter`): No input methods. Only joystick (STICK/STRIG), text output (printOutput, clearScreen, setCursorPosition, etc.), and animation.
- **Execution**: Runs in a **web worker** (`WebWorkerInterpreter`). Main thread communicates via `postMessage`; worker sends SCREEN_UPDATE, RESULT, etc.; main thread sends RUN, STOP, etc. There is **no “request input” / “send input value”** message flow.
- **Execution loop**: In `ExecutionEngine.execute()`, `await this.statementRouter.executeStatement(expandedStatement)` is already async (e.g. PAUSE uses `setTimeout`). So an executor can `await` a Promise that resolves when the main thread sends the user’s input.

**Compatibility**: **Compatible**, but requires new pieces:

1. **Device adapter**: Add an async (or callback-based) API, e.g.  
   `requestInput(prompt: string, options?: { isLinput?: boolean }): Promise<string>`  
   so that INPUT/LINPUT executors can await user input.
2. **Worker ↔ main thread**: New message types, e.g.  
   - Worker → main: `REQUEST_INPUT` (prompt, variable count for INPUT, or LINPUT flag).  
   - Main → worker: `INPUT_VALUE` (string or array of strings) to resolve the request.
3. **Worker run loop**: When the worker sends `REQUEST_INPUT`, it must not advance to the next statement until it receives `INPUT_VALUE` (or cancel). The Promise in the executor can be resolved by the worker’s message handler that receives `INPUT_VALUE`.
4. **IDE**: Input UI (modal or inline) that shows the prompt, collects input, and posts `INPUT_VALUE` (and handles RUN/STOP so execution can be cancelled while waiting).

**Recommendation**: Design the request/response message contract and device API first; then implement InputExecutor/LinputExecutor and IDE UI. Same pattern supports both INPUT and LINPUT.

---

## 3. Phase 4: Program Control — STOP, CONT

**F-BASIC semantics**: STOP halts execution but allows later resuming with CONT from the same statement. CONT is only valid after a STOP.

**Current emulator**:

- **ExecutionContext**: Has `isRunning`, `shouldStop`, `currentStatementIndex`, `nextStatement()`. No “stopped for CONT” state.
- **ExecutionEngine**: `shouldContinue()` is true when `isRunning && !shouldStop && ...`. When STOP is used (instead of END), we must stop the loop **without** clearing “current statement”; CONT would then resume from that index.
- **ExecutionEngine.stop()**: Sets `shouldStop = true` and `isRunning = false` (user Stop button). This is distinct from “STOP command”: user Stop discards state; STOP command should preserve it for CONT.

**Compatibility**: **Compatible.**

- Add to ExecutionContext something like:  
  `stoppedAtStatementIndex: number | null` (and optionally `isStoppedByStopCommand: boolean` if we want to distinguish STOP from END/error).
- **StopExecutor**: Set `isRunning = false`, set `stoppedAtStatementIndex = currentStatementIndex`, do **not** call `nextStatement()`. Optionally set a flag so the IDE can show “Stopped (CONT to continue)”.
- **ExecutionEngine**: When the loop exits because `!shouldContinue()`, if `stoppedAtStatementIndex !== null`, treat as “paused by STOP” (do not reset that index on normal reset).
- **ContExecutor** (or CONT handling): Only valid when `stoppedAtStatementIndex !== null`. Set `isRunning = true`, clear `stoppedAtStatementIndex`, and run the loop again starting from that index (no need to re-parse; just resume loop).
- **User Stop button**: Can set `shouldStop = true` and clear `stoppedAtStatementIndex` so CONT is not allowed after a user stop.

**Recommendation**: Implement STOP first (state + executor), then CONT (resume from saved index). Expose “STOP’d and can CONT” in the IDE so CONT is only enabled when appropriate.

---

## 4. Phase 4: SWAP, CLEAR

**SWAP**: Swap the values of two variables (e.g. `SWAP A, B`).  
**CLEAR**: Clear all variables (and optionally reset other state; manual p.55).

**Current emulator**:

- **VariableService**: `getVariable(name)`, `setVariable(name, value)`, `clearVariables()`, `clearArrays()`. No SWAP method, but SWAP is just: get A, get B; set A := B, set B := A (with type handling). No new API required.
- **ExecutionContext**: `variables`, `arrays`; reset() clears them. CLEAR can call `variableService.clearVariables()` and `variableService.clearArrays()` (and optionally reset DATA index, etc., per manual).

**Compatibility**: **Fully compatible.** No device or worker changes; only new executors and parser/route.

---

## 5. Phase 4: POKE

**F-BASIC semantics** (manual p.69): POKE address, value — write a byte to a memory address. On the real hardware this touches CPU memory map.

**Current emulator**: No memory map or emulated RAM. Web environment has no direct memory access.

**Compatibility**: **Compatible in a limited sense.**

- As in the plan: implement as **no-op** (ignore POKE), or optionally maintain a small **emulated memory map** for addresses that F-BASIC programs use (e.g. specific zero-page or I/O addresses) and have PEEK/POKE read/write that map only. No device adapter needed for no-op; for emulated map, keep it inside the interpreter/worker.

**Recommendation**: Start with no-op; add a minimal emulated memory only if specific titles require it.

---

## 6. Implementation Order (Compatibility-Based)

1. **SWAP, CLEAR** — No architectural changes; good first step.
2. **STOP, CONT** — Small ExecutionContext + ExecutionEngine changes; no device/UI.
3. **VIEW** — Add BG GRAPHIC buffer and `copyBgGraphicToBackground()` (and optional CGEN editing path).
4. **INPUT, LINPUT** — New device API, worker↔main messages, and IDE input UI.
5. **POKE** — No-op (or later, minimal emulated memory).

---

## References

- [Remaining Work Plan](../planning/remaining-work-plan.md)
- [F-BASIC Reference Skill](../../.claude/skills/fbasic-reference/SKILL.md)
- Manual: p.36 (screen process), p.55 (CLEAR), p.60–61 (INPUT, LINPUT), p.66 (STOP), p.67 (SWAP), p.69 (POKE), p.79 (VIEW)
- Code: `ExecutionContext`, `ExecutionEngine`, `StatementRouter`, `BasicDeviceAdapter`, `VariableService`, `ScreenStateManager`, `useBasicIdeMessageHandlers.ts`

---

**Changelog**: See `docs/diary/` (files `yyyy-MM-dd.txt` by date).
