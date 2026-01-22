<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, useSlots, watch, h } from 'vue'
import type { ComputedRef } from 'vue'
import GameTabButton from './GameTabButton.vue'
import {
  ActiveTabKey,
  RegisterTabKey,
  UnregisterTabKey,
  injectStrict
} from './game-tabs-keys'

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

interface Props {
  /** Unique identifier for this tab pane */
  name: string
  /** Display label for the tab button */
  label?: string
  /** Icon to display (from iconify) */
  icon?: any
  /** Whether the tab pane is disabled */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  icon: null,
  disabled: false
})

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

// Watch for activeTab changes and re-register to update button state
watch(() => activeTab.value, () => {
  registerTab(props.name, renderButton)
}, { immediate: false })

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
    <slot />
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

/* Border card pane styles */
.game-tabs-border-card .game-tab-pane {
  border-top: 1px solid var(--game-surface-border);
  padding: 1rem;
  box-shadow: none;
  position: relative;
  overflow: hidden;
}

.game-tabs-border-card .game-tab-pane::before {
  display: none;
}
</style>
