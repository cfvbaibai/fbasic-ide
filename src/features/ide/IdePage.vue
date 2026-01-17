<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MonacoCodeEditor from './components/MonacoCodeEditor.vue'
import RuntimeOutput from './components/RuntimeOutput.vue'
import IdeControls from './components/IdeControls.vue'
import JoystickControl from './components/JoystickControl.vue'
import { GameLayout, GameButton, GameButtonGroup, GameBlock } from '../../shared/components/ui'
import { useBasicIde as useBasicIdeEnhanced } from './composables/useBasicIdeEnhanced'
import type { ParserInfo, HighlighterInfo } from '../../core/interfaces'

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
  <GameLayout
    title="Family Basic IDE"
    icon="mdi:monitor"
  >
    <template #sub>
      <div class="sample-programs">
        <GameButtonGroup>
          <GameButton 
            variant="toggle"
            :selected="currentSampleType === 'basic'"
            @click="loadSampleCode('basic')" 
            size="small"
          >
            Basic
          </GameButton>
          <GameButton 
            variant="toggle"
            :selected="currentSampleType === 'pause'"
            @click="loadSampleCode('pause')" 
            size="small"
          >
            Pause Demo
          </GameButton>
          <GameButton 
            variant="toggle"
            :selected="currentSampleType === 'gaming'"
            @click="loadSampleCode('gaming')" 
            size="small"
          >
            Joystick Test
          </GameButton>
          <GameButton 
            variant="toggle"
            :selected="currentSampleType === 'complex'"
            @click="loadSampleCode('complex')" 
            size="small"
          >
            Complex
          </GameButton>
          <GameButton 
            variant="toggle"
            :selected="currentSampleType === 'comprehensive'"
            @click="loadSampleCode('comprehensive')" 
            size="small"
          >
            Full Demo
          </GameButton>
        </GameButtonGroup>
      </div>
    </template>
    <template #action>
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
    </template>
    <div class="ide-container">

    <!-- Main IDE Content -->
    <div class="ide-content">
      <!-- Left Panel - Code Editor -->
      <GameBlock 
        title="Code Editor"
        title-icon="mdi:pencil"
        class="editor-panel"
      >
        <MonacoCodeEditor v-model="code" />
      </GameBlock>

      <!-- Right Panel - Runtime Output -->
      <div class="output-panel">
        <RuntimeOutput 
          :output="output" 
          :is-running="isRunning" 
          :errors="errors"
          :variables="variables"
          :debug-output="debugOutput"
          :debug-mode="debugMode"
          :screen-buffer="screenBuffer"
          :cursor-x="cursorX"
          :cursor-y="cursorY"
        />
      </div>
    </div>

    <!-- Joystick Control Panel -->
    <div class="joystick-control-wrapper">
      <JoystickControl 
        :send-stick-event="sendStickEvent"
        :send-strig-event="sendStrigEvent"
      />
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
  overflow-x: hidden; /* Prevent horizontal scrollbar */
}

.sample-programs {
  display: flex;
  align-items: center;
}

.parser-status {
  margin-left: 0.5rem;
}

.ide-content {
  flex: 1 1 0; /* Take remaining space */
  display: flex;
  min-height: 0; /* Allow flex items to shrink below content size */
  overflow: hidden; /* Prevent content overflow */
  gap: 1rem;
  padding: 1rem;
}

.editor-panel {
  flex: 1 1 0; /* Equal width with output panel */
  display: flex;
  flex-direction: column;
  min-width: 0; /* Allow panel to shrink */
  overflow: hidden; /* Prevent panel overflow */
}

.editor-panel :deep(.game-block-content) {
  flex: 1 1 0;
  overflow: hidden; /* Monaco handles its own scrolling */
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.output-panel {
  flex: 1 1 0; /* Equal width with editor panel */
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Allow panel to shrink */
  overflow: hidden; /* Prevent panel overflow */
  box-shadow: var(--game-shadow-base);
  position: relative;
}


.output-panel > * {
  flex: 1 1 0;
  overflow: auto;
  min-height: 0;
}

.joystick-control-wrapper {
  padding: 0 1rem;
}

/* Glowing animations */
@keyframes borderShimmer {
  0%, 100% {
    background-position: -200% center;
    opacity: 0.6;
  }
  50% {
    background-position: 200% center;
    opacity: 0.9;
  }
}

@keyframes borderRotate {
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
