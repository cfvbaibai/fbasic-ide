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

import type { BasicIdeState } from './useBasicIdeState'

export interface BasicIdeScreenIntegration {
  sharedDisplayViews: SharedDisplayViews
  sharedAnimationView: Float64Array
  sharedAnimationBuffer: SharedArrayBuffer
  registerScheduleRender: (fn: () => void) => void
  setDecodedScreenState: (decoded: DecodedScreenState) => void
  /** Called by message handlers when SCREEN_CHANGED is received. */
  scheduleRender: () => void
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

  return {
    sharedDisplayViews,
    sharedAnimationView,
    sharedAnimationBuffer,
    registerScheduleRender,
    setDecodedScreenState,
    scheduleRender,
  }
}
