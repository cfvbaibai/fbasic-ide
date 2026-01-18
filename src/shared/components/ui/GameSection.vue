<script setup lang="ts">
interface Props {
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: ''
})
</script>

<template>
  <div class="game-section">
    <h2 v-if="title" class="game-section-title text-game-heading">{{ title }}</h2>
    <slot />
  </div>
</template>

<style scoped>
.game-section {
  margin-bottom: 4rem;
}

.game-section-title {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  text-align: center;
  margin: 0 0 2.5rem;
  text-shadow: 0 0 8px var(--game-accent-glow);
}

/* Light theme: use accent color, no glow */
.light-theme .game-section-title {
  color: var(--game-accent-color);
  text-shadow: none;
}
</style>
