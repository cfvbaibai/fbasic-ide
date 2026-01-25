/**
 * Render queue composable - Manages render scheduling using requestAnimationFrame
 * Ensures updates are processed in order and aligned with browser refresh cycle
 * If multiple updates come in rapid succession, we drop intermediate ones and only render the latest
 */

/**
 * Create a render queue that schedules renders using requestAnimationFrame
 * Returns a schedule function and cleanup function
 */
export function useRenderQueue(renderFn: () => Promise<void>): {
  schedule: () => void
  cleanup: () => void
} {
  let pendingRender: (() => Promise<void>) | null = null
  let isRendering = false
  let pendingAnimationFrame: number | null = null

  async function executeRender(): Promise<void> {
    if (isRendering || !pendingRender) return

    isRendering = true
    const render = pendingRender
    pendingRender = null // Clear pending render before executing
    pendingAnimationFrame = null // Clear animation frame ID

    try {
      await render()
    } finally {
      isRendering = false

      // If a new render was queued while we were rendering, schedule it
      if (pendingRender) {
        schedule()
      }
    }
  }

  function schedule(): void {
    // Always update pendingRender to the latest render function
    // This ensures we drop intermediate updates and only render the latest state
    pendingRender = renderFn

    // If already rendering, the new render will be picked up after current one completes
    if (isRendering) {
      return
    }

    // If there's already a pending animation frame, don't schedule another one
    // The existing frame will pick up the latest pendingRender
    if (pendingAnimationFrame !== null) {
      return
    }

    // Use requestAnimationFrame for optimal timing with browser rendering
    // This automatically aligns with display refresh rate and reduces blocking
    pendingAnimationFrame = requestAnimationFrame(() => {
      pendingAnimationFrame = null
      void executeRender()
    })
  }

  function cleanup(): void {
    // Cancel any pending animation frame
    if (pendingAnimationFrame !== null) {
      cancelAnimationFrame(pendingAnimationFrame)
      pendingAnimationFrame = null
    }
    // Clear pending render
    pendingRender = null
  }

  return { schedule, cleanup }
}
