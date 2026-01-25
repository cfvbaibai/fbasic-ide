<script setup lang="ts">
/**
 * JoystickControl component - Control interface for Nintendo controller joysticks.
 */
defineOptions({
  name: 'JoystickControl'
})
const props = defineProps<Props>()
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { GameBlock, GameCollapseToggle, GameSubBlock } from '@/shared/components/ui'

import { useJoystickEvents } from '../composables/useJoystickEvents'
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

// Collapsible state
const isExpanded = ref(true)

// Use joystick events composable
const {
  heldButtons,
  flashingCells,
  startDpadHold,
  stopDpadHold,
  toggleActionButton
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- Function props don't need reactivity wrapping
} = useJoystickEvents({
  sendStickEvent: props.sendStickEvent,
  sendStrigEvent: props.sendStrigEvent,
  onStickStateChange: (joystickId, state) => {
    stickStates.value[joystickId] = state
  },
  onStrigStateChange: (joystickId, state) => {
    trigStates.value[joystickId] = state
  }
})

// Computed property for table data
const joystickStatusData = computed(() => {
  return [
    {
      id: 0,
      stick: stickStates.value[0] || 0,
      strig: trigStates.value[0] || 0
    },
    {
      id: 1,
      stick: stickStates.value[1] || 0,
      strig: trigStates.value[1] || 0
    }
  ]
})
</script>

<template>
  <GameBlock :title="t('ide.joystick.control')" title-icon="mdi:play" :clickable-header="true" class="joystick-control"
    :class="{ collapsed: !isExpanded }" @click-header="isExpanded = !isExpanded">
    <template #right>
      <GameCollapseToggle :expanded="isExpanded" @toggle="isExpanded = !isExpanded" />
    </template>

    <!-- Joystick Controls and Status Display in same row -->
    <div class="joystick-content" :class="{ expanded: isExpanded }">
      <div class="joystick-panels-row">
        <!-- Joystick Controls -->
        <div class="control-grid">
          <GameSubBlock v-for="joystickId in 2" :key="joystickId - 1" :title="t('ide.joystick.joystick', { id: joystickId - 1 })">
            <!-- Nintendo Controller Layout -->
            <NintendoController :joystick-id="joystickId - 1" :held-buttons="heldButtons"
              @dpad-start="(direction: 'up' | 'down' | 'left' | 'right') => startDpadHold(joystickId - 1, direction)"
              @dpad-stop="(direction: 'up' | 'down' | 'left' | 'right') => stopDpadHold(joystickId - 1, direction)"
              @action-button="(button: 'select' | 'start' | 'a' | 'b') => toggleActionButton(joystickId - 1, button)" />
          </GameSubBlock>

          <JoystickStatusTable :status-data="joystickStatusData" :flashing-cells="flashingCells" />
        </div>
      </div>
    </div>
  </GameBlock>
</template>

<style scoped>
.joystick-content {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s,
    transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s,
    margin-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(-20px) scale(0.98);
  margin-top: -1rem;
  filter: blur(2px);
}

.joystick-content.expanded {
  max-height: 2000px;
  opacity: 1;
  transform: translateY(0) scale(1);
  margin-top: 0;
  filter: blur(0);
  transition:
    max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s,
    transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s,
    margin-top 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s,
    filter 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
}

.joystick-control.collapsed {
  margin-bottom: 0.5rem;
}

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
