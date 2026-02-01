/**
 * Screen integration: shared display buffer and render/sync callbacks.
 * Worker writes to shared buffer; Screen reads and decodes; setDecodedScreenState updates refs.
 */

import { ref } from 'vue'

import {
  createSharedDisplayBuffer,
  type DecodedScreenState,
  type SharedDisplayViews,
} from '@/core/animation/sharedDisplayBuffer'
import { TIMING } from '@/core/constants'

import type { BasicIdeState } from './useBasicIdeState'

export interface BasicIdeScreenIntegration {
  sharedDisplayViews: SharedDisplayViews
  sharedAnimationView: Float64Array
  sharedAnimationBuffer: SharedArrayBuffer
  registerScheduleRender: (fn: () => void) => void
  setDecodedScreenState: (decoded: DecodedScreenState) => void
  /** Called by message handlers when SCREEN_CHANGED is received. */
  scheduleRender: () => void
  /** Coalesced: at most one scheduleRender per frame. Use for SCREEN_CHANGED to avoid main-thread flood. */
  scheduleRenderForScreenChanged: () => void
}

/**
 * Create shared display buffer and callbacks that sync decoded state into IDE state refs.
 */
export function useBasicIdeScreenIntegration(state: BasicIdeState): BasicIdeScreenIntegration {
  const sharedDisplayViews = createSharedDisplayBuffer()
  const sharedAnimationBuffer = sharedDisplayViews.buffer
  const sharedAnimationView = sharedDisplayViews.spriteView

  const scheduleScreenRenderRef = ref<(() => void) | null>(null)
  const registerScheduleRender = (fn: () => void) => {
    scheduleScreenRenderRef.value = fn
  }

  const setDecodedScreenState = (decoded: DecodedScreenState) => {
    state.screenBuffer.value = decoded.buffer
    state.cursorX.value = decoded.cursorX
    state.cursorY.value = decoded.cursorY
    state.bgPalette.value = decoded.bgPalette
    state.spritePalette.value = decoded.spritePalette
    state.backdropColor.value = decoded.backdropColor
    state.cgenMode.value = decoded.cgenMode
  }

  const scheduleRender = () => scheduleScreenRenderRef.value?.()

  // Coalesce SCREEN_CHANGED with adaptive frame rate throttling
  // Throttle to ~20 FPS (50ms) during rapid PRINT operations to reduce CPU usage
  // (60 FPS is overkill for text output; sprites run at separate 30 FPS animation loop)
  let screenChangedRafId: number | null = null
  let lastRenderTime = 0
  const MIN_RENDER_INTERVAL_MS = TIMING.SCREEN_RENDER_INTERVAL_MS

  const scheduleRenderForScreenChanged = () => {
    if (screenChangedRafId !== null) return

    const now = performance.now()
    const timeSinceLastRender = now - lastRenderTime

    if (timeSinceLastRender >= MIN_RENDER_INTERVAL_MS) {
      // Enough time has passed since last render - schedule immediately
      screenChangedRafId = requestAnimationFrame(() => {
        screenChangedRafId = null
        lastRenderTime = performance.now()
        scheduleScreenRenderRef.value?.()
      })
    } else {
      // Throttle: wait until MIN_RENDER_INTERVAL_MS has passed
      const delay = MIN_RENDER_INTERVAL_MS - timeSinceLastRender
      screenChangedRafId = window.setTimeout(() => {
        screenChangedRafId = requestAnimationFrame(() => {
          screenChangedRafId = null
          lastRenderTime = performance.now()
          scheduleScreenRenderRef.value?.()
        })
      }, delay)
    }
  }

  return {
    sharedDisplayViews,
    sharedAnimationView,
    sharedAnimationBuffer,
    registerScheduleRender,
    setDecodedScreenState,
    scheduleRender,
    scheduleRenderForScreenChanged,
  }
}
