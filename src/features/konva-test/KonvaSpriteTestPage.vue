<script setup lang="ts">
import Konva from 'konva'
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import type { MovementState } from '@/core/sprite/types'
import { GameButton, GameLayout, GameSelect, GameSwitch } from '@/shared/components/ui'
import type { VueKonvaStageInstance } from '@/types/vue-konva'

import { useKonvaStage } from './composables/useKonvaStage'
import { generateMovements } from './composables/useMovementGeneration'
import { useSpriteAnimation } from './composables/useSpriteAnimation'

defineOptions({
  name: 'KonvaSpriteTestPage',
})

const CANVAS_WIDTH = 256
const CANVAS_HEIGHT = 240

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

const movements = ref<MovementState[]>(generateMovements(8, 10))
const spriteRefs = ref<Map<number, Konva.Image>>(new Map())
const backgroundItemRefs = ref<Konva.Image[]>([])
const randomBgItemRefs = ref<Array<Konva.Image | Konva.Node>>([])
const stageRef = useTemplateRef<VueKonvaStageInstance>('stageRef')

// Initialize Konva stage composable
const { initializeSprites, toggleRandomBgChange, cleanup, spriteFrontLayer } = useKonvaStage({
  stageRef: stageRef as Readonly<Ref<VueKonvaStageInstance | null>>,
  movements,
  spriteRefs: spriteRefs as Ref<Map<number, Konva.Image>>,
  backgroundItemRefs: backgroundItemRefs as Ref<Konva.Image[]>,
  randomBgItemRefs: randomBgItemRefs as Ref<Array<Konva.Image | Konva.Node>>,
  showBackgroundItems,
  randomBgChange,
})

// Initialize sprite animation composable
const spriteAnimation = computed(() =>
  useSpriteAnimation({
    movements,
    spriteRefs: spriteRefs as Ref<Map<number, Konva.Image>>,
    spriteFrontLayer: spriteFrontLayer(),
  })
)

/** Reset all movements to initial positions */
function resetMovements(): void {
  const CANVAS_SCALE = 2
  // Note: currentFrameIndex is now tracked by Animation Worker in shared buffer
  // This demo page would need to integrate with Animation Worker for full functionality
  const sprite = spriteRefs.value.get(0)
  if (sprite) {
    // Set default center position for demo
    sprite.x(128 * CANVAS_SCALE)
    sprite.y(120 * CANVAS_SCALE)
  }
}

watch([spriteCount, spriteSpeed], () => {
  const count = typeof spriteCount.value === 'number' ? spriteCount.value : Number(spriteCount.value)
  const speed = typeof spriteSpeed.value === 'number' ? spriteSpeed.value : Number(spriteSpeed.value)
  movements.value = generateMovements(count, speed)
  spriteAnimation.value.stop()
  void initializeSprites().then(() => spriteAnimation.value.start())
})

watch(showBackgroundItems, () => {
  spriteAnimation.value.stop()
  void initializeSprites().then(() => {
    spriteAnimation.value.start()
    if (!showBackgroundItems.value) {
      toggleRandomBgChange(false)
    } else if (randomBgChange.value) {
      setTimeout(() => toggleRandomBgChange(true), 200)
    }
  })
})

watch(randomBgChange, (enabled) => {
  toggleRandomBgChange(enabled)
})

onMounted(() => {
  setTimeout(() => {
    void initializeSprites().then(() => spriteAnimation.value.start())
  }, 100)
})

onUnmounted(() => {
  spriteAnimation.value.stop()
  cleanup()
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
          <p><strong>Note:</strong> This demo uses simplified animation; full animation is handled by Animation Worker</p>
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
        <GameButton type="primary" size="small" @click="initializeSprites">
          Reinitialize
        </GameButton>
        <GameButton type="default" size="small" @click="resetMovements">
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
