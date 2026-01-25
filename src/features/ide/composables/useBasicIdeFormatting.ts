/**
 * Formatting utilities for BASIC IDE
 */

/**
 * Format a single value for display
 */
export function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return `"${value}"`
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (value === undefined || value === null) {
    return '0'
  }
  return String(value)
}

/**
 * Format array for display in Variables panel
 * Shows actual array values in a readable format
 */
export function formatArrayForDisplay(array: unknown): string {
  if (!Array.isArray(array)) {
    return 'Array'
  }

  // Check if it's a 2D array (nested arrays)
  const is2D = array.length > 0 && Array.isArray(array[0])

  if (is2D) {
    // 2D array: show matrix representation
    const rows: string[] = []
    for (let i = 0; i < array.length; i++) {
      const row = array[i]
      if (Array.isArray(row)) {
        rows.push(`[${row.map(v => formatValue(v)).join(', ')}]`)
      }
    }
    return `[${rows.join(', ')}]`
  } else {
    // 1D array: show all values
    const values = array.map(v => formatValue(v))
    return `[${values.join(', ')}]`
  }
}
