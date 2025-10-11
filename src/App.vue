<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CodeEditor from './components/CodeEditor.vue'
import RuntimeOutput from './components/RuntimeOutput.vue'
import IdeControls from './components/IdeControls.vue'
import { useBasicIde as useBasicIdeEnhanced } from './composables/useBasicIdeEnhanced'
import type { ParserInfo, HighlighterInfo } from './core/interfaces'

// Use the enhanced AST-based parser system
const {
  code,
  isRunning,
  output,
  errors,
  variables,
  highlightedCode,
  hasErrors,
  hasOutput,
  isReady,
  debugOutput,
  debugMode,
  runCode,
  stopCode,
  clearOutput,
  loadSampleCode,
  validateCode,
  getParserCapabilities,
  getHighlighterCapabilities,
  toggleDebugMode
} = useBasicIdeEnhanced()

// Computed properties for backward compatibility
const canRun = isReady
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
            <el-button @click="loadSampleCode('gaming')" size="small">
              Gaming
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
          <el-tag type="info" size="small">
            Syntax Highlighting
          </el-tag>
        </div>
        <CodeEditor v-model="code" :highlighted-code="highlightedCode" />
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
          :output="output.join('\n')" 
          :is-running="isRunning" 
          :errors="errors"
          :variables="variables"
          :debug-output="debugOutput"
          :debug-mode="debugMode"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ide-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.ide-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  flex: 1;
  display: flex;
  height: calc(100vh - 80px);
}

.editor-panel {
  flex: 1;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.output-panel {
  flex: 1;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.panel-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #606266;
}
</style>
