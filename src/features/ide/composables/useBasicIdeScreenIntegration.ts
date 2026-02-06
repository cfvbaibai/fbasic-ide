/**
 * Screen integration: shared display buffer and render/sync callbacks.
 * Worker writes to shared buffer; Screen reads and decodes; setDecodedScreenState updates refs.
 */

import { type Ref,ref } from 'vue'

import {
  createSharedDisplayBuffer,
  type DecodedScreenState,
  incrementSequence,
  type SharedDisplayViews,
  writeScreenState,
} from '@/core/animation/sharedDisplayBuffer'
import { TIMING } from '@/core/constants'
import { createSharedJoystickBuffer } from '@/core/devices'
import type { AnimationWorkerCommand } from '@/core/workers/AnimationWorker'

import type { BasicIdeState } from './useBasicIdeState'

export interface BasicIdeScreenIntegration {
  sharedDisplayViews: SharedDisplayViews
  sharedAnimationView: Float64Array
  sharedAnimationBuffer: SharedArrayBuffer
  sharedJoystickBuffer: SharedArrayBuffer
  registerScheduleRender: (fn: () => void) => void
  setDecodedScreenState: (decoded: DecodedScreenState) => void
  /** Called by message handlers when SCREEN_CHANGED is received. */
  scheduleRender: () => void
  /** Coalesced: at most one scheduleRender per frame. Use for SCREEN_CHANGED to avoid main-thread flood. */
  scheduleRenderForScreenChanged: () => void
  /** Write current (cleared) state to shared buffer and bump sequence so Screen redraws. Call after clearOutput. */
  clearDisplayToSharedBuffer: () => void
  /** Forward animation command to Animation Worker (if initialized). */
  forwardToAnimationWorker: (command: AnimationWorkerCommand) => void
  /** Set the forwardToAnimationWorker function (called by Screen component when Animation Worker is ready). */
  setForwardToAnimationWorker: (fn: (command: AnimationWorkerCommand) => void) => void
}

/**
 * Create shared display buffer and callbacks that sync decoded state into IDE state refs.
 */
export function useBasicIdeScreenIntegration(state: BasicIdeState): BasicIdeScreenIntegration {
  const sharedDisplayViews = createSharedDisplayBuffer()
  const sharedAnimationBuffer = sharedDisplayViews.buffer
  const sharedAnimationView = sharedDisplayViews.spriteView

  // Shared joystick buffer (main thread writes, workers read)
  const sharedJoystickBuffer = createSharedJoystickBuffer()

  // Forward function to Animation Worker (set by Screen component)
  const forwardToAnimationWorkerRef: Ref<((command: AnimationWorkerCommand) => void) | undefined> = ref(undefined)

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

  /** Write current state to shared buffer and bump sequence so Screen re-decodes and redraws. */
  const clearDisplayToSharedBuffer = () => {
    writeScreenState(
      sharedDisplayViews,
      state.screenBuffer.value,
      state.cursorX.value,
      state.cursorY.value,
      state.bgPalette.value ?? 1,
      state.spritePalette.value ?? 1,
      state.backdropColor.value ?? 0,
      state.cgenMode.value ?? 2
    )
    // Zero sprite positions so next Run uses default center (getSpritePosition returns null for 0,0)
    sharedDisplayViews.spriteView.fill(0)
    incrementSequence(sharedDisplayViews)
    scheduleRender()
  }

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
    sharedJoystickBuffer,
    registerScheduleRender,
    setDecodedScreenState,
    scheduleRender,
    scheduleRenderForScreenChanged,
    clearDisplayToSharedBuffer,
    forwardToAnimationWorker: (command: AnimationWorkerCommand) => {
      forwardToAnimationWorkerRef.value?.(command)
    },
    /** Set the forwardToAnimationWorker function (called by Screen component when Animation Worker is ready) */
    setForwardToAnimationWorker: (fn: (command: AnimationWorkerCommand) => void) => {
      forwardToAnimationWorkerRef.value = fn
    },
  }
}
