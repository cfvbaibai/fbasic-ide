<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import type { HighlighterInfo, ParserInfo } from '@/core/interfaces'
import BgEditorPanel from '@/features/bg-editor/components/BgEditorPanel.vue'
import {
  GameBlock,
  GameButton,
  GameIconButton,
  GameLayout,
} from '@/shared/components/ui'
import { useContainerWidth } from '@/shared/composables/useContainerWidth'

import IdeControls from './components/IdeControls.vue'
import InputModal from './components/InputModal.vue'
import JoystickControl from './components/JoystickControl.vue'
import LogLevelPanel from './components/LogLevelPanel.vue'
import MonacoCodeEditor from './components/MonacoCodeEditor.vue'
import ProgramToolbar from './components/ProgramToolbar.vue'
import RuntimeOutput from './components/RuntimeOutput.vue'
import SampleSelector from './components/SampleSelector.vue'
import StateInspector from './components/StateInspector.vue'
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
  // movementStates removed - read from shared buffer instead
  movementPositionsFromBuffer,
  frontSpriteNodes,
  backSpriteNodes,
  runCode,
  stopCode,
  clearOutput,
  loadSampleCode,
  getParserCapabilities,
  getHighlighterCapabilities,
  toggleDebugMode,
  debugBuffer,
  sendStrigEvent,
  sharedDisplayBufferAccessor,
  sharedAnimationBuffer,
  sharedDisplayViews,
  sharedJoystickBuffer,
  setDecodedScreenState,
  registerScheduleRender,
  pendingInputRequest,
  respondToInputRequest,
} = useBasicIdeEnhanced()

// Sample selector state
const sampleSelectorOpen = ref(false)

// Editor view state: 'code' | 'bg'
const editorView = ref<'code' | 'bg'>('code')

// Responsive toolbar - observe editor panel which expands with screen
const editorPanelRef = useTemplateRef<HTMLDivElement>('editorPanelRef')
const isToolbarCompact = useContainerWidth(editorPanelRef, 900)

// StateInspector ref for animation loop to call updateMoveSlotsData
const stateInspectorRef = useTemplateRef<{ updateMoveSlotsData: () => void }>('stateInspectorRef')

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
  // movementStates removed - read from shared buffer instead
  movementPositionsFromBuffer,
  externalFrontSpriteNodes: frontSpriteNodes,
  externalBackSpriteNodes: backSpriteNodes,
  sharedDisplayViews: ref(sharedDisplayViews),
  sharedDisplayBufferAccessor,
  sharedAnimationBuffer: ref(sharedAnimationBuffer),
  sharedJoystickBuffer: ref(sharedJoystickBuffer),
  setDecodedScreenState,
  registerScheduleRender,
  // Callback for animation loop to update inspector MOVE tab data
  updateInspectorMoveSlots: () => stateInspectorRef.value?.updateMoveSlotsData(),
})

// Input modal response handler
function handleInputResponse(
  requestId: string,
  values: (string | number)[],
  cancelled: boolean,
) {
  respondToInputRequest(requestId, values.map(String), cancelled)
}

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
        <div ref="editorPanelRef" class="editor-panel-wrapper">
          <GameBlock :title="t('ide.codeEditor.title')" title-icon="mdi:pencil" class="editor-panel">
          <template #right>
            <div class="editor-header-controls">
              <ProgramToolbar :is-compact="isToolbarCompact" />
              <div class="editor-view-toggle">
                <template v-if="isToolbarCompact">
                  <GameIconButton
                    variant="toggle"
                    type="default"
                    icon="mdi:code-tags"
                    size="small"
                    title="Code"
                    :selected="editorView === 'code'"
                    @click="editorView = 'code'"
                  />
                  <GameIconButton
                    variant="toggle"
                    type="default"
                    icon="mdi:view-grid"
                    size="small"
                    title="BG"
                    :selected="editorView === 'bg'"
                    @click="editorView = 'bg'"
                  />
                </template>
                <template v-else>
                  <GameButton
                    variant="toggle"
                    type="default"
                    icon="mdi:code-tags"
                    size="small"
                    :selected="editorView === 'code'"
                    @click="editorView = 'code'"
                  >
                    Code
                  </GameButton>
                  <GameButton
                    variant="toggle"
                    type="default"
                    icon="mdi:view-grid"
                    size="small"
                    :selected="editorView === 'bg'"
                    @click="editorView = 'bg'"
                  >
                    BG
                  </GameButton>
                </template>
              </div>
              <template v-if="isToolbarCompact">
                <GameIconButton
                  type="default"
                  icon="mdi:folder-open"
                  size="small"
                  :title="t('ide.samples.load', 'Load Sample')"
                  @click="sampleSelectorOpen = true"
                />
              </template>
              <template v-else>
                <GameButton
                  type="default"
                  icon="mdi:folder-open"
                  size="small"
                  @click="sampleSelectorOpen = true"
                >
                  {{ t('ide.samples.load') }}
                </GameButton>
              </template>
              <IdeControls
                :is-running="isRunning"
                :can-run="canRun"
                :can-stop="canStop"
                :debug-mode="debugMode"
                @run="runCode"
                @stop="stopCode"
                @clear="clearOutput"
                @toggle-debug="toggleDebugMode"
                @debug-buffer="debugBuffer"
              />
            </div>
          </template>
          <!-- Code Editor View -->
          <MonacoCodeEditor v-show="editorView === 'code'" v-model="code" />
          <!-- BG Editor View -->
          <BgEditorPanel v-show="editorView === 'bg'" />
        </GameBlock>
        </div>

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

      <!-- Bottom area: Joystick (left) + State Inspector (right) -->
      <div class="bottom-area">
        <div class="bottom-left">
          <JoystickControl
            :send-strig-event="sendStrigEvent"
            :shared-joystick-buffer="sharedJoystickBuffer"
          />
        </div>
        <div class="bottom-right">
          <StateInspector
            ref="stateInspectorRef"
            :screen-buffer="screenBuffer"
            :cursor-x="cursorX"
            :cursor-y="cursorY"
            :bg-palette="bgPalette"
            :sprite-palette="spritePalette"
            :backdrop-color="backdropColor"
            :cgen-mode="cgenMode"
            :sprite-states="spriteStates"
            :sprite-enabled="spriteEnabled"
            :movement-positions-from-buffer="movementPositionsFromBuffer"
            :shared-display-buffer-accessor="sharedDisplayBufferAccessor"
          />
        </div>
      </div>

      <!-- INPUT/LINPUT modal overlay -->
      <Teleport to="body">
        <InputModal
          :pending-request="pendingInputRequest"
          @respond="handleInputResponse"
        />

        <!-- Sample Selector -->
        <SampleSelector
          v-if="sampleSelectorOpen"
          @select="loadSampleCode($event); sampleSelectorOpen = false"
          @close="sampleSelectorOpen = false"
        />
      </Teleport>
    </div>
  </GameLayout>
</template>

<style scoped>
.ide-container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-columns: 1fr;
  overflow-x: hidden;
}

.editor-header-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.editor-view-toggle {
  display: flex;
  gap: 0.125rem;
  margin-right: 0.5rem;
}

/* Override GameButton min-width for toggle buttons in toolbar */
.editor-view-toggle :deep(.game-button) {
  min-width: auto;
  padding: 0.375rem 0.625rem;
  font-size: 0.8rem;
}

/* Match Sample button size with toolbar buttons */
.editor-header-controls > :deep(.game-button) {
  min-width: auto;
  padding: 0.375rem 0.625rem;
  font-size: 0.8rem;
}

.parser-status {
  margin-left: 0.5rem;
}

.ide-content {
  grid-row: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  gap: 1rem;
  padding: 0 1rem 1rem;
}

.editor-panel-wrapper {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.bottom-area {
  grid-row: 2;
  display: flex;
  align-items: stretch;
  gap: 1rem;
  padding: 0 1rem;
  min-height: 0;
}

.bottom-left {
  flex: 0 1 auto;
  min-width: 0;
}

.bottom-right {
  flex: 1 1 0;
  min-width: 500px;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
