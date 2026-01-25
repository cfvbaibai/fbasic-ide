<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useSpriteViewerStore } from '@/features/sprite-viewer/composables/useSpriteViewerStore'
import { GameButton, GameButtonGroup } from '@/shared/components/ui'

import ColorBox from './ColorBox.vue'

/**
 * PaletteSelector component - Selector for choosing sprite palette codes.
 */
defineOptions({
  name: 'PaletteSelector'
})

const { t } = useI18n()
const store = useSpriteViewerStore()
</script>

<template>
  <div class="control-group" v-if="store.selectedSprite.value">
    <label for="palette-code">{{ t('spriteViewer.controls.paletteCode') }}</label>
    <GameButtonGroup>
      <GameButton
        v-for="paletteIdx in 3"
        :key="paletteIdx - 1"
        variant="toggle"
        :selected="store.selectedPaletteCode.value === paletteIdx - 1"
        @click="store.setPaletteCode(paletteIdx - 1)"
      >
        {{ paletteIdx - 1 }}
      </GameButton>
    </GameButtonGroup>
    <label for="color-combination">{{ t('spriteViewer.controls.colorCombination') }}</label>
    <GameButtonGroup>
      <GameButton
        v-for="combIdx in 4"
        :key="combIdx - 1"
        variant="toggle"
        :selected="store.selectedColorCombination.value === combIdx - 1"
        @click="store.setColorCombination(combIdx - 1)"
      >
        {{ combIdx - 1 }}
      </GameButton>
    </GameButtonGroup>
    <div class="selected-colors-preview bg-game-surface border-game-surface-2 shadow-game-base">
      <div
        v-for="(colorCode, idx) in store.selectedColorCombinationColors.value"
        :key="idx"
        class="preview-color-wrapper"
      >
        <ColorBox :color-code="colorCode" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.control-group label {
  font-weight: 600;
  color: var(--game-text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.selected-colors-preview {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-left: 1rem;
  padding: 0.5rem;
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 8px;
  box-shadow: var(--game-shadow-base);
}

.preview-color-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px var(--base-alpha-gray-00-30);
}
</style>

