/**
 * useBgEditorState composable
 *
 * UI state management for the BG Editor.
 * Grid data is managed by useProgramStore (program-bound).
 * This composable manages editor modes and selection state.
 */

import { computed, readonly, ref } from 'vue'

import { useProgramStore } from '@/features/ide/composables/useProgramStore'

import { BG_EDITOR_MODES, DEFAULT_BG_CHAR_CODE } from '../constants'
import type { BgCell, BgEditorMode, BgGridData, ColorPattern, GridPosition } from '../types'
import { EMPTY_CELL } from '../types'
import { cloneGrid, createEmptyGrid, getCell, isValidPosition, setCell } from './useBgGrid'

// ============================================================================
// Editor Mode State (local UI state, not program-bound)
// ============================================================================

const mode = ref<BgEditorMode>(BG_EDITOR_MODES.CHAR)
const selectedCharCode = ref<number>(DEFAULT_BG_CHAR_CODE)
const selectedColorPattern = ref<ColorPattern>(0)
const cursorPosition = ref<GridPosition>({ x: 0, y: 0 })
const copySource = ref<GridPosition | null>(null)
const moveSource = ref<GridPosition | null>(null)

// ============================================================================
// Program Store Integration
// ============================================================================

/**
 * Get the program store instance (singleton)
 */
function getProgramStore() {
  return useProgramStore()
}

/**
 * Get current grid from program store
 */
function getGrid(): BgGridData {
  return getProgramStore().bg
}

/**
 * Save modified grid back to program store
 */
function saveGrid(grid: BgGridData): void {
  getProgramStore().setBg(grid)
}

// ============================================================================
// Grid Modification Functions
// ============================================================================

/**
 * Place a cell at the specified position using current selection
 */
function placeCell(x: number, y: number): void {
  if (!isValidPosition(x, y)) return

  const grid = cloneGrid(getGrid())
  const cell: BgCell = {
    charCode: selectedCharCode.value,
    colorPattern: selectedColorPattern.value,
  }
  setCell(grid, x, y, cell)
  saveGrid(grid)
}

/**
 * Copy a cell from one position to another
 */
function copyCell(fromX: number, fromY: number, toX: number, toY: number): void {
  if (!isValidPosition(fromX, fromY) || !isValidPosition(toX, toY)) return

  const grid = cloneGrid(getGrid())
  const sourceCell = getCell(grid, fromX, fromY)
  setCell(grid, toX, toY, sourceCell)
  saveGrid(grid)
}

/**
 * Move a cell from one position to another
 * Sets source position to empty after copying
 */
function moveCell(fromX: number, fromY: number, toX: number, toY: number): void {
  if (!isValidPosition(fromX, fromY) || !isValidPosition(toX, toY)) return

  const grid = cloneGrid(getGrid())
  const sourceCell = getCell(grid, fromX, fromY)
  setCell(grid, toX, toY, sourceCell)
  setCell(grid, fromX, fromY, { ...EMPTY_CELL })
  saveGrid(grid)
}

/**
 * Clear the entire grid
 */
function clearGrid(): void {
  saveGrid(createEmptyGrid())
  copySource.value = null
  moveSource.value = null
}

// ============================================================================
// Editor Mode Functions
// ============================================================================

/**
 * Set editor mode
 */
function setMode(newMode: BgEditorMode): void {
  mode.value = newMode
  // Reset source positions when changing modes
  if (newMode !== BG_EDITOR_MODES.COPY) {
    copySource.value = null
  }
  if (newMode !== BG_EDITOR_MODES.MOVE) {
    moveSource.value = null
  }
}

/**
 * Set selected character code
 */
function setSelectedCharCode(code: number): void {
  selectedCharCode.value = Math.max(0, Math.min(255, code))
}

/**
 * Set selected color pattern
 */
function setSelectedColorPattern(pattern: ColorPattern): void {
  selectedColorPattern.value = pattern
}

/**
 * Set cursor position
 */
function setCursorPosition(x: number, y: number): void {
  if (isValidPosition(x, y)) {
    cursorPosition.value = { x, y }
  }
}

/**
 * Handle grid cell click based on current mode
 */
function handleCellClick(x: number, y: number): void {
  switch (mode.value) {
    case BG_EDITOR_MODES.SELECT:
      setCursorPosition(x, y)
      break

    case BG_EDITOR_MODES.CHAR:
      placeCell(x, y)
      break

    case BG_EDITOR_MODES.COPY:
      if (copySource.value === null) {
        // First click: set source
        copySource.value = { x, y }
      } else {
        // Second click: copy to destination
        copyCell(copySource.value.x, copySource.value.y, x, y)
        copySource.value = null
      }
      break

    case BG_EDITOR_MODES.MOVE:
      if (moveSource.value === null) {
        // First click: set source
        moveSource.value = { x, y }
      } else {
        // Second click: move to destination
        moveCell(moveSource.value.x, moveSource.value.y, x, y)
        moveSource.value = null
      }
      break
  }
}

// ============================================================================
// Composable Export
// ============================================================================

/**
 * Composable for BG Editor state management
 *
 * Grid data is bound to the current program via useProgramStore.
 * Editor mode and selection state are local UI state.
 */
export function useBgEditorState() {
  // Computed grid from program store (read-only view)
  const grid = computed(() => getProgramStore().bg)

  return {
    // Grid state (from program store)
    grid: readonly(grid),

    // Editor mode state (local UI state)
    mode: readonly(mode),
    selectedCharCode: readonly(selectedCharCode),
    selectedColorPattern: readonly(selectedColorPattern),
    cursorPosition: readonly(cursorPosition),
    copySource: readonly(copySource),
    moveSource: readonly(moveSource),

    // Actions
    setMode,
    setSelectedCharCode,
    setSelectedColorPattern,
    setCursorPosition,
    handleCellClick,
    clearGrid,
    placeCell,
    copyCell,
    moveCell,
  }
}
