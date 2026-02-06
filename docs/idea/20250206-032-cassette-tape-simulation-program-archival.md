# Strategic Idea: Cassette Tape Simulation & Program Archival

**Date**: 2026-02-06
**Turn**: 32
**Status**: Conceptual
**Focus Area**: Historical Preservation & Retro Authenticity
**Type**: SMALL (Focused feature implementable in 1-2 weeks)

## Vision

Add **cassette tape simulation with authentic program archival** to the Family Basic IDE that enables loading/saving programs in authentic F-BASIC cassette formats, preserving the historical experience of 1980s Family Basic programming while enabling modern program sharing and archival.

## Problem Statement

### Current Program Storage Limitations

1. **No Authentic Save/Load**: Missing the historical tape experience
   - No way to save programs to "cassette tape" format
   - No tape loading simulation with authentic sounds/visuals
   - Programs exist only in browser memory (lost on refresh)
   - No connection to the historical Family Basic experience

2. **No Program Sharing**: Can't share programs with others
   - No export functionality to share code
   - No import of external programs
   - Can't save programs to local files
   - No program library or collection management

3. **Lost Historical Context**: Missing the retro authenticity
   - Modern IDE lacks cassette tape nostalgia factor
   - No simulation of tape loading times/process
   - Missing educational value of how programs were stored
   - No appreciation for the limitations of 1980s storage

4. **No Archival System**: Programs are ephemeral
   - Can't build a personal program library
   - No metadata for programs (author, date, description)
   - No version history for programs
   - No way to organize collections of programs

5. **No Authentic Format Support**: Can't work with real tapes
   - Can't read actual Family Basic cassette files
   - No support for .cas format (if it exists)
   - Can't preserve programs from the 1980s
   - No bridge between historical and modern formats

## Proposed Solution

### 1. Cassette Tape File Format

Define an authentic cassette tape format that preserves historical accuracy:

```typescript
// Cassette tape file format (.fbtap)
interface CassetteTapeFile {
  // Header
  magic: number[]           // [0x46, 0x42, 0x54, 0x41, 0x50] = "FBTAP"
  version: number           // Format version (1)

  // Metadata
  programName: string       // Program name (max 16 chars, F-BASIC charset)
  author: string            // Author name (optional)
  description: string       // Program description (optional)
  createdAt: string         // ISO 8601 date
  savedAt: string           // ISO 8601 date

  // Program data
  programData: string       // F-BASIC source code
  programSize: number       // Size in bytes

  // Tape simulation data
  loadingTime: number       // Simulated loading time (seconds)
  tapePosition: number      // Simulated tape position

  // Checksum
  checksum: number          // CRC32 of program data
}

// Binary cassette format for authentic experience
interface BinaryCassetteHeader {
  magic: [0x46, 0x42, 0x43, 0x41, 0x53]  // "FBCAS"
  leaderLength: number                   // Leader tone length
  programNameLength: number              // Program name bytes
  programDataLength: number              // Program bytes
  checksum: number                       // Simple checksum
}
```

**Why This Format:**
- Preserves historical authenticity (leader tone, binary blocks)
- Includes modern metadata (author, description, dates)
- Enables program sharing and archival
- Future-proof with version field
- Self-contained with checksums

### 2. Tape Loading/Loading Simulation

Authentic tape loading experience with sounds and visuals:

```vue
<template>
  <div class="cassette-loading-screen">
    <!-- Cassette Tape Visualization -->
    <div class="cassette-tape">
      <div class="cassette-shell">
        <div class="cassette-label">
          <span class="program-name">{{ tapeFile.programName }}</span>
          <span class="program-size">{{ tapeFile.programSize }} bytes</span>
        </div>
        <div class="cassette-wheels">
          <div class="wheel left" :class="{ spinning: isLoading }">
            <div class="wheel-spokes"></div>
          </div>
          <div class="wheel right" :class="{ spinning: isLoading }">
            <div class="wheel-spokes"></div>
          </div>
        </div>
        <div class="cassette-window">
          <!-- Tape tape visual -->
          <div class="tape-tape" :style="{ width: tapeProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Loading Progress -->
    <div class="loading-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
      </div>
      <div class="loading-status">{{ loadingStatus }}</div>
    </div>

    <!-- Authentic Tape Audio (optional) -->
    <button v-if="!audioEnabled" @click="enableAudio" class="enable-audio">
      Enable Tape Sounds
    </button>
  </div>
</template>

<script setup lang="ts">
const isLoading = ref(true)
const loadingProgress = ref(0)
const tapeProgress = ref(0)
const loadingStatus = ref('Searching for program...')
const audioEnabled = ref(false)

// Simulate authentic tape loading
async function loadFromTape(tapeFile: CassetteTapeFile) {
  const totalTime = tapeFile.loadingTime || 5 // seconds
  const steps = [
    { progress: 10, status: 'Searching for leader tone...', time: 0.2 * totalTime },
    { progress: 20, status: 'Found leader tone...', time: 0.3 * totalTime },
    { progress: 40, status: 'Reading program header...', time: 0.2 * totalTime },
    { progress: 60, status: 'Loading program data...', time: 0.5 * totalTime },
    { progress: 80, status: 'Verifying checksum...', time: 0.1 * totalTime },
    { progress: 100, status: 'Load complete!', time: 0 }
  ]

  for (const step of steps) {
    await simulateDelay(step.time)
    loadingProgress.value = step.progress
    loadingStatus.value = step.status
    tapeProgress.value = step.progress

    // Play tape sound if enabled
    if (audioEnabled.value) {
      playTapeSound(step.progress)
    }
  }

  isLoading.value = false
  return tapeFile.programData
}

// Authentic tape loading sounds using Web Audio API
function playTapeSound(progress: number) {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()

  // Simulate cassette tape motor hum + data tones
  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(1200, audioContext.currentTime) // Leader tone
  oscillator.frequency.exponentialRampToValueAtTime(
    2400,
    audioContext.currentTime + 0.1
  )

  oscillator.connect(audioContext.destination)
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.1)
}
</script>

<style scoped>
.cassette-loading-screen {
  /* Authentic 1980s cassette styling */
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 4px solid #e94560;
  border-radius: 16px;
  padding: 2rem;
}

.cassette-tape {
  /* Authentic cassette tape visual */
  width: 300px;
  height: 200px;
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.wheel.spinning .wheel-spokes {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

### 3. Tape Library Management

Personal program library with organization and search:

```typescript
// Tape library store
interface TapeLibrary {
  tapes: CassetteTapeFile[]
  collections: TapeCollection[]
  recentTapes: string[]
  favorites: string[]
}

interface TapeCollection {
  id: string
  name: string
  description: string
  tapeIds: string[]
  createdAt: string
}

// Library composable
export function useTapeLibrary() {
  const library = ref<TapeLibrary>({
    tapes: [],
    collections: [],
    recentTapes: [],
    favorites: []
  })

  // Load library from localStorage
  function loadLibrary(): void {
    const saved = localStorage.getItem('fbasic-tape-library')
    if (saved) {
      library.value = JSON.parse(saved)
    }
  }

  // Save tape to library
  function saveTape(tape: CassetteTapeFile): void {
    library.value.tapes.push(tape)
    library.value.recentTapes.unshift(tape.programName)
    persistLibrary()
  }

  // Load tape from library
  function loadTape(tapeId: string): CassetteTapeFile | undefined {
    const tape = library.value.tapes.find(t => t.programName === tapeId)
    if (tape) {
      library.value.recentTapes = [
        tapeId,
        ...library.value.recentTapes.filter(id => id !== tapeId)
      ]
      persistLibrary()
    }
    return tape
  }

  // Search tapes
  function searchTapes(query: string): CassetteTapeFile[] {
    const q = query.toLowerCase()
    return library.value.tapes.filter(tape =>
      tape.programName.toLowerCase().includes(q) ||
      tape.description?.toLowerCase().includes(q) ||
      tape.author?.toLowerCase().includes(q)
    )
  }

  // Create collection
  function createCollection(name: string, description: string): string {
    const id = crypto.randomUUID()
    library.value.collections.push({
      id,
      name,
      description,
      tapeIds: [],
      createdAt: new Date().toISOString()
    })
    persistLibrary()
    return id
  }

  // Add tape to collection
  function addToCollection(collectionId: string, tapeId: string): void {
    const collection = library.value.collections.find(c => c.id === collectionId)
    if (collection && !collection.tapeIds.includes(tapeId)) {
      collection.tapeIds.push(tapeId)
      persistLibrary()
    }
  }

  // Export tape to file
  function exportTape(tape: CassetteTapeFile): void {
    const blob = new Blob([JSON.stringify(tape, null, 2)], {
      type: 'application/x-fbasic-tape'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tape.programName}.fbtap`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import tape from file
  async function importTape(file: File): Promise<CassetteTapeFile> {
    const text = await file.text()
    const tape = JSON.parse(text) as CassetteTapeFile

    // Validate tape format
    if (!validateTape(tape)) {
      throw new Error('Invalid tape format')
    }

    saveTape(tape)
    return tape
  }

  function persistLibrary(): void {
    localStorage.setItem('fbasic-tape-library', JSON.stringify(library.value))
  }

  return {
    library,
    loadLibrary,
    saveTape,
    loadTape,
    searchTapes,
    createCollection,
    addToCollection,
    exportTape,
    importTape
  }
}
```

### 4. Tape Library UI Components

```vue
<!-- TapeLibrary.vue -->
<template>
  <div class="tape-library">
    <!-- Library Header -->
    <div class="library-header">
      <h2>Cassette Library</h2>
      <div class="library-actions">
        <button @click="showImportModal = true" class="import-button">
          Import Tape
        </button>
        <button @click="createNewCollection" class="create-collection-button">
          New Collection
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="library-search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search tapes..."
        class="search-input"
      />
    </div>

    <!-- Navigation Tabs -->
    <div class="library-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Tape Grid -->
    <div class="tape-grid">
      <div
        v-for="tape in filteredTapes"
        :key="tape.programName"
        class="tape-card"
      >
        <div class="tape-cover">
          <div class="cassette-icon"></div>
          <span class="tape-name">{{ tape.programName }}</span>
        </div>
        <div class="tape-info">
          <div class="tape-meta">
            <span class="tape-author">{{ tape.author || 'Unknown' }}</span>
            <span class="tape-date">{{ formatDate(tape.savedAt) }}</span>
          </div>
          <p class="tape-description">{{ tape.description || 'No description' }}</p>
          <div class="tape-stats">
            <span class="tape-size">{{ tape.programSize }} bytes</span>
            <span class="tape-loading-time">{{ tape.loadingTime }}s load</span>
          </div>
        </div>
        <div class="tape-actions">
          <button @click="loadTape(tape)" class="load-button">
            Load
          </button>
          <button @click="exportTape(tape)" class="export-button">
            Export
          </button>
          <button @click="showTapeDetails(tape)" class="details-button">
            Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 5. Integration with IDE

Add tape controls to the IDE toolbar:

```vue
<!-- TapeControls.vue -->
<template>
  <div class="tape-controls">
    <!-- Tape Status -->
    <div class="tape-status">
      <span class="tape-indicator" :class="{ active: hasTape }">
        Cassette: {{ currentTape?.programName || 'No tape' }}
      </span>
    </div>

    <!-- Tape Actions -->
    <div class="tape-actions">
      <button @click="saveToTape" :disabled="!hasProgram" title="Save to tape">
        <span class="icon">▶</span> REC
      </button>
      <button @click="showTapeLibrary" title="Tape library">
        <span class="icon">▣</span> LIB
      </button>
      <button @click="exportTape" :disabled="!hasTape" title="Export tape">
        <span class="icon">⬇</span> EXP
      </button>
      <button @click="importTape" title="Import tape">
        <span class="icon">⬆</span> IMP
      </button>
    </div>
  </div>
</template>
```

## Implementation Priority

### Phase 1 (Core Format & Storage - Week 1)

**Goal**: Basic tape format and local storage

1. **Tape Format Definition**
   - Define `CassetteTapeFile` interface
   - Create tape format validator
   - Implement JSON serialization
   - Add checksum verification

2. **Save/Load Functionality**
   - Implement `saveToTape()` in IDE
   - Implement `loadFromTape()` in IDE
   - Add localStorage tape library
   - Create tape import/export dialogs

3. **Basic UI Components**
   - Add tape controls to IDE toolbar
   - Create import/export file dialogs
   - Add tape library panel
   - Implement basic tape listing

**Files to Create:**
- `src/core/tape/tapeFormat.ts` - Tape format definitions and validation
- `src/core/tape/tapeLibrary.ts` - Tape library storage and management
- `src/features/tape/components/TapeControls.vue` - Tape toolbar controls
- `src/features/tape/components/TapeLibrary.vue` - Tape library panel
- `src/features/tape/components/ImportTapeDialog.vue` - Import dialog
- `src/features/tape/components/ExportTapeDialog.vue` - Export dialog
- `src/features/tape/composables/useTapeLibrary.ts` - Tape library composable

**Files to Modify:**
- `src/features/ide/components/IdePage.vue` - Add tape controls
- `src/features/ide/composables/useBasicIdeState.ts` - Add tape state
- `src/shared/i18n/en.ts` - Add tape-related translations

### Phase 2 (Enhanced Features - Week 2)

**Goal**: Collections, search, and polish

1. **Tape Collections**
   - Implement collection creation/management
   - Add tapes to collections
   - Collection-based navigation
   - Collection export/import

2. **Advanced Features**
   - Tape search and filtering
   - Recent tapes list
   - Favorite tapes
   - Tape metadata editor

3. **Visual Polish**
   - Tape loading animation
   - Cassette tape visual design
   - Authentic retro styling
   - Sound effects (optional)

4. **Additional Features**
   - Tape duplication
   - Tape deletion with confirmation
   - Tape sharing via URL (base64 encoded)
   - Version history tracking

**Files to Create:**
- `src/features/tape/components/TapeCollections.vue` - Collection management
- `src/features/tape/components/TapeCard.vue` - Individual tape card
- `src/features/tape/components/CassetteTapeVisual.vue` - Cassette visualization
- `src/features/tape/utils/tapeShareUrl.ts` - URL-based tape sharing

## Technical Architecture

### Tape Storage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Storage                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   localStorage                            │  │
│  │                                                           │  │
│  │  fbasic-tape-library = {                                  │  │
│  │    tapes: [                                               │  │
│  │      { programName, author, description, programData... } │  │
│  │    ],                                                     │  │
│  │    collections: [...],                                    │  │
│  │    recentTapes: [...],                                    │  │
│  │    favorites: [...]                                       │  │
│  │  }                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   IndexedDB (optional)                    │  │
│  │                                                           │  │
│  │  Store: CassetteTapes                                     │  │
│  │  - Large tape files                                       │  │
│  │  - Binary tape images                                     │  │
│  │  - Tape thumbnails                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      File System Interface                       │
│                                                                   │
│  Export (.fbtap) ← JSON CassetteTapeFile                        │
│  Import (.fbtap) → Parse & Validate → Store                      │
│                                                                   │
│  Future formats:                                                 │
│  - .cas (authentic binary cassette)                             │
│  - .txt (plain text F-BASIC source)                             │
│  - .bas (numbered BASIC format)                                 │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐     Save      ┌──────────────┐     Store      ┌──────────────┐
│     IDE      │ ──────────►  │ TapeLibrary  │ ──────────►  │ localStorage  │
│  (Editor)    │              │              │               │   (Library)   │
└──────────────┘              └──────────────┘               └──────────────┘
       │                                                              │
       │ Load                                                          │ Read
       ▼                                                              │
┌──────────────┐                                              ┌──────────────┐
│ TapeLibrary  │ ◄──────────────────────────────────────────── │ localStorage  │
└──────────────┘                                               └──────────────┘
       │
       │ Parse & Display
       ▼
┌──────────────┐
│  Tape UI     │ ◄─────── User interacts with tape library
└──────────────┘
```

## Dependencies & Tools

**No New Dependencies Required:**

All functionality can be built with:
- Browser `localStorage` for tape library storage
- Browser `Blob` and `URL` APIs for file export/import
- Browser `FileReader` API for file import
- Existing Vue 3 composition API
- Existing i18n infrastructure

**Optional Enhancements:**
- `idb` (IndexedDB wrapper) - For large tape libraries
- Web Audio API - For authentic tape sounds
- `file-saver` - Alternative file saving approach

## Success Metrics

### User Engagement
- **Tape Creation**: # of tapes created per session
- **Tape Loading**: # of tapes loaded from library
- **Export/Import**: # of tapes shared via files
- **Library Size**: Average tapes per user library

### Quality
- **Format Validity**: % of tapes that pass validation
- **Import Success**: % of successful tape imports
- **Load Time**: Time to load tape from library
- **Storage Efficiency**: Bytes used per tape in localStorage

### Retro Experience
- **Authenticity**: User feedback on retro feel
- **Audio Usage**: % of users who enable tape sounds
- **Loading Tolerance**: User patience with loading simulation
- **Nostalgia Factor**: User sentiment on cassette experience

## Benefits

### Immediate Benefits
1. **Program Preservation**: Save programs permanently in browser
2. **Program Sharing**: Export/import programs as files
3. **Personal Library**: Build a collection of programs
4. **Retro Authenticity**: Experience cassette tape nostalgia

### Long-Term Benefits
1. **Historical Education**: Learn about 1980s storage methods
2. **Program Archival**: Preserve programs for posterity
3. **Community Building**: Share programs with others
4. **Authentic Experience**: Full retro computing simulation

### Unique Value
1. **Differentiation**: No other F-BASIC emulator has this
2. **Historical Connection**: Bridge between past and present
3. **Educational Value**: Teach about storage technology evolution
4. **Nostalgia Marketing**: Appeal to retro computing enthusiasts

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| localStorage quota exceeded (5-10MB) | Use IndexedDB for large libraries; compress tape data |
| Loading simulation frustrates users | Make loading skippable; add "fast load" option |
| Tape format becomes obsolete | Keep format simple JSON; future-proof with version field |
| Browser compatibility issues | Use standard browser APIs; fallback to basic storage |
| Users don't understand cassette metaphor | Add explanatory tooltips; modern alternative UI |

## Open Questions

1. **Loading Time**: How long should tape loading simulation be? (5-30 seconds)
2. **Audio**: Should tape sounds be opt-in or default off? (opt-in due to autoplay)
3. **Storage Limit**: What's the max tapes per library? (100-1000)
4. **Binary Format**: Should we support authentic binary .cas files? (future enhancement)
5. **Cloud Storage**: Should tapes sync to cloud? (future enhancement)

## Next Steps

1. **Prototype**: Create basic tape format and save/load
2. **UI Mockup**: Design tape library and controls UI
3. **Format Spec**: Finalize tape file format specification
4. **Audio Sample**: Create or find authentic cassette loading sounds
5. **Testing**: Test localStorage limits and import/export
6. **Documentation**: Write user guide for tape features

## Implementation Details

### Acceptance Criteria

**Phase 1 (Week 1):**
- [ ] CassetteTapeFile interface defined
- [ ] Tape format validator implemented
- [ ] Save to tape functionality works
- [ ] Load from tape functionality works
- [ ] Tape import dialog shows file picker
- [ ] Tape export creates .fbtap file
- [ ] localStorage tape library persists
- [ ] Tape library panel displays tapes
- [ ] Tape controls added to IDE toolbar

**Phase 2 (Week 2):**
- [ ] Tape collections can be created
- [ ] Tapes can be added to collections
- [ ] Tape search and filtering works
- [ ] Recent tapes list updates
- [ ] Favorite tapes can be marked
- [ ] Tape loading animation plays
- [ ] Cassette visual displays correctly
- [ ] Tape metadata can be edited
- [ ] Tape sharing via URL works

### Specific Code Changes

**Tape Format Implementation:**

```typescript
// src/core/tape/tapeFormat.ts
export const FBTAP_MAGIC = [0x46, 0x42, 0x54, 0x41, 0x50] // "FBTAP"
export const FBTAP_VERSION = 1

export interface CassetteTapeFile {
  magic: number[]
  version: number
  programName: string
  author?: string
  description?: string
  createdAt: string
  savedAt: string
  programData: string
  programSize: number
  loadingTime: number
  tapePosition: number
  checksum: number
}

export function createTapeFile(
  programName: string,
  programData: string,
  metadata?: Partial<CassetteTapeFile>
): CassetteTapeFile {
  const programSize = new Blob([programData]).size
  const checksum = calculateChecksum(programData)

  return {
    magic: FBTAP_MAGIC,
    version: FBTAP_VERSION,
    programName: programName.slice(0, 16),
    createdAt: metadata?.createdAt || new Date().toISOString(),
    savedAt: new Date().toISOString(),
    programData,
    programSize,
    loadingTime: Math.max(3, Math.floor(programSize / 100)), // 3s minimum
    tapePosition: 0,
    checksum,
    ...metadata
  }
}

export function validateTapeFile(tape: unknown): tape is CassetteTapeFile {
  if (typeof tape !== 'object' || tape === null) return false

  const t = tape as Partial<CassetteTapeFile>

  // Check magic bytes
  if (!Array.isArray(t.magic) || !t.magic.every((b, i) => b === FBTAP_MAGIC[i])) {
    return false
  }

  // Check version
  if (t.version !== FBTAP_VERSION) return false

  // Check required fields
  if (typeof t.programName !== 'string' || t.programName.length === 0) return false
  if (typeof t.programData !== 'string') return false
  if (typeof t.checksum !== 'number') return false

  // Verify checksum
  const calculatedChecksum = calculateChecksum(t.programData)
  if (calculatedChecksum !== t.checksum) return false

  return true
}

function calculateChecksum(data: string): number {
  let checksum = 0
  for (let i = 0; i < data.length; i++) {
    checksum = ((checksum << 5) - checksum) + data.charCodeAt(i)
    checksum |= 0 // Convert to 32-bit integer
  }
  return checksum >>> 0 // Ensure unsigned
}

export function estimateLoadingTime(programSize: number): number {
  // Authentic 1980s cassette: ~100 bytes/second
  // Modern simulation: ~1000 bytes/second (10x faster but still feels slow)
  const BYTES_PER_SECOND = 1000
  return Math.max(3, Math.ceil(programSize / BYTES_PER_SECOND))
}
```

**Tape Library Implementation:**

```typescript
// src/core/tape/tapeLibrary.ts
import type { CassetteTapeFile } from './tapeFormat'

const STORAGE_KEY = 'fbasic-tape-library'

export interface TapeLibrary {
  tapes: CassetteTapeFile[]
  collections: TapeCollection[]
  recentTapes: string[]
  favorites: string[]
}

export interface TapeCollection {
  id: string
  name: string
  description: string
  tapeIds: string[]
  createdAt: string
}

export class TapeLibraryManager {
  private library: TapeLibrary = {
    tapes: [],
    collections: [],
    recentTapes: [],
    favorites: []
  }

  constructor() {
    this.load()
  }

  load(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        this.library = JSON.parse(data)
      }
    } catch (error) {
      console.error('Failed to load tape library:', error)
    }
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.library))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Tape library is full. Delete some tapes or export them.')
      }
      console.error('Failed to save tape library:', error)
    }
  }

  addTape(tape: CassetteTapeFile): void {
    // Check for duplicate names
    const existingIndex = this.library.tapes.findIndex(
      t => t.programName === tape.programName
    )

    if (existingIndex >= 0) {
      // Replace existing tape
      this.library.tapes[existingIndex] = tape
    } else {
      // Add new tape
      this.library.tapes.push(tape)
    }

    // Update recent
    this.library.recentTapes = [
      tape.programName,
      ...this.library.recentTapes.filter(n => n !== tape.programName)
    ].slice(0, 20) // Keep last 20

    this.save()
  }

  getTape(programName: string): CassetteTapeFile | undefined {
    return this.library.tapes.find(t => t.programName === programName)
  }

  getAllTapes(): CassetteTapeFile[] {
    return [...this.library.tapes]
  }

  searchTapes(query: string): CassetteTapeFile[] {
    const q = query.toLowerCase()
    return this.library.tapes.filter(tape =>
      tape.programName.toLowerCase().includes(q) ||
      tape.description?.toLowerCase().includes(q) ||
      tape.author?.toLowerCase().includes(q)
    )
  }

  deleteTape(programName: string): boolean {
    const index = this.library.tapes.findIndex(t => t.programName === programName)
    if (index >= 0) {
      this.library.tapes.splice(index, 1)
      this.library.recentTapes = this.library.recentTapes.filter(n => n !== programName)
      this.library.favorites = this.library.favorites.filter(n => n !== programName)
      this.save()
      return true
    }
    return false
  }

  toggleFavorite(programName: string): void {
    const index = this.library.favorites.indexOf(programName)
    if (index >= 0) {
      this.library.favorites.splice(index, 1)
    } else {
      this.library.favorites.push(programName)
    }
    this.save()
  }

  isFavorite(programName: string): boolean {
    return this.library.favorites.includes(programName)
  }

  getRecentTapes(): CassetteTapeFile[] {
    return this.library.recentTapes
      .map(name => this.getTape(name))
      .filter((t): t is CassetteTapeFile => t !== undefined)
  }

  getFavoriteTapes(): CassetteTapeFile[] {
    return this.library.favorites
      .map(name => this.getTape(name))
      .filter((t): t is CassetteTapeFile => t !== undefined)
  }

  createCollection(name: string, description: string): TapeCollection {
    const collection: TapeCollection = {
      id: crypto.randomUUID(),
      name,
      description,
      tapeIds: [],
      createdAt: new Date().toISOString()
    }
    this.library.collections.push(collection)
    this.save()
    return collection
  }

  addToCollection(collectionId: string, programName: string): boolean {
    const collection = this.library.collections.find(c => c.id === collectionId)
    if (!collection) return false

    if (!collection.tapeIds.includes(programName)) {
      collection.tapeIds.push(programName)
      this.save()
      return true
    }
    return false
  }

  getCollections(): TapeCollection[] {
    return [...this.library.collections]
  }

  getCollectionTapes(collectionId: string): CassetteTapeFile[] {
    const collection = this.library.collections.find(c => c.id === collectionId)
    if (!collection) return []

    return collection.tapeIds
      .map(name => this.getTape(name))
      .filter((t): t is CassetteTapeFile => t !== undefined)
  }
}
```

**IDE Integration:**

```typescript
// src/features/ide/composables/useTapeControls.ts
import { ref } from 'vue'
import { useTapeLibrary } from './useTapeLibrary'
import { createTapeFile } from '@/core/tape/tapeFormat'

export function useTapeControls() {
  const { tapeLibrary } = useTapeLibrary()
  const currentTape = ref<CassetteTapeFile | null>(null)
  const isSaving = ref(false)
  const isLoading = ref(false)

  async function saveToTape(programName: string, programData: string): Promise<void> {
    isSaving.value = true

    try {
      // Create tape file
      const tape = createTapeFile(programName, programData, {
        author: 'Anonymous', // TODO: Get from user settings
        description: '' // TODO: Prompt user for description
      })

      // Save to library
      tapeLibrary.addTape(tape)

      // Set as current tape
      currentTape.value = tape
    } finally {
      isSaving.value = false
    }
  }

  async function loadFromTape(programName: string): Promise<string | null> {
    isLoading.value = true

    try {
      const tape = tapeLibrary.getTape(programName)
      if (!tape) return null

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, tape.loadingTime * 100))

      currentTape.value = tape
      return tape.programData
    } finally {
      isLoading.value = false
    }
  }

  function exportTape(tape: CassetteTapeFile): void {
    const blob = new Blob([JSON.stringify(tape, null, 2)], {
      type: 'application/x-fbasic-tape'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tape.programName}.fbtap`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function importTape(file: File): Promise<CassetteTapeFile> {
    const text = await file.text()
    const tape = JSON.parse(text) as unknown

    if (!validateTapeFile(tape)) {
      throw new Error('Invalid tape file format')
    }

    tapeLibrary.addTape(tape)
    return tape
  }

  return {
    currentTape,
    isSaving,
    isLoading,
    saveToTape,
    loadFromTape,
    exportTape,
    importTape
  }
}
```

---

*"The best way to preserve computing history is to experience it authentically. Cassette tapes were the soul of 1980s programming—let's bring that experience to the web while enabling modern program sharing and archival."*
