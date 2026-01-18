<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="game-sub-block bg-game-surface border-game-surface">
    <div class="game-sub-block-title text-game-heading text-shadow-glow-md text-game-accent border-game-surface-bottom">
      {{ title }}
    </div>
    <slot />
  </div>
</template>

<style scoped>
.game-sub-block {
  border-radius: 10px;
  padding: 0.75rem;
  box-shadow: 
    inset 0 2px 4px var(--game-color-black-30),
    0 2px 6px var(--game-color-black-20);
  position: relative;
  transition: all 0.3s ease;
  width: 100%;
  min-width: fit-content;
  max-width: 100%;
  box-sizing: border-box;
}

.game-sub-block:hover {
  border-color: var(--game-accent-color);
  box-shadow: 
    inset 0 2px 4px var(--game-color-black-30),
    0 0 12px var(--game-accent-color-20);
}

.game-sub-block-title {
  font-size: 0.875rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
