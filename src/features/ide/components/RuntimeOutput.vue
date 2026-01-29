<script setup lang="ts">
import { ref, watch } from 'vue'

import type { SharedDisplayViews } from '@/core/animation/sharedDisplayBuffer'
import type { BasicVariable, ScreenCell } from '@/core/interfaces'
import type { MovementState, SpriteState } from '@/core/sprite/types'
import { GameTabs } from '@/shared/components/ui'

import DebugTab from './DebugTab.vue'
import ScreenTab from './ScreenTab.vue'
import StdoutTab from './StdoutTab.vue'
import VariablesTab from './VariablesTab.vue'

/**
 * RuntimeOutput component - Displays runtime output, errors, variables, debug info, and screen buffer.
 */
defineOptions({
  name: 'RuntimeOutput',
})

// Props are used in template, but linter requires assignment for withDefaults
 
const props = withDefaults(defineProps<Props>(), {
  errors: () => [],
  variables: () => ({}),
  debugOutput: '',
  debugMode: false,
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
  movementStates: () => [],
})

interface Props {
  output: string[]
  isRunning: boolean
  errors?: { line: number; message: string; type: string }[]
  variables?: Record<string, BasicVariable>
  debugOutput?: string
  debugMode?: boolean
  screenBuffer?: ScreenCell[][]
  cursorX?: number
  cursorY?: number
  bgPalette?: number
  backdropColor?: number
  spriteStates?: SpriteState[]
  spriteEnabled?: boolean
  movementStates?: MovementState[]
  externalFrontSpriteNodes?: Map<number, unknown>
  externalBackSpriteNodes?: Map<number, unknown>
  /** Shared animation state view (Float64Array). Main thread writes positions + isActive each frame. */
  sharedAnimationView?: Float64Array
  /** Shared display buffer views; when present, Screen reads from shared buffer on SCREEN_CHANGED. */
  sharedDisplayViews?: SharedDisplayViews
  /** Called by Screen after decoding shared buffer to update parent refs. */
  setDecodedScreenState?: (decoded: import('@/core/animation/sharedDisplayBuffer').DecodedScreenState) => void
  /** Register Screen's scheduleRender so parent can trigger redraw on SCREEN_CHANGED. */
  registerScheduleRender?: (fn: () => void) => void
  spritePalette?: number
  cgenMode?: number
}

const activeTab = ref('screen')

// On execution failure, switch to STDOUT tab so the user sees the error
watch(
  () => props.errors?.length ?? 0,
  (len) => {
    if (len > 0) activeTab.value = 'stdout'
  }
)
</script>

<template>
  <div class="runtime-output">
    <GameTabs v-model="activeTab" type="border-card" class="output-tabs">
      <!-- SCREEN Tab -->
      <ScreenTab
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

      <!-- STDOUT Tab -->
      <StdoutTab :output="output" :is-running="isRunning" :errors="errors" />

      <!-- Debug Output Tab -->
      <DebugTab :debug-output="debugOutput" :debug-mode="debugMode" />

      <!-- Variables Tab -->
      <VariablesTab :variables="variables" />
    </GameTabs>
  </div>
</template>

<style scoped>
.runtime-output {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  background: transparent;
  min-height: 0; /* Allow component to shrink */
  overflow: hidden; /* Prevent overflow */
  position: relative;
}

.output-tabs {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  z-index: 1;
}
</style>
