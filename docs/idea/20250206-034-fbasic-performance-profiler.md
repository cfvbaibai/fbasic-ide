# Strategic Idea: F-BASIC Performance Profiler

**Date**: 2026-02-06
**Turn**: 34
**Status**: Conceptual
**Focus Area**: Performance & Scalability
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add **execution time profiling** to the Family Basic IDE that measures how long each line of code takes to execute, identifies performance bottlenecks, and helps developers optimize slow-running programs—turning invisible performance problems into actionable data.

## Problem Statement

### Current Performance Debugging Issues

1. **Invisible Performance Problems**: Developers can't see what's slow
   - No visibility into which lines consume the most time
   - Can't identify bottlenecks without manual timing hacks
   - No way to compare before/after optimization
   - Performance issues are "felt" but not measured

2. **Manual Profiling is Tedious**: Developers must add timing code
   - Must add PRINT statements with timestamps
   - Need to manually calculate differences
   - Can't measure small time differences accurately
   - Alters program behavior while measuring

3. **No Hotspot Identification**: Don't know where to optimize
   - Can't tell if loops are the problem
   - Don't know if sprite commands are slow
   - No aggregated view of time by line
   - Wasted optimization effort on fast code

4. **No Historical Comparison**: Can't track performance over time
   - No way to measure if changes improved performance
   - Can't set performance budgets
   - No regression detection for speed
   - Performance gets worse invisibly

5. **Animation Lag is Mysterious**: Games feel sluggish but why?
   - Is it the sprite rendering? The PRINT statements? The PAUSE?
   - No frame time breakdown
   - Can't identify 60 FPS drops
   - No guidance on fixing frame rate issues

## Proposed Solution

### 1. Per-Line Execution Timing

Track execution time for each line number:

```typescript
interface LineProfile {
  lineNumber: number
  executionCount: number        // How many times executed
  totalTimeMs: number           // Total time spent (ms)
  avgTimeMs: number             // Average time per execution (ms)
  maxTimeMs: number             // Slowest single execution (ms)
  minTimeMs: number             // Fastest single execution (ms)
  percentOfTotal: number        // % of total program time
}

interface ProgramProfile {
  lines: Map<number, LineProfile>
  totalExecutionTimeMs: number
  totalIterations: number
  timestamp: number
}
```

**Display Example:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Performance Profile                     Total: 5.2s | 100 iter  │
├─────────────────────────────────────────────────────────────────┤
│ Line │ Exec  │ Total │ Avg   │ Max   │ Min   │ % │ Statement   │
├──────┼───────┼───────┼───────┼───────┼───────┼───┼────────────┤
│ 70   │ 1500  │ 3.2s  │ 2.1ms │ 5.8ms │ 0.3ms │ 62│ PRINT "X"; │
│ 60   │ 1500  │ 1.1s  │ 0.7ms │ 1.2ms │ 0.5ms │ 21│ FOR I=1..  │
│ 80   │ 1500  │ 0.5s  │ 0.3ms │ 0.9ms │ 0.1ms │ 10│ MOVE 0     │
│ 50   │ 1     │ 0.3s  │ 300ms │ 300ms │ 300ms │ 6 │ DEF SPRITE │
│ 10   │ 1     │ 0.1s  │ 100ms │ 100ms │ 100ms │ 2 │ CLS        │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Execution Timeline Visualization

Visual timeline showing execution over time:

```typescript
interface TimelineEvent {
  lineNumber: number
  startTime: number           // ms from program start
  duration: number            // ms
  depth: number               // For nested calls (GOSUB)
}

interface ExecutionTimeline {
  events: TimelineEvent[]
  totalDuration: number
}
```

**Timeline View:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Execution Timeline (5.2s total)                                 │
├─────────────────────────────────────────────────────────────────┤
│ Line 10 CLS          [████████] 0.1s                           │
│ Line 20 DEF SPRITE   [████████████████████] 0.3s               │
│ Line 30 DEF MOVE     [████████] 0.1s                           │
│ Line 40 MOVE         [████████] 0.1s                           │
│ Line 50 FOR I=1 TO 150                                        │
│   Line 60 PRINT     [████████████████████████████] 1.1s        │
│   Line 70 MOVE      [████████████████████████████████████████] 3.2s │
│   Line 80 NEXT      [████████████] 0.5s                        │
│ Line 90 END         [] 0s                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Hotspot Detection

Automatically identify slow lines:

```typescript
interface Hotspot {
  lineNumber: number
  reason: HotspotReason
  severity: 'high' | 'medium' | 'low'
  suggestion: string
}

type HotspotReason =
  | 'high_avg_time'        // Consistently slow
  | 'high_max_time'        // Sometimes very slow
  | 'high_total_time'      // Executes many times
  | 'high_variance'        // Inconsistent timing

interface HotspotReport {
  hotspots: Hotspot[]
  totalImpact: number      // % of time that could be saved
}
```

**Hotspot Panel:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Performance Hotspots                                            │
├─────────────────────────────────────────────────────────────────┤
│ 🔴 High Impact                                                  │
│ • Line 70: Executed 1500 times, 3.2s total (62% of program)     │
│   Suggestion: Consider reducing iterations or optimizing loop    │
│                                                                  │
│ 🟡 Medium Impact                                                │
│ • Line 60: High variance (0.5ms - 1.2ms) indicates inconsistent  │
│   performance. Check for conditional branches.                  │
│                                                                  │
│ 🟢 Low Impact                                                   │
│ • Line 20: One-time cost of 300ms. Acceptable for init.         │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Frame Time Analysis (for games)

Break down frame-by-frame timing:

```typescript
interface FrameProfile {
  frameNumber: number
  startTime: number
  duration: number              // ms
  targetFps: number             // Usually 30 or 60
  droppedFrame: boolean
  breakdown: {
    logic: number               // Time in BASIC logic
    rendering: number           // Time in rendering
    waiting: number             // Time in PAUSE/sleep
  }
}
```

**Frame Timeline:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Frame Timeline (Target: 30 FPS = 33.3ms)                        │
├─────────────────────────────────────────────────────────────────┤
│ F1  [████████████████████████████] 28ms  ✅ OK                  │
│ F2  [████████████████████████████████████████████] 42ms ⚠️ Drop │
│ F3  [████████████████████████████] 29ms  ✅ OK                  │
│ F4  [████████████████████████████████████████████████] 48ms ⚠️ Drop│
│ F5  [████████████████████████████] 31ms  ✅ OK                  │
│                                                                  │
│ Frame 2 breakdown: Logic 35ms | Render 5ms | Wait 2ms           │
│ Suggestion: Loop in lines 60-70 is too slow for 30 FPS          │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Profiling Controls

Enable/disable profiling with minimal overhead:

```typescript
interface ProfilingConfig {
  enabled: boolean
  sampleRate: number           // 1 = all, 10 = every 10th
  maxLines: number             // Limit lines tracked
  includeOverhead: boolean     // Include profiling overhead
}

interface ProfilingSession {
  config: ProfilingConfig
  startTime: number
  endTime?: number
  profile?: ProgramProfile
  timeline?: ExecutionTimeline
  hotspots?: HotspotReport
  frameProfiles?: FrameProfile[]
}
```

**Control Panel:**
```vue
<template>
  <div class="profiling-controls">
    <Toggle v-model="profilingEnabled" label="Enable Profiling" />

    <Select v-model="sampleRate" label="Sample Rate">
      <option value="1">100% (All lines)</option>
      <option value="10">10% (Every 10th)</option>
      <option value="100">1% (Every 100th)</option>
    </Select>

    <Button @click="startProfiling" :disabled="isRunning">
      Start Profiling Run
    </Button>

    <Button @click="showResults" :disabled="!hasProfile">
      View Results
    </Button>
  </div>
</template>
```

## Implementation Priority

### Phase 1 (Basic Line Profiling - Week 1)

**Goal**: Track execution time per line

1. **Execution Timing**
   - Add timing to ExecutionContext
   - Measure time before/after each statement
   - Track execution count per line
   - Store in memory-efficient structure

2. **Results Display**
   - Create profile results table
   - Show by line sorted by total time
   - Display execution count and averages
   - Export to clipboard

3. **Controls**
   - Add profile toggle to IDE
   - Minimal overhead when disabled
   - Clear profile between runs
   - Persist settings

**Files to Create:**
- `src/core/profiling/Profiler.ts` - Core profiling logic
- `src/core/profiling/types.ts` - Profiling type definitions
- `src/features/profiling/components/ProfileResults.vue` - Results display
- `src/features/profiling/composables/useProfiler.ts` - Profiling composable

**Files to Modify:**
- `src/core/state/ExecutionContext.ts` - Add profiling hooks
- `src/core/execution/ExecutionEngine.ts` - Measure execution time
- `src/features/ide/components/IdeControls.vue` - Add profile button
- `src/features/ide/IdePage.vue` - Add profile results panel

### Phase 2 (Timeline & Hotspots - Week 2)

**Goal**: Visualize execution and identify problems

1. **Timeline Visualization**
   - Record execution order
   - Display timeline chart
   - Show call depth (GOSUB nesting)
   - Highlight slow regions

2. **Hotspot Detection**
   - Identify slow lines
   - Calculate optimization potential
   - Provide actionable suggestions
   - Categorize by severity

3. **Frame Analysis**
   - Track frame boundaries
   - Detect dropped frames
   - Break down frame time
   - Show FPS graph

**Files to Create:**
- `src/features/profiling/components/TimelineView.vue` - Timeline chart
- `src/features/profiling/components/HotspotPanel.vue` - Hotspot display
- `src/features/profiling/components/FrameTimeline.vue` - Frame analysis
- `src/core/profiling/hotspotDetector.ts` - Hotspot detection logic
- `src/core/profiling/timelineRecorder.ts` - Timeline recording

**Files to Modify:**
- `src/features/profiling/components/ProfileResults.vue` - Add tabs for timeline/hotspots

## Technical Architecture

### Profiling Infrastructure

```typescript
// src/core/profiling/Profiler.ts

export class Profiler {
  private config: ProfilingConfig
  private lineData: Map<number, LineProfile>
  private timeline: TimelineEvent[]
  private startTime: number = 0
  private currentDepth: number = 0  // For GOSUB nesting

  constructor(config: ProfilingConfig) {
    this.config = config
    this.lineData = new Map()
    this.timeline = []
  }

  /**
   * Start profiling a program execution
   */
  start(): void {
    this.lineData.clear()
    this.timeline = []
    this.startTime = performance.now()
    this.currentDepth = 0
  }

  /**
   * Record execution of a line (called by ExecutionEngine)
   */
  recordLine(lineNumber: number, durationMs: number): void {
    // Apply sampling
    if (this.config.sampleRate > 1) {
      if (Math.random() * this.config.sampleRate >= 1) return
    }

    // Update line profile
    let profile = this.lineData.get(lineNumber)
    if (!profile) {
      profile = {
        lineNumber,
        executionCount: 0,
        totalTimeMs: 0,
        avgTimeMs: 0,
        maxTimeMs: 0,
        minTimeMs: Infinity,
        percentOfTotal: 0
      }
      this.lineData.set(lineNumber, profile)
    }

    profile.executionCount++
    profile.totalTimeMs += durationMs
    profile.maxTimeMs = Math.max(profile.maxTimeMs, durationMs)
    profile.minTimeMs = Math.min(profile.minTimeMs, durationMs)
    profile.avgTimeMs = profile.totalTimeMs / profile.executionCount

    // Record timeline event
    this.timeline.push({
      lineNumber,
      startTime: performance.now() - this.startTime,
      duration: durationMs,
      depth: this.currentDepth
    })
  }

  /**
   * Enter GOSUB call (increase depth)
   */
  enterGosub(): void {
    this.currentDepth++
  }

  /**
   * Exit GOSUB call (decrease depth)
   */
  exitGosub(): void {
    this.currentDepth = Math.max(0, this.currentDepth - 1)
  }

  /**
   * Finalize profiling results
   */
  finalize(): ProgramProfile {
    const endTime = performance.now()
    const totalExecutionTimeMs = endTime - this.startTime

    // Calculate percentages
    for (const profile of this.lineData.values()) {
      profile.percentOfTotal = (profile.totalTimeMs / totalExecutionTimeMs) * 100
    }

    return {
      lines: this.lineData,
      totalExecutionTimeMs,
      totalIterations: Array.from(this.lineData.values())
        .reduce((sum, p) => sum + p.executionCount, 0),
      timestamp: Date.now()
    }
  }

  /**
   * Get timeline events
   */
  getTimeline(): ExecutionTimeline {
    return {
      events: this.timeline,
      totalDuration: performance.now() - this.startTime
    }
  }
}
```

### ExecutionEngine Integration

```typescript
// src/core/execution/ExecutionEngine.ts

export class ExecutionEngine {
  private profiler?: Profiler

  constructor(...) {
    // ...
    if (config.enableProfiling) {
      this.profiler = new Profiler(config.profiling)
    }
  }

  async execute(): Promise<ExecutionResult> {
    if (this.profiler) {
      this.profiler.start()
    }

    while (this.context.shouldContinue()) {
      const statement = this.context.getCurrentStatement()
      if (!statement) break

      const startTime = performance.now()

      // Execute statement
      await this.statementRouter.executeStatement(statement)

      const duration = performance.now() - startTime

      // Record profiling data
      if (this.profiler) {
        this.profiler.recordLine(statement.lineNumber, duration)
      }
    }

    if (this.profiler) {
      const profile = this.profiler.finalize()
      this.context.deviceAdapter?.profileComplete(profile)
    }

    return { /* ... */ }
  }

  // Track GOSUB depth for timeline
  async executeGosub(lineNumber: number): void {
    this.profiler?.enterGosub()
    // ... existing GOSUB logic ...
    this.profiler?.exitGosub()
  }
}
```

### Device Adapter Integration

```typescript
// src/core/devices/WebWorkerDeviceAdapter.ts

export class WebWorkerDeviceAdapter implements BasicDeviceAdapter {
  profileComplete(profile: ProgramProfile): void {
    this.postMessage({
      type: 'PROFILE_COMPLETE',
      profile
    })
  }
}
```

### Profile Results Component

```vue
<!-- src/features/profiling/components/ProfileResults.vue -->

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProgramProfile, LineProfile } from '@/core/profiling/types'

defineOptions({
  name: 'ProfileResults'
})

const props = defineProps<{
  profile: ProgramProfile | null
}>()

const { t } = useI18n()

const sortedLines = computed(() => {
  if (!props.profile) return []
  return Array.from(props.profile.lines.values())
    .sort((a, b) => b.totalTimeMs - a.totalTimeMs)
})

const formatTime = (ms: number): string => {
  if (ms < 1) return `${(ms * 1000).toFixed(1)}μs`
  if (ms < 1000) return `${ms.toFixed(2)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`
}
</script>

<template>
  <div v-if="profile" class="profile-results">
    <div class="profile-header">
      <h3>{{ t('profiling.title') }}</h3>
      <div class="summary">
        <span>{{ t('profiling.totalTime') }}: {{ formatTime(profile.totalExecutionTimeMs) }}</span>
        <span>{{ t('profiling.totalIterations') }}: {{ profile.totalIterations }}</span>
      </div>
    </div>

    <table class="profile-table">
      <thead>
        <tr>
          <th>{{ t('profiling.line') }}</th>
          <th>{{ t('profiling.executions') }}</th>
          <th>{{ t('profiling.totalTime') }}</th>
          <th>{{ t('profiling.avgTime') }}</th>
          <th>{{ t('profiling.maxTime') }}</th>
          <th>{{ t('profiling.minTime') }}</th>
          <th>{{ t('profiling.percent') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="line in sortedLines" :key="line.lineNumber">
          <td class="line-number">{{ line.lineNumber }}</td>
          <td class="execution-count">{{ line.executionCount }}</td>
          <td class="total-time">{{ formatTime(line.totalTimeMs) }}</td>
          <td class="avg-time">{{ formatTime(line.avgTimeMs) }}</td>
          <td class="max-time">{{ formatTime(line.maxTimeMs) }}</td>
          <td class="min-time">{{ formatTime(line.minTimeMs) }}</td>
          <td class="percent">
            <div class="percent-bar">
              <div
                class="percent-fill"
                :style="{ width: formatPercent(line.percentOfTotal) }"
              />
              <span class="percent-text">{{ formatPercent(line.percentOfTotal) }}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.profile-results {
  padding: 1rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary {
  display: flex;
  gap: 1rem;
  font-family: var(--game-font-family-mono);
  font-size: var(--game-font-size-sm);
  color: var(--game-text-secondary);
}

.profile-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--game-font-family-mono);
  font-size: var(--game-font-size-sm);
}

.profile-table th {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 2px solid var(--game-surface-border);
  color: var(--game-text-secondary);
}

.profile-table td {
  padding: 0.5rem;
  border-bottom: 1px solid var(--game-surface-border);
}

.line-number {
  font-weight: bold;
  color: var(--game-text-primary);
}

.percent-bar {
  position: relative;
  width: 100%;
  height: 20px;
  background: var(--base-solid-gray-20);
  border-radius: 4px;
  overflow: hidden;
}

.percent-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--color-primary, #3b82f6);
  transition: width 0.3s ease;
}

.percent-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: white;
  text-shadow: 0 0 2px rgba(0,0,0,0.5);
}
</style>
```

### Hotspot Detection

```typescript
// src/core/profiling/hotspotDetector.ts

export interface Hotspot {
  lineNumber: number
  reason: HotspotReason
  severity: 'high' | 'medium' | 'low'
  suggestion: string
  impact: number              // % of total time
}

export function detectHotspots(profile: ProgramProfile): Hotspot[] {
  const hotspots: Hotspot[] = []
  const lines = Array.from(profile.lines.values())

  // Find high-impact lines (top 20% of time)
  const sortedByTotal = [...lines].sort((a, b) => b.totalTimeMs - a.totalTimeMs)
  const cumulativeTime = sortedByTotal.reduce((sum, line) => sum + line.totalTimeMs, 0)
  let currentSum = 0

  for (const line of sortedByTotal) {
    currentSum += line.totalTimeMs
    const percentOfTotal = (line.totalTimeMs / profile.totalExecutionTimeMs) * 100

    // High total time hotspot
    if (percentOfTotal > 10) {
      hotspots.push({
        lineNumber: line.lineNumber,
        reason: 'high_total_time',
        severity: percentOfTotal > 25 ? 'high' : 'medium',
        suggestion: generateTotalTimeSuggestion(line),
        impact: percentOfTotal
      })
    }

    // Stop after 80% of total time
    if (currentSum / cumulativeTime > 0.8) break
  }

  // Find high variance lines
  for (const line of lines) {
    const varianceRatio = line.maxTimeMs / (line.avgTimeMs || 1)
    if (varianceRatio > 3 && line.executionCount > 10) {
      hotspots.push({
        lineNumber: line.lineNumber,
        reason: 'high_variance',
        severity: 'medium',
        suggestion: `Line ${line.lineNumber} has inconsistent timing (${line.minTimeMs.toFixed(2)}ms - ${line.maxTimeMs.toFixed(2)}ms). Check for conditional branches or variable work.`,
        impact: (line.totalTimeMs / profile.totalExecutionTimeMs) * 100
      })
    }
  }

  return hotspots.sort((a, b) => b.impact - a.impact)
}

function generateTotalTimeSuggestion(line: LineProfile): string {
  if (line.executionCount > 100) {
    return `Executed ${line.executionCount} times. Consider reducing iterations or moving work outside the loop.`
  } else if (line.avgTimeMs > 10) {
    return `Average execution is ${line.avgTimeMs.toFixed(2)}ms. Consider optimizing the operation.`
  } else {
    return `Uses ${line.percentOfTotal.toFixed(1)}% of total time. Profile further to identify specific bottleneck.`
  }
}
```

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Existing `performance.now()` API for timing
- Existing web worker architecture
- Vue 3 composition API
- TypeScript standard library

**Optional Enhancements:**
- Chart.js or D3.js for timeline visualization (Phase 2)
- IndexedDB for historical profile storage

## Success Metrics

### Developer Velocity
- **Optimization Speed**: Time to identify and fix performance issues
- **Measurement Accuracy**: Precision of timing measurements
- **Actionability**: % of hotspots with clear remediation

### User Engagement
- **Profiling Usage**: # of profiling runs per session
- **Results Viewed**: % of profiling runs where results are viewed
- **Optimization Actions**: # of code changes based on profiling
- **Performance Improvements**: Measured speedups from optimizations

### Technical Quality
- **Overhead**: <5% performance impact when disabled, <20% when enabled
- **Accuracy**: Timing measurements within ±1ms
- **Memory**: Profile data <1MB for typical programs
- **Reliability**: No crashes or data corruption

## Benefits

### Immediate Benefits
1. **Identify Bottlenecks**: Know exactly what's slow
2. **Measure Improvements**: Quantify optimization results
3. **Educational**: Learn which commands are expensive
4. **Debug Lag**: Fix frame rate issues in games

### Long-Term Benefits
1. **Performance Culture**: Developers think about performance
2. **Better UX**: Faster, more responsive programs
3. **Optimization Patterns**: Learn what makes F-BASIC fast
4. **Performance Budgets**: Set and enforce speed targets

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Timing inaccuracy from worker communication | Use high-resolution timer; account for overhead |
| Performance overhead from profiling | Disable by default; use sampling |
| Memory usage from large profiles | Limit timeline depth; compress data |
| Confusing results for beginners | Add tooltips and explanations |
| Profiling alters program behavior | Document limitations; use sampling |

## Open Questions

1. **Overhead Measurement**: How to subtract profiling overhead from results?
2. **Sampling Strategy**: What default sample rate for production?
3. **Persistence**: Should profiles be saved to localStorage?
4. **Comparison**: Support comparing two profiles side-by-side?
5. **Export**: Allow exporting profiles as JSON/CSV?

## Next Steps

1. **Prototype**: Add timing to ExecutionEngine for one line
2. **UI**: Create basic results table display
3. **Integration**: Wire up profile toggle in IDE
4. **Test**: Profile existing programs (sprite test, samples)
5. **Refine**: Adjust overhead and accuracy
6. **Expand**: Add timeline and hotspot detection

## Implementation Details

### Specific Code Changes

**ExecutionContext Enhancement:**

```typescript
// src/core/state/ExecutionContext.ts

export interface InterpreterConfig {
  // ... existing config ...

  // Profiling configuration
  enableProfiling?: boolean
  profiling?: {
    sampleRate?: number         // Default: 1 (all lines)
    maxTimelineEvents?: number  // Default: 10000
  }
}

export class ExecutionContext {
  // ... existing properties ...

  // Profiling state
  public profiler?: Profiler

  constructor(config: InterpreterConfig) {
    this.config = config

    // Initialize profiler if enabled
    if (config.enableProfiling) {
      this.profiler = new Profiler({
        enabled: true,
        sampleRate: config.profiling?.sampleRate ?? 1,
        maxLines: 1000,
        includeOverhead: false
      })
    }
  }

  /**
   * Record line execution (called by ExecutionEngine)
   */
  recordLineExecution(lineNumber: number, durationMs: number): void {
    this.profiler?.recordLine(lineNumber, durationMs)
  }

  /**
   * Enter GOSUB call
   */
  enterGosub(): void {
    this.profiler?.enterGosub()
  }

  /**
   * Exit GOSUB call
   */
  exitGosub(): void {
    this.profiler?.exitGosub()
  }
}
```

**ExecutionEngine Profiling Hook:**

```typescript
// src/core/execution/ExecutionEngine.ts

async execute(): Promise<ExecutionResult> {
  // ... existing setup ...

  // Start profiling
  this.context.profiler?.start()

  while (this.context.shouldContinue()) {
    const expandedStatement = this.context.getCurrentStatement()
    if (!expandedStatement) break

    const lineNumber = expandedStatement.lineNumber

    // Measure execution time
    const startTime = performance.now()

    // Execute statement
    await this.statementRouter.executeStatement(expandedStatement)

    const duration = performance.now() - startTime

    // Record profiling data
    this.context.recordLineExecution(lineNumber, duration)

    // ... rest of loop ...
  }

  // Finalize profiling and send results
  if (this.context.profiler) {
    const profile = this.context.profiler.finalize()
    this.context.deviceAdapter?.profileComplete(profile)
  }

  // ... existing cleanup ...
}
```

**GOSUB Depth Tracking:**

```typescript
// src/core/execution/executors/GosubExecutor.ts

async execute(gosubStmtCst: CstNode, lineNumber: number): Promise<void> {
  // Enter GOSUB (for timeline depth)
  this.context.enterGosub()

  // ... existing GOSUB logic ...

  // Note: RETURN will call this.context.exitGosub()
}
```

**Profiling Controls in IDE:**

```vue
<!-- src/features/ide/components/IdeControls.vue -->

<script setup lang="ts">
// ... existing imports ...

const profilingEnabled = ref(false)

function toggleProfiling() {
  profilingEnabled.value = !profilingEnabled.value
  // Update interpreter config
}
</script>

<template>
  <div class="ide-controls">
    <!-- ... existing controls ... -->

    <GameButton
      :type="profilingEnabled ? 'primary' : 'default'"
      @click="toggleProfiling"
      title="Enable performance profiling"
    >
      <GameIcon icon="mdi:speedometer" size="small" />
      <span v-if="profilingEnabled">Profiling ON</span>
      <span v-else>Profile</span>
    </GameButton>
  </div>
</template>
```

### Acceptance Criteria

**Phase 1 (Week 1):**
- [ ] Profiler class created with timing logic
- [ ] ExecutionEngine measures time per statement
- [ ] Profile results table displays correctly
- [ ] Results sorted by total time (slowest first)
- [ ] Show execution count, total/avg/max/min time
- [ ] Profiling toggle in IDE controls
- [ ] Overhead <5% when disabled
- [ ] Profile data sent to main thread via worker

**Phase 2 (Week 2):**
- [ ] Timeline view shows execution order
- [ ] GOSUB nesting depth visualized
- [ ] Hotspot detection identifies slow lines
- [ ] Actionable suggestions provided
- [ ] Frame timeline for game programs
- [ ] Dropped frame detection
- [ ] Export profile to clipboard/JSON

**Test Coverage:**
- [ ] Unit test for Profiler timing accuracy
- [ ] Integration test for ExecutionEngine hooks
- [ ] Unit test for hotspot detection
- [ ] Visual test for results table

---

*"You can't optimize what you can't measure. Let's make F-BASIC performance visible, measurable, and actionable—so developers can build fast, responsive programs without guessing."*
