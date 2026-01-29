<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { GameIcon, GameTabPane } from '@/shared/components/ui'

/**
 * StdoutTab component - Displays standard output and errors in a tab pane format.
 */
defineOptions({
  name: 'StdoutTab',
})

const props = defineProps<{
  output: string[]
  isRunning: boolean
  errors?: Array<{
    line: number
    message: string
    type: string
    stack?: string
    sourceLine?: string
  }>
}>()

const { t } = useI18n()

const outputRef = useTemplateRef<HTMLDivElement>('outputRef')

// Maximum number of lines to keep in the output buffer
const MAX_OUTPUT_LINES = 1000

// Computed property for rolling output buffer
const rollingOutput = computed(() => {
  if (props.output.length <= MAX_OUTPUT_LINES) {
    return props.output
  }
  // Keep only the last MAX_OUTPUT_LINES
  return props.output.slice(-MAX_OUTPUT_LINES)
})

const scrollToBottom = () => {
  nextTick(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  })
}

watch(() => props.output.length, scrollToBottom)
</script>

<template>
  <GameTabPane name="stdout">
    <template #label>
      <GameIcon icon="mdi:file-document" size="small" />
      <span>{{ t('ide.output.stdout') }}</span>
    </template>

    <div class="tab-content">
      <div ref="outputRef" class="output-content">
        <div v-if="rollingOutput.length === 0 && !isRunning && (!errors || errors.length === 0)" class="empty-output">
          <GameIcon icon="mdi:file-document" size="large" />
          <p>{{ t('ide.output.empty') }}</p>
        </div>
        <div v-else>
          <div v-if="rollingOutput.length > 0" class="output-lines">
            <div v-for="(line, index) in rollingOutput" :key="index" class="output-line">
              {{ line }}
            </div>
          </div>
          <div v-if="errors && errors.length > 0" class="error-output">
            <div v-for="(error, index) in errors" :key="index" class="error-block">
              <div class="error-line">
                <GameIcon icon="mdi:alert" size="small" />
                <span class="error-type">{{ error.type }}:</span>
                <span class="error-message">{{ error.message }}</span>
                <span v-if="error.line > 0" class="error-line-number"
                  >({{ t('ide.output.errorLine', { line: error.line }) }})</span
                >
              </div>
              <div v-if="error.sourceLine" class="error-source-line">
                <span class="error-source-label">At:</span>
                <code>{{ error.sourceLine }}</code>
              </div>
              <details v-if="error.stack" class="error-stack-details">
                <summary>Stack trace</summary>
                <pre class="error-stack">{{ error.stack }}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GameTabPane>
</template>

<style scoped>
.tab-content {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.output-content {
  flex: 1 1 0;
  padding: 1rem;
  overflow-y: auto;
  background: var(--game-screen-bg-color);
  color: var(--game-screen-text-color);
  font-family: var(--game-font-family-mono);
  font-size: var(--game-font-size-mono);
  line-height: var(--game-line-height-mono);
  scroll-behavior: smooth;
  min-height: 0;
  position: relative;
}

.empty-output {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--game-screen-text-color);
  text-align: center;
}

.empty-output :deep(.game-icon) {
  font-size: var(--game-font-size-lg);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.output-lines {
  margin: 0;
}

.output-line:hover {
  background: var(--game-surface-bg-gradient);
}

.error-output {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--semantic-solid-danger);
}

.error-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--semantic-solid-danger);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.error-type {
  font-weight: bold;
  text-transform: uppercase;
}

.error-message {
  flex: 1;
}

.error-line-number {
  color: var(--semantic-solid-danger);
  opacity: 0.8;
  font-size: 0.8rem;
  font-style: italic;
}

.error-block {
  margin-bottom: 0.75rem;
}

.error-source-line {
  margin-top: 0.25rem;
  margin-left: 1.5rem;
  font-size: 0.85rem;
  color: var(--game-screen-text-color);
}

.error-source-label {
  margin-right: 0.25rem;
  font-style: italic;
  opacity: 0.9;
}

.error-source-line code {
  background: var(--game-surface-bg-start);
  padding: 0.1rem 0.25rem;
  border-radius: 2px;
  font-family: var(--game-font-family-mono);
}

.error-stack-details {
  margin-top: 0.25rem;
  margin-left: 1.5rem;
  font-size: 0.75rem;
  color: var(--game-screen-text-color);
  opacity: 0.9;
}

.error-stack-details summary {
  cursor: pointer;
  user-select: none;
}

.error-stack {
  margin: 0.25rem 0 0;
  padding: 0.5rem;
  overflow: auto;
  background: var(--game-surface-bg-start);
  border-radius: 2px;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.7rem;
  max-height: 12rem;
}
</style>
