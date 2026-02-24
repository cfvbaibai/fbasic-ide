<script setup lang="ts">
/**
 * BgGrid component - 28x21 canvas grid for BG Editor
 *
 * Uses double-layer canvas for performance:
 * - Bottom layer: Static grid content (only redrawn when grid changes)
 * - Top layer: Hover highlight (redrawn on mouse move)
 */

import { computed, nextTick, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { GameBlock, GameIconButton, GameSelect } from '@/shared/components/ui'

import { useBgEditorState } from '../composables/useBgEditorState'
import {
  getCanvasDimensions,
  getScaledCellSize,
  renderGridToCanvas,
  renderTilePreview,
} from '../composables/useBgRenderer'
import {
  BG_EDITOR_MODES,
  BG_GRID,
  DEFAULT_BG_PALETTE_CODE,
  DEFAULT_RENDER_SCALE,
  SCALE_OPTIONS,
} from '../constants'
import type { BgEditorMode } from '../types'

const { t } = useI18n()
const {
  grid,
  mode,
  setMode,
  clearGrid,
  copySource,
  moveSource,
  handleCellClick,
  selectedCharCode,
  selectedColorPattern,
} = useBgEditorState()

/** Canvas refs - two layers for performance */
const gridCanvasRef = useTemplateRef<HTMLCanvasElement>('gridCanvasRef')
const hoverCanvasRef = useTemplateRef<HTMLCanvasElement>('hoverCanvasRef')

/** Current scale */
const currentScale = ref(DEFAULT_RENDER_SCALE)

/** Computed canvas dimensions based on scale */
const canvasDimensions = computed(() => getCanvasDimensions(currentScale.value))

/** Grid cursor position for highlighting */
const hoverPosition = reactive({ x: -1, y: -1 })

/** Show grid lines toggle */
const showGridLines = ref(false)

/** Cached preview canvas for CHAR mode hover (recreated when selection/scale changes) */
let cachedPreviewCanvas: HTMLCanvasElement | null = null
let cachedPreviewKey = ''

/**
 * Get or create cached preview canvas for hover
 */
function getPreviewCanvas(): HTMLCanvasElement {
  const scaledCellSize = getScaledCellSize(currentScale.value)
  const key = `${selectedCharCode.value}-${selectedColorPattern.value}-${currentScale.value}`

  if (cachedPreviewCanvas && cachedPreviewKey === key) {
    return cachedPreviewCanvas
  }

  // Create new cached canvas
  cachedPreviewCanvas = document.createElement('canvas')
  cachedPreviewCanvas.width = scaledCellSize
  cachedPreviewCanvas.height = scaledCellSize
  renderTilePreview(
    cachedPreviewCanvas,
    selectedCharCode.value,
    selectedColorPattern.value,
    DEFAULT_BG_PALETTE_CODE,
    currentScale.value
  )
  cachedPreviewKey = key

  return cachedPreviewCanvas
}

/** Scale options for select */
const scaleSelectOptions = computed(() =>
  SCALE_OPTIONS.map(s => ({
    label: `${s}x`,
    value: s,
  }))
)

/** Mode options for toolbar */
const modes: { key: BgEditorMode; icon: string; title: string }[] = [
  { key: BG_EDITOR_MODES.SELECT, icon: 'mdi:cursor-default', title: t('bgEditor.toolbar.select') },
  { key: BG_EDITOR_MODES.COPY, icon: 'mdi:content-copy', title: t('bgEditor.toolbar.copy') },
  { key: BG_EDITOR_MODES.MOVE, icon: 'mdi:arrow-all', title: t('bgEditor.toolbar.move') },
  { key: BG_EDITOR_MODES.CHAR, icon: 'mdi:brush', title: t('bgEditor.toolbar.char') },
]

const currentMode = computed({
  get: () => mode.value,
  set: (value: BgEditorMode) => setMode(value),
})

function handleClear(): void {
  if (confirm(t('bgEditor.toolbar.clearConfirm'))) {
    clearGrid()
  }
}

/**
 * Handle canvas click
 */
function onClick(event: MouseEvent): void {
  const pos = getGridPosition(event)
  if (pos) {
    handleCellClick(pos.x, pos.y)
  }
}

/**
 * Handle mouse move for hover effect
 */
function onMouseMove(event: MouseEvent): void {
  const pos = getGridPosition(event)
  if (pos) {
    if (hoverPosition.x !== pos.x || hoverPosition.y !== pos.y) {
      hoverPosition.x = pos.x
      hoverPosition.y = pos.y
      renderHover()
    }
  }
}

/**
 * Handle mouse leave
 */
function onMouseLeave(): void {
  hoverPosition.x = -1
  hoverPosition.y = -1
  renderHover()
}

/**
 * Get canvas position from mouse event
 */
function getGridPosition(event: MouseEvent): { x: number; y: number } | null {
  const canvas = hoverCanvasRef.value
  if (!canvas) return null

  const scaledCellSize = getScaledCellSize(currentScale.value)
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  const x = Math.floor(((event.clientX - rect.left) * scaleX) / scaledCellSize)
  const y = Math.floor(((event.clientY - rect.top) * scaleY) / scaledCellSize)

  if (x >= 0 && x < BG_GRID.COLS && y >= 0 && y < BG_GRID.ROWS) {
    return { x, y }
  }
  return null
}

/**
 * Render the static grid layer (bottom canvas)
 */
function renderGrid(): void {
  const canvas = gridCanvasRef.value
  if (!canvas) return
  renderGridToCanvas(canvas, grid.value, {
    showGridLines: showGridLines.value,
    scale: currentScale.value,
  })
}

/**
 * Render the hover highlight layer (top canvas)
 */
function renderHover(): void {
  const canvas = hoverCanvasRef.value
  if (!canvas) return

  const scaledCellSize = getScaledCellSize(currentScale.value)
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Clear the hover layer
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw hover highlight if mouse is over a cell
  if (hoverPosition.x >= 0 && hoverPosition.y >= 0) {
    const hx = hoverPosition.x * scaledCellSize
    const hy = hoverPosition.y * scaledCellSize

    // In CHAR mode, show preview of selected item
    if (mode.value === BG_EDITOR_MODES.CHAR) {
      const previewCanvas = getPreviewCanvas()

      // Draw with semi-transparency
      ctx.globalAlpha = 0.7
      ctx.drawImage(previewCanvas, hx, hy)
      ctx.globalAlpha = 1
    } else {
      // Semi-transparent highlight overlay for other modes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fillRect(hx, hy, scaledCellSize, scaledCellSize)
    }

    // Border highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 2
    ctx.strokeRect(hx + 1, hy + 1, scaledCellSize - 2, scaledCellSize - 2)
  }
}

// Re-render when scale changes (wait for DOM to update canvas dimensions)
watch(currentScale, async () => {
  await nextTick()
  renderGrid()
  renderHover()
})

// Render grid when it changes
watch(grid, () => {
  renderGrid()
}, { deep: true })

// Re-render grid when grid lines toggle changes
watch(showGridLines, () => {
  renderGrid()
})

// Re-render hover when selected item changes (for CHAR mode preview)
watch([selectedCharCode, selectedColorPattern], () => {
  if (mode.value === BG_EDITOR_MODES.CHAR) {
    renderHover()
  }
})

// Re-render hover when mode changes
watch(mode, () => {
  renderHover()
})

// Setup canvas on mount
onMounted(() => {
  renderGrid()
})
</script>

<template>
  <GameBlock :title="t('bgEditor.grid.title')" class="bg-grid-block" no-hover-effect>
    <template #right>
      <div class="toolbar-controls">
        <!-- Mode buttons -->
        <GameIconButton
          v-for="m in modes"
          :key="m.key"
          :icon="m.icon"
          :title="m.title"
          size="small"
          :class="{ 'active-mode': currentMode === m.key }"
          @click="currentMode = m.key"
        />

        <div class="toolbar-divider"></div>

        <!-- Clear button -->
        <GameIconButton
          icon="mdi:delete"
          :title="t('bgEditor.toolbar.clear')"
          size="small"
          @click="handleClear"
        />

        <!-- Grid lines toggle -->
        <GameIconButton
          :icon="showGridLines ? 'mdi:grid' : 'mdi:grid-off'"
          :title="showGridLines ? t('bgEditor.grid.hideGridLines') : t('bgEditor.grid.showGridLines')"
          size="small"
          @click="showGridLines = !showGridLines"
        />

        <div class="toolbar-divider"></div>

        <!-- Scale selector -->
        <GameSelect
          :model-value="currentScale"
          :options="scaleSelectOptions"
          size="small"
          width="65px"
          @update:model-value="currentScale = $event as number"
        />
      </div>
    </template>
    <div class="bg-grid-container">
      <!-- Double-layer canvas for performance -->
      <div class="canvas-wrapper">
        <canvas
          ref="gridCanvasRef"
          class="bg-grid-canvas grid-layer"
          :width="canvasDimensions.width"
          :height="canvasDimensions.height"
        />
        <canvas
          ref="hoverCanvasRef"
          class="bg-grid-canvas hover-layer"
          :width="canvasDimensions.width"
          :height="canvasDimensions.height"
          @click="onClick"
          @mousemove="onMouseMove"
          @mouseleave="onMouseLeave"
        />
      </div>

      <!-- Mode indicators -->
      <div v-if="copySource" class="mode-indicator copy-indicator">
        {{ t('bgEditor.grid.selectDestination') }}
      </div>
      <div v-if="moveSource" class="mode-indicator move-indicator">
        {{ t('bgEditor.grid.selectDestination') }}
      </div>
    </div>
  </GameBlock>
</template>

<style scoped>
/* BgGrid wrapper - fill available space */
.bg-grid-block {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--game-surface-border);
  margin: 0 0.25rem;
}

.active-mode {
  color: var(--base-solid-primary) !important;
  background: var(--base-alpha-primary-20) !important;
}

.bg-grid-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 0;
  padding: 1rem;
  overflow: auto;
}

.canvas-wrapper {
  position: relative;
  border: 4px solid var(--game-surface-border);
  border-radius: 4px;
  box-shadow:
    0 0 20px var(--base-alpha-gray-00-80),
    inset 0 0 20px var(--base-alpha-primary-10);
}

.bg-grid-canvas {
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.grid-layer {
  /* Bottom layer - static grid content */
}

.hover-layer {
  /* Top layer - hover highlight only */
  position: absolute;
  top: 0;
  left: 0;
  cursor: cell;

  /* Pointer events only on hover layer */
}

.mode-indicator {
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--game-font-family-heading);
  color: var(--game-text-contrast);
  pointer-events: none;
}

.copy-indicator {
  background: var(--semantic-solid-info);
}

.move-indicator {
  background: var(--semantic-solid-warning);
}
</style>
