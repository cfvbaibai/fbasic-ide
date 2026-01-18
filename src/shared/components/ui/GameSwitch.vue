<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean | string | number
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'medium'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | string | number]
}>()

const isChecked = computed(() => {
  if (typeof props.modelValue === 'boolean') {
    return props.modelValue
  }
  return Boolean(props.modelValue)
})

const handleToggle = () => {
  if (!props.disabled) {
    const newValue = !isChecked.value
    emit('update:modelValue', newValue)
  }
}

const switchClasses = computed(() => {
  return {
    'game-switch': true,
    [`game-switch-${props.size}`]: true,
    'game-switch-checked': isChecked.value,
    'game-switch-disabled': props.disabled
  }
})
</script>

<template>
  <button
    :class="switchClasses"
    type="button"
    role="switch"
    :aria-checked="isChecked"
    :disabled="disabled"
    @click="handleToggle"
  >
    <span class="game-switch-core bg-game-surface border-game-surface">
      <span class="game-switch-button" />
    </span>
  </button>
</template>

<style scoped>
.game-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  outline: none;
  transition: all 0.2s ease;
}

.game-switch-core {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 11px;
  transition: all 0.2s ease;
  box-shadow: 
    0 2px 4px var(--game-color-black-30),
    inset 0 1px 0 var(--game-color-white-10);
}

.game-switch-button {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: var(--game-text-secondary);
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px var(--game-color-black-30);
}

.game-switch-checked .game-switch-core {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, var(--game-accent-color-dark) 100%);
  border-color: var(--game-accent-color);
  box-shadow: 
    0 0 12px var(--game-accent-glow),
    0 2px 4px var(--game-color-black-30),
    inset 0 1px 0 var(--game-color-white-20);
}

.game-switch-checked .game-switch-button {
  left: calc(100% - 16px);
  background: var(--game-color-black);
  box-shadow: 0 2px 4px rgb(0 0 0 / 50%);
}

.game-switch:focus-visible .game-switch-core {
  outline: 2px solid var(--game-accent-color);
  outline-offset: 2px;
}

.game-switch:hover:not(.game-switch-disabled) .game-switch-core {
  border-color: var(--game-accent-color);
  box-shadow: 
    0 0 8px var(--game-accent-glow),
    0 2px 4px var(--game-color-black-30),
    inset 0 1px 0 var(--game-color-white-10);
}

.game-switch-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Size variants */
.game-switch-small {
  width: 36px;
  height: 18px;
}

.game-switch-small .game-switch-button {
  width: 12px;
  height: 12px;
  top: 1px;
  left: 1px;
}

.game-switch-small.game-switch-checked .game-switch-button {
  left: calc(100% - 13px);
}

</style>
