<template>
  <GameLayout>
    <div class="monaco-editor-page">
      <div class="monaco-editor-header">
      <h1 class="monaco-editor-title">
        <GameIcon :icon="Edit" />
        Monaco Editor Demo
      </h1>
      <GameButton @click="goHome" type="primary" :icon="ArrowLeft">
        Back to IDE
      </GameButton>
    </div>
    
    <div class="editor-wrapper">
      <MonacoCodeEditor v-model="code" />
    </div>
    
    <div class="info-panel">
      <InfoCard title="Editor Info">
        <p><strong>Language:</strong> F-BASIC</p>
        <p><strong>Editor:</strong> Monaco Editor</p>
        <p><strong>Features:</strong> Syntax Highlighting, Live Error Checking</p>
        <GameDivider />
        <p><strong>Sample Code:</strong></p>
        <pre>{{ sampleCode }}</pre>
      </InfoCard>
    </div>
    </div>
  </GameLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Edit, ArrowLeft } from '@element-plus/icons-vue';
import MonacoCodeEditor from './components/MonacoCodeEditor.vue';
import { GameLayout, GameButton, GameIcon, GameDivider, InfoCard } from '../../shared/components/ui';

const router = useRouter();
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

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.monaco-editor-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.monaco-editor-header {
  flex: 0 0 auto;
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-bottom: 2px solid var(--game-card-border);
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow: var(--game-shadow-base);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monaco-editor-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-glow) 50%, 
    transparent 100%
  );
  opacity: 0.5;
  border-radius: 12px 12px 0 0;
}

.monaco-editor-title {
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
  min-width: 300px;
}

.info-panel pre {
  background: var(--app-bg-color);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  overflow-x: auto;
}
</style>

