# Strategic Idea: Execution History Navigation

**Date**: 2026-02-06
**Turn**: 40
**Status**: Conceptual
**Focus Area**: Developer Experience & User Experience
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add **execution history navigation** to the Family Basic IDE that allows developers to quickly navigate between recent program executions—enabling rapid iteration cycles and making it easy to compare results between different code versions.

## Problem Statement

### Current Development Friction Points

1. **Lost Code After Edits**: Accidentally losing working code during iteration
   - Make a change → Run → Doesn't work → Can't get back to working version
   - No way to see what code produced a previous output
   - Must manually copy-paste code before experiments
   - Accidental editor changes are permanent

2. **No Execution Context**: Hard to correlate output with code
   - See output in panel but don't remember which code produced it
   - Make multiple runs → Output panel shows only latest
   - Can't compare output between code variations
   - No way to replay a previous execution

3. **Slow Experimentation**: Manual backup workflow is tedious
   - Must copy code to external editor before experiments
   - Can't quickly try variations and compare
   - No "undo" for code that was already replaced
   - Fear of breaking working code slows iteration

4. **Learning Difficulty**: Can't review previous attempts
   - Learners can't see their progression
   - Can't understand what changed between attempts
   - No way to revisit and fix previous code versions
   - Misteaching moment: "What did I do that worked?"

5. **No Session History**: Lost work on page refresh
   - Browser refresh loses all execution history
   - Can't recover code from earlier in the session
   - No persistent record of development session
   - Starting over each time is demotivating

## Proposed Solution

### 1. Execution History Ring Buffer

Store recent code executions in memory:

```typescript
interface ExecutionHistoryEntry {
  id: string                    // Unique execution ID
  code: string                  // Complete F-BASIC code at time of execution
  timestamp: number             // Execution timestamp
  output: string[]              // Output produced
  errors: ErrorEntry[]          // Errors (if any)
  success: boolean              // Did execution complete?
  duration: number              // Execution duration (ms)
  iterationCount: number        // Iterations used
}

interface ExecutionHistory {
  entries: ExecutionHistoryEntry[]
  currentIndex: number          // Current entry being viewed
  maxSize: number               // Max entries to keep (default: 20)
}
```

### 2. History Navigation Controls

Add navigation buttons to IDE:

```typescript
interface HistoryNavigation {
  canGoBack: boolean            // Has previous entries?
  canGoForward: boolean         // Has forward entries?
  currentIndex: number          // Current position in history
  totalCount: number            // Total history entries

  goBack(): void                // Navigate to previous entry
  goForward(): void             // Navigate to next entry
  goToEntry(index: number): void
  clearHistory(): void
}
```

**UI Components:**
- Back/Forward buttons in editor toolbar
- History dropdown showing recent executions
- Keyboard shortcuts (Alt+Left, Alt+Right)
- Visual indicator of history position

### 3. History Panel

Dedicated panel showing execution history:

```typescript
interface HistoryPanelEntry {
  id: string
  timestamp: Date
  codePreview: string           // First 2 lines of code
  status: 'success' | 'error' | 'running'
  duration: string
  outputLines: number
}

// Panel features:
// - Chronological list of executions
// - Click to restore code
// - Delete individual entries
// - Export history as JSON
// - Search/filter by content
```

### 4. Code Restoration

Restore code from history:

```typescript
interface CodeRestoration {
  // When navigating history
  restoreCode(entry: ExecutionHistoryEntry): void

  // Before restoring, warn if current code is unsaved
  confirmRestore(entry: ExecutionHistoryEntry): boolean

  // Mark current code before restoring (for forward navigation)
  saveCheckpoint(): void
}
```

**User Flow:**
1. User makes code changes and runs
2. Before each run, current code is saved as checkpoint
3. After run, new entry added to history
4. User can navigate back/forward through executions
5. Restoring code from history updates editor

### 5. Persistent History (Optional)

Save history to localStorage:

```typescript
interface PersistentHistory {
  save(): void
  load(): void
  clear(): void
  exportAsJSON(): string
  importFromJSON(json: string): void
}

// Storage limits:
// - Max 100 entries in localStorage
// - Auto-delete oldest when limit reached
// - Compress code to save space
// - Clear on explicit user action
```

## Implementation Phases

### Phase 1: History Storage (Days 1-2)

**Goal**: Store execution history in memory

1. **Create history store**
   - `src/features/ide/stores/executionHistory.ts` - Pinia store
   - Ring buffer implementation (max 20 entries)
   - Add entries on each execution

2. **Integrate with execution**
   - Hook into `useBasicIdeExecution.ts`
   - Save code before each run
   - Store execution result

**Files to Create:**
- `src/features/ide/stores/executionHistory.ts` (~150 lines)
- `src/features/ide/types/history.ts` (~50 lines)

**Files to Modify:**
- `src/features/ide/composables/useBasicIdeExecution.ts` (~20 lines - save checkpoint)

**Acceptance Criteria:**
- Each execution creates history entry
- History stores complete code and output
- Max 20 entries, oldest auto-removed
- No performance impact on execution

### Phase 2: Navigation Controls (Days 3-4)

**Goal**: Add UI for history navigation

1. **Navigation component**
   - Back/Forward buttons
   - History dropdown
   - Keyboard shortcuts (Alt+Left, Alt+Right)

2. **Code restoration**
   - Restore code from history
   - Confirm before overwriting unsaved changes
   - Update editor content

**Files to Create:**
- `src/features/ide/components/HistoryNavigation.vue` (~150 lines)
- `src/features/ide/composables/useHistoryNavigation.ts` (~100 lines)

**Files to Modify:**
- `src/features/ide/components/IdeControls.vue` (~15 lines - add nav buttons)

**Acceptance Criteria:**
- Back/Forward buttons enable/disable based on position
- Clicking restores code to editor
- Keyboard shortcuts work
- Confirmation appears if current code changed

### Phase 3: History Panel (Days 5-7)

**Goal**: Show full history in dedicated panel

1. **History list component**
   - Chronological list of executions
   - Status indicators (success/error)
   - Code preview (first 2 lines)
   - Timestamp and duration

2. **Panel features**
   - Click to restore code
   - Delete individual entries
   - Search/filter
   - Clear all history

**Files to Create:**
- `src/features/ide/components/HistoryPanel.vue` (~200 lines)
- `src/features/ide/composables/useHistoryPanel.ts` (~100 lines)

**Files to Modify:**
- `src/features/ide/IdePage.vue` (~10 lines - add panel)
- `src/shared/i18n/en.ts` (~20 lines - labels)

**Acceptance Criteria:**
- Panel shows all history entries
- Click entry restores code
- Delete button removes entry
- Search filters by code content
- Clear all removes all entries

### Phase 4: Persistence & Polish (Days 8-10)

**Goal**: Add persistence and finalize UX

1. **Persistent storage**
   - Save to localStorage on each entry
   - Load on app startup
   - Export/Import as JSON
   - Auto-cleanup old entries

2. **UX improvements**
   - Visual diff between current and history code
   - Mark "working" entries (success, no errors)
   - Quick jump to last successful execution
   - Keyboard shortcut (Ctrl+H) to open history

**Files to Create:**
- `src/features/ide/utils/historyStorage.ts` (~100 lines)
- `src/features/ide/utils/historyExport.ts` (~50 lines)

**Files to Modify:**
- `src/features/ide/components/HistoryPanel.vue` (~50 lines - add diff view)
- `src/shared/i18n/en.ts` (~10 lines - additional labels)

**Acceptance Criteria:**
- History persists across page refresh
- Export JSON works
- Import JSON validates and loads
- Visual diff shows changed lines
- Ctrl+H opens history panel

## Usage Examples

### Basic Navigation Flow

```typescript
// User workflow:
1. Write code: "10 PRINT 'Hello'"
2. Run → Success (Entry #1 created)
3. Edit code: "10 PRINT 'World'"
4. Run → Success (Entry #2 created)
5. Make breaking change: "10 PRIN 'Wrong'"
6. Run → Error (Entry #3 created)
7. Press "Back" → Code restored to "10 PRINT 'World'"
8. Press "Back" → Code restored to "10 PRINT 'Hello'"
9. Press "Forward" → Code restored to "10 PRINT 'World'"
```

### History Panel Workflow

```vue
<HistoryPanel>
  <HistoryEntry
    timestamp="2026-02-06 10:30:15"
    status="success"
    codePreview="10 PRINT 'Hello'"
    duration="15ms"
    @click="restoreCode('entry-1')"
  />
  <HistoryEntry
    timestamp="2026-02-06 10:31:22"
    status="error"
    codePreview="10 PRIN 'Wrong'"
    duration="5ms"
    @click="restoreCode('entry-3')"
  />
</HistoryPanel>
```

### Keyboard Shortcuts

```
Alt+Left    - Go back in history
Alt+Right   - Go forward in history
Ctrl+H      - Open/close history panel
Ctrl+Shift+H - Clear history
```

## Technical Architecture

### New History Infrastructure

```
src/features/ide/
├── stores/
│   └── executionHistory.ts        # Pinia store for history state
├── components/
│   ├── HistoryNavigation.vue      # Back/Forward controls
│   ├── HistoryPanel.vue           # History list panel
│   └── HistoryEntryCard.vue       # Individual history entry
├── composables/
│   ├── useHistoryNavigation.ts    # Navigation logic
│   └── useHistoryPanel.ts         # Panel state management
├── utils/
│   ├── historyStorage.ts          # localStorage persistence
│   └── historyExport.ts           # Import/export utilities
└── types/
    └── history.ts                 # History-related types
```

### Integration with Existing Systems

**Execution Engine:**
- Hook into `useBasicIdeExecution.execute()`
- Save checkpoint before execution
- Store result after execution
- No changes to execution logic

**Editor Integration:**
- Update Monaco editor content on navigation
- Confirm before overwriting changes
- Track unsaved changes state

**State Management:**
- Use Pinia store for history state
- Reactive updates across components
- Persist to localStorage

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Existing Pinia store (state management)
- Existing Monaco editor (code display)
- Browser localStorage (persistence)
- TypeScript standard library

**Optional Enhancements:**
- `diff` package: For code diff visualization
- `date-fns`: For timestamp formatting (or use native Intl)

## Success Metrics

### Developer Velocity
- **Time to recover**: Time to restore working code after breaking change
- **Experimentation rate**: Number of executions per session (should increase)
- **History usage**: % of sessions using history navigation

### User Satisfaction
- **Feature usage**: % of sessions using history navigation
- **Recovery success**: % of times history helped recover code
- **NPS**: Satisfaction with history feature

### Quality Metrics
- **Memory usage**: History storage impact (target: <1MB for 20 entries)
- **Performance**: No lag when adding history entries
- **Reliability**: No lost history entries

## Benefits

### Immediate Benefits

1. **Fearless Experimentation**: Try changes without worrying about losing working code
2. **Fast Recovery**: Quickly restore working versions after breaking changes
3. **Better Learning**: See progression of attempts and understand what changed
4. **Reduced Stress**: No fear of accidental editor changes

### Long-Term Benefits

1. **Improved Iteration**: Faster development cycles with easy rollback
2. **Session Persistence**: Work survives page refresh
3. **Historical Record**: Can review entire development session
4. **Teaching Tool**: Instructors can see student progression

### Developer Experience Impact

- **Before**: Make change → Break → Manually undo or remember old code → Slow iteration
- **After**: Make change → Break → Press "Back" → Instant recovery → Fast iteration

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Memory usage from storing code | Limit to 20 entries; compress code; oldest auto-removed |
| Users confuse history with git/vcs | Clear labeling "Session History" vs persistent version control |
| Restoring code overwrites work | Confirmation dialog; show diff before restore |
| Performance on large programs | Lazy load code; store in IndexedDB if >1MB |
| localStorage quota exceeded | Graceful degradation; warning message; use IndexedDB |

## Open Questions

1. **History Size**: 20 entries default? Make configurable?
2. **Persistence**: Enable by default or opt-in?
3. **Code Diff**: Show diff before restore? (adds complexity)
4. **Auto-save**: Auto-save on each run or manual only?
5. **Export Format**: JSON export for backup? Include output?

## Next Steps

1. **Prototype**: Build basic history store with add/restore
2. **Test**: Use during development to validate value
3. **Iterate**: Add UI components based on usage patterns
4. **Polish**: Add persistence and keyboard shortcuts
5. **Document**: Write usage guide and tips

## Implementation Details

### Specific Code Changes

**1. History Store (Pinia)**

```typescript
// src/features/ide/stores/executionHistory.ts
import { defineStore } from 'pinia'

export const useExecutionHistoryStore = defineStore('executionHistory', {
  state: (): HistoryState => ({
    entries: [],
    currentIndex: -1,
    maxSize: 20,
  }),

  actions: {
    addEntry(entry: ExecutionHistoryEntry) {
      // Remove any forward history (new branch)
      this.entries = this.entries.slice(0, this.currentIndex + 1)

      // Add new entry
      this.entries.push(entry)

      // Remove oldest if over limit
      if (this.entries.length > this.maxSize) {
        this.entries.shift()
      }

      this.currentIndex = this.entries.length - 1
    },

    canGoBack(): boolean {
      return this.currentIndex > 0
    },

    canGoForward(): boolean {
      return this.currentIndex < this.entries.length - 1
    },

    goBack(): ExecutionHistoryEntry | null {
      if (this.canGoBack()) {
        this.currentIndex--
        return this.entries[this.currentIndex]
      }
      return null
    },

    goForward(): ExecutionHistoryEntry | null {
      if (this.canGoForward()) {
        this.currentIndex++
        return this.entries[this.currentIndex]
      }
      return null
    },

    restoreCode(entryId: string): string | null {
      const entry = this.entries.find(e => e.id === entryId)
      return entry?.code ?? null
    },
  },
})
```

**2. Hook into Execution**

```typescript
// src/features/ide/composables/useBasicIdeExecution.ts
const historyStore = useExecutionHistoryStore()

async function executeCode(code: string) {
  // Create checkpoint before execution
  const checkpoint: ExecutionHistoryEntry = {
    id: generateId(),
    code: code,
    timestamp: Date.now(),
    output: [],
    errors: [],
    success: false,
    duration: 0,
    iterationCount: 0,
  }

  // Execute normally
  const result = await interpreter.execute(code)

  // Update checkpoint with results
  checkpoint.output = result.output
  checkpoint.errors = result.errors
  checkpoint.success = result.success
  checkpoint.duration = result.duration
  checkpoint.iterationCount = result.iterationCount

  // Add to history
  historyStore.addEntry(checkpoint)

  return result
}
```

**3. Navigation Component**

```vue
<!-- src/features/ide/components/HistoryNavigation.vue -->
<template>
  <div class="history-nav">
    <button
      :disabled="!canGoBack"
      @click="goBack"
      title="Go to previous execution (Alt+Left)"
    >
      <mdi:chevron-left />
    </button>

    <select v-model="selectedIndex" @change="goToEntry">
      <option v-for="(entry, i) in entries" :key="entry.id" :value="i">
        {{ formatEntry(entry) }}
      </option>
    </select>

    <button
      :disabled="!canGoForward"
      @click="goForward"
      title="Go to next execution (Alt+Right)"
    >
      <mdi:chevron-right />
    </button>
  </div>
</template>
```

### Acceptance Criteria

**Phase 1:**
- [ ] History store created with ring buffer
- [ ] Checkpoint saved before each execution
- [ ] Entry updated with execution results
- [ ] Max 20 entries enforced
- [ ] No performance impact

**Phase 2:**
- [ ] Back/Forward buttons in toolbar
- [ ] Buttons enable/disable correctly
- [ ] Clicking restores code to editor
- [ ] Keyboard shortcuts (Alt+Left, Alt+Right) work
- [ ] Confirmation before overwriting changes

**Phase 3:**
- [ ] History panel shows all entries
- [ ] Each entry shows timestamp, status, preview
- [ ] Click entry restores code
- [ ] Delete button removes entry
- [ ] Search filters entries

**Phase 4:**
- [ ] History persists to localStorage
- [ ] History loads on app startup
- [ ] Export JSON works
- [ ] Import JSON validates and loads
- [ ] Ctrl+H opens/closes history panel

---

*"The best IDE feature is the one you don't notice until you need it—then it saves your day. Execution history navigation is like an undo button for your entire development session."*
