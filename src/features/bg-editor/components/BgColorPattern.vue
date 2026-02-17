<script setup lang="ts">
/**
 * BgColorPattern component - Color pattern selection buttons (0, 1, 2, 3)
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { GameButton, GameButtonGroup } from '@/shared/components/ui'

import { useBgEditorState } from '../composables/useBgEditorState'
import type { ColorPattern } from '../types'

const { t } = useI18n()
const { selectedColorPattern, setSelectedColorPattern } = useBgEditorState()

const patterns: { value: ColorPattern; label: string }[] = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
]

const currentPattern = computed({
  get: () => selectedColorPattern.value,
  set: (value: ColorPattern) => setSelectedColorPattern(value),
})
</script>

<template>
  <div class="bg-color-pattern">
    <span class="label">{{ t('bgEditor.colorPattern.label') }}</span>
    <GameButtonGroup>
      <GameButton
        v-for="p in patterns"
        :key="p.value"
        variant="toggle"
        :selected="currentPattern === p.value"
        @click="currentPattern = p.value"
      >
        {{ p.label }}
      </GameButton>
    </GameButtonGroup>
  </div>
</template>

<style scoped>
.bg-color-pattern {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--game-text-secondary);
  font-family: var(--game-font-family-heading);
}
</style>
