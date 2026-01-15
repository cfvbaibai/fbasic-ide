<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Monitor, Edit, View } from '@element-plus/icons-vue'
import MonacoCodeEditor from './components/MonacoCodeEditor.vue'
import RuntimeOutput from './components/RuntimeOutput.vue'
import IdeControls from './components/IdeControls.vue'
import JoystickControl from './components/JoystickControl.vue'
import GameNavigation from '../../shared/components/GameNavigation.vue'
import { GameIcon, GameTag, GameButton, GameButtonGroup } from '../../shared/components/ui'
import { useBasicIde as useBasicIdeEnhanced } from './composables/useBasicIdeEnhanced'
import type { ParserInfo, HighlighterInfo } from '../../core/interfaces'

// Use the enhanced AST-based parser system
const {
  code,
  isRunning,
  output,
  errors,
  variables,
  highlightedCode,
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
const executionTime = ref(0) // Placeholder for future implementation

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
  <div class="ide-container">
    <GameNavigation />
    <!-- IDE Header -->
    <div class="ide-header">
      <div class="header-left">
        <h1 class="ide-title">
          <GameIcon :icon="Monitor" />
          Family Basic IDE
          <GameTag type="success" size="small" class="parser-status">
            AST Parser
          </GameTag>
        </h1>
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

    <!-- Main IDE Content -->
    <div class="ide-content">
      <!-- Left Panel - Code Editor -->
      <div class="editor-panel">
        <div class="panel-header">
          <GameIcon :icon="Edit" size="small" />
          <span>Code Editor</span>
        </div>
        <MonacoCodeEditor v-model="code" />
      </div>

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
</template>

<style scoped>
.ide-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--game-bg-gradient-start) 0%, var(--game-bg-gradient-mid) 50%, var(--game-bg-gradient-end) 100%);
  overflow: hidden; /* Prevent outer scrollbar */
}

.ide-header {
  flex: 0 0 auto; /* Fixed height header */
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-bottom: 2px solid var(--game-card-border);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--game-shadow-base);
  min-height: 80px; /* Ensure minimum header height */
  position: relative;
}

.ide-header::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-glow) 50%, 
    transparent 100%
  );
  opacity: 0.3;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sample-programs {
  display: flex;
  align-items: center;
}

.parser-status {
  margin-left: 0.5rem;
}

.ide-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--game-text-primary);
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  text-shadow: 0 0 10px var(--game-accent-glow);
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
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 2px solid var(--game-card-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Allow panel to shrink */
  overflow: hidden; /* Prevent panel overflow */
  box-shadow: 
    var(--game-shadow-base),
    0 0 20px rgba(0, 255, 136, 0.1),
    inset 0 0 30px rgba(0, 255, 136, 0.02);
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.editor-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-color) 25%,
    var(--game-accent-glow) 50%, 
    var(--game-accent-color) 75%,
    transparent 100%
  );
  opacity: 0.6;
  z-index: 1;
  animation: borderShimmer 2.5s ease-in-out infinite;
  box-shadow: 0 0 10px var(--game-accent-glow);
}

.editor-panel::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 14px;
  background: linear-gradient(45deg, 
    transparent 30%,
    var(--game-accent-glow) 50%,
    transparent 70%
  );
  opacity: 0;
  z-index: -1;
  animation: borderRotate 4s linear infinite;
  filter: blur(8px);
}

.editor-panel:hover {
  border-color: var(--game-accent-color);
  box-shadow: 
    var(--game-shadow-hover),
    0 0 30px rgba(0, 255, 136, 0.3),
    0 0 60px rgba(0, 255, 136, 0.15),
    inset 0 0 40px rgba(0, 255, 136, 0.05);
  transform: translateY(-2px);
}

.editor-panel:hover::before {
  opacity: 1;
  height: 4px;
  box-shadow: 0 0 20px var(--game-accent-glow), 0 0 40px rgba(0, 255, 136, 0.4);
}

.editor-panel:hover::after {
  opacity: 0.3;
}

.output-panel {
  flex: 1 1 0; /* Equal width with editor panel */
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 2px solid var(--game-card-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Allow panel to shrink */
  overflow: hidden; /* Prevent panel overflow */
  box-shadow: var(--game-shadow-base);
  position: relative;
}

.panel-header {
  flex: 0 0 auto; /* Fixed height header */
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-bottom: 2px solid var(--game-card-border);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  color: var(--game-text-primary);
  font-size: 1.1rem;
  min-height: 48px; /* Ensure minimum header height */
  position: relative;
  z-index: 2;
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
  transition: all 0.3s ease;
}

.panel-header span {
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  font-size: 1.1rem;
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
}

.panel-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.05) 0%, 
    transparent 50%,
    rgba(0, 255, 136, 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.panel-header:hover::before {
  opacity: 1;
}

.panel-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-color) 25%,
    var(--game-accent-glow) 50%, 
    var(--game-accent-color) 75%,
    transparent 100%
  );
  opacity: 0.6;
  animation: headerShimmer 3s ease-in-out infinite;
  box-shadow: 0 0 8px var(--game-accent-glow);
}

.panel-header:hover {
  text-shadow: 
    0 0 12px var(--game-accent-glow),
    0 0 20px rgba(0, 255, 136, 0.5);
  color: var(--game-accent-color);
}

.panel-header:hover::after {
  opacity: 1;
  height: 3px;
  box-shadow: 0 0 12px var(--game-accent-glow), 0 0 24px rgba(0, 255, 136, 0.4);
}

@keyframes headerShimmer {
  0%, 100% {
    background-position: -200% center;
    opacity: 0.6;
  }
  50% {
    background-position: 200% center;
    opacity: 0.9;
  }
}

/* Ensure the main content areas are scrollable */
.editor-panel > :not(.panel-header) {
  flex: 1 1 0;
  overflow: hidden; /* Monaco handles its own scrolling */
  min-height: 0;
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
