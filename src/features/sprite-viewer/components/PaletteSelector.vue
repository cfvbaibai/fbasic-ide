<script setup lang="ts">
import { useSpriteViewerStore } from '../composables/useSpriteViewerStore'
import ColorBox from './ColorBox.vue'

const store = useSpriteViewerStore()
</script>

<template>
  <div class="control-group" v-if="store.selectedSprite.value">
    <label for="palette-code">Palette Code:</label>
    <el-button-group>
      <el-button
        v-for="paletteIdx in 3"
        :key="paletteIdx - 1"
        :type="store.selectedPaletteCode.value === paletteIdx - 1 ? 'primary' : 'default'"
        @click="store.setPaletteCode(paletteIdx - 1)"
      >
        {{ paletteIdx - 1 }}
      </el-button>
    </el-button-group>
    <label for="color-combination">Color Combination:</label>
    <el-button-group>
      <el-button
        v-for="combIdx in 4"
        :key="combIdx - 1"
        :type="store.selectedColorCombination.value === combIdx - 1 ? 'primary' : 'default'"
        @click="store.setColorCombination(combIdx - 1)"
      >
        {{ combIdx - 1 }}
      </el-button>
    </el-button-group>
    <div class="selected-colors-preview">
      <div
        v-for="(colorCode, idx) in store.selectedColorCombinationColors.value"
        :key="idx"
        class="preview-color-wrapper"
      >
        <ColorBox :color-code="colorCode" />
      </div>
    </div>
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

.selected-colors-preview {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-left: 1rem;
}

.preview-color-wrapper {
  width: 50px;
  height: 50px;
}
</style>

