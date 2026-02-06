# Strategic Idea: Interactive Breakpoint Debugger

**Date**: 2026-02-06
**Turn**: 29
**Status**: Conceptual
**Focus Area**: Developer Experience & Testing
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add **interactive breakpoint debugging** to the Family Basic IDE that allows developers to pause execution at specific lines, step through code statement-by-statement, and inspect runtime variables—transforming the IDE from a "run-and-hope" tool into a proper debugging environment for F-BASIC development.

## Problem Statement

### Current Debugging Limitations

1. **No Breakpoint Support**: Cannot pause execution at specific lines
   - Must add PRINT statements to inspect values
   - Cannot stop execution mid-program to inspect state
   - No way to investigate bugs in long-running programs
   - Must modify code to debug (altering behavior)

2. **No Step-by-Step Execution**: Cannot trace program flow
   - Cannot execute one statement at a time
   - No way to follow GOTO/GOSUB jumps interactively
   - Cannot step INTO or OVER subroutine calls
   - Cannot observe loop iterations one-by-one

3. **Limited Variable Inspection**: No runtime visibility
   - Cannot see variable values while paused
   - No watch window to track specific variables
   - Cannot inspect array contents
   - No call stack visibility for GOSUB nesting

4. **No Expression Evaluation**: Cannot test hypotheses
   - Cannot evaluate expressions while paused
   - No "immediate window" to try code
   - Cannot modify variables during execution
   - Cannot test fixes without restarting

5. **Difficult Bug Investigation**: Debugging is tedious
   - Must add/remove debug statements repeatedly
   - Cannot set conditional breakpoints (e.g., "stop when X > 100")
   - Cannot log execution trace automatically
   - No way to replay execution with different breakpoints

## Proposed Solution

### 1. Breakpoint Management System

```typescript
// Breakpoint state management
interface Breakpoint {
  lineNumber: number           // Line number to break at
  condition?: string          // Optional condition (expression)
  enabled: boolean            // Whether breakpoint is active
  hitCount: number            // How many times breakpoint was hit
  logMessage?: string         // Optional log instead of breaking
}

interface BreakpointManager {
  // Breakpoint CRUD
  setBreakpoint(lineNumber: number, condition?: string): void
  clearBreakpoint(lineNumber: number): void
  toggleBreakpoint(lineNumber: number): void
  enableBreakpoint(lineNumber: number, enabled: boolean): void
  getBreakpoints(): Breakpoint[]
  getBreakpoint(lineNumber: number): Breakpoint | undefined

  // Breakpoint checking
  shouldBreak(lineNumber: number, context: ExecutionContext): boolean

  // Logpoints (breakpoints that log instead of pause)
  setLogpoint(lineNumber: number, message: string): void
}
```

**UI Integration:**
- Click gutter in Monaco editor to set/clear breakpoints
- Visual indicator (red dot) for breakpoint lines
- Right-click context menu for conditional breakpoints
- Breakpoint panel to manage all breakpoints

### 2. Step Execution Controls

```typescript
// Debug execution states
enum DebugState {
  RUNNING,                    // Normal execution
  PAUSED,                     // Paused at breakpoint
  STEPPING,                   // Single-step execution
  STEPPING_OVER,              // Step over (don't enter GOSUB)
  STEPPING_OUT                // Step out of current GOSUB
}

interface DebugController {
  // Execution control
  continue(): void            // Continue running
  pause(): void               // Pause immediately
  stepInto(): void            // Execute next statement (enter GOSUB)
  stepOver(): void            // Execute next statement (skip GOSUB)
  stepOut(): void             // Exit current GOSUB level

  // State management
  getDebugState(): DebugState
  getCurrentLine(): number
  getCallStack(): number[]    // Stack of line numbers (GOSUB returns)
}
```

**Debug Toolbar:**
```
┌─────────────────────────────────────────────────┐
│  ▶ Continue  ⏸ Pause  ↓ Step Into  → Step Over │
│  ↑ Step Out  🔄 Restart                         │
└─────────────────────────────────────────────────┘
```

### 3. Variable Inspector Panel

```vue
<template>
  <div class="variable-inspector">
    <!-- Variables Section -->
    <div class="section">
      <h3>Variables</h3>
      <div class="variable-list">
        <div v-for="(value, name) in variables" :key="name" class="variable-item">
          <span class="var-name">{{ name }}</span>
          <span class="var-value">{{ formatValue(value) }}</span>
          <span v-if="isChanged(name)" class="var-changed">★</span>
        </div>
      </div>
    </div>

    <!-- Arrays Section -->
    <div class="section">
      <h3>Arrays</h3>
      <div v-for="array in arrays" :key="array.name" class="array-item">
        <span class="array-name">{{ array.name }}({{ array.dimensions }})</span>
        <div class="array-values">
          <span v-for="(val, idx) in array.values" :key="idx" class="array-value">
            [{{ idx }}]={{ val }}
          </span>
        </div>
      </div>
    </div>

    <!-- Watch Expressions -->
    <div class="section">
      <h3>Watch</h3>
      <input v-model="newWatch" @keyup.enter="addWatch" placeholder="Add watch..." />
      <div v-for="(watch, idx) in watches" :key="idx" class="watch-item">
        <span class="watch-expression">{{ watch.expression }}</span>
        <span class="watch-value">{{ watch.value }}</span>
        <button @click="removeWatch(idx)">×</button>
      </div>
    </div>

    <!-- Call Stack -->
    <div class="section">
      <h3>Call Stack</h3>
      <div v-for="(frame, idx) in callStack" :key="idx" class="stack-frame">
        Line {{ frame }} {{ frame === currentLine ? '(current)' : '' }}
      </div>
    </div>
  </div>
</template>
```

### 4. Execution Context Integration

Extend `ExecutionContext` with debug state:

```typescript
// src/core/state/ExecutionContext.ts
export interface ExecutionContext {
  // ... existing properties ...

  // Debug state
  debugState: DebugState
  breakpoints: Map<number, Breakpoint>
  watchExpressions: string[]
  stepDepth: number              // For step-over/step-out tracking

  // Debug hooks
  onBreakpointHit?: (lineNumber: number) => void
  onVariableChange?: (name: string, value: RuntimeValue) => void
  onStatementExecute?: (lineNumber: number) => void

  // Debug actions
  pauseExecution(): void
  resumeExecution(): void
  stepExecution(): void
}

// src/core/execution/ExecutionEngine.ts
async execute(): Promise<ExecutionResult> {
  while (this.context.shouldContinue()) {
    const expandedStatement = this.context.getCurrentStatement()
    if (!expandedStatement) break

    const lineNumber = expandedStatement.lineNumber

    // Check for breakpoint BEFORE executing statement
    if (this.checkBreakpoint(lineNumber)) {
      this.context.pauseExecution()
      await this.waitForDebugContinue()
    }

    // Execute statement
    await this.statementRouter.executeStatement(expandedStatement)

    // Check if single-stepping
    if (this.context.debugState === DebugState.STEPPING) {
      this.context.pauseExecution()
      await this.waitForDebugContinue()
    }
  }
}
```

### 5. Monaco Editor Integration

```typescript
// Breakpoint gutter markers
monaco.editor.onDidChangeMarkers((e) => {
  // Sync breakpoints with breakpoint manager
})

// Click handler for gutter
editor.onMouseDown((e) => {
  if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
    toggleBreakpointAtLine(e.target.position.lineNumber)
  }
})

// Decorations for current execution line
const currentLineDecoration = monaco.editor.createDecorationsCollection([
  {
    range: new monaco.Range(currentLine, 1, currentLine, 1),
    options: {
      isWholeLine: true,
      className: 'current-execution-line',
      glyphMarginClassName: 'current-execution-glyph'
    }
  }
])

// Breakpoint decorations
const breakpointDecorations = monaco.editor.createDecorationsCollection(
  breakpoints.map(bp => ({
    range: new monaco.Range(bp.lineNumber, 1, bp.lineNumber, 1),
    options: {
      isWholeLine: false,
      glyphMarginClassName: bp.enabled ? 'breakpoint-enabled' : 'breakpoint-disabled',
      glyphMarginHoverMessage: { value: `Breakpoint${bp.condition ? `: ${bp.condition}` : ''}` }
    }
  }))
)
```

**CSS Styles:**
```css
/* Current execution line highlight */
.current-execution-line {
  background-color: rgba(255, 255, 0, 0.2);
}

/* Breakpoint indicators */
.breakpoint-enabled::before {
  content: '●';
  color: #ff0000;
  font-size: 16px;
}

.breakpoint-disabled::before {
  content: '○';
  color: #888888;
  font-size: 16px;
}

.current-execution-glyph::before {
  content: '▶';
  color: #00ff00;
  font-size: 16px;
}
```

## Implementation Priority

### Phase 1 (Foundation - Week 1)

**Goal**: Basic breakpoint and pause functionality

1. **Breakpoint Infrastructure**
   - Create `BreakpointManager` class
   - Extend `ExecutionContext` with debug state
   - Add breakpoint storage and checking logic
   - Implement breakpoint toggle in Monaco gutter

2. **Execution Control**
   - Modify `ExecutionEngine` to check breakpoints
   - Add pause/resume functionality
   - Implement worker message protocol for debug events
   - Handle breakpoint hits in main thread

3. **UI Components**
   - Add debug toolbar to IDE
   - Show current execution line highlight
   - Display breakpoint markers in editor
   - Create basic variable inspector

**Files to Create:**
- `src/core/debug/BreakpointManager.ts` - Breakpoint management
- `src/core/debug/DebugController.ts` - Debug state control
- `src/features/debug/components/DebugToolbar.vue` - Debug controls
- `src/features/debug/components/VariableInspector.vue` - Variable display
- `src/features/debug/composables/useBreakpoints.ts` - Breakpoint UI logic
- `src/features/debug/composables/useDebugState.ts` - Debug state management

**Files to Modify:**
- `src/core/state/ExecutionContext.ts` - Add debug state properties
- `src/core/execution/ExecutionEngine.ts` - Check breakpoints, handle pause
- `src/features/ide/integrations/monaco-integration.ts` - Gutter markers
- `src/features/ide/components/IdePage.vue` - Add debug UI
- `src/features/ide/composables/useBasicIdeEnhanced.ts` - Debug messages

### Phase 2 (Enhancement - Week 2)

**Goal**: Step execution and advanced features

1. **Step Execution**
   - Implement step-into (execute next statement)
   - Implement step-over (skip GOSUB calls)
   - Implement step-out (exit current GOSUB)
   - Track call stack for step operations

2. **Advanced Inspection**
   - Add watch expressions
   - Show array contents
   - Display call stack
   - Track variable changes

3. **Conditional Breakpoints**
   - Add condition editor
   - Evaluate conditions at runtime
   - Support logpoints (log instead of pause)
   - Show breakpoint hit count

4. **Polish**
   - Keyboard shortcuts (F5=run, F9=breakpoint, F10=step, F11=step into)
   - Breakpoint panel management
   - Export/import breakpoints
   - Debug session persistence

## Technical Architecture

### Debug Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          Main Thread                             │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ Monaco Editor │    │ Debug Toolbar │    │  Variable     │      │
│  │              │    │              │    │  Inspector    │      │
│  │ - Breakpoints │    │ - Continue   │    │              │      │
│  │ - Line Highlight │ │ - Pause      │    │ - Variables  │      │
│  │ - Gutter UI  │    │ - Step       │    │ - Arrays     │      │
│  └──────────────┘    └──────────────┘    │ - Watches    │      │
│         │                    │            └──────────────┘      │
│         └────────────────────┼───────────────────┐             │
│                              │                   │             │
└──────────────────────────────┼───────────────────┼─────────────┘
                               │                   │
                               ▼                   ▼
                    ┌────────────────────────────────────┐
                    │      Debug Controller              │
                    │                                    │
                    │  - Manages debug state             │
                    │  - Handles UI events               │
                    │  - Coordinates worker messages     │
                    │  - Updates variable inspector      │
                    └────────────────────────────────────┘
                               │
                               │ Messages
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Web Worker                                │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Execution Engine                          │    │
│  │                                                          │    │
│  │  1. Get next statement                                  │    │
│  │  2. Check breakpoint → hit? pause & notify             │    │
│  │  3. Execute statement                                   │    │
│  │  4. Check stepping → pause & notify                    │    │
│  │  5. Update variables                                    │    │
│  │  6. Send variable updates to main thread               │    │
│  │                                                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                   │                              │
│                                   ▼                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Breakpoint Manager                              │    │
│  │                                                          │    │
│  │  - Stores breakpoint definitions                         │    │
│  │  - Evaluates breakpoint conditions                       │    │
│  │  - Tracks hit counts                                     │    │
│  │  - Logs logpoint messages                                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Worker Message Protocol

```typescript
// Main thread → Worker messages
interface DebugMessageToWorker {
  type: 'SET_BREAKPOINT' | 'CLEAR_BREAKPOINT' | 'TOGGLE_BREAKPOINT'
  | 'CONTINUE' | 'PAUSE' | 'STEP_INTO' | 'STEP_OVER' | 'STEP_OUT'
  | 'ADD_WATCH' | 'REMOVE_WATCH' | 'EVALUATE_EXPRESSION'
  lineNumber?: number
  condition?: string
  expression?: string
}

// Worker → Main thread messages
interface DebugMessageFromWorker {
  type: 'BREAKPOINT_HIT' | 'PAUSED' | 'STEPPED' | 'VARIABLE_UPDATE'
  | 'CALL_STACK_UPDATE' | 'WATCH_UPDATE' | 'ERROR'
  lineNumber: number
  variables?: Record<string, RuntimeValue>
  arrays?: ArrayInfo[]
  callStack?: number[]
  watches?: Array<{expression: string, value: RuntimeValue}>
  error?: BasicError
}
```

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Existing Monaco editor (gutter markers, decorations)
- Current web worker architecture
- Existing execution infrastructure
- Vue 3 composition API

**Optional Enhancements:**
- `monaco-editor` already installed - leveraging existing APIs

## Success Metrics

### Developer Velocity
- **Debugging Speed**: Time to identify and fix bugs
- **Code Modifications**: Reduction in debug PRINT statements
- **Session Productivity**: Number of bugs found per session

### User Engagement
- **Breakpoint Usage**: # of breakpoints set per session
- **Step Usage**: # of step operations per session
- **Inspector Usage**: # of variable inspections
- **Debug Sessions**: # of debugging sessions per day

### Quality
- **Bug Resolution**: Time to resolve bugs
- **Code Understanding**: User confidence in program behavior
- **Learning Curve**: Time to learn debugging features

## Benefits

### Immediate Benefits
1. **Faster Debugging**: No more PRINT statement debugging
2. **Better Understanding**: See exactly how code executes
3. **Non-Invasive**: Debug without modifying code
4. **Professional Tools**: Industry-standard debugging experience

### Long-Term Benefits
1. **Better Code Quality**: Easier debugging leads to better code
2. **Learning Aid**: Step-through teaches program flow
3. **Complex Programs**: Can debug larger, more complex programs
4. **Educational Value**: Teaches debugging concepts

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Performance overhead from breakpoint checking | Minimal: simple map lookup per statement |
| Worker communication complexity | Use existing message protocol; extend carefully |
| UI state synchronization | Single source of truth in DebugController |
| Breaking existing tests | Add feature flag; tests opt-in to debug mode |
| Infinite loop in breakpoint conditions | Timeout condition evaluation; limit complexity |

## Open Questions

1. **Persistence**: Should breakpoints persist across page reloads? (localStorage)
2. **Export/Import**: Allow sharing breakpoints with others?
3. **Multiple Files**: How to handle programs with multiple files?
4. **Conditional Complexity**: What expression complexity to allow in conditions?
5. **Performance**: Limit on number of breakpoints?

## Next Steps

1. **Prototype**: Create basic breakpoint toggle in Monaco gutter
2. **Integration**: Add pause/resume to ExecutionEngine
3. **UI**: Build debug toolbar with step buttons
4. **Inspector**: Create variable display panel
5. **Testing**: Add debug mode tests to existing test suite
6. **Polish**: Add keyboard shortcuts and visual feedback

## Implementation Details

### Acceptance Criteria

**Phase 1 (Week 1):**
- [ ] BreakpointManager class created and tested
- [ ] Breakpoints can be set/cleared via gutter click
- [ ] Execution pauses at breakpoint
- [ ] Debug toolbar shows Continue/Pause buttons
- [ ] Variable inspector displays current variables
- [ ] Current line highlighted when paused
- [ ] Worker communication handles pause/resume

**Phase 2 (Week 2):**
- [ ] Step Into/Over/Out buttons work correctly
- [ ] Call stack displays GOSUB nesting
- [ ] Watch expressions can be added/removed
- [ ] Conditional breakpoints work
- [ ] Logpoints log without pausing
- [ ] Keyboard shortcuts configured
- [ ] Breakpoint panel manages all breakpoints

### Specific Code Changes

**BreakpointManager Implementation:**

```typescript
// src/core/debug/BreakpointManager.ts
export class BreakpointManager {
  private breakpoints: Map<number, Breakpoint> = new Map()

  setBreakpoint(lineNumber: number, condition?: string): void {
    this.breakpoints.set(lineNumber, {
      lineNumber,
      condition,
      enabled: true,
      hitCount: 0
    })
  }

  clearBreakpoint(lineNumber: number): void {
    this.breakpoints.delete(lineNumber)
  }

  toggleBreakpoint(lineNumber: number): void {
    if (this.breakpoints.has(lineNumber)) {
      this.clearBreakpoint(lineNumber)
    } else {
      this.setBreakpoint(lineNumber)
    }
  }

  shouldBreak(lineNumber: number, context: ExecutionContext): boolean {
    const bp = this.breakpoints.get(lineNumber)
    if (!bp || !bp.enabled) return false

    bp.hitCount++

    // Check condition if present
    if (bp.condition) {
      try {
        const result = new ExpressionEvaluator(context).evaluate(bp.condition)
        return result.asBoolean()
      } catch {
        return false // If condition fails, don't break
      }
    }

    return true
  }

  getBreakpoints(): Breakpoint[] {
    return Array.from(this.breakpoints.values())
  }
}
```

**ExecutionEngine Integration:**

```typescript
// src/core/execution/ExecutionEngine.ts
async execute(): Promise<ExecutionResult> {
  // ... existing setup ...

  while (this.context.shouldContinue()) {
    const expandedStatement = this.context.getCurrentStatement()
    if (!expandedStatement) break

    const lineNumber = expandedStatement.lineNumber
    this.context.setCurrentLineNumber(lineNumber)

    // Check breakpoint
    if (this.breakpointManager.shouldBreak(lineNumber, this.context)) {
      await this.handleBreakpointHit(lineNumber)
    }

    // Check if paused (from debug toolbar)
    if (this.context.debugState === DebugState.PAUSED) {
      await this.waitForResume()
    }

    // Execute statement
    await this.statementRouter.executeStatement(expandedStatement)

    // Check stepping
    if (this.context.debugState === DebugState.STEPPING) {
      await this.handleStep()
    }

    // ... rest of loop ...
  }
}

private async handleBreakpointHit(lineNumber: number): Promise<void> {
  this.context.debugState = DebugState.PAUSED
  this.context.onBreakpointHit?.(lineNumber)

  // Send message to main thread
  postMessage({
    type: 'BREAKPOINT_HIT',
    lineNumber,
    variables: this.context.variables,
    arrays: this.context.arrays
  })

  // Wait for continue
  await this.waitForResume()
}

private async waitForResume(): Promise<void> {
  return new Promise<void>(resolve => {
    const checkInterval = setInterval(() => {
      if (this.context.debugState !== DebugState.PAUSED) {
        clearInterval(checkInterval)
        resolve()
      }
    }, 10)
  })
}
```

**Debug Toolbar Component:**

```vue
<!-- src/features/debug/components/DebugToolbar.vue -->
<template>
  <div class="debug-toolbar">
    <button
      @click="continueExecution"
      :disabled="!isPaused"
      title="Continue (F5)"
    >
      ▶ Continue
    </button>

    <button
      @click="pauseExecution"
      :disabled="!isRunning"
      title="Pause"
    >
      ⏸ Pause
    </button>

    <button
      @click="stepOver"
      :disabled="!isPaused"
      title="Step Over (F10)"
    >
      → Step Over
    </button>

    <button
      @click="stepInto"
      :disabled="!isPaused"
      title="Step Into (F11)"
    >
      ↓ Step Into
    </button>

    <button
      @click="stepOut"
      :disabled="!isPaused"
      title="Step Out (Shift+F11)"
    >
      ↑ Step Out
    </button>

    <button
      @click="restart"
      title="Restart (Ctrl+Shift+F5)"
    >
      🔄 Restart
    </button>

    <div class="debug-status">
      {{ debugStatusText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDebugState } from '../composables/useDebugState'

const {
  debugState,
  continueExecution,
  pauseExecution,
  stepOver,
  stepInto,
  stepOut,
  restart
} = useDebugState()

const isPaused = computed(() => debugState.value === DebugState.PAUSED)
const isRunning = computed(() => debugState.value === DebugState.RUNNING)

const debugStatusText = computed(() => {
  switch (debugState.value) {
    case DebugState.RUNNING: return 'Running'
    case DebugState.PAUSED: return `Paused at line ${currentLine.value}`
    case DebugState.STEPPING: return 'Stepping'
    default: return ''
  }
})
</script>

<style scoped>
.debug-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: var(--color-toolbar-background);
  border-bottom: 1px solid var(--color-border);
}

.debug-toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.debug-status {
  margin-left: auto;
  font-family: monospace;
  color: var(--color-text-secondary);
}
</style>
```

---

*"The best debugging tool is the one that lets you understand what your code is actually doing, not what you think it should be doing. Let's bring professional debugging to F-BASIC development."*
