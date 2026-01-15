<script setup lang="ts">
import { VideoPlay, VideoPause, Delete, Loading, CircleCheck } from '@element-plus/icons-vue'
import { GameButton, GameSwitch, GameTag, GameIcon } from '../../../shared/components/ui'

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

const handleDebugToggle = (value: boolean) => {
  // Only emit if the value actually changed (toggle behavior)
  if (value !== props.debugMode) {
    emit('toggle-debug')
  }
}
</script>

<template>
  <div class="ide-controls">
    <GameButton 
      type="primary" 
      :disabled="!canRun"
      :icon="VideoPlay"
      @click="handleRun"
    >
      Run
    </GameButton>
    
    <GameButton 
      type="danger" 
      :disabled="!canStop"
      :icon="VideoPause"
      @click="$emit('stop')"
    >
      Stop
    </GameButton>
    
    <GameButton 
      type="warning"
      :icon="Delete"
      @click="$emit('clear')"
    >
      Clear
    </GameButton>
    
    <div class="debug-control">
      <span class="debug-label">Debug</span>
      <GameSwitch 
        :model-value="debugMode"
        @update:model-value="handleDebugToggle"
      />
    </div>
    
    <div class="status-indicator">
      <GameTag 
        :type="isRunning ? 'success' : 'info'"
        :effect="isRunning ? 'dark' : 'light'"
      >
        <GameIcon 
          v-if="isRunning" 
          :icon="Loading" 
          rotate
        />
        <GameIcon 
          v-else
          :icon="CircleCheck" 
        />
        {{ isRunning ? 'Running' : 'Ready' }}
      </GameTag>
    </div>
  </div>
</template>

<style scoped>
.ide-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%);
  border: 1px solid var(--game-card-border);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.1);
}

.status-indicator {
  display: flex;
  align-items: center;
}

.debug-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%);
  border: 1px solid var(--game-card-border);
  border-radius: 6px;
}

.debug-label {
  font-size: 0.9rem;
  color: var(--game-text-primary);
  font-weight: 600;
  font-family: var(--game-font-family);
  text-shadow: 0 0 4px var(--game-accent-glow);
}
</style>
