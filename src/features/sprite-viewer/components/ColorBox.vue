<script setup lang="ts">
import { computed } from 'vue'
import { COLORS } from '../../../shared/data/palette'

interface Props {
  colorCode: number
  showHex?: boolean
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showHex: true,
  customClass: ''
})

// Get the color from COLORS array
const color = computed(() => {
  if (props.colorCode >= 0 && props.colorCode < COLORS.length) {
    return COLORS[props.colorCode] ?? '#000000'
  }
  return '#000000'
})

// Determine if a color is light (for text contrast)
const isLightColor = (hexColor: string): boolean => {
  // Remove # if present
  const hex = hexColor.replace('#', '')
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

const isLight = computed(() => isLightColor(color.value))

// Generate hex code string
const hexCode = computed(() => {
  return `0x${props.colorCode.toString(16).toUpperCase().padStart(2, '0')}`
})

// Generate title from hex code
const tooltipTitle = computed(() => {
  return `Color ${props.colorCode} (${hexCode.value}): ${color.value}`
})
</script>

<template>
  <div
    class="color-box"
    :class="[props.customClass || '', { 'color-box-light': isLight }]"
    :style="{
      backgroundColor: color
    }"
    :title="tooltipTitle"
  >
    <span
      v-if="props.showHex"
      class="color-box-code"
      :class="{ 'color-box-code-light': isLight }"
    >
      {{ hexCode }}
    </span>
  </div>
</template>

<style scoped>
.color-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 1px solid var(--game-surface-border);
  border-radius: 4px;
  transition: transform 0.1s;
  cursor: pointer;
  box-shadow: var(--game-shadow-base);
}

.color-box:hover {
  transform: scale(1.1);
  z-index: 1;
  position: relative;
  box-shadow: var(--game-shadow-base);
}

.color-box-code {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  user-select: none;
}

.color-box-code-light {
  color: #000;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}
</style>

