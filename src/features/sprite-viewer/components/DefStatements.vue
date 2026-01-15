<script setup lang="ts">
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'
import { message } from '../../../shared/utils/message'
import { GameButton, GameCard } from '../../../shared/components/ui'

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
  <GameCard 
    class="def-statements-section"
    title=""
    :float-on-hover="false"
    :clickable="false"
  >
    <div class="section-header">
      <h2 class="section-title">DEF Statements</h2>
      <GameButton
        type="primary"
        size="small"
        :disabled="!store.defSpriteStatement.value && !store.defMoveStatement.value"
        @click="copyAllStatements"
      >
        Copy All
      </GameButton>
    </div>

    <div class="statements-container">
      <div class="statement-block">
        <div class="statement-header">
          <h3 class="statement-title">DEF SPRITE</h3>
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
          <h3 class="statement-title">DEF MOVE</h3>
          <GameButton
            type="primary"
            size="small"
            :disabled="!store.defMoveStatement.value"
            @click="copyMoveStatement"
          >
            Copy
          </GameButton>
        </div>
        <div class="statement-container">
          <pre v-if="store.defMoveStatement.value" class="statement-code">{{ store.defMoveStatement.value }}</pre>
          <p v-else class="no-statement">No sprite selected</p>
        </div>
      </div>
    </div>
  </GameCard>
</template>

<style scoped>
.def-statements-section {
  margin-bottom: 2rem;
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  color: var(--game-text-primary);
  font-family: var(--game-font-family-heading);
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
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
  color: var(--game-text-primary);
  font-family: var(--game-font-family-heading);
  font-size: 1rem;
  font-weight: 700;
}

.statement-container {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 2px solid var(--game-card-border);
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
  font-family: var(--game-font-family);
  font-style: italic;
  text-align: center;
  padding: 1rem 0;
}
</style>

