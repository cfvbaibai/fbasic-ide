# Strategic Idea: F-BASIC Code Profiler

**Date**: 2026-02-06
**Turn**: 26
**Status**: Conceptual
**Focus Area**: Developer Experience & Performance
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add a **F-BASIC code profiler** to the Family Basic IDE that helps developers identify performance bottlenecks in their own programs—showing which lines execute most frequently, which loops consume the most time, and where optimizations will have the biggest impact.

## Problem Statement

### Current Performance Investigation Gaps

1. **No Line-Level Visibility**: Developers can't see which lines execute most
   - No way to identify hot loops without manual instrumentation
   - Can't tell which PRINT statements execute thousands of times
   - No visibility into GOTO/GOSUB jump patterns
   - Must add manual PRINT statements to count iterations

2. **Time-Based Profiling Missing**: Can't identify slow operations
   - Don't know which loops consume the most execution time
   - Can't distinguish between fast loops and slow loops
   - No way to measure sprite animation performance impact
   - No metrics for screen rendering operations

3. **Optimization is Guesswork**: Don't know where to focus effort
   - Can't identify low-hanging fruit for optimization
   - Don't know if a change actually improved performance
   - No baseline measurements for comparison
   - Can't quantify performance improvements

4. **Learning Barrier**: New developers write inefficient code
   - No feedback on nested loop performance impact
   - Can't see the cost of frequent PRINT/LOCATE calls
   - Don't understand sprite rendering overhead
   - No way to learn performance patterns

## Proposed Solution

### 1. Line Execution Frequency Counter

Track how many times each line executes:

```typescript
interface LineProfile {
  lineNumber: number
  executionCount: number
  percentageOfTotal: number
  avgTimePerExecution: number      // microseconds
  totalTime: number                 // microseconds
  statementType: StatementType
}

interface ProfileResult {
  programName: string
  totalIterations: number
  totalExecutionTime: number        // milliseconds
  lines: LineProfile[]
  hotPaths: HotPath[]
  bottlenecks: Bottleneck[]
}

type StatementType =
  | 'print' | 'locate' | 'color'
  | 'for' | 'next' | 'if' | 'goto' | 'gosub'
  | 'sprite' | 'move' | 'era' | 'cut'
  | 'input' | 'linput' | 'data' | 'read'
  | 'assignment' | 'function_call'

interface HotPath {
  lines: number[]                   // Sequence of line numbers
  executionCount: number
  timePercentage: number
  description: string
}

interface Bottleneck {
  lineNumber: number
  reason: 'high_frequency' | 'slow_execution' | 'nested_loops'
  impact: 'high' | 'medium' | 'low'
  suggestion: string
  estimatedSavings: string          // e.g., "Could save ~15ms"
}
```

### 2. Time-Based Profiling

Measure execution time per statement:

```typescript
interface TimeProfile {
  lineNumber: number
  totalTimeUs: number               // Total microseconds spent on this line
  avgTimeUs: number                 // Average microseconds per execution
  minTimeUs: number
  maxTimeUs: number
  timeVariance: number              // Standard deviation
}

interface ProfilingState {
  enabled: boolean
  startTime: number
  lineTimings: Map<number, TimingData>
  statementTimings: Map<StatementType, AggregateTiming>
}

interface TimingData {
  count: number
  totalTime: number
  minTime: number
  maxTime: number
  samples: number[]                 // For percentile calculation
}

interface AggregateTiming {
  statementType: StatementType
  totalCount: number
  totalTime: number
  percentageOfTotal: number
}
```

### 3. Profiler UI Panel

Dedicated panel showing profile results:

```vue
<template>
  <div class="profiler-panel">
    <!-- Profile Summary -->
    <div class="profile-summary">
      <div class="metric-card">
        <span class="metric-value">{{ formatTime(totalExecutionTime) }}</span>
        <span class="metric-label">Total Time</span>
      </div>
      <div class="metric-card">
        <span class="metric-value">{{ totalIterations.toLocaleString() }}</span>
        <span class="metric-label">Iterations</span>
      </div>
      <div class="metric-card">
        <span class="metric-value">{{ executedLines.length }}</span>
        <span class="metric-label">Lines Executed</span>
      </div>
    </div>

    <!-- Hot Paths -->
    <div class="hot-paths-section">
      <h3>Hot Paths</h3>
      <HotPathCard
        v-for="path in hotPaths"
        :key="path.id"
        :path="path"
        @go-to-line="goToLine"
      />
    </div>

    <!-- Line Profile Table -->
    <div class="line-profile-table">
      <table>
        <thead>
          <tr>
            <th>Line</th>
            <th>Count</th>
            <th>% Total</th>
            <th>Total Time</th>
            <th>Avg/Exec</th>
            <th>Statement</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="line in sortedLines"
            :key="line.lineNumber"
            :class="{ hotspot: line.executionCount > threshold }"
            @click="goToLine(line.lineNumber)"
          >
            <td>{{ line.lineNumber }}</td>
            <td>{{ line.executionCount.toLocaleString() }}</td>
            <td>
              <ProgressBar :value="line.percentageOfTotal" />
              {{ line.percentageOfTotal.toFixed(1) }}%
            </td>
            <td>{{ formatTime(line.totalTime) }}</td>
            <td>{{ formatMicros(line.avgTimePerExecution) }}μs</td>
            <td>{{ line.statementType }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bottlenecks -->
    <div class="bottlenecks-section">
      <h3>Bottlenecks</h3>
      <BottleneckCard
        v-for="bottleneck in bottlenecks"
        :key="bottleneck.lineNumber"
        :bottleneck="bottleneck"
        @go-to-line="goToLine"
      />
    </div>

    <!-- Statement Breakdown -->
    <div class="statement-breakdown">
      <h3>Statement Types</h3>
      <StatementTypeChart :timings="statementTimings" />
    </div>

    <!-- Actions -->
    <div class="profiler-actions">
      <button @click="startProfiling">Start Profile</button>
      <button @click="stopProfiling" :disabled="!isProfiling">Stop</button>
      <button @click="exportProfile">Export Profile</button>
      <button @click="compareProfiles">Compare Baseline</button>
    </div>
  </div>
</template>
```

### 4. Editor Heatmap Integration

Show execution frequency directly in the editor:

```typescript
interface ProfilerDecorator {
  // Apply heatmap colors to editor gutter
  applyHeatmap(
    editor: monaco.editor.IStandaloneCodeEditor,
    profile: ProfileResult
  ): void

  // Heatmap colors based on execution frequency
  getHeatmapColor(executionCount: number, maxCount: number): string
}

// Heatmap color gradient
const HEATMAP_COLORS = {
  cold: {      // 0-10 executions
    background: 'transparent',
    indicator: '#e5e7eb'      // gray-200
  },
  cool: {      // 11-100 executions
    background: 'rgba(59, 130, 246, 0.1)',   // blue-500/10
    indicator: '#3b82f6'      // blue-500
  },
  warm: {      // 101-1000 executions
    background: 'rgba(245, 158, 11, 0.15)',  // amber-500/15
    indicator: '#f59e0b'      // amber-500
  },
  hot: {       // 1001-10000 executions
    background: 'rgba(239, 68, 68, 0.2)',    // red-500/20
    indicator: '#ef4444'      // red-500
  },
  burning: {   // 10000+ executions
    background: 'rgba(220, 38, 38, 0.3)',    // red-700/30
    indicator: '#dc2626'      // red-700
  }
}
```

### 5. Performance Suggestions

Automated optimization recommendations:

```typescript
interface PerformanceSuggestion {
  id: string
  lineNumber: number
  severity: 'high' | 'medium' | 'low'
  category: 'loop_optimization' | 'string_operations' | 'screen_operations' | 'sprite_operations'
  issue: string
  suggestion: string
  codeExample: {
    before: string
    after: string
  }
  estimatedImpact: string
}

interface SuggestionEngine {
  analyze(profile: ProfileResult): PerformanceSuggestion[]
}

// Example suggestions
const exampleSuggestions: PerformanceSuggestion[] = [
  {
    id: 'nested-loops-30',
    lineNumber: 30,
    severity: 'high',
    category: 'loop_optimization',
    issue: 'Triple nested loop (10×10×10 = 1000 iterations)',
    suggestion: 'Consider restructuring or reducing loop bounds',
    codeExample: {
      before: '10 FOR I=1 TO 10\n20 FOR J=1 TO 10\n30 FOR K=1 TO 10\n40 PRINT I*J*K\n50 NEXT K,J,I',
      after: '10 FOR I=1 TO 10\n20 FOR J=1 TO 10\n30 PRINT I*J\n40 NEXT J,I'
    },
    estimatedImpact: '~50ms savings'
  },
  {
    id: 'frequent-locate-15',
    lineNumber: 15,
    severity: 'medium',
    category: 'screen_operations',
    issue: 'LOCATE called 5000 times in loop',
    suggestion: 'Batch screen updates or reduce LOCATE frequency',
    codeExample: {
      before: '10 FOR I=1 TO 5000\n20 LOCATE 0,I\n30 PRINT "X"\n40 NEXT I',
      after: '10 FOR I=1 TO 5000\n20 PRINT "X";\n30 NEXT I'
    },
    estimatedImpact: '~20ms savings'
  },
  {
    id: 'string-concat-25',
    lineNumber: 25,
    severity: 'low',
    category: 'string_operations',
    issue: 'String concatenation in tight loop',
    suggestion: 'Pre-allocate string or reduce operations',
    codeExample: {
      before: '10 A$=""\n20 FOR I=1 TO 100\n30 A$=A$+CHR$(I)\n40 NEXT I',
      after: '10 FOR I=1 TO 100\n20 PRINT CHR$(I);\n30 NEXT I'
    },
    estimatedImpact: '~5ms savings'
  }
]
```

### 6. Baseline Comparison

Compare profile results across runs:

```typescript
interface ProfileComparison {
  baseline: ProfileResult
  current: ProfileResult
  differences: ProfileDifference[]
  summary: ComparisonSummary
}

interface ProfileDifference {
  lineNumber: number
  metric: 'count' | 'time'
  baselineValue: number
  currentValue: number
  changeType: 'improvement' | 'regression' | 'neutral'
  percentageChange: number
}

interface ComparisonSummary {
  totalTimeChange: number           // milliseconds
  totalTimePercentage: number
  iterationChange: number
  hotspotsAdded: number[]
  hotspotsRemoved: number[]
  overallVerdict: 'faster' | 'slower' | 'similar'
}
```

## Implementation Priority

### Phase 1 (Week 1): Core Profiling Infrastructure

**Goal**: Collect line-level execution data

1. **Profiling Hooks in ExecutionEngine**
   - Add timing hooks before/after statement execution
   - Use `performance.now()` for high-resolution timing
   - Track execution count per line
   - Minimal overhead: only when profiling enabled

2. **Profile Data Storage**
   - Store line counts in Map
   - Store timing data in compact structure
   - Aggregate by statement type
   - Export to JSON format

3. **Basic Profiler UI**
   - Profile summary card
   - Line profile table (sortable)
   - Start/Stop profiling buttons
   - Export profile data

**Files to Create:**
- `src/core/profiling/CodeProfiler.ts` - Main profiler class
- `src/core/profiling/ProfileData.ts` - Profile data types
- `src/features/profiling/components/ProfilerPanel.vue` - Profiler UI
- `src/features/profiling/composables/useCodeProfiler.ts` - Profiler composable

**Files to Modify:**
- `src/core/execution/ExecutionEngine.ts` - Add profiling hooks
- `src/core/state/ExecutionContext.ts` - Add profiler state
- `src/features/ide/IdePage.vue` - Add profiler tab

### Phase 2 (Week 2): Advanced Features & Integration

**Goal**: Full profiling workflow with insights

1. **Editor Heatmap**
   - Monaco gutter decorations
   - Heatmap color gradient
   - Hover tooltips with stats
   - Toggle heatmap on/off

2. **Performance Suggestions**
   - Bottleneck detection
   - Automated suggestions
   - Code examples
   - Impact estimation

3. **Baseline Comparison**
   - Save/load baseline profiles
   - Compare current vs baseline
   - Diff view
   - Performance change indicators

4. **Advanced Visualizations**
   - Hot path detection
   - Statement type breakdown chart
   - Time distribution graph
   - Flame graph (optional)

**Files to Create:**
- `src/features/profiling/components/ProfilerHeatmap.vue` - Heatmap toggle
- `src/features/profiling/components/BottleneckCard.vue` - Bottleneck display
- `src/features/profiling/components/HotPathCard.vue` - Hot path display
- `src/features/profiling/components/StatementTypeChart.vue` - Chart
- `src/features/profiling/utils/suggestionEngine.ts` - Suggestion logic
- `src/features/profiling/utils/baselineManager.ts` - Baseline storage
- `src/features/profiling/composables/useProfilerHeatmap.ts` - Heatmap decorator

**Files to Modify:**
- `src/features/ide/components/MonacoCodeEditor.vue` - Add heatmap decorations
- `src/shared/i18n/en.ts` - Add profiler translations

## Technical Architecture

### New Profiling Infrastructure

```
src/core/profiling/
├── CodeProfiler.ts                 # Main profiler class
├── ProfileData.ts                  # Type definitions
├── TimingCollector.ts              # High-resolution timing
├── HotPathDetector.ts              # Detect frequently-executed paths
└── SuggestionEngine.ts             # Generate optimization suggestions

src/features/profiling/
├── components/
│   ├── ProfilerPanel.vue           # Main profiler UI
│   ├── ProfileSummary.vue          # Summary metrics
│   ├── LineProfileTable.vue        # Line execution table
│   ├── BottleneckCard.vue          # Bottleneck display
│   ├── HotPathCard.vue             # Hot path display
│   ├── StatementTypeChart.vue      # Statement breakdown
│   └── ProfileComparison.vue       # Baseline comparison
├── composables/
│   ├── useCodeProfiler.ts          # Profiler state
│   ├── useProfilerHeatmap.ts       # Editor heatmap
│   └── useBaselineComparison.ts    # Baseline management
└── utils/
    ├── heatmapColors.ts            # Color gradients
    ├── exportProfile.ts            # Profile export
    └── suggestionRules.ts          # Optimization rules
```

### Integration with Existing Code

**ExecutionEngine Hooks:**
```typescript
// src/core/execution/ExecutionEngine.ts
class ExecutionEngine {
  private profiler?: CodeProfiler

  constructor(options: ExecutionOptions) {
    this.profiler = options.enableProfiling
      ? new CodeProfiler()
      : undefined
  }

  private async executeStatement(statement: ExpandedStatement) {
    const lineNum = statement.lineNumber

    // Start timing
    const startTime = this.profiler?.startLine(lineNum)

    // Execute statement
    await this.statementRouter.executeStatement(statement)

    // End timing
    this.profiler?.endLine(lineNum, startTime)
  }

  getProfile(): ProfileResult | undefined {
    return this.profiler?.getResult()
  }
}
```

**Minimal Overhead Design:**
- Profiling only active when explicitly enabled
- Use boolean flag check (fastest possible check)
- Timing only when profiler is initialized
- No memory allocations during normal execution

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- `performance.now()` API (browser built-in)
- Vue 3 (already using)
- Monaco Editor (already using)
- TypeScript standard library

**Optional Enhancements:**
- `recharts`: For statement type breakdown chart
- `flamegraph-js`: For flame graph visualization

## Success Metrics

### Developer Velocity
- **Optimization Time**: Time to identify performance bottlenecks
- **Profiling Usage**: % of runs with profiling enabled
- **Optimization Success**: % of optimizations that improve performance

### Performance Impact
- **Average Improvement**: Performance improvement from profile-guided optimizations
- **Bottleneck Identification**: % of bottlenecks correctly identified
- **Suggestion Accuracy**: % of suggestions that lead to improvement

### User Satisfaction
- **Feature Usage**: % of sessions using profiler
- **Time Saved**: Reduced time spent on manual performance investigation
- **Learning**: Self-reported improvement in performance optimization skills

## Benefits

### Immediate Benefits
1. **Identify Hotspots**: See exactly which lines execute most
2. **Measure Impact**: Know how long operations actually take
3. **Targeted Optimization**: Focus effort where it matters most
4. **Learn Patterns**: Understand performance characteristics of F-BASIC

### Long-Term Benefits
1. **Better Code**: Developers write more efficient code
2. **Faster Programs**: Community programs run faster
3. **Knowledge Sharing**: Share profiles for learning
4. **Documentation**: Profiles serve as performance documentation

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Profiling overhead affects results | Document overhead; use timing correction |
| Small programs show noisy data | Only show profiling after meaningful iterations |
| Overwhelming data for beginners | Progressive disclosure; highlight key metrics only |
| False positives in suggestions | Clearly mark suggestions as recommendations |
| Performance varies by hardware | Note hardware dependencies; focus on relative comparisons |

## Open Questions

1. **Overhead Threshold**: What profiling overhead is acceptable? (Target: <5%)
2. **Data Retention**: How many profiles to keep for comparison?
3. **Profiling Mode**: Always-on vs manual start/stop?
4. **Heatmap Default**: Should heatmap be on by default when profiling?
5. **Mobile Support**: How to handle profiling on mobile devices?

## Next Steps

1. **Prototype**: Add timing hooks to ExecutionEngine for one statement type
2. **Measure**: Verify overhead is acceptable (<5%)
3. **UI**: Build basic profiler panel with line counts
4. **Heatmap**: Implement Monaco gutter decorations
5. **Suggestions**: Add bottleneck detection rules

## Implementation Details

### Specific Code Changes

**1. ExecutionEngine Profiling Hook**

```typescript
// src/core/execution/ExecutionEngine.ts
import { CodeProfiler } from '../profiling/CodeProfiler'

interface ExecutionOptions {
  // Existing options...
  enableProfiling?: boolean
}

class ExecutionEngine {
  private profiler?: CodeProfiler

  constructor(options: ExecutionOptions) {
    // Existing initialization...

    if (options.enableProfiling) {
      this.profiler = new CodeProfiler()
      this.context.profiler = this.profiler
    }
  }

  async execute(statements: ExpandedStatement[]): Promise<ExecutionResult> {
    // Existing setup...

    const startTime = performance.now()

    while (this.context.shouldContinue()) {
      const statement = this.context.statements[this.context.currentStatementIndex]

      // Profile: Start timing
      const lineStart = this.profiler?.startLine(statement.lineNumber)

      // Execute statement
      await this.statementRouter.executeStatement(statement)

      // Profile: End timing
      this.profiler?.endLine(statement.lineNumber, lineStart)

      // Rest of execution loop...
    }

    const endTime = performance.now()

    return {
      // Existing result properties...
      profile: this.profiler?.getResult(endTime - startTime)
    }
  }
}
```

**2. CodeProfiler Implementation**

```typescript
// src/core/profiling/CodeProfiler.ts
export class CodeProfiler {
  private lineData: Map<number, LineTimingData>
  private startTimes: Map<number, number>
  private statementCounts: Map<StatementType, number>

  constructor() {
    this.lineData = new Map()
    this.startTimes = new Map()
    this.statementCounts = new Map()
  }

  startLine(lineNumber: number): number | undefined {
    const startTime = performance.now()
    this.startTimes.set(lineNumber, startTime)
    return startTime
  }

  endLine(lineNumber: number, startTime?: number): void {
    if (startTime === undefined) return

    const endTime = performance.now()
    const duration = endTime - startTime

    let data = this.lineData.get(lineNumber)
    if (!data) {
      data = {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0
      }
      this.lineData.set(lineNumber, data)
    }

    data.count++
    data.totalTime += duration
    data.minTime = Math.min(data.minTime, duration)
    data.maxTime = Math.max(data.maxTime, duration)
  }

  getResult(totalExecutionTime: number): ProfileResult {
    const lines: LineProfile[] = []

    for (const [lineNumber, data] of this.lineData) {
      lines.push({
        lineNumber,
        executionCount: data.count,
        percentageOfTotal: (data.count / this.getTotalIterations()) * 100,
        avgTimePerExecution: data.totalTime / data.count,
        totalTime: data.totalTime,
        statementType: this.inferStatementType(lineNumber)
      })
    }

    return {
      programName: '',
      totalIterations: this.getTotalIterations(),
      totalExecutionTime,
      lines: lines.sort((a, b) => b.executionCount - a.executionCount),
      hotPaths: this.detectHotPaths(),
      bottlenecks: this.detectBottlenecks()
    }
  }

  private getTotalIterations(): number {
    let total = 0
    for (const data of this.lineData.values()) {
      total += data.count
    }
    return total
  }

  private inferStatementType(lineNumber: number): StatementType {
    // TODO: Look up statement type from parsed CST
    return 'assignment'
  }

  private detectHotPaths(): HotPath[] {
    // TODO: Implement hot path detection
    return []
  }

  private detectBottlenecks(): Bottleneck[] {
    // TODO: Implement bottleneck detection
    return []
  }
}

interface LineTimingData {
  count: number
  totalTime: number
  minTime: number
  maxTime: number
}
```

### Acceptance Criteria

**Week 1:**
- [ ] Profiling can be enabled via config or UI toggle
- [ ] Line execution counts are accurate
- [ ] Timing data is collected with <5% overhead
- [ ] Profiler panel shows line counts sortable by frequency
- [ ] Export profile to JSON works
- [ ] Start/Stop profiling buttons work

**Week 2:**
- [ ] Editor heatmap shows execution frequency
- [ ] Heatmap colors match execution count ranges
- [ ] Hover on heatmap shows detailed stats
- [ ] Bottlenecks are identified with suggestions
- [ ] Baseline profiles can be saved/loaded
- [ ] Comparison view shows performance changes

---

*"Performance is a feature. The F-BASIC profiler transforms optimization from guesswork into science—showing developers exactly where their code spends its time, so they can make every iteration count."*
