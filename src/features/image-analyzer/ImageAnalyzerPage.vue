<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Search, Plus, Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const imageFile = ref<File | null>(null)
const imageUrl = ref<string>('')
const isAnalyzing = ref(false)
const imageWidth = ref<number>(0)
const imageHeight = ref<number>(0)
const cellWidth = ref<number>(0)
const cellHeight = ref<number>(0)
const adjustedCellSize = ref<number>(0)
const gridOffsetX = ref<number>(0)
const gridOffsetY = ref<number>(0)
const hasAnalyzed = ref<boolean>(false)

// Calculate display dimensions - scale up if image is less than 800px wide
const displayWidth = computed(() => {
  if (imageWidth.value === 0) return 800
  return Math.max(imageWidth.value, 800)
})

const displayHeight = computed(() => {
  if (imageWidth.value === 0 || imageHeight.value === 0) return 800
  // Preserve aspect ratio
  const scale = displayWidth.value / imageWidth.value
  return imageHeight.value * scale
})

// Calculate square overlay size, max 800x800 (for backward compatibility)
const overlayDisplaySize = computed(() => {
  if (imageWidth.value === 0 || imageHeight.value === 0) return 800
  const maxDimension = Math.max(displayWidth.value, displayHeight.value)
  return Math.min(maxDimension, 800)
})

const handleFileChange = (uploadFile: { raw?: File } | unknown) => {
  const file = (uploadFile as { raw?: File }).raw
  if (!file) return
  imageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
    // Load image to get dimensions immediately for preview scaling
    const img = new Image()
    img.onload = () => {
      imageWidth.value = img.width
      imageHeight.value = img.height
    }
    img.src = imageUrl.value
  }
  reader.readAsDataURL(file)
  hasAnalyzed.value = false
}

const analyzeImage = async () => {
  if (!imageFile.value) return

  isAnalyzing.value = true

  try {
    const img = new Image()
    img.src = imageUrl.value

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
    })

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

    hasAnalyzed.value = true
  } catch (error) {
    console.error('Error analyzing image:', error)
  } finally {
    isAnalyzing.value = false
  }
}

const increaseCellSize = () => {
  const oldCellSize = adjustedCellSize.value
  adjustedCellSize.value += 0.25
  // Adjust offset to keep center fixed (center is at line 9, index 8)
  const centerIndex = 8
  const delta = oldCellSize - adjustedCellSize.value
  gridOffsetX.value += centerIndex * delta
  gridOffsetY.value += centerIndex * delta
}

const decreaseCellSize = () => {
  if (adjustedCellSize.value > 0.25) {
    const oldCellSize = adjustedCellSize.value
    adjustedCellSize.value -= 0.25
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

// Get computed grid line colors from CSS variables
const getGridLineColor = (i: number): string => {
  if (typeof window === 'undefined') {
    // Fallback colors for SSR
    if (i === 1 || i === 17) return '#666600'
    if (i === 9) return '#00ff00'
    if (i === 5 || i === 13) return '#0000ff'
    return '#ff0000'
  }
  
  const root = document.documentElement
  const isDark = root.classList.contains('dark')
  
  if (i === 1 || i === 17) {
    return isDark ? '#999900' : '#666600'
  } else if (i === 9) {
    return isDark ? '#66ff66' : '#00ff00'
  } else if (i === 5 || i === 13) {
    return isDark ? '#6666ff' : '#0000ff'
  } else {
    return isDark ? '#ff6666' : '#ff0000'
  }
}
</script>

<template>
  <div class="image-analyzer-container">
    <div class="analyzer-header">
      <h1 class="analyzer-title">
        <el-icon><Search /></el-icon>
        Image Analyzer
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
        <img
          :src="imageUrl"
          alt="Uploaded image"
          class="preview-image"
          :style="{
            width: imageWidth > 0 ? `${displayWidth}px` : 'auto',
            height: imageHeight > 0 ? `${displayHeight}px` : 'auto',
            maxWidth: '100%',
            maxHeight: '90vh'
          }"
        />
      </div>

      <div v-if="hasAnalyzed" class="grid-overlay-section">
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
              width: imageWidth > 0 ? `${displayWidth}px` : '800px',
              height: imageHeight > 0 ? `${displayHeight}px` : '800px',
              maxWidth: '100%',
              maxHeight: '90vh'
            }"
          >
            <img
              :src="imageUrl"
              alt="Image with grid overlay"
              class="overlay-image"
              :style="{
                width: '100%',
                height: '100%'
              }"
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
                :stroke="getGridLineColor(i)"
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
                :stroke="getGridLineColor(i)"
                :stroke-width="i === 1 || i === 17 ? 3 : 1"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-analyzer-container {
  min-height: 100vh;
  background: var(--app-bg-color);
  padding: 2rem;
}

.analyzer-header {
  background: var(--app-bg-color-page);
  border-bottom: 1px solid var(--app-border-color-light);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: var(--app-box-shadow-base);
}

.analyzer-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--app-text-color-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.analyzer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.upload-section {
  background: var(--app-bg-color-page);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--app-box-shadow-base);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.analyze-button {
  margin-left: auto;
}

.image-preview {
  background: var(--app-bg-color-page);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--app-box-shadow-base);
  margin-bottom: 2rem;
  text-align: center;
}

.preview-image {
  border-radius: 4px;
  box-shadow: var(--app-box-shadow-light);
  object-fit: contain;
}

.grid-overlay-section {
  margin-bottom: 2rem;
  background: var(--app-bg-color-page);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--app-box-shadow-base);
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

.results-title {
  margin: 0 0 1.5rem 0;
  color: var(--app-text-color-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

/* Grid line colors - theme-aware */
:root {
  --grid-color-outer: #666600;
  --grid-color-middle: #00ff00;
  --grid-color-semi-middle: #0000ff;
  --grid-color-regular: #ff0000;
}

.dark {
  --grid-color-outer: #999900;
  --grid-color-middle: #66ff66;
  --grid-color-semi-middle: #6666ff;
  --grid-color-regular: #ff6666;
}
</style>

