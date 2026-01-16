<script setup lang="ts">
import { computed } from 'vue'
import GameIcon from './GameIcon.vue'

interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'small' | 'medium' | 'large'
  variant?: 'action' | 'toggle'
  disabled?: boolean
  loading?: boolean
  icon?: string // Icon name in format "prefix:name" (e.g., "mdi:play")
  selected?: boolean
  title?: string // Tooltip text
  circular?: boolean // Whether to use circular shape
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  variant: 'action',
  disabled: false,
  loading: false,
  icon: undefined,
  selected: false,
  title: undefined,
  circular: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  return {
    'game-icon-button': true,
    [`game-icon-button-${props.type}`]: true,
    [`game-icon-button-${props.size}`]: true,
    [`game-icon-button-${props.variant}`]: true,
    'game-icon-button-disabled': props.disabled || props.loading,
    'game-icon-button-loading': props.loading,
    'game-icon-button-selected': props.selected,
    'game-icon-button-circular': props.circular
  }
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const getIconSize = computed(() => {
  // Icons should be proportional to button size
  // Return pixel values as numbers for GameIcon
  const sizeMap: Record<string, number> = {
    small: 14,
    medium: 18,
    large: 22
  }
  return sizeMap[props.size]
})
</script>

<template>
  <button
    :class="['bg-game-surface', 'border-game-surface', 'text-game-secondary', buttonClasses]"
    :disabled="disabled || loading"
    :title="title"
    @click="handleClick"
    type="button"
  >
    <span v-if="loading" class="game-icon-button-spinner">
      <GameIcon :icon="icon" :size="getIconSize" rotate />
    </span>
    <GameIcon
      v-else-if="icon"
      :icon="icon"
      :size="getIconSize"
      class="game-icon-button-icon"
    />
    <slot v-else />
  </button>
</template>

<style scoped>
.game-icon-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  cursor: pointer;
  user-select: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid var(--game-surface-border);
  background: linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%);
  color: var(--game-text-secondary);
  min-width: auto;
  width: auto;
  aspect-ratio: 1;
}

.game-icon-button-circular {
  border-radius: 50%;
}

.game-icon-button:hover:not(.game-icon-button-disabled) {
  background: linear-gradient(135deg, #3a3a4e 0%, #2a2a3e 100%);
  border-color: var(--game-surface-border);
  color: var(--game-text-primary);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-icon-button:active:not(.game-icon-button-disabled) {
  transform: translateY(0);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Type variants - All buttons use the same base style, type affects hover/active states */
.game-icon-button-primary:hover:not(.game-icon-button-disabled) {
  border-color: var(--game-surface-border);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-icon-button-primary:active:not(.game-icon-button-disabled) {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, #00cc6a 100%);
  border-color: var(--game-surface-border);
  color: #000000;
  box-shadow: 
    0 0 20px var(--game-accent-glow),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.game-icon-button-success:hover:not(.game-icon-button-disabled) {
  border-color: var(--semantic-success);
  box-shadow: 
    0 4px 8px rgba(103, 194, 58, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-icon-button-success:active:not(.game-icon-button-disabled) {
  background: linear-gradient(135deg, var(--semantic-success) 0%, var(--semantic-success-dark) 100%);
  border-color: var(--semantic-success);
  color: #ffffff;
  box-shadow: 
    0 0 12px rgba(103, 194, 58, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.game-icon-button-warning:hover:not(.game-icon-button-disabled) {
  border-color: var(--semantic-warning);
  box-shadow: 
    0 4px 8px rgba(230, 162, 60, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-icon-button-warning:active:not(.game-icon-button-disabled) {
  background: linear-gradient(135deg, var(--semantic-warning) 0%, #c88a2e 100%);
  border-color: var(--semantic-warning);
  color: #ffffff;
  box-shadow: 
    0 0 12px rgba(230, 162, 60, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.game-icon-button-danger:hover:not(.game-icon-button-disabled) {
  border-color: var(--semantic-danger);
  box-shadow: 
    0 4px 8px rgba(245, 108, 108, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-icon-button-danger:active:not(.game-icon-button-disabled) {
  background: linear-gradient(135deg, var(--semantic-danger) 0%, #d44a4a 100%);
  border-color: var(--semantic-danger);
  color: #ffffff;
  box-shadow: 
    0 0 12px rgba(245, 108, 108, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.game-icon-button-info:hover:not(.game-icon-button-disabled) {
  border-color: var(--semantic-info);
  box-shadow: 
    0 4px 8px rgba(144, 147, 153, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-icon-button-info:active:not(.game-icon-button-disabled) {
  background: linear-gradient(135deg, var(--semantic-info) 0%, #6d7075 100%);
  border-color: var(--semantic-info);
  color: #ffffff;
  box-shadow: 
    0 0 12px rgba(144, 147, 153, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Toggle variant - more compact */
.game-icon-button-toggle {
  padding: 0.375rem;
}

/* Selected state - persistent highlight for toggle buttons */
.game-icon-button-toggle.game-icon-button-selected,
.game-icon-button-action.game-icon-button-selected {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, #00cc6a 100%);
  border-color: var(--game-surface-border);
  color: #000000;
  box-shadow: 
    0 0 20px var(--game-accent-glow),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.game-icon-button-toggle.game-icon-button-selected:hover:not(.game-icon-button-disabled),
.game-icon-button-action.game-icon-button-selected:hover:not(.game-icon-button-disabled) {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, #00cc6a 100%);
  border-color: var(--game-surface-border);
  transform: translateY(-2px);
  box-shadow: 
    0 0 24px var(--game-accent-glow),
    0 6px 12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.game-icon-button-toggle.game-icon-button-selected:active:not(.game-icon-button-disabled),
.game-icon-button-action.game-icon-button-selected:active:not(.game-icon-button-disabled) {
  transform: translateY(0);
  box-shadow: 
    0 0 20px var(--game-accent-glow),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Size variants */
.game-icon-button-small {
  padding: 0.375rem;
}

.game-icon-button-large {
  padding: 0.625rem;
}

/* Disabled state */
.game-icon-button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.game-icon-button-disabled:hover {
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
}

/* Loading state */
.game-icon-button-loading {
  cursor: wait;
}

.game-icon-button-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.game-icon-button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Focus styles for accessibility */
.game-icon-button:focus-visible {
  outline: 2px solid var(--game-surface-border);
  outline-offset: 2px;
}
</style>
