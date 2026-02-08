# Remaining Work Plan

**Date**: 2026-01-24  
**Status**: Active  
**Purpose**: Comprehensive plan for completing the Family Basic IDE project

## Executive Summary

This document outlines the remaining work for the Family Basic IDE project. Progress is consolidated here; remaining tasks are:

1. **F-BASIC language** — Remaining commands: STOP, CONT, POKE (SWAP ✅, CLEAR ✅). Screen: VIEW deferred until BG GRAPHIC buffer + editor.
2. **Code quality** — Vue best practices and file-size limits (mostly complete). Testing: per-feature only; no broad coverage push. Documentation: deferred; revisit later.

## Active Todo Folder

**Location**: `todo/` (project root)

The `todo/` folder contains current work items tracked as individual text files. Each file contains:
- `type`: bug, refactor, feature
- `status`: open, resolved, completed
- `subject`: Brief description
- `description`: Full details

**Tech Lead Workflow**: When planning work, ALWAYS check the `todo/` folder first for existing items before creating new tasks.

## Progress Assessment

### ✅ Completed Work

#### i18n Refactoring (100% Complete)
- ✅ Vue I18n installed and configured (`vue-i18n@^11`)
- ✅ Translation files created for all features (en, ja, zh-CN, zh-TW)
- ✅ All components refactored to use `useI18n()`
- ✅ Locale switching implemented with persistence
- ✅ Browser language detection
- ✅ Type-safe translation keys

**Status**: Fully implemented and in use throughout the codebase.

#### Vue Best Practices - Mostly Complete
- ✅ **Provide/Inject Type Safety**: `GameTabs` now uses `InjectionKey` pattern
- ✅ **Strict Template Checking**: `vueCompilerOptions.strictTemplates: true` enabled in `tsconfig.json`
- ✅ **Event Handler Typing**: `IdeControls.vue` uses typed handler functions
- ✅ **Component Names**: `defineOptions({ name: '...' })` added to key components
- ✅ **JSDoc**: Most components have JSDoc documentation
- ✅ **Template Refs Migration**: 6 components migrated to `useTemplateRef` (Vue 3.5+)
- ✅ **Keep-Alive Cleanup**: Added `onDeactivated` cleanup to composables using timers/intervals
- ✅ **Component Type Extraction**: 10 components now have extracted prop/emit types
- ✅ **Enhanced Error Messages**: Improved error messages in stores with context
- ✅ **Props Reactivity Loss**: Fixed `Screen.vue` props reactivity loss by using `toValue()` wrapper

**Status**: Critical and high-priority items completed. Remaining items are low priority.

#### F-BASIC Language - Core Statements Implemented
- ✅ **Control Flow**: PRINT, LET, IF-THEN, FOR-NEXT, GOTO, GOSUB, RETURN, END, ON
- ✅ **Data Management**: DATA, READ, RESTORE, DIM
- ✅ **Program Control**: PAUSE, REM
- ✅ **Screen Control**: CLS, LOCATE, COLOR, CGSET, CGEN
- ✅ **Backdrop Screen**: Full backdrop screen implementation (32×30, infrastructure for PALET B ready)
- ✅ **Functions**: ABS, SGN, RND, VAL, LEN, LEFT$, RIGHT$, MID$, STR$, HEX$, CHR$, ASC
- ✅ **Operators**: Arithmetic, comparison, logical operators
- ✅ **Input Functions**: STICK, STRIG (controller input)

**Status**: Core language features implemented. Screen: PALET B ✅; VIEW deferred (requires BG GRAPHIC storage + editor). Input commands: INPUT ✅, LINPUT ✅.

---

## Remaining Work

### Phase 1: Complete Vue Best Practices (Mostly Complete)

**Estimated Effort**: 1 day remaining  
**Priority**: Low (most critical items completed)

#### 1.1 Component Type Extraction Utilities ✅ COMPLETED
- [x] Create type files for extracted component types
- [x] Extract prop types from 10 key components:
  - GameButton, GameInput, GameSelect, GameTextarea, GameSwitch
  - GameUpload, GameIconButton, GameTag, GameCard, GameBlock
- [x] Extract emit types where applicable
- [x] Export all types from `src/shared/components/ui/index.ts`

**Status**: ✅ Complete - 10 component type files created and exported

#### 1.2 Complete JSDoc Documentation ✅ VERIFIED
- [x] Verified most components have JSDoc documentation
- [x] Components include usage examples where helpful
- [x] JSDoc coverage is good (>80% for shared components)

**Status**: ✅ Verified - Most components already have comprehensive JSDoc

#### 1.3 Advanced Patterns Review ✅ COMPLETED
- [x] Migrated 6 components to `useTemplateRef` (Vue 3.5+ pattern)
- [x] Added `onDeactivated` cleanup to composables using timers/intervals
- [x] Enhanced error messages in stores
- [x] Review CSS v-bind usage for reactivity issues
- [x] Document safe CSS v-bind patterns
- [x] **Fixed props reactivity loss** - Screen.vue props properly wrapped with `toValue()` (2026-01-26)

**Status**: ✅ Complete - All items including CSS v-bind review and props reactivity fixes completed

**Completed Work Summary**:
- ✅ Template refs migrated: MonacoCodeEditor, Screen, CodeEditor, GameSelect, GameUpload
- ✅ Keep-alive cleanup: useJoystickEvents, useBasicIdeEnhanced, GameSelect
- ✅ Type extraction: 10 components with exported types
- ✅ Error messages: useSpriteViewerStore enhanced
- ✅ CSS v-bind review: Reviewed all usage, documented safe patterns, migrated 5 components (GameCard, GameTextarea, GameSelect, GameIcon, ColorBox) from `:style` to CSS v-bind
- ✅ Props reactivity: Fixed Screen.vue onPositionSync prop access to preserve reactivity

---

### Phase 2: Implement Missing F-BASIC Screen Commands (High Priority)

**Estimated Effort**: 1-2 days remaining (COLOR ✅, CGSET ✅, CGEN ✅, Backdrop Screen ✅ completed)  
**Priority**: High (core language features)

#### 2.1 Screen Control Commands

**CLS** (Clear Screen)
- [x] Add `CLS` token to parser (`parser-tokens.ts`)
- [x] Add `clsStatement` rule to parser (`FBasicChevrotainParser.ts`)
- [x] Create `ClsExecutor.ts`
- [x] Implement screen clearing in device adapter (already implemented)
- [x] Add tests for CLS command

**LOCATE** (Cursor Position)
- [x] Add `LOCATE` token to parser
- [x] Add `locateStatement` rule (LOCATE X, Y)
- [x] Create `LocateExecutor.ts`
- [x] Implement cursor positioning in device adapter
- [x] Add tests for LOCATE command
- [x] Add integration tests for LOCATE and PRINT
- [x] Add device adapter tests for cursor positioning

**COLOR** (Color Pattern)
- [x] Add `COLOR` token to parser
- [x] Add `colorStatement` rule (COLOR X, Y, n)
- [x] Create `ColorExecutor.ts`
- [x] Implement color pattern setting in device adapter
- [x] Add tests for COLOR command
- [x] Fix message handler to process 'color' update messages

**CGSET** (Color Palette)
- [x] Add `CGSET` token to parser
- [x] Add `cgsetStatement` rule (CGSET [m][,n])
- [x] Create `CgsetExecutor.ts`
- [x] Implement palette setting in device adapter
- [x] Add tests for CGSET command

**CGEN** (Character Generator)
- [x] Add `CGEN` token to parser
- [x] Add `cgenStatement` rule (CGEN mode)
- [x] Create `CgenExecutor.ts`
- [x] Implement character generator mode in device adapter
- [x] Add tests for CGEN command

**PALET B** (Backdrop Color)
- [x] Add `PALET` token to parser (if not exists)
- [x] Add `paletStatement` rule (PALET {B|S} n, C1, C2, C3, C4)
- [x] Create `PaletExecutor.ts` (handle both PALET B and PALET S)
- [x] Implement backdrop color setting (PALET B 0, colorCode, ...)
- [x] Add tests for PALET B command
- **Note**: Infrastructure already in place (`setBackdropColor()` method exists)

**VIEW** (Display BG GRAPHIC) — **Blocked**
- **Prerequisite**: VIEW copies the BG GRAPHIC screen (28×21) to the background screen. We do **not** have:
  1. **BG GRAPHIC storage** — no `bgGraphicBuffer` (28×21) in device/screen layer yet.
  2. **BG GRAPHIC editor** — no UI for users to edit the BG GRAPHIC screen (on real hardware this is done in CGEN mode).
- VIEW implementation is deferred until BG GRAPHIC buffer and editor (or another way to populate the buffer) exist.
- [ ] Add BG GRAPHIC buffer + device `copyBgGraphicToBackground()` (future)
- [ ] Add BG GRAPHIC editor or load/save path (future)
- [ ] Add `VIEW` token and `viewStatement`, `ViewExecutor.ts`, tests (after above)

**Files to Create**:
- `src/core/execution/executors/ClsExecutor.ts` ✅
- `src/core/execution/executors/LocateExecutor.ts` ✅
- `src/core/execution/executors/ColorExecutor.ts` ✅
- `src/core/execution/executors/CgsetExecutor.ts` ✅
- `src/core/execution/executors/CgenExecutor.ts` ✅
- `src/core/execution/executors/PaletExecutor.ts` (PALET B/S support) ✅
- `src/core/execution/executors/ViewExecutor.ts`

**Test Files Created**:
- `test/executors/LocateExecutor.test.ts` ✅
- `test/integration/LocatePrintIntegration.test.ts` ✅
- `test/devices/WebWorkerDeviceAdapter.test.ts` ✅
- `test/executors/ColorExecutor.test.ts` ✅
- `test/integration/ColorIntegration.test.ts` ✅
- `test/executors/CgsetExecutor.test.ts` ✅
- `test/integration/CgsetIntegration.test.ts` ✅
- `test/executors/CgenExecutor.test.ts` ✅
- `test/executors/PaletExecutor.test.ts` ✅

**Files to Modify**:
- `src/core/parser/parser-tokens.ts` (add tokens)
- `src/core/parser/FBasicChevrotainParser.ts` (add rules)
- `src/core/execution/StatementRouter.ts` (register executors)
- `src/core/devices/*.ts` (implement device methods)

**Reference Documentation**:
- `docs/reference/family-basic-manual/page-70.md` (LOCATE, COLOR)
- `docs/reference/family-basic-manual/page-71.md` (CGEN, CLS)
- `docs/reference/family-basic-manual/page-72.md` (CGSET)
- `docs/reference/family-basic-manual/page-73.md` (PALET B/S)
- `docs/reference/family-basic-manual/page-36.md` (Screen Display Process, Backdrop Screen)
- `.claude/skills/fbasic-reference/references/screen.md`
- `docs/device-models/screen/screen.md` (Screen Specification)
- `docs/analysis/screen-model-manual-comparison.md` (Screen Model Verification)

---

### Phase 3: Implement Input Commands (High Priority)

**Estimated Effort**: 2-3 days  
**Priority**: High (essential for interactive programs)

#### 3.1 INPUT Command ✅ COMPLETED
- [x] Add `INPUT` token to parser
- [x] Add `inputStatement` rule (INPUT ["prompt"] {; variable(, variable, ...)})
- [x] Create `InputExecutor.ts`
- [x] Implement input handling in device adapter (requestInput, REQUEST_INPUT/INPUT_VALUE)
- [x] Add UI for input prompts in IDE (modal with prompt, field, OK/Cancel)
- [x] Add tests for INPUT command

#### 3.2 LINPUT Command ✅ COMPLETED
- [x] Add `LINPUT` token to parser
- [x] Add `linputStatement` rule
- [x] Create `LinputExecutor.ts`
- [x] Implement line input handling (single string variable, allows commas)
- [x] Add tests for LINPUT command

**Files Created**:
- `src/core/execution/executors/InputExecutor.ts` ✅
- `src/core/execution/executors/LinputExecutor.ts` ✅

**Files to Modify**:
- `src/core/parser/parser-tokens.ts`
- `src/core/parser/FBasicChevrotainParser.ts`
- `src/core/execution/StatementRouter.ts`
- `src/features/ide/components/` (add input UI)
- `src/core/devices/*.ts` (implement input handling)

**Reference Documentation**:
- `docs/reference/family-basic-manual/page-60.md` (INPUT, LINPUT)

---

### Phase 4: Implement Additional F-BASIC Commands (Medium Priority)

**Estimated Effort**: 1-2 days remaining (SWAP ✅, CLEAR ✅ done)  
**Priority**: Medium (useful but not critical)

#### 4.1 Program Control Commands

**STOP** (Stop Execution)
- [ ] Add `STOP` token to parser
- [ ] Add `stopStatement` rule
- [ ] Create `StopExecutor.ts`
- [ ] Implement stop with resume capability (CONT)
- [ ] Add tests

**CONT** (Continue After STOP)
- [ ] Add `CONT` token to parser
- [ ] Add `contStatement` rule
- [ ] Create `ContExecutor.ts`
- [ ] Implement continue functionality
- [ ] Add tests

**SWAP** (Swap Variables) ✅ COMPLETED
- [x] Parser, executor, router; variable swapping implemented

**CLEAR** (Clear Variables) ✅ COMPLETED
- [x] Parser, executor, router; variable clearing implemented

**POKE** (Memory Write)
- [ ] Add `POKE` token to parser
- [ ] Add `pokeStatement` rule (POKE address, value)
- [ ] Create `PokeExecutor.ts`
- [ ] Implement memory write (if applicable in web context)
- [ ] Add tests

**Files to Create** (remaining):
- `src/core/execution/executors/StopExecutor.ts`
- `src/core/execution/executors/ContExecutor.ts`
- `src/core/execution/executors/PokeExecutor.ts`

**Reference Documentation**:
- `docs/reference/family-basic-manual/page-55.md` (CLEAR)
- `docs/reference/family-basic-manual/page-66.md` (STOP)
- `docs/reference/family-basic-manual/page-67.md` (SWAP)
- `docs/reference/family-basic-manual/page-69.md` (POKE)

---

### Phase 5: Implement Sprite System ✅ COMPLETE

**Estimated Effort**: 5-10 days (done)
**Priority**: Medium
**Status**: 6/6 phases complete. Sprite implementation plan retired (2026-01-29); details consolidated here.

#### 5.1 Sprite Commands - Progress Tracker
- [x] **Phase 1**: Canvas Infrastructure ✅ (2026-01-25)
  - Multi-layer canvas rendering
  - Sprite tile rendering with caching
  - Priority-based layering system
- [x] **Phase 2**: Static Sprite Rendering ✅ (2026-01-25)
  - DEF SPRITE (define sprite) ✅
  - SPRITE (display sprite) ✅
  - Character set to tile conversion ✅
  - 8×8 and 16×16 sprite support ✅
- [x] **Phase 3**: Basic Animation ✅ (2026-01-25)
  - DEF MOVE (define sprite movement) ✅
  - MOVE (execute sprite movement) ✅
  - Movement calculation and timing ✅
  - Real-time animation commands ✅
- [x] **Phase 4**: Animation Sequences ✅ (2026-01-25)
  - Frame cycling with CHARACTER_SPRITES data ✅
  - Direction-to-sequence mapping ✅
  - **Explicit character sequence configuration** ✅
  - **Per-frame sprite inversion support** ✅
- [x] **Phase 5**: Movement Control ✅ (2026-01-25)
  - CUT (cut sprite) ✅
  - ERA (erase sprite) ✅
  - POSITION (sprite position) ✅
  - XPOS, YPOS (sprite coordinates) ✅
  - MOVE(n) status query ✅
  - Position preservation fix for CUT command ✅
- [x] **Phase 6**: Integration & Polish ✅ (2026-01-29)
  - Performance: dirty background, animation-first prioritization, buffer-only render (useKonvaBackgroundRenderer, useScreenAnimationLoopRenderOnly - inlined render scheduling)
  - State sync: SharedArrayBuffer (sharedDisplayBuffer, sharedAnimationBuffer)
  - Error handling: executor audit, consistent messages
  - Testing: Layer 1/2 + `test/animation/` (AnimationManager, CharacterAnimationBuilder, FrameAnimation)
  - Documentation: JSDoc, architecture diagrams

**Remaining optional work (from retired sprite plan; implement only if needed)**:
- **4.4 Incremental dirty update** — Cap dirty cells per frame (e.g. 64) when a single update has many cells; add only if hitches remain on very large PRINTs.
- **4.5 requestIdleCallback for full redraw** — When no active movements, schedule full redraw via requestIdleCallback; use only if needed.

**Files Created So Far**:
- `src/core/sprite/types.ts` - Type definitions
- `src/core/sprite/SpriteStateManager.ts` - State management
- `src/core/sprite/characterSetConverter.ts` - Character conversion
- `src/core/execution/executors/DefSpriteExecutor.ts` - DEF SPRITE
- `src/core/execution/executors/SpriteExecutor.ts` - SPRITE
- `src/core/animation/AnimationManager.ts` - Animation state management
- `src/core/animation/CharacterAnimationBuilder.ts` - Animation config builder
- `src/core/animation/characterSequenceConfig.ts` - Explicit character sequence configuration
- `src/core/execution/executors/DefMoveExecutor.ts` - DEF MOVE
- `src/core/execution/executors/MoveExecutor.ts` - MOVE
- `src/core/execution/executors/CutExecutor.ts` - CUT command
- `src/core/execution/executors/EraExecutor.ts` - ERA command
- `src/core/execution/executors/PositionExecutor.ts` - POSITION command
- `src/features/ide/composables/useKonvaSpriteRenderer.ts` - Konva sprite rendering
- `src/features/ide/composables/useMovementStateSync.ts` - Movement state synchronization

**Reference Documentation**:
- `.claude/skills/fbasic-reference/references/sprites.md`
- `docs/reference/family-basic-manual/page-74.md` through `page-87.md`
- `docs/archive/device-models/screen/canvas-sprite-animation-design.md` - Historical canvas-based design (superseded by Konva.js)

---

### Phase 6: Animation Worker Refactor ✅ COMPLETE

**Estimated Effort**: 5-10 days (completed 2026-02-06)
**Priority**: High (fixes sprite teleportation bugs)
**Status**: Complete - Single Writer Pattern implemented

#### 6.1 Problem: Race Conditions from Multiple Writers
Previous architecture had multiple writers to the shared animation buffer:
- Main thread position calculation (`useScreenAnimationLoop.ts`)
- Message queue RAF updates (`handleAnimationCommandMessage`)
- This caused race conditions → sprite teleportation bugs when ERA → MOVE was executed rapidly

#### 6.2 Solution: Single Writer Pattern
```
┌─────────────────────────────────────────────────────────────────┐
│                   Animation Worker (Single Writer)              │
│  - Receives START_MOVEMENT, STOP_MOVEMENT, ERASE_MOVEMENT      │
│  - Calculates positions (x += dx * speed * dt)                 │
│  - Handles screen wrapping (modulo 256×240)                   │
│  - Manages movement lifecycle (isActive, remainingDistance)    │
│  - Writes positions to shared buffer (ONLY writer)             │
│  - Runs at fixed 60Hz tick rate                               │
└────────────────────────────┬────────────────────────────────────┘
                             │ postMessage
                             ▼
                      ┌──────────────┐
                      │ Shared Buffer │
                      │  XPOS, YPOS  │
                      └──────────────┘
                             │ read
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Main Thread (Render-Only)                    │
│  - Reads positions from shared buffer                         │
│  - Updates Konva nodes for rendering                          │
│  - NO position calculation (delegated to Animation Worker)    │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.3 Implementation - Progress Tracker
- [x] **Phase 1**: Animation Worker Infrastructure ✅ (2026-02-06)
  - `src/core/workers/AnimationWorker.ts` - Core worker class
  - `src/core/workers/animation-worker.ts` - Worker entry point
  - `AnimationWorkerCommand` types (START_MOVEMENT, STOP_MOVEMENT, ERASE_MOVEMENT, SET_POSITION, SET_SHARED_BUFFER)
  - 60Hz fixed tick rate with position calculation
  - Screen wrapping (modulo 256×240)

- [x] **Phase 2**: Shared Joystick Buffer ✅ (2026-02-06)
  - `src/core/devices/sharedJoystickBuffer.ts` - Zero-copy joystick state
  - Main thread writes stick/strig state
  - Workers read for STICK()/STRIG() functions

- [x] **Phase 3**: Main Thread Integration ✅ (2026-02-06)
  - `useAnimationWorker.ts` - Animation Worker lifecycle manager
  - `useScreenAnimationLoopRenderOnly.ts` - Render-only loop (reads from buffer)
  - `setForwardToAnimationWorker` - Proper registration of forward function

- [x] **Phase 4**: Command Routing ✅ (2026-02-06)
  - Executor Worker → Animation Worker via `AnimationWorkerCommand`
  - Main thread forwards commands through `forwardToAnimationWorker`
  - Message handler integration with proper state tracking

- [x] **Phase 5**: Testing ✅ (2026-02-06)
  - Integration tests: `test/integration/SharedBufferIntegration.test.ts`
  - Sprite movement lifecycle tests passing
  - Position sync tests passing

- [x] **Phase 6**: Bug Fix ✅ (2026-02-06)
  - Fixed `forwardToAnimationWorker` registration via `setForwardToAnimationWorker`
  - Commands now properly reach Animation Worker
  - Teleportation issue resolved

#### 6.4 Files Created
**Animation Worker:**
- `src/core/workers/AnimationWorker.ts` - Single writer class (400+ lines)
- `src/core/workers/animation-worker.ts` - Worker entry point

**Shared Joystick Buffer:**
- `src/core/devices/sharedJoystickBuffer.ts`

**Main Thread Integration:**
- `src/features/ide/composables/useAnimationWorker.ts` - Worker lifecycle
- `src/features/ide/composables/useScreenAnimationLoopRenderOnly.ts` - Render-only loop

#### 6.5 Files Modified
- `src/core/devices/index.ts` - Export sharedJoystickBuffer
- `src/core/interfaces.ts` - Add AnimationWorkerCommand types
- `src/features/ide/composables/useBasicIdeScreenIntegration.ts` - Add setForwardToAnimationWorker
- `src/features/ide/composables/useBasicIdeWorkerIntegration.ts` - Use forwardToAnimationWorker
- `src/features/ide/composables/useBasicIdeMessageHandlers.ts` - Forward commands to Animation Worker
- `src/features/ide/composables/useScreenContext.ts` - Add setForwardToAnimationWorker to interface
- `src/features/ide/composables/useBasicIdeEnhanced.ts` - Export setForwardToAnimationWorker
- `src/features/ide/components/Screen.vue` - Initialize Animation Worker
- `src/features/ide/IdePage.vue` - Pass setForwardToAnimationWorker to context

#### 6.6 Documentation Updates
- `docs/teams/platform-team.md` - Updated Animation System architecture

**Status**: ✅ Complete - Animation Worker is now the single writer to shared animation buffer. Teleportation issue fixed.

---

### Phase 7: Testing & Quality Assurance

**Estimated Effort**: Ongoing (per-feature; not a dedicated phase now)
**Priority**: Low (test new features as implemented; no broad coverage push)

#### 6.1 Test Coverage
- Test coverage is not a primary focus at this time; add tests when implementing new commands.
- [x] Layer 1 sprite/move unit tests (DefSprite, Sprite, DefMove, Move, Cut, Era, Position executors + MOVE/XPOS/YPOS)
- [x] Layer 2 sprite integration tests (sprite-movement-lifecycle, sprite-position-sync)
- [x] Integration tests for screen commands (LOCATE, COLOR)
- [x] INPUT/LINPUT: executor unit tests only (integration tests for input commands not required)
- [x] Error handling and edge cases for implemented commands

#### 6.2 Type Checking
- [x] Ensure all new code passes `pnpm type-check`
- [x] Fix any TypeScript errors
- [x] Ensure strict template checking passes

#### 6.3 Linting & Formatting
- [x] Run `pnpm lint` and fix all issues
- [x] Ensure consistent code style
- [x] Verify file size limits are respected

---

### Phase 8: Documentation — Deferred

Documentation (README, user guide, executor docs, architecture diagrams) will be revisited later. Not in scope for current planning.

---

## Implementation Guidelines

### For Each New Command

1. **Parser Changes**:
   - Add token to `parser-tokens.ts`
   - Add statement rule to `FBasicChevrotainParser.ts`
   - Test parsing with various inputs

2. **Executor Creation**:
   - Create executor class in `src/core/execution/executors/`
   - Implement `execute()` method
   - Handle errors appropriately
   - Follow existing executor patterns

3. **Router Registration**:
   - Register executor in `StatementRouter.ts`
   - Map statement type to executor

4. **Device Adapter** (if needed):
   - Implement device methods in `src/core/devices/*.ts`
   - Handle UI updates if required

5. **Testing**:
   - Create test file in `test/executors/`
   - Test happy path
   - Test error cases
   - Test edge cases

6. **Documentation**:
   - Add JSDoc to executor
   - Update command reference if needed

### Code Quality Standards

- **File Size**: Keep files under 500 lines (300 for `.ts`, 500 for `.vue`)
  - ✅ **Recent Improvement**: Refactored `KonvaSpriteTestPage.vue` from 514 to 266 lines (2026-01-26)
  - ✅ **Extracted Composables**: Created `useSpriteAnimation.ts` (107 lines) and `useKonvaStage.ts` (173 lines)
- **Type Safety**: No `any` types, use proper TypeScript types
- **Testing**: All new executors must have tests
- **Error Handling**: Graceful error handling with clear messages
- **Documentation**: JSDoc for all public methods

---

## Priority Matrix

| Phase | Priority | Effort | Impact | Dependencies |
|-------|----------|--------|--------|--------------|
| Phase 2: Screen Commands | High | Done (VIEW deferred) | High | None |
| Phase 3: Input Commands | High | Done | High | None |
| Phase 4: Additional Commands | Medium | 1-2 days (STOP, CONT, POKE) | Medium | None (SWAP ✅, CLEAR ✅) |
| Phase 1: Vue Best Practices | Low | Done | Low | None |
| Phase 5: Sprite System | Done | — | — | 6/6 phases ✅ |
| Phase 6: Animation Worker Refactor | High | Done | High | Phase 5 (Sprite System) ✅ |
| Phase 7: Testing & QA | Low | Per-feature only | — | No broad coverage push |
| Phase 8: Documentation | Deferred | Revisit later | — | — |

---

## Success Criteria

### Minimum Viable Product (MVP)
- ✅ Core language features (PRINT, LET, IF-THEN, FOR-NEXT, etc.)
- [x] Screen commands (CLS ✅, LOCATE ✅, COLOR ✅, CGSET ✅, CGEN ✅, Backdrop Screen ✅)
- [x] Input commands (INPUT ✅, LINPUT ✅)
- [x] Comprehensive test coverage (>80%) (LOCATE, COLOR, CGSET, CGEN fully tested)
- [x] All TypeScript errors resolved
- [x] All linting errors resolved

### Complete Product
- [ ] All screen commands implemented (CGSET ✅, CGEN ✅, Backdrop Screen ✅, PALET B ✅; VIEW ⏳ deferred — needs BG GRAPHIC buffer + editor)
- [x] All input commands implemented (INPUT ✅, LINPUT ✅)
- [ ] Remaining additional commands (STOP, CONT, POKE; SWAP ✅, CLEAR ✅)
- [ ] Documentation (deferred; revisit later)
- [x] Vue best practices (critical items complete)
- [x] Code quality: File size limits respected

---

## Timeline Estimate

**Current focus**: Phase 4 remaining (STOP, CONT, POKE) — 1-2 days.

**Recent completions**:
- ✅ Phase 6: Animation Worker Refactor (2026-02-06) - Fixed sprite teleportation bugs

**Future (when needed)**:
- VIEW: requires BG GRAPHIC buffer + editor.
- Documentation: revisit later.
- Test coverage: add tests per new feature; no dedicated coverage push.

---

## Notes

### Decisions Needed

1. **Sprite System**: Should sprite system be implemented now or deferred?
   - **Recommendation**: Defer to future enhancement
   - **Rationale**: Core language features (screen, input) are more important

2. **POKE Command**: How should memory writes work in web context?
   - **Recommendation**: Implement as no-op or limited functionality
   - **Rationale**: Web security restrictions prevent direct memory access

3. **Graphics Commands**: Are PSET, LINE, CIRCLE, PAINT part of F-BASIC?
   - **Action**: Review Family BASIC manual to confirm
   - **Note**: These may not be standard F-BASIC commands

### Technical Considerations

- **Device Adapter**: Screen commands require device adapter updates
  - ✅ **Refactored**: `WebWorkerDeviceAdapter` split into focused modules for better maintainability
  - ✅ **File Size**: All device adapter files now respect 500-line limit
  - ✅ **Modules Created**: 
    - `WebWorkerManager.ts` - Web worker lifecycle management
    - `ScreenStateManager.ts` - Screen buffer and state management
    - `MessageHandler.ts` - Message routing and handling
  - ✅ **Separation of Concerns**: Clear boundaries between web worker management, screen state, and message handling
- **UI Integration**: Input commands require UI components for prompts
- **Testing**: Screen commands may require visual testing
- **Performance**: Consider performance impact of screen updates
- **Code Quality**: 
  - ✅ File size limits enforced and respected
  - ✅ TypeScript strict mode compliance
  - ✅ Linting standards maintained

---

## References

- [F-BASIC Reference Skill](../.claude/skills/fbasic-reference/SKILL.md)
- [Family BASIC Manual](../reference/family-basic-manual/)
- [Screen Architecture](../device-models/screen/architecture.md)
- [Remaining Commands – Emulator Compatibility](../analysis/remaining-commands-emulator-compatibility.md) — Review of whether VIEW, INPUT, LINPUT, STOP, CONT, SWAP, CLEAR, POKE are compatible with the current web-based emulator.

---

**Last Updated**: 2026-02-06

**Revisions (2026-02-06)**:
- ✅ Phase 6: Animation Worker Refactor completed - Fixed sprite teleportation bugs
- Updated architecture documentation (platform-team.md) to reflect single writer pattern
- Added new Animation Worker files to platform team ownership

**Revisions (2026-01-31)**:
- SWAP and CLEAR marked as already implemented.
- INPUT/LINPUT integration tests: not required.
- Test coverage: not a primary focus; add tests when implementing new commands.
- Phase 8 (Documentation): deferred; revisit later.

**Suggested next step**: Implement **STOP** and **CONT** (stop execution with resume). Optionally **POKE** (no-op or limited in web context). Then consider VIEW when BG GRAPHIC buffer/editor is planned.

**Next Review**: After STOP/CONT (and optionally POKE) or when BG GRAPHIC work is planned.

**Revisions (2026-01-31)**:
- SWAP and CLEAR marked as already implemented.
- INPUT/LINPUT integration tests: not required.
- Test coverage: not a primary focus; add tests when implementing new commands.
- Phase 7 (Documentation): deferred; revisit later.

**Suggested next step**: Implement **STOP** and **CONT** (stop execution with resume). Optionally **POKE** (no-op or limited in web context). Then consider VIEW when BG GRAPHIC buffer/editor is planned.

**Next Review**: After STOP/CONT (and optionally POKE) or when BG GRAPHIC work is planned.
