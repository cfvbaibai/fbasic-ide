# BASIC Test Assertion Helpers

**Date:** 2025-02-06
**Turn:** 39
**Status:** Conceptual
**Focus Area:** Testing & Developer Experience
**Type:** SMALL (Focused feature implementable in 3-5 days)

## Vision

Create **domain-specific test assertion helpers** for BASIC program testing that make integration tests more readable, maintainable, and expressive—reducing boilerplate and improving test clarity.

## Problem Statement

### Current Test Code Issues

The existing test suite has several readability and maintainability issues:

1. **Verbose Assertion Patterns**: Tests use repetitive `.toEqual()` chains
   ```typescript
   // Current verbose pattern
   expect(result.output).toEqual(['Hello', 'World'])
   expect(result.variables.get('A')).toEqual(42)
   expect(result.variables.get('B$')).toEqual('test')
   expect(result.screenBuffer[0][0].character).toEqual('H')
   expect(result.screenBuffer[0][1].character).toEqual('e')
   ```

2. **Lack of Domain-Specific Helpers**: No BASIC-specific assertions
   - Must manually construct screen buffer expectations
   - No helper for "variable X should equal Y"
   - No helper for "screen row Y should show text Z"
   - No helper for "sprite N should be at position (X,Y)"

3. **Test Fragility**: Tests break when output formats change slightly
   - Array length mismatches cause confusing errors
   - No semantic error messages ("expected output to contain 'Hello'" vs "expected ['Hello'] to equal ['World']")
   - Hard to debug which specific assertion failed

4. **Inconsistent Test Patterns**: Different developers use different patterns
   - Some use `.toEqual()`, some use `.toMatchObject()`
   - Screen buffer testing varies between tests
   - No standard patterns for common assertions

5. **Missing Snapshot Utilities**: No easy way to assert program state
   - Can't easily capture and compare full program state
   - No built-in snapshot mechanism for regression testing
   - Hard to verify complex programs produce correct output

### Example: Current Test Code

```typescript
// Current approach - verbose and repetitive
it('should execute PRINT and variable assignment', async () => {
  const code = `10 A=42
20 PRINT "Result:";A
30 END`

  const result = await interpreter.run(code)
  expect(result.success).toBe(true)
  expect(result.output).toEqual(['Result:', '42'])
  expect(result.variables.get('A')).toEqual(42)
  expect(result.errors).toEqual([])
})
```

## Proposed Solution

Create a set of **domain-specific test assertion helpers** that encapsulate common BASIC testing patterns, making tests more readable and maintainable.

### Architecture

#### 1. BASIC Assertion Library (`test/helpers/basic-assertions.ts`)

```typescript
/**
 * Domain-specific assertion helpers for BASIC program testing
 * Makes integration tests more readable and maintainable
 */

import { expect } from 'vitest'
import type { ExecutionResult, ScreenCell } from '@/core/interfaces'

/**
 * Fluent assertion builder for BASIC program execution results
 */
export class BasicAssertions {
  constructor(private result: ExecutionResult) {}

  /**
   * Assert execution was successful
   */
  succeeds(message?: string): this {
    expect(this.result.success).toBe(true)
    return this
  }

  /**
   * Assert execution failed
   */
  fails(message?: string): this {
    expect(this.result.success).toBe(false)
    return this
  }

  /**
   * Assert output contains specific lines (in order)
   */
  hasOutput(...lines: string[]): this {
    expect(this.result.output).toEqual(lines)
    return this
  }

  /**
   * Assert output contains text (anywhere, order-independent)
   */
  outputContains(...texts: string[]): this {
    for (const text of texts) {
      expect(this.result.output.some(line => line.includes(text))).toBe(true)
    }
    return this
  }

  /**
   * Assert numeric variable value
   */
  hasVariable(name: string, value: number): this {
    expect(this.result.variables.get(name)).toEqual(value)
    return this
  }

  /**
   * Assert string variable value
   */
  hasStringVariable(name: string, value: string): this {
    expect(this.result.variables.get(name)).toEqual(value)
    return this
  }

  /**
   * Assert array variable value
   */
  hasArrayVariable(name: string, indices: number[], value: number | string): this {
    const array = this.result.variables.get(name) as number[][]
    expect(array).toBeDefined()
    let current = array
    for (let i = 0; i < indices.length - 1; i++) {
      current = current[indices[i]] as number[][]
    }
    expect(current[indices[indices.length - 1]]).toEqual(value)
    return this
  }

  /**
   * Assert screen content at specific position
   */
  hasScreenAt(x: number, y: number, character: string, colorPattern?: number): this {
    const cell = this.result.screenBuffer?.[y]?.[x]
    expect(cell).toBeDefined()
    expect(cell?.character).toEqual(character)
    if (colorPattern !== undefined) {
      expect(cell?.colorPattern).toEqual(colorPattern)
    }
    return this
  }

  /**
   * Assert screen row contains specific text
   */
  hasScreenRow(row: number, text: string): this {
    const rowCells = this.result.screenBuffer?.[row]
    expect(rowCells).toBeDefined()
    const rowText = rowCells?.map(c => c.character).join('')
    expect(rowText).toContain(text)
    return this
  }

  /**
   * Assert screen shows specific text (anywhere on screen)
   */
  screenContains(text: string): this {
    const allText = this.result.screenBuffer
      ?.map(row => row.map(c => c.character).join(''))
      .join('\n')
    expect(allText).toContain(text)
    return this
  }

  /**
   * Assert cursor position
   */
  hasCursorAt(x: number, y: number): this {
    expect(this.result.cursorX).toEqual(x)
    expect(this.result.cursorY).toEqual(y)
    return this
  }

  /**
   * Assert sprite position
   */
  hasSpriteAt(spriteNumber: number, x: number, y: number): this {
    const pos = this.result.spritePositions?.get(spriteNumber)
    expect(pos).toEqual({ x, y })
    return this
  }

  /**
   * Assert sprite is active
   */
  hasActiveSprite(spriteNumber: number): this {
    expect(this.result.activeSprites).toContain(spriteNumber)
    return this
  }

  /**
   * Assert error message
   */
  hasError(message: string): this {
    expect(this.result.errors.some(e => e.message.includes(message))).toBe(true)
    return this
  }

  /**
   * Assert no errors
   */
  hasNoErrors(): this {
    expect(this.result.errors).toEqual([])
    return this
  }

  /**
   * Assert execution iterations
   */
  hasIterations(min: number, max?: number): this {
    expect(this.result.iterationCount).toBeGreaterThanOrEqual(min)
    if (max !== undefined) {
      expect(this.result.iterationCount).toBeLessThanOrEqual(max)
    }
    return this
  }
}

/**
 * Create assertion builder for execution result
 */
export function expectBasic(result: ExecutionResult): BasicAssertions {
  return new BasicAssertions(result)
}

/**
 * Quick assertion helper for simple execution tests
 */
export function assertOutput(code: string, expectedOutput: string[]): Promise<void>
export function assertOutput(
  code: string,
  expectedOutput: string[],
  options?: {
    variables?: Record<string, number | string>
    errors?: string[]
  }
): Promise<void>

export async function assertOutput(
  code: string,
  expectedOutput: string[],
  options?: {
    variables?: Record<string, number | string>
    errors?: string[]
  }
): Promise<void> {
  const interpreter = new BasicInterpreter()
  const result = await interpreter.run(code)

  const assertions = expectBasic(result)
    .succeedes()
    .hasOutput(...expectedOutput)

  if (options?.variables) {
    for (const [name, value] of Object.entries(options.variables)) {
      if (typeof value === 'number') {
        assertions.hasVariable(name, value)
      } else {
        assertions.hasStringVariable(name, value)
      }
    }
  }

  if (options?.errors) {
    for (const error of options.errors) {
      assertions.hasError(error)
    }
  } else {
    assertions.hasNoErrors()
  }
}
```

#### 2. Screen Assertion Helpers (`test/helpers/screen-assertions.ts`)

```typescript
/**
 * Screen buffer assertion helpers
 */

import type { ScreenCell } from '@/core/interfaces'

/**
 * Create screen buffer from ASCII art (for test expectations)
 *
 * @example
 * const expectedScreen = screenFromArt(`
 *   Hello
 *   World
 * `)
 */
export function screenFromArt(art: string): ScreenCell[][] {
  const lines = art.trim().split('\n').map(l => l.trimEnd())
  return lines.map((line, y) =>
    line.split('').map((char, x) => ({
      character: char,
      colorPattern: 0,
      x,
      y,
    }))
  )
}

/**
 * Assert screen matches ASCII art expectation
 */
export function expectScreenMatches(actual: ScreenCell[][], expectedArt: string): void {
  const expected = screenFromArt(expectedArt)
  expect(actual.length).toBe(expected.length)

  for (let y = 0; y < expected.length; y++) {
    expect(actual[y].length).toBe(expected[y].length)

    for (let x = 0; x < expected[y].length; x++) {
      expect({
        char: actual[y][x].character,
        pattern: actual[y][x].colorPattern,
      }).toEqual({
        char: expected[y][x].character,
        pattern: expected[y][x].colorPattern,
      })
    }
  }
}

/**
 * Get screen text as string (for debugging)
 */
export function getScreenText(screen: ScreenCell[][]): string {
  return screen.map(row => row.map(c => c.character).join('')).join('\n')
}

/**
 * Assert screen contains text pattern (wildcard support)
 */
export function expectScreenPattern(
  screen: ScreenCell[][],
  pattern: string,
  options?: { ignoreCase?: boolean; ignoreWhitespace?: boolean }
): void {
  const screenText = getScreenText(screen)
  let patternText = pattern
  let searchText = screenText

  if (options?.ignoreCase) {
    patternText = patternText.toLowerCase()
    searchText = searchText.toLowerCase()
  }

  if (options?.ignoreWhitespace) {
    patternText = patternText.replace(/\s+/g, ' ')
    searchText = searchText.replace(/\s+/g, ' ')
  }

  // Support wildcards (*)
  const regexPattern = patternText.replace(/\*/g, '.*')
  const regex = new RegExp(regexPattern)
  expect(searchText).toMatch(regex)
}
```

#### 3. Snapshot Helpers (`test/helpers/snapshot-helpers.ts`)

```typescript
/**
 * Snapshot testing helpers for BASIC programs
 */

import type { ExecutionResult } from '@/core/interfaces'

/**
 * Create serializable snapshot of execution result
 */
export function createSnapshot(result: ExecutionResult): {
  output: string[]
  variables: Record<string, number | string>
  screen: string
  cursor: { x: number; y: number }
  errors: Array<{ line: number; message: string }>
} {
  return {
    output: result.output,
    variables: Object.fromEntries(result.variables),
    screen: result.screenBuffer
      ?.map(row => row.map(c => c.character).join(''))
      .join('\n') ?? '',
    cursor: { x: result.cursorX, y: result.cursorY },
    errors: result.errors.map(e => ({
      line: e.line,
      message: e.message,
    })),
  }
}

/**
 * Assert snapshot matches (inline snapshot)
 */
export function expectSnapshot(
  result: ExecutionResult,
  expected: ReturnType<typeof createSnapshot>
): void {
  expect(createSnapshot(result)).toEqual(expected)
}

/**
 * Generate snapshot string for manual review
 */
export function formatSnapshot(result: ExecutionResult): string {
  const snapshot = createSnapshot(result)
  return `
=== OUTPUT ===
${snapshot.output.map((l, i) => `${i + 1}: ${l}`).join('\n')}

=== VARIABLES ===
${Object.entries(snapshot.variables)
  .map(([k, v]) => `  ${k} = ${v}`)
  .join('\n')}

=== SCREEN ===
${snapshot.screen}

=== CURSOR ===
  (${snapshot.cursor.x}, ${snapshot.cursor.y})

=== ERRORS ===
${snapshot.errors.length > 0 ? snapshot.errors.map(e => `  Line ${e.line}: ${e.message}`).join('\n') : '  (none)'}

=== END ===
  `.trim()
}
```

## Implementation Phases

### Phase 1: Core Assertion Helpers (Day 1)
**Files to create:**
- `test/helpers/basic-assertions.ts` - Main assertion library
- `test/helpers/types.ts` - Test-specific types

**Tasks:**
1. Implement BasicAssertions class
2. Add core assertion methods (success, output, variables, errors)
3. Create expectBasic() helper function
4. Add unit tests for assertion helpers
5. Document usage patterns

### Phase 2: Screen Assertion Helpers (Day 2)
**Files to create:**
- `test/helpers/screen-assertions.ts` - Screen-specific assertions

**Tasks:**
1. Implement screenFromArt() for ASCII art test expectations
2. Add expectScreenMatches() for screen comparison
3. Implement getScreenText() for debugging
4. Add expectScreenPattern() for wildcard matching
5. Add unit tests

### Phase 3: Snapshot Helpers (Day 3)
**Files to create:**
- `test/helpers/snapshot-helpers.ts` - Snapshot utilities

**Tasks:**
1. Implement createSnapshot() for result serialization
2. Add expectSnapshot() for snapshot comparison
3. Implement formatSnapshot() for manual review
4. Add CLI command to generate snapshots from test runs
5. Add unit tests

### Phase 4: Migration & Documentation (Days 4-5)
**Files to modify:**
- Migrate 5-10 existing tests to use new helpers
- Create migration guide for remaining tests

**Tasks:**
1. Select representative tests for migration
2. Refactor tests to use new assertion helpers
3. Verify all tests still pass
4. Create documentation with examples
5. Add JSDoc comments to all helpers

## Usage Examples

### Before: Verbose Test Code

```typescript
it('should execute PRINT with variables', async () => {
  const code = `10 A=5
20 B=10
30 PRINT "Sum:";A+B
40 PRINT "Product:";A*B
50 END`

  const interpreter = new BasicInterpreter()
  const result = await interpreter.run(code)

  expect(result.success).toBe(true)
  expect(result.output).toEqual(['Sum:', '15', 'Product:', '50'])
  expect(result.variables.get('A')).toEqual(5)
  expect(result.variables.get('B')).toEqual(10)
  expect(result.errors).toEqual([])
})
```

### After: Fluent Assertion Helpers

```typescript
it('should execute PRINT with variables', async () => {
  const code = `10 A=5
20 B=10
30 PRINT "Sum:";A+B
40 PRINT "Product:";A*B
50 END`

  const interpreter = new BasicInterpreter()
  const result = await interpreter.run(code)

  expectBasic(result)
    .succeedes()
    .hasOutput('Sum:', '15', 'Product:', '50')
    .hasVariable('A', 5)
    .hasVariable('B', 10)
    .hasNoErrors()
})
```

### Quick Assertion Helper

```typescript
// Even simpler for straightforward tests
it('should add two numbers', async () => {
  await assertOutput(`10 A=5+3
20 PRINT A`, ['5'])
})

it('should handle string concatenation', async () => {
  await assertOutput(`10 A$="Hello"
20 B$="World"
30 PRINT A$;" ";B$`, ['Hello World'], {
    variables: {
      'A$': 'Hello',
      'B$': 'World',
    },
  })
})
```

### Screen Testing with ASCII Art

```typescript
it('should render text to screen', async () => {
  const code = `10 PRINT "Hello"
20 PRINT "World"
30 END`

  const result = await interpreter.run(code)
  expectBasic(result).screenContains('Hello')

  // Or use ASCII art for exact match
  expectScreenMatches(result.screenBuffer, `
    Hello
    World
  `)
})
```

## Success Metrics

### Completion Criteria
- [ ] BasicAssertions class with 15+ assertion methods
- [ ] Screen assertion helpers with ASCII art support
- [ ] Snapshot helpers for regression testing
- [ ] 100% test coverage for all helper functions
- [ ] Migrated 5+ existing tests to use new helpers
- [ ] Documentation with usage examples

### Quality Metrics
- **Test Readability**: Test code reduced by ~40%
- **Boilerplate Reduction**: 60% less repetitive assertion code
- **Error Messages**: Domain-specific error messages ("expected variable A to be 42, got 0")
- **Maintenance**: New test patterns reduce cognitive load

## Long-term Vision

This test helper infrastructure enables several future enhancements:

1. **Visual Test Regression** - Screen snapshots can be used for visual regression testing
2. **Program State Inspector** - Snapshots can be logged for debugging failed tests
3. **Test Generator** - AI can generate tests using these helper patterns
4. **Performance Baselines** - Snapshots can include timing metrics for regression detection
5. **Cross-Platform Testing** - Snapshot format is portable across test frameworks

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Test framework lock-in | Helpers wrap Vitest, can be adapted for Jest/other frameworks |
| Abstraction leakage | Helpers provide escape hatch for custom assertions |
| Maintenance burden | Helpers are self-contained and well-tested |
| Adoption friction | Gradual migration; old tests continue to work |

## Dependencies

- **Related to**: Idea #038 (Execution State Snapshot Testing) - snapshot format compatibility
- **Dependencies**: None (can be implemented independently)
- **Enables**: Better test coverage for new features

## Team Assignment

**Primary Team**: Testing & Quality (cross-team effort)
**Supporting Teams**:
- Runtime (for ExecutionResult type stability)
- Platform (for screen buffer testing patterns)

## Next Steps

1. Review and approve this proposal
2. Implement Phase 1 (core assertion helpers)
3. Add screen assertion helpers
4. Create snapshot utilities
5. Begin migrating existing tests
6. Update testing documentation

---

*"Good tests are readable tests. Domain-specific assertion helpers turn test code into a specification that reads like documentation."*
