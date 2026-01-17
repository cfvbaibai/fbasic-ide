<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, useSlots, watch, h } from 'vue'
import GameTabButton from './GameTabButton.vue'

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

const registerTab = inject<(name: string, render: () => any) => void>('registerTab', () => {})
const unregisterTab = inject<(name: string) => void>('unregisterTab', () => {})

// Render function for tab button - uses GameTabButton component
const renderButton = () => {
  return h(GameTabButton, {
    name: props.name,
    label: props.label,
    icon: props.icon,
    disabled: props.disabled
  }, slots.label ? { label: slots.label } : {})
}

onMounted(() => {
  registerTab(props.name, renderButton)
})

// Watch for activeTab changes and re-register to update button state
const activeTab = inject<{ value: string }>('activeTab', { value: '' })
watch(() => activeTab.value, () => {
  registerTab(props.name, renderButton)
}, { immediate: false })

onUnmounted(() => {
  unregisterTab(props.name)
})

const isActive = computed(() => activeTab.value === props.name)
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
.game-tab-pane {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* Border card pane styles */
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
</style>
