<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { message } from '@/shared/utils/message'

import GameIconButton from './GameIconButton.vue'

/**
 * GameCodeQuote component - A code block component with copy functionality.
 * 
 * @example
 * ```vue
 * <GameCodeQuote
 *   code="const x = 1;"
 *   language="javascript"
 *   :show-copy-button="true"
 * />
 * ```
 */
defineOptions({
  name: 'GameCodeQuote'
})

const props = withDefaults(defineProps<Props>(), {
  language: '',
  showCopyButton: true,
  copyButtonText: '',
  copySuccessMessage: ''
})

const { t } = useI18n()

interface Props {
  code: string
  language?: string
  showCopyButton?: boolean
  copyButtonText?: string
  copySuccessMessage?: string
}

const isCopying = ref(false)

const handleCopy = async () => {
  if (!props.code || isCopying.value) return

  isCopying.value = true
  try {
    await navigator.clipboard.writeText(props.code)
    message.success(props.copySuccessMessage || t('common.codeQuote.copySuccess'))
  } catch {
    message.error(t('common.codeQuote.copyError'))
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
      <div class="game-code-quote-crt-overlay"></div>
      <div class="game-code-quote-header" v-if="showCopyButton">
        <GameIconButton
          type="primary"
          size="small"
          icon="mdi:content-copy"
          :disabled="!code || isCopying"
          :loading="isCopying"
          :title="copyButtonText || t('common.codeQuote.copy')"
          @click="handleCopy"
        />
      </div>
      <pre
        :class="['game-code-quote-code', language ? `language-${language}` : '']"
      ><code v-if="code">{{ code }}</code><span v-else class="game-code-quote-empty">{{ t('common.codeQuote.empty') }}</span></pre>
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
  box-shadow: var(--game-shadow-inset);
  overflow: auto;
  position: relative;
  transition: all 0.3s ease;
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
    var(--base-solid-primary) 50%, 
    transparent 100%
  );
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left;
  transition: opacity 0.3s ease, transform 0.3s ease;
  border-radius: 8px 8px 0 0;
  z-index: 1;
}

.game-code-quote-content::after {
  content: '';
  position: absolute;
  inset: 2px;
  border: 1px solid var(--base-solid-primary);
  border-radius: 6px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}

.game-code-quote:hover .game-code-quote-content {
  border-color: var(--game-surface-border-hover);
  filter: sepia(0.5) saturate(0.2) hue-rotate(90deg) contrast(1.1) brightness(0.95);
}

.game-code-quote:hover .game-code-quote-content::before {
  opacity: 0.8;
  transform: scaleX(1);
}

.game-code-quote:hover .game-code-quote-content::after {
  opacity: 0.2;
}

.game-code-quote-crt-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
  mix-blend-mode: screen;
  border-radius: 8px;
}

.game-code-quote:hover .game-code-quote-crt-overlay {
  opacity: 1;
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

.game-code-quote-code {
  margin: 0;
  padding: 0;
  color: var(--game-text-primary);
  font-family: var(--game-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: break-word;
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
  background: var(--base-solid-primary);
}
</style>