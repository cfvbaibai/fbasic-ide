import { ref, computed, provide, inject, type InjectionKey } from 'vue'
import { CHARACTER_SPRITES, type SpriteDefinition } from '../../../shared/data/sprites'
import { useSpriteAnimation } from './useSpriteAnimation'
import { useSpriteDisplay } from './useSpriteDisplay'
import { usePaletteSelection } from './usePaletteSelection'

export interface SpriteViewerStore {
  // State (reactive refs/computed)
  selectedIndex: { value: number }
  displayOptions: { value: { showValues: boolean; showGridLines: boolean } }
  isAnimating: { value: boolean }
  selectedSprite: { value: SpriteDefinition | null }
  selectedPaletteCode: { value: number }
  selectedColorCombination: { value: number }
  selectedColorCombinationColors: { value: number[] }
  sprite16x16: { value: number[][] }
  getCellColor: (value: number) => string
  // Actions
  toggleAnimation: () => void
  setSelectedIndex: (index: number) => void
  setDisplayOptions: (options: Partial<{ showValues: boolean; showGridLines: boolean }>) => void
  setPaletteCode: (code: number) => void
  setColorCombination: (combination: number) => void
}

const SpriteViewerStoreKey: InjectionKey<SpriteViewerStore> = Symbol('SpriteViewerStore')

export function createSpriteViewerStore(): SpriteViewerStore {
  // State
  const selectedIndex = ref<number>(0)
  const displayOptions = ref({
    showValues: false,
    showGridLines: false
  })

  // Get the selected sprite definition
  const selectedSprite = computed(() => {
    if (selectedIndex.value >= 0 && selectedIndex.value < CHARACTER_SPRITES.length) {
      return CHARACTER_SPRITES[selectedIndex.value] ?? null
    }
    return null
  })

  // Use composables
  const { isAnimating, toggleAnimation } = useSpriteAnimation(selectedIndex)
  const { selectedPaletteCode, selectedColorCombination, selectedColorCombinationColors } = usePaletteSelection(selectedSprite)
  const { sprite16x16, getCellColor } = useSpriteDisplay(selectedSprite, selectedPaletteCode, selectedColorCombination)

  // Actions
  const setSelectedIndex = (index: number) => {
    selectedIndex.value = index
  }

  const setDisplayOptions = (options: Partial<typeof displayOptions.value>) => {
    displayOptions.value = { ...displayOptions.value, ...options }
  }

  const setPaletteCode = (code: number) => {
    selectedPaletteCode.value = code
  }

  const setColorCombination = (combination: number) => {
    selectedColorCombination.value = combination
  }

  return {
    selectedIndex,
    displayOptions,
    isAnimating,
    selectedSprite,
    selectedPaletteCode,
    selectedColorCombination,
    selectedColorCombinationColors,
    sprite16x16,
    getCellColor,
    toggleAnimation,
    setSelectedIndex,
    setDisplayOptions,
    setPaletteCode,
    setColorCombination
  }
}

export function provideSpriteViewerStore() {
  const store = createSpriteViewerStore()
  provide(SpriteViewerStoreKey, store)
  return store
}

export function useSpriteViewerStore(): SpriteViewerStore {
  const store = inject(SpriteViewerStoreKey)
  if (!store) {
    throw new Error('SpriteViewerStore must be provided. Call provideSpriteViewerStore() in parent component.')
  }
  return store
}

