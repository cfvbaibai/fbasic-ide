<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { GameIcon, GameTabPane } from '@/shared/components/ui'

/**
 * DebugTab component - Displays debug output in a tab pane format.
 */
defineOptions({
  name: 'DebugTab',
})

const props = defineProps<{
  debugOutput?: string
  debugMode?: boolean
}>()

const { t } = useI18n()

const isDisabled = computed(() => !props.debugMode || !props.debugOutput)
</script>

<template>
  <GameTabPane name="debug" :disabled="isDisabled">
    <template #label>
      <GameIcon icon="mdi:tools" size="small" />
      <span>{{ t('ide.output.debug') }}</span>
    </template>

    <div class="tab-content">
      <div class="debug-content border-game-surface">
        <pre class="debug-text">{{ debugOutput }}</pre>
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

.debug-content {
  flex: 1 1 0;
  padding: 1rem;
  overflow-y: auto;
  background: var(--game-surface-bg-gradient);
  min-height: 0;
  border-radius: 6px;
  box-shadow: inset 0 2px 4px var(--base-alpha-gray-00-50);
}

.debug-text {
  margin: 0;
  font-family: var(--game-font-family-mono);
  font-size: var(--game-font-size-mono);
  line-height: var(--game-line-height-mono);
  color: var(--game-text-primary);
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
</style>
