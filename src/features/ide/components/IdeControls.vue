<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { GameButton, GameSwitch } from '../../../shared/components/ui'

/**
 * IdeControls component - Control buttons for the IDE (run, stop, clear, debug toggle).
 * 
 * @example
 * ```vue
 * <IdeControls
 *   :is-running="isRunning"
 *   :can-run="canRun"
 *   :can-stop="canStop"
 *   :debug-mode="debugMode"
 *   @run="handleRun"
 *   @stop="handleStop"
 *   @clear="handleClear"
 *   @toggle-debug="handleToggleDebug"
 * />
 * ```
 */
defineOptions({
  name: 'IdeControls'
})

const { t } = useI18n()

interface Props {
  /** Whether the program is currently running */
  isRunning: boolean
  /** Whether the run button should be enabled */
  canRun?: boolean
  /** Whether the stop button should be enabled */
  canStop?: boolean
  /** Whether debug mode is currently enabled */
  debugMode?: boolean
}

interface Emits {
  /** Emitted when the run button is clicked */
  (e: 'run'): void
  /** Emitted when the stop button is clicked */
  (e: 'stop'): void
  /** Emitted when the clear button is clicked */
  (e: 'clear'): void
  /** Emitted when the debug toggle is changed */
  (e: 'toggle-debug'): void
}

const props = withDefaults(defineProps<Props>(), {
  canRun: true,
  canStop: false,
  debugMode: false
})
const emit = defineEmits<Emits>()

const handleRun = () => {
  emit('run')
}

const handleStop = () => {
  emit('stop')
}

const handleClear = () => {
  emit('clear')
}

const handleDebugToggle = (value: boolean | string | number) => {
  // Only emit if the value actually changed (toggle behavior)
  const boolValue = Boolean(value)
  if (boolValue !== props.debugMode) {
    emit('toggle-debug')
  }
}
</script>

<template>
  <div class="ide-controls">
    <GameButton type="primary" :disabled="!canRun" icon="mdi:play" @click="handleRun">
      {{ t('ide.controls.run') }}
    </GameButton>

    <GameButton type="danger" :disabled="!canStop" icon="mdi:pause" @click="handleStop">
      {{ t('ide.controls.stop') }}
    </GameButton>

    <GameButton type="warning" icon="mdi:delete" @click="handleClear">
      {{ t('ide.controls.clear') }}
    </GameButton>

    <div class="debug-control">
      <span class="debug-label text-game-secondary">{{ t('ide.controls.debug') }}</span>
      <GameSwitch :model-value="debugMode" @update:model-value="handleDebugToggle" />
    </div>
  </div>
</template>

<style scoped>
.ide-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

.debug-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}
</style>
