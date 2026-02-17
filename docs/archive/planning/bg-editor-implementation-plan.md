# BG Editor Implementation Plan

## Overview

A BG GRAPHIC editor for creating background screens that integrate with the F-BASIC emulator via the VIEW command.

**Important:** BG Editor is NOT a standalone route. It is integrated into the IDE page as a view toggle alongside the code editor. Background data is bound to the program context (a game consists of foreground, print, and background).

## Requirements Summary

| Aspect | Decision |
|--------|----------|
| Grid Size | 28 × 21 cells |
| Data per Cell | `{ charCode: number, colorPattern: 0-3 }` |
| Features | SELECT, COPY, MOVE, CLEAR, CHAR |
| Palette | By category (Pictures, Letters, Numbers, Symbols, Kana) |
| Storage | Editor state in localStorage; VIEW loads to SharedBuffer |
| UI | Integrated into IDE as view toggle (Code / BG Editor) |

---

## Architecture

### Directory Structure

```
src/
├── features/
│   └── bg-editor/
│       ├── components/
│       │   ├── BgEditorPage.vue        # Main page component
│       │   ├── BgGrid.vue              # 28×21 grid display
│       │   ├── BgPalette.vue           # Character palette (categorized)
│       │   ├── BgToolbar.vue           # Tool selection (SELECT, COPY, etc.)
│       │   ├── BgColorPattern.vue      # Color pattern selector (0-3)
│       │   └── BgCellRenderer.vue      # Single cell rendering
│       ├── composables/
│       │   ├── useBgEditorState.ts     # Editor state management
│       │   ├── useBgStorage.ts         # LocalStorage persistence
│       │   ├── useBgGrid.ts            # Grid operations (place, copy, move)
│       │   └── useBgRenderer.ts        # Canvas/Konva rendering
│       ├── types.ts                    # Type definitions
│       ├── constants.ts                # Grid dimensions, etc.
│       └── i18n/
│           └── index.ts                # Internationalization
│
├── core/
│   └── execution/
│       └── executors/
│           └── ViewExecutor.ts         # VIEW command implementation
```

---

## Data Model

### Types (`src/features/bg-editor/types.ts`)

```typescript
/** Color pattern (color combination selection) */
export type ColorPattern = 0 | 1 | 2 | 3

/** Single BG cell data */
export interface BgCell {
  charCode: number      // 0-255
  colorPattern: ColorPattern
}

/** Empty cell representation */
export const EMPTY_CELL: BgCell = {
  charCode: 0,
  colorPattern: 0
}

/** Full BG grid (28 × 21) */
export type BgGridData = BgCell[][]

/** Editor mode */
export type BgEditorMode = 'SELECT' | 'COPY' | 'MOVE' | 'CHAR'

/** Category for character palette */
export type BgCharCategory = 'pictures' | 'letters' | 'numbers' | 'symbols' | 'kana'

/** Editor state for localStorage */
export interface BgEditorStorage {
  grid: BgGridData
  version: number
  lastModified: number
}
```

### Constants (`src/features/bg-editor/constants.ts`)

```typescript
export const BG_GRID = {
  COLS: 28,
  ROWS: 21,
  CELL_SIZE: 8,  // 8×8 pixels per cell
} as const

export const BG_EDITOR_MODES = {
  SELECT: 'SELECT',
  COPY: 'COPY',
  MOVE: 'MOVE',
  CHAR: 'CHAR',
} as const

export const STORAGE_KEY = 'fbasic-bg-editor'
export const STORAGE_VERSION = 1
```

---

## Components

### 1. BgEditorPage.vue (Main Page)

**Purpose**: Container for all BG editor components

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  [Toolbar: SELECT | COPY | MOVE | CLEAR | CHAR]         │
├─────────────────────────────────────────────────────────┤
│                                    │                    │
│                                    │  [Palette]         │
│         [28×21 Grid]               │  - Pictures        │
│                                    │  - Letters         │
│                                    │  - Numbers         │
│                                    │  - Symbols         │
│                                    │  - Kana            │
│                                    │                    │
│                                    │  [Color: 0 1 2 3]  │
└─────────────────────────────────────────────────────────┘
```

**State**:
- Current mode (SELECT, COPY, MOVE, CHAR)
- Selected character code
- Selected color pattern
- Grid data

### 2. BgGrid.vue (Grid Display)

**Purpose**: Render the 28×21 grid with cells

**Props**:
- `gridData: BgGridData`
- `cursorPosition: { x: number, y: number }`
- `copySource: { x: number, y: number } | null`

**Events**:
- `cell-click` - Cell clicked
- `cell-drag` - Cell dragged (for MOVE)
- `cursor-move` - Cursor position changed

**Rendering**: Use Canvas2D for performance (588 cells × 64 pixels each)

### 3. BgPalette.vue (Character Palette)

**Purpose**: Display available characters by category

**Props**:
- `category: BgCharCategory`
- `selectedCharCode: number`

**Events**:
- `select` - Character selected

**Implementation**:
- Use existing `PICTURE_BG_ITEMS`, `LETTER_BG_ITEMS`, etc.
- Display 8×8 tile preview for each character
- Tab-based category switching

### 4. BgToolbar.vue (Tool Selection)

**Purpose**: Mode selection and actions

**Props**:
- `mode: BgEditorMode`

**Events**:
- `mode-change` - Mode changed
- `clear` - Clear grid requested

### 5. BgColorPattern.vue (Color Pattern Selector)

**Purpose**: Select color pattern (0-3) for placement

**Props**:
- `pattern: ColorPattern`

**Events**:
- `change` - Pattern changed

---

## Composables

### 1. useBgEditorState.ts

**Purpose**: Central state management for editor

```typescript
export function useBgEditorState() {
  const grid = ref<BgGridData>(createEmptyGrid())
  const mode = ref<BgEditorMode>('SELECT')
  const selectedCharCode = ref(0)
  const selectedColorPattern = ref<ColorPattern>(0)
  const cursorPosition = ref({ x: 0, y: 0 })
  const copySource = ref<{ x: number, y: number } | null>(null)
  const moveSource = ref<{ x: number, y: number } | null>(null)

  // Actions
  function placeCell(x: number, y: number): void
  function copyCell(fromX: number, fromY: number, toX: number, toY: number): void
  function moveCell(fromX: number, fromY: number, toX: number, toY: number): void
  function clearGrid(): void
  function setCharacter(x: number, y: number, char: string): void

  return {
    grid, mode, selectedCharCode, selectedColorPattern,
    cursorPosition, copySource, moveSource,
    placeCell, copyCell, moveCell, clearGrid, setCharacter
  }
}
```

### 2. useBgStorage.ts

**Purpose**: LocalStorage persistence

```typescript
export function useBgStorage() {
  function save(grid: BgGridData): void
  function load(): BgGridData | null
  function clear(): void

  return { save, load, clear }
}
```

### 3. useBgGrid.ts

**Purpose**: Grid manipulation utilities

```typescript
export function useBgGrid() {
  function createEmptyGrid(): BgGridData
  function getCell(grid: BgGridData, x: number, y: number): BgCell
  function setCell(grid: BgGridData, x: number, y: number, cell: BgCell): void
  function isValidPosition(x: number, y: number): boolean

  return { createEmptyGrid, getCell, setCell, isValidPosition }
}
```

### 4. useBgRenderer.ts

**Purpose**: Canvas rendering for grid

```typescript
export function useBgRenderer(canvas: Ref<HTMLCanvasElement | null>) {
  function render(grid: BgGridData, cursorX: number, cursorY: number): void
  function renderCell(x: number, y: number, cell: BgCell): void

  return { render, renderCell }
}
```

---

## VIEW Command Integration

### ViewExecutor.ts

**Purpose**: Implement VIEW command to load BG data to SharedBuffer

**Location**: `src/core/execution/executors/ViewExecutor.ts`

```typescript
export class ViewExecutor {
  constructor(
    private context: ExecutionContext,
    private evaluator: ExpressionEvaluator
  ) {}

  execute(viewStmtCst: CstNode, lineNumber?: number): void {
    // 1. Load BG data from localStorage
    const bgData = loadBgFromStorage()

    // 2. Write to SharedBuffer
    const accessor = this.context.sharedBuffer.getAccessor()

    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < 28; x++) {
        const cell = bgData[y][x]
        accessor.writeScreenChar(x, y, cell.charCode)
        accessor.writeScreenPattern(x, y, cell.colorPattern)
      }
    }

    // 3. Signal change
    accessor.incrementSequence()
  }
}
```

---

## Implementation Tasks

### Phase 1: Core Infrastructure

| Task | Description | Files |
|------|-------------|-------|
| 1.1 | Create types and constants | `types.ts`, `constants.ts` |
| 1.2 | Create useBgGrid composable | `useBgGrid.ts` |
| 1.3 | Create useBgStorage composable | `useBgStorage.ts` |
| 1.4 | Create useBgEditorState composable | `useBgEditorState.ts` |

### Phase 2: Components

| Task | Description | Files |
|------|-------------|-------|
| 2.1 | Create BgToolbar component | `BgToolbar.vue` |
| 2.2 | Create BgColorPattern component | `BgColorPattern.vue` |
| 2.3 | Create BgPalette component | `BgPalette.vue` |
| 2.4 | Create BgGrid component with renderer | `BgGrid.vue`, `useBgRenderer.ts` |
| 2.5 | Create BgEditorPage main component | `BgEditorPage.vue` |

### Phase 3: Integration

| Task | Description | Files |
|------|-------------|-------|
| 3.1 | Add VIEW statement to parser | `FBasicChevrotainParser.ts` |
| 3.2 | Create ViewExecutor | `ViewExecutor.ts` |
| 3.3 | Register VIEW in StatementRouter | `StatementRouter.ts` |
| 3.4 | Add navigation/routing for BG Editor | Router config |

### Phase 4: Polish

| Task | Description |
|------|-------------|
| 4.1 | Add i18n support |
| 4.2 | Add keyboard shortcuts |
| 4.3 | Add tests |
| 4.4 | Documentation |

---

## Testing Strategy

1. **Unit Tests**:
   - Grid operations (place, copy, move)
   - Storage save/load
   - State management

2. **Integration Tests**:
   - VIEW command execution
   - SharedBuffer write operations

3. **E2E Tests**:
   - Full editor workflow
   - Persistence across sessions

---

## Notes

- **Grid rendering**: Use Canvas2D for 28×21 grid (avoid 588 individual DOM elements)
- **Character lookup**: Use existing `getCharacterByCode()` utility
- **Color rendering**: Map color pattern 0-3 to actual colors via palette system
- **CHAR mode**: When active, keyboard input places characters at cursor position
