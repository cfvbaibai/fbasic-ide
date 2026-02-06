# Strategic Idea: My Programs Library - Local Program Management

**Date**: 2026-02-06
**Turn**: 22
**Status**: Conceptual
**Focus Area**: Developer Experience & Productivity
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add a **"My Programs" library** to the Family Basic IDE that allows developers to save, organize, and quickly access their own F-BASIC programs locally—eliminating the need to manually copy-paste code for preservation and enabling a professional project workflow.

## Problem Statement

### Current Developer Experience Gaps

1. **No Program Persistence**: Code is lost on refresh
   - Users must manually copy-paste code to save it elsewhere
   - No built-in save functionality for user programs
   - Browser refresh loses all work
   - Cannot maintain a personal code library

2. **Poor Project Organization**: No way to organize multiple programs
   - Cannot create named projects/programs
   - No folders or categories for user code
   - Cannot distinguish between samples and personal work
   - No project metadata (name, description, created date)

3. **Slow Iteration Workflow**: Loading saved work is cumbersome
   - Must navigate to external files to retrieve saved code
   - No quick access to recent programs
   - Cannot switch between multiple projects easily
   - No "Save As" functionality

4. **No Sharing Capabilities**: Hard to share programs with others
   - Cannot export programs in a standard format
   - No import functionality for received programs
   - No shareable links or file exports
   - Community program exchange is difficult

5. **Missed Learning Opportunities**: Cannot track progress over time
   - No history of programs written
   - Cannot compare early work to current skills
   - No portfolio of completed projects
   - Hard to revisit and improve old code

## Proposed Solution

### 1. Local Program Storage with IndexedDB

Store user programs in browser's IndexedDB for persistence:

```typescript
interface FBasicProgram {
  id: string                    // Unique program ID
  name: string                  // Program name
  description: string           // Optional description
  code: string                  // F-BASIC source code
  category?: string             // User-defined category
  tags: string[]                // User-defined tags
  createdAt: Date               // Creation timestamp
  updatedAt: Date               // Last modified timestamp
  lastRunAt?: Date              // Last execution timestamp
  runCount: number              // Number of times executed
  isFavorite: boolean           // User favorited
  thumbnail?: string            // Optional screenshot thumbnail
}

interface ProgramLibrary {
  programs: FBasicProgram[]
  categories: string[]
  tags: Set<string>
  favorites: string[]           // Program IDs
  recent: string[]              // Recently accessed program IDs (MRU)
}

interface LibraryStorage {
  // CRUD operations
  saveProgram(program: FBasicProgram): Promise<void>
  loadProgram(id: string): Promise<FBasicProgram | null>
  deleteProgram(id: string): Promise<void>
  listPrograms(filter?: ProgramFilter): Promise<FBasicProgram[]>

  // Organization
  addCategory(programId: string, category: string): Promise<void>
  addTag(programId: string, tag: string): Promise<void>
  toggleFavorite(programId: string): Promise<void>

  // Import/Export
  exportProgram(id: string): Promise<Blob>
  exportAllPrograms(): Promise<Blob>
  importProgram(file: File): Promise<FBasicProgram>

  // Queries
  getRecentPrograms(limit?: number): Promise<FBasicProgram[]>
  getFavoritePrograms(): Promise<FBasicProgram[]>
  searchPrograms(query: string): Promise<FBasicProgram[]>
}

interface ProgramFilter {
  category?: string
  tags?: string[]
  favorite?: boolean
  dateRange?: { start: Date; end: Date }
  searchQuery?: string
}
```

### 2. My Programs Library UI

Dedicated panel/modal for program management:

```vue
<template>
  <div class="program-library">
    <!-- Library Header -->
    <div class="library-header">
      <h2>My Programs</h2>
      <div class="library-actions">
        <button @click="createNewProgram">New Program</button>
        <button @click="showImportDialog">Import</button>
        <button @click="exportAll">Export All</button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="library-search">
      <input v-model="searchQuery" placeholder="Search programs..." />
      <select v-model="selectedCategory">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
      <button @click="showFavoritesOnly = !showFavoritesOnly">
        <span :class="['mdi', showFavoritesOnly ? 'mdi-star' : 'mdi-star-outline']" />
        Favorites
      </button>
    </div>

    <!-- Quick Access Section -->
    <div class="library-section">
      <h3>Recent</h3>
      <div class="program-grid">
        <ProgramCard
          v-for="program in recentPrograms"
          :key="program.id"
          :program="program"
          @open="loadProgram"
          @delete="deleteProgram"
          @favorite="toggleFavorite"
        />
      </div>
    </div>

    <!-- All Programs List -->
    <div class="library-section">
      <h3>All Programs ({{ filteredPrograms.length }})</h3>
      <div class="program-list">
        <ProgramListItem
          v-for="program in filteredPrograms"
          :key="program.id"
          :program="program"
          @open="loadProgram"
          @duplicate="duplicateProgram"
          @rename="renameProgram"
          @delete="deleteProgram"
          @export="exportProgram"
        />
      </div>
    </div>
  </div>
</template>
```

### 3. Save/Save-As Functionality

IDE integration for saving work:

```typescript
interface ProgramSaveActions {
  // Quick save (update current program or create new)
  saveCurrentProgram(): Promise<void>

  // Save as new program with prompt
  saveProgramAs(): Promise<void>

  // Auto-save (debounced, to draft location)
  autoSave(): void

  // Prompt to save on unload
  promptSaveBeforeExit(): Promise<boolean>
}

// In IDE toolbar/keyboard shortcuts
const saveActions: ProgramSaveActions = {
  async saveCurrentProgram() {
    if (state.currentProgramId) {
      // Update existing
      await storage.updateProgram(state.currentProgramId, {
        code: state.code.value,
        updatedAt: new Date()
      })
    } else {
      // Prompt for name and create new
      await this.saveProgramAs()
    }
  },

  async saveProgramAs() {
    const name = await promptUser('Enter program name:')
    if (!name) return

    const program: FBasicProgram = {
      id: generateId(),
      name,
      description: '',
      code: state.code.value,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      runCount: 0,
      isFavorite: false
    }

    await storage.saveProgram(program)
    state.currentProgramId = program.id
    state.currentProgramName = name
  }
}
```

### 4. Program Card Component

Visual representation of saved programs:

```vue
<template>
  <div class="program-card" @click="emit('open', program.id)">
    <!-- Thumbnail (optional screenshot) -->
    <div class="program-thumbnail">
      <img v-if="program.thumbnail" :src="program.thumbnail" />
      <div v-else class="thumbnail-placeholder">
        <span class="mdi mdi-code-braces" />
      </div>
    </div>

    <!-- Program Info -->
    <div class="program-info">
      <h4 class="program-name">{{ program.name }}</h4>
      <p class="program-desc">{{ program.description || 'No description' }}</p>

      <!-- Metadata -->
      <div class="program-meta">
        <span class="meta-item">
          <span class="mdi mdi-calendar" />
          {{ formatDate(program.updatedAt) }}
        </span>
        <span class="meta-item">
          <span class="mdi mdi-play" />
          {{ program.runCount }}
        </span>
        <span v-if="program.category" class="program-tag">
          {{ program.category }}
        </span>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="program-actions" @click.stop>
      <button @click="emit('favorite', program.id)" :class="{ active: program.isFavorite }">
        <span class="mdi mdi-star" />
      </button>
      <button @click="emit('duplicate', program.id)">
        <span class="mdi mdi-content-copy" />
      </button>
      <button @click="emit('export', program.id)">
        <span class="mdi mdi-download" />
      </button>
      <button @click="emit('delete', program.id)">
        <span class="mdi mdi-delete" />
      </button>
    </div>
  </div>
</template>
```

### 5. Import/Export Format

Standard JSON format for program exchange:

```typescript
// Single program export
interface FBasicProgramExport {
  version: '1.0'
  format: 'fbasic-program'
  program: FBasicProgram
}

// Multiple programs export
interface FBasicLibraryExport {
  version: '1.0'
  format: 'fbasic-library'
  exportedAt: Date
  programs: FBasicProgram[]
}

// Export file: program-name.fbasic
{
  "version": "1.0",
  "format": "fbasic-program",
  "program": {
    "name": "Sprite Demo",
    "description": "Demonstrates sprite animation",
    "code": "10 SPRITE DEF 0,0,0,0,0,0,0,255\n20 SPRITE 0,100,100\n30 FOR I=1 TO 100\n40 MOVE 0,I,I\n50 NEXT I",
    "tags": ["sprites", "animation", "demo"],
    "createdAt": "2026-02-06T10:00:00Z",
    "updatedAt": "2026-02-06T12:00:00Z"
  }
}
```

### 6. Auto-Save & Draft Management

Prevent data loss with automatic saving:

```typescript
interface DraftManager {
  // Auto-save to draft location (debounced)
  saveDraft(code: string): void

  // Restore draft on load
  restoreDraft(): Promise<string | null>

  // Clear draft after successful save
  clearDraft(): void

  // List available drafts (for recovery)
  listDrafts(): Promise<DraftInfo[]>
}

interface DraftInfo {
  sessionId: string
  savedAt: Date
  preview: string      // First few lines of code
}

// Auto-save triggers
// - Every 30 seconds of inactivity
// - Every 100 keystrokes
// - On window blur (user switches tabs)
// - Before page unload (with confirmation)
```

### 7. Keyboard Shortcuts

Quick access to library functions:

| Shortcut | Action |
|----------|--------|
| **Ctrl+S** / **Cmd+S** | Save program |
| **Ctrl+Shift+S** / **Cmd+Shift+S** | Save As... |
| **Ctrl+O** / **Cmd+O** | Open library |
| **Ctrl+N** / **Cmd+N** | New program |
| **Ctrl+Shift+E** / **Cmd+Shift+E** | Export current program |
| **Ctrl+Shift+I** / **Cmd+Shift+I** | Import program |

## Implementation Priority

### Phase 1 (Week 1): Core Storage & UI

**Goal**: Basic save/load functionality

1. **IndexedDB Storage Layer**
   - Create `ProgramLibraryStorage` class
   - Implement CRUD operations
   - Add error handling and migrations
   - Write unit tests for storage

2. **Basic Library UI**
   - Create `ProgramLibrary.vue` component
   - Program list with search
   - Open program action
   - Delete program action

3. **IDE Integration**
   - Add Save/Save As buttons to toolbar
   - Integrate with current code state
   - Add keyboard shortcuts (Ctrl+S, Ctrl+O)

**Files to Create:**
- `src/features/library/storage/ProgramLibraryStorage.ts` - IndexedDB wrapper
- `src/features/library/types.ts` - Type definitions
- `src/features/library/components/ProgramLibrary.vue` - Library UI
- `src/features/library/components/ProgramCard.vue` - Program card component
- `src/features/library/components/SaveProgramDialog.vue` - Save as dialog
- `src/features/library/composables/useProgramLibrary.ts` - Library composable

**Files to Modify:**
- `src/features/ide/IdePage.vue` - Add library button/keyboard shortcuts
- `src/features/ide/composables/useBasicIdeState.ts` - Add currentProgramId state
- `src/shared/i18n/en.ts` - Add library-related translations

### Phase 2 (Week 2): Advanced Features

**Goal**: Full program management capabilities

1. **Enhanced Library UI**
   - Categories and tags
   - Favorites filter
   - Recent programs section
   - Program duplication

2. **Import/Export**
   - Export single program as `.fbasic` file
   - Export all programs as zip
   - Import from file
   - Drag-and-drop import

3. **Auto-Save & Drafts**
   - Auto-save to drafts
   - Draft recovery on load
   - Prompt to save on exit
   - Visual indicator for unsaved changes

4. **Polish**
   - Program thumbnails (optional screenshots)
   - Sorting options (name, date, runs)
   - Bulk operations (delete multiple, export multiple)
   - Share link generation (encode in URL hash)

**Files to Create:**
- `src/features/library/components/ImportExportDialog.vue` - Import/export UI
- `src/features/library/components/DraftRecoveryDialog.vue` - Draft recovery
- `src/features/library/utils/programExporter.ts` - Export logic
- `src/features/library/utils/programImporter.ts` - Import logic
- `src/features/library/composables/useAutoSave.ts` - Auto-save logic

**Files to Modify:**
- `src/features/library/components/ProgramLibrary.vue` - Add advanced features
- `src/features/ide/components/IdeControls.vue` - Add unsaved indicator

## Technical Architecture

### New Library Infrastructure

```
src/features/library/
├── storage/
│   ├── ProgramLibraryStorage.ts      # IndexedDB operations
│   ├── DraftManager.ts                # Auto-save drafts
│   └── migrations.ts                  # Schema migrations
├── types.ts                           # Library type definitions
├── components/
│   ├── ProgramLibrary.vue             # Main library UI
│   ├── ProgramCard.vue                # Program card
│   ├── ProgramListItem.vue            # List item view
│   ├── SaveProgramDialog.vue          # Save as dialog
│   ├── ImportExportDialog.vue         # Import/export
│   └── DraftRecoveryDialog.vue        # Draft recovery
├── composables/
│   ├── useProgramLibrary.ts           # Library state & actions
│   ├── useAutoSave.ts                 # Auto-save logic
│   ├── useProgramExport.ts            # Export functionality
│   └── useProgramImport.ts            # Import functionality
└── utils/
    ├── programExporter.ts             # Export utilities
    ├── programImporter.ts             # Import utilities
    └── fileNaming.ts                  # .fbasic file naming
```

### IndexedDB Schema

```typescript
// Database: FBasicProgramLibrary
// Version: 1

const stores = {
  programs: {
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
      { name: 'name', keyPath: 'name', unique: false },
      { name: 'category', keyPath: 'category', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false },
      { name: 'updatedAt', keyPath: 'updatedAt', unique: false },
      { name: 'isFavorite', keyPath: 'isFavorite', unique: false }
    ]
  },
  drafts: {
    keyPath: 'sessionId',
    autoIncrement: false,
    indexes: [
      { name: 'savedAt', keyPath: 'savedAt', unique: false }
    ]
  },
  categories: {
    keyPath: 'name',
    autoIncrement: false
  },
  tags: {
    keyPath: 'tag',
    autoIncrement: false
  }
}
```

### Integration with Existing Code

**IDE State Extension:**
```typescript
interface BasicIdeState {
  // Existing state...
  code: Ref<string>
  errors: Ref<ExecutionError[]>

  // New library state
  currentProgramId: Ref<string | null>
  currentProgramName: Ref<string>
  unsavedChanges: Ref<boolean>
  lastSavedAt: Ref<Date | null>
}
```

**No Breaking Changes:**
- Sample loading continues to work as before
- Existing code state is unchanged
- Library is additive, not replacement

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Native IndexedDB API (browser built-in)
- Vue 3 Composition API
- TypeScript
- Existing file download APIs

**Optional Enhancements:**
- `idb`: Promise-based IndexedDB wrapper (or implement native)
- `file-saver`: Enhanced file saving (or use native API)
- `jszip`: For export-all-as-zip (or export individually)

## Success Metrics

### User Engagement
- **Program Creation**: # of programs saved per user per week
- **Library Usage**: # of library opens per session
- **Save Rate**: % of code sessions that are saved
- **Recovery Rate**: # of drafts recovered

### Workflow Efficiency
- **Time Saved**: Reduced time to save/load programs vs manual copy-paste
- **Iteration Speed**: Code → Save → Run cycle improvement
- **Program Reuse**: % of saved programs that are reopened and modified

### Feature Adoption
- **Import/Export**: # of programs shared (imported/exported)
- **Organization**: % of programs with categories/tags
- **Favorites**: % of programs marked as favorites
- **Auto-Save**: # of drafts recovered

## Benefits

### Immediate Benefits
1. **Work Preservation**: Never lose code to refresh/close
2. **Quick Access**: Load saved programs instantly
3. **Organization**: Keep projects organized by name/category
4. **Portfolio**: Build a collection of F-BASIC programs

### Long-Term Benefits
1. **Learning Track**: See progress over time
2. **Community Sharing**: Export/import programs for sharing
3. **Professional Workflow**: IDE-like program management
4. **Confidence**: Experiment freely with auto-save protection

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Browser storage limits | Store code only; implement quota checking; warn user |
| IndexedDB not available | Fallback to localStorage; feature detection |
| Data loss on browser clear | Warn users; export option; backup recommendations |
| Large program libraries | Pagination; virtual scrolling; lazy loading |
| File format compatibility | Version field; migration support; backward compatible |

## Open Questions

1. **Storage Limits**: What max program size/count to enforce?
2. **Cloud Sync**: Should cloud sync be considered for future?
3. **Collaboration**: How to handle merge conflicts on import?
4. **Thumbnails**: Should we auto-generate screenshots on run?
5. **Backup**: Should we provide backup/restore to file system?

## Next Steps

1. **Storage Prototype**: Build IndexedDB wrapper and test
2. **UI Mockup**: Design library interface
3. **User Testing**: Test save/load workflow with users
4. **Import/Export Design**: Finalize file format
5. **Documentation**: Write user guide for library features

## Example Usage

```typescript
// In IDE component
import { useProgramLibrary } from '@/features/library'

const {
  programs,
  currentProgram,
  saveProgram,
  loadProgram,
  createProgram,
  deleteProgram,
  exportProgram,
  importProgram
} = useProgramLibrary()

// Save current work
await saveProgram({
  name: 'My Game',
  description: 'A simple sprite game',
  code: state.code.value
})

// Load a program
await loadProgram(programId)

// Export for sharing
const file = await exportProgram(programId)
downloadFile(file, 'my-game.fbasic')

// Import received program
const imported = await importProgram(file)
await loadProgram(imported.id)
```

---

*"Every great program begins with saving your work. The My Programs library transforms F-BASIC development from ephemeral experimentation to persistent creation—letting developers build a portfolio of work and return to ideas whenever inspiration strikes."*
