<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Search, Plus, Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import GameNavigation from '../../shared/components/GameNavigation.vue'
import { GameButton, GameButtonGroup, GameUpload, GameIcon } from '../../shared/components/ui'

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
const generatedArray = ref<string>('')

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

const handleFileChange = (file: File | File[]) => {
  const selectedFile = Array.isArray(file) ? file[0] : file
  if (!selectedFile) return
  imageFile.value = selectedFile
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
  reader.readAsDataURL(selectedFile)
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

// Color mapping: black=0, white=1, red=2, blue=3
const classifyColor = (r: number, g: number, b: number): number => {
  // Calculate luminance for black/white detection
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Check if it's blue FIRST (before black/white check, as blue can have low luminance)
  // Blue: high blue component relative to red and green
  if (b > r * 1.3 && b > g * 1.3 && b > 80) {
    return 3 // blue
  }
  
  // Check if it's red (high red, low green and blue)
  if (r > g * 1.5 && r > b * 1.5 && r > 100) {
    return 2 // red
  }
  
  // Check if it's white (high luminance, low saturation)
  if (luminance > 0.7) {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    if (saturation < 0.3) {
      return 1 // white
    }
  }
  
  // Check if it's black (low luminance, and not blue/red)
  if (luminance < 0.3) {
    return 0 // black
  }
  
  // Default: classify by dominant color
  if (b > r && b > g && b > 50) return 3 // blue
  if (r > g && r > b && r > 50) return 2 // red
  if (luminance > 0.5) return 1 // white
  return 0 // black
}

const generateArray = async () => {
  if (!imageUrl.value || !hasAnalyzed.value) return
  
  try {
    const img = new Image()
    img.src = imageUrl.value
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
    })
    
    // Create canvas to sample pixels
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    // Generate 4 separate 8x8 arrays (one for each quadrant of the 16x16 grid)
    const gridSize = 8
    const arrays: number[][][] = [[], [], [], []]
    
    // Generate array for each quadrant
    for (let quadrant = 0; quadrant < 4; quadrant++) {
      const quadrantRow = Math.floor(quadrant / 2) // 0 or 1
      const quadrantCol = quadrant % 2 // 0 or 1
      
      for (let row = 0; row < gridSize; row++) {
        const rowArray: number[] = []
        for (let col = 0; col < gridSize; col++) {
          // Calculate cell position in the 16x16 grid
          const globalRow = quadrantRow * gridSize + row
          const globalCol = quadrantCol * gridSize + col
          
          // Calculate cell boundaries in original image coordinates
          const cellStartX = gridOffsetX.value + globalCol * adjustedCellSize.value
          const cellStartY = gridOffsetY.value + globalRow * adjustedCellSize.value
          
          // Sample pixels in the cell (sample center and corners)
          const samplePoints = [
            [cellStartX + adjustedCellSize.value / 2, cellStartY + adjustedCellSize.value / 2], // center
            [cellStartX + adjustedCellSize.value * 0.25, cellStartY + adjustedCellSize.value * 0.25], // top-left
            [cellStartX + adjustedCellSize.value * 0.75, cellStartY + adjustedCellSize.value * 0.25], // top-right
            [cellStartX + adjustedCellSize.value * 0.25, cellStartY + adjustedCellSize.value * 0.75], // bottom-left
            [cellStartX + adjustedCellSize.value * 0.75, cellStartY + adjustedCellSize.value * 0.75], // bottom-right
          ]
          
          const colors: number[] = []
          for (const point of samplePoints) {
            const x = point[0] ?? 0
            const y = point[1] ?? 0
            const pixelX = Math.floor(Math.max(0, Math.min(x, imageWidth.value - 1)))
            const pixelY = Math.floor(Math.max(0, Math.min(y, imageHeight.value - 1)))
            const index = (pixelY * imageWidth.value + pixelX) * 4
            
            if (index + 2 >= imageData.data.length) continue
            
            const r = imageData.data[index] ?? 0
            const g = imageData.data[index + 1] ?? 0
            const b = imageData.data[index + 2] ?? 0
            
            colors.push(classifyColor(r, g, b))
          }
          
          // Use most common color in the cell, default to 0 if no samples
          if (colors.length === 0) {
            rowArray.push(0)
          } else {
            const colorCounts = [0, 0, 0, 0]
            colors.forEach(color => {
              const colorIndex = typeof color === 'number' && color >= 0 && color <= 3 ? color : 0
              if (colorCounts[colorIndex] !== undefined) {
                colorCounts[colorIndex]++
              }
            })
            const maxCount = Math.max(...colorCounts)
            const dominantColor = colorCounts.indexOf(maxCount)
            rowArray.push(dominantColor >= 0 ? dominantColor : 0)
          }
        }
        const quadrantArray = arrays[quadrant]
        if (quadrantArray) {
          quadrantArray.push(rowArray)
        }
      }
    }
    
    // Format as 4 separate const declarations
    const arrayStrings = arrays.map((array, index) => {
      if (!array) return ''
      const arrayString = array.map(row => `  [${row?.join(',') ?? ''}]`).join(',\n')
      const tileNames = ['_0', '_1', '_2', '_3']
      return `const SPRITE_ARRAY${tileNames[index]} = [\n${arrayString}\n]`
    }).filter(str => str !== '')
    
    generatedArray.value = arrayStrings.join('\n\n')
  } catch (error) {
    console.error('Error generating array:', error)
    generatedArray.value = 'Error generating array'
  }
}
</script>

<template>
  <div class="image-analyzer-container">
    <GameNavigation />
    <div class="analyzer-header">
      <h1 class="analyzer-title">
        <GameIcon :icon="Search" />
        Image Analyzer
      </h1>
    </div>

    <div class="analyzer-content">
      <div class="upload-section">
        <GameUpload
          accept="image/*"
          @change="handleFileChange"
        >
          <GameButton type="primary" :icon="Upload">
            Upload Image
          </GameButton>
        </GameUpload>

        <GameButton
          type="success"
          :icon="Search"
          :disabled="!imageFile || isAnalyzing"
          :loading="isAnalyzing"
          @click="analyzeImage"
          class="analyze-button"
        >
          {{ isAnalyzing ? 'Analyzing...' : 'Analyze' }}
        </GameButton>
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
            <GameButtonGroup>
              <GameButton size="small" :icon="Plus" @click="increaseCellSize" title="Increase cell size" />
              <GameButton size="small" :icon="Minus" @click="decreaseCellSize" title="Decrease cell size" />
            </GameButtonGroup>
            <GameButtonGroup>
              <GameButton size="small" :icon="ArrowUp" @click="moveGridUp" title="Move grid up" />
              <GameButton size="small" :icon="ArrowDown" @click="moveGridDown" title="Move grid down" />
              <GameButton size="small" :icon="ArrowLeft" @click="moveGridLeft" title="Move grid left" />
              <GameButton size="small" :icon="ArrowRight" @click="moveGridRight" title="Move grid right" />
            </GameButtonGroup>
            <GameButton size="small" @click="generateArray" title="Generate 8x8 array">
              G
            </GameButton>
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
        <div v-if="generatedArray" class="generated-array-section">
          <h3 class="array-title">Generated 8x8 Array</h3>
          <GameTextarea
            :model-value="generatedArray"
            :rows="12"
            :readonly="true"
            class="array-textarea"
          />
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

.generated-array-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--app-border-color-light);
}

.array-title {
  margin: 0 0 1rem 0;
  color: var(--app-text-color-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.array-textarea {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.array-textarea :deep(.el-textarea__inner) {
  background: var(--app-bg-color);
  color: var(--app-text-color-primary);
  border: 1px solid var(--app-border-color-light);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>

