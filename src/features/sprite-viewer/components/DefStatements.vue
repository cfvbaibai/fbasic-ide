<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'
import { GameCodeQuote, GameBlock, GameButton } from '../../../shared/components/ui'
import { message } from '../../../shared/utils/message'

/**
 * DefStatements component - Displays and allows copying of DEF SPRITE and DEF MOVE statements.
 */
defineOptions({
  name: 'DefStatements'
})

const { t } = useI18n()

const store = useSpriteViewerStore()

const copyAllStatements = async () => {
  const combined = [
    store.defSpriteStatement.value,
    store.defMoveStatement.value
  ].filter(Boolean).join('\n\n')
  
  if (combined) {
    try {
      await navigator.clipboard.writeText(combined)
      message.success(t('spriteViewer.defStatements.copyAllSuccess'))
    } catch {
      message.error(t('spriteViewer.defStatements.copyError'))
    }
  }
}
</script>

<template>
  <GameBlock :title="t('spriteViewer.defStatements.title')">
    <template #right>
      <GameButton
        type="primary"
        size="small"
        :disabled="!store.defSpriteStatement.value && !store.defMoveStatement.value"
        @click="copyAllStatements"
      >
        {{ t('spriteViewer.defStatements.copyAll') }}
      </GameButton>
    </template>

    <div class="statements-container">
      <div class="statement-block">
        <h3 class="statement-title text-game-heading">{{ t('spriteViewer.defStatements.defSprite') }}</h3>
        <GameCodeQuote
          :code="store.defSpriteStatement.value || ''"
          :copy-success-message="t('spriteViewer.defStatements.defSpriteCopySuccess')"
        />
      </div>

      <div class="statement-block">
        <h3 class="statement-title text-game-heading">{{ t('spriteViewer.defStatements.defMove') }}</h3>
        <GameCodeQuote
          :code="store.defMoveStatement.value || ''"
          :copy-success-message="t('spriteViewer.defStatements.defMoveCopySuccess')"
        />
      </div>
    </div>
  </GameBlock>
</template>

<style scoped>
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

