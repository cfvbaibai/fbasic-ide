<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Tools } from '@element-plus/icons-vue'
import type { BasicVariable } from '../core/interfaces'

interface Props {
  output: string
  isRunning: boolean
  errors?: Array<{ line: number; message: string; type: string }>
  variables?: Record<string, BasicVariable>
  debugOutput?: string
  debugMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => [],
  variables: () => ({}),
  debugOutput: '',
  debugMode: false
})

const outputRef = ref<HTMLDivElement>()

const scrollToBottom = () => {
  nextTick(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  })
}

watch(() => props.output, scrollToBottom)
</script>

<template>
  <div class="runtime-output">
    <!-- Text Output Area -->
    <div class="text-output">
      <div class="output-header">
        <el-icon><Document /></el-icon>
        <span>Text Output</span>
        <el-tag v-if="errors.length > 0" type="danger" size="small">
          {{ errors.length }} Error{{ errors.length > 1 ? 's' : '' }}
        </el-tag>
      </div>
      <div 
        ref="outputRef"
        class="output-content"
        :class="{ 'running': isRunning }"
      >
        <div v-if="output === '' && !isRunning && errors.length === 0" class="empty-output">
          <el-icon><Document /></el-icon>
          <p>No output yet. Run your BASIC program to see results here.</p>
        </div>
        <div v-else-if="isRunning" class="running-output">
          <el-icon class="rotating"><Loading /></el-icon>
          <span>Running...</span>
        </div>
        <div v-else>
          <pre v-if="output" class="output-text">{{ output }}</pre>
          <div v-if="errors.length > 0" class="error-output">
            <div v-for="(error, index) in errors" :key="index" class="error-line">
              <el-icon><Warning /></el-icon>
              <span class="error-type">{{ error.type }}:</span>
              <span class="error-message">{{ error.message }}</span>
              <span v-if="error.line > 0" class="error-line-number">(Line {{ error.line }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Output Area -->
    <div v-if="debugMode && debugOutput" class="debug-output">
      <div class="output-header">
        <el-icon><Tools /></el-icon>
        <span>Debug Output</span>
        <el-tag type="warning" size="small">
          Debug Mode
        </el-tag>
      </div>
      <div class="debug-content">
        <pre class="debug-text">{{ debugOutput }}</pre>
      </div>
    </div>

    <!-- Variables Display Area -->
    <div v-if="Object.keys(variables).length > 0" class="variables-output">
      <div class="output-header">
        <el-icon><DataBoard /></el-icon>
        <span>Variables</span>
        <el-tag type="success" size="small">
          {{ Object.keys(variables).length }}
        </el-tag>
      </div>
      <div class="variables-content">
        <div class="variable-list">
          <div 
            v-for="(value, name) in variables" 
            :key="name" 
            class="variable-item"
          >
            <span class="variable-name">{{ name }}</span>
            <span class="variable-value">{{ value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphics Output Area -->
    <div class="graphics-output">
      <div class="output-header">
        <el-icon><Picture /></el-icon>
        <span>Graphics Output</span>
        <el-tag type="info" size="small">
          F-Basic Gaming APIs
        </el-tag>
      </div>
      <div class="graphics-content">
        <div class="graphics-placeholder">
          <el-icon><Picture /></el-icon>
          <p>Sprites, backgrounds, and graphics will appear here</p>
          <small>Supports SPRITE, CGSET, VIEW, MOVE, and more!</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.runtime-output {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.text-output {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e4e7ed;
}

.debug-output {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e4e7ed;
  max-height: 300px;
}

.variables-output {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e4e7ed;
  max-height: 200px;
}

.graphics-output {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.output-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #606266;
}

.output-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #000;
  color: #00ff00;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.4;
}

.output-content.running {
  background: #001100;
}

.empty-output {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
}

.empty-output .el-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.running-output {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #00ff00;
  font-size: 1.2rem;
  gap: 0.5rem;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.output-text {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #00ff00;
}

.error-output {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ff4444;
}

.error-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ff4444;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.error-type {
  font-weight: bold;
  text-transform: uppercase;
}

.error-message {
  flex: 1;
}

.error-line-number {
  color: #ff8888;
  font-size: 0.8rem;
  font-style: italic;
}

.graphics-content {
  flex: 1;
  padding: 1rem;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.graphics-placeholder {
  text-align: center;
  color: #909399;
}

.graphics-placeholder .el-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.graphics-placeholder p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.graphics-placeholder small {
  font-size: 0.8rem;
  opacity: 0.7;
}

.variables-content {
  flex: 1;
  padding: 1rem;
  background: #f8f9fa;
  overflow-y: auto;
}

.variable-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.variable-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
}

.variable-name {
  font-weight: bold;
  color: #409eff;
}

.variable-value {
  color: #303133;
  background: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-weight: 500;
}

.debug-content {
  flex: 1;
  padding: 1rem;
  background: #1a1a1a;
  overflow-y: auto;
}

.debug-text {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #ffa500;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.4;
}

/* Scrollbar styling */
.output-content::-webkit-scrollbar,
.debug-content::-webkit-scrollbar {
  width: 8px;
}

.output-content::-webkit-scrollbar-track,
.debug-content::-webkit-scrollbar-track {
  background: #333;
}

.output-content::-webkit-scrollbar-thumb,
.debug-content::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 4px;
}

.output-content::-webkit-scrollbar-thumb:hover,
.debug-content::-webkit-scrollbar-thumb:hover {
  background: #888;
}
</style>