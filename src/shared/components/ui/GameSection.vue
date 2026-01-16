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
    <h2 v-if="title" class="game-section-title">{{ title }}</h2>
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
  color: var(--game-text-primary);
  text-align: center;
  margin: 0 0 2.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
