<script setup lang="ts">
</script>

<template>
  <div class="game-page-container">
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
  background: var(--base-solid-gray-10);
}

.light-theme .game-page-container {
  background: var(--base-solid-gray-00);
}
</style>
