<script setup lang="ts">
import { ref } from 'vue'
import type { BasicVariable, ScreenCell } from '../../../core/interfaces'
import type { SpriteState } from '../../../core/sprite/types'
import ScreenTab from './ScreenTab.vue'
import VariablesTab from './VariablesTab.vue'
import DebugTab from './DebugTab.vue'
import StdoutTab from './StdoutTab.vue'
import { GameTabs } from '../../../shared/components/ui'

/**
 * RuntimeOutput component - Displays runtime output, errors, variables, debug info, and screen buffer.
 */
defineOptions({
  name: 'RuntimeOutput'
})

// Props are used in template, but linter requires assignment for withDefaults
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  spriteEnabled: false
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
}

const activeTab = ref('screen')
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
        :sprite-states="spriteStates"
        :sprite-enabled="spriteEnabled"
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