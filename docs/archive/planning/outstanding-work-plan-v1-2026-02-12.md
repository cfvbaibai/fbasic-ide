# Outstanding Work Plan V1 (Archived)

**Archived**: 2026-02-12
**Status**: Superseded by new roadmap

This file tracked remaining F-BASIC commands. See the new roadmap for current planning.

---

## Original Content

# Outstanding Work Plan

**Status**: Active
**Purpose**: Not-done-yet work for the Family Basic IDE project (completed work removed)

---

## 1. F-BASIC Commands — Remaining

### 1.1 STOP (Stop Execution)

- [ ] Add `STOP` token to parser (`parser-tokens.ts`)
- [ ] Add `stopStatement` rule to parser (`FBasicChevrotainParser.ts`)
- [ ] Create `StopExecutor.ts` — implement stop with resume capability (CONT)
- [ ] Register in `StatementRouter.ts`
- [ ] Add tests (`test/executors/StopExecutor.test.ts`)

**Reference**: `docs/reference/family-basic-manual/page-66.md`

### 1.2 CONT (Continue After STOP)

- [ ] Add `CONT` token to parser
- [ ] Add `contStatement` rule
- [ ] Create `ContExecutor.ts` — implement continue functionality
- [ ] Register in `StatementRouter.ts`
- [ ] Add tests (`test/executors/ContExecutor.test.ts`)

**Reference**: Manual (CONT after STOP)

### 1.3 POKE (Memory Write)

- [ ] Add `POKE` token to parser
- [ ] Add `pokeStatement` rule (POKE address, value)
- [ ] Create `PokeExecutor.ts` — implement memory write (no-op or limited in web context)
- [ ] Register in `StatementRouter.ts`
- [ ] Add tests

**Reference**: `docs/reference/family-basic-manual/page-69.md`
**Note**: Web security limits direct memory access; implement as no-op or limited behavior.

### 1.4 PLAY (Sound / Music) — ✅ Complete

- [x] Add `PLAY` token to parser (`parser-tokens.ts`)
- [x] Add `playStatement` rule — `PLAY` string expression (e.g. `PLAY "C:E:G"`, `PLAY A$`)
- [x] Create `PlayExecutor.ts` — pass string to device for playback
- [x] Device adapter: `playSound?(string)` — TestDeviceAdapter (capture), WebWorkerDeviceAdapter (parse + PLAY_SOUND to main)
- [x] Register in `StatementRouter.ts`
- [x] Add tests (`test/executors/PlayExecutor.test.ts`, parser, integration, `test/sound/`)

**Reference**: `docs/reference/family-basic-manual/page-80.md`
**Status**: Implemented with Web Audio API. Parser: F-BASIC length codes 0–9, same-as-previous length. See `docs/planning/play-parser-validation.md`.

---

## 2. VIEW Command — Blocked

VIEW copies the BG GRAPHIC screen (28×21) to the background screen. Deferred until prerequisites exist.

**Prerequisites** (not done):

- [ ] **BG GRAPHIC buffer** — add `bgGraphicBuffer` (28×21) in device/screen layer
- [ ] **Device method** — `copyBgGraphicToBackground()` (or equivalent)
- [ ] **BG GRAPHIC editor or load path** — UI to edit, or load/save, the buffer (on hardware this is CGEN mode)

**After prerequisites**:

- [ ] Add `VIEW` token and `viewStatement` to parser
- [ ] Create `ViewExecutor.ts`
- [ ] Register in `StatementRouter.ts`
- [ ] Add tests

---

## 3. Optional (Only If Needed)

- **Incremental dirty update** — Cap dirty cells per frame (e.g. 64) when a single update has many cells; add only if hitches remain on very large PRINTs.
- **requestIdleCallback for full redraw** — When no active movements, schedule full redraw via requestIdleCallback; use only if needed.

---

## 4. Deferred (Revisit Later)

- **Documentation** — README, user guide, executor docs, architecture diagrams. Not in current scope.

---

## Implementation Pattern (Per Command)

1. Parser: token in `parser-tokens.ts`, statement rule in `FBasicChevrotainParser.ts`
2. Executor: new file in `src/core/execution/executors/`, implement `execute()`, follow existing patterns
3. Router: register in `StatementRouter.ts`
4. Device adapter: add/use methods in `src/core/devices/*.ts` if needed
5. Tests: `test/executors/<Name>Executor.test.ts` — happy path, errors, edge cases
6. JSDoc on executor

**Code standards**: File size limits (500 lines .vue, 500 .ts), no `any`, strict TypeScript.

---

## Suggested Next Step

Implement **STOP** and **CONT** (stop execution with resume). Then optionally **POKE** (no-op or limited in web context). VIEW when BG GRAPHIC buffer and editor (or load path) are planned.

---

## References

- [F-BASIC Reference Skill](../../.claude/skills/fbasic-reference/SKILL.md)
- [Family BASIC Manual](../reference/family-basic-manual/)
- [Remaining Commands – Emulator Compatibility](../analysis/remaining-commands-emulator-compatibility.md)
