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

    // Update movements
    for (const movement of movements.value) {
      if (!movement.isActive || movement.remainingDistance <= 0) {
        movement.isActive = false
        continue
      }

      // Update position
      const dotsPerFrame = movement.speedDotsPerSecond * (deltaTime / 1000)
      const distanceThisFrame = Math.min(dotsPerFrame, movement.remainingDistance)
      movement.remainingDistance -= distanceThisFrame

      // Calculate current position from start position and distance traveled
      const distanceTraveled = movement.totalDistance - movement.remainingDistance
      let currentX = movement.startX + movement.directionDeltaX * distanceTraveled
      let currentY = movement.startY + movement.directionDeltaY * distanceTraveled

      // Clamp bounds (account for sprite size with scale)
      const spriteSize = 16 * SPRITE_SCALE
      currentX = Math.max(0, Math.min(CANVAS_WIDTH - spriteSize, currentX))
      currentY = Math.max(0, Math.min(CANVAS_HEIGHT - spriteSize, currentY))

      // Update Konva sprite node position
      const sprite = spriteRefs.value.get(movement.actionNumber)
      if (sprite) {
        sprite.x(currentX * CANVAS_SCALE)
        sprite.y(currentY * CANVAS_SCALE)
      }

      // Update frame animation
      movement.frameCounter++
      if (movement.frameCounter >= 8) {
        movement.frameCounter = 0
        movement.currentFrameIndex++
      }

      if (movement.remainingDistance <= 0) {
        movement.isActive = false
      }
    }

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
