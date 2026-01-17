<script setup lang="ts">
import { computed, inject } from 'vue'
import GameIcon from './GameIcon.vue'

interface Props {
  name: string
  label?: string
  icon?: any
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  icon: null,
  disabled: false
})

const activeTab = inject<{ value: string }>('activeTab', { value: '' })
const setActiveTab = inject<(name: string) => void>('setActiveTab', () => {})

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
  position: relative;
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
  filter: drop-shadow(0 0 4px currentColor);
  transition: filter 0.3s ease;
}

.game-tab-button.active :deep(.game-icon) {
  filter: drop-shadow(0 0 8px var(--game-accent-color));
}

.game-tab-button :deep(span:not(.game-tag-content)) {
  font-weight: 600;
  letter-spacing: 0.05em;
}

.game-tab-button.active :deep(span:not(.game-tag-content)) {
  text-shadow: 0 0 8px var(--game-accent-glow);
}

/* Style tags within tab button */
.game-tab-button :deep(.game-tag) {
  margin-left: 0.25rem;
  font-size: 0.625rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.game-tab-button.active :deep(.game-tag) {
  box-shadow: 0 0 8px var(--game-accent-glow);
}

.game-tab-button::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-color) 50%, 
    transparent 100%
  );
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
}

.game-tab-button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.05) 0%, 
    rgba(0, 255, 136, 0.02) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.game-tab-button:hover:not(.disabled) {
  color: var(--game-text-primary);
}

.game-tab-button:hover:not(.disabled)::after {
  opacity: 1;
}

.game-tab-button:hover:not(.disabled)::before {
  transform: scaleX(0.5);
  box-shadow: 0 0 8px var(--game-accent-glow);
}

.game-tab-button.active {
  color: var(--game-accent-color);
  text-shadow: 0 0 8px var(--game-accent-glow);
}

.game-tab-button.active::before {
  transform: scaleX(1);
  background: linear-gradient(90deg, 
    var(--game-accent-color) 0%, 
    #00cc6a 50%, 
    var(--game-accent-color) 100%
  );
  box-shadow: 
    0 0 12px var(--game-accent-glow),
    0 0 20px var(--game-accent-glow);
}

.game-tab-button.active::after {
  opacity: 1;
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.15) 0%, 
    rgba(0, 255, 136, 0.05) 100%
  );
}

.game-tab-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-tab-icon {
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px currentColor);
  transition: filter 0.3s ease;
}

.game-tab-button.active .game-tab-icon {
  filter: drop-shadow(0 0 8px var(--game-accent-color));
}

/* Focus styles for accessibility */
.game-tab-button:focus-visible {
  outline: 2px solid var(--game-accent-color);
  outline-offset: 2px;
  box-shadow: 
    0 0 0 2px var(--game-accent-color),
    0 0 12px var(--game-accent-glow);
}
</style>
