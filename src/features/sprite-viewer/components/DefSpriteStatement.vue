<script setup lang="ts">
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'
import { ElMessage } from 'element-plus'

const store = useSpriteViewerStore()

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(store.defSpriteStatement.value)
    ElMessage.success('DEF SPRITE statement copied to clipboard!')
  } catch (err) {
    ElMessage.error('Failed to copy to clipboard')
  }
}
</script>

<template>
  <div class="def-sprite-section">
    <div class="section-header">
      <h2 class="section-title">DEF SPRITE Statement</h2>
      <el-button
        type="primary"
        size="small"
        :disabled="!store.defSpriteStatement.value"
        @click="copyToClipboard"
      >
        Copy
      </el-button>
    </div>
    <div class="statement-container">
      <pre v-if="store.defSpriteStatement.value" class="statement-code">{{ store.defSpriteStatement.value }}</pre>
      <p v-else class="no-statement">No sprite selected</p>
    </div>
  </div>
</template>

<style scoped>
.def-sprite-section {
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
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
  color: var(--app-text-color-primary);
  font-size: 1.25rem;
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

