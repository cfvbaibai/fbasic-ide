<script setup lang="ts">
import { computed, useSlots } from 'vue'
import GamePageContainer from './GamePageContainer.vue'
import GameNavigation from '../GameNavigation.vue'
import GameIcon from './GameIcon.vue'

/**
 * GameLayout component - Main layout component with navigation, header, and content areas.
 * 
 * @example
 * ```vue
 * <GameLayout title="Page Title" icon="mdi:home">
 *   <template #action>Action Button</template>
 *   Content here
 * </GameLayout>
 * ```
 */
defineOptions({
  name: 'GameLayout'
})

interface Props {
  title?: string
  icon?: string // Icon name in format "prefix:name" (e.g., "mdi:monitor")
}

const props = defineProps<Props>()
const slots = useSlots()

const hasHeader = computed(() => {
  return props.title || props.icon || slots.action || slots.sub
})
</script>

<template>
  <GamePageContainer>
    <GameNavigation />
    <div class="game-layout-content">
      <div v-if="hasHeader" class="game-layout-header">
        <div class="game-layout-header-main">
          <div class="game-layout-header-left">
            <h1 v-if="title || icon" class="game-layout-title text-game-heading">
              <GameIcon v-if="icon" :icon="icon" class="game-layout-icon" />
              <span v-if="title">{{ title }}</span>
            </h1>
            <div v-if="$slots.sub" class="game-layout-sub">
              <slot name="sub" />
            </div>
          </div>
          <div v-if="$slots.action" class="game-layout-action">
            <slot name="action" />
          </div>
        </div>
      </div>
      <slot />
    </div>
  </GamePageContainer>
</template>

<style scoped>
.game-layout-content {
  flex: 1;
  overflow: hidden auto;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
}

.game-layout-header {
  flex: 0 0 auto;
  border-bottom: 2px solid var(--game-surface-border);
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow: var(--game-shadow-base);
  position: relative;
}

.game-layout-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-layout-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.game-layout-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--game-font-size-lg);
  text-shadow: 0 0 8px var(--game-accent-glow);
}

/* Light theme: use accent color, no glow */
.light-theme .game-layout-title {
  color: var(--base-solid-primary);
  text-shadow: none;
}

.game-layout-icon {
  flex-shrink: 0;
}

.game-layout-sub {
  display: flex;
  align-items: center;
}

.game-layout-action {
  flex-shrink: 0;
  margin-left: 1rem;
}
</style>
