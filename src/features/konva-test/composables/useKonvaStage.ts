/**
 * Konva stage initialization composable
 * Manages Konva layers and sprite initialization
 */

import Konva from 'konva'
import type { Ref } from 'vue'

import type { MovementState } from '@/core/sprite/types'
import type { VueKonvaStageInstance } from '@/types/vue-konva'

import { createBackgroundItemKonvaImages } from './useBackgroundItems'
import { addRandomBackgroundItem } from './useRandomBackground'
import { clearSpriteCache, createKonvaImage } from './useSpriteRendering'

const BG_COLS = 28
const BG_ROWS = 24
const CELL_SIZE = 8
const BG_OFFSET_X = 2 * CELL_SIZE
const BG_OFFSET_Y = 3 * CELL_SIZE

export interface UseKonvaStageOptions {
  stageRef: Readonly<Ref<VueKonvaStageInstance | null>>
  movements: Ref<MovementState[]>
  spriteRefs: Ref<Map<number, Konva.Image>>
  backgroundItemRefs: Ref<Konva.Image[]>
  randomBgItemRefs: Ref<Array<Konva.Image | Konva.Node>>
  showBackgroundItems: Ref<boolean>
  randomBgChange: Ref<boolean>
}

export function useKonvaStage(options: UseKonvaStageOptions) {
  const {
    stageRef,
    movements,
    spriteRefs,
    backgroundItemRefs,
    randomBgItemRefs,
    showBackgroundItems,
    randomBgChange,
  } = options

  let spriteBackLayer: Konva.Layer | null = null
  let backgroundLayer: Konva.Layer | null = null
  let spriteFrontLayer: Konva.Layer | null = null
  let randomBgIntervalId: number | null = null

  function toggleRandomBgChange(enabled: boolean): void {
    if (randomBgIntervalId !== null) {
      clearInterval(randomBgIntervalId)
      randomBgIntervalId = null
    }

    if (enabled && showBackgroundItems.value) {
      if (!backgroundLayer) return
      backgroundLayer.clearCache()

      const addItem = () => {
        if (!backgroundLayer || !showBackgroundItems.value) return
        void addRandomBackgroundItem(
          backgroundLayer,
          BG_COLS,
          BG_ROWS,
          randomBgItemRefs.value
        )
      }

      void addItem()
      randomBgIntervalId = window.setInterval(addItem, 1000 + Math.random() * 1000)
    } else if (!enabled && backgroundLayer) {
      backgroundLayer.cache()
      backgroundLayer.draw()
    }
  }

  async function initializeSprites(): Promise<void> {
    if (!stageRef.value) return

    const stageNode = stageRef.value?.getNode() ?? stageRef.value?.getStage?.() ?? null
    if (!stageNode) {
      console.error('Failed to get Konva stage node')
      return
    }

    const layers = stageNode.getLayers()
    if (layers.length === 0) {
      console.error('No layers found in stage')
      return
    }

    // Create or reset sprite back layer
    if (!spriteBackLayer) {
      spriteBackLayer = new Konva.Layer()
      stageNode.add(spriteBackLayer)
    } else {
      spriteBackLayer.destroyChildren()
    }

    // Create or reset background layer
    if (!backgroundLayer) {
      backgroundLayer = new Konva.Layer()
      stageNode.add(backgroundLayer)
    } else {
      backgroundItemRefs.value.forEach(item => item.destroy())
      backgroundItemRefs.value = []
      randomBgItemRefs.value.forEach(item => item.destroy())
      randomBgItemRefs.value = []
      backgroundLayer.destroyChildren()
    }

    // Create or reset sprite front layer
    if (!spriteFrontLayer) {
      spriteFrontLayer = new Konva.Layer()
      stageNode.add(spriteFrontLayer)
    } else {
      spriteRefs.value.forEach(sprite => sprite.destroy())
      spriteRefs.value.clear()
      spriteFrontLayer.destroyChildren()
    }

    clearSpriteCache()

    // Create background items if enabled
    if (showBackgroundItems.value) {
      const bgImages = await createBackgroundItemKonvaImages(true, BG_OFFSET_X, BG_OFFSET_Y, BG_COLS, BG_ROWS)
      for (const bgImage of bgImages) {
        backgroundLayer.add(bgImage)
        backgroundItemRefs.value.push(bgImage)
      }
      if (!randomBgChange.value) {
        backgroundLayer.cache()
      } else {
        backgroundLayer.clearCache()
      }
      backgroundLayer.draw()
    } else {
      backgroundLayer.destroyChildren()
      backgroundLayer.clearCache()
    }

    // Create sprites for all movements
    for (const movement of movements.value) {
      const sprite = await createKonvaImage(movement)
      if (sprite) {
        spriteFrontLayer.add(sprite)
        spriteRefs.value.set(movement.actionNumber, sprite)
      }
    }

    spriteFrontLayer.draw()

    // Start random background changes if enabled
    if (randomBgChange.value && showBackgroundItems.value) {
      setTimeout(() => {
        toggleRandomBgChange(true)
      }, 100)
    }
  }

  function cleanup(): void {
    if (randomBgIntervalId !== null) {
      clearInterval(randomBgIntervalId)
      randomBgIntervalId = null
    }
  }

  return {
    initializeSprites,
    toggleRandomBgChange,
    cleanup,
    spriteFrontLayer: () => spriteFrontLayer,
  }
}
