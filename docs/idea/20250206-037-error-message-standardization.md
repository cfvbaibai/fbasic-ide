# Error Message Standardization

**Date:** 2025-02-06
**Type:** SMALL
**Team:** Runtime
**Effort:** 1-2 weeks

## Problem Statement

The Family Basic IDE codebase currently has inconsistent error message formats across different executors and evaluation contexts. This creates several issues:

1. **Inconsistent User Experience**: Error messages vary in format, detail level, and helpfulness
2. **Maintenance Burden**: Each executor handles errors independently, making it harder to maintain consistency
3. **Limited Error Context**: Many errors lack sufficient context for users to understand and fix issues
4. **No Error Recovery**: Current system lacks infrastructure for intelligent error recovery or suggestions
5. **Testing Difficulties**: Inconsistent error formats make testing more challenging

### Current State Analysis

The codebase shows mixed error handling patterns:

**Standard Pattern (ExecutionContext.addError)**:
```typescript
this.context.addError({
  line: lineNumber,
  message: 'FOR loop requires numeric values',
  type: ERROR_TYPES.RUNTIME,
})
```

**Direct Error Throws** (found in 20+ locations):
```typescript
throw new Error('Undefined character code at index 0')
throw new Error(`No sprite tile found for character code ${code} in Table A`)
throw new Error('Container element is required')
```

**Inconsistent Message Formats**:
- "Invalid FOR statement: missing variable or expressions"
- "FOR loop requires numeric values"
- "FOR STEP requires numeric value"
- "PRINT: Invalid separator: undefined"
- "INPUT is not supported (no input device)"

## Proposed Solution

Create a centralized error handling system with standardized, user-friendly error messages that provide clear guidance and enable future error recovery features.

### Architecture

#### 1. Error Factory Utility (`src/core/errors/ErrorFactory.ts`)

```typescript
import { ERROR_TYPES } from '@/core/constants'
import type { BasicError } from '@/core/interfaces'

export interface ErrorContext {
  line?: number
  statement?: string
  variable?: string
  expected?: string
  received?: string
  allowedValues?: string[]
  minValue?: number
  maxValue?: number
}

export class ErrorFactory {
  // Statement execution errors
  static forLoopRequiresNumeric(context: ErrorContext): BasicError
  static forLoopInvalidStep(context: ErrorContext): BasicError
  static invalidForStatement(context: ErrorContext): BasicError
  static invalidNextStatement(context: ErrorContext): BasicError
  static invalidGotoTarget(context: ErrorContext): BasicError
  static invalidGosubTarget(context: ErrorContext): BasicError
  static invalidReturn(context: ErrorContext): BasicError

  // Expression errors
  static typeMismatch(context: ErrorContext): BasicError
  static undefinedVariable(context: ErrorContext): BasicError
  static divisionByZero(context: ErrorContext): BasicError
  static invalidExpression(context: ErrorContext): BasicError

  // Array errors
  static arrayIndexOutOfBounds(context: ErrorContext): BasicError
  static arrayNotDimensioned(context: ErrorContext): BasicError
  static arrayRedimensioned(context: ErrorContext): BasicError

  // I/O errors
  static invalidInput(context: ErrorContext): BasicError
  static inputCancelled(context: ErrorContext): BasicError

  // Sprite errors
  static invalidSpriteDefinition(context: ErrorContext): BasicError
  static spriteActionOutOfRange(context: ErrorContext): BasicError

  // Screen errors
  static invalidCursorPosition(context: ErrorContext): BasicError
  static invalidColorValue(context: ErrorContext): BasicError

  // Generic utility
  static generic(message: string, context: ErrorContext): BasicError
}
```

#### 2. Error Message Templates

Each error type includes:
- Clear, actionable message
- Error code for documentation reference
- Severity level
- Suggested fixes (for future AI-assisted recovery)

Example template:
```typescript
{
  code: 'ERR_FOR_NUMERIC',
  message: 'FOR loop requires numeric values',
  details: 'The START, END, and STEP values in a FOR statement must be numbers.',
  suggestion: 'Ensure all expressions in the FOR statement evaluate to numeric values.',
  severity: 'error'
}
```

#### 3. Error Catalog (`src/core/errors/ErrorCatalog.ts`)

Centralized registry of all possible errors with i18n support:

```typescript
export const ERROR_CATALOG = {
  FOR_NUMERIC: {
    en: 'FOR loop requires numeric values',
    ja: 'FORループには数値が必要です',
    'zh-CN': 'FOR 循环需要数值',
  },
  // ... all error messages
}
```

## Implementation Phases

### Phase 1: Core Infrastructure (3-4 days)
**Files to create:**
- `src/core/errors/ErrorFactory.ts` - Main error factory class
- `src/core/errors/ErrorCatalog.ts` - Error message templates
- `src/core/errors/types.ts` - Error-specific types
- `test/core/errors/ErrorFactory.test.ts` - Unit tests

**Tasks:**
1. Define error context interface
2. Implement error message templates for common scenarios
3. Create factory methods for each error category
4. Add comprehensive unit tests
5. Document error catalog with all error codes

### Phase 2: Executor Migration (5-7 days)
**Files to modify:**
- `src/core/execution/executors/ForExecutor.ts`
- `src/core/execution/executors/NextExecutor.ts`
- `src/core/execution/executors/GotoExecutor.ts`
- `src/core/execution/executors/GosubExecutor.ts`
- `src/core/execution/executors/ReturnExecutor.ts`
- `src/core/execution/executors/IfThenExecutor.ts`
- `src/core/execution/executors/InputExecutor.ts`
- `src/core/execution/executors/LinputExecutor.ts`
- `src/core/execution/executors/DimExecutor.ts`
- `src/core/execution/executors/SpriteExecutor.ts`
- `src/core/execution/executors/DefSpriteExecutor.ts`
- `src/core/execution/executors/ColorExecutor.ts`
- `src/core/execution/executors/LocateExecutor.ts`
- `src/core/execution/executors/PrintExecutor.ts`
- `src/core/evaluation/ExpressionEvaluator.ts`

**Tasks:**
1. Replace all `context.addError()` calls with `ErrorFactory` methods
2. Update error messages to include relevant context
3. Add error context objects with relevant information
4. Update tests to verify new error format
5. Ensure all error paths use the factory

### Phase 3: Direct Throw Migration (2-3 days)
**Files to modify:**
- `src/shared/utils/spriteLookup.ts` (4 throws)
- `src/features/ide/integrations/monaco-integration.ts` (1 throw)
- `test/mocks/MockDeviceAdapter.ts` (1 throw)
- `src/features/sprite-viewer/composables/useSpriteViewerStore.ts` (1 throw)
- Canvas context validation errors (5-6 throws)

**Tasks:**
1. Replace direct `throw new Error()` with ErrorFactory where appropriate
2. For unrecoverable errors, create specific error types
3. Update test expectations
4. Verify error propagation works correctly

### Phase 4: Documentation and Polish (1-2 days)
**Files to create:**
- `docs/reference/error-codes.md` - User-facing error code reference
- Update `docs/reference/` with error handling guide

**Tasks:**
1. Create comprehensive error code documentation
2. Add examples for each error category
3. Document error factory usage for developers
4. Add JSDoc comments to all factory methods

## Success Metrics

### Completion Criteria
- [ ] All 30+ executors use ErrorFactory for error generation
- [ ] No direct `throw new Error()` in runtime code (except truly unrecoverable system errors)
- [ ] All error messages follow consistent format
- [ ] Error catalog includes 100% of runtime errors
- [ ] 100% of error factory methods have unit tests
- [ ] All existing tests pass with new error format

### Quality Metrics
- **Error Message Clarity**: 90%+ of error messages include actionable guidance
- **Consistency**: All errors in same category use same format pattern
- **Test Coverage**: 100% coverage of ErrorFactory methods
- **Code Reduction**: Reduce error handling boilerplate by ~30%

### User Experience Improvements
- Before: "FOR loop requires numeric values"
- After: "FOR loop requires numeric values (line 10): Expected number for START expression, received string"

- Before: "Invalid NEXT statement"
- After: "NEXT without FOR (line 15): Variable 'I' has no active loop. Check that every NEXT has a matching FOR statement."

## Long-term Vision

This standardization enables several future enhancements:

1. **AI-Assisted Error Recovery** (Idea #010)
   - Structured error format allows AI to suggest fixes
   - Error codes enable lookup in knowledge base
   - Context objects provide information for intelligent suggestions

2. **Interactive Debugging** (Idea #029)
   - Error catalog integration with breakpoint debugger
   - Click on error to jump to problematic line
   - Rich error display with suggested fixes

3. **Internationalization**
   - Error catalog supports multiple languages
   - Consistent translation strategy for all errors
   - Locale-aware error messages

4. **Error Analytics**
   - Track most common errors across users
   - Identify language features causing confusion
   - Improve documentation based on error patterns

5. **Teaching Mode**
   - Explain errors in beginner-friendly terms
   - Link to documentation for each error type
   - Provide examples of correct usage

## Risks and Mitigations

### Risk: Breaking changes to error format
**Mitigation**: ErrorFactory returns same BasicError interface, so consuming code doesn't change. Only message format changes, which is user-facing, not API-breaking.

### Risk: Large migration effort
**Mitigation**: Phased approach allows gradual migration. Start with new executors, then migrate high-traffic executors (FOR, NEXT, GOTO), then handle less common ones.

### Risk: Over-engineering
**Mitigation**: Focus on standardization first. Add advanced features (suggestions, recovery) only after basic standardization is complete.

### Risk: Performance impact
**Mitigation**: ErrorFactory is lightweight (template strings + object creation). Errors are exceptional paths, so performance impact is negligible.

## Dependencies

- **Blocks**: Idea #010 (Intelligent Error Recovery) - needs structured error format
- **Related to**: Idea #028 (Inline Command Documentation) - both improve UX
- **Related to**: Idea #029 (Interactive Breakpoint Debugger) - error display integration
- **Dependencies**: None (can be implemented independently)

## Team Assignment

**Primary Team**: Runtime
**Supporting Teams**:
- UI (for error display enhancements)
- Documentation (for error code reference)

## Next Steps

1. Review and approve this proposal
2. Create Phase 1 infrastructure
3. Implement ErrorFactory with common error types
4. Begin phased migration of executors
5. Update tests and documentation

## Open Questions

1. Should error messages include line numbers by default or leave to context?
   - **Recommendation**: Include in ErrorFactory for consistency

2. Should we deprecate direct `addError()` usage?
   - **Recommendation**: Yes, add JSDoc comment directing to ErrorFactory

3. How to handle errors in existing tests?
   - **Recommendation**: Update tests to use ErrorFactory, verify exact error format

4. Should error catalog be public API?
   - **Recommendation**: Yes, for documentation and IDE integration

---

**Status**: Draft
**Priority**: Medium (enables several higher-priority features)
**Complexity**: Low (well-scoped, focused refactoring)
