<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MonacoCodeEditor from '../components/MonacoCodeEditor.vue'
import RuntimeOutput from '../components/RuntimeOutput.vue'
import IdeControls from '../components/IdeControls.vue'
import JoystickControl from '../components/JoystickControl.vue'
import { useBasicIde as useBasicIdeEnhanced } from '../composables/useBasicIdeEnhanced'
import type { ParserInfo, HighlighterInfo } from '../core/interfaces'

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
  runCode,
  stopCode,
  clearOutput,
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
    <!-- IDE Header -->
    <div class="ide-header">
      <div class="header-left">
        <h1 class="ide-title">
          <el-icon><Monitor /></el-icon>
          Family Basic IDE
          <el-tag type="success" size="small" class="parser-status">
            AST Parser
          </el-tag>
        </h1>
        <div class="sample-programs">
          <el-button-group size="small">
            <el-button @click="loadSampleCode('basic')" size="small">
              Basic
            </el-button>
            <el-button @click="loadSampleCode('pause')" size="small">
              Pause Demo
            </el-button>
            <el-button @click="loadSampleCode('gaming')" size="small">
              Joystick Test
            </el-button>
            <el-button @click="loadSampleCode('complex')" size="small">
              Complex
            </el-button>
            <el-button @click="loadSampleCode('comprehensive')" size="small">
              Full Demo
            </el-button>
          </el-button-group>
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
          <el-icon><Edit /></el-icon>
          <span>Code Editor</span>
          <el-tag type="success" size="small">
            Monaco Editor
          </el-tag>
        </div>
        <MonacoCodeEditor v-model="code" />
      </div>

      <!-- Right Panel - Runtime Output -->
      <div class="output-panel">
        <div class="panel-header">
          <el-icon><View /></el-icon>
          <span>Runtime Output</span>
          <el-tag v-if="Object.keys(variables).length > 0" type="success" size="small">
            {{ Object.keys(variables).length }} Variables
          </el-tag>
        </div>
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
    <JoystickControl 
      :send-stick-event="sendStickEvent"
      :send-strig-event="sendStrigEvent"
    />
  </div>
</template>

<style scoped>
.ide-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden; /* Prevent outer scrollbar */
}

.ide-header {
  flex: 0 0 auto; /* Fixed height header */
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 80px; /* Ensure minimum header height */
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
  color: #303133;
  font-size: 1.5rem;
  font-weight: 600;
}

.ide-content {
  flex: 1 1 0; /* Take remaining space */
  display: flex;
  min-height: 0; /* Allow flex items to shrink below content size */
  overflow: hidden; /* Prevent content overflow */
}

.editor-panel {
  flex: 1 1 0; /* Equal width with output panel */
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Allow panel to shrink */
  overflow: hidden; /* Prevent panel overflow */
}

.output-panel {
  flex: 1 1 0; /* Equal width with editor panel */
  background: #fff;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Allow panel to shrink */
  overflow: hidden; /* Prevent panel overflow */
}

.panel-header {
  flex: 0 0 auto; /* Fixed height header */
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #606266;
  min-height: 48px; /* Ensure minimum header height */
}

/* Ensure the main content areas are scrollable */
.editor-panel > :not(.panel-header) {
  flex: 1 1 0;
  overflow: hidden; /* Monaco handles its own scrolling */
  min-height: 0;
}

.output-panel > :not(.panel-header) {
  flex: 1 1 0;
  overflow: auto;
  min-height: 0;
}
</style>

