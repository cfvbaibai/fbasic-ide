<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { SharedDisplayViews } from '@/core/animation/sharedDisplayBuffer'
import type { ScreenCell } from '@/core/interfaces'
import type { MovementState, SpriteState } from '@/core/sprite/types'
import { provideScreenZoom } from '@/features/ide/composables/useScreenZoom'
import { GameButton, GameButtonGroup, GameIcon, GameTabPane } from '@/shared/components/ui'

import ActivePaletteDisplay from './ActivePaletteDisplay.vue'
import ErrorPanel from './ErrorPanel.vue'
import Screen from './Screen.vue'

/**
 * ScreenTab component - Displays the screen buffer in a tab pane format with zoom controls.
 */
defineOptions({
  name: 'ScreenTab',
})

// Props are used in template, but linter requires assignment for withDefaults
const _props = withDefaults(
  defineProps<{
    screenBuffer?: ScreenCell[][]
    cursorX?: number
    cursorY?: number
    bgPalette?: number
    backdropColor?: number
    spritePalette?: number
    cgenMode?: number
    spriteStates?: SpriteState[]
    spriteEnabled?: boolean
    movementStates?: MovementState[]
    externalFrontSpriteNodes?: Map<number, unknown>
    externalBackSpriteNodes?: Map<number, unknown>
    sharedAnimationView?: Float64Array
    sharedDisplayViews?: SharedDisplayViews
    setDecodedScreenState?: (decoded: import('@/core/animation/sharedDisplayBuffer').DecodedScreenState) => void
    registerScheduleRender?: (fn: () => void) => void
    errors?: Array<{ line: number; message: string; type: string; stack?: string; sourceLine?: string }>
  }>(),
  {
    screenBuffer: () => {
      const grid: ScreenCell[][] = []
      for (let y = 0; y < 24; y++) {
        const row: ScreenCell[] = []
        for (let x = 0; x < 28; x++) {
          row.push({ character: ' ', colorPattern: 0, x, y })
        }
        grid.push(row)
      }
      return grid
    },
    cursorX: 0,
    cursorY: 0,
    bgPalette: 1,
    backdropColor: 0,
    spritePalette: 1,
    cgenMode: 2,
    spriteStates: () => [],
    spriteEnabled: false,
    movementStates: () => [],
    errors: () => [],
  }
)

const { t } = useI18n()

// Provide zoom state for child components (Screen) and use it for controls
const { zoomLevel, setZoom } = provideScreenZoom()

// Zoom level options
const zoomLevels: Array<{ value: 1 | 2 | 3 | 4; label: string }> = [
  { value: 1, label: '×1' },
  { value: 2, label: '×2' },
  { value: 3, label: '×3' },
  { value: 4, label: '×4' },
]

// Computed property for template binding (Vue templates auto-unwrap refs, but this helps TypeScript)
const currentZoomLevel = computed(() => zoomLevel.value)
</script>

<template>
  <GameTabPane name="screen">
    <template #label>
      <GameIcon icon="mdi:monitor" size="small" />
      <span>{{ t('ide.output.screen') }}</span>
    </template>

    <template #tab-content-header>
      <div class="screen-controls">
        <GameButtonGroup>
          <GameButton
            v-for="level in zoomLevels"
            :key="level.value"
            variant="toggle"
            size="small"
            :selected="currentZoomLevel === level.value"
            @click="setZoom(level.value)"
          >
            {{ level.label }}
          </GameButton>
        </GameButtonGroup>
        <ActivePaletteDisplay
          :bg-palette="bgPalette"
          :sprite-palette="spritePalette"
          class="palette-display"
        />
      </div>
    </template>

    <div class="tab-content">
      <Screen
        :screen-buffer="screenBuffer"
        :cursor-x="cursorX"
        :cursor-y="cursorY"
        :bg-palette="bgPalette"
        :backdrop-color="backdropColor"
        :sprite-palette="spritePalette"
        :cgen-mode="cgenMode"
        :sprite-states="spriteStates"
        :sprite-enabled="spriteEnabled"
        :movement-states="movementStates"
        :external-front-sprite-nodes="externalFrontSpriteNodes"
        :external-back-sprite-nodes="externalBackSpriteNodes"
        :shared-animation-view="sharedAnimationView"
        :shared-display-views="sharedDisplayViews"
        :set-decoded-screen-state="setDecodedScreenState"
        :register-schedule-render="registerScheduleRender"
      />
    </div>
    <div class="tab-content-footer">
      <ErrorPanel :errors="errors" />
    </div>
  </GameTabPane>
</template>

<style scoped>
.tab-content {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.tab-content-footer {
  flex-shrink: 0;
}

.screen-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.palette-display {
  margin-left: 0.5rem;
}
</style>
