<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed } from 'vue'

import { ActiveTabKey, injectStrict, SetActiveTabKey } from './game-tabs-keys'
import GameIcon from './GameIcon.vue'

/**
 * GameTabButton component - A button for tab navigation.
 * Must be used within a GameTabs component.
 *
 * @example
 * ```vue
 * <GameTabButton name="tab1" label="Tab 1" icon="mdi:home" />
 * ```
 */
defineOptions({
  name: 'GameTabButton',
})

const props = withDefaults(defineProps<Props>(), {
  label: '',
  icon: null,
  disabled: false,
})

interface Props {
  /** Unique identifier for this tab */
  name: string
  /** Display label for the tab button */
  label?: string
  /** Icon to display (from iconify) */
  icon?: string | null
  /** Whether the tab button is disabled */
  disabled?: boolean
}

// Type-safe injection with runtime error handling
const activeTab = injectStrict(ActiveTabKey) as ComputedRef<string>
const setActiveTab = injectStrict(SetActiveTabKey)

const isActive = computed(() => activeTab.value === props.name)

const handleClick = () => {
  if (!props.disabled) {
    setActiveTab(props.name)
  }
}
</script>

<template>
  <button
    :class="['game-tab-button', { active: isActive, disabled: props.disabled }]"
    @click="handleClick"
    type="button"
  >
    <GameIcon v-if="icon" :icon="icon" size="small" class="game-tab-icon" />
    <slot name="label">
      {{ label || name }}
    </slot>
  </button>
</template>

<style scoped>
.game-tab-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--game-text-secondary);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  user-select: none;
  position: relative;
  overflow: visible;
}

/* Style content within tab button */
.game-tab-button :deep(.game-icon) {
  flex-shrink: 0;
  transition: filter 0.3s ease;
}

.game-tab-button :deep(span:not(.game-tag-content)) {
  font-weight: 600;
  letter-spacing: 0.05em;
}

/* Style tags within tab button */
.game-tab-button :deep(.game-tag) {
  margin-left: 0.25rem;
  font-size: 0.625rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  box-shadow: 0 0 4px var(--base-alpha-gray-00-30);
}

.game-tab-button.active :deep(.game-tag) {
  box-shadow: 0 0 4px var(--base-alpha-gray-00-30);
}

.game-tab-button::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, var(--base-solid-primary) 50%, transparent 100%);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
}

/* Focus styles for accessibility */
.game-tab-button:focus-visible {
  outline: 2px solid var(--base-solid-primary);
  outline-offset: 2px;
}

.game-tab-button:hover:not(.disabled) {
  color: var(--game-text-primary);
}

.game-tab-button:hover:not(.disabled)::before {
  transform: scaleX(0.5);
}

.game-tab-button.active {
  color: var(--base-solid-primary);
}

.game-tab-button.active::before {
  transform: scaleX(1);
}

.game-tab-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-tab-icon {
  flex-shrink: 0;
  transition: filter 0.3s ease;
}
</style>
