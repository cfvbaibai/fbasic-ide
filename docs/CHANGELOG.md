# Changelog

All notable changes to this project are documented here.

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
