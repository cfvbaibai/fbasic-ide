# Implementation Plan: Program Management System

## Overview

Implement a program management system that binds BASIC code and BG data together, with file-based save/load functionality.

**Goal**: Each program is a self-contained unit with code + BG, saved as JSON file.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        IDE Page                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Toolbar: [NEW] [OPEN] [SAVE]    [Program Name]  [Run]   ││
│  └─────────────────────────────────────────────────────────┘│
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │         useProgramStore (Singleton Composable)           ││
│  │  Module-level state (same pattern as useBgEditorState):  ││
│  │  - currentProgram: Ref<ProgramData | null>              ││
│  │  - isDirty: Ref<boolean>                                ││
│  │  - Auto-persists to localStorage on change              ││
│  │                                                          ││
│  │  Actions:                                                ││
│  │  - newProgram(), loadProgram(), setCode(), setBg()      ││
│  │  - save(), saveAs(), open()                             ││
│  └─────────────────────────────────────────────────────────┘│
│          │                              │                    │
│          ▼                              ▼                    │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Code Editor    │         │   BG Editor      │         │
│  │   (reads code)   │         │   (reads bg)     │         │
│  │   (writes code)  │         │   (writes bg)    │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

**Design Decision**: Use a singleton composable (not Pinia) because:
- Only 1 active program at a time
- Matches existing `useBgEditorState` pattern
- Vue reactivity is sufficient
- No need for complex state management

---

## Data Structures

### ProgramData Interface

```typescript
// src/core/interfaces.ts

interface ProgramData {
  version: 1
  id: string           // UUID format
  name: string         // User-visible name
  code: string         // BASIC source
  bg: CompactBg        // Compressed BG data
  createdAt: number    // Timestamp
  updatedAt: number    // Timestamp
}

interface CompactBg {
  format: 'sparse1' | 'rle1'
  data: string
  width: 28
  height: 21
}

interface ProgramExportFile {
  format: 'family-basic-program'
  version: 1
  program: ProgramData
}
```

---

## Implementation Tasks

### Phase 1: Core Infrastructure (Platform Team)

#### Task 1.1: Create Type Definitions
**File**: `src/core/interfaces.ts`
- Add `ProgramData` interface
- Add `CompactBg` interface
- Add `ProgramExportFile` interface

#### Task 1.2: Create ID Generator Utility
**File**: `src/shared/utils/id.ts`
- `generateProgramId(): string` - Returns UUID v4
- `generateSessionId(): string` - Returns short session ID

#### Task 1.3: Create File I/O Utilities
**File**: `src/shared/utils/fileIO.ts`
- `saveJsonFile(data: object, filename: string): Promise<void>`
- `loadJsonFile(): Promise<unknown>`
- Uses native File System Access API with fallback to download/upload

#### Task 1.4: Create BG Compression Utilities
**File**: `src/features/bg-editor/utils/bgCompression.ts`
- `compressBg(grid: BgGridData): CompactBg`
- `decompressBg(compact: CompactBg): BgGridData`
- `encodeRle(grid: BgGridData): string`
- `decodeRle(data: string): BgGridData`
- Hybrid approach: sparse for <30% fill, RLE otherwise

---

### Phase 2: Program Store (UI + Runtime Team)

#### Task 2.1: Create Program Store Composable
**File**: `src/features/ide/composables/useProgramStore.ts`

**Pattern**: Singleton composable with module-level state (same as `useBgEditorState`)

```typescript
// Module-level singleton state
const currentProgram = ref<ProgramData | null>(null)
const isDirty = ref(false)

// Auto-persist to localStorage on changes
watch(currentProgram, (program) => {
  if (program) {
    localStorage.setItem(`program:${program.id}`, JSON.stringify(program))
    localStorage.setItem('program:current', program.id)
  }
}, { deep: true })

export function useProgramStore() {
  // Initialize on first use
  if (!currentProgram.value) {
    restoreLastProgram()
  }

  return {
    // State (readonly to prevent direct mutation)
    currentProgram: readonly(currentProgram),
    isDirty: readonly(isDirty),

    // Getters
    get programId() { return currentProgram.value?.id },
    get programName() { return currentProgram.value?.name ?? 'Untitled' },
    get code() { return currentProgram.value?.code ?? '' },
    get bg() {
      return currentProgram.value?.bg
        ? decompressBg(currentProgram.value.bg)
        : createEmptyGrid()
    },

    // Actions
    newProgram,
    loadProgram,
    setCode,
    setBg,
    save,
    saveAs,
    open,
  }
}
```

**Actions**:
- `newProgram()` - Create fresh program with empty code + BG
- `loadProgram(program: ProgramData)` - Set current program
- `setCode(code: string)` - Update code, mark dirty
- `setBg(bg: BgGridData)` - Update BG, mark dirty (compresses internally)
- `save()` - Persist + download file
- `saveAs(name: string)` - Rename + save
- `open()` - Load from file
- `restoreLastProgram()` - Load from localStorage on startup (internal)

---

### Phase 3: Update BG Editor (UI Team)

#### Task 3.1: Remove Singleton BG State
**File**: `src/features/bg-editor/composables/useBgEditorState.ts`
- Remove module-level singleton `grid` ref
- Accept `initialGrid` as parameter OR read from program store
- Keep editor mode state (SELECT, COPY, MOVE, CHAR) as local UI state

#### Task 3.2: Create BG Editor Props Interface
**Files**: `BgEditorPage.vue`, `BgGrid.vue`
- Accept `modelValue: BgGridData` prop
- Emit `update:modelValue` on changes
- OR: Read/write directly from program store

#### Task 3.3: Remove Old Storage
**File**: `src/features/bg-editor/composables/useBgStorage.ts`
- Keep functions but they become internal to program store
- OR: Mark as deprecated, remove in future

---

### Phase 4: Update IDE Integration (UI + Runtime Team)

#### Task 4.1: Create Program Toolbar Component
**File**: `src/features/ide/components/ProgramToolbar.vue`
- Buttons: NEW, OPEN, SAVE
- Editable program name input
- Dirty indicator (●)
- Keyboard shortcuts: Ctrl+N, Ctrl+O, Ctrl+S

#### Task 4.2: Update IDE Page
**File**: `src/features/ide/IdePage.vue`
- Add ProgramToolbar to layout
- Wire program store to code editor (two-way binding)
- Wire program store to execution flow

#### Task 4.3: Update Execution Flow
**File**: `src/features/ide/composables/useBasicIdeExecution.ts`
- Remove direct `useBgEditorState()` import
- Get BG from program store: `programStore.bg`
- Decompress before sending to worker
- Send to worker via existing `worker.sendBgData()`

#### Task 4.4: Handle Run with Unsaved Changes
- Prompt user if dirty: "Save before running?"
- OR: Just run with current state (auto-save to localStorage)

---

### Phase 5: Sample Programs (All Teams)

#### Task 5.1: Convert Sample Codes to ProgramData
**File**: `src/core/samples/sampleCodes.ts`
- Each sample becomes full `ProgramData`
- Add default empty BG to samples that don't need BG
- Create custom BG for samples that use VIEW

#### Task 5.2: Create Sample BG Data
**Files**: `src/core/samples/sampleBgData.ts`
- Pre-designed BG for VIEW demo
- Platform game level BG
- Title screen BG

#### Task 5.3: Update Sample Selector UI
**File**: `src/features/ide/components/SampleSelector.vue` (or similar)
- Load sample into program store on selection
- Sample loads as new program (copies data, new ID)

---

### Phase 6: Worker Integration (Platform Team)

#### Task 6.1: Verify Worker Receives Decompressed BG
**File**: `src/core/workers/WebWorkerInterpreter.ts`
- Already has `handleSetBgData()`
- Ensure it receives `BgGridData` (decompressed)

#### Task 6.2: Update Message Types
**File**: `src/core/interfaces.ts`
- `SetBgDataMessage.data.grid` should be `BgGridData` (not CompactBg)
- Compression/decompression happens in main thread only

---

## File Changes Summary

| File | Action | Team |
|------|--------|------|
| `src/core/interfaces.ts` | Add types | Platform |
| `src/shared/utils/id.ts` | Create | Platform |
| `src/shared/utils/fileIO.ts` | Create | Platform |
| `src/features/bg-editor/utils/bgCompression.ts` | Create | Platform |
| `src/features/ide/composables/useProgramStore.ts` | Create | UI/Runtime |
| `src/features/ide/components/ProgramToolbar.vue` | Create | UI |
| `src/features/bg-editor/composables/useBgEditorState.ts` | Modify | UI |
| `src/features/ide/IdePage.vue` | Modify | UI |
| `src/features/ide/composables/useBasicIdeExecution.ts` | Modify | Runtime |
| `src/core/samples/sampleCodes.ts` | Modify | All |
| `src/core/samples/sampleBgData.ts` | Create | UI |

---

## Testing Strategy

### Unit Tests
- `bgCompression.test.ts` - Compress/decompress roundtrip
- `fileIO.test.ts` - Mock File API, test save/load
- `useProgramStore.test.ts` - Store actions, dirty state

### Integration Tests
- Create program → edit code → edit BG → save → load → verify
- Load sample → verify code + BG loaded
- Run program → verify BG sent to worker correctly

---

## Execution Order

```
Phase 1 (Platform) ─────────────────────────────────────┐
                                                        │
Phase 2 (UI/Runtime) ───────────────────────────────────┤
                                                        │
Phase 3 (UI - BG Editor) ───────────────────────────────┤
                                                        │
Phase 4 (UI - IDE) ─────────────────────────────────────┤
                                                        │
Phase 5 (Samples) ──────────────────────────────────────┤
                                                        │
Phase 6 (Worker) ───────────────────────────────────────┘
                                                        │
Testing ────────────────────────────────────────────────┘
```

---

## Acceptance Criteria

1. ✅ User can create new program (empty code + BG)
2. ✅ User can edit code and BG independently
3. ✅ Changes are tracked (dirty indicator)
4. ✅ User can save program to JSON file
5. ✅ User can open program from JSON file
6. ✅ File contains both code and BG in compact format
7. ✅ Sample programs load with their BG data
8. ✅ VIEW command uses the correct BG for current program
9. ✅ Program persists in localStorage between sessions
10. ✅ File size is reasonable (<5KB for typical program)

---

## Estimated Effort

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1 | 4 tasks | Medium |
| Phase 2 | 1 task | Medium |
| Phase 3 | 3 tasks | Medium |
| Phase 4 | 4 tasks | High |
| Phase 5 | 3 tasks | Low |
| Phase 6 | 2 tasks | Low |

**Total**: ~15-20 hours of development work
