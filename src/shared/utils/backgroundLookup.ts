import { KANA_BG_ITEMS, LETTER_BG_ITEMS, NUMBER_BG_ITEMS, PICTURE_BG_ITEMS, SYMBOL_BG_ITEMS } from '@/shared/data/bg'
import type { BackgroundItem } from '@/shared/data/types'

/**
 * Combined array of all background items
 */
const ALL_BG_ITEMS: BackgroundItem[] = [
  ...LETTER_BG_ITEMS,
  ...NUMBER_BG_ITEMS,
  ...SYMBOL_BG_ITEMS,
  ...KANA_BG_ITEMS,
  ...PICTURE_BG_ITEMS,
]

/**
 * Lookup map by character code
 */
const BY_CODE = new Map<number, BackgroundItem>()

/**
 * Lookup map by character string
 */
const BY_CHAR = new Map<string, BackgroundItem>()

// Build lookup maps
ALL_BG_ITEMS.forEach(item => {
  BY_CODE.set(item.code, item)
  if (item.char) {
    BY_CHAR.set(item.char, item)
  }
  item.altChars?.forEach(alt => {
    BY_CHAR.set(alt, item)
  })
})

/**
 * Get background item by character code
 */
export function getBackgroundItemByCode(code: number): BackgroundItem | null {
  return BY_CODE.get(code) ?? null
}

/**
 * Get background item by character string
 * Supports case-insensitive matching for letters via altChars
 */
export function getBackgroundItemByChar(char: string): BackgroundItem | null {
  return BY_CHAR.get(char) ?? null
}

/**
 * Get character string from character code
 * Returns the character string associated with the code, or null if not found
 * Used by CHR$ function to map codes to characters
 */
export function getCharacterByCode(code: number): string | null {
  const bgItem = getBackgroundItemByCode(code)
  return bgItem?.char ?? null
}

/**
 * Get F-BASIC character code (0-255) for a character string
 * Returns the code for the character, or null if not in background items
 * Used when writing screen buffer so we store codes not Unicode code points
 */
export function getCodeByChar(char: string): number | null {
  const bgItem = getBackgroundItemByChar(char)
  return bgItem?.code ?? null
}
