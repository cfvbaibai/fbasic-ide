<script setup lang="ts">
import { provideSpriteViewerStore } from './composables/useSpriteViewerStore'
import SpriteControls from './components/SpriteControls.vue'
import SpriteGrid from './components/SpriteGrid.vue'
import ColorPaletteDisplay from './components/ColorPaletteDisplay.vue'
import PaletteCombinations from './components/PaletteCombinations.vue'
import DefSpriteStatement from './components/DefSpriteStatement.vue'

// Provide the store to all child components
provideSpriteViewerStore()
</script>

<template>
  <div class="sprite-viewer-container">
    <div class="viewer-header">
      <h1 class="viewer-title">Character Sprite Viewer</h1>
    </div>

    <div class="viewer-content">
      <SpriteControls />

      <SpriteGrid />

      <DefSpriteStatement />

      <ColorPaletteDisplay />

      <PaletteCombinations />
    </div>
  </div>
</template>

<style scoped>
.sprite-viewer-container {
  min-height: 100vh;
  background: var(--app-bg-color);
  padding: 2rem;
}

.viewer-header {
  background: var(--app-bg-color-page);
  border-bottom: 1px solid var(--app-border-color-light);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: var(--app-box-shadow-base);
}

.viewer-title {
  margin: 0;
  color: var(--app-text-color-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.viewer-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
