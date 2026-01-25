<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed, h,onMounted, onUnmounted, useSlots } from 'vue'

import {
  ActiveTabKey,
  injectStrict,
  RegisterTabKey,
  UnregisterTabKey} from './game-tabs-keys'
import GameTabButton from './GameTabButton.vue'

/**
 * GameTabPane component - A pane that displays content for a specific tab.
 * Must be used within a GameTabs component.
 * 
 * @example
 * ```vue
 * <GameTabPane name="tab1" label="Tab 1" icon="mdi:home">
 *   Tab content here
 * </GameTabPane>
 * ```
 */
defineOptions({
  name: 'GameTabPane'
})

const props = withDefaults(defineProps<Props>(), {
  label: '',
  icon: null,
  disabled: false
})

interface Props {
  /** Unique identifier for this tab pane */
  name: string
  /** Display label for the tab button */
  label?: string
  /** Icon to display (from iconify) */
  icon?: string | null
  /** Whether the tab pane is disabled */
  disabled?: boolean
}

const slots = useSlots()

// Type-safe injection with runtime error handling
const activeTab = injectStrict(ActiveTabKey) as ComputedRef<string>
const registerTab = injectStrict(RegisterTabKey)
const unregisterTab = injectStrict(UnregisterTabKey)

// Render function for tab button - uses GameTabButton component
const renderButton = () => {
  return h(GameTabButton, {
    name: props.name,
    label: props.label,
    icon: props.icon,
    disabled: props.disabled
  }, slots.label ? { label: slots.label } : {})
}

onMounted(() => {
  registerTab(props.name, renderButton)
})

onUnmounted(() => {
  unregisterTab(props.name)
})

const isActive = computed(() => activeTab.value === props.name)
</script>

<template>
  <div
    v-show="isActive"
    :class="['game-tab-pane', { active: isActive }]"
  >
    <div v-if="slots['tab-content-header']" class="game-tab-pane-header">
      <slot name="tab-content-header" />
    </div>
    <div class="game-tab-pane-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.game-tab-pane {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.game-tab-pane-body {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.game-tab-pane-header {
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--game-surface-border);
  background: var(--game-surface-bg-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Border card pane styles */
.game-tabs-border-card .game-tab-pane {
  border-top: 1px solid var(--game-surface-border);
  padding: 0;
  box-shadow: none;
  position: relative;
  overflow: hidden;
}

.game-tabs-border-card .game-tab-pane::before {
  display: none;
}

.game-tabs-border-card .game-tab-pane-body {
  padding: 1rem;
  overflow: auto;
}
</style>
