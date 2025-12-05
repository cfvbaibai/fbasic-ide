<script setup lang="ts">
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'
import { ElMessage } from 'element-plus'

const store = useSpriteViewerStore()

const copySpriteStatement = async () => {
  try {
    await navigator.clipboard.writeText(store.defSpriteStatement.value)
    ElMessage.success('DEF SPRITE statement copied to clipboard!')
  } catch (err) {
    ElMessage.error('Failed to copy to clipboard')
  }
}

const copyMoveStatement = async () => {
  try {
    await navigator.clipboard.writeText(store.defMoveStatement.value)
    ElMessage.success('DEF MOVE statement copied to clipboard!')
  } catch (err) {
    ElMessage.error('Failed to copy to clipboard')
  }
}

const copyAllStatements = async () => {
  const combined = [
    store.defSpriteStatement.value,
    store.defMoveStatement.value
  ].filter(Boolean).join('\n\n')
  
  if (combined) {
    try {
      await navigator.clipboard.writeText(combined)
      ElMessage.success('All statements copied to clipboard!')
    } catch (err) {
      ElMessage.error('Failed to copy to clipboard')
    }
  }
}
</script>

<template>
  <div class="def-statements-section">
    <div class="section-header">
      <h2 class="section-title">DEF Statements</h2>
      <el-button
        type="primary"
        size="small"
        :disabled="!store.defSpriteStatement.value && !store.defMoveStatement.value"
        @click="copyAllStatements"
      >
        Copy All
      </el-button>
    </div>

    <div class="statements-container">
      <div class="statement-block">
        <div class="statement-header">
          <h3 class="statement-title">DEF SPRITE</h3>
          <el-button
            type="primary"
            size="small"
            plain
            :disabled="!store.defSpriteStatement.value"
            @click="copySpriteStatement"
          >
            Copy
          </el-button>
        </div>
        <div class="statement-container">
          <pre v-if="store.defSpriteStatement.value" class="statement-code">{{ store.defSpriteStatement.value }}</pre>
          <p v-else class="no-statement">No sprite selected</p>
        </div>
      </div>

      <div class="statement-block">
        <div class="statement-header">
          <h3 class="statement-title">DEF MOVE</h3>
          <el-button
            type="primary"
            size="small"
            plain
            :disabled="!store.defMoveStatement.value"
            @click="copyMoveStatement"
          >
            Copy
          </el-button>
        </div>
        <div class="statement-container">
          <pre v-if="store.defMoveStatement.value" class="statement-code">{{ store.defMoveStatement.value }}</pre>
          <p v-else class="no-statement">No sprite selected</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.def-statements-section {
  background: var(--app-bg-color-page);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--app-box-shadow-base);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  color: var(--app-text-color-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.statements-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.statement-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.statement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statement-title {
  margin: 0;
  color: var(--app-text-color-primary);
  font-size: 1rem;
  font-weight: 600;
}

.statement-container {
  background: var(--app-fill-color-light);
  border: 1px solid var(--app-border-color-light);
  border-radius: 4px;
  padding: 1rem;
  min-height: 60px;
}

.statement-code {
  margin: 0;
  color: var(--app-text-color-primary);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

.no-statement {
  margin: 0;
  color: var(--app-text-color-regular);
  font-style: italic;
  text-align: center;
  padding: 1rem 0;
}
</style>

