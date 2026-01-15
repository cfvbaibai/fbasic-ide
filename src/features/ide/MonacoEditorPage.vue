<template>
  <div class="monaco-editor-page">
    <GameNavigation />
    <div class="page-header">
      <h1>
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Edit, ArrowLeft } from '@element-plus/icons-vue';
import MonacoCodeEditor from './components/MonacoCodeEditor.vue';
import GameNavigation from '../../shared/components/GameNavigation.vue';
import { GameButton, GameIcon, GameDivider, InfoCard } from '../../shared/components/ui';

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
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--app-bg-color);
}

.page-header {
  background: var(--app-bg-color-page);
  border-bottom: 1px solid var(--app-border-color-light);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--app-box-shadow-base);
}

.page-header h1 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--app-text-color-primary);
  font-size: 1.5rem;
  font-weight: 600;
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

