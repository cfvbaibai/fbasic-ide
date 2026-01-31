# Changelog

All notable changes to this project are documented here.

## 2026-01-31 - DEF MOVE speed C=0 support (every 256 frames)

### Changes
- **DEF MOVE speed parameter**: C now accepts 0–255 (was 1–255). Per F-BASIC manual p.74, “in case of 0, it will move every 256 frames”; C=0 is implemented as 60/256 dots per second.
- **AnimationManager**: Validation allows speed 0; `speedDotsPerSecond = speed === 0 ? 60/256 : 60/speed`.
- **DefMoveExecutor**: Range check updated to 0–255.
- **useBasicIdeMessageHandlers**: START_MOVEMENT uses same C=0 → 60/256 mapping.
- **Types/comments**: MoveDefinition.speed and related comments updated to “0–255 (0=every 256 frames)”.
- **Tests**: DefMoveExecutor and AnimationManager tests updated: speed=0 accepted, speed=256 rejected; new test for speedDotsPerSecond when speed=0.

### Files
- `src/core/animation/AnimationManager.ts`, `src/core/execution/executors/DefMoveExecutor.ts`, `src/features/ide/composables/useBasicIdeMessageHandlers.ts`, `src/core/sprite/types.ts`, `src/core/parser/FBasicChevrotainParser.ts`, `src/core/samples/sampleCodes.ts`, `src/features/konva-test/composables/useMovementGeneration.ts`, `test/executors/DefMoveExecutor.test.ts`, `test/animation/AnimationManager.test.ts`.

## 2026-01-31 - Split useBasicIdeEnhanced into logical modules

### Changes
- **useBasicIdeEnhanced.ts** (was 586 lines) is now a thin composer (~110 lines) that wires state, screen, worker, execution, and editor. Implementation is split for maintainability (each file under 500 lines).
- **useBasicIdeState.ts**: Centralized reactive state (all refs: editor, execution, screen, sprite, input). Single source for refs used by other composables.
- **useBasicIdeScreenIntegration.ts**: Shared display buffer creation, `registerScheduleRender`, `setDecodedScreenState`, `scheduleRender` callback.
- **useBasicIdeWorkerIntegration.ts**: Web worker manager, message handler context, init/restart/health/send, joystick and input events, cleanup.
- **useBasicIdeExecution.ts**: `runCode`, `stopCode`, `clearOutput`, `clearAll` (runCode flow, movement-state merge, error handling).
- **useBasicIdeEditor.ts**: Parser instance, `updateHighlighting`, `parseCode`, `validateCode`, `loadSampleCode`, `sampleSelectOptions`, parser/highlighter capabilities.
- Public API of `useBasicIde()` unchanged; consumers (IdePage, test pages) require no changes.

## 2026-01-31 - Screen context via provide/inject (reduce prop drilling)

### Changes
- **Screen context**: Introduced `useScreenContext` composable (injection key + `provideScreenContext` / `useScreenContext`) so screen-related state is provided once by the page and injected by ScreenTab and Screen instead of being passed through RuntimeOutput.
- **IdePage**: Provides screen context (screenBuffer, cursor, palettes, sprites, shared buffers, callbacks) after `useBasicIdeEnhanced()`; passes to RuntimeOutput only `output`, `isRunning`, `errors`, `variables`, `debugOutput`, `debugMode`.
- **RuntimeOutput**: Props reduced to the six above; ScreenTab receives only `errors`.
- **ScreenTab**: Injects screen context; uses it for ActivePaletteDisplay and passes nothing to Screen (Screen injects the same context).
- **Screen**: No longer accepts screen-related props; injects screen context and reads/writes via `ctx.*.value` and callbacks.
- **Test pages**: `PrintVsSpritesTestPage.vue` and `PositionSyncLoadTestPage.vue` updated to call `provideScreenContext` and pass only the reduced props to RuntimeOutput.

### Files
- **New**: `src/features/ide/composables/useScreenContext.ts` (key, type, provide/inject helpers).

## 2026-01-31 - Remove STDOUT tab; add error panel footer on Screen tab

### Changes
- **STDOUT tab removed**: The Stdout tab in Runtime Output was only useful for error reporting. It has been removed; PRINT output is no longer shown in a separate tab.
- **Error panel footer**: Screen tab now has a footer area (like the header with zoom controls) that is not part of the scrollable body. When there are runtime errors, an **ErrorPanel** appears in this footer with type, message, line, optional source line, and expandable stack trace.
- **Layout**: ScreenTab structure is header (zoom + palette) → body (Screen canvas) → footer (ErrorPanel when errors exist). Footer uses `flex-shrink: 0` so it stays at the bottom and does not scroll with the canvas.
- **New component**: `ErrorPanel.vue` shows the same error format as before (icon, type, message, line, source line, stack details).
- **i18n**: Removed `ide.output.stdout` from en, ja, zh-CN, zh-TW.

### Removed
- `StdoutTab.vue` (deleted).

## 2026-01-31 - INPUT/LINPUT: Fix timeout and “No pending message”

### Fixes
- **Web worker message timeout**: While execution was waiting for INPUT/LINPUT, the 30s run timeout still ran and rejected the promise, causing “Execution error: Error: Web worker message timeout”. When the worker later sent RESULT, the pending message was already gone, so “No pending message found for messageId” appeared.
- **Change**: On `REQUEST_INPUT`, the run timeout is extended by 5 minutes via `extendExecutionTimeout()` in `useBasicIdeWebWorkerUtils.ts`, and the message handler calls it when handling `REQUEST_INPUT`. The run promise now only times out if the user doesn’t respond to input within 5 minutes (or when the original timeout would have fired before the first INPUT).

## 2026-01-31 - INPUT/LINPUT Demo + Sample Selector UI

### Demo and UI
- **INPUT / LINPUT demo sample**: New `inputDemo` sample in `sampleCodes.ts` — prompts for name (INPUT), two numbers (INPUT A, B), and a line with commas (LINPUT); prints results.
- **Sample selection**: Replaced the wide row of 10 toggle buttons with a single **GameSelect** dropdown (placeholder “Sample”). Options are built from `getSampleCodeKeys()` and sample names; selecting loads that sample. Composable now exposes `sampleSelectOptions` and `loadSampleCode(sampleType: string)` for any key.
- **i18n**: Added `ide.samples.placeholder` and `ide.samples.inputDemo` (en, ja, zh-CN, zh-TW).

### Tests
- InputExecutor/LinputExecutor tests: use optional chaining for `result.errors[0]?.message` to satisfy strict TS.

## 2026-01-31 - INPUT and LINPUT Commands

### Implemented
- **INPUT**: Parser tokens and rules (`INPUT ["prompt"] {; variable(, variable, ...)}`), `InputExecutor`, device `requestInput`, worker↔main `REQUEST_INPUT`/`INPUT_VALUE` messages, IDE modal (prompt + field + OK/Cancel). Supports multiple variables; comma-separated input; numeric and string variables.
- **LINPUT**: Parser rules, `LinputExecutor`, single string variable; allows commas in input (unlike INPUT).
- **Device**: `BasicDeviceAdapter.requestInput?(prompt, options?)` (optional); `WebWorkerDeviceAdapter` implements with pending-request map; `TestDeviceAdapter` uses `inputResponseQueue` for tests.
- **Worker**: `INPUT_VALUE` handling in `WebWorkerInterpreter`; `rejectAllInputRequests()` on STOP.
- **IDE**: `pendingInputRequest` ref, `respondToInputRequest()`, modal in `IdePage.vue` (Teleport), i18n keys `ide.input.submit`/`cancel` (en, ja, zh-CN, zh-TW).
- **Tests**: `InputExecutor.test.ts` (7 tests), `LinputExecutor.test.ts` (5 tests).

### Status
- ✅ Type-check passes
- ✅ 942 tests pass (INPUT/LINPUT executor tests included)

## 2026-01-31 - VIEW Deferred; Plan Updated

### Planning
- **VIEW command**: Documented as blocked. VIEW requires (1) BG GRAPHIC buffer (28×21) in device/screen layer, and (2) a BG GRAPHIC editor (or other way to populate the buffer). We have neither; no user-facing way to edit BG GRAPHIC yet.
- **Remaining work plan**: Updated Phase 2 VIEW section with prerequisites; suggested next step set to Phase 3 (INPUT, LINPUT). Timeline and success criteria updated accordingly.

## 2026-01-31 - Dependency Maintenance & Documentation

### Dependency Upgrades
- **Vitest**: 3.2.4 → 4.0.18 (migrated poolOptions to top-level)
- **All Dependencies**: 20 packages upgraded to latest stable versions
  - vue-router: 4.6.3 → 5.0.1 (no breaking changes)
  - globals: 16.5.0 → 17.2.0
  - @types/node: 24.7.1 → 25.1.0
  - esbuild: 0.25.10 → 0.27.2
  - Plus 16 other dev dependencies
- **Removed**: peggy (unused dependency)

### TypeScript Fixes
- Fixed 6 type errors blocking build
- Added Node types to tsconfig.json
- Fixed Vitest 4 mock type compatibility
- Applied optional chaining improvements

### Documentation
- Consolidated guides (90% reduction: 2,089 → 215 lines)
- Updated all docs to AI-focused content
- Created comprehensive changelog
- Organized archive structure

### Status
- ✅ All 930 tests passing
- ✅ No TypeScript errors
- ✅ No security vulnerabilities
- ✅ Build working

## 2026-01-29 - Sprite System & Screen Buffer

### SharedArrayBuffer Strategy
- Implemented shared display buffer for screen and sprite state sync
- Layout: sprites 0-192 bytes (Float64Array × 24), cell chars, patterns, cursor, sequence, scalars
- Worker writes after screen/background changes; main reads on render
- Sprite positions read by main in animation loop from shared buffer

### Compatibility Review
- Added remaining commands compatibility analysis
- VIEW needs BG GRAPHIC buffer + device copy method
- INPUT/LINPUT need async device API + worker↔main messages
- STOP/CONT need ExecutionContext "stopped" state
- SWAP/CLEAR fully compatible (VariableService has methods)

### Code Quality
- Konva Test Page: reduced from 514 to 266 lines (52% reduction)
- Extracted `useSpriteAnimation.ts` (107 lines)
- Extracted `useKonvaStage.ts` (173 lines)
- All Vue 3 best practices followed

### Sprite System
- Phase 6.2 complete: state sync via SharedArrayBuffer
- Phases 1-6 all complete
- Optional 4.4/4.5 (incremental dirty, requestIdleCallback) not implemented

## 2026-01-26 - Code Quality Improvements

### Vue 3 Best Practices
- Fixed props reactivity loss in Screen.vue with toValue() wrapper
- All TypeScript type checks pass
- All ESLint and Stylelint checks pass
- Proper type safety maintained throughout

## 2026-01-25 - Character Animation System

### Animation Frame System
- Implemented CharacterAnimationBuilder for sprite animation
- Created characterSequenceConfig for direction/sprite mappings
- 24 comprehensive unit tests with 100% coverage
- Support for multi-sprite characters (e.g., balloons)

### Animation System Integration
- Updated AnimationManager to use CharacterAnimationBuilder
- Fixed circular reference issues between files
- Proper idle/moving state management
- Automatic direction-based sprite selection

## 2026-01-24 - Backdrop Screen & PALET Commands

### Backdrop Screen
- Canvas extended to 256×240 pixels (full backdrop/sprite size)
- Background screen positioned at offset (16, 24) within backdrop
- Backdrop rendered as solid color layer

### PALET Commands
- Implemented PALET B (backdrop) and PALET S (sprite) commands
- Parser supports both `PALET B` (with space) and `PALETB` (no space)
- Dynamic backdrop color changes via `PALET B 0, colorCode, ...`
- 16 comprehensive tests covering all scenarios

### CGEN Command
- Implemented character generator mode switching (0-3)
- WebWorkerDeviceAdapter refactored for better testability
- Message-based communication pattern established

## 2026-01-23 - Color System Implementation

### CGSET Command
- Full implementation with palette switching (m: 0-1, n: 0-2)
- Proper palette rendering in Screen component
- Characters now use correct colors from selected palette
- 18 unit tests + 11 integration tests

### COLOR Command
- Set color patterns for 2×2 character areas
- Fixed message handler bug for color updates
- Proper area calculation and validation
- 16 unit tests + 9 integration tests

## 2026-01-22 - LOCATE Command & Vue Best Practices

### LOCATE Command
- Cursor positioning (X: 0-27, Y: 0-23)
- Full integration with PRINT statements
- 16 unit tests + 8 integration tests + 9 device adapter tests
- Type-safe implementation throughout

### Vue Best Practices
- Migrated 6 components to useTemplateRef pattern
- Added onDeactivated cleanup for Keep-Alive support
- Created type files for 10 UI components
- Enhanced store error messages
- Comprehensive JSDoc documentation verified
