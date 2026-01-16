<script setup lang="ts">
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'
import { message } from '../../../shared/utils/message'
import { GameButton, GameBlock } from '../../../shared/components/ui'

const store = useSpriteViewerStore()

const copySpriteStatement = async () => {
  try {
    await navigator.clipboard.writeText(store.defSpriteStatement.value)
    message.success('DEF SPRITE statement copied to clipboard!')
  } catch (err) {
    message.error('Failed to copy to clipboard')
  }
}

const copyMoveStatement = async () => {
  try {
    await navigator.clipboard.writeText(store.defMoveStatement.value)
    message.success('DEF MOVE statement copied to clipboard!')
  } catch (err) {
    message.error('Failed to copy to clipboard')
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
      message.success('All statements copied to clipboard!')
    } catch (err) {
      message.error('Failed to copy to clipboard')
    }
  }
}
</script>

<template>
  <GameBlock 
    title="DEF Statements"
    class="def-statements-section"
  >
    <template #right>
      <GameButton
        type="primary"
        size="small"
        :disabled="!store.defSpriteStatement.value && !store.defMoveStatement.value"
        @click="copyAllStatements"
      >
        Copy All
      </GameButton>
    </template>

    <div class="statements-container">
      <div class="statement-block">
        <div class="statement-header">
          <h3 class="statement-title text-game-heading">DEF SPRITE</h3>
          <GameButton
            type="primary"
            size="small"
            :disabled="!store.defSpriteStatement.value"
            @click="copySpriteStatement"
          >
            Copy
          </GameButton>
        </div>
        <div class="statement-container">
          <pre v-if="store.defSpriteStatement.value" class="statement-code">{{ store.defSpriteStatement.value }}</pre>
          <p v-else class="no-statement">No sprite selected</p>
        </div>
      </div>

      <div class="statement-block">
        <div class="statement-header">
          <h3 class="statement-title text-game-heading">DEF MOVE</h3>
          <GameButton
            type="primary"
            size="small"
            :disabled="!store.defMoveStatement.value"
            @click="copyMoveStatement"
          >
            Copy
          </GameButton>
        </div>
        <div class="statement-container bg-game-surface border-game-surface-2 shadow-game-base">
          <pre v-if="store.defMoveStatement.value" class="statement-code">{{ store.defMoveStatement.value }}</pre>
          <p v-else class="no-statement">No sprite selected</p>
        </div>
      </div>
    </div>
  </GameBlock>
</template>

<style scoped>
.def-statements-section {
  margin-bottom: 2rem;
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
  font-size: 1rem;
}

.statement-container {
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 8px;
  padding: 1rem;
  min-height: 60px;
  box-shadow: var(--game-shadow-base);
}

.statement-code {
  margin: 0;
  color: var(--game-text-primary);
  font-family: var(--game-font-family-mono);
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

.no-statement {
  margin: 0;
  color: var(--game-text-secondary);
  font-style: italic;
  text-align: center;
  padding: 1rem 0;
}
</style>

