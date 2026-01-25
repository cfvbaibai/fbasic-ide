<script setup lang="ts">
import Konva from 'konva'
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import type { MovementState } from '@/core/sprite/types'
import { GameButton, GameLayout, GameSelect, GameSwitch } from '@/shared/components/ui'
import type { VueKonvaStageInstance } from '@/types/vue-konva'

import { createBackgroundItemKonvaImages } from './composables/useBackgroundItems'
import { generateMovements } from './composables/useMovementGeneration'
import { addRandomBackgroundItem } from './composables/useRandomBackground'
import { clearSpriteCache, createKonvaImage, updateSprites } from './composables/useSpriteRendering'

defineOptions({
  name: 'KonvaSpriteTestPage',
})

// Canvas dimensions (F-Basic screen model: 256×240 pixels)
const CANVAS_WIDTH = 256
const CANVAS_HEIGHT = 240

// Background screen dimensions and offsets (F-Basic model)
const BG_COLS = 28 // Background screen: 28 columns
const BG_ROWS = 24 // Background screen: 24 rows
const CELL_SIZE = 8 // 8×8 pixels per character cell
const BG_OFFSET_X = 2 * CELL_SIZE // 16 pixels (2 columns offset)
const BG_OFFSET_Y = 3 * CELL_SIZE // 24 pixels (3 rows offset)
// Background screen pixel dimensions (for reference)
// const BG_WIDTH = BG_COLS * CELL_SIZE // 224 pixels
// const BG_HEIGHT = BG_ROWS * CELL_SIZE // 192 pixels

// Sprite scale multiplier (make sprites bigger)
const SPRITE_SCALE = 3

// Controls
const spriteCount = ref<number>(8)
const spriteSpeed = ref<number>(10)
const showBackgroundItems = ref<boolean>(true)
const randomBgChange = ref<boolean>(true)

// Speed options (speed value: 60/speed = dots per second)
const speedOptions = [
  { label: 'Very Slow (5)', value: 5 },
  { label: 'Slow (8)', value: 8 },
  { label: 'Normal (10)', value: 10 },
  { label: 'Fast (12)', value: 12 },
  { label: 'Very Fast (15)', value: 15 },
  { label: 'Ultra Fast (20)', value: 20 },
]

// Count options
const countOptions = [
  { label: '1 Sprite', value: 1 },
  { label: '2 Sprites', value: 2 },
  { label: '4 Sprites', value: 4 },
  { label: '6 Sprites', value: 6 },
  { label: '8 Sprites', value: 8 },
  { label: '12 Sprites', value: 12 },
  { label: '16 Sprites', value: 16 },
]


// Test movement states (simulating MoveTest)
const movements = ref<MovementState[]>(generateMovements(8, 10))

// Konva images for each movement
const spriteRefs = ref<Map<number, Konva.Image>>(new Map())

// Background item images
const backgroundItemRefs = ref<Konva.Image[]>([])

// Random background items (for periodic changes)
const randomBgItemRefs = ref<Array<Konva.Image | Konva.Node>>([])

// Layer references (F-Basic layer order: backdrop, sprite back, background, sprite front)
// backdropLayer is the first layer from template, managed by vue-konva
let spriteBackLayer: Konva.Layer | null = null
let backgroundLayer: Konva.Layer | null = null
let spriteFrontLayer: Konva.Layer | null = null

const stageRef = useTemplateRef<VueKonvaStageInstance>('stageRef')

// Random background change interval
let randomBgIntervalId: number | null = null


// Animation loop
let animationFrameId: number | null = null
let lastFrameTime = 0

/**
 * Start/stop random background changes
 */
function toggleRandomBgChange(enabled: boolean): void {
  if (randomBgIntervalId !== null) {
    clearInterval(randomBgIntervalId)
    randomBgIntervalId = null
  }
  
  if (enabled && showBackgroundItems.value) {
    if (!backgroundLayer) {
      console.warn('Background layer not ready for random changes')
      return
    }
    
    // Clear cache when enabling random changes
    backgroundLayer.clearCache()
    
    // Add a random item every 1-2 seconds
    const addItem = () => {
      if (!backgroundLayer || !showBackgroundItems.value) {
        return
      }
      void addRandomBackgroundItem(
        backgroundLayer,
        BG_COLS,
        BG_ROWS,
        randomBgItemRefs.value as Array<Konva.Image | Konva.Node>
      )
    }
    
    // Add first item immediately, then continue with interval
    void addItem()
    randomBgIntervalId = window.setInterval(addItem, 1000 + Math.random() * 1000)
  } else if (!enabled && backgroundLayer) {
    // Re-enable caching when random changes are disabled
    backgroundLayer.cache()
    backgroundLayer.draw()
  }
}

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

    movement.currentX += movement.directionDeltaX * distanceThisFrame
    movement.currentY += movement.directionDeltaY * distanceThisFrame
    movement.remainingDistance -= distanceThisFrame

    // Clamp bounds (account for sprite size with scale)
    const spriteSize = 16 * SPRITE_SCALE
    movement.currentX = Math.max(0, Math.min(CANVAS_WIDTH - spriteSize, movement.currentX))
    movement.currentY = Math.max(0, Math.min(CANVAS_HEIGHT - spriteSize, movement.currentY))

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
  void updateSprites(movements.value, spriteRefs.value as Map<number, Konva.Image>)

  // Only draw sprite front layer (other layers are cached and don't need redrawing)
  if (spriteFrontLayer) {
    spriteFrontLayer.draw()
  }

  // Request next frame
  animationFrameId = requestAnimationFrame(animationLoop)
}

// Initialize sprites when stage is ready
async function initializeSprites(): Promise<void> {
  if (!stageRef.value) return

  // Get the Konva stage node from vue-konva ref
  // vue-konva wraps the Konva stage, need to get the node
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

  // F-Basic screen model layer setup (from back to front):
  // 1. Backdrop layer (furthest back) - already exists from template
  // 2. Sprite back layer (sprites with priority E=1, behind background)
  // 3. Background layer (PRINT content, 28×24 characters, offset at 16, 24)
  // 4. Sprite front layer (sprites with priority E=0, in front of background)

  // Backdrop layer is the first layer from template (managed by vue-konva)
  // No need to access it directly

  // Create or get sprite back layer
  if (!spriteBackLayer) {
    spriteBackLayer = new Konva.Layer()
    stageNode.add(spriteBackLayer)
  } else {
    spriteBackLayer.destroyChildren()
  }

  // Create or get background layer (for static background items)
  if (!backgroundLayer) {
    backgroundLayer = new Konva.Layer()
    stageNode.add(backgroundLayer)
  } else {
  // Clear existing background items
  backgroundItemRefs.value.forEach(item => item.destroy())
  backgroundItemRefs.value = []
  randomBgItemRefs.value.forEach(item => item.destroy())
  randomBgItemRefs.value = []
  backgroundLayer.destroyChildren()
  }

  // Create or get sprite front layer (for dynamic sprites)
  if (!spriteFrontLayer) {
    spriteFrontLayer = new Konva.Layer()
    stageNode.add(spriteFrontLayer)
  } else {
    // Clear existing sprites
    spriteRefs.value.forEach(sprite => sprite.destroy())
    spriteRefs.value.clear()
    spriteFrontLayer.destroyChildren()
  }

  clearSpriteCache()

  // Create background items if enabled (on background layer, with proper offset)
  if (showBackgroundItems.value) {
    const bgImages = await createBackgroundItemKonvaImages(true, BG_OFFSET_X, BG_OFFSET_Y, BG_COLS, BG_ROWS)
    for (const bgImage of bgImages) {
      backgroundLayer.add(bgImage)
      backgroundItemRefs.value.push(bgImage)
    }
    // Don't cache background layer if random changes are enabled (need to update dynamically)
    // Only cache when random changes are disabled for performance
    if (!randomBgChange.value) {
      backgroundLayer.cache()
    } else {
      // Ensure cache is cleared if random changes are enabled
      backgroundLayer.clearCache()
    }
    backgroundLayer.draw()
    
    // Note: Random background changes will be started after initialization completes
  } else {
    // Clear background layer if disabled
    backgroundLayer.destroyChildren()
    backgroundLayer.clearCache()
  }

  // Create sprites for all movements (on sprite front layer, priority E=0)
  for (const movement of movements.value) {
    const sprite = await createKonvaImage(movement)
    if (sprite) {
      spriteFrontLayer.add(sprite)
      spriteRefs.value.set(movement.actionNumber, sprite)
    }
  }

  spriteFrontLayer.draw()

  // Start animation loop
  lastFrameTime = 0
  animationFrameId = requestAnimationFrame(animationLoop)

  // Start random background changes if enabled (use setTimeout to ensure layer is ready)
  if (randomBgChange.value && showBackgroundItems.value) {
    setTimeout(() => {
      toggleRandomBgChange(true)
    }, 100)
  }
}

// Watch for changes in sprite count or speed
watch([spriteCount, spriteSpeed], () => {
  const count = typeof spriteCount.value === 'number' ? spriteCount.value : Number(spriteCount.value)
  const speed = typeof spriteSpeed.value === 'number' ? spriteSpeed.value : Number(spriteSpeed.value)
  movements.value = generateMovements(count, speed)
  // Reinitialize sprites when count or speed changes
  void initializeSprites()
})

// Watch for changes in background items toggle
watch(showBackgroundItems, () => {
  // Reinitialize to add/remove background items
  void initializeSprites()
  // Stop random changes if background is disabled
  if (!showBackgroundItems.value) {
    toggleRandomBgChange(false)
  } else if (randomBgChange.value) {
    // Restart random changes if background is re-enabled and random change is on
    // Wait a bit for initialization to complete
    setTimeout(() => {
      toggleRandomBgChange(true)
    }, 200)
  }
})

// Watch for changes in random background change toggle
watch(randomBgChange, (enabled) => {
  // Only toggle if background layer is ready
  if (backgroundLayer || !enabled) {
    toggleRandomBgChange(enabled)
  }
})

onMounted(() => {
  // Initialize after a short delay to ensure stage is ready
  setTimeout(() => {
    void initializeSprites()
  }, 100)
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (randomBgIntervalId !== null) {
    clearInterval(randomBgIntervalId)
    randomBgIntervalId = null
  }
})
</script>

<template>
  <GameLayout>
    <div class="konva-test-page">
      <div class="test-header">
        <h1>Konva Sprite Animation Test</h1>
        <p>Testing Konva.js for sprite animation with Family BASIC sprites</p>
        <div class="test-info">
          <p><strong>Movements:</strong> {{ movements.length }}</p>
          <p><strong>Active:</strong> {{ movements.filter(m => m.isActive).length }}</p>
        </div>
      </div>

      <div class="test-controls">
        <div class="control-group">
          <label class="control-label">Sprite Count:</label>
          <GameSelect
            :model-value="spriteCount"
            :options="countOptions"
            size="small"
            width="150px"
            @update:model-value="(val: string | number) => { spriteCount = Number(val) }"
          />
        </div>
        <div class="control-group">
          <label class="control-label">Speed:</label>
          <GameSelect
            :model-value="spriteSpeed"
            :options="speedOptions"
            size="small"
            width="180px"
            @update:model-value="(val: string | number) => { spriteSpeed = Number(val) }"
          />
        </div>
        <div class="control-group">
          <label class="control-label">Background:</label>
          <GameSwitch
            :model-value="showBackgroundItems"
            size="small"
            @update:model-value="(val: string | number | boolean) => { showBackgroundItems = Boolean(val) }"
          />
        </div>
        <div class="control-group">
          <label class="control-label">Random BG Change:</label>
          <GameSwitch
            :model-value="randomBgChange"
            size="small"
            :disabled="!showBackgroundItems"
            @update:model-value="(val: string | number | boolean) => { randomBgChange = Boolean(val) }"
          />
        </div>
        <GameButton type="primary" size="small" @click="() => initializeSprites()">
          Reinitialize
        </GameButton>
        <GameButton
          type="default"
          size="small"
          @click="
            () => {
              movements.forEach(m => {
                m.currentX = m.startX
                m.currentY = m.startY
                m.remainingDistance = m.totalDistance
                m.isActive = true
                m.currentFrameIndex = 0
                m.frameCounter = 0
              })
            }
          "
        >
          Reset
        </GameButton>
      </div>

      <div class="canvas-container">
        <v-stage
          ref="stageRef"
          :config="{
            width: CANVAS_WIDTH * 2,
            height: CANVAS_HEIGHT * 2,
          }"
        >
          <v-layer>
            <!-- Backdrop Screen (F-Basic layer 1: furthest back) -->
            <!-- 32×30 characters = 256×240 pixels -->
            <v-rect
              :config="{
                x: 0,
                y: 0,
                width: CANVAS_WIDTH * 2,
                height: CANVAS_HEIGHT * 2,
                fill: 'var(--base-solid-gray-40)',
              }"
            />
            <!-- Additional layers (sprite back, background, sprite front) will be added programmatically -->
          </v-layer>
        </v-stage>
      </div>
    </div>
  </GameLayout>
</template>

<style scoped>
.konva-test-page {
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.test-header {
  margin-bottom: 1.5rem;
}

.test-header h1 {
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
}

.test-info {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.test-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--game-surface-bg-gradient);
  border: 1px solid var(--game-surface-border);
  border-radius: 8px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.control-label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--game-text-primary);
  white-space: nowrap;
}

.canvas-container {
  border: 2px solid var(--semantic-solid-neutral);
  display: inline-block;
  background: var(--semantic-solid-neutral);
  margin: 0 auto;
}
</style>
