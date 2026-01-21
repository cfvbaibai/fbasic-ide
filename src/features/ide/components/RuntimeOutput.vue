<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BasicVariable, ScreenCell } from '../../../core/interfaces'
import Screen from './Screen.vue'
import { GameTabs, GameTabPane, GameTag, GameIcon } from '../../../shared/components/ui'

const { t } = useI18n()

interface Props {
  output: string[]
  isRunning: boolean
  errors?: { line: number; message: string; type: string }[]
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
          <GameIcon icon="mdi:monitor" size="small" />
          <span>{{ t('ide.output.screen') }}</span>
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
          <GameIcon icon="mdi:file-document" size="small" />
          <span>{{ t('ide.output.stdout') }}</span>
        </template>
        
        <div class="tab-content">
          <div 
            ref="outputRef"
            class="output-content"
          >
            <div v-if="rollingOutput.length === 0 && !isRunning && errors.length === 0" class="empty-output">
              <GameIcon icon="mdi:file-document" size="large" />
              <p>{{ t('ide.output.empty') }}</p>
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
                  <GameIcon icon="mdi:alert" size="small" />
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
          <GameIcon icon="mdi:tools" size="small" />
          <span>{{ t('ide.output.debug') }}</span>
        </template>
        
        <div class="tab-content">
          <div class="debug-content border-game-surface">
            <pre class="debug-text">{{ debugOutput }}</pre>
          </div>
        </div>
      </GameTabPane>

      <!-- Variables Tab -->
      <GameTabPane name="variables" :disabled="Object.keys(variables).length === 0">
        <template #label>
          <GameIcon icon="mdi:view-dashboard" size="small" />
          <span>{{ t('ide.output.variables') }}</span>
          <span class="tab-status-tag">
            <GameTag :class="{ 'tag-hidden': Object.keys(variables).length === 0 }" type="success" size="small">
              {{ Object.keys(variables).length }}
            </GameTag>
          </span>
        </template>
        
        <div class="tab-content">
          <div class="variables-content bg-game-surface">
            <div class="variable-list">
              <div 
                v-for="(variable, name) in variables" 
                :key="name" 
                class="variable-item"
              >
                <span class="variable-name">{{ name }}</span>
                <span class="variable-value bg-game-surface border-game-surface text-game-primary">{{ variable.value }}</span>
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

.tab-status-tag {
  display: inline-flex;
  align-items: center;
  margin-left: 0.25rem;
  vertical-align: middle;
  min-height: 1.5rem; /* Reserve vertical space */

  /* Reserve horizontal space - adjust based on typical tag width */
  min-width: 3rem;
  justify-content: flex-start;
}

.tab-status-tag :deep(.game-tag) {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.tab-status-tag :deep(.game-tag.tag-hidden) {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;

  /* Keep dimensions to prevent layout shift */
}

.output-content {
  flex: 1 1 0;
  padding: 1rem;
  overflow-y: auto;
  background: var(--game-screen-bg-color);
  color: var(--game-screen-text-color);
  font-family: var(--game-font-family-mono);
  font-size: var(--game-font-size-mono);
  line-height: var(--game-line-height-mono);
  scroll-behavior: smooth;
  min-height: 0;
  position: relative;
}


.debug-content {
  flex: 1 1 0;
  padding: 1rem;
  overflow-y: auto;
  background: var(--game-surface-bg-gradient);
  min-height: 0;
  border-radius: 6px;
  box-shadow: inset 0 2px 4px var(--base-alpha-gray-00-50);
}

.debug-text {
  margin: 0;
  font-family: var(--game-font-family-mono);
  font-size: var(--game-font-size-mono);
  line-height: var(--game-line-height-mono);
  color: var(--game-text-primary);
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.empty-output {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--game-screen-text-color);
  text-align: center;
}

.empty-output :deep(.game-icon) {
  font-size: var(--game-font-size-lg);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.output-lines {
  margin: 0;
}

.output-line:hover {
  background: var(--game-surface-bg-gradient);
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
  border-top: 1px solid var(--semantic-solid-danger);
}

.error-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--semantic-solid-danger);
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
  color: var(--semantic-solid-danger);
  opacity: 0.8;
  font-size: 0.8rem;
  font-style: italic;
}

.graphics-content {
  flex: 1;
  padding: 1rem;
  background: var(--game-surface-bg-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
}

.graphics-placeholder {
  text-align: center;
  color: var(--game-text-secondary);
}

.graphics-placeholder .game-icon {
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
  border-radius: 6px;
  font-family: var(--game-font-family-mono);
  font-size: 0.9rem;
  box-shadow: 0 2px 4px var(--base-alpha-gray-00-20);
  transition: all 0.2s ease;
}

.variable-item:hover {
  border-color: var(--base-solid-primary);
  box-shadow: 0 0 8px var(--game-accent-glow);
}

.variable-name {
  font-weight: bold;
}

.variable-value {
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-weight: 500;
  box-shadow: inset 0 1px 2px var(--base-alpha-gray-00-30);
}
</style>