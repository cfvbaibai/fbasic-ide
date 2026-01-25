<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { GameIconButton } from '@/shared/components/ui'

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

withDefaults(defineProps<Props>(), {
  canRun: true,
  canStop: false,
  debugMode: false
})

const emit = defineEmits<Emits>()

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
  (e: 'toggleDebug'): void
}

const handleRun = () => {
  emit('run')
}

const handleStop = () => {
  emit('stop')
}

const handleClear = () => {
  emit('clear')
}

const handleDebugToggle = () => {
  emit('toggleDebug')
}
</script>

<template>
  <div class="ide-controls">
    <GameIconButton 
      type="primary" 
      :disabled="!canRun" 
      icon="mdi:play" 
      size="small"
      :title="t('ide.controls.run')"
      @click="handleRun"
    />

    <GameIconButton 
      type="danger" 
      :disabled="!canStop" 
      icon="mdi:pause" 
      size="small"
      :title="t('ide.controls.stop')"
      @click="handleStop"
    />

    <GameIconButton 
      type="warning" 
      icon="mdi:delete" 
      size="small"
      :title="t('ide.controls.clear')"
      @click="handleClear"
    />

    <GameIconButton 
      variant="toggle"
      type="info"
      icon="mdi:bug"
      size="small"
      :selected="debugMode"
      :title="t('ide.controls.debug')"
      @click="handleDebugToggle"
    />
  </div>
</template>

<style scoped>
.ide-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
}
</style>
