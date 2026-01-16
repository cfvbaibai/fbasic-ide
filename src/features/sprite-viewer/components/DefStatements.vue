<script setup lang="ts">
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'
import { GameCodeQuote, GameBlock, GameButton } from '../../../shared/components/ui'
import { message } from '../../../shared/utils/message'

const store = useSpriteViewerStore()

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
        <h3 class="statement-title text-game-heading">DEF SPRITE</h3>
        <GameCodeQuote
          :code="store.defSpriteStatement.value || ''"
          copy-success-message="DEF SPRITE statement copied to clipboard!"
        />
      </div>

      <div class="statement-block">
        <h3 class="statement-title text-game-heading">DEF MOVE</h3>
        <GameCodeQuote
          :code="store.defMoveStatement.value || ''"
          copy-success-message="DEF MOVE statement copied to clipboard!"
        />
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

.statement-title {
  margin: 0;
  font-size: 1rem;
}
</style>

