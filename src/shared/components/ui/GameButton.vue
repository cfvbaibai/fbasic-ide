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
  iconPosition?: 'left' | 'right'
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  variant: 'action',
  disabled: false,
  loading: false,
  icon: undefined,
  iconPosition: 'left',
  selected: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  return {
    'game-button': true,
    [`game-button-${props.type}`]: true,
    [`game-button-${props.size}`]: true,
    [`game-button-${props.variant}`]: true,
    'game-button-disabled': props.disabled || props.loading,
    'game-button-loading': props.loading,
    'game-button-selected': props.selected
  }
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const getIconSize = computed(() => {
  // Icons should be smaller and proportional to button size
  // Return pixel values as numbers for GameIcon
  const sizeMap: Record<string, number> = {
    small: 12,
    medium: 14,
    large: 16
  }
  return sizeMap[props.size]
})
</script>

<template>
  <button
    :class="['bg-game-surface', 'border-game-surface', 'text-game-secondary', buttonClasses]"
    :disabled="disabled || loading"
    @click="handleClick"
    type="button"
  >
    <span v-if="loading" class="game-button-spinner">
      <GameIcon :icon="icon" :size="getIconSize" rotate />
    </span>
    <GameIcon
      v-else-if="icon && iconPosition === 'left'"
      :icon="icon"
      :size="getIconSize"
      class="game-button-icon-left"
    />
    <span v-if="$slots.default" class="game-button-content">
      <slot />
    </span>
    <GameIcon
      v-if="icon && iconPosition === 'right' && !loading"
      :icon="icon"
      :size="getIconSize"
      class="game-button-icon-right"
    />
  </button>
</template>

<style scoped>
.game-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 140px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.game-button:hover:not(.game-button-disabled) {
  background: linear-gradient(135deg, #3a3a4e 0%, #2a2a3e 100%);
  border-color: var(--game-surface-border);
  color: var(--game-text-primary);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-button:active:not(.game-button-disabled) {
  transform: translateY(0);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Type variants - All buttons use the same base style, type affects hover/active states */
.game-button-primary:hover:not(.game-button-disabled) {
  border-color: var(--game-surface-border);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-button-primary:active:not(.game-button-disabled) {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, #00cc6a 100%);
  border-color: var(--game-surface-border);
  color: #000000;
  box-shadow: 
    0 0 20px var(--game-accent-glow),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.game-button-success:hover:not(.game-button-disabled) {
  border-color: var(--semantic-success);
  box-shadow: 
    0 4px 8px rgba(103, 194, 58, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-button-success:active:not(.game-button-disabled) {
  background: linear-gradient(135deg, var(--semantic-success) 0%, var(--semantic-success-dark) 100%);
  border-color: var(--semantic-success);
  color: #ffffff;
  box-shadow: 
    0 0 12px rgba(103, 194, 58, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.game-button-warning:hover:not(.game-button-disabled) {
  border-color: var(--semantic-warning);
  box-shadow: 
    0 4px 8px rgba(230, 162, 60, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-button-warning:active:not(.game-button-disabled) {
  background: linear-gradient(135deg, var(--semantic-warning) 0%, #c88a2e 100%);
  border-color: var(--semantic-warning);
  color: #ffffff;
  box-shadow: 
    0 0 12px rgba(230, 162, 60, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.game-button-danger:hover:not(.game-button-disabled) {
  border-color: var(--semantic-danger);
  box-shadow: 
    0 4px 8px rgba(245, 108, 108, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-button-danger:active:not(.game-button-disabled) {
  background: linear-gradient(135deg, var(--semantic-danger) 0%, #d44a4a 100%);
  border-color: var(--semantic-danger);
  color: #ffffff;
  box-shadow: 
    0 0 12px rgba(245, 108, 108, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.game-button-info:hover:not(.game-button-disabled) {
  border-color: var(--semantic-info);
  box-shadow: 
    0 4px 8px rgba(144, 147, 153, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-button-info:active:not(.game-button-disabled) {
  background: linear-gradient(135deg, var(--semantic-info) 0%, #6d7075 100%);
  border-color: var(--semantic-info);
  color: #ffffff;
  box-shadow: 
    0 0 12px rgba(144, 147, 153, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Toggle variant - more compact, designed for selection groups */
.game-button-toggle {
  min-width: auto;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.game-button-toggle.game-button-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.game-button-toggle.game-button-large {
  padding: 0.625rem 1.25rem;
  font-size: 1rem;
}

/* Selected state - persistent highlight for toggle buttons */
.game-button-toggle.game-button-selected {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, #00cc6a 100%);
  border-color: var(--game-surface-border);
  color: #000000;
  box-shadow: 
    0 0 20px var(--game-accent-glow),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.game-button-toggle.game-button-selected:hover:not(.game-button-disabled) {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, #00cc6a 100%);
  border-color: var(--game-surface-border);
  transform: translateY(-2px);
  box-shadow: 
    0 0 24px var(--game-accent-glow),
    0 6px 12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.game-button-toggle.game-button-selected:active:not(.game-button-disabled) {
  transform: translateY(0);
  box-shadow: 
    0 0 20px var(--game-accent-glow),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Action buttons with selected state (for backward compatibility) */
.game-button-action.game-button-selected {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, #00cc6a 100%);
  border-color: var(--game-surface-border);
  color: #000000;
  box-shadow: 
    0 0 20px var(--game-accent-glow),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.game-button-action.game-button-selected:hover:not(.game-button-disabled) {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, #00cc6a 100%);
  border-color: var(--game-surface-border);
  transform: translateY(-2px);
  box-shadow: 
    0 0 24px var(--game-accent-glow),
    0 6px 12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.game-button-action.game-button-selected:active:not(.game-button-disabled) {
  transform: translateY(0);
  box-shadow: 
    0 0 20px var(--game-accent-glow),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Size variants */
.game-button-small {
  padding: 0.625rem 1rem;
  font-size: 0.8rem;
  gap: 0.5rem;
  min-width: 120px;
}

.game-button-large {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  gap: 0.875rem;
  min-width: 160px;
}

/* Disabled state */
.game-button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.game-button-disabled:hover {
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
}

/* Loading state */
.game-button-loading {
  cursor: wait;
}

.game-button-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.game-button-content {
  display: inline-flex;
  align-items: center;
}

.game-button-icon-left {
  margin-right: 0;
}

.game-button-icon-right {
  margin-left: 0;
}

/* Ensure icons in buttons are properly sized */
.game-button .game-icon svg,
.game-button svg.game-icon {
  width: 1em !important;
  height: 1em !important;
  font-size: inherit;
}

/* Focus styles for accessibility */
.game-button:focus-visible {
  outline: 2px solid var(--game-surface-border);
  outline-offset: 2px;
}
</style>
