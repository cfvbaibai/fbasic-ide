# Strategic Idea: Execution Tracing & Debug Visualizer

**Date**: 2026-02-06
**Turn**: 14
**Status**: Conceptual
**Focus Area**: Developer Experience & Testing
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add an **execution tracing and debug visualizer** to the Family Basic IDE that provides real-time visibility into program flow—showing line-by-line execution, variable state changes, and loop/call stack tracking to help developers understand exactly what their code is doing.

## Problem Statement

### Current Debugging Limitations

1. **Black Box Execution**: Developers cannot see what happens during execution
   - No visibility into which lines are executing
   - No way to see variable values as they change
   - Cannot trace loop iterations
   - No call stack for GOTO/GOSUB tracking

2. **Print Statement Debugging**: Developers must add PRINT statements to debug
   - Code becomes cluttered with debug output
   - Must remove or comment out debug prints
   - Hard to correlate debug output with specific lines
   - No structured way to inspect state

3. **Limited Debug Mode**: Current debug mode shows raw internals
   - Debug output shows statement indices, not line numbers
   - No visual highlighting of executing line
   - No variable watch window
   - No loop iteration counter display

4. **No Execution History**: Cannot review what happened
   - After program ends, execution trace is lost
   - Cannot step back through execution
   - No record of which branches were taken
   - Cannot replay execution step-by-step

5. **Difficult Loop Debugging**: Loop behavior is opaque
   - Cannot see how many times a loop executed
   - No visibility into loop variable changes
   - Hard to detect infinite loops until too late
   - Cannot trace nested loop iterations

## Proposed Solution

### 1. Execution Trace Collector

Capture execution events with minimal overhead:

```typescript
interface ExecutionTrace {
  executionId: string
  events: TraceEvent[]
  startTime: number
  endTime: number
  totalIterations: number
}

interface TraceEvent {
  timestamp: number
  iteration: number
  lineNumber: number
  eventType: 'line_executed' | 'variable_changed' | 'loop_enter' | 'loop_exit' | 'goto' | 'gosub' | 'return'
  data: {
    statement?: string
    variable?: { name: string; oldValue: number | string; newValue: number | string }
    loop?: { variable: string; current: number; end: number; depth: number }
    jump?: { fromLine: number; toLine: number }
    call?: { fromLine: number; toLine: number; depth: number }
  }
}
```

**Trace Collection Example:**

```basic
10 FOR I = 1 TO 3
20   J = I * 2
30   PRINT J
40 NEXT I
```

**Trace Output:**
```
[1] Line 10: FOR I = 1 TO 3
    → Loop enter: I=1, TO=3, depth=1
[2] Line 20: J = I * 2
    → Variable change: J = 0 → 2
[3] Line 30: PRINT J
[4] Line 40: NEXT I
    → Loop iteration: I=1→2
[5] Line 20: J = I * 2
    → Variable change: J = 2 → 4
[6] Line 30: PRINT J
[7] Line 40: NEXT I
    → Loop iteration: I=2→3
[8] Line 20: J = I * 2
    → Variable change: J = 4 → 6
[9] Line 30: PRINT J
[10] Line 40: NEXT I
    → Loop exit: I=3, depth=1
```

### 2. Variable Watch Panel

Real-time variable inspection:

```typescript
interface VariableWatchEntry {
  name: string
  value: number | string
  type: 'numeric' | 'string'
  changedAtIteration: number
  changedAtLine: number
  changeCount: number
  history: Array<{ iteration: number; line: number; value: number | string }>
}
```

**Watch Panel Features:**
- Auto-track all variables that change
- Show current value and type
- Highlight changed variables (yellow flash)
- Show change history (last N changes)
- Filter by variable name
- Export variable state at any point

### 3. Execution Timeline

Visual representation of program flow:

```typescript
interface TimelineEvent {
  lineNumber: number
  iteration: number
  timestamp: number
  duration: number
  color: string // Color-coded by statement type
}
```

**Timeline Features:**
- Horizontal scrollable timeline
- Color-coded by statement type:
  - Blue: Control flow (IF, FOR, GOTO)
  - Green: Assignment
  - Yellow: I/O (PRINT, INPUT)
  - Purple: GOSUB/CALL
- Click event to jump to line in editor
- Show loop iteration markers
- Highlight hot paths (frequently executed lines)

### 4. Loop Inspector

Dedicated view for loop debugging:

```typescript
interface LoopInspection {
  lineNumber: number // FOR statement line
  variable: string
  start: number
  end: number
  step: number
  currentIterations: number[]
  depth: number
  isActive: boolean
  nestedLoops: LoopInspection[]
}
```

**Loop Inspector Features:**
- List all active loops
- Show loop variable range and current value
- Track iteration count
- Visual nesting indicator (indentation)
- Loop completion percentage
- Break loop from UI (debugging aid)

### 5. GOTO/GOSUB Tracker

Trace control flow jumps:

```typescript
interface JumpTrace {
  type: 'GOTO' | 'GOSUB' | 'RETURN'
  fromLine: number
  toLine: number
  iteration: number
  callDepth?: number // For GOSUB nesting
}
```

**Jump Tracker Features:**
- List all GOTO jumps with source/destination
- Track GOSUB call stack
- Show return points for GOSUB
- Detect potential infinite GOTO loops
- Visual jump arrows in editor (optional)

### 6. Trace Replay

Step through execution after completion:

```typescript
interface TraceReplayer {
  totalEvents: number
  currentPosition: number
  canStepForward: boolean
  canStepBackward: boolean

  stepForward(): TraceEvent
  stepBackward(): TraceEvent
  jumpToIteration(iteration: number): TraceEvent
  jumpToLine(lineNumber: number): TraceEvent[]
}
```

**Replay Features:**
- Slider to scrub through execution
- Step forward/backward buttons
- Jump to specific line number
- Jump to specific iteration
- Auto-play with speed control
- Highlight executing line in editor during replay

## Implementation Priority

### Phase 1 (Trace Collection - Week 1)

**Goal**: Collect and store execution trace data

1. **Trace Collection Engine**
   - Add trace event hooks in ExecutionEngine
   - Collect events with minimal overhead
   - Store in memory buffer (circular buffer for large traces)
   - Expose trace via ExecutionResult

2. **Variable Change Tracking**
   - Hook into VariableService assignments
   - Record variable name, old value, new value
   - Track change count and history

3. **Loop Tracking**
   - Enhance loop stack in ExecutionContext
   - Record loop enter/exit events
   - Track iteration counts

4. **Control Flow Tracking**
   - Record GOTO source/destination
   - Track GOSUB call stack depth
   - Record RETURN events

**Files to Create:**
- `src/core/debugging/ExecutionTracer.ts` - Main trace collector
- `src/core/debugging/TraceEvent.ts` - Event types and interfaces
- `src/core/debugging/VariableTracker.ts` - Variable change tracking

**Files to Modify:**
- `src/core/execution/ExecutionEngine.ts` - Add trace hooks
- `src/core/services/VariableService.ts` - Track variable changes
- `src/core/state/ExecutionContext.ts` - Add trace buffer
- `src/core/interfaces.ts` - Add trace to ExecutionResult

### Phase 2 (UI Components - Week 2)

**Goal**: Visualize trace data in IDE

1. **Trace Panel Component**
   - Event list with filtering
   - Color-coded by event type
   - Click to jump to line in editor
   - Export trace as JSON/CSV

2. **Variable Watch Component**
   - Table of current variables
   - Change highlighting
   - History viewer
   - Filter/search

3. **Timeline Component**
   - Canvas-based timeline visualization
   - Event markers
   - Click to inspect event
   - Zoom in/out

4. **Loop Inspector Component**
   - List active loops
   - Show progress bars
   - Variable range display
   - Nesting visualization

5. **Trace Replay Controls**
   - Play/pause button
   - Step forward/backward
   - Scrubber slider
   - Speed control

**Files to Create:**
- `src/features/debugging/components/TracePanel.vue` - Main trace panel
- `src/features/debugging/components/VariableWatch.vue` - Variable inspector
- `src/features/debugging/components/ExecutionTimeline.vue` - Timeline view
- `src/features/debugging/components/LoopInspector.vue` - Loop tracker
- `src/features/debugging/components/TraceReplayer.vue` - Replay controls
- `src/features/debugging/composables/useExecutionTrace.ts` - Trace state

**Files to Modify:**
- `src/features/ide/IdePage.vue` - Add Debug/Trace tab
- `src/shared/i18n/en.ts` - Add localization

## Technical Architecture

### New Debugging Infrastructure

```
src/core/debugging/
├── ExecutionTracer.ts            # Main trace collector
├── TraceEvent.ts                 # Event type definitions
├── VariableTracker.ts            # Variable change tracking
├── LoopTracker.ts                # Loop state tracking
├── ControlFlowTracker.ts         # GOTO/GOSUB tracking
└── TraceBuffer.ts                # Circular buffer for traces

src/features/debugging/
├── components/
│   ├── TracePanel.vue            # Event list panel
│   ├── TraceEventCard.vue        # Individual event display
│   ├── VariableWatch.vue         # Variable inspector
│   ├── VariableHistory.vue       # Variable change history
│   ├── ExecutionTimeline.vue     # Timeline visualization
│   ├── LoopInspector.vue         # Loop state viewer
│   ├── JumpTracker.vue           # GOTO/GOSUB tracker
│   └── TraceReplayer.vue         # Replay controls
├── composables/
│   ├── useExecutionTrace.ts      # Trace state management
│   ├── useVariableWatch.ts       # Variable watch logic
│   ├── useTraceReplay.ts         # Replay functionality
│   └── useLoopInspector.ts       # Loop inspection
└── types/
    └── trace.ts                  # Trace-related types
```

### Integration with Existing Systems

**Execution Engine Integration:**
- Add trace hooks before/after statement execution
- Minimal overhead: only collect if tracing enabled
- No changes to execution logic required

**Web Worker Integration:**
- Collect trace in worker
- Send trace events with OUTPUT messages
- Or send full trace with RESULT message
- Optimize: batch events, throttle for long executions

**Editor Integration:**
- Highlight executing line during replay
- Show jump arrows for GOTO/GOSUB
- Link trace events to editor lines

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Existing execution engine
- Vue 3 Composition API
- Canvas API (for timeline)
- TypeScript standard library

**Optional Enhancements:**
- `vue-virtual-scroller`: For large trace lists
- `canvas-confetti`: Celebratory animation on program completion

## Success Metrics

### Developer Velocity
- **Debug Time**: Time to identify bugs vs print-statement debugging
- **Trace Usage**: % of executions with trace enabled
- **Variable Watch Usage**: % of sessions using variable watch

### User Satisfaction
- **Feature Usage**: % of sessions using trace panel
- **Debug Confidence**: Survey on confidence in bug fixes
- **NPS**: Satisfaction with debugging tools

### Learning Impact
- **Understanding**: Self-reported improvement in understanding program flow
- **Loop Comprehension**: Reduction in loop-related questions/issues
- **Onboarding**: Time to first successful debug session for new users

## Benefits

### Immediate Benefits
1. **Faster Debugging**: See exactly what code is doing
2. **Better Understanding**: Learn program behavior without print statements
3. **Cleaner Code**: No need to clutter code with debug prints
4. **Confidence**: Know what's happening at every step

### Long-Term Benefits
1. **Skill Development**: Learn F-BASIC patterns faster
2. **Community**: Share traces for debugging help
3. **Documentation**: Traces serve as execution examples
4. **Testing**: Visual verification of test behavior

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Performance overhead from tracing | Toggle tracing on/off; optimize event collection; throttle events |
| Large trace memory usage | Circular buffer; export to file; configurable max events |
| UI complexity overwhelming | Start with minimal UI; progressive disclosure; tabs for different views |
| Trace data incomplete | Ensure all statement types emit events; comprehensive testing |
| Worker communication overhead | Batch trace events; send on RESULT; use SharedArrayBuffer |

## Open Questions

1. **Trace Size Limit**: What's the max trace size to keep in memory?
2. **Performance Impact**: How much overhead is acceptable for tracing?
3. **Default Behavior**: Should tracing be on or off by default?
4. **Export Format**: JSON, CSV, or custom format for trace export?
5. **Persistent Traces**: Should traces be saved to localStorage?

## Next Steps

1. **Prototype**: Build basic trace collector for one statement type
2. **Test**: Collect trace from sample programs
3. **Design**: Mock up trace panel UI
4. **Performance**: Measure overhead with trace enabled
5. **User Testing**: Get feedback on trace visualization

## Implementation Details

### Specific Code Changes

**Example: ExecutionEngine Trace Hook**

```typescript
// src/core/execution/ExecutionEngine.ts
// Add to constructor:
this.tracer = options.enableTracing ? new ExecutionTracer() : null

// In execute(), before statement execution:
if (this.tracer) {
  this.tracer.recordLineExecuted(
    expandedStatement.lineNumber,
    this.context.iterationCount,
    expandedStatement
  )
}

// Execute statement
await this.statementRouter.executeStatement(expandedStatement)

// After execution (for variable changes detected in VariableService):
if (this.tracer && this.context.lastVariableChange) {
  this.tracer.recordVariableChanged(
    this.context.lastVariableChange.name,
    this.context.lastVariableChange.oldValue,
    this.context.lastVariableChange.newValue,
    expandedStatement.lineNumber,
    this.context.iterationCount
  )
}
```

**Example: VariableService Change Tracking**

```typescript
// src/core/services/VariableService.ts
setVariable(name: string, value: number | string): void {
  const oldValue = this.context.variables.get(name)?.value
  // Set variable...
  const newValue = value

  // Track change for tracing
  if (this.context.config.enableTracing && oldValue !== newValue) {
    this.context.lastVariableChange = {
      name,
      oldValue,
      newValue,
      line: this.context.currentLineNumber,
      iteration: this.context.iterationCount
    }
  }
}
```

**Example: Trace Panel Component**

```vue
<!-- src/features/debugging/components/TracePanel.vue -->
<template>
  <div class="trace-panel">
    <div class="trace-header">
      <h3>Execution Trace</h3>
      <div class="trace-stats">
        <span>{{ trace.events.length }} events</span>
        <span>{{ formatDuration(trace.endTime - trace.startTime) }}</span>
      </div>
    </div>

    <div class="trace-filters">
      <select v-model="filterEventType">
        <option value="all">All Events</option>
        <option value="line_executed">Line Execution</option>
        <option value="variable_changed">Variable Changes</option>
        <option value="loop_enter">Loops</option>
      </select>
      <input v-model="searchQuery" placeholder="Search events..." />
    </div>

    <div class="trace-events">
      <TraceEventCard
        v-for="event in filteredEvents"
        :key="event.id"
        :event="event"
        @click="goToLine(event.lineNumber)"
      />
    </div>

    <div class="trace-actions">
      <button @click="exportTrace">Export JSON</button>
      <button @click="exportCSV">Export CSV</button>
    </div>
  </div>
</template>
```

### Acceptance Criteria

**Phase 1 (Week 1):**
- [ ] Trace collection adds <5% overhead when enabled
- [ ] All statement types emit trace events
- [ ] Variable changes are captured correctly
- [ ] Loop enter/exit events are recorded
- [ ] GOTO/GOSUB jumps are tracked
- [ ] Trace is included in ExecutionResult
- [ ] Circular buffer prevents memory issues

**Phase 2 (Week 2):**
- [ ] Trace panel shows events with filtering
- [ ] Variable watch shows current state
- [ ] Timeline visualizes execution flow
- [ ] Loop inspector shows active loops
- [ ] Replay controls work for step-by-step
- [ ] Click event jumps to editor line
- [ ] Export functionality works

---

*"Debugging is like being a detective in a crime movie where you're also the murderer. The execution trace is the security camera footage that shows exactly what happened—no more guessing, just facts."*
