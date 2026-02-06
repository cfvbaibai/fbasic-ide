# Strategic Idea: Execution Recording & Replay System

**Date**: 2026-02-06
**Turn**: 35
**Status**: Conceptual
**Focus Area**: Developer Experience & Testing
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add **execution recording and replay** to the Family Basic IDE that captures the full execution trace of an F-BASIC program—inputs, outputs, state changes, and timing—enabling developers to replay, analyze, share, and debug program executions with perfect reproducibility.

## Problem Statement

### Current Debugging Limitations

1. **Non-Reproducible Bugs**: Issues are hard to recreate
   - Games with random inputs (RND) behave differently each run
   - Interactive programs depend on specific user input sequences
   - Timing-dependent bugs occur intermittently
   - Can't share exact execution context with others

2. **Lost Execution Context**: Once run, it's gone
   - Can't review what happened during execution
   - No way to see the sequence of statements executed
   - Difficult to understand complex program flow (GOTO chains)
   - Can't step back through completed execution

3. **Testing is Tedious**: Manual testing is repetitive
   - Must manually test the same scenarios repeatedly
   - Can't automate verification of program behavior
   - No way to capture "golden" execution for regression testing
   - Difficulty verifying bug fixes work correctly

4. **Learning and Teaching is Hard**: Can't show execution flow
   - Beginners struggle to understand program execution order
   - Can't demonstrate how a program works step-by-step
   - No way to create annotated execution examples
   - Can't share interesting program behaviors

5. **Performance Investigation is Guesswork**: Can't analyze runs
   - Don't know which statements execute most frequently
   - Can't see how GOTO/GOSUB chains evolve during execution
   - No visibility into program flow patterns
   - Can't identify hot paths without manual instrumentation

## Proposed Solution

### 1. Execution Trace Recording

Record all significant events during program execution:

```typescript
interface ExecutionEvent {
  sequenceNumber: number         // Order in execution
  timestamp: number              // ms from start
  eventType: EventType

  // Event-specific data
  lineNumber?: number            // Statement executed
  statementType?: string         // PRINT, IF, SPRITE, etc.
  variables?: VariableSnapshot   // Variable state
  input?: InputEvent             // User input captured
  output?: OutputEvent           // Screen/character output
  spriteChange?: SpriteEvent     // Sprite state change
  error?: ExecutionError         // Error that occurred
}

enum EventType {
  STATEMENT_EXECUTE,             // A statement was executed
  VARIABLE_ASSIGN,               // Variable value changed
  INPUT_RECEIVED,                // User input (INPUT/JOYSTICK)
  OUTPUT_GENERATED,              // Output (PRINT/LOCATE)
  SPRITE_CHANGE,                // Sprite moved/changed
  ERROR_OCCURRED,                // Runtime error
  PROGRAM_START,                // Program started
  PROGRAM_END,                  // Program ended
  GOTO_JUMP,                    // GOTO executed
  GOSUB_CALL,                   // GOSUB called
  GOSUB_RETURN                  // RETURN executed
}

interface ExecutionRecording {
  // Metadata
  id: string
  timestamp: number
  programSource: string         // Full source code
  programHash: string           // For validation

  // Recording configuration
  config: RecordingConfig

  // Execution events
  events: ExecutionEvent[]

  // Final state
  finalVariables: VariableSnapshot
  finalScreen: ScreenSnapshot
  finalSprites: SpriteSnapshot

  // Statistics
  duration: number              // Total execution time (ms)
  eventCount: number            // Total events recorded
  statementCount: number        // Statements executed
}

interface RecordingConfig {
  recordVariables: boolean      // Capture variable changes
  recordScreen: boolean         // Capture screen output
  recordSprites: boolean        // Capture sprite changes
  recordInputs: boolean         // Capture user input
  maxEvents: number             // Limit events (for memory)
  sampleInterval: number        // Sample every N statements
}
```

### 2. Replay Visualization

Play back the recorded execution with controls:

```vue
<template>
  <div class="replay-player">
    <!-- Playback Controls -->
    <div class="playback-controls">
      <button @click="goToStart">⏮</button>
      <button @click="stepBackward">⏪</button>
      <button @click="togglePlay">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
      <button @click="stepForward">⏩</button>
      <button @click="goToEnd">⏭</button>

      <div class="speed-control">
        <label>Speed:</label>
        <select v-model="playbackSpeed">
          <option value="0.1">0.1x</option>
          <option value="0.25">0.25x</option>
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="2">2x</option>
          <option value="5">5x</option>
        </select>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar">
      <input
        type="range"
        :min="0"
        :max="events.length - 1"
        v-model="currentEventIndex"
        @input="seekToEvent"
      />
      <span class="event-counter">
        Event {{ currentEventIndex }} / {{ events.length }}
      </span>
    </div>

    <!-- Event Timeline -->
    <div class="event-timeline">
      <div
        v-for="(event, idx) in events"
        :key="idx"
        class="timeline-event"
        :class="{
          'active': idx === currentEventIndex,
          'statement': event.eventType === EventType.STATEMENT_EXECUTE,
          'input': event.eventType === EventType.INPUT_RECEIVED,
          'output': event.eventType === EventType.OUTPUT_GENERATED,
          'error': event.eventType === EventType.ERROR_OCCURRED
        }"
        @click="goToEvent(idx)"
      >
        <span class="event-number">{{ idx }}</span>
        <span class="event-type">{{ formatEventType(event.eventType) }}</span>
        <span v-if="event.lineNumber" class="event-line">
          Line {{ event.lineNumber }}
        </span>
      </div>
    </div>

    <!-- Current Event Details -->
    <div class="event-details">
      <h3>Event #{{ currentEventIndex }}</h3>
      <div class="detail-row">
        <span class="label">Type:</span>
        <span class="value">{{ formatEventType(currentEvent.eventType) }}</span>
      </div>
      <div v-if="currentEvent.lineNumber" class="detail-row">
        <span class="label">Line:</span>
        <span class="value">{{ currentEvent.lineNumber }}</span>
      </div>
      <div v-if="currentEvent.timestamp" class="detail-row">
        <span class="label">Time:</span>
        <span class="value">{{ formatTime(currentEvent.timestamp) }}</span>
      </div>

      <!-- Variable Changes -->
      <div v-if="currentEvent.variables" class="variable-changes">
        <h4>Variables</h4>
        <div
          v-for="(value, name) in currentEvent.variables"
          :key="name"
          class="variable-change"
        >
          <span class="var-name">{{ name }}</span>
          <span class="var-value">{{ formatValue(value) }}</span>
        </div>
      </div>
    </div>

    <!-- Execution Flow Graph -->
    <div class="flow-graph">
      <h3>Execution Flow</h3>
      <canvas ref="flowCanvas"></canvas>
    </div>
  </div>
</template>
```

### 3. Recording Export/Import

Share recordings for collaboration:

```typescript
interface RecordingExport {
  format: 'fbasic-recording'
  version: '1.0'
  recording: ExecutionRecording
  checksum: string              // Verify integrity
}

// Export to file
function exportRecording(recording: ExecutionRecording, filename: string): void {
  const exportData: RecordingExport = {
    format: 'fbasic-recording',
    version: '1.0',
    recording,
    checksum: generateChecksum(recording)
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.fbrec`
  a.click()
}

// Import from file
async function importRecording(file: File): Promise<ExecutionRecording> {
  const text = await file.text()
  const data: RecordingExport = JSON.parse(text)

  // Validate format
  if (data.format !== 'fbasic-recording') {
    throw new Error('Invalid recording format')
  }

  // Verify integrity
  if (data.checksum !== generateChecksum(data.recording)) {
    throw new Error('Recording checksum mismatch')
  }

  return data.recording
}
```

### 4. Execution Statistics

Analyze recording patterns:

```typescript
interface ExecutionStatistics {
  // Statement frequency
  statementFrequency: Map<number, number>  // line -> count
  mostExecutedLines: { lineNumber: number; count: number }[]

  // Control flow analysis
  gotoChains: GotoChain[]                   // GOTO jump patterns
  gosubNesting: number                      // Max GOSUB depth
  loopIterations: Map<number, number>       // FOR loops

  // Variable usage
  variableAccessCount: Map<string, number>  // var -> access count
  mostAccessedVariables: { name: string; count: number }[]

  // Timing analysis
  executionTimePerLine: Map<number, number> // line -> total ms

  // Screen output
  characterOutputCount: number
  screenUpdates: number
  spriteOperations: number
}

interface GotoChain {
  sequence: number[]           // Line numbers in jump chain
  frequency: number            // How often this chain occurs
}
```

**Statistics Display:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Execution Statistics                                            │
├─────────────────────────────────────────────────────────────────┤
│ Most Executed Lines                                             │
│  Line 70: 1,500 times  (30%)  [FOR loop]                        │
│  Line 60: 1,500 times  (30%)  [PRINT]                           │
│  Line 50: 1,501 times  (30%)  [NEXT]                            │
│                                                                  │
│ Variable Access                                                  │
│  I: 3,002 accesses                                               │
│  X: 1,500 accesses                                               │
│  Y: 1,500 accesses                                               │
│                                                                  │
│ Control Flow                                                     │
│  Max GOSUB depth: 3                                              │
│  Active loops: 1 (line 50-70)                                    │
│  GOTO jumps: 0                                                   │
│                                                                  │
│ Output                                                           │
│  Characters printed: 4,500                                       │
│  Screen updates: 1,500                                           │
│  Sprite operations: 150                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Priority

### Phase 1 (Basic Recording - Week 1)

**Goal**: Record and replay statement execution

1. **Recording Infrastructure**
   - Create ExecutionRecorder class
   - Record statement execution events
   - Track line numbers and sequence
   - Store in memory-efficient format

2. **Basic Replay**
   - Create replay player UI
   - Step through events forward/backward
   - Show current line being executed
   - Display event details

3. **Integration**
   - Add record toggle to IDE
   - Store recording after program ends
   - Load recording for replay
   - Export/import as JSON

**Files to Create:**
- `src/core/recording/ExecutionRecorder.ts` - Core recording logic
- `src/core/recording/types.ts` - Recording type definitions
- `src/features/recording/components/ReplayPlayer.vue` - Replay UI
- `src/features/recording/composables/useRecording.ts` - Recording composable
- `src/features/recording/utils/recordingExporter.ts` - Export/import

**Files to Modify:**
- `src/core/state/ExecutionContext.ts` - Add recording hooks
- `src/core/execution/ExecutionEngine.ts` - Record statement execution
- `src/features/ide/components/IdeControls.vue` - Add record button

### Phase 2 (Enhanced Features - Week 2)

**Goal**: Add variable tracking, statistics, and visualization

1. **Variable Recording**
   - Record variable assignments
   - Show variable state at each event
   - Highlight changed variables
   - Variable timeline view

2. **Statistics Generation**
   - Calculate statement frequency
   - Analyze control flow patterns
   - Measure variable access
   - Generate execution summary

3. **Visualization**
   - Execution flow graph
   - GOTO chain visualization
   - Loop iteration timeline
   - Variable change heatmap

4. **Advanced Replay**
   - Playback speed control
   - Jump to specific event type
   - Filter events by type
   - Search events by line

**Files to Create:**
- `src/features/recording/components/VariableTimeline.vue` - Variable history
- `src/features/recording/components/StatisticsPanel.vue` - Execution stats
- `src/features/recording/components/FlowGraph.vue` - Flow visualization
- `src/core/recording/statisticsGenerator.ts` - Stats calculation
- `src/core/recording/flowAnalyzer.ts` - Flow analysis

## Technical Architecture

### Recording Infrastructure

```typescript
// src/core/recording/ExecutionRecorder.ts

export class ExecutionRecorder {
  private config: RecordingConfig
  private events: ExecutionEvent[] = []
  private eventCounter: number = 0
  private startTime: number = 0
  private recording: boolean = false

  constructor(config: RecordingConfig) {
    this.config = config
  }

  /**
   * Start recording a new execution
   */
  start(): void {
    this.events = []
    this.eventCounter = 0
    this.startTime = performance.now()
    this.recording = true

    // Record program start event
    this.recordEvent({
      sequenceNumber: this.eventCounter++,
      timestamp: 0,
      eventType: EventType.PROGRAM_START
    })
  }

  /**
   * Record a statement execution (called by ExecutionEngine)
   */
  recordStatement(lineNumber: number, statementType: string): void {
    if (!this.recording) return

    this.recordEvent({
      sequenceNumber: this.eventCounter++,
      timestamp: performance.now() - this.startTime,
      eventType: EventType.STATEMENT_EXECUTE,
      lineNumber,
      statementType
    })
  }

  /**
   * Record a variable assignment
   */
  recordVariableAssignment(name: string, value: RuntimeValue): void {
    if (!this.recording || !this.config.recordVariables) return

    this.recordEvent({
      sequenceNumber: this.eventCounter++,
      timestamp: performance.now() - this.startTime,
      eventType: EventType.VARIABLE_ASSIGN,
      variables: { [name]: value }
    })
  }

  /**
   * Record a GOTO jump
   */
  recordGoto(fromLine: number, toLine: number): void {
    if (!this.recording) return

    this.recordEvent({
      sequenceNumber: this.eventCounter++,
      timestamp: performance.now() - this.startTime,
      eventType: EventType.GOTO_JUMP,
      lineNumber: toLine
    })
  }

  /**
   * Record program end
   */
  end(finalVariables: VariableSnapshot): ExecutionRecording {
    if (!this.recording) return null

    this.recordEvent({
      sequenceNumber: this.eventCounter++,
      timestamp: performance.now() - this.startTime,
      eventType: EventType.PROGRAM_END
    })

    this.recording = false

    return {
      id: generateId(),
      timestamp: Date.now(),
      programSource: '',  // Set by caller
      programHash: '',
      config: this.config,
      events: [...this.events],
      finalVariables,
      finalScreen: null,
      finalSprites: null,
      duration: performance.now() - this.startTime,
      eventCount: this.events.length,
      statementCount: this.events.filter(
        e => e.eventType === EventType.STATEMENT_EXECUTE
      ).length
    }
  }

  private recordEvent(event: ExecutionEvent): void {
    this.events.push(event)

    // Check event limit
    if (this.config.maxEvents > 0 && this.events.length >= this.config.maxEvents) {
      // Stop recording or apply sampling
      console.warn('Recording reached max events limit')
    }
  }
}
```

### ExecutionEngine Integration

```typescript
// src/core/execution/ExecutionEngine.ts

export class ExecutionEngine {
  private recorder?: ExecutionRecorder

  constructor(...) {
    // ...
    if (config.enableRecording) {
      this.recorder = new ExecutionRecorder(config.recording)
    }
  }

  async execute(): Promise<ExecutionResult> {
    // Start recording
    this.recorder?.start()

    while (this.context.shouldContinue()) {
      const statement = this.context.getCurrentStatement()
      if (!statement) break

      const lineNumber = statement.lineNumber
      const statementType = statement.statementType

      // Record statement execution
      this.recorder?.recordStatement(lineNumber, statementType)

      // Execute statement
      await this.statementRouter.executeStatement(statement)
    }

    // End recording
    const recording = this.recorder?.end(this.context.getAllVariables())
    if (recording) {
      this.context.deviceAdapter?.recordingComplete(recording)
    }

    return { /* ... */ }
  }
}
```

### Recording Storage

```typescript
// src/features/recording/composables/useRecording.ts

import { ref } from 'vue'
import type { ExecutionRecording } from '@/core/recording/types'

const recordings = ref<Map<string, ExecutionRecording>>(new Map())

export function useRecording() {
  const saveRecording = (recording: ExecutionRecording): void => {
    recordings.value.set(recording.id, recording)

    // Persist to localStorage
    try {
      const key = `fbasic-recording-${recording.id}`
      localStorage.setItem(key, JSON.stringify(recording))
    } catch (e) {
      console.warn('Failed to save recording to localStorage:', e)
    }
  }

  const loadRecording = (id: string): ExecutionRecording | undefined => {
    return recordings.value.get(id)
  }

  const getAllRecordings = (): ExecutionRecording[] => {
    return Array.from(recordings.value.values())
  }

  const deleteRecording = (id: string): void => {
    recordings.value.delete(id)
    localStorage.removeItem(`fbasic-recording-${id}`)
  }

  return {
    recordings,
    saveRecording,
    loadRecording,
    getAllRecordings,
    deleteRecording
  }
}
```

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Existing web worker architecture
- Vue 3 composition API
- TypeScript standard library
- Canvas API (for flow visualization)
- File System Access API (for export/import)

**Optional Enhancements:**
- `fflate`: Compression for large recordings
- `canvas-confetti`: Celebration on successful replay
- `vuedraggable`: Drag-to-scrub timeline

## Success Metrics

### Developer Velocity
- **Bug Reproduction Speed**: Time to reproduce bugs from recordings
- **Analysis Speed**: Time to understand program behavior
- **Testing Efficiency**: Reduction in manual testing time
- **Sharing**: Number of recordings shared for collaboration

### User Engagement
- **Recording Usage**: # of recordings per session
- **Replay Usage**: # of replays viewed
- **Export/Import**: # of recordings exported/imported
- **Analysis**: # of statistics viewed

### Technical Quality
- **Overhead**: <10% performance impact when recording
- **Memory**: Recording size <1MB for typical programs
- **Accuracy**: 100% faithful replay fidelity
- **Reliability**: No crashes or corrupted recordings

## Benefits

### Immediate Benefits
1. **Perfect Reproducibility**: Replay exact execution
2. **Bug Investigation**: See exactly what happened
3. **Learning Aid**: Understand program flow step-by-step
4. **Sharing**: Collaborate with reproducible examples

### Long-Term Benefits
1. **Test Automation**: Recordings as regression tests
2. **Documentation**: Executable program examples
3. **Performance Analysis**: Identify hot paths
4. **Debugging**: Time-travel debugging foundation

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Performance overhead from recording | Toggle on/off; minimal overhead when disabled |
| Large recording files | Compression; sampling; event limits |
| Privacy concerns with user input | Clear indication of recording; user consent |
| Non-deterministic sources (RND) | Record random seed; document limitations |
| Screen recording memory usage | Configurable detail levels |

## Open Questions

1. **Input Recording**: How to handle real-time joystick input during replay?
2. **Random Numbers**: How to handle RND function calls?
3. **Timing**: Should replay preserve real-time timing or be instantaneous?
4. **Storage**: Use IndexedDB for larger recordings?
5. **Comparison**: Support diffing two recordings?

## Next Steps

1. **Prototype**: Record statement execution for simple program
2. **UI**: Build basic replay player with stepping
3. **Integration**: Add record button to IDE
4. **Test**: Record and replay sample programs
5. **Expand**: Add variable tracking and statistics
6. **Polish**: Export/import and visualization

## Implementation Details

### Acceptance Criteria

**Phase 1 (Week 1):**
- [ ] ExecutionRecorder records statement events
- [ ] Recording includes line numbers and timestamps
- [ ] Replay player steps through events
- [ ] Can export recording to .fbrec file
- [ ] Can import and replay recording
- [ ] Record button in IDE controls
- [ ] Overhead <10% when enabled

**Phase 2 (Week 2):**
- [ ] Variable assignments recorded
- [ ] Variable timeline shows history
- [ ] Statistics panel shows execution patterns
- [ ] Flow graph visualizes execution
- [ ] Playback speed control works
- [ ] Search events by line number
- [ ] Filter events by type

### Specific Code Changes

**ExecutionContext Enhancement:**

```typescript
// src/core/state/ExecutionContext.ts

export interface InterpreterConfig {
  // ... existing config ...

  // Recording configuration
  enableRecording?: boolean
  recording?: {
    recordVariables?: boolean    // Default: true
    recordScreen?: boolean       // Default: false
    recordSprites?: boolean      // Default: false
    maxEvents?: number           // Default: 10000
  }
}

export class ExecutionContext {
  // ... existing properties ...

  // Recording state
  public recorder?: ExecutionRecorder

  constructor(config: InterpreterConfig) {
    this.config = config

    // Initialize recorder if enabled
    if (config.enableRecording) {
      this.recorder = new ExecutionRecorder({
        recordVariables: config.recording?.recordVariables ?? true,
        recordScreen: config.recording?.recordScreen ?? false,
        recordSprites: config.recording?.recordSprites ?? false,
        recordInputs: true,
        maxEvents: config.recording?.maxEvents ?? 10000,
        sampleInterval: 1
      })
    }
  }
}
```

**Device Adapter Integration:**

```typescript
// src/core/devices/WebWorkerDeviceAdapter.ts

export class WebWorkerDeviceAdapter implements BasicDeviceAdapter {
  recordingComplete(recording: ExecutionRecording): void {
    this.postMessage({
      type: 'RECORDING_COMPLETE',
      recording
    })
  }
}
```

---

*"The ability to record and replay execution transforms debugging from investigation into science—exact, reproducible, shareable. Let's make F-BASIC execution tangible, analyzable, and collaborative."*
