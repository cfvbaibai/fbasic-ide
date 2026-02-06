# Strategic Idea: Snapshot-Based Regression Testing for Screen Output

**Date**: 2026-02-06
**Turn**: 18
**Status**: Conceptual
**Focus Area**: Testing & Reliability
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add a **snapshot-based regression testing system** for screen output that enables developers to catch visual regressions in F-BASIC program execution by comparing screen states against known-good snapshots.

## Problem Statement

### Current Testing Limitations

1. **No Visual Regression Detection**: Tests verify individual operations but not complete screen states
   - `LocatePrintIntegration.test.ts` checks cursor positioning but doesn't validate the full screen
   - Screen buffer tests check specific cells but not overall visual correctness
   - No way to detect when a change breaks visual output across an entire program

2. **Fragile Assertion Patterns**: Existing tests use brittle position-based assertions
   - Tests like `expect(state.buffer[5]![10]!.character).toBe('X')` are hard to maintain
   - Adding a single character can break dozens of assertions
   - No semantic understanding of "what changed" on screen

3. **Manual Verification Required**: Visual changes require manual testing
   - Sprite animations need visual confirmation
   - Color palette changes must be manually verified
   - Text layout issues only caught during manual testing

4. **No Golden Master**: No reference for "correct" output
   - When refactoring screen rendering, no baseline to compare against
   - Hard to verify backwards compatibility
   - Difficult to detect subtle bugs (e.g., off-by-one cursor positioning)

5. **Debug Output Untested**: Debug console output (idea 015) has no regression protection
   - Debug messages format changes undetected
   - No way to verify debug output consistency

## Proposed Solution

### 1. Screen Snapshot System

Capture and compare screen state snapshots:

```typescript
interface ScreenSnapshot {
  version: 1
  timestamp: number
  description: string
  screen: {
    dimensions: { width: number; height: number }
    cursor: { x: number; y: number }
    buffer: Array<Array<{
      character: string
      colorPattern: number
    }>>
  }
  scalars: {
    bgPalette: number
    spritePalette: number
    backdropColor: number
    cgenMode: number
  }
  spriteStates?: SpriteState[]
  movementStates?: MovementState[]
}
```

**Snapshot Features:**
- Serialization to JSON for easy diffing
- Stable format for version control
- Support for both full and partial snapshots
- Metadata for test context

### 2. Snapshot Matcher for Vitest

Custom Jest/Vitest matcher for snapshot comparison:

```typescript
// Usage in tests
await interpreter.execute('10 PRINT "HELLO"\n20 END')

// Compare screen state to snapshot
expectScreenToMatchSnapshot(adapter, 'hello-world')

// Compare with options
expectScreenToMatchSnapshot(adapter, 'hello-world', {
  ignoreCursor: true,
  ignoreColors: true,
  normalizeWhitespace: false,
})
```

**Matcher Features:**
- Diff output showing character-by-character differences
- Options to ignore specific aspects (cursor, colors, scalars)
- Inline snapshot support (like Jest's inline snapshots)
- Update mode (`pnpm test:run -u`)

### 3. Debug Output Snapshots

Extend snapshot system to debug console output:

```typescript
interface DebugSnapshot {
  debugOutput: string
  timestamp: number
  description: string
}

expectDebugToMatchSnapshot(adapter.debugOutput, 'variable-trace')
```

### 4. Visual Diff Reporter

Human-readable diff output for failed tests:

```
Screen snapshot mismatch: hello-world

Expected (row 0):
  HELLO WORLD
  ^^^^^^^^^^^

Actual (row 0):
  HELLO WOLRD
             ^^

Diff at (5, 0): Expected 'O' but got 'L'
Diff at (6, 0): Expected 'R' but got 'D'

Color palette mismatch:
Expected bgPalette: 1
Actual bgPalette: 2

Cursor position mismatch:
Expected: (7, 0)
Actual: (6, 0)
```

### 5. Test Organization

Organize snapshot tests by feature:

```
test/snapshots/
├── screen/
│   ├── basic-print.test.ts
│   ├── cursor-positioning.test.ts
│   ├── color-commands.test.ts
│   └── sprite-display.test.ts
├── debug/
│   ├── variable-trace.test.ts
│   └── loop-debug.test.ts
└── __snapshots__/
    ├── screen/
    │   ├── basic-print.test.ts.snap
    │   └── ...
    └── debug/
        └── ...
```

## Implementation Priority

### Phase 1: Core Snapshot Infrastructure (3-4 days)

**Goal**: Basic snapshot capture and comparison

**Files to Create:**
1. `src/test-utils/snapshot/types.ts` - Snapshot type definitions (~50 lines)
2. `src/test-utils/snapshot/captureSnapshot.ts` - Capture screen state (~80 lines)
3. `src/test-utils/snapshot/compareSnapshots.ts` - Compare snapshots (~100 lines)
4. `src/test-utils/snapshot/serializeSnapshot.ts` - Serialize/deserialize (~60 lines)

**Files to Modify:**
- `src/test-utils/index.ts` - Export snapshot utilities

**Functions to Implement:**
```typescript
// Capture
function captureScreenSnapshot(
  adapter: SharedBufferTestAdapter,
  options?: CaptureOptions
): ScreenSnapshot

// Compare
function compareScreenSnapshots(
  actual: ScreenSnapshot,
  expected: ScreenSnapshot,
  options?: CompareOptions
): SnapshotDiff

// Serialize
function serializeSnapshot(snapshot: ScreenSnapshot): string
function deserializeSnapshot(json: string): ScreenSnapshot
```

### Phase 2: Vitest Integration (2-3 days)

**Goal**: Custom matcher and test infrastructure

**Files to Create:**
1. `src/test-utils/vitest/expectScreenToMatchSnapshot.ts` - Custom matcher (~150 lines)
2. `src/test-utils/vitest/setup.ts` - Vitest setup for snapshots (~50 lines)
3. `test/snapshots/screen/basic-print.test.ts` - Example snapshot tests (~100 lines)

**Files to Modify:**
- `vitest.config.ts` - Add snapshot resolver
- `src/test-utils/vitest/index.ts` - Export matchers

**Implementation:**
```typescript
// Custom matcher
interface CustomMatchers<R = unknown> {
  expectScreenToMatchSnapshot: (
    adapter: SharedBufferTestAdapter,
    name: string,
    options?: SnapshotMatchOptions
  ) => R
}

// Extend Vitest expect
declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
}
```

### Phase 3: Debug Output Snapshots (1-2 days)

**Goal**: Extend snapshot system to debug output

**Files to Create:**
1. `src/test-utils/snapshot/captureDebugSnapshot.ts` (~40 lines)
2. `src/test-utils/vitest/expectDebugToMatchSnapshot.ts` (~80 lines)
3. `test/snapshots/debug/variable-trace.test.ts` (~80 lines)

### Phase 4: Visual Diff Reporter (2-3 days)

**Goal**: Human-readable diff output

**Files to Create:**
1. `src/test-utils/snapshot/formatDiff.ts` - Format diff for display (~150 lines)
2. `src/test-utils/snapshot/diffReporter.ts` - Custom Vitest reporter (~100 lines)

**Features:**
- Side-by-side comparison
- Character-level diffs with indicators (^^^^)
- Color-coded output (if terminal supports it)
- Summary statistics (differences count, affected regions)

## Technical Architecture

### New Test Infrastructure

```
src/test-utils/
├── snapshot/
│   ├── types.ts                    # Snapshot interfaces
│   ├── captureSnapshot.ts          # Screen state capture
│   ├── captureDebugSnapshot.ts     # Debug output capture
│   ├── compareSnapshots.ts         # Comparison logic
│   ├── serializeSnapshot.ts        # JSON serialization
│   ├── formatDiff.ts               # Diff formatting
│   └── constants.ts                # Default options
├── vitest/
│   ├── expectScreenToMatchSnapshot.ts  # Custom matcher
│   ├── expectDebugToMatchSnapshot.ts   # Debug matcher
│   ├── setup.ts                        # Test setup
│   └── index.ts                        # Exports
└── adapters/
    └── SnapshotTestAdapter.ts      # Extended adapter with snapshot support
```

### Snapshot File Format

```json
// test/snapshots/__snapshots__/screen/basic-print.test.ts.snap
{
  "version": 1,
  "snapshots": {
    "basic-print - simple hello world": {
      "description": "Basic PRINT statement",
      "timestamp": 1707200000000,
      "screen": {
        "dimensions": { "width": 28, "height": 24 },
        "cursor": { "x": 5, "y": 0 },
        "buffer": [["H", "E", "L", "L", "O", ...]]
      },
      "scalars": {
        "bgPalette": 0,
        "spritePalette": 0,
        "backdropColor": 0,
        "cgenMode": 0
      }
    }
  }
}
```

### Integration with Existing Tests

No changes to existing tests required - snapshot tests are additive:

```typescript
// New snapshot test alongside existing tests
describe('PRINT Statement', () => {
  // Existing test (unchanged)
  it('should print text at cursor position', async () => {
    await interpreter.execute('10 PRINT "HELLO"\n20 END')
    expect(adapter.output).toContain('HELLO')
  })

  // New snapshot test
  it('should match snapshot for hello world', async () => {
    await interpreter.execute('10 PRINT "HELLO"\n20 END')
    expectScreenToMatchSnapshot(adapter, 'hello-world')
  })
})
```

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Vitest existing snapshot infrastructure (extend for custom format)
- Existing `SharedBufferTestAdapter`
- TypeScript standard library
- JSON for serialization

**Optional Enhancements:**
- `diff` package for unified diff formatting (or implement simple diff)
- `chalk` for colored terminal output (or use ANSI codes directly)

## Success Metrics

### Test Coverage
- **Snapshot Tests**: 20+ snapshot tests added for core features
- **Regression Detection**: At least 1 regression prevented during development
- **Test Maintenance**: <5% snapshot updates per month (indicates stable format)

### Developer Experience
- **Readable Diffs**: Developers can understand what changed in <10 seconds
- **Fast Feedback**: Snapshot tests run in <100ms each
- **Easy Updates**: Update mode works correctly (`-u` flag)

### Quality Impact
- **Bug Detection**: Visual regressions caught before merge
- **Refactoring Safety**: Screen rendering changes verified automatically
- **Documentation**: Snapshots serve as visual examples

## Benefits

### Immediate Benefits
1. **Regression Prevention**: Detect visual changes automatically
2. **Fast Debugging**: Clear diffs show exactly what changed
3. **Documentation**: Snapshots document expected behavior
4. **Refactoring Confidence**: Change rendering code with safety net

### Long-Term Benefits
1. **Test Maintenance**: Easier than maintaining position-based assertions
2. **Onboarding**: New developers see expected outputs
3. **CI/CD**: Visual regressions blocked in automated tests
4. **Evolution**: Snapshot format can extend to new features

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Snapshot files become large | Use compression for large buffers; ignore empty cells |
| Tests flaky due to timestamps | Ignore non-deterministic fields in snapshots |
| False positives from formatting | Provide options to ignore whitespace, colors, etc. |
| Updating snapshots is tedious | Provide clear update workflow (`-u` flag) |
| Snapshot format evolves | Version field allows migration paths |

## Open Questions

1. **Snapshot Granularity**: Should each test have its own snapshot or share?
2. **Update Frequency**: When should snapshots be updated (major vs minor changes)?
3. **Binary Data**: How to handle sprite character data in snapshots?
4. **Performance**: What's the acceptable size limit for snapshot files?
5. **CI Behavior**: Should snapshots be checked into repo or generated on-the-fly?

## Next Steps

1. **Prototype**: Build basic `captureScreenSnapshot` function
2. **Example Tests**: Create 3-5 snapshot tests for existing features
3. **Diff Format**: Design human-readable diff output
4. **Integration**: Add to existing test suite
5. **Documentation**: Document snapshot testing workflow

## Example Test

```typescript
// test/snapshots/screen/basic-print.test.ts
import { describe, expect, it } from 'vitest'
import { BasicInterpreter } from '@/core/BasicInterpreter'
import { SharedBufferTestAdapter } from '../../adapters/SharedBufferTestAdapter'
import '../matchers' // Register custom matchers

describe('Screen Snapshot Tests - Basic Print', () => {
  let adapter: SharedBufferTestAdapter
  let interpreter: BasicInterpreter

  beforeEach(() => {
    adapter = new SharedBufferTestAdapter()
    interpreter = new BasicInterpreter({
      maxIterations: 1000,
      maxOutputLines: 100,
      deviceAdapter: adapter,
    })
  })

  it('should match snapshot for hello world', async () => {
    await interpreter.execute('10 PRINT "HELLO WORLD"\n20 END')
    expectScreenToMatchSnapshot(adapter, 'hello-world')
  })

  it('should match snapshot for positioned text', async () => {
    await interpreter.execute(`
10 LOCATE 10, 5
20 PRINT "X"
30 END
`)
    expectScreenToMatchSnapshot(adapter, 'positioned-text')
  })

  it('should match snapshot for multiple lines', async () => {
    await interpreter.execute(`
10 PRINT "LINE 1"
20 PRINT "LINE 2"
30 PRINT "LINE 3"
40 END
`)
    expectScreenToMatchSnapshot(adapter, 'multiple-lines')
  })

  it('should match snapshot with color palette', async () => {
    await interpreter.execute(`
10 CGSET 0, 1
20 CGSET 1, 2
30 PRINT "COLORED"
40 END
`)
    expectScreenToMatchSnapshot(adapter, 'with-palette')
  })
})
```

## Related Ideas

- Complements `011-test-coverage-visualizer.md` by adding actual test content
- Enables better testing for `015-debug-console-panel.md`
- Supports `010-intelligent-error-recovery.md` by providing regression detection
- Foundation for future visual regression testing of sprites

## Acceptance Criteria

- [ ] `captureScreenSnapshot` function captures complete screen state
- [ ] `expectScreenToMatchSnapshot` matcher works in Vitest
- [ ] Snapshot files generated in `__snapshots__` directory
- [ ] Diff output shows character-by-character differences
- [ ] Update mode (`-u`) updates snapshots correctly
- [ ] At least 10 snapshot tests added for core features
- [ ] Documentation for snapshot testing workflow
- [ ] No regression to existing test suite
- [ ] Debug output snapshot support implemented
- [ ] Snapshot format versioned for future compatibility

---

*"Snapshot tests are like a safety net for refactoring. They catch what you didn't think to test for—especially visual changes that unit tests miss. Let's make F-BASIC screen rendering bulletproof."*
