<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'
import { GameSwitch } from '../../../shared/components/ui'

const { t } = useI18n()
const store = useSpriteViewerStore()

const updateShowValues = (value: boolean | string | number) => {
  store.setDisplayOptions({ showValues: Boolean(value) })
}

const updateShowGridLines = (value: boolean | string | number) => {
  store.setDisplayOptions({ showGridLines: Boolean(value) })
}

const updateReverseX = (value: boolean | string | number) => {
  store.setDisplayOptions({ reverseX: Boolean(value) })
}

const updateReverseY = (value: boolean | string | number) => {
  store.setDisplayOptions({ reverseY: Boolean(value) })
}
</script>

<template>
  <div class="switches-container">
    <div class="control-group">
      <label for="show-values">{{ t('spriteViewer.displayOptions.showValues') }}</label>
      <GameSwitch
        id="show-values"
        :model-value="store.displayOptions.value.showValues"
        @update:model-value="updateShowValues"
      />
    </div>
    <div class="control-group">
      <label for="show-grid-lines">{{ t('spriteViewer.displayOptions.showGridLines') }}</label>
      <GameSwitch
        id="show-grid-lines"
        :model-value="store.displayOptions.value.showGridLines"
        @update:model-value="updateShowGridLines"
      />
    </div>
    <div class="control-group">
      <label for="reverse-x">{{ t('spriteViewer.displayOptions.reverseX') }}</label>
      <GameSwitch
        id="reverse-x"
        :model-value="store.displayOptions.value.reverseX"
        @update:model-value="updateReverseX"
      />
    </div>
    <div class="control-group">
      <label for="reverse-y">{{ t('spriteViewer.displayOptions.reverseY') }}</label>
      <GameSwitch
        id="reverse-y"
        :model-value="store.displayOptions.value.reverseY"
        @update:model-value="updateReverseY"
      />
    </div>
  </div>
</template>

<style scoped>
.switches-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.control-group label {
  font-weight: 600;
  color: var(--game-text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
</style>

