<script setup lang="ts">
</script>

<template>
  <div class="game-page-container bg-game-surface">
    <slot />
  </div>
</template>

<style scoped>
.game-page-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}
</style>
