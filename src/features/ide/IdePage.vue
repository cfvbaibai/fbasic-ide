<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, useTemplateRef } from 'vue'

import type { HighlighterInfo, ParserInfo } from '@/core/interfaces'
import { GameLayout } from '@/shared/components/ui'
import { useContainerWidth } from '@/shared/composables/useContainerWidth'

import IdeBottomArea from './components/IdeBottomArea.vue'
import IdeEditorPanel from './components/IdeEditorPanel.vue'
import IdeOutputPanel from './components/IdeOutputPanel.vue'
import InputModal from './components/InputModal.vue'
import SampleSelector from './components/SampleSelector.vue'
import { useBasicIde as useBasicIdeEnhanced } from './composables/useBasicIdeEnhanced'
import { provideScreenContext } from './composables/useScreenContext'

/**
 * IdePage component - The main IDE page for F-BASIC code editing and execution.
 * Provides code editor, runtime output, controls, and joystick interface.
 */
defineOptions({
  name: 'IdePage',
})

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

// UI state
const sampleSelectorOpen = shallowRef(false)
const editorView = shallowRef<'code' | 'bg'>('code')
const logLevelPanelOpen = shallowRef(false)

// Responsive toolbar - observe editor panel which expands with screen
const editorPanelRef = useTemplateRef<HTMLDivElement>('editorPanelRef')
const isToolbarCompact = useContainerWidth(editorPanelRef, 900)

// StateInspector ref for animation loop to call updateMoveSlotsData
const bottomAreaRef = useTemplateRef<{ updateMoveSlotsData: () => void }>('bottomAreaRef')

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
  updateInspectorMoveSlots: () => bottomAreaRef.value?.updateMoveSlotsData(),
})

// Input modal response handler
function handleInputResponse(
  requestId: string,
  values: (string | number)[],
  cancelled: boolean,
) {
  respondToInputRequest(requestId, values.map(String), cancelled)
}

// Handle sample selection with view switching
function handleLoadSample(sampleType: string) {
  const hasBg = loadSampleCode(sampleType)
  sampleSelectorOpen.value = false
  // Switch to code view if sample has no BG data and currently viewing bg-editor
  if (!hasBg && editorView.value === 'bg') {
    editorView.value = 'code'
  }
}

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
        <div ref="editorPanelRef" class="editor-panel-outer">
          <IdeEditorPanel
            :code="code"
            :editor-view="editorView"
            :is-toolbar-compact="isToolbarCompact"
            :is-running="isRunning"
            :can-run="canRun"
            :can-stop="canStop"
            :debug-mode="debugMode"
            @update:code="code = $event"
            @update:editor-view="editorView = $event"
            @run="runCode"
            @stop="stopCode"
            @clear="clearOutput"
            @toggle-debug="toggleDebugMode"
            @debug-buffer="debugBuffer"
            @open-sample-selector="sampleSelectorOpen = true"
          />
        </div>

        <!-- Right Panel - Runtime Output -->
        <IdeOutputPanel
          v-model:log-level-panel-open="logLevelPanelOpen"
          :output="output"
          :is-running="isRunning"
          :errors="errors"
          :variables="variables"
          :debug-output="debugOutput"
          :debug-mode="debugMode"
        />
      </div>

      <!-- Bottom area: Joystick (left) + State Inspector (right) -->
      <IdeBottomArea
        ref="bottomAreaRef"
        :send-strig-event="sendStrigEvent"
        :shared-joystick-buffer="sharedJoystickBuffer"
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

      <!-- INPUT/LINPUT modal overlay -->
      <Teleport to="body">
        <InputModal
          :pending-request="pendingInputRequest"
          @respond="handleInputResponse"
        />

        <!-- Sample Selector -->
        <SampleSelector
          v-if="sampleSelectorOpen"
          @select="handleLoadSample"
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

.ide-content {
  grid-row: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  gap: 1rem;
  padding: 0 1rem 1rem;
}

.editor-panel-outer {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
