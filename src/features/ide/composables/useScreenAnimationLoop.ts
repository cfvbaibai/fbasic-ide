/**
 * Animation loop composable for Screen component
 * Handles movement updates and sprite rendering in animation frame loop
 */

import type Konva from 'konva'
import { computed, type Ref, watch } from 'vue'

import {
  MAX_SPRITES,
  readSpritePosition,
  writeSpriteState,
} from '@/core/animation/sharedAnimationBuffer'
import { SCREEN_DIMENSIONS } from '@/core/constants'
import type { MovementState } from '@/core/sprite/types'

import type { KonvaScreenLayers } from './useKonvaScreenRenderer'
import { updateAnimatedSprites } from './useKonvaScreenRenderer'

/**
 * Update movement positions and frame indices
 * Positions are read from and written to Konva nodes (single source of truth)
 * Returns action numbers that completed this frame (remainingDistance <= 0)
 */
function updateMovements(
  movements: MovementState[],
  deltaTime: number,
  frontSpriteNodes: Map<number, Konva.Image>,
  backSpriteNodes: Map<number, Konva.Image>
): number[] {
  const completed: number[] = []
  for (const movement of movements) {
    if (!movement.isActive || movement.remainingDistance <= 0) {
      if (movement.remainingDistance <= 0 && movement.isActive) {
        completed.push(movement.actionNumber)
      }
      movement.isActive = false
      continue
    }

    // Get current position from Konva node (single source of truth)
    const spriteNode =
      movement.definition.priority === 0
        ? frontSpriteNodes.get(movement.actionNumber)
        : backSpriteNodes.get(movement.actionNumber)

    if (!spriteNode) {
      // Node doesn't exist yet, skip this frame
      continue
    }

    // Read current position from Konva node
    let currentX = spriteNode.x()
    let currentY = spriteNode.y()

    // Calculate distance per frame: speedDotsPerSecond × (deltaTime / 1000)
    const dotsPerFrame = movement.speedDotsPerSecond * (deltaTime / 1000)
    const distanceThisFrame = Math.min(dotsPerFrame, movement.remainingDistance)

    // Calculate new position
    currentX += movement.directionDeltaX * distanceThisFrame
    currentY += movement.directionDeltaY * distanceThisFrame
    movement.remainingDistance -= distanceThisFrame

    // Wrap at screen boundaries (real F-BASIC behavior: sprite reappears on opposite side)
    // X: 0–255 (256 dots), Y: 0–239 (240 dots). Real machine also splits sprite when crossing edge.
    const w = SCREEN_DIMENSIONS.SPRITE.WIDTH
    const h = SCREEN_DIMENSIONS.SPRITE.HEIGHT
    currentX = ((currentX % w) + w) % w
    currentY = ((currentY % h) + h) % h

    // Write position back to Konva node
    spriteNode.x(currentX)
    spriteNode.y(currentY)

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
      completed.push(movement.actionNumber)
      movement.isActive = false
    }
  }
  return completed
}

export interface UseScreenAnimationLoopOptions {
  localMovementStates: Ref<MovementState[]>
  layers: Ref<KonvaScreenLayers | Record<string, unknown>>
  frontSpriteNodes: Ref<Map<number, Konva.Image> | Map<number, unknown>>
  backSpriteNodes: Ref<Map<number, Konva.Image> | Map<number, unknown>>
  spritePalette: Ref<number> | number
  /** Shared animation state view; main writes positions + isActive each frame (XPOS/YPOS, MOVE(n)). */
  sharedAnimationView?: Float64Array
  /** After writing to shared buffer, call with positions read from buffer so inspector shows live positions. */
  setMovementPositionsFromBuffer?: (positions: Map<number, { x: number; y: number }>) => void
  /** After updating movements (remainingDistance, isActive), call so inspector shows live rem. */
  onMovementStatesUpdated?: (states: MovementState[]) => void
  /** When movements are active: run pending static render at end of frame (animation first, then render) */
  getPendingStaticRender?: () => boolean
  onRunPendingStaticRender?: () => Promise<void>
  /** When animation loop stops (no active movements), call so caller can flush pending static render */
  onAnimationStopped?: () => void
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
    sharedAnimationView,
    setMovementPositionsFromBuffer,
    onMovementStatesUpdated,
    getPendingStaticRender,
    onRunPendingStaticRender,
    onAnimationStopped,
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
    updateMovements(
      localMovementStates.value,
      deltaTime,
      frontSpriteNodes.value as Map<number, Konva.Image>,
      backSpriteNodes.value as Map<number, Konva.Image>
    )

    // Sync remainingDistance and isActive to context so inspector shows live rem
    onMovementStatesUpdated?.(localMovementStates.value)

    // Update animated sprite Konva nodes (positions and frames)
    await updateAnimatedSprites(
      layers.value.spriteFrontLayer as Konva.Layer | null,
      layers.value.spriteBackLayer as Konva.Layer | null,
      localMovementStates.value,
      typeof spritePalette === 'number' ? spritePalette : spritePalette.value,
      frontSpriteNodes.value as Map<number, Konva.Image>,
      backSpriteNodes.value as Map<number, Konva.Image>
    )

    // Write positions + isActive to shared buffer for worker (XPOS/YPOS, MOVE(n))
    if (sharedAnimationView) {
      const frontNodes = frontSpriteNodes.value as Map<number, Konva.Image>
      const backNodes = backSpriteNodes.value as Map<number, Konva.Image>
      const movementByAction = new Map(localMovementStates.value.map(m => [m.actionNumber, m]))

      for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
        const movement = movementByAction.get(actionNumber)
        const spriteNode =
          movement?.definition.priority === 0
            ? frontNodes.get(actionNumber)
            : backNodes.get(actionNumber)
        const node = spriteNode ?? frontNodes.get(actionNumber) ?? backNodes.get(actionNumber)
        if (node) {
          const x = node.x()
          const y = node.y()
          const isActive = movement?.isActive ?? false
          writeSpriteState(sharedAnimationView, actionNumber, x, y, isActive)
        } else {
          writeSpriteState(sharedAnimationView, actionNumber, 0, 0, false)
        }
      }

      // Sync positions from shared buffer to ref so inspector MOVE tab shows live positions
      if (setMovementPositionsFromBuffer) {
        const positions = new Map<number, { x: number; y: number }>()
        for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
          const pos = readSpritePosition(sharedAnimationView, actionNumber)
          if (pos) positions.set(actionNumber, pos)
        }
        setMovementPositionsFromBuffer(positions)
      }
    }

    // Prioritize animation: run pending static render at end of frame (so animation step ran first)
    if (
      getPendingStaticRender?.() &&
      onRunPendingStaticRender
    ) {
      await onRunPendingStaticRender()
    }

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
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      isPaused = true
      onAnimationStopped?.()
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
