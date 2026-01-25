<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ScreenCell } from '@/core/interfaces'
import type { MovementState, SpriteState } from '@/core/sprite/types'
import { provideScreenZoom } from '@/features/ide/composables/useScreenZoom'
import { GameButton, GameButtonGroup, GameIcon, GameTabPane } from '@/shared/components/ui'

import Screen from './Screen.vue'

/**
 * ScreenTab component - Displays the screen buffer in a tab pane format with zoom controls.
 */
defineOptions({
  name: 'ScreenTab'
})

// Props are used in template, but linter requires assignment for withDefaults
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<{
  screenBuffer?: ScreenCell[][]
  cursorX?: number
  cursorY?: number
  bgPalette?: number
  backdropColor?: number
  spriteStates?: SpriteState[]
  spriteEnabled?: boolean
  movementStates?: MovementState[]
}>(), {
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
  spriteStates: () => [],
  spriteEnabled: false,
  movementStates: () => []
})

const { t } = useI18n()

// Provide zoom state for child components (Screen) and use it for controls
const { zoomLevel, setZoom } = provideScreenZoom()

// Zoom level options
const zoomLevels: Array<{ value: 1 | 2 | 3 | 4; label: string }> = [
  { value: 1, label: '×1' },
  { value: 2, label: '×2' },
  { value: 3, label: '×3' },
  { value: 4, label: '×4' }
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
      </div>
    </template>
    
    <div class="tab-content">
      <Screen 
        :screen-buffer="screenBuffer"
        :cursor-x="cursorX"
        :cursor-y="cursorY"
        :bg-palette="bgPalette"
        :backdrop-color="backdropColor"
        :sprite-states="spriteStates"
        :sprite-enabled="spriteEnabled"
        :movement-states="movementStates"
      />
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

.screen-controls {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>