<script setup lang="ts">
import { ref, watch, nextTick, computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BasicVariable, ScreenCell } from '../../../core/interfaces'
import type { SpriteState } from '../../../core/sprite/types'
import Screen from './Screen.vue'
import VariablesTab from './VariablesTab.vue'
import { GameTabs, GameTabPane, GameIcon, GameButtonGroup, GameButton } from '../../../shared/components/ui'
import { provideScreenZoom } from '../composables/useScreenZoom'

/**
 * RuntimeOutput component - Displays runtime output, errors, variables, debug info, and screen buffer.
 */
defineOptions({
  name: 'RuntimeOutput'
})

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
  cursorY: 0,
  bgPalette: 1,
  backdropColor: 0,
  spriteStates: () => [],
  spriteEnabled: false
})

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
  bgPalette?: number
  backdropColor?: number
  spriteStates?: SpriteState[]
  spriteEnabled?: boolean
}

const outputRef = useTemplateRef<HTMLDivElement>('outputRef')
const activeTab = ref('screen')

// Provide zoom state for child components (Screen) and use it for controls
const { zoomLevel, setZoom } = provideScreenZoom()

// Zoom level options
const zoomLevels: Array<{ value: 1 | 2 | 3 | 4; label: string }> = [
  { value: 1, label: '×1' },
  { value: 2, label: '×2' },
  { value: 3, label: '×3' },
  { value: 4, label: '×4' }
]

// Computed property for template binding (Vue templates auto-unwrap refs, but this helps TypeScript)
const currentZoomLevel = computed(() => zoomLevel.value)

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
        
        <template #tab-content-header>
          <div class="screen-controls">
            <GameButtonGroup>
              <GameButton
                v-for="level in zoomLevels"
                :key="level.value"
                variant="toggle"
                size="small"
                :selected="currentZoomLevel === level.value"
                @click="setZoom(level.value)"
              >
                {{ level.label }}
              </GameButton>
            </GameButtonGroup>
          </div>
        </template>
        
        <div class="tab-content">
          <Screen 
            :screen-buffer="screenBuffer"
            :cursor-x="cursorX"
            :cursor-y="cursorY"
            :bg-palette="bgPalette"
            :backdrop-color="backdropColor"
            :sprite-states="spriteStates"
            :sprite-enabled="spriteEnabled"
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
                  <span v-if="error.line > 0" class="error-line-number">({{ t('ide.output.errorLine', { line: error.line }) }})</span>
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
      <VariablesTab :variables="variables" />
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

.screen-controls {
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>