# Execution State Snapshot Testing

**Date:** 2025-02-06
**Turn:** 38
**Status:** Conceptual
**Focus Area:** Testing & Reliability
**Type:** SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add **execution state snapshot testing** to the Family Basic IDE that allows developers to capture the complete program execution state (variables, arrays, loops, call stacks) as JSON snapshots and verify against expected states—making complex regression tests easier to write, maintain, and debug.

## Problem Statement

### Current Testing Limitations

1. **Complex State Assertions are Verbose**: Testing program state requires many individual assertions
   - Must assert each variable separately: `expect(context.variables.get('A')).toEqual(5)`
   - Arrays require nested loops or verbose assertions
   - Loop stack state requires deep object inspection
   - GOSUB call stack requires manual verification
   - Tests become long and hard to read

2. **Regression Detection is Difficult**: Hard to spot unintended state changes
   - No easy way to compare "before" and "after" states
   - Must manually verify all expected values
   - Easy to miss edge cases in complex programs
   - No built-in way to detect state drift

3. **Test Maintenance Burden**: Updating tests is tedious
   - Adding a new variable requires updating multiple tests
   - Changing program logic requires updating many assertions
   - No automated snapshot update workflow
   - Hard to identify which tests need updating

4. **Debugging Test Failures is Hard**: Unclear what changed when tests fail
   - Must manually compare expected vs actual values
   - No diff visualization for state changes
   - Difficult to identify the root cause
   - Time-consuming to investigate failures

5. **No State History**: Cannot see how state evolved during execution
   - Cannot inspect intermediate states
   - No way to trace state changes step-by-step
   - Difficult to understand execution flow
   - Hard to reproduce complex bugs

### Current Test Example (Verbose)

```typescript
// Current approach - many individual assertions
test('FOR loop with nested GOSUB maintains correct state', async () => {
  const adapter = new TestDeviceAdapter()
  const context = new ExecutionContext({ maxIterations: 1000, enableDebugMode: false })
  context.deviceAdapter = adapter

  await executeProgram(context, `
    10 A=0
    20 FOR I=1 TO 3
    30 GOSUB 100
    40 NEXT
    50 END
    100 A=A+I
    110 RETURN
  `)

  // Verbose assertions
  expect(context.variables.get('A')).toEqual(6)    // 1+2+3
  expect(context.variables.get('I')).toEqual(4)    // After loop completion
  expect(context.loopStack).toEqual([])            // Loop completed
  expect(context.gosubStack).toEqual([])            // GOSUB returned
  expect(context.currentStatementIndex).toBeGreaterThan(0)
  expect(context.isRunning).toBe(false)
})
```

## Proposed Solution

### 1. State Snapshot Serialization

Add snapshot serialization to ExecutionContext:

```typescript
// src/core/state/ExecutionContext.ts
export interface ExecutionStateSnapshot {
  // Program state
  variables: Record<string, { type: 'number' | 'string', value: unknown }>
  arrays: Record<string, {
    dimensions: number[]
    values: unknown[]
  }>

  // Control flow
  loopStack: Array<{
    variableName: string
    startValue: number
    endValue: number
    stepValue: number
    currentValue: number
    statementIndex: number
  }>
  gosubStack: number[]

  // Execution state
  currentStatementIndex: number
  currentLineNumber: number
  iterationCount: number
  isRunning: boolean
  shouldStop: boolean

  // Data state
  dataIndex: number
  dataValues: unknown[]

  // Metadata
  timestamp: number
  programHash?: string  // For detecting source changes
}

export class ExecutionContext {
  // ... existing properties ...

  /**
   * Capture current execution state as a JSON-serializable snapshot
   */
  snapshot(): ExecutionStateSnapshot {
    return {
      variables: Object.fromEntries(
        Array.from(this.variables.entries()).map(([name, value]) => [
          name,
          {
            type: typeof value.value === 'number' ? 'number' : 'string',
            value: value.value
          }
        ])
      ),
      arrays: Object.fromEntries(
        Array.from(this.arrays.entries()).map(([name, array]) => [
          name,
          {
            dimensions: array.dimensions,
            values: Array.from(array.values.values())
          }
        ])
      ),
      loopStack: this.loopStack.map(loop => ({ ...loop })),
      gosubStack: [...this.gosubStack],
      currentStatementIndex: this.currentStatementIndex,
      currentLineNumber: this.currentLineNumber,
      iterationCount: this.iterationCount,
      isRunning: this.isRunning,
      shouldStop: this.shouldStop,
      dataIndex: this.dataIndex,
      dataValues: [...this.dataValues],
      timestamp: Date.now()
    }
  }

  /**
   * Compare current state with a snapshot and return differences
   */
  diff(snapshot: ExecutionStateSnapshot): StateDiff {
    // Implementation compares current state with snapshot
    // Returns detailed diff of what changed
  }
}
```

### 2. Snapshot Test Helpers

Add test utilities for snapshot-based assertions:

```typescript
// test/snapshot/executionSnapshot.ts
import { expect } from 'vitest'
import type { ExecutionContext, ExecutionStateSnapshot } from '@/core/state/ExecutionContext'

/**
 * Assert execution context matches a snapshot
 */
export function expectStateSnapshot(
  context: ExecutionContext,
  snapshot: ExecutionStateSnapshot
): void {
  const currentState = context.snapshot()

  // Use diff for better error messages
  const differences = compareSnapshots(currentState, snapshot)

  if (differences.length > 0) {
    const diffMessage = formatSnapshotDiff(differences)
    throw new Error(`Execution state does not match snapshot:\n${diffMessage}`)
  }
}

/**
 * Create a snapshot matcher function
 */
export function createSnapshotMatcher(context: ExecutionContext) {
  return {
    toMatchSnapshot(snapshot: ExecutionStateSnapshot) {
      expectStateSnapshot(context, snapshot)
    },
    toMatchFile(snapshotPath: string) {
      const savedSnapshot = loadSnapshotFile(snapshotPath)
      expectStateSnapshot(context, savedSnapshot)
    }
  }
}

/**
 * Save snapshot to file
 */
export function saveSnapshot(
  context: ExecutionContext,
  snapshotPath: string
): void {
  const snapshot = context.snapshot()
  Deno.writeTextFileSync(snapshotPath, JSON.stringify(snapshot, null, 2))
}

/**
 * Compare two snapshots and return differences
 */
export function compareSnapshots(
  actual: ExecutionStateSnapshot,
  expected: ExecutionStateSnapshot
): SnapshotDiff[] {
  const diffs: SnapshotDiff[] = []

  // Compare variables
  const actualVars = new Set(Object.keys(actual.variables))
  const expectedVars = new Set(Object.keys(expected.variables))

  // Missing variables
  for (const name of expectedVars) {
    if (!actualVars.has(name)) {
      diffs.push({
        type: 'missing-variable',
        path: `variables.${name}`,
        expected: expected.variables[name],
        actual: undefined
      })
    }
  }

  // Extra variables
  for (const name of actualVars) {
    if (!expectedVars.has(name)) {
      diffs.push({
        type: 'extra-variable',
        path: `variables.${name}`,
        expected: undefined,
        actual: actual.variables[name]
      })
    }
  }

  // Value differences
  for (const name of actualVars) {
    if (expectedVars.has(name)) {
      const actualVal = actual.variables[name]
      const expectedVal = expected.variables[name]
      if (!deepEqual(actualVal, expectedVal)) {
        diffs.push({
          type: 'variable-mismatch',
          path: `variables.${name}`,
          expected: expectedVal,
          actual: actualVal
        })
      }
    }
  }

  // Similar comparisons for arrays, loopStack, gosubStack, etc.

  return diffs
}

/**
 * Format snapshot differences for display
 */
function formatSnapshotDiff(diffs: SnapshotDiff[]): string {
  return diffs.map(diff => {
    switch (diff.type) {
      case 'missing-variable':
        return `  - ${diff.path}: expected ${JSON.stringify(diff.expected)} but missing`
      case 'extra-variable':
        return `  + ${diff.path}: unexpected ${JSON.stringify(diff.actual)}`
      case 'variable-mismatch':
        return `  ~ ${diff.path}:\n    expected: ${JSON.stringify(diff.expected)}\n    actual: ${JSON.stringify(diff.actual)}`
      // ... more cases
      default:
        return `  ? ${JSON.stringify(diff)}`
    }
  }).join('\n')
}
```

### 3. Updated Test Example (Clean)

```typescript
// New approach - single snapshot assertion
test('FOR loop with nested GOSUB maintains correct state', async () => {
  const adapter = new TestDeviceAdapter()
  const context = new ExecutionContext({ maxIterations: 1000, enableDebugMode: false })
  context.deviceAdapter = adapter

  await executeProgram(context, `
    10 A=0
    20 FOR I=1 TO 3
    30 GOSUB 100
    40 NEXT
    50 END
    100 A=A+I
    110 RETURN
  `)

  // Clean snapshot assertion
  expect(context.snapshot()).toMatchInlineSnapshot(`
    {
      "variables": {
        "A": { "type": "number", "value": 6 },
        "I": { "type": "number", "value": 4 }
      },
      "arrays": {},
      "loopStack": [],
      "gosubStack": [],
      "currentStatementIndex": 7,
      "currentLineNumber": 50,
      "iterationCount": 8,
      "isRunning": false,
      "shouldStop": true,
      "dataIndex": 0,
      "dataValues": [],
      "timestamp": 1707200000000
    }
  `)
})
```

### 4. Snapshot Files for Complex Programs

For complex multi-statement tests, snapshots can be stored in files:

```typescript
// test/snapshots/for-next-gosub-complex.snapshot.json
{
  "description": "FOR loop with nested GOSUB and array manipulation",
  "program": "10 DIM A(10)\n20 FOR I=0 TO 10\n30 A(I)=I*I\n40 GOSUB 100\n50 NEXT\n60 END\n100 REM SUBROUTINE\n110 RETURN",
  "finalState": {
    "variables": {
      "I": { "type": "number", "value": 11 }
    },
    "arrays": {
      "A": {
        "dimensions": [10],
        "values": [0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
      }
    },
    "loopStack": [],
    "gosubStack": [],
    "currentStatementIndex": 12,
    "currentLineNumber": 60,
    "iterationCount": 25,
    "isRunning": false,
    "shouldStop": true,
    "dataIndex": 0,
    "dataValues": []
  }
}
```

Usage in tests:

```typescript
test('complex FOR loop with GOSUB and arrays', async () => {
  const snapshot = loadSnapshot('for-next-gosub-complex')
  const context = await executeProgramCode(snapshot.program)

  expect(context.snapshot()).toEqual(snapshot.finalState)
})
```

### 5. State Diff Viewer for Debugging

Add a utility to visualize state changes:

```typescript
// test/snapshot/diffViewer.ts

export interface StateTransition {
  before: ExecutionStateSnapshot
  after: ExecutionStateSnapshot
  diff: SnapshotDiff[]
}

export function visualizeStateChange(transition: StateTransition): string {
  const lines: string[] = []

  lines.push('=== EXECUTION STATE CHANGE ===')
  lines.push('')
  lines.push('TIMESTAMP:')
  lines.push(`  Before: ${new Date(transition.before.timestamp).toISOString()}`)
  lines.push(`  After:  ${new Date(transition.after.timestamp).toISOString()}`)
  lines.push('')

  // Variables
  lines.push('VARIABLES:')
  for (const diff of transition.diff) {
    if (diff.path.startsWith('variables.')) {
      lines.push(formatVariableChange(diff))
    }
  }

  // Arrays
  lines.push('')
  lines.push('ARRAYS:')
  for (const diff of transition.diff) {
    if (diff.path.startsWith('arrays.')) {
      lines.push(formatArrayChange(diff))
    }
  }

  return lines.join('\n')
}
```

## Implementation Phases

### Phase 1: Core Snapshot Infrastructure (3-4 days)

**Files to Create:**
- `src/core/state/ExecutionContextSnapshot.ts` - Snapshot types and methods
- `test/snapshot/types.ts` - Snapshot testing types
- `test/snapshot/executionSnapshot.ts` - Snapshot test helpers

**Files to Modify:**
- `src/core/state/ExecutionContext.ts` - Add snapshot() method

**Tasks:**
1. Define ExecutionStateSnapshot interface
2. Implement ExecutionContext.snapshot()
3. Add deep comparison utilities
4. Create snapshot diff types
5. Add snapshot serialization tests

### Phase 2: Test Helpers and Matchers (2-3 days)

**Files to Create:**
- `test/snapshot/matchers.ts` - Custom Jest/Vitest matchers
- `test/snapshot/loader.ts` - Snapshot file loading
- `test/snapshot/diff.ts` - Diff generation and formatting

**Tasks:**
1. Create expectStateSnapshot() helper
2. Implement toMatchSnapshot() matcher
3. Implement toMatchFile() matcher
4. Add inline snapshot support
5. Create snapshot file I/O utilities

### Phase 3: Integration and Migration (3-4 days)

**Files to Modify:**
- `test/executors/*.test.ts` - Migrate to snapshot tests
- `test/integration/*.test.ts` - Add snapshot tests
- Update test documentation

**Tasks:**
1. Update 5-10 representative tests to use snapshots
2. Measure test code reduction
3. Document snapshot testing best practices
4. Create snapshot update workflow
5. Add CI/CD integration

### Phase 4: Tooling and Polish (2-3 days)

**Files to Create:**
- `test/snapshot/diffViewer.ts` - Visual diff tool
- `scripts/snapshot-update.ts` - CLI to update snapshots
- `docs/testing/snapshot-testing.md` - Documentation

**Tasks:**
1. Build state diff visualizer
2. Create snapshot update CLI
3. Add VS Code snippet for snapshot tests
4. Write comprehensive documentation
5. Create example test templates

## Success Metrics

### Completion Criteria
- [ ] ExecutionContext.snapshot() implemented and tested
- [ ] Snapshot test helpers work with Vitest
- [ ] 10+ existing tests migrated to snapshot style
- [ ] Test code reduced by 30%+ in migrated tests
- [ ] Snapshot update CLI functional
- [ ] Documentation complete

### Quality Metrics
- **Test Code Reduction**: 30-50% fewer lines in snapshot-based tests
- **Test Maintenance**: 50% faster to update tests after logic changes
- **Failure Clarity**: Diff output clearly shows what changed
- **Performance**: Snapshot generation < 1ms per assertion

### Developer Experience
- **Onboarding**: New contributors can write tests faster
- **Debugging**: State changes are immediately visible
- **Confidence**: Regressions caught automatically
- **Velocity**: Faster test development cycle

## Benefits

### Immediate Benefits
1. **Cleaner Tests**: One assertion instead of many
2. **Better Debugging**: See exactly what changed
3. **Faster Updates**: Update snapshots with one command
4. **Regression Detection**: Automatic comparison of full state

### Long-Term Benefits
1. **Test Maintenance**: Easier to keep tests in sync
2. **Complex State Testing**: Feasible to test complex programs
3. **Documentation**: Snapshots serve as executable documentation
4. **CI/CD Integration**: Automatic regression detection in CI

## Example: Before and After

### Before (Verbose)
```typescript
test('nested loops compute factorial', async () => {
  const context = await executeProgram(`
    10 N=5: F=1
    20 FOR I=1 TO N
    30 F=F*I
    40 NEXT
  `)

  expect(context.variables.get('N')).toEqual({ type: 'number', value: 5 })
  expect(context.variables.get('F')).toEqual({ type: 'number', value: 120 })
  expect(context.variables.get('I')).toEqual({ type: 'number', value: 6 })
  expect(context.loopStack).toEqual([])
  expect(context.gosubStack).toEqual([])
  expect(context.isRunning).toBe(false)
})
```

### After (Snapshot)
```typescript
test('nested loops compute factorial', async () => {
  const context = await executeProgram(`
    10 N=5: F=1
    20 FOR I=1 TO N
    30 F=F*I
    40 NEXT
  `)

  expect(context.snapshot()).toMatchInlineSnapshot()
})
```

## Technical Architecture

### Snapshot Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Execution                           │
│                                                              │
│  1. Execute BASIC program                                    │
│  2. Call context.snapshot()                                  │
│  3. Compare with expected snapshot                           │
│  4. Pass or fail with diff                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              ExecutionContext.snapshot()                     │
│                                                              │
│  • Serialize all variables to JSON-compatible format         │
│  • Flatten arrays to 1D value arrays                         │
│  • Copy control flow stacks                                  │
│  • Capture execution metadata                                │
│  • Return ExecutionStateSnapshot object                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Snapshot Comparison                        │
│                                                              │
│  • Deep equality check                                       │
│  • Generate detailed diff                                    │
│  • Format diff for display                                   │
│  • Inline snapshot or file-based comparison                  │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
test/
├── snapshot/
│   ├── types.ts                    # Snapshot types
│   ├── executionSnapshot.ts        # Core snapshot utilities
│   ├── matchers.ts                 # Vitest matchers
│   ├── loader.ts                   # File I/O
│   ├── diff.ts                     # Diff generation
│   └── diffViewer.ts               # Visual diff tools
├── snapshots/                      # Stored snapshots
│   ├── for-next-simple.snapshot.json
│   ├── gosub-nested.snapshot.json
│   └── arrays-multidim.snapshot.json
└── executors/
    └── ForNextExecutor.test.ts     # Uses snapshot assertions
```

## Open Questions

1. **Inline vs File Snapshots**: When to use inline vs file-based snapshots?
   - **Recommendation**: Inline for simple state, files for complex programs

2. **Timestamp Handling**: Should timestamps be ignored in comparisons?
   - **Recommendation**: Yes, timestamps should be excluded from equality checks

3. **Partial Snapshots**: Should we support snapshotting only parts of state?
   - **Recommendation**: Phase 2 feature - start with full snapshots only

4. **Snapshot Versioning**: How to handle snapshot format changes?
   - **Recommendation**: Include version field, migrate on load

## Dependencies

- **Related to**: Idea #037 (Error Message Standardization) - both improve testability
- **Enables**: Idea #029 (Interactive Breakpoint Debugger) - snapshot can capture debug state
- **Dependencies**: None (can be implemented independently)

## Team Assignment

**Primary Team**: Runtime
**Supporting Teams**: Testing (test infrastructure)

## Next Steps

1. **Prototype**: Implement ExecutionContext.snapshot() method
2. **Test**: Create first snapshot-based test
3. **Measure**: Compare test code before/after
4. **Iterate**: Refine snapshot format based on usage
5. **Expand**: Roll out to more test files

---

*"Testing complex program state shouldn't be complex. Snapshots let you assert 'the state is exactly as expected' with a single line, making tests easier to write, read, and maintain."*
