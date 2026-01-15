<script setup lang="ts">
interface Props {
  direction?: 'horizontal' | 'vertical'
  contentPosition?: 'left' | 'center' | 'right'
}

withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  contentPosition: 'center'
})
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
  border-top: 1px solid var(--app-border-color-light);
  position: relative;
}

.game-divider-vertical {
  display: inline-block;
  width: 1px;
  height: 1em;
  margin: 0 0.5rem;
  vertical-align: middle;
  border-top: none;
  border-left: 1px solid var(--app-border-color-light);
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
  border-top: 1px solid var(--app-border-color-light);
}

.game-divider-text {
  padding: 0 1rem;
  color: var(--app-text-color-secondary);
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
