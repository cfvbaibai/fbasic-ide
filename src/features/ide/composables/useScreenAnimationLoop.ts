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
import { logScreen } from '@/shared/logger'

import type { KonvaScreenLayers } from './useKonvaScreenRenderer'
import { updateAnimatedSprites } from './useKonvaScreenRenderer'

/** Enable detailed animation loop tracing (set to true when debugging teleportation issue) */
const DEBUG_ANIMATION_LOOP = true

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

    // Cap deltaTime to prevent huge jumps when loop is paused/restarted or browser throttles
    // Max 100ms per frame (10fps minimum) prevents sprites from teleporting across screen
    // This can happen when the animation loop pauses (no active movements) and then restarts
    // with new movements, causing a large deltaTime on the second frame.
    const cappedDeltaTime = Math.min(deltaTime, 100)

    // Log teleportation-inducing conditions
    if (DEBUG_ANIMATION_LOOP && cappedDeltaTime > 30) {
      logScreen.error(
        `[SPRITE #${movement.actionNumber}] POTENTIAL TELEPORT: deltaTime=${deltaTime.toFixed(2)}ms, capped=${cappedDeltaTime.toFixed(2)}ms`,
        `| speed=${movement.definition.speed} => ${movement.speedDotsPerSecond.toFixed(2)} dots/sec`,
        `| dotsThisFrame=${(movement.speedDotsPerSecond * (cappedDeltaTime / 1000)).toFixed(2)}`
      )
    }

    // Calculate distance per frame: speedDotsPerSecond × (cappedDeltaTime / 1000)
    const dotsPerFrame = movement.speedDotsPerSecond * (cappedDeltaTime / 1000)
    const distanceThisFrame = Math.min(dotsPerFrame, movement.remainingDistance)

    // Calculate new position
    currentX += movement.directionDeltaX * distanceThisFrame
    currentY += movement.directionDeltaY * distanceThisFrame
    movement.remainingDistance -= distanceThisFrame

    // Wrap at screen boundaries (real F-BASIC behavior: sprite reappears on opposite side)
    // X: 0–255 (256 dots), Y: 0–239 (240 dots). Real machine also splits sprite when crossing edge.
    const w = SCREEN_DIMENSIONS.SPRITE.WIDTH
    const h = SCREEN_DIMENSIONS.SPRITE.HEIGHT
    const oldX = currentX
    const oldY = currentY
    currentX = ((currentX % w) + w) % w
    currentY = ((currentY % h) + h) % h

    // Log position changes when deltaTime is large
    if (DEBUG_ANIMATION_LOOP && cappedDeltaTime > 30) {
      const deltaX = currentX - oldX + (movement.directionDeltaX * distanceThisFrame)
      const deltaY = currentY - oldY + (movement.directionDeltaY * distanceThisFrame)
      logScreen.error(
        `[SPRITE #${movement.actionNumber}] POSITION JUMP: (${oldX.toFixed(1)}, ${oldY.toFixed(1)}) -> (${currentX.toFixed(1)}, ${currentY.toFixed(1)})`,
        `| delta=(${deltaX.toFixed(2)}, ${deltaY.toFixed(2)})`,
        `| directionDelta=(${movement.directionDeltaX}, ${movement.directionDeltaY})`
      )
    }

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
  let gracePeriodCounter = 0 // Frames to wait before pausing (prevents pause/restart race conditions)
  const GRACE_PERIOD_FRAMES = 5 // Wait 5 frames (~83ms at 60fps) before pausing

  async function animationLoop(timestamp: number): Promise<void> {
    if (lastFrameTime === 0) {
      if (DEBUG_ANIMATION_LOOP) {
        logScreen.warn('[ANIMATION LOOP] First frame after startLoop(): lastFrameTime was 0, setting to', timestamp)
      }
      lastFrameTime = timestamp
    }

    const deltaTime = timestamp - lastFrameTime
    lastFrameTime = timestamp

    // Check if there are active movements
    const hasActive = localMovementStates.value.some(m => m.isActive)

    // Log large deltaTime that could cause teleportation
    if (DEBUG_ANIMATION_LOOP && deltaTime > 30) {
      // Normal deltaTime is ~16.6ms at 60fps; >30ms is abnormal
      const activeMovements = localMovementStates.value.filter(m => m.isActive).map(m => `#${m.actionNumber}`)
      logScreen.error(
        '[ANIMATION LOOP] Large deltaTime detected:',
        `${deltaTime.toFixed(2)  }ms`,
        '(expected ~16.6ms at 60fps)',
        '| active movements:', activeMovements.length > 0 ? activeMovements.join(', ') : 'none',
        '| gracePeriodCounter:', gracePeriodCounter
      )
    }

    if (!hasActive) {
      // No active movements - enter grace period to prevent pause/restart race conditions
      // When ERA is immediately followed by MOVE (e.g., when hitting an enemy in shooting game),
      // the loop would pause and restart, causing large deltaTime and sprite teleportation.
      gracePeriodCounter++
      if (DEBUG_ANIMATION_LOOP && gracePeriodCounter === 1) {
        logScreen.warn('[ANIMATION LOOP] No active movements - entering grace period, frame 1/5')
      }
      if (gracePeriodCounter >= GRACE_PERIOD_FRAMES) {
        // Grace period expired - pause the loop
        if (DEBUG_ANIMATION_LOOP) {
          logScreen.error('[ANIMATION LOOP] Grace period expired - PAUSING loop (will set lastFrameTime=0 on restart)')
        }
        isPaused = true
        animationFrameId = null
        gracePeriodCounter = 0
        return
      }
      // Still in grace period - continue loop but skip position updates
    } else {
      // Active movements - reset grace period
      if (DEBUG_ANIMATION_LOOP && gracePeriodCounter > 0) {
        logScreen.warn('[ANIMATION LOOP] Active movements detected - resetting grace period from', gracePeriodCounter, 'to 0')
      }
      gracePeriodCounter = 0
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

    const activeMovements = localMovementStates.value.filter(m => m.isActive).map(m => m.actionNumber)
    if (DEBUG_ANIMATION_LOOP) {
      logScreen.error(
        '[ANIMATION LOOP] startLoop() called - isPaused:', isPaused,
        '-> setting to false, lastFrameTime:', lastFrameTime,
        '-> using performance.now() for smooth restart, active movements:', activeMovements
      )
    }
    isPaused = false
    // Use current time instead of 0 to prevent large deltaTime on first frame after restart
    // This fixes sprite teleportation when ERA is immediately followed by MOVE
    lastFrameTime = performance.now()
    animationFrameId = requestAnimationFrame(animationLoop)
  }

  /**
   * Check if we need to start the loop
   */
  function checkAndStart(): void {
    const hasActive = localMovementStates.value.some(m => m.isActive)
    if (hasActive && isPaused) {
      if (DEBUG_ANIMATION_LOOP) {
        const activeMovements = localMovementStates.value.filter(m => m.isActive).map(m => m.actionNumber)
        logScreen.warn('[ANIMATION LOOP] checkAndStart() - has active movements:', activeMovements, 'calling startLoop()')
      }
      startLoop()
    }
  }

  // Watch for active movements to start/stop the loop
  const hasActiveMovements = computed(() =>
    localMovementStates.value.some(m => m.isActive)
  )

  watch(hasActiveMovements, (active, oldActive) => {
    if (DEBUG_ANIMATION_LOOP) {
      const activeMovements = localMovementStates.value.filter(m => m.isActive).map(m => m.actionNumber)
      logScreen.warn(
        '[ANIMATION LOOP] hasActiveMovements watcher fired:',
        oldActive, '->', active,
        '| active movements:', activeMovements,
        '| isPaused:', isPaused
      )
    }
    if (active && isPaused) {
      startLoop()
    } else if (!active && !isPaused) {
      if (DEBUG_ANIMATION_LOOP) {
        logScreen.error('[ANIMATION LOOP] watcher: !active && !isPaused - cancelling RAF and pausing')
      }
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
