<script setup lang="ts">
import GamePageContainer from './GamePageContainer.vue'
import GameNavigation from '../GameNavigation.vue'

/**
 * GameLayout component - Main layout component with navigation and content areas.
 * 
 * @example
 * ```vue
 * <GameLayout>
 *   Content here
 * </GameLayout>
 * ```
 */
defineOptions({
  name: 'GameLayout'
})
</script>

<template>
  <GamePageContainer>
    <GameNavigation />
    <div class="game-layout-content">
      <slot />
    </div>
  </GamePageContainer>
</template>

<style scoped>
.game-layout-content {
  flex: 1;
  overflow: hidden auto;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
}

/* Remove top padding/margin from direct children to prevent double spacing */
.game-layout-content > * {
  padding-top: 0;
  margin-top: 0;
}
</style>
