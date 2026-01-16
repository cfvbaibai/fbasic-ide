<script setup lang="ts">
import { computed, provide, ref } from 'vue'

interface Props {
  modelValue: string
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

// Provide to children
provide('activeTab', activeTab)
provide('setActiveTab', (name: string) => {
  activeTab.value = name
})
provide('tabsType', props.type)
provide('registerTab', registerTab)
provide('unregisterTab', unregisterTab)
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
  padding: 0.5rem;
  background: var(--game-surface-bg-gradient);
  border-bottom: 2px solid var(--game-surface-border);
  overflow-x: auto;
  flex-shrink: 0;
  position: relative;
}

.game-tabs-header::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-glow) 50%, 
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-tabs-header:hover::before {
  opacity: 0.3;
}

.game-tabs-border-card .game-tabs-header {
  background: transparent;
  border-bottom: none;
  padding: 0;
  gap: 0.25rem;
}

/* Border card tab button styles - buttons are rendered here */
.game-tabs-border-card :deep(.game-tab-button) {
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  margin-right: 0.25rem;
  padding: 0.625rem 1rem;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  gap: 0.625rem;
  min-height: 40px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
}

.game-tabs-border-card :deep(.game-tab-button::before) {
  content: '';
  position: absolute;
  top: 0;
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
  opacity: 0;
}

.game-tabs-border-card :deep(.game-tab-button::after) {
  border-radius: 6px 6px 0 0;
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.05) 0%, 
    rgba(0, 255, 136, 0.02) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled)) {
  border-color: var(--game-surface-border-hover);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 0 16px var(--game-accent-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  color: var(--game-text-primary);
  background: linear-gradient(135deg, #3a3a4e 0%, #2a2a3e 100%);
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled)::before) {
  transform: scaleX(0.6);
  opacity: 0.6;
  box-shadow: 0 0 12px var(--game-accent-glow);
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled)::after) {
  opacity: 1;
}

.game-tabs-border-card :deep(.game-tab-button.active) {
  background: var(--game-surface-bg-gradient);
  border-color: var(--game-accent-color);
  border-bottom-color: transparent;
  box-shadow: 
    0 -4px 20px var(--game-accent-glow),
    0 0 30px var(--game-accent-glow),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 1;
  position: relative;
  transform: translateY(-2px);
  color: var(--game-accent-color);
}

.game-tabs-border-card :deep(.game-tab-button.active::before) {
  transform: scaleX(1);
  opacity: 1;
  background: linear-gradient(90deg, 
    var(--game-accent-color) 0%, 
    #00cc6a 50%, 
    var(--game-accent-color) 100%
  );
  box-shadow: 
    0 0 16px var(--game-accent-glow),
    0 0 24px var(--game-accent-glow);
  height: 3px;
}

.game-tabs-border-card :deep(.game-tab-button.active::after) {
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.25) 0%, 
    rgba(0, 255, 136, 0.15) 100%
  );
  box-shadow: inset 0 0 30px var(--game-accent-glow);
  opacity: 1;
}

/* Icon styles */
.game-tabs-border-card :deep(.game-tab-button .game-icon) {
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px currentColor) drop-shadow(0 0 10px rgba(0, 255, 136, 0.3));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 18px;
  height: 18px;
  position: relative;
  z-index: 2;
  color: var(--game-text-secondary);
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled) .game-icon) {
  filter: drop-shadow(0 0 10px var(--game-accent-glow)) 
          drop-shadow(0 0 16px var(--game-accent-glow))
          drop-shadow(0 0 24px rgba(0, 255, 136, 0.4));
  transform: scale(1.15) rotate(5deg);
  color: var(--game-accent-color);
}

.game-tabs-border-card :deep(.game-tab-button.active .game-icon) {
  filter: drop-shadow(0 0 16px var(--game-accent-color)) 
          drop-shadow(0 0 28px var(--game-accent-color))
          drop-shadow(0 0 40px var(--game-accent-glow))
          drop-shadow(0 0 60px rgba(0, 255, 136, 0.5));
  color: var(--game-accent-color);
  transform: scale(1.2) rotate(0deg);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    filter: drop-shadow(0 0 16px var(--game-accent-color)) 
            drop-shadow(0 0 28px var(--game-accent-color))
            drop-shadow(0 0 40px var(--game-accent-glow));
  }
  50% {
    filter: drop-shadow(0 0 20px var(--game-accent-color)) 
            drop-shadow(0 0 36px var(--game-accent-color))
            drop-shadow(0 0 50px var(--game-accent-glow))
            drop-shadow(0 0 70px rgba(0, 255, 136, 0.6));
  }
}

/* Text span styles */
.game-tabs-border-card :deep(.game-tab-button span:not(.game-tag-content)) {
  font-weight: 800;
  font-family: var(--game-font-family-heading);
  font-size: 0.875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  color: var(--game-text-secondary);
  padding: 0.125rem 0.25rem;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, transparent 100%);
  border-radius: 4px;
  text-shadow: 0 0 3px rgba(0, 255, 136, 0.3);
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled) span:not(.game-tag-content)) {
  text-shadow: 
    0 0 4px var(--game-accent-glow),
    0 0 8px rgba(0, 255, 136, 0.4);
  color: var(--game-text-primary);
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
  transform: translateX(2px);
}

.game-tabs-border-card :deep(.game-tab-button.active span:not(.game-tag-content)) {
  text-shadow: 
    0 0 6px var(--game-accent-glow), 
    0 0 12px rgba(0, 255, 136, 0.5);
  color: var(--game-accent-color);
  font-weight: 800;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.08) 100%);
  box-shadow: 
    0 0 8px rgba(0, 255, 136, 0.2),
    inset 0 0 8px rgba(0, 255, 136, 0.05);
  transform: translateX(0);
  animation: textGlow 2s ease-in-out infinite;
}

@keyframes textGlow {
  0%, 100% {
    text-shadow: 
      0 0 6px var(--game-accent-glow), 
      0 0 12px rgba(0, 255, 136, 0.5);
  }
  50% {
    text-shadow: 
      0 0 8px var(--game-accent-glow), 
      0 0 16px rgba(0, 255, 136, 0.6);
  }
}

/* Tag styles */
.game-tabs-border-card :deep(.game-tab-button .game-tag) {
  margin-left: 0.5rem;
  font-size: 0.625rem;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  box-shadow: 
    0 0 6px rgba(0, 0, 0, 0.4),
    0 2px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  height: 20px;
  line-height: 1.2;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  position: relative;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  border-width: 1.5px;
  backdrop-filter: blur(4px);
}

.game-tabs-border-card :deep(.game-tab-button .game-tag .game-icon) {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 0 4px currentColor) drop-shadow(0 0 8px rgba(0, 255, 136, 0.3));
  transition: all 0.3s ease;
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled) .game-tag) {
  box-shadow: 
    0 0 12px var(--game-accent-glow),
    0 0 20px var(--game-accent-glow),
    0 0 30px rgba(0, 255, 136, 0.3),
    0 2px 6px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: scale(1.08) translateY(-1px);
  border-color: var(--game-accent-color);
}

.game-tabs-border-card :deep(.game-tab-button:hover:not(.disabled) .game-tag .game-icon) {
  filter: drop-shadow(0 0 8px currentColor) 
          drop-shadow(0 0 12px currentColor)
          drop-shadow(0 0 16px rgba(0, 255, 136, 0.5));
  transform: scale(1.1) rotate(5deg);
}

.game-tabs-border-card :deep(.game-tab-button.active .game-tag) {
  box-shadow: 
    0 0 16px var(--game-accent-glow),
    0 0 28px var(--game-accent-glow),
    0 0 40px rgba(0, 255, 136, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.12) translateY(-1px);
  border-color: var(--game-accent-color);
  animation: tagPulse 2s ease-in-out infinite;
}

@keyframes tagPulse {
  0%, 100% {
    box-shadow: 
      0 0 16px var(--game-accent-glow),
      0 0 28px var(--game-accent-glow),
      0 0 40px rgba(0, 255, 136, 0.4);
  }
  50% {
    box-shadow: 
      0 0 20px var(--game-accent-glow),
      0 0 36px var(--game-accent-glow),
      0 0 50px rgba(0, 255, 136, 0.5),
      0 0 70px rgba(0, 255, 136, 0.3);
  }
}

.game-tabs-border-card :deep(.game-tab-button.active .game-tag .game-icon) {
  filter: drop-shadow(0 0 10px currentColor) 
          drop-shadow(0 0 16px currentColor)
          drop-shadow(0 0 24px rgba(0, 255, 136, 0.6));
  transform: scale(1.15) rotate(0deg);
  animation: tagIconPulse 2s ease-in-out infinite;
}

@keyframes tagIconPulse {
  0%, 100% {
    filter: drop-shadow(0 0 10px currentColor) 
            drop-shadow(0 0 16px currentColor);
  }
  50% {
    filter: drop-shadow(0 0 14px currentColor) 
            drop-shadow(0 0 22px currentColor)
            drop-shadow(0 0 30px rgba(0, 255, 136, 0.7));
  }
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
  background: var(--game-accent-color);
  box-shadow: 0 0 8px var(--game-accent-glow);
}
</style>
