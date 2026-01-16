<script setup lang="ts">
import { computed, useSlots } from 'vue'
import GamePageContainer from './GamePageContainer.vue'
import GameNavigation from '../GameNavigation.vue'
import GameIcon from './GameIcon.vue'

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
            <h1 v-if="title || icon" class="game-layout-title">
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
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
}

.game-layout-header {
  flex: 0 0 auto;
  background: var(--game-surface-bg-gradient);
  border-bottom: 2px solid var(--game-surface-border);
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow: var(--game-shadow-base);
  position: relative;
}

.game-layout-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-glow) 50%, 
    transparent 100%
  );
  opacity: 0.5;
  border-radius: 12px 12px 0 0;
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
  color: var(--game-text-primary);
  font-size: var(--game-font-size-lg);
  font-weight: var(--game-font-weight-bold);
  font-family: var(--game-font-family-heading);
  text-shadow: 0 0 10px var(--game-text-shadow-glow);
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
