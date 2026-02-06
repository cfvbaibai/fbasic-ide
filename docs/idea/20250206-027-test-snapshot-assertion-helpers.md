# Strategic Idea: Test Snapshot Assertion Helpers

**Date**: 2026-02-06
**Turn**: 27
**Status**: Conceptual
**Focus Area**: Testing & Reliability / Developer Experience
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add **test snapshot assertion helpers** to the Family Basic IDE test suite that provide reusable, type-safe utilities for asserting F-BASIC program execution states—reducing test boilerplate, improving test readability, and making tests more maintainable.

## Problem Statement

### Current Test Maintenance Burden

1. **Repetitive Test Code**: Tests repeat similar assertion patterns
   - Each test manually checks screen buffer cell by cell
   - Cursor position checks duplicated across tests
   - Error verification code repeated
   - No shared patterns for common test scenarios

2. **Brittle Test Assertions**: Tests break easily with minor changes
   - Hard-coded indices make tests fragile
   - No semantic assertions (e.g., `assertScreenContains("HELLO")`)
   - Difficult to see what test is actually checking
   - Tests fail with unclear error messages

3. **Incomplete Test Coverage**: Writing comprehensive tests is tedious
   - Time-consuming to write full state assertions
   - Developers skip edge cases due to boilerplate fatigue
   - No easy way to test "partial screen" states
   - Snapshot testing not available for screen buffers

4. **Inconsistent Test Patterns**: Different tests use different approaches
   - Some use direct buffer access, others use adapter methods
   - No standard way to assert sprite states
   - Varied error checking patterns
   - Difficult to understand test intent at a glance

## Proposed Solution

### 1. Screen Assertion Helpers

Type-safe helpers for asserting screen buffer state:

```typescript
// test/helpers/screenAssertions.ts

/**
 * Assert that screen contains text at a specific position
 */
export function assertScreenText(
  screenBuffer: ScreenBuffer,
  text: string,
  options: {
    row?: number
    col?: number
    exact?: boolean  // Require exact match vs contains
  } = {}
): void

/**
 * Assert screen matches an expected text pattern
 * Uses multiline string for visual comparison
 */
export function assertScreenPattern(
  screenBuffer: ScreenBuffer,
  pattern: string,
  options: {
    trimTrailingSpaces?: boolean
    ignoreCursor?: boolean
  } = {}
): void

/**
 * Assert screen region matches expected content
 */
export function assertScreenRegion(
  screenBuffer: ScreenBuffer,
  region: { startRow: number; endRow: number; startCol: number; endCol: number },
  expected: string[][]
): void

/**
 * Snapshot helper - captures screen state as comparable object
 */
export function createScreenSnapshot(
  screenBuffer: ScreenBuffer
): ScreenSnapshot

/**
 * Assert screen matches snapshot
 */
export function assertScreenSnapshot(
  screenBuffer: ScreenBuffer,
  snapshot: ScreenSnapshot
): void

/**
 * Semantic assertions for common scenarios
 */
export const ScreenMatchers = {
  isEmpty: (buffer: ScreenBuffer) => boolean
  contains: (buffer: ScreenBuffer, text: string) => boolean
  startsWith: (buffer: ScreenBuffer, text: string) => boolean
  hasLine: (buffer: ScreenBuffer, line: number, text: string) => boolean
}
```

### 2. Sprite Assertion Helpers

Helpers for sprite state verification:

```typescript
// test/helpers/spriteAssertions.ts

/**
 * Assert sprite exists and has expected properties
 */
export function assertSpriteState(
  sprites: SpriteState[],
  spriteId: number,
  expected: Partial<SpriteState>
): void

/**
 * Assert sprite positions relative to each other
 */
export function assertSpritePositions(
  sprites: SpriteState[],
  relations: Array<[a: number, b: number, relation: 'above' | 'below' | 'left' | 'right']>
): void

/**
 * Assert no sprites overlap
 */
export function assertNoSpriteOverlap(sprites: SpriteState[]): void

/**
 * Count active sprites
 */
export function countActiveSprites(sprites: SpriteState[]): number
```

### 3. Execution Result Assertions

Helpers for interpreter execution results:

```typescript
// test/helpers/executionAssertions.ts

/**
 * Assert execution completed successfully
 */
export function assertSuccess(
  result: ExecutionResult,
  message?: string
): void

/**
 * Assert execution failed with specific error
 */
export function assertError(
  result: ExecutionResult,
  errorType: string,
  expectedMessage?: string | RegExp
): void

/**
 * Assert output contains expected lines
 */
export function assertOutputContains(
  result: ExecutionResult,
  expectedLines: string[],
  options?: { order?: boolean; exact?: boolean }
): void

/**
 * Assert execution hit expected line numbers
 */
export function assertExecutionPath(
  result: ExecutionResult,
  expectedLines: number[]
): void

/**
 * Chainable assertion builder
 */
export class ExecutionAssertions {
  constructor(private result: ExecutionResult) {}

  succeeds(): this {
    if (!this.result.success) {
      throw new Error(`Execution failed: ${this.result.errors.join(', ')}`)
    }
    return this
  }

  failsWith(expectedError: string): this {
    expect(this.result.success).toBe(false)
    expect(this.result.errors).toContain(expectedError)
    return this
  }

  hasOutput(expected: string): this {
    expect(this.result.output).toContain(expected)
    return this
  }

  // ... more fluent methods
}

export function expectExecution(result: ExecutionResult): ExecutionAssertions {
  return new ExecutionAssertions(result)
}
```

### 4. Shared Buffer Assertions

Helpers for shared buffer state verification:

```typescript
// test/helpers/bufferAssertions.ts

/**
 * Assert display buffer contains expected screen content
 */
export function assertDisplayBufferScreen(
  views: SharedDisplayViews,
  expectedScreen: ScreenSnapshot
): void

/**
 * Assert cursor position
 */
export function assertCursor(
  views: SharedDisplayViews,
  expected: { x: number; y: number }
): void

/**
 * Assert color palette settings
 */
export function assertPalette(
  views: SharedDisplayViews,
  expected: { bgPalette?: number; spritePalette?: number; backdropColor?: number }
): void

/**
 * Assert sprite position in animation buffer
 */
export function assertAnimationSpritePosition(
  view: Float64Array,
  spriteId: number,
  expected: { x: number; y: number; isActive?: boolean }
): void

/**
 * Assert sequence number increased
 */
export function assertSequenceIncreased(
  views: SharedDisplayViews,
  previousSequence: number
): void
```

### 5. Test Builder Pattern

Fluent API for building test scenarios:

```typescript
// test/helpers/testBuilder.ts

export class FBasicTestBuilder {
  private code: string[] = []
  private adapter?: SharedBufferTestAdapter
  private sharedDisplayBuffer?: SharedArrayBuffer
  private sharedAnimationBuffer?: SharedArrayBuffer

  static create(): FBasicTestBuilder {
    return new FBasicTestBuilder()
  }

  withCode(code: string | string[]): this {
    this.code.push(...(Array.isArray(code) ? code : [code]))
    return this
  }

  withSharedBuffers(): this {
    const displayBuf = createSharedDisplayBuffer()
    this.sharedDisplayBuffer = displayBuf.buffer

    const { buffer: animBuf } = createSharedAnimationBuffer()
    this.sharedAnimationBuffer = animBuf

    this.adapter = new SharedBufferTestAdapter()
    this.adapter.setSharedDisplayBuffer(this.sharedDisplayBuffer)
    this.adapter.configure({
      enableDisplayBuffer: true,
      enableAnimationBuffer: true,
    })

    return this
  }

  async execute(): Promise<TestResult> {
    const interpreter = new BasicInterpreter({
      maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_TEST,
      maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES_TEST,
      deviceAdapter: this.adapter ?? new SharedBufferTestAdapter(),
      sharedDisplayBuffer: this.sharedDisplayBuffer,
      sharedAnimationBuffer: this.sharedAnimationBuffer,
    })

    const result = await interpreter.execute(this.code.join('\n'))

    return {
      result,
      screenBuffer: this.adapter?.getScreenBuffer(),
      displayViews: this.sharedDisplayBuffer ? createViewsFromDisplayBuffer(this.sharedDisplayBuffer) : undefined,
      animationView: this.sharedAnimationBuffer ? new Float64Array(this.sharedAnimationBuffer) : undefined,
      adapter: this.adapter,
    }
  }
}

interface TestResult {
  result: ExecutionResult
  screenBuffer?: ScreenBuffer
  displayViews?: SharedDisplayViews
  animationView?: Float64Array
  adapter?: SharedBufferTestAdapter
}
```

## Implementation Phases

### Phase 1: Core Screen Assertions (Week 1, Days 1-3)

**Goal**: Provide basic screen content assertion helpers

1. **Create assertion module**: `test/helpers/screenAssertions.ts`
2. **Implement basic functions**:
   - `assertScreenText()` - Position-based text assertion
   - `assertScreenPattern()` - Multiline pattern matching
   - `assertScreenRegion()` - Regional assertions
3. **Add comprehensive tests**: `test/helpers/screenAssertions.test.ts`
4. **Document usage patterns**

**Files to Create**:
- `test/helpers/screenAssertions.ts` (~200 lines)
- `test/helpers/screenAssertions.test.ts` (~150 lines)
- `test/helpers/types.ts` - Shared types for helpers (~50 lines)

**Acceptance Criteria**:
- `assertScreenText(buffer, "HELLO", { row: 0, col: 0 })` works
- `assertScreenPattern()` supports visual multiline patterns
- All helper functions have >90% test coverage
- Error messages clearly indicate what failed and why

### Phase 2: Sprite and Execution Assertions (Week 1, Days 4-5)

**Goal**: Add helpers for sprites and execution results

1. **Create sprite assertions**: `test/helpers/spriteAssertions.ts`
2. **Create execution assertions**: `test/helpers/executionAssertions.ts`
3. **Implement chainable API**: `ExecutionAssertions` class
4. **Add tests for new helpers**

**Files to Create**:
- `test/helpers/spriteAssertions.ts` (~100 lines)
- `test/helpers/spriteAssertions.test.ts` (~80 lines)
- `test/helpers/executionAssertions.ts` (~150 lines)
- `test/helpers/executionAssertions.test.ts` (~100 lines)

**Acceptance Criteria**:
- `assertSpriteState()` verifies sprite properties
- `expectExecution(result).succeeds().hasOutput("HELLO")` works
- Clear error messages for assertion failures
- Full test coverage

### Phase 3: Buffer Assertions and Test Builder (Week 2, Days 1-3)

**Goal**: Simplify shared buffer testing and test setup

1. **Create buffer assertions**: `test/helpers/bufferAssertions.ts`
2. **Implement test builder**: `test/helpers/testBuilder.ts`
3. **Migrate existing tests** to use new helpers (demonstrate value)
4. **Add before/after comparison** showing code reduction

**Files to Create**:
- `test/helpers/bufferAssertions.ts` (~120 lines)
- `test/helpers/bufferAssertions.test.ts` (~100 lines)
- `test/helpers/testBuilder.ts` (~150 lines)
- `test/helpers/testBuilder.test.ts` (~80 lines)

**Files to Modify** (demonstration):
- `test/integration/SharedBufferIntegration.test.ts` - Refactor some tests using new helpers

**Acceptance Criteria**:
- `assertDisplayBufferScreen()` verifies shared buffer content
- `FBasicTestBuilder.create().withSharedBuffers().execute()` works
- At least 3 existing tests refactored to show code reduction
- Documentation shows before/after examples

### Phase 4: Advanced Features and Polish (Week 2, Days 4-5)

**Goal**: Add snapshot support and finalize documentation

1. **Implement snapshot infrastructure**: `test/helpers/snapshot.ts`
2. **Create snapshot update script**: `pnpm test:snapshot:update`
3. **Write comprehensive documentation**: `test/helpers/README.md`
4. **Add VS Code snippets** for common test patterns

**Files to Create**:
- `test/helpers/snapshot.ts` (~100 lines)
- `test/helpers/snapshot.test.ts` (~50 lines)
- `test/helpers/README.md` (~300 lines)
- `.vscode/snippets/test-helpers.code-snippets` (~50 lines)

**Files to Modify**:
- `package.json` - Add test helper scripts
- `vitest.config.ts` - Configure snapshot settings

**Acceptance Criteria**:
- Snapshot creation and comparison works
- Documentation has examples for every helper
- Code snippets available in VS Code
- All helpers documented with JSDoc

## Usage Examples

### Before: Verbose Test Code

```typescript
// Current approach - repetitive and unclear
it('should print text at correct position', async () => {
  const adapter = new SharedBufferTestAdapter()
  const interpreter = new BasicInterpreter({
    maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_TEST,
    maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES_TEST,
    deviceAdapter: adapter,
  })

  await interpreter.execute('10 PRINT "HELLO"\n20 END')

  const screen = adapter.getScreenBuffer()
  expect(screen[0]![0]!.character).toBe('H')
  expect(screen[0]![1]!.character).toBe('E')
  expect(screen[0]![2]!.character).toBe('L')
  expect(screen[0]![3]!.character).toBe('L')
  expect(screen[0]![4]!.character).toBe('O')
})
```

### After: Clear and Concise

```typescript
// With helpers - clear intent, less code
import { assertScreenText } from '@/helpers/screenAssertions'
import { FBasicTestBuilder } from '@/helpers/testBuilder'

it('should print text at correct position', async () => {
  const { screenBuffer } = await FBasicTestBuilder.create()
    .withCode('10 PRINT "HELLO"\n20 END')
    .execute()

  assertScreenText(screenBuffer, 'HELLO', { row: 0, col: 0, exact: true })
})
```

### Complex Test Example

```typescript
import { assertScreenPattern, assertPalette } from '@/helpers/screenAssertions'
import { assertSpriteState } from '@/helpers/spriteAssertions'
import { expectExecution } from '@/helpers/executionAssertions'

it('should handle complex game scenario', async () => {
  const { result, screenBuffer, adapter } = await FBasicTestBuilder.create()
    .withSharedBuffers()
    .withCode(`
      10 CGSET 0,1
      20 PRINT "SCORE: 100"
      30 DEF SPRITE 0,(1,0,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
      40 SPRITE ON
      50 END
    `)
    .execute()

  // Fluent execution assertions
  expectExecution(result)
    .succeeds()
    .hasOutput('SCORE: 100')

  // Screen pattern matching
  assertScreenPattern(screenBuffer, `
    SCORE: 100
  `)

  // Palette verification
  assertPalette(adapter.getDisplayViews(), { bgPalette: 1 })

  // Sprite state check
  const sprites = adapter?.getSpriteStates()
  assertSpriteState(sprites, 0, { isActive: true })
})
```

## Technical Architecture

### New Helper Infrastructure

```
test/helpers/
├── index.ts                      # Main export barrel
├── types.ts                      # Shared helper types
├── screenAssertions.ts          # Screen buffer assertions
├── spriteAssertions.ts          # Sprite state assertions
├── executionAssertions.ts       # Execution result assertions
├── bufferAssertions.ts          # Shared buffer assertions
├── testBuilder.ts               # Test scenario builder
├── snapshot.ts                  # Snapshot infrastructure
├── formatters.ts                # Error message formatters
└── README.md                    # Usage documentation
```

### Type Safety

All helpers use strict TypeScript types:

```typescript
// test/helpers/types.ts
export interface ScreenSnapshot {
  width: number
  height: number
  lines: Array<{
    number: number
    text: string
    cells: Array<{
      char: string
      code: number
      pattern: number
    }>
  }>
  cursor: { x: number; y: number }
}

export interface AssertionOptions {
  partial?: boolean
  trimSpaces?: boolean
  ignoreCursor?: boolean
  customMessage?: string
}
```

### Integration with Existing Tests

Helpers are **additive**, not breaking:
- Existing tests continue to work unchanged
- Migration is gradual and opt-in
- No changes to core interpreter or adapter code
- Pure test infrastructure addition

## Benefits

### Immediate Benefits

1. **Reduced Boilerplate**: Tests become 50-70% shorter
2. **Better Readability**: Test intent is immediately clear
3. **Faster Test Writing**: Less code to write for new tests
4. **Clearer Failures**: Descriptive error messages

### Long-Term Benefits

1. **Easier Maintenance**: Changes to assertions propagate to all tests
2. **Onboarding**: New developers can write tests faster
3. **Consistency**: All tests use same patterns
4. **Documentation**: Helpers serve as living documentation

### Developer Experience Impact

- **Before**: Writing a comprehensive test = 30-50 lines of repetitive code
- **After**: Writing the same test = 5-10 lines of clear, semantic assertions

## Success Metrics

### Adoption Metrics
- **% of tests using helpers**: Target 50% within 1 month
- **New test code reduction**: Target 60% fewer lines per test
- **Test readability score**: Survey developer satisfaction

### Quality Metrics
- **Test coverage of helpers**: Must be >90%
- **Assertion helper bugs**: Target 0 in production
- **Test flakiness reduction**: Track flaky test rate

### Developer Experience
- **Time to write new test**: Measure before/after
- **Test maintenance effort**: Track time spent modifying tests
- **Error clarity**: Measure debugging time for failing tests

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Helpers become abstraction over abstraction | Keep helpers simple, focused on assertions only |
| Tests too dependent on helpers | Always allow direct access to underlying data |
| Helper bugs cause widespread test failures | Comprehensive helper test suite >90% coverage |
| Learning curve for new API | Extensive documentation and examples |
| Performance overhead | Helpers are lightweight, just assertions |

## Open Questions

1. **Snapshot storage**: Store snapshots in git or generate dynamically?
2. **Snapshot format**: JSON or custom binary format for performance?
3. **Helper granularity**: Fine-grained functions or higher-level scenarios?
4. **Migration strategy**: Automated migration tool or manual refactoring?

## Next Steps

1. **Prototype**: Build `assertScreenText()` and `assertScreenPattern()` first
2. **Validate**: Use in actual tests to prove value
3. **Iterate**: Refine API based on real usage
4. **Expand**: Add more helpers incrementally
5. **Document**: Create comprehensive examples

## Implementation Details

### Specific Files to Create

**1. test/helpers/index.ts** - Main export barrel
```typescript
export * from './screenAssertions'
export * from './spriteAssertions'
export * from './executionAssertions'
export * from './bufferAssertions'
export * from './testBuilder'
export * from './snapshot'
export * from './types'
```

**2. test/helpers/screenAssertions.ts** - Core implementation
```typescript
import { ScreenBuffer } from '@/core/interfaces'

export function assertScreenText(
  screenBuffer: ScreenBuffer,
  text: string,
  options: { row?: number; col?: number; exact?: boolean } = {}
): void {
  const { row = 0, col = 0, exact = false } = options

  for (let i = 0; i < text.length; i++) {
    const actualChar = screenBuffer[row]?.[col + i]?.character
    const expectedChar = text[i]

    if (actualChar !== expectedChar) {
      throw new Error(
        `Expected '${expectedChar}' at position (${row}, ${col + i}) ` +
        `but found '${actualChar}'.\n` +
        `Expected text: "${text}"\n` +
        `Actual line: "${screenBuffer[row]?.map(c => c.character).join('') ?? ''}"`
      )
    }
  }

  if (exact) {
    // Check that next character is not the same (exact match)
    const nextChar = screenBuffer[row]?.[col + text.length]?.character
    if (nextChar && nextChar !== ' ') {
      throw new Error(
        `Expected exact match of "${text}" but found additional character '${nextChar}'`
      )
    }
  }
}

// ... more functions
```

**3. test/helpers/testBuilder.ts** - Test scenario builder
```typescript
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { EXECUTION_LIMITS } from '@/core/constants'
import { SharedBufferTestAdapter } from '../adapters/SharedBufferTestAdapter'
import {
  createSharedDisplayBuffer,
  createViewsFromDisplayBuffer,
  type SharedDisplayViews,
} from '@/core/animation/sharedDisplayBuffer'
import {
  createSharedAnimationBuffer,
} from '@/core/animation/sharedAnimationBuffer'

export class FBasicTestBuilder {
  // ... implementation as shown above
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "test:helpers": "vitest run test/helpers/",
    "test:snapshot:update": "vitest run -u",
    "test:coverage:helpers": "vitest run --coverage test/helpers/"
  }
}
```

### Acceptance Criteria

**Week 1:**
- [ ] `test/helpers/` directory created with basic structure
- [ ] `assertScreenText()`, `assertScreenPattern()`, `assertScreenRegion()` work
- [ ] `assertSpriteState()`, `countActiveSprites()` work
- [ ] `expectExecution().succeeds().hasOutput()` works
- [ ] All helpers have comprehensive tests
- [ ] Helper test coverage >90%

**Week 2:**
- [ ] `FBasicTestBuilder` fluent API works
- [ ] Buffer assertions for shared buffers work
- [ ] Snapshot creation and comparison works
- [ ] At least 5 existing tests refactored using helpers
- [ ] README.md with examples for every helper
- [ ] VS Code snippets available
- [ ] Documentation shows before/after comparisons

---

*"Good tests are readable tests. By reducing boilerplate and adding semantic meaning to assertions, we make tests easier to write, easier to read, and easier to maintain—letting tests serve as living documentation rather than maintenance burden."*
