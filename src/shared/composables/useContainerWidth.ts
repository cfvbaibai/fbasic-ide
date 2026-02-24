import { onMounted, onUnmounted, type Ref,ref } from 'vue'

/**
 * Composable to observe container width and determine if it's in compact mode.
 * @param containerRef - Reference to the container element
 * @param compactThreshold - Width threshold below which compact mode is enabled (default: 600)
 * @returns isCompact - Ref<boolean> indicating if the container is in compact mode
 */
export function useContainerWidth(
  containerRef: Ref<HTMLElement | null>,
  compactThreshold = 600,
): Ref<boolean> {
  const isCompact = ref(false)

  let observer: ResizeObserver | null = null

  const updateCompact = (width: number) => {
    isCompact.value = width < compactThreshold
  }

  onMounted(() => {
    if (containerRef.value) {
      updateCompact(containerRef.value.offsetWidth)

      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          updateCompact(entry.contentRect.width)
        }
      })

      observer.observe(containerRef.value)
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return isCompact
}
