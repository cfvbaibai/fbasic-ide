<script setup lang="ts">
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'

const store = useSpriteViewerStore()

const updateShowValues = (value: boolean | string | number) => {
  store.setDisplayOptions({ showValues: Boolean(value) })
}

const updateShowGridLines = (value: boolean | string | number) => {
  store.setDisplayOptions({ showGridLines: Boolean(value) })
}
</script>

<template>
  <div class="control-group">
    <label for="show-values">Show Value Numbers:</label>
    <el-switch
      id="show-values"
      :model-value="store.displayOptions.value.showValues"
      @update:model-value="updateShowValues"
    />
  </div>
  <div class="control-group">
    <label for="show-grid-lines">Show Grid Lines:</label>
    <el-switch
      id="show-grid-lines"
      :model-value="store.displayOptions.value.showGridLines"
      @update:model-value="updateShowGridLines"
    />
  </div>
</template>

<style scoped>
.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group label {
  font-weight: 500;
  color: var(--app-text-color-regular);
}
</style>

