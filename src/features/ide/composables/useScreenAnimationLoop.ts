/**
 * Animation loop composable for Screen component
 * Handles movement updates and sprite rendering in animation frame loop
 */

import type Konva from 'konva'
import { computed, type Ref, watch } from 'vue'

import type { MovementState } from '@/core/sprite/types'

import type { KonvaScreenLayers } from './useKonvaScreenRenderer'
import { updateAnimatedSprites } from './useKonvaScreenRenderer'

/**
 * Update movement positions and frame indices
 */
function updateMovements(movements: MovementState[], deltaTime: number): void {
  for (const movement of movements) {
    if (!movement.isActive || movement.remainingDistance <= 0) {
      movement.isActive = false
      continue
    }

    // Calculate distance per frame: speedDotsPerSecond × (deltaTime / 1000)
    const dotsPerFrame = movement.speedDotsPerSecond * (deltaTime / 1000)
    const distanceThisFrame = Math.min(dotsPerFrame, movement.remainingDistance)

    // Update position
    movement.currentX += movement.directionDeltaX * distanceThisFrame
    movement.currentY += movement.directionDeltaY * distanceThisFrame
    movement.remainingDistance -= distanceThisFrame

    // Clamp to screen bounds
    movement.currentX = Math.max(0, Math.min(255, movement.currentX))
    movement.currentY = Math.max(0, Math.min(239, movement.currentY))

    // Update frame animation (Phase 4)
    // Frame counter increments each frame, advances sprite every 8 frames
    movement.frameCounter++
    const frameRate = 8 // Default frame rate (can be customized per sequence)
    if (movement.frameCounter >= frameRate) {
      movement.frameCounter = 0
      // Advance to next frame in sequence
      // Note: currentFrameIndex will be clamped by renderer based on sequence length
      // We increment here, and the renderer uses modulo to loop
      movement.currentFrameIndex++
    }

    // Check if movement is complete
    if (movement.remainingDistance <= 0) {
      movement.isActive = false
    }
  }
}

export interface UseScreenAnimationLoopOptions {
  localMovementStates: Ref<MovementState[]>
  layers: Ref<KonvaScreenLayers | Record<string, unknown>>
  frontSpriteNodes: Ref<Map<number, Konva.Image> | Map<number, unknown>>
  backSpriteNodes: Ref<Map<number, Konva.Image> | Map<number, unknown>>
  spritePalette: Ref<number> | number
}

/**
 * Setup animation loop for MOVE command animations ONLY
 * Returns cleanup function to stop the loop
 * The loop ONLY runs when there are active MOVE movements
 * Static rendering (PRINT, SPRITE, CGSET, COLOR, etc.) is handled separately via watchers
 */
export function useScreenAnimationLoop(
  options: UseScreenAnimationLoopOptions
): () => void {
  const {
    localMovementStates,
    layers,
    frontSpriteNodes,
    backSpriteNodes,
    spritePalette,
  } = options

  let animationFrameId: number | null = null
  let lastFrameTime = 0
  let isPaused = true // Start paused, only run when movements are active

  async function animationLoop(timestamp: number): Promise<void> {
    if (lastFrameTime === 0) {
      lastFrameTime = timestamp
    }

    const deltaTime = timestamp - lastFrameTime
    lastFrameTime = timestamp

    // Check if there are active movements
    const hasActive = localMovementStates.value.some(m => m.isActive)

    if (!hasActive) {
      // No active movements - pause the loop
      isPaused = true
      animationFrameId = null
      return
    }

    // Active movements - update positions and frames ONLY
    // This loop does NOT handle static rendering (PRINT, SPRITE, etc.)
    updateMovements(localMovementStates.value, deltaTime)

    // Update animated sprite Konva nodes (positions and frames)
    // This only updates the MOVE sprites, not static sprites
    await updateAnimatedSprites(
      layers.value.spriteFrontLayer as Konva.Layer | null,
      layers.value.spriteBackLayer as Konva.Layer | null,
      localMovementStates.value,
      typeof spritePalette === 'number' ? spritePalette : spritePalette.value,
      frontSpriteNodes.value as Map<number, Konva.Image>,
      backSpriteNodes.value as Map<number, Konva.Image>
    )

    // Continue animation loop
    animationFrameId = requestAnimationFrame(animationLoop)
  }

  /**
   * Start the animation loop
   */
  function startLoop(): void {
    if (animationFrameId !== null || !isPaused) return

    isPaused = false
    lastFrameTime = 0
    animationFrameId = requestAnimationFrame(animationLoop)
  }

  /**
   * Check if we need to start the loop
   */
  function checkAndStart(): void {
    const hasActive = localMovementStates.value.some(m => m.isActive)
    if (hasActive && isPaused) {
      startLoop()
    }
  }

  // Watch for active movements to start/stop the loop
  const hasActiveMovements = computed(() =>
    localMovementStates.value.some(m => m.isActive)
  )

  watch(hasActiveMovements, (active) => {
    if (active && isPaused) {
      startLoop()
    } else if (!active && !isPaused) {
      // Stop the loop when no active movements
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      isPaused = true
    }
  })

  // Initial check
  checkAndStart()

  // Return cleanup function
  return () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    isPaused = true
  }
}
