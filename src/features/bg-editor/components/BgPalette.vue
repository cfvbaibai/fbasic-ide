<script setup lang="ts">
/**
 * BgPalette component - Tab-based character palette for selecting BG characters
 */

import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { GameTabPane, GameTabs } from '@/shared/components/ui'
import {
  KANA_BG_ITEMS,
  LETTER_BG_ITEMS,
  NUMBER_BG_ITEMS,
  PICTURE_BG_ITEMS,
  SYMBOL_BG_ITEMS,
} from '@/shared/data/bg'
import type { BackgroundItem } from '@/shared/data/types'

import { useBgEditorState } from '../composables/useBgEditorState'
import { renderTilePreview } from '../composables/useBgRenderer'
import { BG_GRID, DEFAULT_BG_PALETTE_CODE, DEFAULT_RENDER_SCALE } from '../constants'
import type { BgCharCategory, ColorPattern } from '../types'

const { t } = useI18n()
const { selectedCharCode, selectedColorPattern, setSelectedCharCode } = useBgEditorState()

const activeTab = ref<string>('pictures')

const categories: { key: BgCharCategory; label: string; items: BackgroundItem[] }[] = [
  { key: 'pictures', label: t('bgEditor.palette.pictures'), items: PICTURE_BG_ITEMS },
  { key: 'letters', label: t('bgEditor.palette.letters'), items: LETTER_BG_ITEMS },
  { key: 'numbers', label: t('bgEditor.palette.numbers'), items: NUMBER_BG_ITEMS },
  { key: 'symbols', label: t('bgEditor.palette.symbols'), items: SYMBOL_BG_ITEMS },
  { key: 'kana', label: t('bgEditor.palette.kana'), items: KANA_BG_ITEMS },
]

const currentItems = computed(() => {
  const category = categories.find(c => c.key === activeTab.value)
  return category?.items ?? []
})

/** Cell size for palette preview */
const PALETTE_CELL_SIZE = BG_GRID.CELL_SIZE * DEFAULT_RENDER_SCALE

/**
 * Render a tile to a canvas element
 */
function renderTileToCanvas(charCode: number, colorPattern: ColorPattern): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas')
  canvas.width = PALETTE_CELL_SIZE
  canvas.height = PALETTE_CELL_SIZE

  try {
    renderTilePreview(canvas, charCode, colorPattern, DEFAULT_BG_PALETTE_CODE)
    return canvas
  } catch {
    return null
  }
}

// Cache for tile canvases
const tileCache = ref<Map<string, HTMLCanvasElement>>(new Map())

/**
 * Get or create cached tile canvas
 */
function getTileCanvas(item: BackgroundItem): HTMLCanvasElement | null {
  const key = `${item.code}-${selectedColorPattern.value}`

  if (tileCache.value.has(key)) {
    return tileCache.value.get(key) ?? null
  }

  const canvas = renderTileToCanvas(item.code, selectedColorPattern.value)
  if (canvas) {
    tileCache.value.set(key, canvas)
  }
  return canvas
}

/**
 * Handle item selection
 */
function selectItem(item: BackgroundItem): void {
  setSelectedCharCode(item.code)
}

/**
 * Handle canvas ref callback
 */
function handleCanvasRef(el: unknown, item: BackgroundItem): void {
  if (el && el instanceof HTMLCanvasElement) {
    const canvas = getTileCanvas(item)
    if (canvas) {
      const ctx = el.getContext('2d')
      if (ctx) {
        el.width = PALETTE_CELL_SIZE
        el.height = PALETTE_CELL_SIZE
        ctx.drawImage(canvas, 0, 0)
      }
    }
  }
}

// Clear cache when color pattern changes
watch(selectedColorPattern, () => {
  tileCache.value.clear()
})

// Pre-render visible tiles on mount
onMounted(() => {
  tileCache.value = new Map()
})
</script>

<template>
  <GameTabs v-model="activeTab" type="border-card" class="bg-palette">
    <GameTabPane
      v-for="category in categories"
      :key="category.key"
      :name="category.key"
      :label="category.label"
    >
      <div class="palette-grid">
        <div
          v-for="item in currentItems"
          :key="item.code"
          class="palette-item"
          :class="{ 'palette-item-selected': selectedCharCode === item.code }"
          @click="selectItem(item)"
        >
          <canvas
            :ref="(el: unknown) => handleCanvasRef(el, item)"
            class="palette-canvas"
          />
        </div>
      </div>
    </GameTabPane>
  </GameTabs>
</template>

<style scoped>
.bg-palette {
  flex: 1;
  min-height: 0;
}

.bg-palette :deep(.game-tab-pane-body) {
  padding: 0;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(28px, 1fr));
  gap: 4px;
  padding: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.palette-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  background: var(--game-surface-bg-start);
  transition: all 0.15s ease;
}

.palette-item:hover {
  border-color: var(--base-solid-primary);
  box-shadow: 0 0 8px var(--game-accent-glow);
}

.palette-item-selected {
  border-color: var(--base-solid-primary);
  background: var(--game-surface-bg-start);
  box-shadow: 0 0 12px var(--game-accent-glow);
}

.palette-canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
