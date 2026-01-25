<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue'

import type { ScreenCell } from '@/core/interfaces'
import type { MovementState, SpriteState } from '@/core/sprite/types'
import { renderScreenBuffer, renderScreenLayers } from '@/features/ide/composables/canvasRenderer'
import { useScreenZoom } from '@/features/ide/composables/useScreenZoom'

/**
 * Screen component - Renders the F-BASIC screen buffer on a canvas.
 */
defineOptions({
  name: 'Screen'
})

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
  bgPalette: 1,
  backdropColor: 0,
  spritePalette: 1,
  spriteStates: () => [],
  movementStates: () => [],
  spriteEnabled: false
})

interface Props {
  screenBuffer: ScreenCell[][]
  cursorX: number
  cursorY: number
  bgPalette?: number
  backdropColor?: number
  spritePalette?: number
  spriteStates?: SpriteState[]
  movementStates?: MovementState[]
  spriteEnabled?: boolean
}

// Canvas reference
const screenCanvas = useTemplateRef<HTMLCanvasElement>('screenCanvas')
// Use bgPalette from props instead of hardcoded value
const paletteCode = computed(() => props.bgPalette ?? 1)

// Use shared zoom state composable
const { zoomLevel } = useScreenZoom()

// Base canvas dimensions (full backdrop/sprite screen: 256×240)
const BASE_WIDTH = 256
const BASE_HEIGHT = 240

// Computed canvas display dimensions based on zoom
const canvasWidth = computed(() => BASE_WIDTH * zoomLevel.value)
const canvasHeight = computed(() => BASE_HEIGHT * zoomLevel.value)


// Direct rendering function (no Vue reactivity overhead)
function render(): void {
  if (!screenCanvas.value) return

  // Use multi-layer rendering when sprites are present
  if (props.spriteStates && props.spriteStates.length > 0) {
    // renderScreenLayers is async, but we call it without await to avoid blocking
    void renderScreenLayers(
      screenCanvas.value,
      props.screenBuffer,
      props.spriteStates,
      props.movementStates ?? [],
      paletteCode.value,
      props.spritePalette ?? 1,
      props.backdropColor ?? 0,
      props.spriteEnabled ?? false
    )
  } else {
    // Fallback to simple rendering when no sprites
    renderScreenBuffer(
      screenCanvas.value,
      props.screenBuffer,
      paletteCode.value,
      props.backdropColor ?? 0
    )
  }
}

// Watch paletteCode, backdropColor, spritePalette, sprite states, and sprite enabled to trigger re-render
// Combined watcher for better performance (Vue 3 best practice)
// Use computed to extract sprite state fingerprint for efficient change detection
const spriteStateFingerprint = computed(() => {
  if (!props.spriteStates || props.spriteStates.length === 0) return ''
  // Create a fingerprint from sprite properties we care about for rendering
  return props.spriteStates.map(s => 
    `${s.spriteNumber}:${s.x},${s.y},${s.visible ? '1' : '0'},${s.priority}`
  ).join('|')
})

const movementStateFingerprint = computed(() => {
  if (!props.movementStates || props.movementStates.length === 0) return ''
  return props.movementStates.map(m => 
    `${m.actionNumber}:${m.currentX},${m.currentY},${m.isActive ? '1' : '0'},${m.currentFrameIndex}`
  ).join('|')
})

watch([
  paletteCode,
  () => props.backdropColor,
  () => props.spritePalette,
  spriteStateFingerprint,
  movementStateFingerprint,
  () => props.spriteEnabled,
  zoomLevel
], () => {
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
// Use watch instead of watchEffect to avoid conditional dependency tracking issues
watch(screenCanvas, (canvas) => {
  if (canvas) {
    scheduleRender()
  }
}, { immediate: true })
</script>

<template>
    <div class="screen-display">
      <div class="crt-bezel">
        <div class="crt-screen">
          <div class="crt-scanlines"></div>
          <canvas
            ref="screenCanvas"
            class="screen-canvas"
            :width="256"
            :height="240"
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

