import { ref, watchEffect, type Ref } from 'vue'
import { renderScreenBuffer, type ScreenCell } from './canvasRenderer'

/**
 * Composable for rendering screen buffer to canvas
 * Uses direct rendering (no Vue reactivity) for maximum performance
 */
export function useScreenCanvasRenderer(
  canvasRef: Ref<HTMLCanvasElement | null>,
  screenBuffer: Ref<ScreenCell[][]>,
  paletteCode: Ref<number> = ref(1) // Default palette 1
) {
  // Direct render function - bypasses Vue reactivity
  function render(): void {
    const canvas = canvasRef.value
    if (!canvas) return
    
    renderScreenBuffer(canvas, screenBuffer.value, paletteCode.value)
  }

  // Initial render when canvas becomes available
  watchEffect(() => {
    if (canvasRef.value) {
      render()
    }
  })

  // Return render function for manual control
  return {
    render
  }
}
