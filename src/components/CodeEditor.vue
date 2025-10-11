<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { DEFAULTS } from '../core/constants'

interface Props {
  modelValue: string
  highlightedCode?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
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
  <div class="code-editor">
    <div class="editor-container">
      <!-- Line Numbers -->
      <div class="line-numbers">
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
  </div>
</template>

<style scoped>
.code-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  background: #fff;
}

.editor-container {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.line-numbers {
  background: #f8f9fa;
  border-right: 1px solid #e4e7ed;
  padding: 1rem 0.5rem;
  min-width: 3rem;
  text-align: right;
  color: #909399;
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
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  background: transparent;
  color: #303133;
  tab-size: 2;
}

.code-textarea::placeholder {
  color: #c0c4cc;
}

.code-textarea:focus {
  outline: none;
}

/* Scrollbar styling */
.code-textarea::-webkit-scrollbar {
  width: 8px;
}

.code-textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.code-textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.code-textarea::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.syntax-highlighted {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1rem;
  font-family: inherit;
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
