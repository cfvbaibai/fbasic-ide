<script setup lang="ts">
/**
 * GameDivider component - A divider component for separating content sections.
 * 
 * @example
 * ```vue
 * <GameDivider direction="horizontal" content-position="center">
 *   Divider Text
 * </GameDivider>
 * ```
 */
defineOptions({
  name: 'GameDivider'
})

withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  contentPosition: 'center'
})

interface Props {
  /** Divider direction */
  direction?: 'horizontal' | 'vertical'
  /** Position of content text when provided */
  contentPosition?: 'left' | 'center' | 'right'
}

</script>

<template>
  <div
    :class="[
      'game-divider',
      `game-divider-${direction}`,
      { 'game-divider-with-text': $slots.default }
    ]"
  >
    <span v-if="$slots.default" class="game-divider-text" :class="`game-divider-text-${contentPosition}`">
      <slot />
    </span>
  </div>
</template>

<style scoped>
.game-divider {
  margin: 1rem 0;
  border: none;
  border-top: 1px solid var(--game-surface-border);
  position: relative;
}

.game-divider-vertical {
  display: inline-block;
  width: 1px;
  height: 1em;
  margin: 0 0.5rem;
  vertical-align: middle;
  border-top: none;
  border-left: 1px solid var(--game-surface-border);
}

.game-divider-with-text {
  border-top: none;
  display: flex;
  align-items: center;
}

.game-divider-with-text::before,
.game-divider-with-text::after {
  content: '';
  flex: 1;
  border-top: 1px solid var(--game-surface-border);
}

.game-divider-text {
  padding: 0 1rem;
  color: var(--game-text-secondary);
  font-size: 0.875rem;
  white-space: nowrap;
}

.game-divider-text-left::before {
  display: none;
}

.game-divider-text-right::after {
  display: none;
}
</style>
