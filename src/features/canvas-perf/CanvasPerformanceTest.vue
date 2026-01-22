<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { GameLayout, GameButton } from '@/shared/components/ui'
import { renderScreenBuffer, type ScreenCell } from '@/features/ide/composables/canvasRenderer'

/**
 * CanvasPerformanceTest component - Performance testing component for canvas rendering.
 */
defineOptions({
  name: 'CanvasPerformanceTest'
})

const { t } = useI18n()

// Canvas reference
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Test state
const isRunning = ref(false)
const charsPerFrame = ref(5)
const fps = ref(0)
const totalChars = ref(0)
const frameTime = ref(0)
const charsPerSecond = computed(() => fps.value * charsPerFrame.value)

// Screen buffer (plain JS array, no Vue reactivity)
let screenBuffer: ScreenCell[][] = []
let animationFrameId: number | null = null
let frameCount = 0
let lastFpsUpdate = performance.now()

// Initialize screen buffer
function initializeBuffer(): void {
  screenBuffer = []
  for (let y = 0; y < 24; y++) {
    const row: ScreenCell[] = []
    for (let x = 0; x < 28; x++) {
      row.push({ character: ' ', colorPattern: 0, x, y })
    }
    screenBuffer.push(row)
  }
}

// Test characters
const testChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'

// Render loop (no Vue reactivity)
function renderLoop(): void {
  if (!canvasRef.value || !isRunning.value) return

  const startTime = performance.now()

  // Update buffer (simulate PRINT statements)
  let charsAdded = 0
  for (let i = 0; i < charsPerFrame.value && charsAdded < charsPerFrame.value; i++) {
    const y = Math.floor(Math.random() * 24)
    const x = Math.floor(Math.random() * 28)
    const char = testChars[Math.floor(Math.random() * testChars.length)] ?? 'A'
    
    if (screenBuffer[y] && screenBuffer[y][x]) {
      screenBuffer[y][x].character = char
      charsAdded++
    }
  }

  // Direct render call (no Vue watch, no reactivity)
  const renderStartTime = performance.now()
  renderScreenBuffer(canvasRef.value, screenBuffer, 1)
  const renderTime = performance.now() - renderStartTime

  const endTime = performance.now()
  frameTime.value = endTime - startTime
  totalChars.value += charsAdded
  frameCount++

  // Update FPS every second
  const now = performance.now()
  if (now - lastFpsUpdate >= 1000) {
    fps.value = frameCount / ((now - lastFpsUpdate) / 1000)
    frameCount = 0
    lastFpsUpdate = now
  }
  
  // Log performance if frame time is high
  if (frameTime.value > 20) {
    console.log(`Slow frame: ${frameTime.value.toFixed(2)}ms (render: ${renderTime.toFixed(2)}ms, chars: ${charsAdded})`)
  }

  if (isRunning.value) {
    animationFrameId = requestAnimationFrame(renderLoop)
  }
}

function startTest(): void {
  if (isRunning.value) return
  isRunning.value = true
  frameCount = 0
  lastFpsUpdate = performance.now()
  renderLoop()
}

function stopTest(): void {
  isRunning.value = false
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

function clearScreen(): void {
  initializeBuffer()
  if (canvasRef.value) {
    renderScreenBuffer(canvasRef.value, screenBuffer, 1)
  }
  totalChars.value = 0
}

// Initialize on mount
onMounted(() => {
  initializeBuffer()
  if (canvasRef.value) {
    renderScreenBuffer(canvasRef.value, screenBuffer, 1)
  }
})

onUnmounted(() => {
  stopTest()
})
</script>

<template>
  <GameLayout
    :title="t('canvasPerf.title')"
    icon="mdi:speedometer"
  >
    <div class="test-page">
      <div class="test-controls">
      <GameButton type="primary" @click="startTest">{{ t('canvasPerf.buttons.startTest') }}</GameButton>
      <GameButton type="danger" @click="stopTest">{{ t('canvasPerf.buttons.stopTest') }}</GameButton>
      <GameButton type="warning" @click="clearScreen">{{ t('canvasPerf.buttons.clearScreen') }}</GameButton>
      <label>
        {{ t('canvasPerf.labels.charsPerFrame') }}
        <input v-model.number="charsPerFrame" type="number" min="1" max="100" />
      </label>
    </div>

    <div class="test-stats">
      <div>{{ t('canvasPerf.labels.fps') }} {{ fps.toFixed(1) }}</div>
      <div>{{ t('canvasPerf.labels.frameTime') }} {{ frameTime.toFixed(2) }}ms</div>
      <div>{{ t('canvasPerf.labels.charsRendered') }} {{ totalChars }}</div>
      <div>{{ t('canvasPerf.labels.charsPerSec') }} {{ charsPerSecond.toFixed(0) }}</div>
      <div>{{ t('canvasPerf.labels.charsPerFrame') }} {{ charsPerFrame }}</div>
      <div>{{ t('canvasPerf.labels.testRunning') }} {{ isRunning ? t('common.labels.yes') : t('common.labels.no') }}</div>
    </div>

    <div class="canvas-container">
      <canvas
        ref="canvasRef"
        class="test-canvas"
        :width="224"
        :height="192"
      />
    </div>
    </div>
  </GameLayout>
</template>

<style scoped>
.test-page {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.test-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--game-surface-bg-gradient);
  border: 1px solid var(--game-surface-border);
  border-radius: 4px;
}


.test-controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.test-controls input {
  width: 60px;
  padding: 0.25rem;
  background: var(--game-surface-bg-start);
  border: 1px solid var(--game-surface-border);
  border-radius: 2px;
}

.test-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--game-surface-bg-gradient);
  border: 1px solid var(--game-surface-border);
  border-radius: 4px;
  font-family: monospace;
}

.test-stats div {
  font-weight: 600;
  color: var(--base-solid-primary);
}

.canvas-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
  background: var(--game-surface-bg-gradient);
  border: 1px solid var(--game-surface-border);
  border-radius: 4px;
}

.test-canvas {
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  image-rendering: crisp-edges;
  width: 672px; /* 224px * 3x scale */
  height: 576px; /* 192px * 3x scale */
  background: var(--game-screen-bg-color);
  border: 2px solid var(--game-screen-border-color);
}
</style>
