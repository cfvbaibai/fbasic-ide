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
  border-top: 1px solid var(--game-surface-border);
  padding: 1rem;
  box-shadow: none;
  position: relative;
  overflow: hidden;
}

.game-tabs-border-card .game-tab-pane::before {
  display: none;
}
</style>
