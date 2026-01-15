<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import GameIcon from './GameIcon.vue'

interface Option {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue: string | number
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  placeholder: 'Please select',
  disabled: false,
  size: 'medium'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLDivElement>()

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const displayText = computed(() => {
  return selectedOption.value?.label || props.placeholder
})

const handleSelect = (option: Option) => {
  if (!option.disabled) {
    emit('update:modelValue', option.value)
    isOpen.value = false
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const selectClasses = computed(() => {
  return {
    'game-select': true,
    [`game-select-${props.size}`]: true,
    'game-select-open': isOpen.value,
    'game-select-disabled': props.disabled
  }
})
</script>

<template>
  <div ref="selectRef" :class="selectClasses">
    <button
      type="button"
      class="game-select-trigger"
      :disabled="disabled"
      @click="isOpen = !isOpen"
    >
      <span class="game-select-text" :class="{ placeholder: !selectedOption }">
        {{ displayText }}
      </span>
      <GameIcon :icon="ArrowDown" size="small" class="game-select-arrow" />
    </button>
    
    <Transition name="game-select-dropdown">
      <div v-if="isOpen" class="game-select-dropdown">
        <div
          v-for="option in options"
          :key="String(option.value)"
          :class="['game-select-option', { 
            selected: option.value === modelValue,
            disabled: option.disabled 
          }]"
          @click="handleSelect(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.game-select {
  position: relative;
  display: inline-block;
  width: 100%;
}

.game-select-trigger {
  width: 100%;
  padding: 0.625rem 1rem;
  padding-right: 2.5rem;
  font-family: var(--game-font-family);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--game-text-primary);
  text-align: left;
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 2px solid var(--game-card-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.game-select-trigger:hover:not(:disabled) {
  border-color: var(--game-accent-color);
  box-shadow: 
    0 0 8px var(--game-accent-glow),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-select-trigger:focus {
  border-color: var(--game-accent-color);
  box-shadow: 
    0 0 12px var(--game-accent-glow),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  outline: none;
}

.game-select-open .game-select-trigger {
  border-color: var(--game-accent-color);
  box-shadow: 
    0 0 12px var(--game-accent-glow),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.game-select-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-select-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.game-select-text.placeholder {
  color: var(--game-text-tertiary);
}

.game-select-arrow {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.game-select-open .game-select-arrow {
  transform: rotate(180deg);
}

.game-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 2px solid var(--game-card-border);
  border-radius: 8px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 136, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.game-select-option {
  padding: 0.75rem 1rem;
  font-family: var(--game-font-family);
  font-size: 0.875rem;
  color: var(--game-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--game-card-border);
}

.game-select-option:last-child {
  border-bottom: none;
}

.game-select-option:hover:not(.disabled) {
  background: rgba(0, 255, 136, 0.1);
  color: var(--game-accent-color);
}

.game-select-option.selected {
  background: rgba(0, 255, 136, 0.2);
  color: var(--game-accent-color);
  font-weight: 600;
}

.game-select-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Size variants */
.game-select-small .game-select-trigger {
  padding: 0.5rem 0.75rem;
  padding-right: 2rem;
  font-size: 0.75rem;
}

.game-select-large .game-select-trigger {
  padding: 0.875rem 1.25rem;
  padding-right: 3rem;
  font-size: 1rem;
}

/* Scrollbar styling */
.game-select-dropdown::-webkit-scrollbar {
  width: 8px;
}

.game-select-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.game-select-dropdown::-webkit-scrollbar-thumb {
  background: var(--game-card-border);
  border-radius: 4px;
}

.game-select-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--game-accent-color);
}

/* Transition */
.game-select-dropdown-enter-active,
.game-select-dropdown-leave-active {
  transition: all 0.2s ease;
}

.game-select-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.game-select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
