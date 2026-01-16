<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, useSlots, watch, h } from 'vue'
import GameIcon from './GameIcon.vue'

interface Props {
  name: string
  label?: string
  icon?: any
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  icon: null,
  disabled: false
})

const slots = useSlots()

const activeTab = inject<{ value: string }>('activeTab', { value: '' })
const setActiveTab = inject<(name: string) => void>('setActiveTab', () => {})
const tabsType = inject<'default' | 'border-card'>('tabsType', 'default')
const registerTab = inject<(name: string, render: () => any) => void>('registerTab', () => {})
const unregisterTab = inject<(name: string) => void>('unregisterTab', () => {})

const isActive = computed(() => activeTab.value === props.name)

const handleClick = () => {
  if (!props.disabled) {
    setActiveTab(props.name)
  }
}

const tabLabel = computed(() => {
  if (slots.label) {
    return null // Use slot content
  }
  return props.label || props.name
})

// Render function for tab button - always reads current state
const renderButton = () => {
  const currentIsActive = activeTab.value === props.name
  return h('button', {
    class: ['game-tab-button', { active: currentIsActive, disabled: props.disabled }],
    onClick: handleClick,
    type: 'button'
  }, [
    props.icon ? h(GameIcon, { icon: props.icon, size: 'small', class: 'game-tab-icon' }) : null,
    slots.label ? slots.label() : (props.label || props.name)
  ])
}

onMounted(() => {
  registerTab(props.name, renderButton)
})

// Watch for activeTab changes and re-register to update button state
watch(() => activeTab.value, () => {
  registerTab(props.name, renderButton)
}, { immediate: false })

onUnmounted(() => {
  unregisterTab(props.name)
})
</script>

<template>
  <div
    v-show="isActive"
    :class="['game-tab-pane', { active: isActive }]"
  >
    <slot />
  </div>
</template>

<style scoped>
.game-tab-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--game-text-secondary);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  user-select: none;
  position: relative;
  overflow: visible;
}

/* Style content within tab button */
.game-tab-button :deep(.game-icon) {
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px currentColor);
  transition: filter 0.3s ease;
}

.game-tab-button.active :deep(.game-icon) {
  filter: drop-shadow(0 0 8px var(--game-accent-color));
}

.game-tab-button :deep(span:not(.game-tag-content)) {
  font-weight: 600;
  letter-spacing: 0.05em;
}

.game-tab-button.active :deep(span:not(.game-tag-content)) {
  text-shadow: 0 0 8px var(--game-accent-glow);
}

/* Style tags within tab button */
.game-tab-button :deep(.game-tag) {
  margin-left: 0.25rem;
  font-size: 0.625rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.game-tab-button.active :deep(.game-tag) {
  box-shadow: 0 0 8px var(--game-accent-glow);
}

.game-tab-button::before {
  content: '';
  position: absolute;
  bottom: 0;
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
}

.game-tab-button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.05) 0%, 
    rgba(0, 255, 136, 0.02) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.game-tab-button:hover:not(.disabled) {
  color: var(--game-text-primary);
}

.game-tab-button:hover:not(.disabled)::after {
  opacity: 1;
}

.game-tab-button:hover:not(.disabled)::before {
  transform: scaleX(0.5);
  box-shadow: 0 0 8px var(--game-accent-glow);
}

.game-tab-button.active {
  color: var(--game-accent-color);
  text-shadow: 0 0 8px var(--game-accent-glow);
}

.game-tab-button.active::before {
  transform: scaleX(1);
  background: linear-gradient(90deg, 
    var(--game-accent-color) 0%, 
    #00cc6a 50%, 
    var(--game-accent-color) 100%
  );
  box-shadow: 
    0 0 12px var(--game-accent-glow),
    0 0 20px var(--game-accent-glow);
}

.game-tab-button.active::after {
  opacity: 1;
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.15) 0%, 
    rgba(0, 255, 136, 0.05) 100%
  );
}

.game-tab-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-tab-icon {
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px currentColor);
  transition: filter 0.3s ease;
}

.game-tab-button.active .game-tab-icon {
  filter: drop-shadow(0 0 8px var(--game-accent-color));
}

.game-tab-pane {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* Border card style */
.game-tabs-border-card .game-tab-button {
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
  gap: 0.5rem;
  min-height: 40px;
  overflow: hidden;
}

.game-tabs-border-card .game-tab-button::before {
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

.game-tabs-border-card .game-tab-button::after {
  border-radius: 6px 6px 0 0;
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.05) 0%, 
    rgba(0, 255, 136, 0.02) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-tabs-border-card .game-tab-button:hover:not(.disabled) {
  border-color: var(--game-surface-border-hover);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 0 16px var(--game-accent-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  color: var(--game-text-primary);
  background: linear-gradient(135deg, #3a3a4e 0%, #2a2a3e 100%);
}

.game-tabs-border-card .game-tab-button:hover:not(.disabled)::before {
  transform: scaleX(0.6);
  opacity: 0.6;
  box-shadow: 0 0 12px var(--game-accent-glow);
}

.game-tabs-border-card .game-tab-button:hover:not(.disabled)::after {
  opacity: 1;
}

.game-tabs-border-card .game-tab-button.active {
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

.game-tabs-border-card .game-tab-button.active::before {
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

.game-tabs-border-card .game-tab-button.active::after {
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.25) 0%, 
    rgba(0, 255, 136, 0.15) 100%
  );
  box-shadow: inset 0 0 30px var(--game-accent-glow);
  opacity: 1;
}

/* Style content in border-card tabs */
.game-tabs-border-card .game-tab-button {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
}

.game-tabs-border-card .game-tab-button :deep(.game-icon) {
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px currentColor) drop-shadow(0 0 10px rgba(0, 255, 136, 0.3));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 18px;
  height: 18px;
  position: relative;
  z-index: 2;
  color: var(--game-text-secondary);
}

.game-tabs-border-card .game-tab-button:hover:not(.disabled) :deep(.game-icon) {
  filter: drop-shadow(0 0 10px var(--game-accent-glow)) 
          drop-shadow(0 0 16px var(--game-accent-glow))
          drop-shadow(0 0 24px rgba(0, 255, 136, 0.4));
  transform: scale(1.15) rotate(5deg);
  color: var(--game-accent-color);
}

.game-tabs-border-card .game-tab-button.active :deep(.game-icon) {
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

.game-tabs-border-card .game-tab-button :deep(span:not(.game-tag-content)) {
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
  text-shadow: 0 0 4px currentColor;
}

.game-tabs-border-card .game-tab-button:hover:not(.disabled) :deep(span:not(.game-tag-content)) {
  text-shadow: 
    0 0 8px var(--game-accent-glow),
    0 0 16px var(--game-accent-glow),
    0 0 24px rgba(0, 255, 136, 0.4);
  color: var(--game-text-primary);
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
  transform: translateX(2px);
}

.game-tabs-border-card .game-tab-button.active :deep(span:not(.game-tag-content)) {
  text-shadow: 
    0 0 16px var(--game-accent-glow), 
    0 0 32px var(--game-accent-glow),
    0 0 48px var(--game-accent-glow),
    0 0 64px rgba(0, 255, 136, 0.5);
  color: var(--game-accent-color);
  font-weight: 800;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.08) 100%);
  box-shadow: 
    0 0 12px rgba(0, 255, 136, 0.3),
    inset 0 0 12px rgba(0, 255, 136, 0.1);
  transform: translateX(0);
  animation: textGlow 2s ease-in-out infinite;
}

@keyframes textGlow {
  0%, 100% {
    text-shadow: 
      0 0 16px var(--game-accent-glow), 
      0 0 32px var(--game-accent-glow),
      0 0 48px var(--game-accent-glow);
  }
  50% {
    text-shadow: 
      0 0 20px var(--game-accent-glow), 
      0 0 40px var(--game-accent-glow),
      0 0 60px var(--game-accent-glow),
      0 0 80px rgba(0, 255, 136, 0.6);
  }
}

.game-tabs-border-card .game-tab-button :deep(.game-tag) {
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

.game-tabs-border-card .game-tab-button :deep(.game-tag .game-icon) {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 0 4px currentColor) drop-shadow(0 0 8px rgba(0, 255, 136, 0.3));
  transition: all 0.3s ease;
}

.game-tabs-border-card .game-tab-button:hover:not(.disabled) :deep(.game-tag) {
  box-shadow: 
    0 0 12px var(--game-accent-glow),
    0 0 20px var(--game-accent-glow),
    0 0 30px rgba(0, 255, 136, 0.3),
    0 2px 6px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: scale(1.08) translateY(-1px);
  border-color: var(--game-accent-color);
}

.game-tabs-border-card .game-tab-button:hover:not(.disabled) :deep(.game-tag .game-icon) {
  filter: drop-shadow(0 0 8px currentColor) 
          drop-shadow(0 0 12px currentColor)
          drop-shadow(0 0 16px rgba(0, 255, 136, 0.5));
  transform: scale(1.1) rotate(5deg);
}

.game-tabs-border-card .game-tab-button.active :deep(.game-tag) {
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

.game-tabs-border-card .game-tab-button.active :deep(.game-tag .game-icon) {
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

.game-tabs-border-card .game-tab-button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.game-tabs-border-card .game-tab-button.disabled :deep(.game-icon),
.game-tabs-border-card .game-tab-button.disabled :deep(span:not(.game-tag-content)) {
  opacity: 0.5;
}

.game-tabs-border-card .game-tab-pane {
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 0 8px 8px 8px;
  padding: 1rem;
  margin-top: -2px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.game-tabs-border-card .game-tab-pane::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    var(--game-accent-color) 0%, 
    #00cc6a 50%,
    var(--game-accent-color) 100%
  );
  opacity: 0.8;
  box-shadow: 
    0 0 12px var(--game-accent-glow),
    0 0 20px var(--game-accent-glow);
}

.game-tabs-border-card .game-tab-pane::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.03) 0%, 
    transparent 50%,
    rgba(0, 255, 136, 0.01) 100%
  );
  pointer-events: none;
  z-index: 0;
}

/* Focus styles for accessibility */
.game-tab-button:focus-visible {
  outline: 2px solid var(--game-accent-color);
  outline-offset: 2px;
  box-shadow: 
    0 0 0 2px var(--game-accent-color),
    0 0 12px var(--game-accent-glow);
}
</style>
