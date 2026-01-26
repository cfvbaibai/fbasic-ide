import type { MovementState } from '@/core/sprite/types'
import { MoveCharacterCode } from '@/shared/data/types'

const CANVAS_WIDTH = 256
const CANVAS_HEIGHT = 240
const SPRITE_SCALE = 3

// Directions for sprite placement
const directions = [
  { direction: 3, deltaX: 1, deltaY: 0, name: 'Right' },
  { direction: 7, deltaX: -1, deltaY: 0, name: 'Left' },
  { direction: 1, deltaX: 0, deltaY: -1, name: 'Up' },
  { direction: 5, deltaX: 0, deltaY: 1, name: 'Down' },
  { direction: 2, deltaX: 1, deltaY: -1, name: 'Up-right' },
  { direction: 6, deltaX: -1, deltaY: 1, name: 'Down-left' },
  { direction: 4, deltaX: 1, deltaY: 1, name: 'Down-right' },
  { direction: 8, deltaX: -1, deltaY: -1, name: 'Up-left' },
]

/**
 * Generate movements based on count and speed
 * Distributes sprites evenly across the entire canvas using a better algorithm
 */
export function generateMovements(count: number, speed: number): MovementState[] {
  const newMovements: MovementState[] = []
  const speedDotsPerSecond = 60 / speed

  // Account for sprite size when calculating available space
  const spriteSize = 16 * SPRITE_SCALE
  const margin = spriteSize / 2 // Keep sprites fully visible
  const usableWidth = CANVAS_WIDTH - spriteSize
  const usableHeight = CANVAS_HEIGHT - spriteSize

  // Use a better distribution: spread sprites across the full canvas
  // Calculate optimal grid that uses the full area
  const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT
  let cols = Math.ceil(Math.sqrt(count * aspectRatio))
  let rows = Math.ceil(count / cols)
  
  // Adjust to ensure we use the full canvas
  while (cols * rows < count) {
    if (cols <= rows) {
      cols++
    } else {
      rows++
    }
  }

  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const dirIndex = i % directions.length
    const dir = directions[dirIndex]!

    // Distribute across the FULL usable area (from margin to edge)
    // This ensures sprites are spread from one edge to the other
    const startX = margin + (col / Math.max(1, cols - 1)) * (usableWidth - margin * 2)
    const startY = margin + (row / Math.max(1, rows - 1)) * (usableHeight - margin * 2)

    // Round to integer positions and ensure within bounds
    const clampedX = Math.round(Math.max(margin, Math.min(usableWidth, startX)))
    const clampedY = Math.round(Math.max(margin, Math.min(usableHeight, startY)))

    newMovements.push({
      actionNumber: i,
      definition: {
        actionNumber: i,
        characterType: MoveCharacterCode.MARIO,
        direction: dir.direction,
        speed,
        distance: 50,
        priority: 0,
        colorCombination: i % 4,
      },
      startX: clampedX,
      startY: clampedY,
      remainingDistance: 100,
      totalDistance: 100,
      speedDotsPerSecond,
      directionDeltaX: dir.deltaX,
      directionDeltaY: dir.deltaY,
      isActive: true,
      currentFrameIndex: 0,
      frameCounter: 0,
    })
  }

  return newMovements
}
