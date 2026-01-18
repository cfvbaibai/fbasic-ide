<template>
  <button 
    class="manual-action-button" 
    :class="[buttonType, { active }]"
    @mousedown="handleClick"
    tabindex="-1"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  button: 'select' | 'start' | 'a' | 'b'
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false
})

interface Emits {
  (e: 'click', button: 'select' | 'start' | 'a' | 'b'): void
}

const emit = defineEmits<Emits>()

const buttonType = computed(() => props.button)

const label = computed(() => {
  return props.button.toUpperCase()
})

const handleClick = () => {
  emit('click', props.button)
}
</script>

<style scoped>
/* Action button base styles */
.manual-action-button {
  border: 2px solid var(--game-surface-border);
  background: var(--game-surface-bg-gradient);
  cursor: pointer;
  font-weight: var(--game-font-weight-bold);
  color: var(--game-text-primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 4px var(--base-alpha-gray-00-30),
    inset 0 1px 2px var(--base-alpha-gray-100-10);
  outline: none;
  text-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--game-radius-lg);
  font-family: var(--game-font-family-heading);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Light theme: use regular gradient background for raised appearance */
.light-theme .manual-action-button {
  background: var(--game-surface-bg-gradient);
  color: var(--game-text-primary);
}

.manual-action-button.select,
.manual-action-button.start {
  padding: 0.375rem 0.5rem;
  font-size: 0.65rem;
  min-width: 38px;
}

.manual-action-button.b,
.manual-action-button.a {
  padding: 0.5rem;
  font-size: var(--game-font-size-sm);
  min-width: 32px;
  min-height: 32px;
  border-radius: 50%;
  aspect-ratio: 1;
}

/* Hover state */
.manual-action-button:hover {
  background: var(--game-surface-bg-hover-gradient);
  transform: translateY(-2px) scale(1.05);
  border-color: var(--base-solid-primary);
  box-shadow: 
    0 4px 8px var(--base-alpha-gray-00-40),
    0 0 12px var(--game-accent-glow),
    inset 0 1px 2px var(--base-alpha-gray-100-10);
  color: var(--base-solid-primary);
  text-shadow: none;
}

/* Active state */
.manual-action-button:active {
  background: var(--game-surface-bg-inset-gradient);
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 1px 2px var(--base-alpha-gray-00-40),
    inset 0 2px 4px var(--base-alpha-gray-00-30),
    0 0 20px var(--game-accent-glow);
  border-color: var(--base-solid-primary);
  color: var(--base-solid-primary);
}

.light-theme .manual-action-button:hover {
  background: var(--game-surface-bg-hover-gradient);
  color: var(--game-text-primary);
}

.light-theme .manual-action-button:active {
  background: var(--game-surface-bg-hover-gradient);
  color: var(--game-text-primary);
}

/* Active state for held buttons */
.manual-action-button.active {
  background: linear-gradient(135deg, var(--semantic-solid-success) 0%, var(--semantic-solid-success) 100%);
  color: var(--base-solid-gray-100);
  border-color: var(--semantic-solid-success);
  box-shadow: 
    0 0 16px var(--semantic-alpha-success-60),
    0 2px 6px var(--base-alpha-gray-00-30),
    inset 0 1px 2px var(--base-alpha-gray-100-20);
  text-shadow: 0 0 8px var(--base-alpha-gray-100-50);
  transform: scale(1.05);
}
</style>
