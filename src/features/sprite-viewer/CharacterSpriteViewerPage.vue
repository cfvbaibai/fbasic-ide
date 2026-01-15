<script setup lang="ts">
import { View } from '@element-plus/icons-vue'
import { provideSpriteViewerStore } from './composables/useSpriteViewerStore'
import { GameLayout, GameIcon } from '../../shared/components/ui'
import SpriteControls from './components/SpriteControls.vue'
import SpriteGrid from './components/SpriteGrid.vue'
import ColorPaletteDisplay from './components/ColorPaletteDisplay.vue'
import PaletteCombinations from './components/PaletteCombinations.vue'
import DefStatements from './components/DefStatements.vue'

// Provide the store to all child components
provideSpriteViewerStore()
</script>

<template>
  <GameLayout>
    <div class="sprite-viewer-container">
      <div class="sprite-viewer-header">
      <h1 class="sprite-viewer-title">
        <GameIcon :icon="View" />
        Character Sprite Viewer
      </h1>
    </div>

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

.sprite-viewer-header {
  flex: 0 0 auto;
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-bottom: 2px solid var(--game-card-border);
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow: var(--game-shadow-base);
  position: relative;
}

.sprite-viewer-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-glow) 50%, 
    transparent 100%
  );
  opacity: 0.5;
  border-radius: 12px 12px 0 0;
}

.sprite-viewer-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--game-text-primary);
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  text-shadow: 0 0 10px var(--game-accent-glow);
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
