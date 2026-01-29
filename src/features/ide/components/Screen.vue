<script setup lang="ts">
import Konva from 'konva'
import { computed, onUnmounted, ref, toValue, useTemplateRef, watch } from 'vue'

import type { SharedDisplayViews } from '@/core/animation/sharedDisplayBuffer'
import {
  readScreenStateFromShared,
  readSequence,
} from '@/core/animation/sharedDisplayBuffer'
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
import { logScreen } from '@/shared/logger'
import type { VueKonvaStageInstance } from '@/types/vue-konva'

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
  cgenMode: 2,
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
  cgenMode?: number
  spriteStates?: SpriteState[]
  movementStates?: MovementState[]
  spriteEnabled?: boolean
  // External sprite node maps (for message handler to get actual positions)
  externalFrontSpriteNodes?: Map<number, unknown>
  externalBackSpriteNodes?: Map<number, unknown>
  /** Shared animation state view (Float64Array). Main thread writes positions + isActive each frame. */
  sharedAnimationView?: Float64Array
  /** Shared display buffer views; when present, render path reads sequence and decodes instead of using props. */
  sharedDisplayViews?: SharedDisplayViews
  /** Called after decoding shared buffer to update parent refs (screenBuffer, cursorX, etc.). */
  setDecodedScreenState?: (decoded: import('@/core/animation/sharedDisplayBuffer').DecodedScreenState) => void
  /** Register this component's scheduleRender so parent can trigger render on SCREEN_CHANGED. */
  registerScheduleRender?: (fn: () => void) => void
}

/** Deep copy of screen buffer for dirty diff (last rendered state) */
function deepCopyBuffer(buf: ScreenCell[][]): ScreenCell[][] {
  return buf.map(row => row.map(c => ({ ...c })))
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

// Dirty background: last rendered buffer for diff; grid of "y,x" -> Konva.Image for per-cell updates
const lastBackgroundBufferRef = ref<ScreenCell[][] | null>(null)
const backgroundNodeGridRef = ref<Map<string, Konva.Image>>(new Map())

// Shared buffer path: last sequence and last decoded buffer (so we only decode when sequence changes)
const lastSequenceRef = ref(-1)
const lastDecodedBufferRef = ref<ScreenCell[][] | null>(null)

// Render reason: bufferOnly = only screenBuffer changed (PRINT); full = sprite/palette/backdrop/etc
type RenderReason = 'full' | 'bufferOnly'
const pendingRenderReasonRef = ref<RenderReason>('full')

// When animation is active: static render is deferred to end of frame (animation first)
const pendingStaticRenderRef = ref(false)

// Track if a render is in progress to prevent overlapping renders
let renderInProgress = false

/**
 * Initialize Konva Stage and layers
 */
async function initializeKonva(): Promise<void> {
  if (!stageRef.value) return

  // Get the Konva stage node from vue-konva ref
  const stageNode = stageRef.value?.getNode() ?? stageRef.value?.getStage?.() ?? null
  if (!stageNode) {
    logScreen.error('Failed to get Konva stage node')
    return
  }

  // Pre-initialize background tile images in the background (non-blocking)
  // This ensures all tile images are ready before rendering
  // Start immediately but don't wait - images will be created on-demand if not ready
  void preInitializeBackgroundTiles().catch(err => {
    logScreen.warn('Background tile pre-initialization failed:', err)
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
    // Shared buffer path: read sequence; if changed (or first run), decode and update parent refs
    let bufferToRender: ScreenCell[][] = props?.screenBuffer ?? []
    if (props?.sharedDisplayViews) {
      const seq = readSequence(props.sharedDisplayViews)
      if (seq !== lastSequenceRef.value || lastDecodedBufferRef.value === null) {
        const decoded = readScreenStateFromShared(props.sharedDisplayViews)
        props.setDecodedScreenState?.(decoded)
        lastSequenceRef.value = seq
        lastDecodedBufferRef.value = decoded.buffer
      }
      bufferToRender = lastDecodedBufferRef.value ?? (props?.screenBuffer ?? [])
    }

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
    // Use props count when ahead of local (log: all 8 START_MOVEMENTs in one rAF; sync watch can run after render())
    const propsMovementCount = props.movementStates?.length ?? 0
    const localMovementCount = localMovementStates.value.length
    const movementCount = Math.max(propsMovementCount, localMovementCount)
    const spriteNodeCount = frontSpriteNodes.value.size + backSpriteNodes.value.size
    const needSpriteBuild =
      movementCount > 0 && (spriteNodeCount === 0 || spriteNodeCount < movementCount)
    const backgroundOnly =
      !needSpriteBuild && pendingRenderReasonRef.value === 'bufferOnly'
    // When props is ahead, pass props so we build all sprites; else use local (mutable state)
    const movementsToRender =
      propsMovementCount > localMovementCount && (props.movementStates?.length ?? 0) > 0
        ? (props.movementStates ?? [])
        : localMovementStates.value
    if (needSpriteBuild || !backgroundOnly) {
      logScreen.debug('render', {
        movementCount,
        propsMovementCount,
        localMovementCount,
        spriteNodeCount,
        needSpriteBuild,
        backgroundOnly,
        reason: pendingRenderReasonRef.value,
      })
    }
    // Only use dirty background when buffer-only; full render (palette/sprite/backdrop) does full replace
    const lastBackgroundBuffer =
      backgroundOnly ? lastBackgroundBufferRef.value : null
    const { frontSpriteNodes: frontNodes, backSpriteNodes: backNodes } =
      await renderAllScreenLayers(
        layersToRender,
        bufferToRender,
        props.spriteStates ?? [],
        movementsToRender,
        paletteCode.value,
        props.spritePalette ?? 1,
        props.backdropColor ?? 0,
        props.spriteEnabled ?? false,
        backgroundShouldCache,
        frontSpriteNodes.value as Map<number, Konva.Image>,
        backSpriteNodes.value as Map<number, Konva.Image>,
        {
          backgroundOnly,
          lastBackgroundBuffer,
          backgroundNodeGridRef: backgroundNodeGridRef.value as Map<
            string,
            Konva.Image
          >,
        }
      )

    // After background render, store buffer for next dirty diff
    lastBackgroundBufferRef.value = deepCopyBuffer(bufferToRender)

    if (!backgroundOnly) {
      frontSpriteNodes.value = frontNodes as Map<number, Konva.Image>
      backSpriteNodes.value = backNodes as Map<number, Konva.Image>
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
    }
  } catch (error) {
    logScreen.error('Error rendering screen layers:', error)
  } finally {
    renderInProgress = false
  }
}

// Synchronize movement states from parent (with local mutable copy for animation)
// When new MOVE commands are added, trigger a full render to show initial state
const { localMovementStates } = useMovementStateSync({
  movementStates: computed(() => props.movementStates),
  onSync: () => {
    logScreen.debug(
      'sync',
      'props.movementStates=',
      props.movementStates?.length ?? 0,
      'localMovementStates=',
      localMovementStates.value.length
    )
    pendingRenderReasonRef.value = 'full'
    scheduleRender()
  },
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
    pendingRenderReasonRef.value = 'full'
    scheduleRender()
  }
)

// Render queue: when animation is active, sets pending static render so animation loop runs render at end of frame
const { schedule: scheduleRender, cleanup: cleanupRenderQueue } = useRenderQueue(
  async () => {
    await render()
  },
  {
    hasActiveMovements: () =>
      localMovementStates.value.some(m => m.isActive),
    setPendingStaticRender: (v: boolean) => {
      pendingStaticRenderRef.value = v
    },
  }
)

// Register scheduleRender with parent so SCREEN_CHANGED can trigger a redraw (shared buffer path)
watch(
  () => props.registerScheduleRender,
  fn => {
    if (fn) fn(scheduleRender)
  },
  { immediate: true }
)

// Watch screenBuffer and render when it changes (PRINT). Use full when movements > nodes.
// When using shared buffer, SCREEN_CHANGED triggers scheduleRender; this watch still runs for ref updates.
watch(
  () => props?.screenBuffer,
  () => {
    const movementCount = props.movementStates?.length ?? 0
    const spriteNodeCount = frontSpriteNodes.value.size + backSpriteNodes.value.size
    const useFull = movementCount > spriteNodeCount
    if (useFull) {
      logScreen.debug(
        'screenBuffer watch → full',
        'movementCount=',
        movementCount,
        'spriteNodeCount=',
        spriteNodeCount
      )
    }
    pendingRenderReasonRef.value = useFull ? 'full' : 'bufferOnly'
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
// When movements are active, run pending static render at end of frame (animation first, then render)
const stopAnimationLoop = useScreenAnimationLoop({
  localMovementStates,
  layers,
  frontSpriteNodes,
  backSpriteNodes,
  spritePalette: computed(() => props.spritePalette ?? 1),
  sharedAnimationView: toValue(() => props.sharedAnimationView),
  getPendingStaticRender: () => pendingStaticRenderRef.value,
  onRunPendingStaticRender: async () => {
    await render()
    pendingStaticRenderRef.value = false
  },
  onAnimationStopped: () => {
    if (pendingStaticRenderRef.value) scheduleRender()
  },
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
@import url('@/shared/styles/screen-crt.css');
</style>
