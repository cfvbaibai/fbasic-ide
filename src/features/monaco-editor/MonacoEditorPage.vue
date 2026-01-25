<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import MonacoCodeEditor from '@/features/ide/components/MonacoCodeEditor.vue'
import { GameBlock, GameCodeQuote, GameDivider, GameLayout } from '@/shared/components/ui'

/**
 * MonacoEditorPage component - Page showcasing Monaco Editor for F-BASIC code editing.
 */
defineOptions({
  name: 'MonacoEditorPage',
})

const { t } = useI18n()

const code = ref(`10 PRINT "Hello, World!"
20 LET A = 10
30 LET B = 20
40 PRINT A + B
50 END`)

const sampleCode = `10 PRINT "Hello, World!"
20 LET A = 10
30 LET B = 20
40 PRINT A + B
50 END`
</script>

<template>
  <GameLayout>
    <div class="monaco-editor-page">
      <div class="editor-wrapper">
        <MonacoCodeEditor v-model="code" />
      </div>

      <div class="info-panel">
        <GameBlock :title="t('monacoEditor.info.title')">
          <p>
            <strong>{{ t('monacoEditor.info.language') }}</strong> F-BASIC
          </p>
          <p>
            <strong>{{ t('monacoEditor.info.editor') }}</strong> Monaco Editor
          </p>
          <p>
            <strong>{{ t('monacoEditor.info.features') }}</strong> Syntax Highlighting, Live Error Checking
          </p>
          <GameDivider />
          <p>
            <strong>{{ t('monacoEditor.info.sampleCode') }}</strong>
          </p>
          <GameCodeQuote :code="sampleCode" />
        </GameBlock>
      </div>
    </div>
  </GameLayout>
</template>

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
  padding: 0 1rem 1rem;
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
