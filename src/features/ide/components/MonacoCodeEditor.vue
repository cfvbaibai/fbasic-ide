<template>
  <div ref="editorContainer" class="monaco-editor-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import * as monaco from 'monaco-editor';
import { setupMonacoLanguage, setupLiveErrorChecking } from '../integrations/monaco-integration';
import { useTheme } from '../../../shared/composables/useTheme';

interface Props {
  modelValue: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const editorContainer = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

// Get theme state
const { isDark } = useTheme();

// Compute Monaco theme name based on current theme
const monacoTheme = computed(() => {
  return isDark.value ? 'fbasic-theme-dark' : 'fbasic-theme';
});

// Function to update Monaco editor theme
const updateMonacoTheme = () => {
  if (editor) {
    monaco.editor.setTheme(monacoTheme.value);
  }
};

onMounted(() => {
  if (!editorContainer.value) return;

  // Setup Monaco language support (this also sets up themes)
  setupMonacoLanguage();

  // Create Monaco editor
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: 'fbasic',
    theme: monacoTheme.value, // Use theme-aware F-BASIC theme
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    cursorStyle: 'line',
    wordWrap: 'on',
    tabSize: 2
  });

  // Setup live error checking
  if (editor) {
    setupLiveErrorChecking(editor);
  }

  // Listen for content changes
  editor?.onDidChangeModelContent(() => {
    const value = editor?.getValue() || '';
    emit('update:modelValue', value);
  });
});

// Watch for theme changes and update Monaco editor
watch(isDark, () => {
  updateMonacoTheme();
});

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue);
    }
  }
);

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
  }
});
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;
}

.monaco-editor-container::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.1) 0%,
    transparent 30%,
    transparent 70%,
    rgba(0, 255, 136, 0.1) 100%
  );
  border-radius: 8px;
  opacity: 0;
  z-index: -1;
  pointer-events: none;
  transition: opacity 0.3s ease;
  animation: editorGlow 4s ease-in-out infinite;
  filter: blur(4px);
}

.monaco-editor-container:hover::before {
  opacity: 0.6;
}

@keyframes editorGlow {
  0%, 100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.01);
  }
}
</style>

