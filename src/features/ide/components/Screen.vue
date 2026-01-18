<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import type { ScreenCell } from '@/core/interfaces'
import { renderScreenBuffer } from '../composables/canvasRenderer'

interface Props {
  screenBuffer: ScreenCell[][]
  cursorX: number
  cursorY: number
}

const props = withDefaults(defineProps<Props>(), {
  screenBuffer: () => {
    // Initialize empty 28×24 grid
    const grid: ScreenCell[][] = []
    for (let y = 0; y < 24; y++) {
      const row: ScreenCell[] = []
      for (let x = 0; x < 28; x++) {
        row.push({ character: ' ', colorPattern: 0, x, y })
      }
      grid.push(row)
    }
    return grid
  },
  cursorX: 0,
  cursorY: 0
})

// Canvas reference
const screenCanvas = ref<HTMLCanvasElement | null>(null)
const paletteCode = ref(1) // Default background palette code is 1


// Direct rendering function (no Vue reactivity overhead)
function render(): void {
  if (!screenCanvas.value) return
  renderScreenBuffer(screenCanvas.value, props.screenBuffer, paletteCode.value)
}

// Use requestAnimationFrame for batching
let pendingRender = false
function scheduleRender(): void {
  if (pendingRender) return
  pendingRender = true
  requestAnimationFrame(() => {
    pendingRender = false
    render()
  })
}

// Watch screenBuffer and render when it changes (shallow watch to reduce overhead)
watch(() => props.screenBuffer, () => {
  scheduleRender()
}, { immediate: true })

// Initial render when canvas becomes available
watchEffect(() => {
  if (screenCanvas.value) {
    render()
  }
})
</script>

<template>
  <div class="screen-container">
    <div class="screen-header">
      <span class="screen-title">Family BASIC Screen</span>
      <span class="screen-dimensions">28×24</span>
      <span class="cursor-info">Cursor: ({{ cursorX }}, {{ cursorY }})</span>
    </div>
    <div class="screen-display">
      <div class="crt-bezel">
        <div class="crt-screen">
          <div class="crt-scanlines"></div>
          <canvas
            ref="screenCanvas"
            class="screen-canvas"
            :width="240"
            :height="208"
          />
          <div class="crt-reflection"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screen-container {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--game-screen-bg-color);
  border: 2px solid var(--game-screen-border-color);
  border-radius: 4px;
  overflow: hidden;
}

.screen-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: var(--game-screen-header-bg);
  border-bottom: 1px solid var(--game-screen-border-color);
  font-size: 0.875rem;
  color: var(--game-screen-header-text);
}

.screen-title {
  font-weight: 600;
  color: var(--game-screen-header-title);
}

.screen-dimensions {
  color: var(--game-screen-header-text);
}

.cursor-info {
  margin-left: auto;
  font-family: 'Courier New', monospace;
  color: var(--game-screen-text-color);
}

.screen-display {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: auto;
  min-height: 0;
  background: linear-gradient(135deg, var(--game-color-black) 0%, var(--game-screen-header-bg) 100%);
}

/* CRT Bezel - outer frame */
.crt-bezel {
  background: linear-gradient(135deg, var(--game-screen-header-bg) 0%, var(--game-color-black) 50%, var(--game-screen-header-bg) 100%);
  border: 8px solid var(--game-color-black);
  border-radius: 12px;
  box-shadow: 
    inset 0 2px 4px var(--game-color-white-10),
    0 8px 32px rgb(0 0 0 / 80%),
    0 0 0 2px var(--game-color-black-50);
  padding: 16px;
}

/* CRT Screen - inner screen area */
.crt-screen {
  position: relative;
  border: 4px solid var(--game-color-black);
  border-radius: 16px;
  box-shadow: 
    inset 0 0 80px rgb(0 0 0 / 90%),
    0 4px 20px rgb(0 0 0 / 60%),
    inset 0 -2px 10px rgb(0 0 0 / 80%);
  overflow: hidden;
  background: radial-gradient(
    ellipse 150% 110% at 85% 8%,
    rgb(255 255 255 / 22%) 0%,
    rgb(255 255 255 / 14%) 18%,
    rgb(255 255 255 / 8%) 35%,
    transparent 60%,
    var(--game-color-black-30) 100%
  );
}

/* Scanlines overlay */
.crt-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    var(--game-color-black-15) 2px,
    var(--game-color-black-15) 4px
  );
  pointer-events: none;
  z-index: 2;
  mix-blend-mode: multiply;
}

/* Screen reflection/glow effect - point light from top right */
.crt-reflection {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 140% 100% at 85% 5%,
    var(--game-color-white-40) 0%,
    var(--game-color-white-20) 15%,
    rgb(255 255 255 / 12%) 30%,
    transparent 55%,
    var(--game-color-black-40) 100%
  );
  pointer-events: none;
  z-index: 1;
  border-radius: 16px;
}

.screen-canvas {
  display: block;
  position: relative;
  z-index: 0;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  image-rendering: crisp-edges;
  width: 480px; /* 240px * 2x scale (224 + 16 padding) */
  height: 416px; /* 208px * 2x scale (192 + 16 padding) */
  filter: brightness(1.05) contrast(1.1);
}
</style>

