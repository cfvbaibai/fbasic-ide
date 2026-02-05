# Strategic Idea: Deterministic Testing & Reliability Foundation

**Date**: 2025-02-05
**Turn**: 3
**Status**: Conceptual
**Focus Area**: Testing & Reliability

## Vision

Establish a **deterministic testing foundation** that transforms how we validate F-BASIC program behavior—moving from unit tests to full **program-level verification** with time-travel debugging, snapshot testing, and reproducible execution guarantees.

## Problem Statement

### Current Testing Gaps

1. **Unit Tests ≠ Real Programs**: Current 942 tests verify individual commands in isolation, but F-BASIC programs are complex state machines where interaction matters
   - Example: A FOR loop inside a GOSUB that modifies global variables used by a sprite
   - These patterns emerge only at the program level

2. **Async Non-Determinism**: Web Worker execution + requestAnimationFrame creates timing-dependent behavior
   - Tests may pass/fail intermittently
   - Race conditions in sprite movement vs screen updates
   - No way to reproduce specific execution states

3. **Screen State Verification**: We can't easily verify visual output is correct
   - No automated way to confirm "drawing a star at position 10,10" actually draws correctly
   - Sprite layering issues only visible visually
   - Color palette bugs require manual inspection

4. **Regression Risks**: Changes to core systems (parser, runtime, screen) can have subtle cascading effects
   - Executor refactoring might break edge cases
   - Screen rendering optimizations can skip updates
   - Animation system changes cause sprite flicker

5. **Developer Confidence**: Fear of breaking existing functionality limits ambitious refactoring
   - No safety net for large-scale changes
   - Manual testing burden increases with features
   - "Does this still work?" requires running sample programs

## Proposed Solution

### 1. Program-Level Snapshot Testing

Test complete F-BASIC programs with deterministic output verification:

```typescript
interface ProgramSnapshot {
  metadata: {
    id: string
    name: string
    description: string
    category: 'regression' | 'example' | 'edge-case' | 'performance'
    author: string
    createdAt: Date
  }
  source: string // The F-BASIC program code
  expectations: {
    finalScreen: ScreenSnapshot
    finalVariables: VariableSnapshot
    executionTrace: ExecutionTrace
    performance: PerformanceMetrics
  }
}

interface ScreenSnapshot {
  background: CharacterGrid // 28×24 character grid
  sprites: SpriteState[]    // All sprite states
  backdrop: BackdropGrid    // 32×30 backdrop grid
  colors: PaletteState      // Current palette configuration
  cursor: CursorPosition    // Final cursor position
}

interface ExecutionTrace {
  steps: ExecutionStep[]
  maxSteps: number // Prevent infinite loops
}

interface ExecutionStep {
  line: number
  command: string
  stateChange: StateDiff
  screenDiff: ScreenDiff
}
```

**Snapshot Test Examples:**

```typescript
// regression/shooting-game-001.ts
export const shootingGameSnapshot: ProgramSnapshot = {
  metadata: {
    id: 'shooting-game-001',
    name: 'Shooting Game - Basic Movement',
    description: 'Verifies sprite movement, collision detection, and scoring',
    category: 'regression',
    author: 'system',
    createdAt: new Date('2025-02-05')
  },
  source: `
10 SPRITE ON
20 DEF SPRITE=(0)=C1E0
30 A=USR(0):B=USR(1)
40 SPRITE 0,(A,B),0,0
50 POSITION 0,0,0
60 MOVE 0
70 IF STRIG(0)=0 THEN 70
80 CUT 0:CUT 1
90 END
`,
  expectations: {
    finalScreen: {
      // Expected state after execution
    },
    finalVariables: {
      A: '<dynamic>',
      B: '<dynamic>'
    },
    executionTrace: {
      // Step-by-step verification
    }
  }
}
```

### 2. Deterministic Time Control

Control the passage of time in tests for reproducible async behavior:

```typescript
interface DeterministicRuntime {
  // Freeze time at specific moments
  freezeTime(): void
  unfreezeTime(): void

  // Advance time programmatically
  advanceTime(ms: number): void
  advanceFrames(frames: number): void

  // Execute until condition
  executeUntil(condition: (state: RuntimeState) => boolean): void

  // Capture execution state
  captureState(): ExecutionState

  // Restore execution state
  restoreState(state: ExecutionState): void
}
```

**Usage Examples:**

```typescript
// Test sprite movement over 60 frames
await testRuntime.advanceFrames(60)
expect(testRuntime.getSpritePosition(0)).toEqual({ x: 120, y: 100 })

// Execute until specific condition
await testRuntime.executeUntil(state => state.variables.SCORE > 100)

// Test race conditions
await testRuntime.freezeTime()
// Execute background operations deterministically
await testRuntime.unfreezeTime()
```

### 3. Time-Travel Debugging Framework

Record and replay execution with full state inspection:

```typescript
interface TimeTravelDebugger {
  // Start recording execution
  startRecording(program: string): void

  // Navigate execution history
  goToStep(step: number): ExecutionState
  goToLine(line: number): ExecutionState[]
  goToTime(ms: number): ExecutionState

  // State diffing
  compareStates(state1: ExecutionState, state2: ExecutionState): StateDiff

  // Visual debugging
  getScreenAtStep(step: number): ScreenSnapshot
  getSpritesAtStep(step: number): SpriteState[]
  getVariablesAtStep(step: number): VariableState

  // Export session for sharing
  exportSession(): DebugSession
  importSession(session: DebugSession): void
}
```

**Debugging UI Integration:**

```vue
<template>
  <div class="debugger-panel">
    <ExecutionTimeline
      :steps="executionTrace"
      :current-step="currentStep"
      @step-click="goToStep"
    />
    <StateInspector
      :variables="currentVariables"
      :screen="currentScreen"
      :sprites="currentSprites"
    />
    <DiffViewer
      :before="previousState"
      :after="currentState"
    />
  </div>
</template>
```

### 4. Visual Regression Testing

Automated visual verification using screen snapshots:

```typescript
interface VisualRegressionSuite {
  // Capture screen state
  captureScreen(): ScreenSnapshot

  // Compare screens
  compareScreens(
    actual: ScreenSnapshot,
    expected: ScreenSnapshot
  ): ScreenDiff

  // Generate visual diff report
  generateVisualReport(diff: ScreenDiff): DiffReport

  // Accept/reject changes
  acceptSnapshot(id: string): void
  rejectSnapshot(id: string): void
}

interface ScreenDiff {
  backgroundChanges: CellChange[]
  spriteChanges: SpriteChange[]
  colorChanges: ColorChange[]
  cursorChanges: CursorChange[]
}
```

**Test Categories:**

1. **Character-Level Regression**: Verify exact character at each position
2. **Sprite Position Regression**: Verify sprite coordinates and layering
3. **Color Palette Regression**: Verify color assignments
4. **Animation Regression**: Verify sprite frames over time
5. **Performance Regression**: Detect slowdowns (frame drops, execution time)

### 5. Fuzzing & Property-Based Testing

Generate random F-BASIC programs to test robustness:

```typescript
interface FuzzerConfig {
  maxLines: number
  maxVariables: number
  allowedCommands: Command[]
  maxLength: number
  nestingDepth: number
}

interface PropertyTest {
  name: string
  property: (program: string) => boolean
  config: FuzzerConfig
  iterations: number
}

// Example property tests
const propertyTests: PropertyTest[] = [
  {
    name: 'FOR loops always terminate',
    property: (program) => {
      const state = execute(program)
      return !state.infiniteLoop
    },
    config: { maxLines: 50, allowedCommands: ['FOR', 'NEXT', 'GOTO'] },
    iterations: 1000
  },
  {
    name: 'Variable assignments persist',
    property: (program) => {
      // Verify LET creates durable variables
    },
    config: { maxLines: 30 },
    iterations: 500
  },
  {
    name: 'Sprite positions stay in bounds',
    property: (program) => {
      // Verify sprite coordinates never invalid
    },
    config: { maxLines: 40, allowedCommands: ['SPRITE', 'MOVE', 'POSITION'] },
    iterations: 500
  }
]
```

## Implementation Priority

### Phase 1 (Foundation - 2-3 weeks)

**Goal**: Basic program-level testing infrastructure

1. **Snapshot Data Structures**
   - Define `ProgramSnapshot`, `ScreenSnapshot`, `ExecutionTrace` types
   - Create snapshot serialization/deserialization
   - Add snapshot directory structure: `test/snapshots/`

2. **Deterministic Runtime Adapter**
   - Create `TestRuntimeAdapter` implementing `BasicDeviceAdapter`
   - Implement time control (freeze, advance, execute until)
   - Add state capture/restore functionality

3. **First Snapshot Tests**
   - Migrate 5-10 existing sample programs to snapshot format
   - Verify final screen state matches expected
   - Verify variable values

4. **Test Runner Integration**
   - Extend Vitest to handle snapshot tests
   - Add snapshot update CLI command
   - Integrate with existing test suite

**Files to Create:**
- `test/snapshots/types.ts` - Snapshot type definitions
- `test/runtime/TestRuntimeAdapter.ts` - Deterministic test runtime
- `test/snapshots/programs/regression/` - Regression program snapshots
- `test/snapshots/SnapshotRunner.ts` - Snapshot test runner

### Phase 2 (Time-Travel Debugging - 3-4 weeks)

**Goal**: Execution recording and replay

1. **Execution Recorder**
   - Record every execution step with state
   - Store execution trace in memory
   - Export/import debug sessions

2. **Time-Travel API**
   - Implement `goToStep`, `goToLine`, `goToTime`
   - Add state diffing utilities
   - Create state inspection API

3. **Debug UI Components**
   - Execution timeline component
   - State inspector panel
   - Diff viewer for state changes

4. **Integration with IDE**
   - Add debug mode toggle
   - Connect to existing Monaco editor
   - Highlight executing line during replay

**Files to Create:**
- `test/debugger/ExecutionRecorder.ts`
- `test/debugger/TimeTravelDebugger.ts`
- `src/features/debugger/components/ExecutionTimeline.vue`
- `src/features/debugger/components/StateInspector.vue`
- `src/features/debugger/composables/useTimeTravelDebug.ts`

### Phase 3 (Visual Regression - 2-3 weeks)

**Goal**: Automated visual verification

1. **Screen Comparison Engine**
   - Implement character-level diff
   - Implement sprite position diff
   - Implement color palette diff

2. **Visual Diff Report**
   - Generate HTML diff reports
   - Visual highlight of changes
   - Side-by-side comparison view

3. **Baseline Management**
   - Store baseline snapshots
   - CLI to accept/reject changes
   - CI integration for regression detection

4. **Performance Regression Detection**
   - Measure execution time
   - Track frame rate during animations
   - Alert on performance degradation

**Files to Create:**
- `test/visual/ScreenComparator.ts`
- `test/visual/DiffReportGenerator.ts`
- `test/visual/BaselineManager.ts`
- `scripts/update-snapshots.ts`

### Phase 4 (Fuzzing & Property Tests - 2-3 weeks)

**Goal**: Automated robustness testing

1. **F-BASIC Program Generator**
   - Random program generation
   - Configurable constraints
   - Valid syntax generation

2. **Property Test Framework**
   - Define property test structure
   - Run property tests in CI
   - Report failures with minimal counterexamples

3. **Fuzzing Integration**
   - Continuous fuzzing in background
   - Crash detection and reporting
   - Automatic bug reduction

**Files to Create:**
- `test/fuzzing/ProgramGenerator.ts`
- `test/fuzzing/PropertyTestRunner.ts`
- `test/fuzzing/properties/` - Property test definitions

## Technical Architecture

### New Testing Infrastructure

```
test/
├── snapshots/
│   ├── types.ts                    # Snapshot type definitions
│   ├── programs/
│   │   ├── regression/             # Regression tests
│   │   ├── examples/               # Sample programs as tests
│   │   ├── edge-cases/             # Edge case coverage
│   │   └── performance/            # Performance benchmarks
│   ├── baselines/                  # Expected output baselines
│   └── SnapshotRunner.ts           # Test runner
├── runtime/
│   ├── TestRuntimeAdapter.ts       # Deterministic runtime
│   ├── TimeController.ts           # Time control utilities
│   └── StateCapture.ts             # State serialization
├── debugger/
│   ├── ExecutionRecorder.ts        # Execution recording
│   ├── TimeTravelDebugger.ts       # Replay API
│   └── StateDiffer.ts              # State diffing
├── visual/
│   ├── ScreenComparator.ts         # Screen comparison
│   ├── DiffReportGenerator.ts      # Visual reports
│   └── BaselineManager.ts          # Baseline management
└── fuzzing/
    ├── ProgramGenerator.ts         # Random program gen
    ├── PropertyTestRunner.ts       # Property test runner
    └── properties/                 # Property definitions
```

### Integration with Existing Code

**Parser Integration:**
- Snapshot tests use existing parser
- Parse errors are test failures

**Runtime Integration:**
- `TestRuntimeAdapter` implements same interface as `WebWorkerDeviceAdapter`
- Swap adapters for testing vs production

**ExecutionEngine Integration:**
- Wrap execution with recording
- No changes to core execution logic

**UI Integration:**
- Debug components use existing screen rendering
- Reuse state inspection utilities

## Dependencies & Tools

**New Dependencies:**
- **micromatch**: For snapshot file matching
- **diff**: For text/structural diffing
- **prettier**: For snapshot formatting

**Optional Enhancements:**
- **js-x-ray**: For code structure analysis
- **fast-check**: For property-based testing
- **puppeteer**: For visual regression (if needed)

## Success Metrics

### Coverage Metrics
- **Program Coverage**: % of F-BASIC language features exercised by snapshot tests
- **State Coverage**: % of possible runtime states reached
- **Edge Case Coverage**: # of boundary conditions tested

### Quality Metrics
- **Regression Detection Rate**: % of bugs caught by snapshot tests before deployment
- **Flaky Test Rate**: % of tests with non-deterministic results (target: 0%)
- **Test Execution Time**: Total test suite duration (target: < 30 seconds)

### Developer Confidence
- **Refactoring Velocity**: Time between major refactors without fear
- **Bug Fix Validation**: Time to verify fix doesn't break existing behavior
- **Onboarding Time**: Time for new developer to understand test failures

## Benefits

### Immediate Benefits
1. **Catch Integration Bugs**: Detect problems from command interactions
2. **Visual Validation**: Automated verification of screen output
3. **Regression Safety**: Confidence to refactor core systems
4. **Better Debugging**: Reproduce any execution state

### Long-Term Benefits
1. **Documentation**: Snapshots serve as executable documentation
2. **Performance Monitoring**: Detect slowdowns over time
3. **Robustness**: Fuzzing finds edge cases humans miss
4. **Developer Velocity**: Spend less time manual testing

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Snapshot maintenance burden | Automated updates; sensible defaults |
| Test execution time | Parallel test running; incremental testing |
| Brittle tests | Semantic matching vs exact; tolerance for non-determinism |
| Complex debugging UI | Progressive disclosure; optional advanced features |

## Open Questions

1. **Snapshot Storage**: Should snapshots be version controlled? (Large binary data)
2. **CI Integration**: How to handle visual regression in CI? (Headless rendering)
3. **Test Maintenance**: Who updates snapshots when features change? (Automation + manual review)
4. **Performance Budget**: What's acceptable execution time for test suite?

## Next Steps

1. **Prototype**: Create 3-5 snapshot tests manually to validate approach
2. **Tooling**: Build basic snapshot test runner with Vitest
3. **Infrastructure**: Implement `TestRuntimeAdapter` with deterministic time
4. **Documentation**: Write guide for creating snapshot tests
5. **Community**: Gather feedback on testing approach from contributors

---

*"Every bug you catch in tests is one users won't experience. Every state you can reproduce is a problem you can solve. Let's make the unpredictable, deterministic."*
