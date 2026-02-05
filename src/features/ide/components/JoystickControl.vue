<script setup lang="ts">
/**
 * JoystickControl component - Control interface for Nintendo controller joysticks.
 * Supports both mouse/touch input and keyboard emulation.
 */
defineOptions({
  name: 'JoystickControl',
})
const props = defineProps<Props>()
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { GameBlock, GameButton, GameSubBlock } from '@/shared/components/ui'

import { useJoystickEvents } from '../composables/useJoystickEvents'
import { useKeyboardJoystick } from '../composables/useKeyboardJoystick'
import JoystickKeybindingPanel from './JoystickKeybindingPanel.vue'
import JoystickStatusTable from './JoystickStatusTable.vue'
import NintendoController from './NintendoController.vue'

const { t } = useI18n()

// Props
interface Props {
  sendStickEvent?: (joystickId: number, state: number) => void
  sendStrigEvent?: (joystickId: number, state: number) => void
}

// Reactive state
const stickStates = ref([0, 0, 0, 0]) // STICK values for joysticks 0-3
const trigStates = ref([0, 0, 0, 0]) // STRIG values for joysticks 0-3
const showKeybindingPanel = ref(false)

// Use joystick events composable for mouse/touch input
const {
  heldButtons,
  flashingCells,
  startDpadHold,
  stopDpadHold,
  toggleActionButton,
  // eslint-disable-next-line vue/no-setup-props-reactivity-loss -- Function props don't need reactivity wrapping
} = useJoystickEvents({
  sendStickEvent: props.sendStickEvent,
  sendStrigEvent: props.sendStrigEvent,
  onStickStateChange: (joystickId, state) => {
    stickStates.value[joystickId] = state
  },
  onStrigStateChange: (joystickId, state) => {
    trigStates.value[joystickId] = state
  },
})

// Use keyboard joystick composable for keyboard input
const { keyBindings, updateKeyBindings, resetToDefaults } = useKeyboardJoystick({
  enabled: computed(() => !showKeybindingPanel.value), // Disable when configuring keys
  onDirectionStart: (joystickId, direction) => {
    // Use the same handlers as mouse input
    startDpadHold(joystickId, direction)
  },
  onDirectionStop: (joystickId, direction) => {
    stopDpadHold(joystickId, direction)
  },
  onButtonPress: (joystickId, button) => {
    toggleActionButton(joystickId, button)
  },
  onButtonRelease: (joystickId, button) => {
    const buttonKey = `${joystickId}-${button}`
    heldButtons.value[buttonKey] = false
  },
})

// Computed property for table data
const joystickStatusData = computed(() => {
  return [
    {
      id: 0,
      stick: stickStates.value[0] || 0,
      strig: trigStates.value[0] || 0,
    },
    {
      id: 1,
      stick: stickStates.value[1] || 0,
      strig: trigStates.value[1] || 0,
    },
  ]
})

// Computed property for keyboard hint with actual keybindings
const keyboardHint = computed(() => {
  const j0 = keyBindings.value.joystick0
  const j1 = keyBindings.value.joystick1
  return `${t('ide.joystick.joystick0')}: ${j0.up.displayName}/${j0.down.displayName}/${j0.left.displayName}/${j0.right.displayName} + ${j0.select.displayName}/${j0.start.displayName}/${j0.a.displayName}/${j0.b.displayName} | ${t('ide.joystick.joystick1')}: ${j1.up.displayName}/${j1.down.displayName}/${j1.left.displayName}/${j1.right.displayName} + ${j1.select.displayName}/${j1.start.displayName}/${j1.a.displayName}/${j1.b.displayName}`
})
</script>

<template>
  <GameBlock :title="t('ide.joystick.control')" title-icon="mdi:play" class="joystick-control">
    <!-- Joystick Controls and Status Display in same row -->
    <div class="joystick-content">
      <div class="joystick-panels-row">
        <!-- Joystick Controls -->
        <div class="control-grid">
          <GameSubBlock
            v-for="joystickId in 2"
            :key="joystickId - 1"
            :title="t('ide.joystick.joystick', { id: joystickId - 1 })"
          >
            <!-- Nintendo Controller Layout -->
            <NintendoController
              :joystick-id="joystickId - 1"
              :held-buttons="heldButtons"
              @dpad-start="(direction: 'up' | 'down' | 'left' | 'right') => startDpadHold(joystickId - 1, direction)"
              @dpad-stop="(direction: 'up' | 'down' | 'left' | 'right') => stopDpadHold(joystickId - 1, direction)"
              @action-button="(button: 'select' | 'start' | 'a' | 'b') => toggleActionButton(joystickId - 1, button)"
            />
          </GameSubBlock>

          <JoystickStatusTable :status-data="joystickStatusData" :flashing-cells="flashingCells" />
        </div>
      </div>
    </div>

    <!-- Keyboard Controls Hint -->
    <div class="keyboard-hint">
      <p class="hint-text">
        {{ t('ide.joystick.keyboardHint') }}: <span class="key-bindings">{{ keyboardHint }}</span>
      </p>
      <GameButton size="small" @click="showKeybindingPanel = true">
        {{ t('ide.joystick.configureKeys') }}
      </GameButton>
    </div>

    <!-- Key Binding Configuration Panel -->
    <JoystickKeybindingPanel
      v-model="showKeybindingPanel"
      :key-bindings="keyBindings"
      @update:key-bindings="updateKeyBindings"
      @reset="resetToDefaults"
    />
  </GameBlock>
</template>

<style scoped>
.joystick-panels-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  justify-content: start;
}

.keyboard-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--base-solid-gray-20);
  border-radius: var(--game-radius-sm);
  border: 1px solid var(--game-surface-border);
}

.hint-text {
  margin: 0;
  font-size: 0.75rem;
  color: var(--game-text-secondary);
  line-height: 1.4;
}

.key-bindings {
  display: block;
  margin-top: 0.25rem;
  font-family: var(--game-font-family-mono);
  color: var(--base-solid-primary);
}

@media (width <= 640px) {
  .keyboard-hint {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Glowing border animations */
@keyframes border-shimmer {
  0%,
  100% {
    background-position: -200% center;
    opacity: 0.6;
  }

  50% {
    background-position: 200% center;
    opacity: 0.9;
  }
}
</style>
