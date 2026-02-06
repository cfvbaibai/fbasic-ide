/**
 * Animation loop composable for Screen component (Render-Only version)
 *
 * This version reads positions from the shared buffer (written by Animation Worker)
 * and only updates Konva nodes for rendering. No position calculation happens here.
 *
 * This is the TARGET architecture - single writer (Animation Worker) to shared buffer,
 * main thread is read-only for rendering.
 */

import type Konva from 'konva'
import { computed, type Ref, watch } from 'vue'

import {
  MAX_SPRITES,
  readSpritePosition,
} from '@/core/animation/sharedAnimationBuffer'
import type { MovementState } from '@/core/sprite/types'
import { logScreen } from '@/shared/logger'

import type { KonvaScreenLayers } from './useKonvaScreenRenderer'
import { updateAnimatedSprites } from './useKonvaScreenRenderer'

/** Enable detailed animation loop tracing */
const DEBUG_ANIMATION_LOOP = true

export interface UseScreenAnimationLoopRenderOnlyOptions {
  localMovementStates: Ref<MovementState[]>
  layers: Ref<KonvaScreenLayers | Record<string, unknown>>
  frontSpriteNodes: Ref<Map<number, Konva.Image> | Map<number, unknown>>
  backSpriteNodes: Ref<Map<number, Konva.Image> | Map<number, unknown>>
  spritePalette: Ref<number> | number
  /** Shared animation state view; Animation Worker writes positions + isActive here. */
  sharedAnimationView?: Float64Array
  /** After reading from shared buffer, call with positions so inspector shows live positions. */
  setMovementPositionsFromBuffer?: (positions: Map<number, { x: number; y: number }>) => void
  /** After updating movements (remainingDistance, isActive), call so inspector shows live rem. */
  onMovementStatesUpdated?: (states: MovementState[]) => void
  /** When movements are active: run pending static render at end of frame (animation first, then render) */
  getPendingStaticRender?: () => boolean
  onRunPendingStaticRender?: () => Promise<void>
  /** When animation loop stops (no active movements), call so caller can flush pending static render */
  onAnimationStopped?: () => void
  /** Feature flag: if true, uses Animation Worker (render-only). If false, uses old main thread calculation. */
  useAnimationWorker?: Ref<boolean>
}

/**
 * Setup render-only animation loop for MOVE command animations
 *
 * This loop:
 * - READS positions from shared buffer (written by Animation Worker)
 * - UPDATES Konva nodes for rendering
 * - Does NOT calculate positions (Animation Worker does that)
 *
 * Returns cleanup function to stop the loop
 */
export function useScreenAnimationLoopRenderOnly(
  options: UseScreenAnimationLoopRenderOnlyOptions
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
    useAnimationWorker: _useAnimationWorker,
  } = options

  let animationFrameId: number | null = null
  let isPaused = true // Start paused, only run when movements are active
  let gracePeriodCounter = 0 // Frames to wait before pausing (prevents pause/restart race conditions)
  const GRACE_PERIOD_FRAMES = 5 // Wait 5 frames (~83ms at 60fps) before pausing

  async function animationLoop(): Promise<void> {
    // Check if there are active movements - prioritize local state over shared buffer
    let hasActive = localMovementStates.value.some(m => m.isActive)
    if (!hasActive && sharedAnimationView) {
      // If local says no active, also check shared buffer in case it has state we don't know about
      for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
        const base = actionNumber * 3
        if (sharedAnimationView[base + 2] !== 0) {
          hasActive = true
          break
        }
      }
    }

    if (!hasActive) {
      // No active movements - enter grace period to prevent pause/restart race conditions
      gracePeriodCounter++
      if (DEBUG_ANIMATION_LOOP && gracePeriodCounter === 1) {
        logScreen.warn('[RENDER-ONLY LOOP] No active movements - entering grace period, frame 1/5')
      }
      if (gracePeriodCounter >= GRACE_PERIOD_FRAMES) {
        // Grace period expired - pause the loop
        if (DEBUG_ANIMATION_LOOP) {
          logScreen.error('[RENDER-ONLY LOOP] Grace period expired - PAUSING loop')
        }
        isPaused = true
        animationFrameId = null
        gracePeriodCounter = 0
        return
      }
      // Still in grace period - continue loop but skip render
    } else {
      // Active movements - reset grace period
      if (DEBUG_ANIMATION_LOOP && gracePeriodCounter > 0) {
        logScreen.warn('[RENDER-ONLY LOOP] Active movements detected - resetting grace period from', gracePeriodCounter, 'to 0')
      }
      gracePeriodCounter = 0
    }

    // RENDER-ONLY: Read positions from shared buffer (written by Animation Worker)
    // Update Konva nodes for rendering
    if (!sharedAnimationView) {
      logScreen.warn('[RENDER-ONLY LOOP] sharedAnimationView not available - skipping frame')
      requestAnimationFrame(animationLoop)
      return
    }

    const frontNodes = frontSpriteNodes.value as Map<number, Konva.Image>
    const backNodes = backSpriteNodes.value as Map<number, Konva.Image>
    const positions = new Map<number, { x: number; y: number }>()

    // Read all sprite positions from shared buffer
    for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
      const pos = readSpritePosition(sharedAnimationView, actionNumber)
      if (pos) {
        positions.set(actionNumber, pos)

        // DEBUG: Log positions being read
        const movement = localMovementStates.value.find(m => m.actionNumber === actionNumber)
        if (movement?.isActive) {
          console.log('[Render-Only Loop] Read position from buffer', {
            actionNumber,
            pos,
            isActive: movement.isActive,
          })
        }

        // Update Konva node position (render-only)
        const spriteNode = movement
          ? movement.definition.priority === 0
            ? frontNodes.get(actionNumber)
            : backNodes.get(actionNumber)
          : frontNodes.get(actionNumber) ?? backNodes.get(actionNumber)

        if (spriteNode && movement?.isActive) {
          spriteNode.x(pos.x)
          spriteNode.y(pos.y)
        }
      }
    }

    // Update animated sprite Konva nodes (frames only, positions already updated)
    await updateAnimatedSprites(
      layers.value.spriteFrontLayer as Konva.Layer | null,
      layers.value.spriteBackLayer as Konva.Layer | null,
      localMovementStates.value,
      typeof spritePalette === 'number' ? spritePalette : spritePalette.value,
      frontNodes,
      backNodes
    )

    // Sync positions from shared buffer to ref so inspector MOVE tab shows live positions
    if (setMovementPositionsFromBuffer) {
      setMovementPositionsFromBuffer(positions)
    }

    // Sync remainingDistance and isActive to context so inspector shows live rem
    // Note: In render-only mode, remainingDistance is managed by Animation Worker
    // We only update the local movement states based on shared buffer isActive
    if (onMovementStatesUpdated && sharedAnimationView) {
      const updatedStates = localMovementStates.value.map(movement => {
        const isActive = readSpriteIsActive(sharedAnimationView, movement.actionNumber)
        return { ...movement, isActive }
      })
      onMovementStatesUpdated(updatedStates)
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
   * Read isActive flag from shared buffer
   */
  function readSpriteIsActive(view: Float64Array, actionNumber: number): boolean {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return false
    const base = actionNumber * 3 // x, y, isActive
    return view[base + 2] !== 0
  }

  /**
   * Start the animation loop
   */
  function startLoop(): void {
    if (animationFrameId !== null || !isPaused) return

    const activeMovements = localMovementStates.value.filter(m => m.isActive).map(m => m.actionNumber)
    console.log('[Render-Only Loop] startLoop() called', {
      wasPaused: isPaused,
      activeMovements,
      totalMovements: localMovementStates.value.length,
    })
    if (DEBUG_ANIMATION_LOOP) {
      logScreen.error(
        '[RENDER-ONLY LOOP] startLoop() called - isPaused:', isPaused,
        '-> setting to false, active movements:', activeMovements
      )
    }
    isPaused = false
    animationFrameId = requestAnimationFrame(animationLoop)
    console.log('[Render-Only Loop] Loop started with animationFrameId:', animationFrameId)
  }

  /**
   * Check if we need to start the loop
   */
  function checkAndStart(): void {
    // Prioritize local state (immediate update from ANIMATION_COMMAND) over shared buffer (may lag)
    let hasActive = localMovementStates.value.some(m => m.isActive)
    if (!hasActive && sharedAnimationView) {
      // If local says no active, also check shared buffer in case it has state we don't know about
      for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
        const base = actionNumber * 3
        if (sharedAnimationView[base + 2] !== 0) {
          hasActive = true
          break
        }
      }
    }
    if (hasActive && isPaused) {
      if (DEBUG_ANIMATION_LOOP) {
        const activeMovements = localMovementStates.value.filter(m => m.isActive).map(m => m.actionNumber)
        logScreen.warn('[RENDER-ONLY LOOP] checkAndStart() - has active movements:', activeMovements, 'calling startLoop()')
      }
      startLoop()
    }
  }

  // Watch for active movements to start/stop the loop
  // Prioritize local state (immediate update from ANIMATION_COMMAND) over shared buffer (may lag)
  const hasActiveMovements = computed(() => {
    const localActive = localMovementStates.value.some(m => m.isActive)
    if (localActive) {
      // Trust local state when it says active (Animation Worker will sync buffer shortly)
      return true
    }
    // If local says no active, also check shared buffer in case it has state we don't know about
    if (sharedAnimationView) {
      for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
        const base = actionNumber * 3
        if (sharedAnimationView[base + 2] !== 0) {
          return true
        }
      }
    }
    return false
  })

  watch(hasActiveMovements, (active, oldActive) => {
    if (DEBUG_ANIMATION_LOOP) {
      const activeMovements = localMovementStates.value.filter(m => m.isActive).map(m => m.actionNumber)
      logScreen.warn(
        '[RENDER-ONLY LOOP] hasActiveMovements watcher fired:',
        oldActive, '->', active,
        '| active movements:', activeMovements,
        '| isPaused:', isPaused
      )
    }
    if (active && isPaused) {
      startLoop()
    } else if (!active && !isPaused) {
      if (DEBUG_ANIMATION_LOOP) {
        logScreen.error('[RENDER-ONLY LOOP] watcher: !active && !isPaused - cancelling RAF and pausing')
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
