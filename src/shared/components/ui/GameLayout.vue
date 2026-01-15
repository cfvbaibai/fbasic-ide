<script setup lang="ts">
import GamePageContainer from './GamePageContainer.vue'
import GameNavigation from '../GameNavigation.vue'
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
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
}
</style>
