<script setup lang="ts">
import { computed } from 'vue'

interface ScreenCell {
  character: string
  colorPattern: number
  x: number
  y: number
}

interface Props {
  screenBuffer: ScreenCell[][]
  cursorX: number
  cursorY: number
}

const props = withDefaults(defineProps<Props>(), {
  screenBuffer: () => {
    // Initialize empty 28×24 grid
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
  cursorY: 0
})

// Ensure screenBuffer is always 24 rows × 28 columns
const normalizedBuffer = computed(() => {
  const buffer: ScreenCell[][] = []
  for (let y = 0; y < 24; y++) {
    const row: ScreenCell[] = []
    const sourceRow = props.screenBuffer[y]
    for (let x = 0; x < 28; x++) {
      const cell = sourceRow?.[x]
      if (cell !== undefined && cell !== null) {
        row.push(cell)
      } else {
        row.push({ character: ' ', colorPattern: 0, x, y })
      }
    }
    buffer.push(row)
  }
  return buffer
})

// Check if a cell is at cursor position
const isCursorCell = (x: number, y: number): boolean => {
  return x === props.cursorX && y === props.cursorY
}
</script>

<template>
  <div class="screen-container">
    <div class="screen-header">
      <span class="screen-title">Family BASIC Screen</span>
      <span class="screen-dimensions">28×24</span>
      <span class="cursor-info">Cursor: ({{ cursorX }}, {{ cursorY }})</span>
    </div>
    <div class="screen-display">
      <div class="screen-grid">
        <div
          v-for="(row, y) in normalizedBuffer"
          :key="y"
          class="screen-row"
        >
          <div
            v-for="(cell, x) in row"
            :key="`${x}-${y}`"
            :class="['screen-cell', { 'cursor-cell': isCursorCell(x, y) }]"
            :data-x="x"
            :data-y="y"
          >
            {{ cell.character || ' ' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screen-container {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--game-screen-bg-color);
  border: 2px solid var(--game-screen-border-color);
  border-radius: 4px;
  overflow: hidden;
}

.screen-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: var(--game-screen-header-bg);
  border-bottom: 1px solid var(--game-screen-border-color);
  font-size: 0.875rem;
  color: var(--game-screen-header-text);
}

.screen-title {
  font-weight: 600;
  color: var(--game-screen-header-title);
}

.screen-dimensions {
  color: var(--game-screen-header-text);
}

.cursor-info {
  margin-left: auto;
  font-family: 'Courier New', monospace;
  color: var(--game-screen-text-color);
}

.screen-display {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: auto;
  min-height: 0;
}

.screen-grid {
  display: inline-block;
  background: var(--game-screen-bg-color);
  border: 1px solid var(--game-screen-border-color);
}

.screen-row {
  display: flex;
  line-height: 1;
}

.screen-cell {
  width: 0.75rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--game-font-family-mono);
  font-size: var(--game-font-size-mono);
  color: var(--game-screen-text-color);
  background: var(--game-screen-bg-color);
  border: 0;
  padding: 0;
  margin: 0;
  white-space: pre;
  user-select: none;
}

.screen-cell.cursor-cell {
  background: var(--game-screen-cursor-bg);
  box-shadow: inset 0 0 0 1px var(--game-screen-cursor-border);
}

/* Ensure monospace rendering */
.screen-cell::before {
  content: '';
  display: inline-block;
  width: 0;
  height: 1rem;
  vertical-align: top;
}
</style>

