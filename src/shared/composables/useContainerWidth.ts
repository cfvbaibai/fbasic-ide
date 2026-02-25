import { useElementSize } from '@vueuse/core'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, toValue } from 'vue'

/**
 * Composable to observe container width and determine if it's in compact mode.
 * Uses VueUse's useElementSize for reactive element dimension tracking.
 *
 * @param containerRef - Reference to the container element (reactive or getter)
 * @param compactThreshold - Width threshold below which compact mode is enabled (default: 600)
 * @returns isCompact - Readonly Ref<boolean> indicating if the container is in compact mode
 */
export function useContainerWidth(
  containerRef: MaybeRefOrGetter<HTMLElement | null>,
  compactThreshold: MaybeRefOrGetter<number> = 600,
): Readonly<Ref<boolean>> {
  const { width } = useElementSize(containerRef)
  return computed(() => toValue(width) < toValue(compactThreshold))
}
