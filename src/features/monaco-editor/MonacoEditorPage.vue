<template>
  <GameLayout
    title="Monaco Editor Demo"
    icon="mdi:pencil"
  >
    <div class="monaco-editor-page">
    
    <div class="editor-wrapper">
      <MonacoCodeEditor v-model="code" />
    </div>
    
    <div class="info-panel">
      <GameBlock title="Editor Info">
        <p><strong>Language:</strong> F-BASIC</p>
        <p><strong>Editor:</strong> Monaco Editor</p>
        <p><strong>Features:</strong> Syntax Highlighting, Live Error Checking</p>
        <GameDivider />
        <p><strong>Sample Code:</strong></p>
        <GameCodeQuote :code="sampleCode" />
      </GameBlock>
    </div>
    </div>
  </GameLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MonacoCodeEditor from '../ide/components/MonacoCodeEditor.vue';
import { GameLayout, GameDivider, GameBlock, GameCodeQuote } from '../../shared/components/ui';

const code = ref(`10 PRINT "Hello, World!"
20 LET A = 10
30 LET B = 20
40 PRINT A + B
50 END`);

const sampleCode = `10 PRINT "Hello, World!"
20 LET A = 10
30 LET B = 20
40 PRINT A + B
50 END`;
</script>

<style scoped>
.monaco-editor-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.editor-wrapper {
  flex: 1;
  display: flex;
  min-height: 0;
  padding: 1rem;
  gap: 1rem;
}

.editor-wrapper > :first-child {
  flex: 2;
  min-width: 0;
}

.info-panel {
  flex: 1;
  padding: 0 1rem;
  min-width: 300px;
}
</style>
