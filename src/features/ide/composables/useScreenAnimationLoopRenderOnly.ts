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
import { type Ref } from 'vue'

import { MAX_SPRITES } from '@/core/animation/sharedDisplayBuffer'
import type { SharedDisplayBufferAccessor } from '@/core/animation/sharedDisplayBufferAccessor'
import { logScreen } from '@/shared/logger'

import type { KonvaScreenLayers } from './useKonvaScreenRenderer'
import { updateAnimatedSprites } from './useKonvaScreenRenderer'

/** Enable detailed animation loop tracing */
const DEBUG_ANIMATION_LOOP = true

export interface UseScreenAnimationLoopRenderOnlyOptions {
  layers: Ref<KonvaScreenLayers | Record<string, unknown>>
  frontSpriteNodes: Ref<Map<number, Konva.Image> | Map<number, unknown>>
  backSpriteNodes: Ref<Map<number, Konva.Image> | Map<number, unknown>>
  spritePalette: Ref<number> | number
  /** Accessor for reading sprite state from shared buffer (including isVisible flag) */
  sharedDisplayBufferAccessor?: SharedDisplayBufferAccessor | null
  /** After reading from shared buffer, call with positions so inspector shows live positions. */
  setMovementPositionsFromBuffer?: (positions: Map<number, { x: number; y: number }>) => void
  /** When movements are active: run pending static render at end of frame (animation first, then render) */
  getPendingStaticRender?: () => boolean
  onRunPendingStaticRender?: () => Promise<void>
  /** When sprite nodes are missing for visible movements, call to trigger render */
  onRenderNeeded?: () => void
}

/**
 * Setup render-only animation loop for MOVE command animations
 *
 * This loop:
 * - READS positions from shared buffer (written by Animation Worker)
 * - UPDATES Konva nodes for rendering
 * - Does NOT calculate positions (Animation Worker does that)
 * - Runs continuously at 60fps from component mount
 *
 * Returns cleanup function to stop the loop
 */
export function useScreenAnimationLoopRenderOnly(
  options: UseScreenAnimationLoopRenderOnlyOptions
): () => void {
  const {
    layers,
    frontSpriteNodes,
    backSpriteNodes,
    spritePalette,
    sharedDisplayBufferAccessor,
    setMovementPositionsFromBuffer,
    getPendingStaticRender,
    onRunPendingStaticRender,
    onRenderNeeded,
  } = options

  let animationFrameId: number | null = null

  /**
   * Animation loop - runs continuously at 60fps
   * Reads positions from buffer and updates Konva nodes
   * Detects missing sprite nodes and triggers render if needed
   * Detects orphaned nodes (nodes that exist but shouldn't be visible) and removes them
   */
  async function animationLoop(): Promise<void> {
    if (!sharedDisplayBufferAccessor) {
      animationFrameId = requestAnimationFrame(animationLoop)
      return
    }

    const frontNodes = frontSpriteNodes.value as Map<number, Konva.Image>
    const backNodes = backSpriteNodes.value as Map<number, Konva.Image>
    const positions = new Map<number, { x: number; y: number }>()

    // Check for orphaned nodes (nodes that exist but sprite is not visible)
    // This handles CLEAR command where AnimationWorker sets isVisible=false
    for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
      const characterType = sharedDisplayBufferAccessor.readSpriteCharacterType(actionNumber)
      if (characterType < 0) continue // No DEF MOVE - skip

      const isVisible = sharedDisplayBufferAccessor.readSpriteIsVisible(actionNumber)
      if (isVisible) continue // Visible - skip

      // Sprite exists (has DEF MOVE) but is NOT visible - this is an orphaned node
      const priority = sharedDisplayBufferAccessor.readSpritePriority(actionNumber)
      const nodeMap = priority === 0 ? frontNodes : backNodes
      const node = nodeMap.get(actionNumber)

      if (node) {
        // Orphaned node found - destroy it and remove from map
        if (DEBUG_ANIMATION_LOOP) {
          logScreen.warn('[RENDER-ONLY LOOP] Orphaned node for action', actionNumber, ', destroying')
        }
        node.destroy()
        nodeMap.delete(actionNumber)
      }
    }

    // Check for visible movements that need sprite nodes
    const visibleMovements: number[] = []
    for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
      const characterType = sharedDisplayBufferAccessor.readSpriteCharacterType(actionNumber)
      if (characterType < 0) continue // No DEF MOVE

      const isVisible = sharedDisplayBufferAccessor.readSpriteIsVisible(actionNumber)
      if (!isVisible) continue // Hidden by ERA or not started

      visibleMovements.push(actionNumber)

      // Check if sprite node exists
      const priority = sharedDisplayBufferAccessor.readSpritePriority(actionNumber)
      const nodeMap = priority === 0 ? frontNodes : backNodes
      if (!nodeMap.has(actionNumber)) {
        // Sprite node missing - trigger render to create it
        if (onRenderNeeded) {
          if (DEBUG_ANIMATION_LOOP) {
            logScreen.warn('[RENDER-ONLY LOOP] Missing sprite node for action', actionNumber, ', triggering render')
          }
          onRenderNeeded()
          break // Only trigger once per frame
        }
      }
    }

    // Read all sprite positions from shared buffer and update Konva nodes
    for (let actionNumber = 0; actionNumber < MAX_SPRITES; actionNumber++) {
      const pos = sharedDisplayBufferAccessor.readSpritePosition(actionNumber)
      if (pos) {
        positions.set(actionNumber, pos)

        const priority = sharedDisplayBufferAccessor.readSpritePriority(actionNumber)
        const spriteNode = priority === 0
          ? frontNodes.get(actionNumber)
          : backNodes.get(actionNumber)

        if (spriteNode) {
          spriteNode.x(pos.x)
          spriteNode.y(pos.y)
        }
      }
    }

    // Update animated sprite Konva nodes (frames only, positions already updated)
    await updateAnimatedSprites(
      layers.value.spriteFrontLayer as Konva.Layer | null,
      layers.value.spriteBackLayer as Konva.Layer | null,
      typeof spritePalette === 'number' ? spritePalette : spritePalette.value,
      frontNodes,
      backNodes,
      sharedDisplayBufferAccessor
    )

    // Sync positions from shared buffer to ref so inspector MOVE tab shows live positions
    if (setMovementPositionsFromBuffer) {
      setMovementPositionsFromBuffer(positions)
    }

    // Run pending static render at end of frame (animation first, then render)
    if (
      getPendingStaticRender?.() &&
      onRunPendingStaticRender
    ) {
      await onRunPendingStaticRender()
    }

    // Continue animation loop
    animationFrameId = requestAnimationFrame(animationLoop)
  }

  // Start the loop immediately
  animationFrameId = requestAnimationFrame(animationLoop)
  if (DEBUG_ANIMATION_LOOP) {
    logScreen.error('[RENDER-ONLY LOOP] Started continuous animation loop at 60fps')
  }

  // Return cleanup function
  return () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
}
