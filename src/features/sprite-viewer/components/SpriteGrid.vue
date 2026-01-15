<script setup lang="ts">
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'

const store = useSpriteViewerStore()
</script>

<template>
  <div class="sprite-display-section">
    <h2 class="section-title">
      <span v-if="store.selectedSprite.value">
        {{ store.selectedSprite.value.name }} - {{ store.spriteSize.value.width }}×{{ store.spriteSize.value.height }} Sprite
      </span>
      <span v-else>
        Sprite
      </span>
    </h2>
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
          :title="`Row ${rowIndex}, Col ${colIndex}: Value ${value}`"
        >
          <span v-if="store.displayOptions.value.showValues" class="cell-value">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sprite-display-section {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 2px solid var(--game-card-border);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--game-shadow-base);
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: var(--game-text-primary);
  font-family: var(--game-font-family-heading);
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.grid-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #000000;
  padding: 0;
  border-radius: 4px;
  border: 8px solid var(--game-card-border);
  width: fit-content;
  margin: 0 auto;
  box-shadow: 
    0 0 20px rgba(0, 0, 0, 0.8),
    inset 0 0 20px rgba(0, 255, 136, 0.1);
}

.grid-container-8x8 {
  border: 4px solid var(--game-card-border);
}

.grid-container-16x32 {
  border: 8px solid var(--game-card-border);
}

.grid-container-48x8 {
  border: 8px solid var(--game-card-border);
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
  border: 1px solid rgba(255, 255, 255, 0.15);
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
    1px 1px 2px rgba(0, 0, 0, 0.8),
    0 0 4px rgba(0, 255, 136, 0.5);
  user-select: none;
}
</style>

