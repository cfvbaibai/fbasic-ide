<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import MonacoCodeEditor from './components/MonacoCodeEditor.vue'
import RuntimeOutput from './components/RuntimeOutput.vue'
import IdeControls from './components/IdeControls.vue'
import JoystickControl from './components/JoystickControl.vue'
import { GameLayout, GameButton, GameButtonGroup, GameBlock } from '../../shared/components/ui'
import { useBasicIde as useBasicIdeEnhanced } from './composables/useBasicIdeEnhanced'
import type { ParserInfo, HighlighterInfo } from '../../core/interfaces'

/**
 * IdePage component - The main IDE page for F-BASIC code editing and execution.
 * Provides code editor, runtime output, controls, and joystick interface.
 */
defineOptions({
  name: 'IdePage'
})

const { t } = useI18n()

// Use the enhanced AST-based parser system
const {
  code,
  isRunning,
  output,
  errors,
  variables,
  debugOutput,
  debugMode,
  screenBuffer,
  cursorX,
  cursorY,
  bgPalette,
  runCode,
  stopCode,
  clearOutput,
  currentSampleType,
  loadSampleCode,
  getParserCapabilities,
  getHighlighterCapabilities,
  toggleDebugMode,
  sendStickEvent,
  sendStrigEvent,
} = useBasicIdeEnhanced()

// Computed properties for backward compatibility
const canRun = computed(() => !isRunning.value)
const canStop = isRunning

// Parser capabilities for display
const parserInfo = ref<ParserInfo | null>(null)
const highlighterInfo = ref<HighlighterInfo | null>(null)

// Initialize parser info
onMounted(() => {
  parserInfo.value = getParserCapabilities()
  highlighterInfo.value = getHighlighterCapabilities()
})
</script>

<template>
  <GameLayout>
    <div class="ide-container">

      <!-- Main IDE Content -->
      <div class="ide-content">
        <!-- Left Panel - Code Editor -->
        <GameBlock :title="t('ide.codeEditor.title')" title-icon="mdi:pencil" class="editor-panel">
          <template #right>
            <div class="editor-header-controls">
              <div class="sample-programs">
                <GameButtonGroup>
                  <GameButton variant="toggle" :selected="currentSampleType === 'basic'" @click="loadSampleCode('basic')"
                    size="small">
                    {{ t('ide.samples.basic') }}
                  </GameButton>
                  <GameButton variant="toggle" :selected="currentSampleType === 'pause'" @click="loadSampleCode('pause')"
                    size="small">
                    {{ t('ide.samples.pause') }}
                  </GameButton>
                  <GameButton variant="toggle" :selected="currentSampleType === 'gaming'" @click="loadSampleCode('gaming')"
                    size="small">
                    {{ t('ide.samples.gaming') }}
                  </GameButton>
                  <GameButton variant="toggle" :selected="currentSampleType === 'complex'" @click="loadSampleCode('complex')"
                    size="small">
                    {{ t('ide.samples.complex') }}
                  </GameButton>
                  <GameButton variant="toggle" :selected="currentSampleType === 'comprehensive'"
                    @click="loadSampleCode('comprehensive')" size="small">
                    {{ t('ide.samples.comprehensive') }}
                  </GameButton>
                  <GameButton variant="toggle" :selected="currentSampleType === 'allChars'"
                    @click="loadSampleCode('allChars')" size="small">
                    {{ t('ide.samples.allChars') }}
                  </GameButton>
                </GameButtonGroup>
              </div>
              <IdeControls 
                :is-running="isRunning" 
                :can-run="canRun" 
                :can-stop="canStop" 
                :debug-mode="debugMode" 
                @run="runCode"
                @stop="stopCode" 
                @clear="clearOutput" 
                @toggle-debug="toggleDebugMode" 
              />
            </div>
          </template>
          <MonacoCodeEditor v-model="code" />
        </GameBlock>

        <!-- Right Panel - Runtime Output -->
        <div class="output-panel">
          <RuntimeOutput :output="output" :is-running="isRunning" :errors="errors" :variables="variables"
            :debug-output="debugOutput" :debug-mode="debugMode" :screen-buffer="screenBuffer" :cursor-x="cursorX"
            :cursor-y="cursorY" :bg-palette="bgPalette" />
        </div>
      </div>

      <!-- Joystick Control Panel -->
      <div class="joystick-control-wrapper">
        <JoystickControl :send-stick-event="sendStickEvent" :send-strig-event="sendStrigEvent" />
      </div>
    </div>
  </GameLayout>
</template>

<style scoped>
.ide-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.editor-header-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sample-programs {
  display: flex;
  align-items: center;
}

/* Make sample program buttons more compact */
.sample-programs :deep(.game-button-group) {
  padding: 1px;
}

.sample-programs :deep(.game-button) {
  padding: 0.25rem 0.375rem;
  font-size: 0.75rem;
  line-height: 1.2;
}

.parser-status {
  margin-left: 0.5rem;
}

.ide-content {
  flex: 1 1 0;
  display: flex;
  min-height: 0;
  overflow: hidden;
  gap: 1rem;
  padding: 0 1rem 1rem;
}

.editor-panel {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.editor-panel :deep(.game-block-header) {
  padding-bottom: 0.5rem;
  min-height: auto;
}

.editor-panel :deep(.game-block-title) {
  font-size: 0.95rem;
}

.editor-panel :deep(.game-block-content) {
  flex: 1 1 0;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.output-panel {
  flex: 1 1 0;
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  box-shadow: var(--game-shadow-base);
  position: relative;
}


.output-panel>* {
  flex: 1 1 0;
  overflow: auto;
  min-height: 0;
}

.joystick-control-wrapper {
  padding: 0 1rem;
}

/* Glowing animations */
@keyframes border-shimmer {
  0%,
  100% {
    background-position: -200% center;
    opacity: 0.6;
  }

  50% {
    background-position: 200% center;
    opacity: 0.9;
  }
}

@keyframes border-rotate {
  0% {
    transform: rotate(0deg);
    opacity: 0;
  }

  25% {
    opacity: 0.2;
  }

  50% {
    transform: rotate(180deg);
    opacity: 0.3;
  }

  75% {
    opacity: 0.2;
  }

  100% {
    transform: rotate(360deg);
    opacity: 0;
  }
}
</style>
