<script setup lang="ts">
import { ref } from 'vue'
import GameIconButton from './GameIconButton.vue'
import { message } from '../../utils/message'

interface Props {
  code: string
  language?: string
  showCopyButton?: boolean
  copyButtonText?: string
  copySuccessMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: '',
  showCopyButton: true,
  copyButtonText: 'Copy',
  copySuccessMessage: 'Code copied to clipboard!'
})

const isCopying = ref(false)

const handleCopy = async () => {
  if (!props.code || isCopying.value) return

  isCopying.value = true
  try {
    await navigator.clipboard.writeText(props.code)
    message.success(props.copySuccessMessage)
  } catch {
    message.error('Failed to copy to clipboard')
  } finally {
    // Small delay to prevent rapid clicking
    setTimeout(() => {
      isCopying.value = false
    }, 300)
  }
}
</script>

<template>
  <div class="game-code-quote">
    <div class="game-code-quote-content">
      <div class="game-code-quote-header" v-if="showCopyButton">
        <GameIconButton
          type="primary"
          size="small"
          icon="mdi:content-copy"
          :disabled="!code || isCopying"
          :loading="isCopying"
          :title="copyButtonText"
          @click="handleCopy"
        />
      </div>
      <pre
        :class="['game-code-quote-code', language ? `language-${language}` : '']"
      ><code v-if="code">{{ code }}</code><span v-else class="game-code-quote-empty">No code to display</span></pre>
    </div>
  </div>
</template>

<style scoped>
.game-code-quote {
  display: flex;
  flex-direction: column;
}

.game-code-quote-content {
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: var(--game-shadow-base);
  overflow: auto;
  position: relative;
}

.game-code-quote-header {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.game-code-quote-content::before {
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
  border-radius: 8px 8px 0 0;
}

.game-code-quote-code {
  margin: 0;
  padding: 0;
  color: var(--game-text-primary);
  font-family: var(--game-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
  background: transparent;
  border: none;
}

.game-code-quote-code code {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  background: transparent;
  padding: 0;
  border: none;
}

.game-code-quote-empty {
  color: var(--game-text-tertiary);
  font-style: italic;
  display: block;
  text-align: center;
  padding: 1rem 0;
}

/* Scrollbar styling */
.game-code-quote-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.game-code-quote-content::-webkit-scrollbar-track {
  background: transparent;
}

.game-code-quote-content::-webkit-scrollbar-thumb {
  background: var(--game-surface-border);
  border-radius: 4px;
}

.game-code-quote-content::-webkit-scrollbar-thumb:hover {
  background: var(--game-accent-color);
}
</style>