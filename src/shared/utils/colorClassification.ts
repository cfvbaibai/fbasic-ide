/**
 * Color classification utilities for F-BASIC sprite generation.
 * Maps RGB colors to F-BASIC color indices: black=0, white=1, red=2, blue=3
 */

/**
 * Classify an RGB color to F-BASIC color index
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Color index: 0=black, 1=white, 2=red, 3=blue
 */
export function classifyColor(r: number, g: number, b: number): number {
  // Calculate luminance for black/white detection
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Check if it's blue FIRST (before black/white check, as blue can have low luminance)
  // Blue: high blue component relative to red and green
  if (b > r * 1.3 && b > g * 1.3 && b > 80) {
    return 3 // blue
  }
  
  // Check if it's red (high red, low green and blue)
  if (r > g * 1.5 && r > b * 1.5 && r > 100) {
    return 2 // red
  }
  
  // Check if it's white (high luminance, low saturation)
  if (luminance > 0.7) {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    if (saturation < 0.3) {
      return 1 // white
    }
  }
  
  // Check if it's black (low luminance, and not blue/red)
  if (luminance < 0.3) {
    return 0 // black
  }
  
  // Default: classify by dominant color
  if (b > r && b > g && b > 50) return 3 // blue
  if (r > g && r > b && r > 50) return 2 // red
  if (luminance > 0.5) return 1 // white
  return 0 // black
}
