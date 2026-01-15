<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="info-card">
    <h3 class="info-card-title">{{ title }}</h3>
    <div class="info-card-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.info-card {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 2px solid var(--game-card-border);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--game-shadow-base);
}

.info-card-title {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  color: var(--game-accent-color);
  margin: 0 0 1rem 0;
  text-shadow: 0 0 10px var(--game-accent-glow);
}

.info-card-content {
  font-size: 1rem;
  font-family: var(--game-font-family);
  color: var(--game-text-secondary);
  line-height: 1.6;
}

.info-card-content :deep(p) {
  margin: 0;
}
</style>
