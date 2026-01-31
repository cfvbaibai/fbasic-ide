<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { HighlighterInfo, ParserInfo } from '@/core/interfaces'
import {
  GameBlock,
  GameButton,
  GameIconButton,
  GameInput,
  GameLayout,
  GameSelect,
} from '@/shared/components/ui'

import IdeControls from './components/IdeControls.vue'
import JoystickControl from './components/JoystickControl.vue'
import LogLevelPanel from './components/LogLevelPanel.vue'
import MonacoCodeEditor from './components/MonacoCodeEditor.vue'
import RuntimeOutput from './components/RuntimeOutput.vue'
import { useBasicIde as useBasicIdeEnhanced } from './composables/useBasicIdeEnhanced'
import { provideScreenContext } from './composables/useScreenContext'

/**
 * IdePage component - The main IDE page for F-BASIC code editing and execution.
 * Provides code editor, runtime output, controls, and joystick interface.
 */
defineOptions({
  name: 'IdePage',
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
  backdropColor,
  spritePalette,
  cgenMode,
  spriteStates,
  spriteEnabled,
  movementStates,
  frontSpriteNodes,
  backSpriteNodes,
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
  sharedAnimationView,
  sharedDisplayViews,
  setDecodedScreenState,
  registerScheduleRender,
  pendingInputRequest,
  respondToInputRequest,
  sampleSelectOptions,
} = useBasicIdeEnhanced()

// Provide screen context so ScreenTab/Screen can inject instead of prop drilling
provideScreenContext({
  screenBuffer,
  cursorX,
  cursorY,
  bgPalette,
  backdropColor,
  spritePalette,
  cgenMode,
  spriteStates,
  spriteEnabled,
  movementStates,
  externalFrontSpriteNodes: frontSpriteNodes,
  externalBackSpriteNodes: backSpriteNodes,
  sharedAnimationView: ref(sharedAnimationView),
  sharedDisplayViews: ref(sharedDisplayViews),
  setDecodedScreenState,
  registerScheduleRender,
})

// INPUT/LINPUT modal: local input value and submit/cancel
const inputModalValue = ref<string | number>('')
const inputModalSubmit = () => {
  const req = pendingInputRequest.value
  if (!req) return
  const raw = String(inputModalValue.value)
  const values = req.isLinput ? [raw] : raw.split(',').map(s => s.trim())
  respondToInputRequest(req.requestId, values, false)
  inputModalValue.value = ''
}
const inputModalCancel = () => {
  const req = pendingInputRequest.value
  if (!req) return
  respondToInputRequest(req.requestId, [], true)
  inputModalValue.value = ''
}
watch(pendingInputRequest, req => {
  inputModalValue.value = req ? '' : ''
})

// Computed properties for backward compatibility
const canRun = computed(() => !isRunning.value)
const canStop = isRunning

// Parser capabilities for display
const parserInfo = ref<ParserInfo | null>(null)
const highlighterInfo = ref<HighlighterInfo | null>(null)

// Log level panel visibility (floating toggle)
const logLevelPanelOpen = ref(false)

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
              <div class="sample-select-wrap">
                <GameSelect
                  :model-value="currentSampleType ?? ''"
                  :options="sampleSelectOptions"
                  :placeholder="t('ide.samples.placeholder')"
                  size="small"
                  class="sample-select"
                  @update:model-value="loadSampleCode($event as string)"
                />
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
          <div class="log-level-toggle">
            <GameIconButton
              :icon="logLevelPanelOpen ? 'mdi:close' : 'mdi:format-list-bulleted-type'"
              :title="logLevelPanelOpen ? 'Close log levels' : 'Open log levels'"
              size="small"
              @click="logLevelPanelOpen = !logLevelPanelOpen"
            />
          </div>
          <Transition name="log-panel">
            <div v-show="logLevelPanelOpen" class="log-level-panel-wrapper">
              <LogLevelPanel :open="logLevelPanelOpen" />
            </div>
          </Transition>
          <RuntimeOutput
            :output="output"
            :is-running="isRunning"
            :errors="errors"
            :variables="variables"
            :debug-output="debugOutput"
            :debug-mode="debugMode"
          />
        </div>
      </div>

      <!-- Joystick Control Panel -->
      <div class="joystick-control-wrapper">
        <JoystickControl :send-stick-event="sendStickEvent" :send-strig-event="sendStrigEvent" />
      </div>

      <!-- INPUT/LINPUT modal overlay -->
      <Teleport to="body">
        <div
          v-if="pendingInputRequest"
          class="input-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="input-modal-prompt"
        >
          <div class="input-modal">
            <p id="input-modal-prompt" class="input-modal-prompt">{{ pendingInputRequest.prompt }}</p>
            <form class="input-modal-form" @submit.prevent="inputModalSubmit">
              <GameInput
                v-model="inputModalValue"
                type="text"
                :placeholder="
                pendingInputRequest.isLinput
                  ? 'Enter text (up to 31 chars)'
                  : 'Separate multiple values with commas'
              "
                class="input-modal-field"
              />
              <div class="input-modal-actions">
                <GameButton type="primary" size="medium" @click="inputModalSubmit">
                  {{ t('ide.input.submit') }}
                </GameButton>
                <GameButton type="default" size="medium" @click="inputModalCancel">
                  {{ t('ide.input.cancel') }}
                </GameButton>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
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

.sample-select-wrap {
  flex-shrink: 0;
  min-width: 0;
}

.sample-select {
  width: 11rem;
  max-width: 100%;
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

.log-level-toggle {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
}

.log-level-panel-wrapper {
  position: absolute;
  top: 2.5rem;
  right: 0.5rem;
  z-index: 9;
  max-height: calc(100% - 3rem);
  overflow-y: auto;
}

.log-panel-enter-active,
.log-panel-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.log-panel-enter-from,
.log-panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.output-panel > * {
  flex: 1 1 0;
  overflow: auto;
  min-height: 0;
}

.joystick-control-wrapper {
  padding: 0 1rem;
}

/* INPUT/LINPUT modal overlay */
.input-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--base-alpha-gray-00-60);
}

.input-modal {
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: var(--game-shadow-base);
}

.input-modal-prompt {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: var(--game-text-primary);
}

.input-modal-field {
  width: 100%;
  margin-bottom: 1rem;
}

.input-modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
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
