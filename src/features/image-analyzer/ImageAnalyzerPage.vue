<script setup lang="ts">
import { computed,ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ColorBox from '@/features/sprite-viewer/components/ColorBox.vue'
import { GameBlock,GameLayout } from '@/shared/components/ui'
import { GameButton, GameButtonGroup, GameCodeQuote,GameUpload } from '@/shared/components/ui'

import { useGridManipulation } from './composables/useGridManipulation'
import { useImageAnalysis } from './composables/useImageAnalysis'
import { useColorCombinationColors,useGridLineColors } from './composables/useImageAnalyzerColors'

/**
 * ImageAnalyzerPage component - Page for analyzing images and generating sprite arrays.
 */
defineOptions({
  name: 'ImageAnalyzerPage'
})

const { t } = useI18n()

const imageFile = ref<File | null>(null)
const imageUrl = ref<string>('')

// Color extraction settings
const paletteType = ref<'background' | 'sprite'>('background')
const selectedPaletteCode = ref<number>(1) // Default to palette 1
const selectedColorCombination = ref<number>(0) // Default to combination 0

// Get available palette codes based on palette type
const availablePaletteCodes = computed(() => {
  return paletteType.value === 'sprite' ? 3 : 2
})

// Reset palette code when switching types if current code is out of range
const updatePaletteType = (type: 'background' | 'sprite') => {
  paletteType.value = type
  if (type === 'background' && selectedPaletteCode.value >= 2) {
    selectedPaletteCode.value = 1
  } else if (type === 'sprite' && selectedPaletteCode.value >= 3) {
    selectedPaletteCode.value = 0
  }
}

// Use composables
const {
  isAnalyzing,
  hasAnalyzed,
  generatedArray,
  imageWidth,
  imageHeight,
  analyzeImage: analyzeImageComposable,
  generateArray: generateArrayComposable
} = useImageAnalysis()

const {
  adjustedCellSize,
  gridOffsetX,
  gridOffsetY,
  increaseCellSize,
  decreaseCellSize,
  moveGridUp,
  moveGridDown,
  moveGridLeft,
  moveGridRight
} = useGridManipulation()

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

const analyzeImage = async (): Promise<void> => {
  if (!imageFile.value) return
  await analyzeImageComposable(imageUrl.value, adjustedCellSize, gridOffsetX, gridOffsetY)
}

// Use color-related composables
const { getGridLineColor } = useGridLineColors()
const { selectedColorCombinationColors } = useColorCombinationColors(
  paletteType,
  selectedPaletteCode,
  selectedColorCombination
)

const generateArray = async (): Promise<void> => {
  if (!imageUrl.value || !hasAnalyzed.value) return
  await generateArrayComposable(
    imageUrl.value,
    imageWidth.value,
    imageHeight.value,
    adjustedCellSize.value,
    gridOffsetX.value,
    gridOffsetY.value,
    t('imageAnalyzer.generated.error'),
    paletteType.value,
    selectedPaletteCode.value,
    selectedColorCombination.value
  )
}
</script>

<template>
  <GameLayout>
    <div class="image-analyzer-container">

    <div class="analyzer-content">
      <div class="upload-section">
        <GameUpload
          accept="image/*"
          @change="handleFileChange"
        >
          <GameButton type="primary" icon="mdi:upload">
            {{ t('imageAnalyzer.buttons.uploadImage') }}
          </GameButton>
        </GameUpload>

        <GameButton
          type="success"
          icon="mdi:magnify"
          :disabled="!imageFile || isAnalyzing"
          :loading="isAnalyzing"
          @click="analyzeImage"
          class="analyze-button"
        >
          {{ isAnalyzing ? t('imageAnalyzer.buttons.analyzing') : t('imageAnalyzer.buttons.analyze') }}
        </GameButton>
      </div>

      <GameBlock
        v-if="imageFile"
        :title="t('imageAnalyzer.colorSettings.title')"
        class="color-settings-block"
      >
        <div class="color-settings-controls">
          <div class="control-group">
            <label for="palette-type">{{ t('imageAnalyzer.colorSettings.paletteType') }}</label>
            <GameButtonGroup>
              <GameButton
                variant="toggle"
                :selected="paletteType === 'background'"
                @click="updatePaletteType('background')"
              >
                {{ t('imageAnalyzer.colorSettings.paletteTypeBackground') }}
              </GameButton>
              <GameButton
                variant="toggle"
                :selected="paletteType === 'sprite'"
                @click="updatePaletteType('sprite')"
              >
                {{ t('imageAnalyzer.colorSettings.paletteTypeSprite') }}
              </GameButton>
            </GameButtonGroup>
          </div>
          <div class="control-group">
            <label for="palette-code">{{ t('imageAnalyzer.colorSettings.paletteCode') }}</label>
            <GameButtonGroup>
              <GameButton
                v-for="paletteIdx in availablePaletteCodes"
                :key="paletteIdx - 1"
                variant="toggle"
                :selected="selectedPaletteCode === paletteIdx - 1"
                @click="selectedPaletteCode = paletteIdx - 1"
              >
                {{ paletteIdx - 1 }}
              </GameButton>
            </GameButtonGroup>
          </div>
          <div class="control-group">
            <label for="color-combination">{{ t('imageAnalyzer.colorSettings.colorCombination') }}</label>
            <GameButtonGroup>
              <GameButton
                v-for="combIdx in 4"
                :key="combIdx - 1"
                variant="toggle"
                :selected="selectedColorCombination === combIdx - 1"
                @click="selectedColorCombination = combIdx - 1"
              >
                {{ combIdx - 1 }}
              </GameButton>
            </GameButtonGroup>
          </div>
        </div>
        <div class="color-preview">
          <div
            v-for="(colorCode, idx) in selectedColorCombinationColors"
            :key="idx"
            class="preview-color-wrapper"
          >
            <ColorBox :color-code="colorCode" />
          </div>
        </div>
      </GameBlock>

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

      <GameBlock 
        v-if="hasAnalyzed"
        :title="t('imageAnalyzer.grid.title')"
        class="grid-overlay-section"
      >
        <template #right>
          <div class="grid-controls">
            <GameButtonGroup>
              <GameButton size="small" icon="mdi:plus" @click="increaseCellSize" />
              <GameButton size="small" icon="mdi:minus" @click="decreaseCellSize" />
            </GameButtonGroup>
            <GameButtonGroup>
              <GameButton size="small" icon="mdi:chevron-up" @click="moveGridUp" />
              <GameButton size="small" icon="mdi:chevron-down" @click="moveGridDown" />
              <GameButton size="small" icon="mdi:chevron-left" @click="moveGridLeft" />
              <GameButton size="small" icon="mdi:chevron-right" @click="moveGridRight" />
            </GameButtonGroup>
            <GameButton size="small" @click="generateArray">
              G
            </GameButton>
          </div>
        </template>
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
      </GameBlock>

      <GameBlock
        v-if="generatedArray && generatedArray.length > 0"
        :title="t('imageAnalyzer.generated.title')"
        title-icon="mdi:code-array"
        class="generated-array-block"
      >
        <GameCodeQuote
          :code="generatedArray"
          :copy-success-message="t('imageAnalyzer.generated.copySuccess')"
        />
      </GameBlock>
    </div>
    </div>
  </GameLayout>
</template>

<style scoped>
.image-analyzer-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.analyzer-content {
  flex: 1 1 0;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem;
}

.upload-section {
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: var(--game-shadow-base);
  display: flex;
  gap: 1rem;
  align-items: center;
  position: relative;
}

.upload-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-glow) 50%, 
    transparent 100%
  );
  opacity: 0.5;
  border-radius: 12px 12px 0 0;
}

.analyze-button {
  margin-left: auto;
}

.image-preview {
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: var(--game-shadow-base);
  text-align: center;
  position: relative;
}

.image-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-glow) 50%, 
    transparent 100%
  );
  opacity: 0.5;
  border-radius: 12px 12px 0 0;
}

.preview-image {
  border-radius: 6px;
  box-shadow: 0 4px 12px var(--base-alpha-gray-00-30);
  object-fit: contain;
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

.generated-array-block {
  margin-top: 1rem;
}

.color-settings-block {
  margin-top: 1rem;
}

.color-settings-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group label {
  font-weight: 600;
  color: var(--game-text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
}

.color-preview {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--game-surface-border);
}

.preview-color-wrapper {
  width: 60px;
  height: 60px;
}
</style>
