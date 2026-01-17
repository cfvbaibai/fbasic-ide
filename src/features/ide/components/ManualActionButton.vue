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
    0 2px 4px var(--game-color-black-30),
    inset 0 1px 2px var(--game-color-white-10);
  outline: none;
  text-shadow: 0 0 4px var(--game-accent-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--game-radius-lg);
  font-family: var(--game-font-family-heading);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  background: var(--game-surface-bg-gradient);
  transform: translateY(-2px) scale(1.05);
  border-color: var(--semantic-warning);
  box-shadow: 
    0 4px 8px var(--game-color-black-40),
    0 0 12px var(--semantic-warning-40),
    inset 0 1px 2px var(--game-color-white-15);
  color: var(--semantic-warning);
  text-shadow: 0 0 8px var(--semantic-warning-60);
}

/* Active state */
.manual-action-button:active {
  background: linear-gradient(135deg, var(--game-surface-bg-end) 0%, var(--game-surface-bg-start) 100%);
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 1px 2px var(--game-color-black-40),
    inset 0 2px 4px var(--game-color-black-30),
    0 0 20px var(--semantic-warning-50);
  border-color: var(--semantic-warning);
}

/* Active state for held buttons */
.manual-action-button.active {
  background: linear-gradient(135deg, var(--semantic-success) 0%, var(--semantic-success-dark) 100%);
  color: var(--game-color-white);
  border-color: var(--semantic-success);
  box-shadow: 
    0 0 16px var(--semantic-success-60),
    0 2px 6px var(--game-color-black-30),
    inset 0 1px 2px var(--game-color-white-20);
  text-shadow: 0 0 8px var(--game-color-white-50);
  transform: scale(1.05);
}
</style>
