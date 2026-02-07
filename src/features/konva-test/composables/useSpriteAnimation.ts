/**
 * Sprite animation loop composable
 * Manages the animation frame loop for sprite movements
 */

import type Konva from 'konva'
import type { Ref } from 'vue'

import type { MovementState } from '@/core/sprite/types'

import { updateSprites } from './useSpriteRendering'

const CANVAS_WIDTH = 256
const CANVAS_HEIGHT = 240
const SPRITE_SCALE = 3
const CANVAS_SCALE = 2

export interface UseSpriteAnimationOptions {
  movements: Ref<MovementState[]>
  spriteRefs: Ref<Map<number, Konva.Image>>
  spriteFrontLayer: Konva.Layer | null
}

export function useSpriteAnimation(options: UseSpriteAnimationOptions) {
  const { movements, spriteRefs, spriteFrontLayer } = options

  let animationFrameId: number | null = null
  let lastFrameTime = 0

  function animationLoop(timestamp: number): void {
    if (lastFrameTime === 0) {
      lastFrameTime = timestamp
    }

    const deltaTime = timestamp - lastFrameTime
    lastFrameTime = timestamp

    // Note: Position animation now handled by Animation Worker in main app
    // This demo page shows static sprites at center positions
    const CANVAS_SCALE = 2

    // Frame animation is handled by Animation Worker in main app
    // This demo page only shows static sprites

    // Update Konva sprites
    void updateSprites(movements.value, spriteRefs.value)
    // Only draw sprite front layer (other layers are cached and don't need redrawing)
    if (spriteFrontLayer) {
      spriteFrontLayer.draw()
    }
    // Request next frame
    animationFrameId = requestAnimationFrame(animationLoop)
  }

  function start(): void {
    if (animationFrameId === null) {
      lastFrameTime = 0
      animationFrameId = requestAnimationFrame(animationLoop)
    }
  }

  function stop(): void {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  return {
    start,
    stop,
  }
}
