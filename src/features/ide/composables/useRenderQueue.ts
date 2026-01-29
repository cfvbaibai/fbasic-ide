/**
 * Render queue - schedules renders via requestAnimationFrame.
 * When animation is active, defers to pending static render (animation loop runs first).
 */

export interface UseRenderQueueOptions {
  /** When true, schedule() sets pending static render instead of scheduling own rAF (animation loop will run render) */
  hasActiveMovements: () => boolean
  /** Set pending static render flag (true = render requested, false = consumed) */
  setPendingStaticRender: (pending: boolean) => void
}

/**
 * Create a render queue that schedules renders using requestAnimationFrame
 * When hasActiveMovements() is true, only sets pending static render; animation loop runs render at end of frame.
 */
export function useRenderQueue(
  renderFn: () => Promise<void>,
  options?: UseRenderQueueOptions
): {
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

      if (pendingRender) {
        schedule()
      }
    }
  }

  function schedule(): void {
    pendingRender = renderFn

    if (isRendering) {
      return
    }

    // When animation is active, defer to animation loop: set pending static render instead of scheduling rAF
    if (options?.hasActiveMovements?.()) {
      options.setPendingStaticRender(true)
      return
    }

    if (pendingAnimationFrame !== null) {
      return
    }

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
