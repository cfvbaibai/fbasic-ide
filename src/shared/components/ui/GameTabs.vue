<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import {
  ActiveTabKey,
  SetActiveTabKey,
  TabsTypeKey,
  RegisterTabKey,
  UnregisterTabKey
} from './game-tabs-keys'

/**
 * GameTabs component - A tabbed interface component with type-safe provide/inject.
 * 
 * @example
 * ```vue
 * <GameTabs v-model="activeTab" type="border-card">
 *   <GameTabPane name="tab1" label="Tab 1">
 *     Content for tab 1
 *   </GameTabPane>
 * </GameTabs>
 * ```
 */
defineOptions({
  name: 'GameTabs'
})

interface Props {
  /** The currently active tab name */
  modelValue: string
  /** Tab style variant */
  type?: 'default' | 'border-card'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const tabButtons = ref<Array<{ name: string; render: () => any }>>([])

const registerTab = (name: string, render: () => any) => {
  const existingIndex = tabButtons.value.findIndex(t => t.name === name)
  if (existingIndex > -1) {
    // Update existing tab
    tabButtons.value[existingIndex] = { name, render }
  } else {
    // Add new tab
    tabButtons.value.push({ name, render })
  }
}

const unregisterTab = (name: string) => {
  const index = tabButtons.value.findIndex(t => t.name === name)
  if (index > -1) {
    tabButtons.value.splice(index, 1)
  }
}

const setActiveTab = (name: string) => {
  activeTab.value = name
}

// Provide to children with type-safe injection keys
provide(ActiveTabKey, activeTab)
provide(SetActiveTabKey, setActiveTab)
provide(TabsTypeKey, props.type)
provide(RegisterTabKey, registerTab)
provide(UnregisterTabKey, unregisterTab)
</script>

<template>
  <div :class="['game-tabs', `game-tabs-${type}`]">
    <div class="game-tabs-header">
      <component
        v-for="tab in tabButtons"
        :key="`${tab.name}-${activeTab}`"
        :is="tab.render"
      />
    </div>
    <div class="game-tabs-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.game-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.game-tabs-header {
  display: flex;
  gap: 0.5rem;
  padding: 0.375rem;
  background: transparent;
  border-bottom: 1px solid var(--game-surface-border);
  overflow-x: auto;
  flex-shrink: 0;
  position: relative;
}

.game-tabs-border-card .game-tabs-header {
  background: transparent;
  border-bottom: none;
  padding: 0;
  gap: 0.125rem;
}

/* Border card tab button styles - buttons are rendered here */
.game-tabs-border-card :deep(.game-tab-button) {
  background: transparent;
  border: 1px solid var(--game-surface-border);
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  margin-right: 0.125rem;
  padding: 0.875rem 0.875rem 0.75rem;
  box-shadow: none;
  position: relative;
  gap: 0.5rem;
  min-height: auto;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
}

.game-tabs-border-card :deep(.game-tab-button::before) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--base-solid-primary);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.2s ease;
  opacity: 0;
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled)) {
  border-color: var(--game-surface-border);
  box-shadow: none;
  transform: none;
  color: var(--game-text-primary);
  background: var(--game-surface-bg-start);
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled)::before) {
  transform: scaleX(0.4);
  opacity: 0.5;
}

.game-tabs-border-card :deep(.game-tab-button.active) {
  background: transparent;
  border-color: var(--game-surface-border);
  border-bottom-color: transparent;
  box-shadow: none;
  z-index: 1;
  position: relative;
  transform: none;
  color: var(--base-solid-primary);
}

.game-tabs-border-card :deep(.game-tab-button.active::before) {
  transform: scaleX(1);
  opacity: 1;
}

/* Icon styles - match text color */
.game-tabs-border-card :deep(.game-tab-button .game-icon) {
  flex-shrink: 0;
  transition: color 0.2s ease, filter 0.2s ease;
  width: 16px;
  height: 16px;
  position: relative;
  z-index: 2;
  color: var(--game-text-secondary);
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled) .game-icon) {
  color: var(--game-text-primary);
}

.game-tabs-border-card :deep(.game-tab-button.active .game-icon) {
  color: var(--game-text-primary) !important;
  filter: drop-shadow(0 0 8px var(--game-accent-glow));
}

/* Light theme: use accent color, no glow */
.light-theme .game-tabs-border-card :deep(.game-tab-button.active .game-icon) {
  color: var(--base-solid-primary) !important;
  filter: none;
}

/* Text span styles */
.game-tabs-border-card :deep(.game-tab-button span:not(.game-tag-content)) {
  font-weight: 600;
  font-family: var(--game-font-family-heading);
  font-size: 0.8125rem;
  letter-spacing: 0.05em;
  transition: color 0.2s ease;
  position: relative;
  z-index: 2;
  color: var(--game-text-secondary);
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled) span:not(.game-tag-content)) {
  color: var(--game-text-primary);
}

.game-tabs-border-card :deep(.game-tab-button.active span:not(.game-tag-content)) {
  color: var(--game-text-primary);
  text-shadow: 0 0 8px var(--game-accent-glow);
  font-weight: 600;
}

/* Light theme: use accent color, no glow */
.light-theme .game-tabs-border-card :deep(.game-tab-button.active span:not(.game-tag-content)) {
  color: var(--base-solid-primary);
  text-shadow: none;
}

/* Tag styles */
.game-tabs-border-card :deep(.game-tab-button .game-tag) {
  margin-left: 0.375rem;
  font-size: 0.625rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  box-shadow: none;
  height: 18px;
  line-height: 1.2;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  position: relative;
  z-index: 2;
  transition: border-color 0.2s ease;
  font-weight: 600;
  border-width: 1px;
  backdrop-filter: none;
}

.game-tabs-border-card :deep(.game-tab-button .game-tag .game-icon) {
  width: 12px;
  height: 12px;
  transition: none;
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled) .game-tag) {
  box-shadow: none;
  transform: none;
  border-color: var(--game-surface-border);
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled) .game-tag .game-icon) {
  transform: none;
}

.game-tabs-border-card :deep(.game-tab-button.active .game-tag) {
  box-shadow: none;
  transform: none;
  border-color: var(--game-surface-border);
}

.game-tabs-border-card :deep(.game-tab-button.active .game-tag .game-icon) {
  transform: none;
}

.game-tabs-border-card :deep(.game-tab-button.disabled) {
  opacity: 0.4;
  cursor: not-allowed;
}

.game-tabs-border-card :deep(.game-tab-button.disabled .game-icon),
.game-tabs-border-card :deep(.game-tab-button.disabled span:not(.game-tag-content)) {
  opacity: 0.5;
}

.game-tabs-content {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Scrollbar styling for header */
.game-tabs-header::-webkit-scrollbar {
  height: 4px;
}

.game-tabs-header::-webkit-scrollbar-track {
  background: transparent;
}

.game-tabs-header::-webkit-scrollbar-thumb {
  background: var(--game-surface-border);
  border-radius: 2px;
}

.game-tabs-header::-webkit-scrollbar-thumb:hover {
  background: var(--base-solid-primary);
}
</style>
