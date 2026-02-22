/**
 * ID Generator Utilities
 *
 * Generates unique identifiers for programs and sessions
 */

/**
 * Generate a UUID v4 compliant identifier
 * Used for program IDs that need to be globally unique
 */
export function generateProgramId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback: manual UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generate a short session identifier
 * Used for temporary programs that haven't been saved yet
 * Format: sess-XXXXXXXX (8 random hex chars)
 */
export function generateSessionId(): string {
  const randomHex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
  return `sess-${randomHex}`
}
