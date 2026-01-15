<script setup lang="ts">
import { provideSpriteViewerStore } from './composables/useSpriteViewerStore'
import GameNavigation from '../../shared/components/GameNavigation.vue'
import GamePageContainer from '../../shared/components/ui/GamePageContainer.vue'
import GameSection from '../../shared/components/ui/GameSection.vue'
import SpriteControls from './components/SpriteControls.vue'
import SpriteGrid from './components/SpriteGrid.vue'
import ColorPaletteDisplay from './components/ColorPaletteDisplay.vue'
import PaletteCombinations from './components/PaletteCombinations.vue'
import DefStatements from './components/DefStatements.vue'

// Provide the store to all child components
provideSpriteViewerStore()
</script>

<template>
  <GamePageContainer>
    <GameNavigation />
    <div class="sprite-viewer-content">
      <GameSection title="Character Sprite Viewer">
        <SpriteControls />

        <SpriteGrid />

        <DefStatements />

        <ColorPaletteDisplay />

        <PaletteCombinations />
      </GameSection>
    </div>
  </GamePageContainer>
</template>

<style scoped>
.sprite-viewer-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}
</style>
