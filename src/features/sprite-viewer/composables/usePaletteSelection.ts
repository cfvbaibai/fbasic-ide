import { ref, computed, watch } from 'vue'
import type { SpriteDefinition } from '../../../shared/data/sprites'
import { SPRITE_PALETTES } from '../../../shared/data/palette'

export function usePaletteSelection(
  selectedSprite: { value: SpriteDefinition | null }
) {
  const selectedPaletteCode = ref<number>(0)
  const selectedColorCombination = ref<number>(0)

  // Update palette and color combination when sprite changes
  const updateDefaults = () => {
    if (selectedSprite.value) {
      selectedPaletteCode.value = selectedSprite.value.defaultPaletteCode
      selectedColorCombination.value = selectedSprite.value.defaultColorCombination
    }
  }

  // Watch for sprite changes to update defaults
  watch(selectedSprite, () => {
    updateDefaults()
  }, { immediate: true })

  // Get the selected color combination colors (excluding index 0)
  const selectedColorCombinationColors = computed(() => {
    const palette = SPRITE_PALETTES[selectedPaletteCode.value]
    if (!palette) {
      return []
    }
    
    const colorCombination = palette[selectedColorCombination.value]
    if (!colorCombination) {
      return []
    }
    
    // Return colors at indices 1, 2, 3 (skip index 0)
    return [
      colorCombination[1],
      colorCombination[2],
      colorCombination[3]
    ].filter((code): code is number => code !== undefined)
  })

  return {
    selectedPaletteCode,
    selectedColorCombination,
    selectedColorCombinationColors
  }
}

