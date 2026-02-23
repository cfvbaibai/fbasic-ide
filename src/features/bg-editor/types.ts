/**
 * BG Editor Types
 *
 * Type definitions for the Background Graphic Editor
 */

import { DEFAULT_BG_CHAR_CODE } from './constants'

/** Color pattern (color combination selection 0-3) */
export type ColorPattern = 0 | 1 | 2 | 3

/** Single BG cell data */
export interface BgCell {
  /** Character code (0-255) */
  charCode: number
  /** Color pattern for this cell (0-3) */
  colorPattern: ColorPattern
}

/** Empty cell representation (space character) */
export const EMPTY_CELL: BgCell = {
  charCode: DEFAULT_BG_CHAR_CODE,
  colorPattern: 0,
} as const

/** Full BG grid (28 columns x 21 rows) */
export type BgGridData = BgCell[][]

/** Readonly BG grid type for rendering */
export type ReadonlyBgGridData = readonly (readonly BgCell[])[]

/** Editor mode */
export type BgEditorMode = 'SELECT' | 'COPY' | 'MOVE' | 'CHAR'

/** Category for character palette */
export type BgCharCategory = 'pictures' | 'letters' | 'numbers' | 'symbols' | 'kana'

/** Position on the grid */
export interface GridPosition {
  x: number
  y: number
}
