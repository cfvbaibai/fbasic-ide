/**
 * useBgStorage composable
 *
 * LocalStorage persistence for the BG Editor
 */

import { STORAGE_KEY, STORAGE_VERSION } from '../constants'
import type { BgEditorStorage, BgGridData } from '../types'

/**
 * Save grid to localStorage
 */
export function saveGrid(grid: BgGridData): void {
  try {
    const storage: BgEditorStorage = {
      grid,
      version: STORAGE_VERSION,
      lastModified: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
  } catch (error) {
    console.error('Failed to save BG Editor grid:', error)
  }
}

/**
 * Load grid from localStorage
 * Returns null if no saved data or version mismatch
 */
export function loadGrid(): BgGridData | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (!json) return null

    const storage = JSON.parse(json) as BgEditorStorage

    // Version check for future migrations
    if (storage.version !== STORAGE_VERSION) {
      console.warn('BG Editor storage version mismatch, clearing old data')
      clearGridStorage()
      return null
    }

    // Validate grid dimensions
    if (
      !Array.isArray(storage.grid) ||
      storage.grid.length !== 21 ||
      storage.grid[0]?.length !== 28
    ) {
      console.warn('BG Editor grid dimensions invalid, clearing data')
      clearGridStorage()
      return null
    }

    return storage.grid
  } catch (error) {
    console.error('Failed to load BG Editor grid:', error)
    return null
  }
}

/**
 * Clear saved grid from localStorage
 */
export function clearGridStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear BG Editor storage:', error)
  }
}

/**
 * Check if saved data exists
 */
export function hasSavedGrid(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}

/**
 * Composable for BG storage operations
 */
export function useBgStorage() {
  return {
    saveGrid,
    loadGrid,
    clearGridStorage,
    hasSavedGrid,
  }
}
