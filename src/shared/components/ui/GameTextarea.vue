<script setup lang="ts">
import { computed } from 'vue'
import type { GameTextareaProps, GameTextareaEmits } from './GameTextarea.types'

/**
 * GameTextarea component - A styled textarea component with size variants and resize options.
 * 
 * @example
 * ```vue
 * <GameTextarea
 *   v-model="text"
 *   placeholder="Enter text"
 *   :rows="5"
 *   resize="vertical"
 *   @focus="handleFocus"
 * />
 * ```
 */
defineOptions({
  name: 'GameTextarea'
})

const props = withDefaults(defineProps<GameTextareaProps>(), {
  placeholder: '',
  disabled: false,
  readonly: false,
  rows: 4,
  resize: 'vertical',
  size: 'medium'
})

const emit = defineEmits<GameTextareaEmits>()

const textareaValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  textareaValue.value = target.value
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const textareaClasses = computed(() => {
  return {
    'game-textarea': true,
    [`game-textarea-${props.size}`]: true,
    'game-textarea-disabled': props.disabled
  }
})

const resizeValue = computed(() => props.resize)
</script>

<template>
  <textarea
    :class="textareaClasses"
    :value="textareaValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :rows="rows"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    class="game-textarea-inner bg-game-surface border-game-surface"
  />
</template>

<style scoped>
.game-textarea-inner {
  resize: v-bind(resizeValue);
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--game-text-primary);
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 
    0 2px 4px var(--base-alpha-gray-00-30),
    inset 0 1px 0 var(--base-alpha-gray-100-10);
  line-height: 1.5;
  font-family: var(--game-font-family-mono);
}

.game-textarea-inner::placeholder {
  color: var(--game-text-tertiary);
  opacity: 0.6;
}

.game-textarea-inner:focus {
  border-color: var(--base-solid-primary);
  box-shadow: 
    0 0 12px var(--game-accent-glow),
    0 2px 4px var(--base-alpha-gray-00-30),
    inset 0 1px 0 var(--base-alpha-gray-100-10);
}

.game-textarea-inner:disabled,
.game-textarea-inner[readonly] {
  opacity: 0.7;
  cursor: default;
  background: var(--game-surface-bg-end);
}

.game-textarea-inner[readonly] {
  cursor: text;
}

/* Size variants */
.game-textarea-small .game-textarea-inner {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

.game-textarea-large .game-textarea-inner {
  padding: 0.875rem 1.25rem;
  font-size: 1rem;
}

/* Scrollbar styling */
.game-textarea-inner::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.game-textarea-inner::-webkit-scrollbar-track {
  background: transparent;
}

.game-textarea-inner::-webkit-scrollbar-thumb {
  background: var(--game-surface-border);
  border-radius: 4px;
}

.game-textarea-inner::-webkit-scrollbar-thumb:hover {
  background: var(--base-solid-primary);
}
</style>
