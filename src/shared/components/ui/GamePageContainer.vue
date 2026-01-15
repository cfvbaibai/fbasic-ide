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
  background: linear-gradient(135deg, var(--game-bg-gradient-start) 0%, var(--game-bg-gradient-mid) 50%, var(--game-bg-gradient-end) 100%);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}
</style>
