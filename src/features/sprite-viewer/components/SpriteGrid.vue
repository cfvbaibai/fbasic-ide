<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'
import { GameBlock } from '../../../shared/components/ui'

/**
 * SpriteGrid component - Displays the sprite grid with color visualization.
 */
defineOptions({
  name: 'SpriteGrid'
})

const { t } = useI18n()
const store = useSpriteViewerStore()

const title = computed(() => {
  if (store.selectedSprite.value) {
    return t('spriteViewer.spriteGrid.titleWithSize', {
      name: store.selectedSprite.value.name,
      width: store.spriteSize.value.width,
      height: store.spriteSize.value.height
    })
  }
  return t('spriteViewer.spriteGrid.title')
})
</script>

<template>
  <GameBlock :title="title">
    <div 
      class="grid-container" 
      :class="{ 
        'grid-container-8x8': store.spriteSize.value.width === 8,
        'grid-container-16x32': store.spriteSize.value.width === 16 && store.spriteSize.value.height === 32,
        'grid-container-48x8': store.spriteSize.value.width === 48 && store.spriteSize.value.height === 8
      }"
    >
      <div
        v-for="(row, rowIndex) in store.spriteGrid.value"
        :key="rowIndex"
        class="grid-row"
      >
        <div
          v-for="(value, colIndex) in row"
          :key="colIndex"
          class="grid-cell"
          :class="{ 'grid-cell-bordered': store.displayOptions.value.showGridLines }"
          :style="{
            backgroundColor: store.getCellColor(value)
          }"
          :title="t('spriteViewer.spriteGrid.cellTooltip', { row: rowIndex, col: colIndex, value })"
        >
          <span v-if="store.displayOptions.value.showValues" class="cell-value">{{ value }}</span>
        </div>
      </div>
    </div>
  </GameBlock>
</template>

<style scoped>

.grid-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--base-solid-gray-00);
  padding: 0;
  border-radius: 4px;
  border: 8px solid var(--game-surface-border);
  width: fit-content;
  margin: 0 auto;
  box-shadow: 
    0 0 20px var(--base-alpha-gray-00-80),
    inset 0 0 20px var(--base-alpha-primary-10);
}

.grid-container-8x8 {
  border: 4px solid var(--game-surface-border);
}

.grid-container-16x32 {
  border: 8px solid var(--game-surface-border);
}

.grid-container-48x8 {
  border: 8px solid var(--game-surface-border);
}

.grid-row {
  display: flex;
  gap: 0;
}

.grid-cell {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0;
  background-color: transparent;
  transition: all 0.2s ease;
}

.grid-cell-bordered {
  border: 1px solid var(--game-surface-border);
}

.grid-cell:hover {
  transform: scale(1.1);
  z-index: 1;
  position: relative;
  box-shadow: 0 0 12px var(--game-accent-glow);
}

.cell-value {
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--game-font-family-mono);
  color: var(--game-text-primary);
  text-shadow: 
    1px 1px 2px var(--base-alpha-gray-00-80),
    0 0 4px var(--game-accent-glow);
  user-select: none;
}
</style>

