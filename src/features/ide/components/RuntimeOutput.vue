<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { Tools, Document, Warning, Loading, DataBoard, Picture, Monitor } from '@element-plus/icons-vue'
import type { BasicVariable, ScreenCell } from '../../../core/interfaces'
import Screen from './Screen.vue'
import { GameTabs, GameTabPane, GameTag, GameIcon } from '../../../shared/components/ui'

interface Props {
  output: string[]
  isRunning: boolean
  errors?: Array<{ line: number; message: string; type: string }>
  variables?: Record<string, BasicVariable>
  debugOutput?: string
  debugMode?: boolean
  screenBuffer?: ScreenCell[][]
  cursorX?: number
  cursorY?: number
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => [],
  variables: () => ({}),
  debugOutput: '',
  debugMode: false,
  screenBuffer: () => {
    const grid: ScreenCell[][] = []
    for (let y = 0; y < 24; y++) {
      const row: ScreenCell[] = []
      for (let x = 0; x < 28; x++) {
        row.push({ character: ' ', colorPattern: 0, x, y })
      }
      grid.push(row)
    }
    return grid
  },
  cursorX: 0,
  cursorY: 0
})

const outputRef = ref<HTMLDivElement>()
const activeTab = ref('screen')

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
    <GameTabs v-model="activeTab" type="border-card" class="output-tabs">
      <!-- SCREEN Tab -->
      <GameTabPane name="screen">
        <template #label>
          <GameIcon :icon="Monitor" size="small" />
          <span>SCREEN</span>
          <GameTag v-if="isRunning" type="success" size="small" effect="dark">
            <GameIcon :icon="Loading" size="small" rotate />
            Live
          </GameTag>
        </template>
        
        <div class="tab-content">
          <Screen 
            :screen-buffer="screenBuffer"
            :cursor-x="cursorX"
            :cursor-y="cursorY"
          />
        </div>
      </GameTabPane>

      <!-- STDOUT Tab -->
      <GameTabPane name="stdout">
        <template #label>
          <GameIcon :icon="Document" size="small" />
          <span>STDOUT</span>
          <GameTag v-if="isRunning" type="success" size="small" effect="dark">
            <GameIcon :icon="Loading" size="small" rotate />
            Live
          </GameTag>
          <GameTag v-if="errors.length > 0" type="danger" size="small">
            {{ errors.length }} Error{{ errors.length > 1 ? 's' : '' }}
          </GameTag>
          <GameTag v-if="output.length > MAX_OUTPUT_LINES" type="info" size="small">
            Rolling Buffer
          </GameTag>
        </template>
        
        <div class="tab-content">
          <div 
            ref="outputRef"
            class="output-content"
          >
            <div v-if="rollingOutput.length === 0 && !isRunning && errors.length === 0" class="empty-output">
              <GameIcon :icon="Document" size="large" />
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
                  <GameIcon :icon="Warning" size="small" />
                  <span class="error-type">{{ error.type }}:</span>
                  <span class="error-message">{{ error.message }}</span>
                  <span v-if="error.line > 0" class="error-line-number">(Line {{ error.line }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameTabPane>

      <!-- Debug Output Tab -->
      <GameTabPane name="debug" :disabled="!debugMode || !debugOutput">
        <template #label>
          <GameIcon :icon="Tools" size="small" />
          <span>DEBUG</span>
          <GameTag v-if="debugMode" type="warning" size="small">
            Debug Mode
          </GameTag>
        </template>
        
        <div class="tab-content">
          <div class="debug-content">
            <pre class="debug-text">{{ debugOutput }}</pre>
          </div>
        </div>
      </GameTabPane>

      <!-- Variables Tab -->
      <GameTabPane name="variables" :disabled="Object.keys(variables).length === 0">
        <template #label>
          <GameIcon :icon="DataBoard" size="small" />
          <span>VARIABLES</span>
          <GameTag v-if="Object.keys(variables).length > 0" type="success" size="small">
            {{ Object.keys(variables).length }}
          </GameTag>
        </template>
        
        <div class="tab-content">
          <div class="variables-content">
            <div class="variable-list">
              <div 
                v-for="(variable, name) in variables" 
                :key="name" 
                class="variable-item"
              >
                <span class="variable-name">{{ name }}</span>
                <span class="variable-value">{{ variable.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </GameTabPane>
    </GameTabs>
  </div>
</template>

<style scoped>
.runtime-output {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  background: transparent;
  min-height: 0; /* Allow component to shrink */
  overflow: hidden; /* Prevent overflow */
  position: relative;
}

.output-tabs {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  z-index: 1;
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
  position: relative;
  box-shadow: 
    inset 0 0 30px rgba(0, 255, 0, 0.1),
    inset 0 0 60px rgba(0, 255, 0, 0.05);
  animation: terminalGlow 3s ease-in-out infinite;
}

.output-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(180deg, rgba(0, 255, 0, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at top, rgba(0, 255, 0, 0.1) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
  animation: terminalShimmer 5s ease-in-out infinite;
}

@keyframes terminalGlow {
  0%, 100% {
    box-shadow: 
      inset 0 0 30px rgba(0, 255, 0, 0.1),
      inset 0 0 60px rgba(0, 255, 0, 0.05);
  }
  50% {
    box-shadow: 
      inset 0 0 40px rgba(0, 255, 0, 0.15),
      inset 0 0 80px rgba(0, 255, 0, 0.08),
      0 0 20px rgba(0, 255, 0, 0.1);
  }
}

@keyframes terminalShimmer {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.debug-content {
  flex: 1 1 0;
  padding: 1rem;
  overflow-y: auto;
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  min-height: 0;
  border: 1px solid var(--game-card-border);
  border-radius: 6px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
}

.debug-text {
  margin: 0;
  font-family: var(--game-font-family-mono);
  font-size: 12px;
  line-height: 1.4;
  color: var(--game-text-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
}


.empty-output {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--app-text-color-secondary);
  text-align: center;
}

.empty-output :deep(.game-icon) {
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
  position: relative;
  z-index: 1;
  text-shadow: 
    0 0 4px rgba(0, 255, 0, 0.8),
    0 0 8px rgba(0, 255, 0, 0.4);
  transition: text-shadow 0.3s ease;
}

.output-line:hover {
  text-shadow: 
    0 0 6px rgba(0, 255, 0, 1),
    0 0 12px rgba(0, 255, 0, 0.6),
    0 0 20px rgba(0, 255, 0, 0.3);
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
  border-top: 1px solid var(--el-color-danger);
}

.error-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--el-color-danger);
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
  color: var(--el-color-danger);
  opacity: 0.8;
  font-size: 0.8rem;
  font-style: italic;
}

.graphics-content {
  flex: 1;
  padding: 1rem;
  background: var(--app-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.graphics-placeholder {
  text-align: center;
  color: var(--app-text-color-secondary);
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
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
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
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 1px solid var(--game-card-border);
  border-radius: 6px;
  font-family: var(--game-font-family-mono);
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.variable-item:hover {
  border-color: var(--game-accent-color);
  box-shadow: 0 0 8px var(--game-accent-glow);
}

.variable-name {
  font-weight: bold;
  color: var(--game-accent-color);
  text-shadow: 0 0 4px var(--game-accent-glow);
}

.variable-value {
  color: var(--game-text-primary);
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 1px solid var(--game-card-border);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-weight: 500;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
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