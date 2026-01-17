<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { DEFAULTS } from '../../../core/constants'
import { GameBlock } from '../../../shared/components/ui'

interface Props {
  modelValue: string
  highlightedCode?: string
  title?: string
  titleIcon?: string
}

interface Emits {
  (type: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Code Editor',
  titleIcon: 'mdi:pencil'
})
const emit = defineEmits<Emits>()

const textareaRef = ref<HTMLTextAreaElement>()
const lineNumbers = ref<string[]>([])

const updateLineNumbers = (text: string) => {
  const lines = text.split('\n')
  lineNumbers.value = lines.map((_, index) => String(index + 1))
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  updateLineNumbers(target.value)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Tab') {
    event.preventDefault()
    const target = event.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd
    const value = target.value
    
    target.value = value.substring(0, start) + '  ' + value.substring(end)
    target.selectionStart = target.selectionEnd = start + DEFAULTS.TAB_SIZE
    
    emit('update:modelValue', target.value)
    updateLineNumbers(target.value)
  }
}

// Initialize line numbers
watch(() => props.modelValue, updateLineNumbers, { immediate: true })

// Also update on mount
onMounted(() => {
  updateLineNumbers(props.modelValue)
})
</script>

<template>
  <GameBlock 
    :title="props.title || 'Code Editor'"
    :title-icon="props.titleIcon"
    class="code-editor"
  >
    <div class="editor-container">
      <!-- Line Numbers -->
      <div class="line-numbers bg-game-surface border-game-surface-right">
        <div 
          v-for="line in lineNumbers" 
          :key="line" 
          class="line-number"
        >
          {{ line }}
        </div>
      </div>
      
      <!-- Code Textarea -->
      <textarea
        ref="textareaRef"
        :value="modelValue"
        @input="handleInput"
        @keydown="handleKeyDown"
        class="code-textarea"
        placeholder="Enter your Family Basic code here..."
        spellcheck="false"
      />
      
      <!-- Syntax Highlighted Display (overlay) -->
      <div 
        v-if="highlightedCode && highlightedCode !== modelValue"
        class="syntax-highlighted"
        v-html="highlightedCode"
      />
    </div>
  </GameBlock>
</template>

<style scoped>
.code-editor {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  min-height: 0; /* Allow component to shrink */
  overflow: hidden; /* Prevent overflow */
}

.code-editor :deep(.game-block-content) {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.editor-container {
  flex: 1 1 0;
  display: flex;
  position: relative;
  overflow: hidden;
  min-height: 0; /* Allow container to shrink */
}

.line-numbers {
  padding: 1rem 0.5rem;
  min-width: 3rem;
  text-align: right;
  color: var(--game-text-secondary);
  font-size: 14px;
  line-height: 1.5;
  user-select: none;
}

.line-number {
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 3ch;
  text-align: right;
}

.code-textarea {
  flex: 1;
  border: none;
  outline: none;
  padding: 1rem;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  background: transparent;
  color: var(--game-text-primary);
  tab-size: 2;
  font-family: var(--game-font-family-mono);
}

.code-textarea::placeholder {
  color: var(--game-text-tertiary);
}

.code-textarea:focus {
  outline: none;
}

.code-textarea::-webkit-scrollbar-track {
  background: var(--game-surface-bg-gradient);
}

.code-textarea::-webkit-scrollbar-thumb {
  background: var(--game-surface-border);
  border-radius: 4px;
}

.code-textarea::-webkit-scrollbar-thumb:hover {
  background: var(--game-accent-color);
}

.syntax-highlighted {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1rem;
  font-size: 14px;
  line-height: 1.5;
  color: transparent;
  pointer-events: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  z-index: 1;
}

.syntax-highlighted :deep(span) {
  color: inherit;
}
</style>
