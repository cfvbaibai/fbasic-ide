<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { GameBlock } from '@/shared/components/ui'

import ColorBox from './ColorBox.vue'

/**
 * ColorPaletteDisplay component - Displays the full color palette in a grid.
 */
defineOptions({
  name: 'ColorPaletteDisplay'
})

const { t } = useI18n()
</script>

<template>
  <GameBlock :title="t('spriteViewer.colorPalette.title')">
    <div class="palette-container">
      <div
        v-for="row in 4"
        :key="row"
        class="palette-row"
      >
        <div
          v-for="col in 16"
          :key="col"
          class="palette-color-wrapper"
        >
          <ColorBox :color-code="(row - 1) * 16 + (col - 1)" />
        </div>
      </div>
    </div>
  </GameBlock>
</template>

<style scoped>

.palette-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 100%;
  overflow-x: auto;
  padding: 8px 0;
}

.palette-row {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 8px;
  min-width: fit-content;
}

.palette-color-wrapper {
  width: 60px;
  height: 60px;
}
</style>

