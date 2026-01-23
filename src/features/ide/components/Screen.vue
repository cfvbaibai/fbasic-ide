<script setup lang="ts">
import { useTemplateRef, ref, watch, watchEffect, computed } from 'vue'
import type { ScreenCell } from '@/core/interfaces'
import { renderScreenBuffer } from '../composables/canvasRenderer'
import GameButtonGroup from '@/shared/components/ui/GameButtonGroup.vue'
import GameButton from '@/shared/components/ui/GameButton.vue'

/**
 * Screen component - Renders the F-BASIC screen buffer on a canvas.
 */
defineOptions({
  name: 'Screen'
})

interface Props {
  screenBuffer: ScreenCell[][]
  cursorX: number
  cursorY: number
  bgPalette?: number
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
  cursorY: 0,
  bgPalette: 1
})

// Canvas reference
const screenCanvas = useTemplateRef<HTMLCanvasElement>('screenCanvas')
// Use bgPalette from props instead of hardcoded value
const paletteCode = computed(() => props.bgPalette ?? 1)

// Zoom state - default to 2x (current scale)
const zoomLevel = ref<1 | 2 | 3 | 4>(2)

// Base canvas dimensions
const BASE_WIDTH = 240
const BASE_HEIGHT = 208

// Computed canvas display dimensions based on zoom
const canvasWidth = computed(() => BASE_WIDTH * zoomLevel.value)
const canvasHeight = computed(() => BASE_HEIGHT * zoomLevel.value)

// Zoom level options
const zoomLevels: Array<{ value: 1 | 2 | 3 | 4; label: string }> = [
  { value: 1, label: '×1' },
  { value: 2, label: '×2' },
  { value: 3, label: '×3' },
  { value: 4, label: '×4' }
]

function setZoom(level: 1 | 2 | 3 | 4): void {
  zoomLevel.value = level
}


// Direct rendering function (no Vue reactivity overhead)
function render(): void {
  if (!screenCanvas.value) return
  renderScreenBuffer(screenCanvas.value, props.screenBuffer, paletteCode.value)
}

// Watch paletteCode changes to trigger re-render
watch(paletteCode, () => {
  scheduleRender()
})

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
    <div class="screen-display">
      <div class="screen-controls">
        <GameButtonGroup>
          <GameButton
            v-for="level in zoomLevels"
            :key="level.value"
            variant="toggle"
            size="small"
            :selected="zoomLevel === level.value"
            @click="setZoom(level.value)"
          >
            {{ level.label }}
          </GameButton>
        </GameButtonGroup>
      </div>
      <div class="crt-bezel">
        <div class="crt-screen">
          <div class="crt-scanlines"></div>
          <canvas
            ref="screenCanvas"
            class="screen-canvas"
            :width="240"
            :height="208"
            :style="{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`
            }"
          />
          <div class="crt-reflection"></div>
        </div>
      </div>
    </div>
</template>

<style scoped>
/* CRT Color Variables - Dark Theme (default) */

/* stylelint-disable function-disallowed-list */

/* Using modern CSS relative color syntax (rgb(from ...)) - not hardcoded RGB values */
.screen-display {
  --crt-glow-light-10: rgb(from var(--base-solid-gray-100) r g b / 10%);
  --crt-glow-light-20: rgb(from var(--base-solid-gray-100) r g b / 20%);
  --crt-glow-light-40: rgb(from var(--base-solid-gray-100) r g b / 40%);
  --crt-glow-light-80: rgb(from var(--base-solid-gray-100) r g b / 80%);
  --crt-shadow-dark-10: rgb(from var(--base-solid-gray-00) r g b / 10%);
  --crt-shadow-dark-30: rgb(from var(--base-solid-gray-00) r g b / 30%);
  --crt-shadow-dark-40: rgb(from var(--base-solid-gray-00) r g b / 40%);
  --crt-shadow-dark-50: rgb(from var(--base-solid-gray-00) r g b / 50%);
  --crt-shadow-dark-60: rgb(from var(--base-solid-gray-00) r g b / 60%);
  --crt-shadow-dark-80: rgb(from var(--base-solid-gray-00) r g b / 80%);
  --crt-border-color: var(--base-solid-gray-00);

  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: auto;
  min-height: 0;
  gap: 1rem;
}

.screen-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* CRT Color Variables - Light Theme */
.light-theme .screen-display {
  --crt-glow-light-10: rgb(from var(--base-solid-gray-100) r g b / 10%);
  --crt-glow-light-20: rgb(from var(--base-solid-gray-100) r g b / 20%);
  --crt-glow-light-40: rgb(from var(--base-solid-gray-100) r g b / 40%);
  --crt-glow-light-80: rgb(from var(--base-solid-gray-100) r g b / 80%);
  --crt-shadow-dark-10: rgb(from var(--base-solid-gray-00) r g b / 10%);
  --crt-shadow-dark-30: rgb(from var(--base-solid-gray-00) r g b / 30%);
  --crt-shadow-dark-40: rgb(from var(--base-solid-gray-00) r g b / 40%);
  --crt-shadow-dark-50: rgb(from var(--base-solid-gray-00) r g b / 50%);
  --crt-shadow-dark-60: rgb(from var(--base-solid-gray-00) r g b / 60%);
  --crt-shadow-dark-80: rgb(from var(--base-solid-gray-00) r g b / 80%);
  --crt-border-color: var(--base-solid-gray-00);
}
/* stylelint-enable function-disallowed-list */

/* CRT Bezel - outer frame */
.crt-bezel {
  background: linear-gradient(135deg, var(--game-screen-header-bg) 0%, var(--crt-border-color) 50%, var(--game-screen-header-bg) 100%);
  border: 8px solid var(--crt-border-color);
  border-radius: 12px;
  box-shadow: 
    inset 0 2px 4px var(--crt-glow-light-10),
    0 8px 32px var(--crt-shadow-dark-80),
    0 0 0 2px var(--crt-shadow-dark-50);
  padding: 16px;
}

/* Light theme: darker background, lighter border, subtle shadows */
.light-theme .crt-bezel {
  background: linear-gradient(135deg, var(--base-solid-gray-30) 0%, var(--base-solid-gray-50) 50%, var(--base-solid-gray-30) 100%);
  border-color: var(--base-solid-gray-50);
  box-shadow: 
    inset 0 1px 2px var(--crt-shadow-dark-10),
    0 4px 16px var(--base-alpha-gray-00-20),
    0 0 0 1px var(--crt-shadow-dark-30);
}

/* CRT Screen - inner screen area */
.crt-screen {
  position: relative;
  border: 4px solid var(--crt-border-color);
  border-radius: 16px;
  box-shadow: 
    inset 0 0 80px var(--crt-glow-light-80),
    0 4px 20px var(--crt-shadow-dark-60),
    inset 0 -2px 10px var(--crt-shadow-dark-80);
  overflow: hidden;
  background: radial-gradient(
    ellipse 150% 110% at 85% 8%,
    var(--crt-glow-light-20) 0%,
    var(--crt-glow-light-10) 18%,
    var(--crt-glow-light-10) 35%,
    transparent 60%,
    var(--crt-shadow-dark-30) 100%
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
    var(--crt-shadow-dark-10) 2px,
    var(--crt-shadow-dark-10) 4px
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
    var(--crt-glow-light-40) 0%,
    var(--crt-glow-light-20) 15%,
    var(--crt-glow-light-10) 30%,
    transparent 55%,
    var(--crt-shadow-dark-40) 100%
  );
  pointer-events: none;
  z-index: 1;
  border-radius: 16px;
}

/* Light theme: reflection uses light colors at top-right (inverted from dark theme) */
.light-theme .crt-reflection {
  background: radial-gradient(
    ellipse 140% 100% at 85% 5%,
    var(--crt-shadow-dark-40) 0%,
    var(--crt-shadow-dark-30) 15%,
    var(--crt-shadow-dark-10) 30%,
    transparent 55%,
    var(--crt-glow-light-40) 100%
  );
}

.screen-canvas {
  display: block;
  position: relative;
  z-index: 0;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  image-rendering: crisp-edges;
  filter: brightness(1.05) contrast(1.1);
}
</style>

