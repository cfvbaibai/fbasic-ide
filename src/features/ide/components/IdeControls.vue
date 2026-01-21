<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { GameButton, GameSwitch } from '../../../shared/components/ui'

const { t } = useI18n()

interface Props {
  isRunning: boolean
  canRun?: boolean
  canStop?: boolean
  debugMode?: boolean
}

interface Emits {
  (e: 'run'): void
  (e: 'stop'): void
  (e: 'clear'): void
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

    <GameButton type="danger" :disabled="!canStop" icon="mdi:pause" @click="$emit('stop')">
      {{ t('ide.controls.stop') }}
    </GameButton>

    <GameButton type="warning" icon="mdi:delete" @click="$emit('clear')">
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
