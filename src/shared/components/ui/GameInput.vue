<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'number' | 'password' | 'email' | 'url' | 'search'
  placeholder?: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  size: 'medium',
  clearable: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string | number) => emit('update:modelValue', value)
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (props.type === 'number') {
    inputValue.value = target.valueAsNumber || 0
  } else {
    inputValue.value = target.value
  }
}

const handleClear = () => {
  inputValue.value = props.type === 'number' ? 0 : ''
  emit('clear')
}

const inputClasses = computed(() => {
  return {
    'game-input': true,
    [`game-input-${props.size}`]: true,
    'game-input-disabled': props.disabled,
    'game-input-clearable': props.clearable
  }
})
</script>

<template>
  <div :class="inputClasses">
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
      class="game-input-inner bg-game-surface border-game-surface"
    />
    <button
      v-if="clearable && modelValue && !disabled"
      type="button"
      class="game-input-clear"
      @click="handleClear"
      aria-label="Clear"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
.game-input {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
}

.game-input-inner {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--game-text-primary);
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 
    0 2px 4px var(--base-alpha-gray-00-30),
    inset 0 1px 0 var(--base-alpha-gray-100-10);
}

.game-input-inner::placeholder {
  color: var(--game-text-tertiary);
  opacity: 0.6;
}

.game-input-inner:focus {
  border-color: var(--base-solid-primary);
  box-shadow: 
    0 0 12px var(--game-accent-glow),
    0 2px 4px var(--base-alpha-gray-00-30),
    inset 0 1px 0 var(--base-alpha-gray-100-10);
}

.game-input-inner:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--game-surface-bg-end);
}

/* Size variants */
.game-input-small .game-input-inner {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

.game-input-large .game-input-inner {
  padding: 0.875rem 1.25rem;
  font-size: 1rem;
}

.game-input-clear {
  position: absolute;
  right: 0.5rem;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: var(--game-text-secondary);
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.game-input-clear:hover {
  color: var(--game-text-primary);
  background: var(--base-alpha-gray-100-10);
}

.game-input-clearable .game-input-inner {
  padding-right: 2.5rem;
}
</style>
