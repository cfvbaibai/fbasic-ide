<script setup lang="ts">
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'

const store = useSpriteViewerStore()
</script>

<template>
  <div class="sprite-display-section">
    <h2 class="section-title">
      <span v-if="store.selectedSprite.value">
        {{ store.selectedSprite.value.name }} - 16×16 Sprite
      </span>
      <span v-else>
        16×16 Sprite
      </span>
    </h2>
    <div class="grid-container">
      <div
        v-for="(row, rowIndex) in store.sprite16x16.value"
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
  background: var(--app-bg-color-page);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--app-box-shadow-base);
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: var(--app-text-color-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.grid-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #000000;
  padding: 0;
  border-radius: 4px;
  border: 8px solid #222222;
  width: fit-content;
  margin: 0 auto;
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
  background-color: var(--app-bg-color-page);
  transition: transform 0.1s;
}

.grid-cell-bordered {
  border: 1px solid var(--app-border-color);
}

.grid-cell:hover {
  transform: scale(1.1);
  z-index: 1;
  position: relative;
  box-shadow: var(--app-box-shadow-dark);
}

.cell-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--app-text-color-regular);
  user-select: none;
}
</style>

