<script setup lang="ts">
import { CHARACTER_SPRITES } from '../../../shared/data/sprites'
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'

const store = useSpriteViewerStore()
</script>

<template>
  <div class="control-group">
    <label for="sprite-selection">Sprite Selection:</label>
    <el-select
      id="sprite-selection"
      :model-value="store.selectedIndex.value"
      @update:model-value="store.setSelectedIndex($event)"
      placeholder="Select a sprite"
      style="width: 300px"
    >
      <el-option
        v-for="(sprite, index) in CHARACTER_SPRITES"
        :key="index"
        :label="sprite.name"
        :value="index"
      />
    </el-select>
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

