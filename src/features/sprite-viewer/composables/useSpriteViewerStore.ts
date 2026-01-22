import { ref, computed, provide, inject, type InjectionKey } from 'vue'
import { CHARACTER_SPRITES } from '../../../shared/data/sprites'
import type { SpriteDefinition } from '@/shared/data/types'
import { useSpriteDisplay } from './useSpriteDisplay'
import { usePaletteSelection } from './usePaletteSelection'
import { useDefSpriteStatement } from './useDefSpriteStatement'
import { useDefMoveStatement } from './useDefMoveStatement'

export interface SpriteViewerStore {
  // State (reactive refs/computed)
  selectedIndex: { value: number }
  displayOptions: { value: { showValues: boolean; showGridLines: boolean; reverseX: boolean; reverseY: boolean } }
  selectedSprite: { value: SpriteDefinition | null }
  selectedPaletteCode: { value: number }
  selectedColorCombination: { value: number }
  selectedColorCombinationColors: { value: number[] }
  sprite16x16: { value: number[][] } // Legacy alias
  spriteGrid: { value: number[][] }
  spriteSize: { value: { width: number; height: number } }
  getCellColor: (value: number) => string
  defSpriteStatement: { value: string }
  defMoveStatement: { value: string }
  // Actions
  setSelectedIndex: (index: number) => void
  setDisplayOptions: (options: Partial<{ showValues: boolean; showGridLines: boolean; reverseX: boolean; reverseY: boolean }>) => void
  setPaletteCode: (code: number) => void
  setColorCombination: (combination: number) => void
}

export const SpriteViewerStoreKey: InjectionKey<SpriteViewerStore> = Symbol('SpriteViewerStore')

export function createSpriteViewerStore(): SpriteViewerStore {
  // State
  const selectedIndex = ref<number>(0)
  const displayOptions = ref({
    showValues: false,
    showGridLines: false,
    reverseX: false,
    reverseY: false
  })

  // Get the selected sprite definition
  const selectedSprite = computed(() => {
    if (selectedIndex.value >= 0 && selectedIndex.value < CHARACTER_SPRITES.length) {
      return CHARACTER_SPRITES[selectedIndex.value] ?? null
    }
    return null
  })

  // Use composables
  const { selectedPaletteCode, selectedColorCombination, selectedColorCombinationColors } = usePaletteSelection(selectedSprite)
  const { sprite16x16, spriteGrid, spriteSize, getCellColor } = useSpriteDisplay(selectedSprite, selectedPaletteCode, selectedColorCombination, displayOptions)
  const { defSpriteStatement } = useDefSpriteStatement(selectedSprite, selectedColorCombination, () => displayOptions.value.reverseX, () => displayOptions.value.reverseY)
  const { defMoveStatement } = useDefMoveStatement(selectedSprite, selectedColorCombination)

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
    selectedSprite,
    selectedPaletteCode,
    selectedColorCombination,
    selectedColorCombinationColors,
    sprite16x16, // Legacy alias
    spriteGrid,
    spriteSize,
    getCellColor,
    defSpriteStatement,
    defMoveStatement,
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
    throw new Error(
      'SpriteViewerStore must be provided. ' +
      'Call provideSpriteViewerStore() in a parent component. ' +
      'Affected components: CharacterSpriteViewerPage.vue'
    )
  }
  return store
}

