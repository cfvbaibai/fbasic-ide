<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { provideSpriteViewerStore } from './composables/useSpriteViewerStore'
import { GameLayout } from '../../shared/components/ui'
import SpriteControls from './components/SpriteControls.vue'
import SpriteGrid from './components/SpriteGrid.vue'
import ColorPaletteDisplay from './components/ColorPaletteDisplay.vue'
import PaletteCombinations from './components/PaletteCombinations.vue'
import DefStatements from './components/DefStatements.vue'

/**
 * CharacterSpriteViewerPage component - Main page for viewing and editing character sprites.
 * Provides sprite selection, grid display, palette management, and DEF SPRITE statement generation.
 */
defineOptions({
  name: 'CharacterSpriteViewerPage'
})

const { t } = useI18n()

// Provide the store to all child components
provideSpriteViewerStore()
</script>

<template>
  <GameLayout
    :title="t('spriteViewer.title')"
    icon="mdi:eye"
  >
    <div class="sprite-viewer-container">

    <div class="sprite-viewer-content">
      <SpriteControls />

      <SpriteGrid />

      <DefStatements />

      <ColorPaletteDisplay />

      <PaletteCombinations />
    </div>
    </div>
  </GameLayout>
</template>

<style scoped>
.sprite-viewer-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.sprite-viewer-content {
  flex: 1 1 0;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem;
}
</style>
