# Remaining Work Plan

**Date**: 2024  
**Status**: Active  
**Purpose**: Comprehensive plan for completing the Family Basic IDE project

## Executive Summary

This document outlines the remaining work needed to complete the Family Basic IDE project. It consolidates progress from previous plans and identifies remaining tasks across three main areas:

1. **Code Quality & Best Practices** - Vue 3 best practices improvements
2. **F-BASIC Language Implementation** - Missing language features and commands
3. **Project Polish** - Testing, documentation, and final refinements

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

**Status**: Critical and high-priority items completed. Remaining items are low priority.

#### F-BASIC Language - Core Statements Implemented
- ✅ **Control Flow**: PRINT, LET, IF-THEN, FOR-NEXT, GOTO, GOSUB, RETURN, END, ON
- ✅ **Data Management**: DATA, READ, RESTORE, DIM
- ✅ **Program Control**: PAUSE, REM
- ✅ **Functions**: ABS, SGN, RND, VAL, LEN, LEFT$, RIGHT$, MID$, STR$, HEX$, CHR$, ASC
- ✅ **Operators**: Arithmetic, comparison, logical operators
- ✅ **Input Functions**: STICK, STRIG (controller input)

**Status**: Core language features implemented, graphics and screen commands missing.

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
- [ ] Review CSS v-bind usage for reactivity issues (optional)
- [ ] Document safe CSS v-bind patterns (optional)

**Status**: ✅ Critical items completed - CSS v-bind review is optional enhancement

**Completed Work Summary**:
- ✅ Template refs migrated: MonacoCodeEditor, Screen, CodeEditor, GameSelect, GameUpload
- ✅ Keep-alive cleanup: useJoystickEvents, useBasicIdeEnhanced, GameSelect
- ✅ Type extraction: 10 components with exported types
- ✅ Error messages: useSpriteViewerStore enhanced

---

### Phase 2: Implement Missing F-BASIC Screen Commands (High Priority)

**Estimated Effort**: 3-5 days  
**Priority**: High (core language features)

#### 2.1 Screen Control Commands

**CLS** (Clear Screen)
- [x] Add `CLS` token to parser (`parser-tokens.ts`)
- [x] Add `clsStatement` rule to parser (`FBasicChevrotainParser.ts`)
- [x] Create `ClsExecutor.ts`
- [x] Implement screen clearing in device adapter (already implemented)
- [x] Add tests for CLS command

**LOCATE** (Cursor Position)
- [ ] Add `LOCATE` token to parser
- [ ] Add `locateStatement` rule (LOCATE X, Y)
- [ ] Create `LocateExecutor.ts`
- [ ] Implement cursor positioning in device adapter
- [ ] Add tests for LOCATE command

**COLOR** (Color Pattern)
- [ ] Add `COLOR` token to parser
- [ ] Add `colorStatement` rule (COLOR X, Y, n)
- [ ] Create `ColorExecutor.ts`
- [ ] Implement color pattern setting in device adapter
- [ ] Add tests for COLOR command

**CGSET** (Color Palette)
- [ ] Add `CGSET` token to parser
- [ ] Add `cgsetStatement` rule (CGSET palet_code, combination)
- [ ] Create `CgsetExecutor.ts`
- [ ] Implement palette setting in device adapter
- [ ] Add tests for CGSET command

**CGEN** (Character Generator)
- [ ] Add `CGEN` token to parser
- [ ] Add `cgenStatement` rule (CGEN mode)
- [ ] Create `CgenExecutor.ts`
- [ ] Implement character generator mode in device adapter
- [ ] Add tests for CGEN command

**VIEW** (Display BG GRAPHIC)
- [ ] Add `VIEW` token to parser
- [ ] Add `viewStatement` rule
- [ ] Create `ViewExecutor.ts`
- [ ] Implement BG GRAPHIC screen display
- [ ] Add tests for VIEW command

**Files to Create**:
- `src/core/execution/executors/ClsExecutor.ts` ✅
- `src/core/execution/executors/LocateExecutor.ts`
- `src/core/execution/executors/ColorExecutor.ts`
- `src/core/execution/executors/CgsetExecutor.ts`
- `src/core/execution/executors/CgenExecutor.ts`
- `src/core/execution/executors/ViewExecutor.ts`

**Files to Modify**:
- `src/core/parser/parser-tokens.ts` (add tokens)
- `src/core/parser/FBasicChevrotainParser.ts` (add rules)
- `src/core/execution/StatementRouter.ts` (register executors)
- `src/core/devices/*.ts` (implement device methods)

**Reference Documentation**:
- `docs/reference/family-basic-manual/page-70.md` (LOCATE, COLOR)
- `docs/reference/family-basic-manual/page-71.md` (CGEN, CLS)
- `docs/reference/family-basic-manual/page-72.md` (CGSET)
- `.claude/skills/fbasic-reference/references/screen.md`

---

### Phase 3: Implement Input Commands (High Priority)

**Estimated Effort**: 2-3 days  
**Priority**: High (essential for interactive programs)

#### 3.1 INPUT Command
- [ ] Add `INPUT` token to parser
- [ ] Add `inputStatement` rule (supports both `INPUT "prompt"; var` and `INPUT var`)
- [ ] Create `InputExecutor.ts`
- [ ] Implement input handling in device adapter
- [ ] Add UI for input prompts in IDE
- [ ] Add tests for INPUT command

#### 3.2 LINPUT Command
- [ ] Add `LINPUT` token to parser
- [ ] Add `linputStatement` rule
- [ ] Create `LinputExecutor.ts`
- [ ] Implement line input handling
- [ ] Add tests for LINPUT command

**Files to Create**:
- `src/core/execution/executors/InputExecutor.ts`
- `src/core/execution/executors/LinputExecutor.ts`

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

**Estimated Effort**: 2-4 days  
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

**SWAP** (Swap Variables)
- [ ] Add `SWAP` token to parser
- [ ] Add `swapStatement` rule (SWAP var1, var2)
- [ ] Create `SwapExecutor.ts`
- [ ] Implement variable swapping
- [ ] Add tests

**CLEAR** (Clear Variables)
- [ ] Add `CLEAR` token to parser
- [ ] Add `clearStatement` rule
- [ ] Create `ClearExecutor.ts`
- [ ] Implement variable clearing
- [ ] Add tests

**POKE** (Memory Write)
- [ ] Add `POKE` token to parser
- [ ] Add `pokeStatement` rule (POKE address, value)
- [ ] Create `PokeExecutor.ts`
- [ ] Implement memory write (if applicable in web context)
- [ ] Add tests

**Files to Create**:
- `src/core/execution/executors/StopExecutor.ts`
- `src/core/execution/executors/ContExecutor.ts`
- `src/core/execution/executors/SwapExecutor.ts`
- `src/core/execution/executors/ClearExecutor.ts`
- `src/core/execution/executors/PokeExecutor.ts`

**Reference Documentation**:
- `docs/reference/family-basic-manual/page-55.md` (CLEAR)
- `docs/reference/family-basic-manual/page-66.md` (STOP)
- `docs/reference/family-basic-manual/page-67.md` (SWAP)
- `docs/reference/family-basic-manual/page-69.md` (POKE)

---

### Phase 5: Implement Sprite System (Future Enhancement)

**Estimated Effort**: 5-10 days  
**Priority**: Low (advanced feature, can be added later)

#### 5.1 Sprite Commands
- [ ] DEF SPRITE (define sprite)
- [ ] SPRITE (display sprite)
- [ ] DEF MOVE (define sprite movement)
- [ ] MOVE (execute sprite movement)
- [ ] CUT (cut sprite)
- [ ] ERA (erase sprite)
- [ ] POSITION (sprite position)
- [ ] XPOS, YPOS (sprite coordinates)
- [ ] PALET (palette selection)

**Note**: This is a complex feature requiring significant graphics implementation. Consider this a future enhancement rather than core functionality.

**Reference Documentation**:
- `.claude/skills/fbasic-reference/references/sprites.md`
- `docs/reference/family-basic-manual/page-74.md` through `page-87.md`

---

### Phase 6: Testing & Quality Assurance (High Priority)

**Estimated Effort**: 2-3 days  
**Priority**: High (ensure reliability)

#### 6.1 Test Coverage
- [ ] Review test coverage for all executors
- [ ] Add missing tests for new executors
- [ ] Add integration tests for screen commands
- [ ] Add integration tests for input commands
- [ ] Test error handling for all commands
- [ ] Test edge cases and boundary conditions

#### 6.2 Type Checking
- [ ] Ensure all new code passes `pnpm type-check`
- [ ] Fix any TypeScript errors
- [ ] Ensure strict template checking passes

#### 6.3 Linting & Formatting
- [ ] Run `pnpm lint` and fix all issues
- [ ] Ensure consistent code style
- [ ] Verify file size limits are respected

---

### Phase 7: Documentation Updates (Medium Priority)

**Estimated Effort**: 1-2 days  
**Priority**: Medium (improve maintainability)

#### 7.1 Code Documentation
- [ ] Update README.md with new features
- [ ] Document new executors
- [ ] Update architecture diagrams if needed
- [ ] Document device adapter methods

#### 7.2 User Documentation
- [ ] Create user guide for new commands
- [ ] Add examples for screen commands
- [ ] Add examples for input commands
- [ ] Update feature list in README

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
- **Type Safety**: No `any` types, use proper TypeScript types
- **Testing**: All new executors must have tests
- **Error Handling**: Graceful error handling with clear messages
- **Documentation**: JSDoc for all public methods

---

## Priority Matrix

| Phase | Priority | Effort | Impact | Dependencies |
|-------|----------|--------|--------|--------------|
| Phase 2: Screen Commands | High | 3-5 days | High | None |
| Phase 3: Input Commands | High | 2-3 days | High | None |
| Phase 6: Testing & QA | High | 2-3 days | High | Phases 2-3 |
| Phase 1: Vue Best Practices | Low | 1 day | Low | None (mostly complete) |
| Phase 4: Additional Commands | Medium | 2-4 days | Medium | None |
| Phase 7: Documentation | Medium | 1-2 days | Medium | Phases 2-3 |
| Phase 5: Sprite System | Low | 5-10 days | Low | Future |

---

## Success Criteria

### Minimum Viable Product (MVP)
- ✅ Core language features (PRINT, LET, IF-THEN, FOR-NEXT, etc.)
- [ ] Screen commands (CLS, LOCATE, COLOR)
- [ ] Input commands (INPUT, LINPUT)
- [ ] Comprehensive test coverage (>80%)
- [ ] All TypeScript errors resolved
- [ ] All linting errors resolved

### Complete Product
- [ ] All screen commands implemented
- [ ] All input commands implemented
- [ ] Additional commands (STOP, CONT, SWAP, etc.)
- [ ] Complete test coverage
- [ ] Full documentation
- [x] Vue best practices fully implemented (critical items complete)

---

## Timeline Estimate

**Minimum (MVP)**: 7-11 days
- Phase 2: Screen Commands (3-5 days)
- Phase 3: Input Commands (2-3 days)
- Phase 6: Testing & QA (2-3 days)

**Complete**: 15-25 days
- All phases above
- Phase 1: Vue Best Practices (2-3 days)
- Phase 4: Additional Commands (2-4 days)
- Phase 7: Documentation (1-2 days)

**Future Enhancements**: 5-10+ days
- Phase 5: Sprite System

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
- **UI Integration**: Input commands require UI components for prompts
- **Testing**: Screen commands may require visual testing
- **Performance**: Consider performance impact of screen updates

---

## References

- [F-BASIC Reference Skill](../.claude/skills/fbasic-reference/SKILL.md)
- [Family BASIC Manual](../reference/family-basic-manual/)
- [Screen Architecture](../device-models/screen/architecture.md)

---

**Last Updated**: 2026-01-22  
**Next Review**: After Phase 2 completion

## Recent Updates (2026-01-22)

### Vue Best Practices Improvements Completed
- ✅ **Template Refs**: Migrated 6 components to Vue 3.5+ `useTemplateRef` pattern
- ✅ **Keep-Alive Support**: Added `onDeactivated` cleanup to prevent memory leaks
- ✅ **Type Extraction**: Created type files for 10 UI components with proper exports
- ✅ **Error Messages**: Enhanced store error messages with descriptive context
- ✅ **JSDoc Verification**: Confirmed most components have comprehensive documentation

**Reference**: See `docs/planning/vue-vueuse-best-practices-plan.md` for detailed implementation
