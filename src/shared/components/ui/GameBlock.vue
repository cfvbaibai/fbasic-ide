<script setup lang="ts">
import type { GameBlockEmits, GameBlockProps } from './GameBlock.types'
import GameIcon from './GameIcon.vue'

/**
 * GameBlock component - A block/section component with title, icon, and clickable options.
 *
 * @example
 * ```vue
 * <GameBlock
 *   title="Block Title"
 *   title-icon="mdi:play"
 *   :clickable="true"
 *   :float-on-hover="true"
 *   @click="handleClick"
 * >
 *   Block content
 * </GameBlock>
 * ```
 */
defineOptions({
  name: 'GameBlock',
})

const props = withDefaults(defineProps<GameBlockProps>(), {
  titleIcon: undefined,
  hideHeader: false,
  floatOnHover: false,
  clickable: false,
  noHoverEffect: false,
})

const emit = defineEmits<GameBlockEmits>()

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<template>
  <div
    class="game-block bg-game-surface border-game-surface-2 shadow-game-base"
    :class="{
      'no-header': hideHeader,
      'float-on-hover': floatOnHover,
      clickable: clickable,
      'no-hover-effect': noHoverEffect,
    }"
    @click="handleClick"
  >
    <div v-if="!hideHeader" class="game-block-header">
      <h3 class="game-block-title text-game-heading">
        <GameIcon v-if="titleIcon" :icon="titleIcon" size="small" />
        {{ title }}
      </h3>
      <div v-if="$slots.right" class="game-block-header-right">
        <slot name="right" />
      </div>
    </div>
    <div class="game-block-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.game-block {
  border-radius: 12px;
  padding: 0.75rem;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;

  /* Flex layout support for nested content */
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.game-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--base-solid-primary);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.game-block:hover {
  border-color: var(--base-solid-primary);
  box-shadow: var(--game-shadow-hover);
}

.game-block:hover::before {
  transform: scaleX(1);
}

.game-block.no-hover-effect:hover {
  border-color: inherit;
  box-shadow: var(--game-shadow-base);
}

.game-block.no-hover-effect:hover::before {
  transform: scaleX(0);
}

.game-block.float-on-hover:hover {
  transform: translateY(-8px);
}

.game-block.clickable {
  cursor: pointer;
}

.game-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--game-surface-border);
  padding-bottom: 0.75rem;
  position: relative;
  transition: all 0.3s ease;
}

.game-block-title {
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-shadow: 0 0 8px var(--game-accent-glow);
}

/* Light theme: use accent color, no glow */
.light-theme .game-block-title {
  color: var(--base-solid-primary);
  text-shadow: none;
}

.game-block-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.game-block-content {
  padding-top: 0.75rem;
  position: relative;

  /* Flex layout support for nested content */
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.game-block.no-header .game-block-content {
  padding-top: 0;
}

@keyframes border-shimmer {
  0%,
  100% {
    background-position: -200% center;
    opacity: 0.6;
  }

  50% {
    background-position: 200% center;
    opacity: 0.9;
  }
}

@keyframes header-shimmer {
  0%,
  100% {
    background-position: -200% center;
    opacity: 0.6;
  }

  50% {
    background-position: 200% center;
    opacity: 0.9;
  }
}
</style>
