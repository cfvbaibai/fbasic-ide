<script setup lang="ts">
import Dpad from './Dpad.vue'
import ManualActionButton from './ManualActionButton.vue'

/**
 * NintendoController component - Full Nintendo controller component with D-pad and action buttons.
 */
defineOptions({
  name: 'NintendoController',
})

defineProps<Props>()

const emit = defineEmits<Emits>()

interface Props {
  joystickId: number
  heldButtons: Record<string, boolean>
}

interface Emits {
  (e: 'dpadStart', direction: 'up' | 'down' | 'left' | 'right'): void
  (e: 'dpadStop', direction: 'up' | 'down' | 'left' | 'right'): void
  (e: 'actionButton', button: 'select' | 'start' | 'a' | 'b'): void
}

const handleDpadStart = (direction: 'up' | 'down' | 'left' | 'right') => {
  emit('dpadStart', direction)
}

const handleDpadStop = (direction: 'up' | 'down' | 'left' | 'right') => {
  emit('dpadStop', direction)
}

const handleActionButton = (button: 'select' | 'start' | 'a' | 'b') => {
  emit('actionButton', button)
}
</script>

<template>
  <div class="nintendo-controller">
    <!-- D-Pad (Cross) on the left -->
    <Dpad @dpad-start="handleDpadStart" @dpad-stop="handleDpadStop" />

    <!-- Select/Start and A/B groups; stack vertically when width is not enough -->
    <div class="controller-button-groups">
      <div class="select-start-buttons">
        <ManualActionButton button="select" :active="heldButtons[`${joystickId}-select`]" @click="handleActionButton" />
        <ManualActionButton button="start" :active="heldButtons[`${joystickId}-start`]" @click="handleActionButton" />
      </div>
      <div class="controller-section action-buttons-section">
        <div class="action-buttons">
          <ManualActionButton button="b" :active="heldButtons[`${joystickId}-b`]" @click="handleActionButton" />
          <ManualActionButton button="a" :active="heldButtons[`${joystickId}-a`]" @click="handleActionButton" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Nintendo Controller Layout: D-pad and button groups stay on one row */
.nintendo-controller {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem;
  width: 100%;
  min-width: 0;
}

/* Select/Start and A/B groups: row when wide, stack vertically when narrow */
.controller-button-groups {
  display: flex;
  flex-flow: row wrap;
  gap: 0.5rem;
  align-items: center;
  min-width: 0;
}

.controller-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.section-label {
  font-size: 0.625rem;
  font-weight: var(--game-font-weight-bold);
  font-family: var(--game-font-family-heading);
  color: var(--game-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  line-height: 1.2;
}

/* Section width variants */
.select-start-buttons {
  flex: 0 0 0;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
}

.action-buttons-section {
  flex: 0 0 auto;
  min-width: 70px;
}

.action-buttons {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}
</style>
