<script setup lang="ts">
import { Tools } from '@element-plus/icons-vue'
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
</script>

<template>
  <div class="ide-controls">
    <el-button-group>
      <el-button 
        type="primary" 
        :disabled="!canRun"
        @click="handleRun"
      >
        <el-icon><VideoPlay /></el-icon>
        Run
      </el-button>
      
      <el-button 
        type="danger" 
        :disabled="!canStop"
        @click="$emit('stop')"
      >
        <el-icon><VideoPause /></el-icon>
        Stop
      </el-button>
      
      <el-button 
        type="warning"
        @click="$emit('clear')"
      >
        <el-icon><Delete /></el-icon>
        Clear
      </el-button>
      
      <el-button 
        :type="debugMode ? 'success' : 'default'"
        @click="$emit('toggle-debug')"
      >
        <el-icon><Tools /></el-icon>
        Debug
      </el-button>
    </el-button-group>
    
    <div class="status-indicator">
      <el-tag 
        :type="isRunning ? 'success' : 'info'"
        :effect="isRunning ? 'dark' : 'light'"
      >
        <el-icon v-if="isRunning" class="rotating"><Loading /></el-icon>
        <el-icon v-else><CircleCheck /></el-icon>
        {{ isRunning ? 'Running' : 'Ready' }}
      </el-tag>
    </div>
  </div>
</template>

<style scoped>
.ide-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
