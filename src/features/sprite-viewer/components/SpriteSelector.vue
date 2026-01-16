<script setup lang="ts">
import { computed } from 'vue'
import { CHARACTER_SPRITES } from '../../../shared/data/sprites'
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'
import { GameSelect } from '../../../shared/components/ui'

const store = useSpriteViewerStore()

const selectOptions = computed(() => {
  return CHARACTER_SPRITES.map((sprite, index) => ({
    label: sprite.name,
    value: index
  }))
})
</script>

<template>
  <div class="control-group">
    <label for="sprite-selection">Sprite Selection:</label>
    <GameSelect
      id="sprite-selection"
      :model-value="store.selectedIndex.value"
      @update:model-value="store.setSelectedIndex($event)"
      :options="selectOptions"
      placeholder="Select a sprite"
      style="width: 300px"
    />
  </div>
</template>

<style scoped>
.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.control-group label {
  font-weight: 600;
  color: var(--game-text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>

