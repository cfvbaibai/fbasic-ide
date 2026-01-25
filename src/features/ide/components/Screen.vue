<script setup lang="ts">
import Konva from 'konva'
import { computed, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import type { ScreenCell } from '@/core/interfaces'
import type { MovementState, SpriteState } from '@/core/sprite/types'
import { preInitializeBackgroundTiles } from '@/features/ide/composables/useKonvaBackgroundRenderer'
import {
  initializeKonvaLayers,
  type KonvaScreenLayers,
  renderAllScreenLayers,
} from '@/features/ide/composables/useKonvaScreenRenderer'
import { useMovementStateSync } from '@/features/ide/composables/useMovementStateSync'
import { useRenderQueue } from '@/features/ide/composables/useRenderQueue'
import { useScreenAnimationLoop } from '@/features/ide/composables/useScreenAnimationLoop'
import { useScreenZoom } from '@/features/ide/composables/useScreenZoom'
import { COLORS } from '@/shared/data/palette'
import type { VueKonvaStageInstance } from '@/types/vue-konva'

/**
 * Screen component - Renders the F-BASIC screen buffer using Konva.js
 */
defineOptions({
  name: 'Screen',
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
  spriteEnabled: false,
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
  // External sprite node maps (for message handler to get actual positions)
  externalFrontSpriteNodes?: Map<number, unknown>
  externalBackSpriteNodes?: Map<number, unknown>
}

// Konva Stage reference
const stageRef = useTemplateRef<VueKonvaStageInstance>('stageRef')

// Use bgPalette from props instead of hardcoded value
const paletteCode = computed(() => props.bgPalette ?? 1)

// Computed backdrop color hex
const backdropColorHex = computed(() => {
  const colorCode = props.backdropColor ?? 0
  return COLORS[colorCode] ?? COLORS[0] ?? '#000000'
})

// Use shared zoom state composable
const { zoomLevel } = useScreenZoom()

// Base screen dimensions (full backdrop/sprite screen: 256×240)
const BASE_WIDTH = 256
const BASE_HEIGHT = 240

// Computed stage display dimensions based on zoom (for CSS scaling)
const stageDisplayWidth = computed(() => BASE_WIDTH * zoomLevel.value)
const stageDisplayHeight = computed(() => BASE_HEIGHT * zoomLevel.value)

// Konva layers
const layers = ref<KonvaScreenLayers>({
  backdropLayer: null,
  spriteBackLayer: null,
  backgroundLayer: null,
  spriteFrontLayer: null,
})

// Sprite node maps for animated sprite updates
const frontSpriteNodes = ref<Map<number, Konva.Image>>(new Map())
const backSpriteNodes = ref<Map<number, Konva.Image>>(new Map())

// Track if a render is in progress to prevent overlapping renders
let renderInProgress = false

// Note: pendingBackgroundUpdate removed - static rendering happens immediately via watchers

/**
 * Initialize Konva Stage and layers
 */
async function initializeKonva(): Promise<void> {
  if (!stageRef.value) return

  // Get the Konva stage node from vue-konva ref
  const stageNode = stageRef.value?.getNode() ?? stageRef.value?.getStage?.() ?? null
  if (!stageNode) {
    console.error('[Screen] Failed to get Konva stage node')
    return
  }

  // Pre-initialize background tile images in the background (non-blocking)
  // This ensures all tile images are ready before rendering
  // Start immediately but don't wait - images will be created on-demand if not ready
  void preInitializeBackgroundTiles().catch(err => {
    console.warn('[Screen] Background tile pre-initialization failed:', err)
  })

  // Initialize layers (backdrop is managed by vue-konva template, so we don't need to access it)
  layers.value = initializeKonvaLayers(stageNode)
  // Backdrop layer is managed by template, so we leave it as null
  layers.value.backdropLayer = null

  // Initial render
  await scheduleRender()
}

/**
 * Render all screen layers using Konva
 */
async function render(): Promise<void> {
  if (!stageRef.value || renderInProgress) return

  renderInProgress = true
  try {
    // Determine if background should be cached (static when no active movements)
    const hasActiveMovements = localMovementStates.value.some(m => m.isActive)
    const backgroundShouldCache = !hasActiveMovements

    // Render all layers (backdrop is managed by template, so we pass null)
    const layersToRender: KonvaScreenLayers = {
      backdropLayer: null, // Backdrop is managed by vue-konva template
      spriteBackLayer: layers.value.spriteBackLayer as Konva.Layer | null,
      backgroundLayer: layers.value.backgroundLayer as Konva.Layer | null,
      spriteFrontLayer: layers.value.spriteFrontLayer as Konva.Layer | null,
    }
    const { frontSpriteNodes: frontNodes, backSpriteNodes: backNodes } = await renderAllScreenLayers(
      layersToRender,
      props.screenBuffer,
      props.spriteStates ?? [],
      localMovementStates.value,
      paletteCode.value,
      props.spritePalette ?? 1,
      props.backdropColor ?? 0,
      props.spriteEnabled ?? false,
      backgroundShouldCache,
      frontSpriteNodes.value as Map<number, Konva.Image>,
      backSpriteNodes.value as Map<number, Konva.Image>
    )

    // Update sprite node maps
    frontSpriteNodes.value = frontNodes as Map<number, Konva.Image>
    backSpriteNodes.value = backNodes as Map<number, Konva.Image>

    // Sync with external sprite node maps (for message handler access)
    if (props.externalFrontSpriteNodes) {
      props.externalFrontSpriteNodes.clear()
      for (const [key, value] of frontNodes.entries()) {
        props.externalFrontSpriteNodes.set(key, value)
      }
    }
    if (props.externalBackSpriteNodes) {
      props.externalBackSpriteNodes.clear()
      for (const [key, value] of backNodes.entries()) {
        props.externalBackSpriteNodes.set(key, value)
      }
    }
  } catch (error) {
    console.error('[Screen] Error rendering screen layers:', error)
  } finally {
    renderInProgress = false
  }
}

// Synchronize movement states from parent (with local mutable copy for animation)
// When new MOVE commands are added, trigger a full render to show initial state
const { localMovementStates } = useMovementStateSync({
  movementStates: computed(() => props.movementStates),
  onSync: () => scheduleRender(),
})

// Watch paletteCode, backdropColor, spritePalette, sprite states, and sprite enabled to trigger re-render
// These are STATIC rendering changes (CGSET, COLOR, SPRITE, etc.) - render immediately
// Combined watcher for better performance (Vue 3 best practice)
// Use computed to extract sprite state fingerprint for efficient change detection
const spriteStateFingerprint = computed(() => {
  if (!props.spriteStates || props.spriteStates.length === 0) return ''
  // Create a fingerprint from sprite properties we care about for rendering
  return props.spriteStates.map(s => `${s.spriteNumber}:${s.x},${s.y},${s.visible ? '1' : '0'},${s.priority}`).join('|')
})

watch(
  [
    paletteCode,
    () => props.backdropColor,
    () => props.spritePalette,
    spriteStateFingerprint,
    () => props.spriteEnabled,
    zoomLevel,
  ],
  () => {
    // Static rendering - execute immediately, no waiting
    // Animation loop only handles MOVE animations, not static rendering
    scheduleRender()
  }
)

// Render queue using requestAnimationFrame for optimal browser rendering alignment
// This ensures updates are processed in order and aligned with browser refresh cycle
const { schedule: scheduleRender, cleanup: cleanupRenderQueue } = useRenderQueue(async () => {
  await render()
})

// Watch screenBuffer and render when it changes (PRINT command - static rendering)
// Static rendering should execute immediately, no waiting for animation loop
// Use deep watch to detect all cell changes (not just array reference changes)
// Use flush: 'post' to ensure we render after all synchronous updates are complete
// The scheduleRender function handles FIFO ordering and throttling
watch(
  () => props.screenBuffer,
  () => {
    // PRINT command changes - queue render with FIFO ordering and throttling
    // Animation loop only handles MOVE animations, not static PRINT rendering
    scheduleRender()
  },
  { immediate: true, deep: true, flush: 'post' }
)

// Backdrop is managed by vue-konva template via backdropColorHex computed property

// Initial render when stage becomes available
watch(
  stageRef,
  async stage => {
    if (stage) {
      await initializeKonva()
    }
  },
  { immediate: true }
)

// Setup animation loop - ONLY for MOVE command animations
// Static rendering (PRINT, SPRITE, CGSET, COLOR) is handled by watchers above
const stopAnimationLoop = useScreenAnimationLoop({
  localMovementStates,
  layers,
  frontSpriteNodes,
  backSpriteNodes,
  spritePalette: computed(() => props.spritePalette ?? 1),
})

// Stop animation loop and cancel pending renders when component unmounts
onUnmounted(() => {
  stopAnimationLoop()
  cleanupRenderQueue()
})
</script>

<template>
  <div class="screen-display">
    <div class="crt-bezel">
      <div class="crt-screen">
        <div class="crt-scanlines"></div>
        <div
          class="screen-stage-wrapper"
          :style="{
            width: `${stageDisplayWidth}px`,
            height: `${stageDisplayHeight}px`,
          }"
        >
          <v-stage
            ref="stageRef"
            class="screen-stage"
            :config="{
              width: BASE_WIDTH,
              height: BASE_HEIGHT,
            }"
            :style="{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
            }"
          >
          <v-layer>
            <!-- Backdrop Screen (F-Basic layer 1: furthest back) -->
            <!-- 32×30 characters = 256×240 pixels -->
            <v-rect
              :config="{
                x: 0,
                y: 0,
                width: BASE_WIDTH,
                height: BASE_HEIGHT,
                fill: backdropColorHex,
              }"
            />
            <!-- Additional layers (sprite back, background, sprite front) will be added programmatically -->
          </v-layer>
          </v-stage>
        </div>
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
  background: linear-gradient(
    135deg,
    var(--game-screen-header-bg) 0%,
    var(--crt-border-color) 50%,
    var(--game-screen-header-bg) 100%
  );
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
  background: linear-gradient(
    135deg,
    var(--base-solid-gray-30) 0%,
    var(--base-solid-gray-50) 50%,
    var(--base-solid-gray-30) 100%
  );
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

.screen-stage-wrapper {
  position: relative;
  z-index: 0;
  overflow: hidden;
}

.screen-stage {
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  filter: brightness(1.05) contrast(1.1);
}
</style>
