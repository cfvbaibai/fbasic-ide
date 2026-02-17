/**
 * useBgEditorState composable
 *
 * Central state management for the BG Editor
 */

import { readonly, ref, watch } from 'vue'

import { BG_EDITOR_MODES, DEFAULT_BG_CHAR_CODE } from '../constants'
import type { BgCell, BgEditorMode, BgGridData, ColorPattern, GridPosition } from '../types'
import { EMPTY_CELL } from '../types'
import { createEmptyGrid, getCell, isValidPosition, setCell } from './useBgGrid'
import { loadGrid, saveGrid } from './useBgStorage'

// Singleton state
const grid = ref<BgGridData>(createEmptyGrid())
const mode = ref<BgEditorMode>(BG_EDITOR_MODES.CHAR)
const selectedCharCode = ref<number>(DEFAULT_BG_CHAR_CODE)
const selectedColorPattern = ref<ColorPattern>(0)
const cursorPosition = ref<GridPosition>({ x: 0, y: 0 })
const copySource = ref<GridPosition | null>(null)
const moveSource = ref<GridPosition | null>(null)
const isInitialized = ref(false)

/**
 * Initialize editor state (load from storage)
 */
function initialize(): void {
  if (isInitialized.value) return

  const savedGrid = loadGrid()
  if (savedGrid) {
    grid.value = savedGrid
  }
  isInitialized.value = true
}

/**
 * Place a cell at the specified position using current selection
 */
function placeCell(x: number, y: number): void {
  if (!isValidPosition(x, y)) return

  const cell: BgCell = {
    charCode: selectedCharCode.value,
    colorPattern: selectedColorPattern.value,
  }
  setCell(grid.value, x, y, cell)
}

/**
 * Copy a cell from one position to another
 */
function copyCell(fromX: number, fromY: number, toX: number, toY: number): void {
  if (!isValidPosition(fromX, fromY) || !isValidPosition(toX, toY)) return

  const sourceCell = getCell(grid.value, fromX, fromY)
  setCell(grid.value, toX, toY, sourceCell)
}

/**
 * Move a cell from one position to another
 * Sets source position to empty after copying
 */
function moveCell(fromX: number, fromY: number, toX: number, toY: number): void {
  if (!isValidPosition(fromX, fromY) || !isValidPosition(toX, toY)) return

  const sourceCell = getCell(grid.value, fromX, fromY)
  setCell(grid.value, toX, toY, sourceCell)
  setCell(grid.value, fromX, fromY, { ...EMPTY_CELL })
}

/**
 * Clear the entire grid
 */
function clearGrid(): void {
  grid.value = createEmptyGrid()
  copySource.value = null
  moveSource.value = null
}

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

/**
 * Export grid as BG GET/BG PUT compatible format
 */
function exportGridData(): BgGridData {
  return grid.value.map(row => row.map(cell => ({ ...cell })))
}

// Auto-save on grid changes
watch(
  grid,
  () => {
    if (isInitialized.value) {
      saveGrid(grid.value)
    }
  },
  { deep: true }
)

/**
 * Composable for BG Editor state management
 */
export function useBgEditorState() {
  // Initialize on first use
  initialize()

  return {
    // State (readonly to prevent direct mutation)
    grid: readonly(grid),
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
    exportGridData,
  }
}
