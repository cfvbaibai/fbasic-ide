<script setup lang="ts">
/**
 * GameSubBlock component - A sub-block component with title for nested content sections.
 *
 * @example
 * ```vue
 * <GameSubBlock title="Sub Section">
 *   Sub content here
 * </GameSubBlock>
 * ```
 */
defineOptions({
  name: 'GameSubBlock',
})

defineProps<Props>()

interface Props {
  /** Title for the sub-block */
  title: string
}
</script>

<template>
  <div class="game-sub-block bg-game-surface border-game-surface">
    <div class="game-sub-block-title text-game-heading border-game-surface-bottom">
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
    inset 0 2px 4px var(--base-alpha-gray-00-30),
    0 2px 6px var(--base-alpha-gray-00-20);
  position: relative;
  transition: all 0.3s ease;
  width: 100%;
  min-width: fit-content;
  max-width: 100%;
  box-sizing: border-box;
}

.game-sub-block:hover {
  border-color: var(--base-solid-primary);
  box-shadow:
    inset 0 2px 4px var(--base-alpha-gray-00-30),
    0 0 12px var(--base-alpha-primary-20);
}

.game-sub-block-title {
  font-size: 0.875rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  text-shadow: 0 0 8px var(--game-accent-glow);
}

/* Light theme: use accent color, no glow */
.light-theme .game-sub-block-title {
  color: var(--base-solid-primary);
  text-shadow: none;
}
</style>
