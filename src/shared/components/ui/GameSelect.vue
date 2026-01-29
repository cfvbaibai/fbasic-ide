<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, nextTick, onDeactivated, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import GameIcon from './GameIcon.vue'
import type { GameSelectEmits, GameSelectOption, GameSelectProps } from './GameSelect.types'

/**
 * GameSelect component - A styled select dropdown component with options.
 *
 * @example
 * ```vue
 * <GameSelect
 *   v-model="selectedValue"
 *   :options="options"
 *   placeholder="Select an option"
 *   size="medium"
 * />
 * ```
 */
defineOptions({
  name: 'GameSelect',
})

const props = withDefaults(defineProps<GameSelectProps>(), {
  options: () => [],
  placeholder: '',
  disabled: false,
  size: 'medium',
})

const emit = defineEmits<GameSelectEmits>()

const { t } = useI18n()

const isOpen = ref(false)
const selectRef = useTemplateRef<HTMLDivElement>('selectRef')
const dropdownRef = useTemplateRef<HTMLElement>('dropdownRef')

/** Position for teleported dropdown (fixed, so not clipped by parent overflow). */
const dropdownStyle = ref({ top: '0px', left: '0px', width: '100px' })

function updateDropdownPosition(): void {
  if (!selectRef.value) return
  const rect = selectRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
}

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const displayText = computed(() => {
  return selectedOption.value?.label || props.placeholder || t('common.select.placeholder')
})

const handleSelect = (option: GameSelectOption) => {
  if (!option.disabled) {
    emit('update:modelValue', option.value)
    // Close after emit so parent can process the event before dropdown unmounts
    void nextTick(() => {
      isOpen.value = false
    })
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (selectRef.value?.contains(target)) return
  if (dropdownRef.value?.contains(target)) return
  // Teleported dropdown may not have ref set yet; check by class
  if ((target as Element).closest?.('.game-select-dropdown')) return
  isOpen.value = false
}

useEventListener(document, 'click', handleClickOutside)
useEventListener(window, 'resize', () => {
  if (isOpen.value) updateDropdownPosition()
})

watch(isOpen, open => {
  if (open) void nextTick(updateDropdownPosition)
})

// Close dropdown on deactivation (keep-alive support)
onDeactivated(() => {
  isOpen.value = false
})

const selectClasses = computed(() => {
  return {
    'game-select': true,
    [`game-select-${props.size}`]: true,
    'game-select-open': isOpen.value,
    'game-select-disabled': props.disabled,
  }
})

const selectWidth = computed(() => props.width ?? '100%')
</script>

<template>
  <div ref="selectRef" :class="selectClasses">
    <button
      type="button"
      class="game-select-trigger bg-game-surface border-game-surface"
      :disabled="disabled"
      @click="isOpen = !isOpen"
    >
      <span class="game-select-text" :class="{ placeholder: !selectedOption }">
        {{ displayText }}
      </span>
      <GameIcon icon="mdi:chevron-down" size="small" class="game-select-arrow" />
    </button>

    <Teleport to="body">
      <Transition name="game-select-dropdown">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="game-select-dropdown game-select-dropdown-fixed"
          :style="dropdownStyle"
          @click.stop
        >
          <div
            v-for="option in options"
            :key="String(option.value)"
            :class="[
              'game-select-option',
              {
                selected: option.value === modelValue,
                disabled: option.disabled,
              },
            ]"
            @mousedown.prevent="handleSelect(option)"
          >
            {{ option.label }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.game-select {
  position: relative;
  display: inline-block;
  width: v-bind(selectWidth);
}

.game-select-trigger {
  width: 100%;
  padding: 0.625rem 1rem;
  padding-right: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--game-text-primary);
  text-align: left;
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow:
    0 2px 4px var(--base-alpha-gray-00-30),
    inset 0 1px 0 var(--base-alpha-gray-100-10);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.game-select-trigger:focus {
  border-color: var(--base-solid-primary);
  box-shadow:
    0 0 12px var(--game-accent-glow),
    0 2px 4px var(--base-alpha-gray-00-30),
    inset 0 1px 0 var(--base-alpha-gray-100-10);
  outline: none;
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
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 8px;
  box-shadow:
    0 4px 12px var(--base-alpha-gray-00-40),
    0 0 20px var(--base-alpha-primary-20),
    inset 0 1px 0 var(--base-alpha-gray-100-10);
  max-height: 200px;
  overflow-y: auto;
}

/* Teleported dropdown: fixed so not clipped by parent overflow */
.game-select-dropdown-fixed {
  position: fixed;
  z-index: 9999;
}

.game-select-option {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--game-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--game-surface-border);
}

.game-select-option:last-child {
  border-bottom: none;
}

.game-select-option:hover:not(.disabled) {
  background: var(--base-alpha-primary-10);
  color: var(--base-solid-primary);
}

.game-select-option.selected {
  background: var(--base-alpha-primary-20);
  color: var(--base-solid-primary);
  font-weight: 600;
}

.game-select-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Size variants */
.game-select-small .game-select-trigger {
  padding: 0.5rem 0.75rem;
  padding-right: 0.625rem;
  font-size: 0.75rem;
}

.game-select-large .game-select-trigger {
  padding: 0.875rem 1.25rem;
  padding-right: 1rem;
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
  background: var(--game-surface-border);
  border-radius: 4px;
}

.game-select-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--base-solid-primary);
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
