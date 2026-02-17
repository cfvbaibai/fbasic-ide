/**
 * useBgGrid composable
 *
 * Grid manipulation utilities for the BG Editor
 */

import { BG_GRID } from '../constants'
import type { BgCell, BgGridData } from '../types'
import { EMPTY_CELL } from '../types'

/**
 * Create an empty 28x21 grid
 */
export function createEmptyGrid(): BgGridData {
  const grid: BgGridData = []
  for (let y = 0; y < BG_GRID.ROWS; y++) {
    const row: BgCell[] = []
    for (let x = 0; x < BG_GRID.COLS; x++) {
      row.push({ ...EMPTY_CELL })
    }
    grid.push(row)
  }
  return grid
}

/**
 * Get a cell from the grid at the specified position
 * Returns EMPTY_CELL if position is invalid
 */
export function getCell(grid: BgGridData, x: number, y: number): BgCell {
  if (!isValidPosition(x, y)) {
    return { ...EMPTY_CELL }
  }
  return grid[y]?.[x] ?? { ...EMPTY_CELL }
}

/**
 * Set a cell in the grid at the specified position
 * Does nothing if position is invalid
 */
export function setCell(grid: BgGridData, x: number, y: number, cell: BgCell): void {
  if (!isValidPosition(x, y) && grid[y]) {
    return
  }
  if (grid[y]) {
    grid[y][x] = { ...cell }
  }
}

/**
 * Check if a position is valid within the grid bounds
 */
export function isValidPosition(x: number, y: number): boolean {
  return x >= 0 && x < BG_GRID.COLS && y >= 0 && y < BG_GRID.ROWS
}

/**
 * Deep clone a grid
 */
export function cloneGrid(grid: BgGridData): BgGridData {
  return grid.map(row => row.map(cell => ({ ...cell })))
}

/**
 * Composable for BG grid operations
 */
export function useBgGrid() {
  return {
    createEmptyGrid,
    getCell,
    setCell,
    isValidPosition,
    cloneGrid,
  }
}
