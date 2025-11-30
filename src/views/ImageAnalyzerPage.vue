<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Search, Plus, Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const imageFile = ref<File | null>(null)
const imageUrl = ref<string>('')
const grayLevels = ref<number[][]>([])
const isAnalyzing = ref(false)
const imageWidth = ref<number>(0)
const imageHeight = ref<number>(0)
const cellWidth = ref<number>(0)
const cellHeight = ref<number>(0)
const adjustedCellSize = ref<number>(0)
const gridOffsetX = ref<number>(0)
const gridOffsetY = ref<number>(0)

// Calculate square overlay size, max 800x800
const overlayDisplaySize = computed(() => {
  if (imageWidth.value === 0 || imageHeight.value === 0) return 800
  const maxDimension = Math.max(imageWidth.value, imageHeight.value)
  return Math.min(maxDimension, 800)
})

const handleFileChange = (uploadFile: { raw?: File } | unknown) => {
  const file = (uploadFile as { raw?: File }).raw
  if (!file) return
  imageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  grayLevels.value = []
}

const calculateAverageGrayLevel = (
  imageData: ImageData,
  startX: number,
  startY: number,
  width: number,
  height: number
): number => {
  let totalGray = 0
  let pixelCount = 0

  for (let y = startY; y < startY + height && y < imageData.height; y++) {
    for (let x = startX; x < startX + width && x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4
      const r = imageData.data[index] ?? 0
      const g = imageData.data[index + 1] ?? 0
      const b = imageData.data[index + 2] ?? 0
      // Convert RGB to grayscale using standard formula
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      totalGray += gray
      pixelCount++
    }
  }

  return pixelCount > 0 ? Math.round(totalGray / pixelCount) : 0
}

const analyzeImage = async () => {
  if (!imageFile.value) return

  isAnalyzing.value = true
  grayLevels.value = []

  try {
    const img = new Image()
    img.src = imageUrl.value

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, img.width, img.height)

    const gridSize = 16
    const calculatedCellWidth = Math.floor(img.width / gridSize)
    const calculatedCellHeight = Math.floor(img.height / gridSize)

    // Store dimensions for grid overlay
    imageWidth.value = img.width
    imageHeight.value = img.height
    cellWidth.value = calculatedCellWidth
    cellHeight.value = calculatedCellHeight
    // Use average cell size for uniform grid spacing
    adjustedCellSize.value = (calculatedCellWidth + calculatedCellHeight) / 2
    gridOffsetX.value = 0
    gridOffsetY.value = 0

    const results: number[][] = []

    for (let row = 0; row < gridSize; row++) {
      const rowResults: number[] = []
      for (let col = 0; col < gridSize; col++) {
        const startX = col * calculatedCellWidth
        const startY = row * calculatedCellHeight
        const width = col === gridSize - 1 ? img.width - startX : calculatedCellWidth
        const height = row === gridSize - 1 ? img.height - startY : calculatedCellHeight

        const avgGray = calculateAverageGrayLevel(
          imageData,
          startX,
          startY,
          width,
          height
        )
        rowResults.push(avgGray)
      }
      results.push(rowResults)
    }

    grayLevels.value = results
  } catch (error) {
    console.error('Error analyzing image:', error)
  } finally {
    isAnalyzing.value = false
  }
}

const increaseCellSize = () => {
  const oldCellSize = adjustedCellSize.value
  adjustedCellSize.value += 0.5
  // Adjust offset to keep center fixed (center is at line 9, index 8)
  const centerIndex = 8
  const delta = oldCellSize - adjustedCellSize.value
  gridOffsetX.value += centerIndex * delta
  gridOffsetY.value += centerIndex * delta
}

const decreaseCellSize = () => {
  if (adjustedCellSize.value > 0.5) {
    const oldCellSize = adjustedCellSize.value
    adjustedCellSize.value -= 0.5
    // Adjust offset to keep center fixed (center is at line 9, index 8)
    const centerIndex = 8
    const delta = oldCellSize - adjustedCellSize.value
    gridOffsetX.value += centerIndex * delta
    gridOffsetY.value += centerIndex * delta
  }
}

const moveGridUp = () => {
  gridOffsetY.value -= 0.5
}

const moveGridDown = () => {
  gridOffsetY.value += 0.5
}

const moveGridLeft = () => {
  gridOffsetX.value -= 0.5
}

const moveGridRight = () => {
  gridOffsetX.value += 0.5
}
</script>

<template>
  <div class="image-analyzer-container">
    <div class="analyzer-header">
      <h1 class="analyzer-title">
        <el-icon><Search /></el-icon>
        Image Gray Level Analyzer
      </h1>
    </div>

    <div class="analyzer-content">
      <div class="upload-section">
        <el-upload
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept="image/*"
          class="upload-area"
        >
          <template #trigger>
            <el-button type="primary" :icon="Upload">
              Upload Image
            </el-button>
          </template>
        </el-upload>

        <el-button
          type="success"
          :icon="Search"
          :disabled="!imageFile || isAnalyzing"
          :loading="isAnalyzing"
          @click="analyzeImage"
          class="analyze-button"
        >
          {{ isAnalyzing ? 'Analyzing...' : 'Analyze' }}
        </el-button>
      </div>

      <div v-if="imageUrl" class="image-preview">
        <img :src="imageUrl" alt="Uploaded image" class="preview-image" />
      </div>

      <div v-if="grayLevels.length > 0" class="output-panels">
        <div class="grid-overlay-section">
          <div class="grid-controls-header">
            <h2 class="results-title">Image with Grid Overlay</h2>
            <div class="grid-controls">
              <el-button-group size="small">
                <el-button :icon="Plus" @click="increaseCellSize" title="Increase cell size" />
                <el-button :icon="Minus" @click="decreaseCellSize" title="Decrease cell size" />
              </el-button-group>
              <el-button-group size="small">
                <el-button :icon="ArrowUp" @click="moveGridUp" title="Move grid up" />
                <el-button :icon="ArrowDown" @click="moveGridDown" title="Move grid down" />
                <el-button :icon="ArrowLeft" @click="moveGridLeft" title="Move grid left" />
                <el-button :icon="ArrowRight" @click="moveGridRight" title="Move grid right" />
              </el-button-group>
            </div>
          </div>
          <div class="grid-overlay-container">
            <div
              class="image-wrapper"
              :style="{
                width: `${overlayDisplaySize}px`,
                height: `${overlayDisplaySize}px`,
                maxWidth: '100%',
                maxHeight: '90vh'
              }"
            >
              <img
                :src="imageUrl"
                alt="Image with grid overlay"
                class="overlay-image"
              />
              <svg
                class="grid-overlay"
                :viewBox="`0 0 ${imageWidth} ${imageHeight}`"
                preserveAspectRatio="none"
              >
                <!-- Vertical grid lines -->
                <line
                  v-for="i in 17"
                  :key="`v-${i}`"
                  :x1="gridOffsetX + (i - 1) * adjustedCellSize"
                  :y1="0"
                  :x2="gridOffsetX + (i - 1) * adjustedCellSize"
                  :y2="imageHeight"
                  :stroke="i === 1 || i === 17 ? '#666600' : i === 9 ? '#00ff00' : i === 5 || i === 13 ? '#0000ff' : '#ff0000'"
                  :stroke-width="i === 1 || i === 17 ? 3 : 1"
                  opacity="0.6"
                />
                <!-- Horizontal grid lines -->
                <line
                  v-for="i in 17"
                  :key="`h-${i}`"
                  :x1="0"
                  :y1="gridOffsetY + (i - 1) * adjustedCellSize"
                  :x2="imageWidth"
                  :y2="gridOffsetY + (i - 1) * adjustedCellSize"
                  :stroke="i === 1 || i === 17 ? '#666600' : i === 9 ? '#00ff00' : i === 5 || i === 13 ? '#0000ff' : '#ff0000'"
                  :stroke-width="i === 1 || i === 17 ? 3 : 1"
                  opacity="0.6"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="results-section">
          <h2 class="results-title">Gray Level Grid (16×16)</h2>
          <div class="grid-container">
            <div
              v-for="(row, rowIndex) in grayLevels"
              :key="rowIndex"
              class="grid-row"
            >
              <div
                v-for="(grayLevel, colIndex) in row"
                :key="colIndex"
                class="grid-cell"
                :style="{
                  backgroundColor: `rgb(${grayLevel}, ${grayLevel}, ${grayLevel})`,
                  color: grayLevel < 128 ? '#fff' : '#000'
                }"
                :title="`Row ${rowIndex + 1}, Col ${colIndex + 1}: ${grayLevel}`"
              >
                {{ grayLevel }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-analyzer-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.analyzer-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analyzer-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #303133;
  font-size: 1.5rem;
  font-weight: 600;
}

.analyzer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.upload-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.analyze-button {
  margin-left: auto;
}

.image-preview {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.output-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.grid-overlay-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.grid-controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.grid-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.grid-overlay-container {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.image-wrapper {
  position: relative;
  display: inline-block;
}

.overlay-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.results-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.results-title {
  margin: 0 0 1.5rem 0;
  color: #303133;
  font-size: 1.25rem;
  font-weight: 600;
}

.grid-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #e4e7ed;
  padding: 2px;
  border-radius: 4px;
  overflow-x: auto;
}

.grid-row {
  display: flex;
  gap: 2px;
}

.grid-cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.1s;
}

.grid-cell:hover {
  transform: scale(1.05);
  z-index: 1;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>

