<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { Tools, Document, Warning, Loading, DataBoard, Picture } from '@element-plus/icons-vue'
import type { BasicVariable } from '../core/interfaces'

interface Props {
  output: string[]
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
const activeTab = ref('output')

// Maximum number of lines to keep in the output buffer
const MAX_OUTPUT_LINES = 1000

// Computed property for rolling output buffer
const rollingOutput = computed(() => {
  if (props.output.length <= MAX_OUTPUT_LINES) {
    return props.output
  }
  // Keep only the last MAX_OUTPUT_LINES
  return props.output.slice(-MAX_OUTPUT_LINES)
})

const scrollToBottom = () => {
  nextTick(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  })
}

watch(() => props.output.length, scrollToBottom)
</script>

<template>
  <div class="runtime-output">
    <el-tabs v-model="activeTab" class="output-tabs" type="border-card">
      <!-- Text Output Tab -->
      <el-tab-pane label="Output" name="output">
        <template #label>
          <el-icon><Document /></el-icon>
          <span>Output</span>
          <el-tag v-if="isRunning" type="success" size="small" effect="dark">
            <el-icon class="rotating"><Loading /></el-icon>
            Live
          </el-tag>
          <el-tag v-if="errors.length > 0" type="danger" size="small">
            {{ errors.length }} Error{{ errors.length > 1 ? 's' : '' }}
          </el-tag>
          <el-tag v-if="output.length > MAX_OUTPUT_LINES" type="info" size="small">
            Rolling Buffer
          </el-tag>
        </template>
        
        <div class="tab-content">
          <div 
            ref="outputRef"
            class="output-content"
          >
            <div v-if="rollingOutput.length === 0 && !isRunning && errors.length === 0" class="empty-output">
              <el-icon><Document /></el-icon>
              <p>No output yet. Run your BASIC program to see results here.</p>
            </div>
            <div v-else>
              <div v-if="rollingOutput.length > 0" class="output-lines">
                <div 
                  v-for="(line, index) in rollingOutput" 
                  :key="index" 
                  class="output-line"
                >
                  {{ line }}
                </div>
              </div>
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
      </el-tab-pane>

      <!-- Debug Output Tab -->
      <el-tab-pane label="Debug" name="debug" :disabled="!debugMode || !debugOutput">
        <template #label>
          <el-icon><Tools /></el-icon>
          <span>Debug</span>
          <el-tag v-if="debugMode" type="warning" size="small">
            Debug Mode
          </el-tag>
        </template>
        
        <div class="tab-content">
          <div class="debug-content">
            <pre class="debug-text">{{ debugOutput }}</pre>
          </div>
        </div>
      </el-tab-pane>

      <!-- Variables Tab -->
      <el-tab-pane label="Variables" name="variables" :disabled="Object.keys(variables).length === 0">
        <template #label>
          <el-icon><DataBoard /></el-icon>
          <span>Variables</span>
          <el-tag v-if="Object.keys(variables).length > 0" type="success" size="small">
            {{ Object.keys(variables).length }}
          </el-tag>
        </template>
        
        <div class="tab-content">
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
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.runtime-output {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  min-height: 0; /* Allow component to shrink */
  overflow: hidden; /* Prevent overflow */
}

.output-tabs {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.output-tabs :deep(.el-tabs__content) {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}

.output-tabs :deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.output-content {
  flex: 1 1 0;
  padding: 1rem;
  overflow-y: auto;
  background: #000;
  color: #00ff00;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.4;
  scroll-behavior: smooth;
  min-height: 0;
}

.debug-content {
  flex: 1 1 0;
  padding: 1rem;
  overflow-y: auto;
  background: #f8f9fa;
  min-height: 0;
}

.debug-text {
  margin: 0;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.variables-content {
  flex: 1 1 0;
  padding: 1rem;
  overflow-y: auto;
  background: #f8f9fa;
  min-height: 0;
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
  font-size: 14px;
}

.variable-name {
  font-weight: bold;
  color: #409eff;
}

.variable-value {
  color: #333;
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
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

.output-lines {
  margin: 0;
}

.output-line {
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #00ff00;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.4;
  min-height: 1.4em; /* Ensure consistent line height */
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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