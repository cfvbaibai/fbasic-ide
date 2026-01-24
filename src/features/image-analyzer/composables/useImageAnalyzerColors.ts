/**
 * Composable for image analyzer color-related functionality
 */

import { computed } from 'vue'
import { useCssVar } from '@vueuse/core'
import { BACKGROUND_PALETTES, SPRITE_PALETTES } from '@/shared/data/palette'

/**
 * Get grid line colors using semantic colors from theme
 */
export function useGridLineColors() {
  const semanticWarning = useCssVar('--semantic-solid-warning', document.documentElement)
  const semanticSuccess = useCssVar('--semantic-solid-success', document.documentElement)
  const semanticInfo = useCssVar('--semantic-solid-info', document.documentElement)
  const semanticDanger = useCssVar('--semantic-solid-danger', document.documentElement)

  const getGridLineColor = (i: number): string => {
    if (i === 1 || i === 17) {
      return semanticWarning.value ?? '#ffa500' // fallback to orange
    } else if (i === 9) {
      return semanticSuccess.value ?? '#00ff00' // fallback to green
    } else if (i === 5 || i === 13) {
      return semanticInfo.value ?? '#00ffff' // fallback to cyan
    } else {
      return semanticDanger.value ?? '#ff0000' // fallback to red
    }
  }

  return { getGridLineColor }
}

/**
 * Get selected color combination colors
 */
export function useColorCombinationColors(
  paletteType: { value: 'background' | 'sprite' },
  selectedPaletteCode: { value: number },
  selectedColorCombination: { value: number }
) {
  const selectedColorCombinationColors = computed(() => {
    const palette = paletteType.value === 'sprite'
      ? SPRITE_PALETTES[selectedPaletteCode.value]
      : BACKGROUND_PALETTES[selectedPaletteCode.value]
    
    if (!palette) {
      return []
    }
    
    const colorCombination = palette[selectedColorCombination.value]
    if (!colorCombination) {
      return []
    }
    
    // Return all 4 colors (background + 3 foreground colors)
    return [
      colorCombination[0],
      colorCombination[1],
      colorCombination[2],
      colorCombination[3]
    ].filter((code): code is number => code !== undefined)
  })

  return { selectedColorCombinationColors }
}
