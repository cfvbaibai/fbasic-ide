<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  readonly: false,
  rows: 4,
  resize: 'vertical',
  size: 'medium'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const textareaValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const textareaClasses = computed(() => {
  return {
    'game-textarea': true,
    [`game-textarea-${props.size}`]: true,
    'game-textarea-disabled': props.disabled
  }
})
</script>

<template>
  <textarea
    :class="textareaClasses"
    :value="textareaValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :rows="rows"
    :style="{ resize }"
    @input="textareaValue = ($event.target as HTMLTextAreaElement).value"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
    class="game-textarea-inner bg-game-surface border-game-surface"
  />
</template>

<style scoped>
.game-textarea-inner {
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
    0 2px 4px var(--base-color-black-30),
    inset 0 1px 0 var(--base-color-white-10);
  line-height: 1.5;
  font-family: var(--game-font-family-mono);
}

.game-textarea-inner::placeholder {
  color: var(--game-text-tertiary);
  opacity: 0.6;
}

.game-textarea-inner:focus {
  border-color: var(--game-accent-color);
  box-shadow: 
    0 0 12px var(--game-accent-glow),
    0 2px 4px var(--base-color-black-30),
    inset 0 1px 0 var(--base-color-white-10);
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
  background: var(--game-accent-color);
}
</style>
