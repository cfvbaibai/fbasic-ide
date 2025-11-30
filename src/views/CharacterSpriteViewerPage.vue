<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CHARACTER_SPRITES, type SpriteDefinition } from '../data/sprites'
import { COLORS, SPRITE_PALETTES, BACKGROUND_PALETTES } from '../data/palette'
import ColorBox from '../components/ColorBox.vue'

const selectedIndex = ref<number>(0)
const showValues = ref<boolean>(false)
const showGridLines = ref<boolean>(false)
const selectedPaletteCode = ref<number>(0)
const selectedColorCombination = ref<number>(0)

// Get the selected sprite definition
const selectedSprite = computed(() => {
  if (selectedIndex.value >= 0 && selectedIndex.value < CHARACTER_SPRITES.length) {
    return CHARACTER_SPRITES[selectedIndex.value] ?? null
  }
  return null
})

// Update palette and color combination when sprite changes
const updateDefaults = () => {
  if (selectedSprite.value) {
    selectedPaletteCode.value = selectedSprite.value.defaultPaletteCode
    selectedColorCombination.value = selectedSprite.value.defaultColorCombination
  }
}

// Watch for sprite changes to update defaults
watch(selectedSprite, () => {
  updateDefaults()
}, { immediate: true })

// Combine 4 8x8 tiles into a 16x16 grid
const sprite16x16 = computed(() => {
  const grid: number[][] = Array(16).fill(null).map(() => Array(16).fill(0) as number[])
  
  if (!selectedSprite.value) {
    return grid
  }
  
  // Get the 4 tiles from the sprite definition
  const tiles = selectedSprite.value.tiles
  const tile0 = tiles[0]
  const tile1 = tiles[1]
  const tile2 = tiles[2]
  const tile3 = tiles[3]
  
  // Copy tile 0 (top-left) to positions [0-7, 0-7]
  if (tile0) {
    for (let row = 0; row < 8 && row < tile0.length; row++) {
      const tileRow = tile0[row]
      if (tileRow) {
        for (let col = 0; col < 8 && col < tileRow.length; col++) {
          const value: number | undefined = tileRow[col]
          if (value !== undefined && grid[row]) {
            grid[row]![col] = value
          }
        }
      }
    }
  }
  
  // Copy tile 1 (top-right) to positions [0-7, 8-15]
  if (tile1) {
    for (let row = 0; row < 8 && row < tile1.length; row++) {
      const tileRow = tile1[row]
      if (tileRow) {
        for (let col = 0; col < 8 && col < tileRow.length; col++) {
          const value: number | undefined = tileRow[col]
          if (value !== undefined && grid[row]) {
            grid[row]![col + 8] = value
          }
        }
      }
    }
  }
  
  // Copy tile 2 (bottom-left) to positions [8-15, 0-7]
  if (tile2) {
    for (let row = 0; row < 8 && row < tile2.length; row++) {
      const tileRow = tile2[row]
      if (tileRow) {
        for (let col = 0; col < 8 && col < tileRow.length; col++) {
          const value: number | undefined = tileRow[col]
          if (value !== undefined && grid[row + 8]) {
            grid[row + 8]![col] = value
          }
        }
      }
    }
  }
  
  // Copy tile 3 (bottom-right) to positions [8-15, 8-15]
  if (tile3) {
    for (let row = 0; row < 8 && row < tile3.length; row++) {
      const tileRow = tile3[row]
      if (tileRow) {
        for (let col = 0; col < 8 && col < tileRow.length; col++) {
          const value: number | undefined = tileRow[col]
          if (value !== undefined && grid[row + 8]) {
            grid[row + 8]![col + 8] = value
          }
        }
      }
    }
  }
  
  return grid
})

// Calculate max valid index
const maxIndex = computed(() => {
  return Math.max(0, CHARACTER_SPRITES.length - 1)
})

// Get background color based on sprite value using selected palette and color combination
const getCellColor = (value: number): string => {
  if (value === 0) {
    return 'transparent'
  }
  
  // Get the color combination from the selected palette
  const palette = SPRITE_PALETTES[selectedPaletteCode.value]
  if (!palette) {
    return 'transparent'
  }
  
  const colorCombination = palette[selectedColorCombination.value]
  if (!colorCombination) {
    return 'transparent'
  }
  
  // Map sprite value to color combination index:
  // value 1 -> C2 (index 1)
  // value 2 -> C3 (index 2)
  // value 3 -> C4 (index 3)
  const colorIndex = value
  if (colorIndex >= 1 && colorIndex <= 3) {
    const colorCode = colorCombination[colorIndex]
    if (colorCode !== undefined && colorCode >= 0 && colorCode < COLORS.length) {
      return COLORS[colorCode] ?? 'transparent'
    }
  }
  
  return 'transparent'
}

// Get the selected color combination colors (excluding index 0)
const selectedColorCombinationColors = computed(() => {
  const palette = SPRITE_PALETTES[selectedPaletteCode.value]
  if (!palette) {
    return []
  }
  
  const colorCombination = palette[selectedColorCombination.value]
  if (!colorCombination) {
    return []
  }
  
  // Return colors at indices 1, 2, 3 (skip index 0)
  return [
    colorCombination[1],
    colorCombination[2],
    colorCombination[3]
  ].filter((code): code is number => code !== undefined)
})

</script>

<template>
  <div class="sprite-viewer-container">
    <div class="viewer-header">
      <h1 class="viewer-title">Character Sprite Viewer</h1>
    </div>

    <div class="viewer-content">
      <div class="controls-section">
        <div class="control-group">
          <label for="sprite-selection">Sprite Selection:</label>
          <el-select
            id="sprite-selection"
            v-model="selectedIndex"
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
        <div class="control-group">
          <label for="show-values">Show Value Numbers:</label>
          <el-switch
            id="show-values"
            v-model="showValues"
          />
        </div>
        <div class="control-group">
          <label for="show-grid-lines">Show Grid Lines:</label>
          <el-switch
            id="show-grid-lines"
            v-model="showGridLines"
          />
        </div>
        <div class="control-group" v-if="selectedSprite">
          <label for="palette-code">Palette Code:</label>
          <el-input-number
            id="palette-code"
            v-model="selectedPaletteCode"
            :min="0"
            :max="2"
            :step="1"
            controls-position="right"
          />
          <label for="color-combination">Color Combination:</label>
          <el-input-number
            id="color-combination"
            v-model="selectedColorCombination"
            :min="0"
            :max="3"
            :step="1"
            controls-position="right"
          />
          <div class="selected-colors-preview">
            <div
              v-for="(colorCode, idx) in selectedColorCombinationColors"
              :key="idx"
              class="preview-color-wrapper"
            >
              <ColorBox :color-code="colorCode" />
            </div>
          </div>
        </div>
      </div>

      <div class="sprite-display-section">
        <h2 class="section-title">
          <span v-if="selectedSprite">
            {{ selectedSprite.name }} - 16×16 Sprite
          </span>
          <span v-else>
            16×16 Sprite
          </span>
        </h2>
        <div class="grid-container">
          <div
            v-for="(row, rowIndex) in sprite16x16"
            :key="rowIndex"
            class="grid-row"
          >
            <div
              v-for="(value, colIndex) in row"
              :key="colIndex"
              class="grid-cell"
              :class="{ 'grid-cell-bordered': showGridLines }"
              :style="{
                backgroundColor: getCellColor(value)
              }"
              :title="`Row ${rowIndex}, Col ${colIndex}: Value ${value}`"
            >
              <span v-if="showValues" class="cell-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="palette-section">
        <h2 class="section-title">64 Color Palette (4×16 Grid)</h2>
        <div class="palette-container">
          <div
            v-for="row in 4"
            :key="row"
            class="palette-row"
          >
            <div
              v-for="col in 16"
              :key="col"
              class="palette-color-wrapper"
            >
              <ColorBox :color-code="(row - 1) * 16 + (col - 1)" />
            </div>
          </div>
        </div>
      </div>

      <div class="palette-section">
        <h2 class="section-title">Sprite Palettes</h2>
        <div class="palettes-container palettes-container-sprite">
          <div
            v-for="(palette, paletteIndex) in SPRITE_PALETTES"
            :key="`sprite-${paletteIndex}`"
            class="palette-group"
          >
            <h3 class="palette-group-title">Sprite Palette {{ paletteIndex }}</h3>
            <div class="color-combinations">
              <div
                v-for="(combination, combIndex) in palette"
                :key="`sprite-${paletteIndex}-${combIndex}`"
                class="color-combination"
              >
                <div class="combination-colors">
                  <template
                    v-for="(colorCode, colorIndex) in combination"
                    :key="`sprite-${paletteIndex}-${combIndex}-${colorIndex}`"
                  >
                    <div
                      v-if="colorIndex > 0"
                      class="combination-color-wrapper"
                    >
                      <ColorBox :color-code="colorCode" />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="palette-section">
        <h2 class="section-title">Background Palettes</h2>
        <div class="palettes-container palettes-container-bg">
          <div
            v-for="(palette, paletteIndex) in BACKGROUND_PALETTES"
            :key="`bg-${paletteIndex}`"
            class="palette-group"
          >
            <h3 class="palette-group-title">Background Palette {{ paletteIndex }}</h3>
            <div class="color-combinations">
              <div
                v-for="(combination, combIndex) in palette"
                :key="`bg-${paletteIndex}-${combIndex}`"
                class="color-combination"
              >
                <div class="combination-colors">
                  <template
                    v-for="(colorCode, colorIndex) in combination"
                    :key="`bg-${paletteIndex}-${combIndex}-${colorIndex}`"
                  >
                    <div
                      v-if="colorIndex > 0"
                      class="combination-color-wrapper"
                    >
                      <ColorBox :color-code="colorCode" />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sprite-viewer-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.viewer-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.viewer-title {
  margin: 0;
  color: #303133;
  font-size: 1.5rem;
  font-weight: 600;
}

.viewer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.controls-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group label {
  font-weight: 500;
  color: #606266;
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

.index-info {
  color: #909399;
  font-size: 0.875rem;
}

.sprite-display-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: #303133;
  font-size: 1.25rem;
  font-weight: 600;
}

.grid-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #e4e7ed;
  padding: 0;
  border-radius: 4px;
  width: fit-content;
  margin: 0 auto;
}

.grid-row {
  display: flex;
  gap: 0;
}

.grid-cell {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0;
  background-color: #fff;
  transition: transform 0.1s;
}

.grid-cell-bordered {
  border: 1px solid #dcdfe6;
}

.grid-cell:hover {
  transform: scale(1.1);
  z-index: 1;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.cell-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: #606266;
  user-select: none;
}

.palette-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.palette-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 100%;
  overflow-x: auto;
}

.palette-row {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 8px;
  min-width: fit-content;
}

.palette-color-wrapper {
  width: 60px;
  height: 60px;
}


.palettes-container {
  display: grid;
  gap: 1.5rem;
}

.palettes-container-sprite {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.palettes-container-bg {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.palette-group {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.palette-group-title {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.1rem;
  font-weight: 600;
}

.color-combinations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.color-combination {
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.combination-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #606266;
  margin-bottom: 0.5rem;
}

.combination-colors {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: stretch;
  flex-wrap: nowrap;
}

.combination-color-wrapper {
  flex: 1;
  min-width: 50px;
  height: 50px;
}

.combination-color-wrapper {
  flex: 1;
  min-width: 50px;
  height: 50px;
}

</style>

