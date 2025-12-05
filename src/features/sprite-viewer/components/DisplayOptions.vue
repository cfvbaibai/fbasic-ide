<script setup lang="ts">
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'

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
    <div class="control-group">
      <label for="reverse-x">Reverse X (Horizontal):</label>
      <el-switch
        id="reverse-x"
        :model-value="store.displayOptions.value.reverseX"
        @update:model-value="updateReverseX"
      />
    </div>
    <div class="control-group">
      <label for="reverse-y">Reverse Y (Vertical):</label>
      <el-switch
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
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 500;
  color: var(--app-text-color-regular);
  white-space: nowrap;
}
</style>

