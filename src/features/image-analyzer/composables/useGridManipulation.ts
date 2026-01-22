import { ref } from 'vue'

/**
 * Composable for grid manipulation in image analyzer
 */
export function useGridManipulation() {
  const adjustedCellSize = ref<number>(0)
  const gridOffsetX = ref<number>(0)
  const gridOffsetY = ref<number>(0)

  const increaseCellSize = (): void => {
    const oldCellSize = adjustedCellSize.value
    adjustedCellSize.value += 0.25
    // Adjust offset to keep center fixed (center is at line 9, index 8)
    const centerIndex = 8
    const delta = oldCellSize - adjustedCellSize.value
    gridOffsetX.value += centerIndex * delta
    gridOffsetY.value += centerIndex * delta
  }

  const decreaseCellSize = (): void => {
    if (adjustedCellSize.value > 0.25) {
      const oldCellSize = adjustedCellSize.value
      adjustedCellSize.value -= 0.25
      // Adjust offset to keep center fixed (center is at line 9, index 8)
      const centerIndex = 8
      const delta = oldCellSize - adjustedCellSize.value
      gridOffsetX.value += centerIndex * delta
      gridOffsetY.value += centerIndex * delta
    }
  }

  const moveGridUp = (): void => {
    gridOffsetY.value -= 0.5
  }

  const moveGridDown = (): void => {
    gridOffsetY.value += 0.5
  }

  const moveGridLeft = (): void => {
    gridOffsetX.value -= 0.5
  }

  const moveGridRight = (): void => {
    gridOffsetX.value += 0.5
  }

  return {
    adjustedCellSize,
    gridOffsetX,
    gridOffsetY,
    increaseCellSize,
    decreaseCellSize,
    moveGridUp,
    moveGridDown,
    moveGridLeft,
    moveGridRight
  }
}
