/**
 * Keyboard Input Composable for INKEY$ function
 *
 * Tracks keyboard events and writes to shared keyboard buffer for INKEY$.
 * Only active when input mode is 'keyboard' and program is running.
 */

import type { MaybeRefOrGetter } from 'vue'
import { onActivated, onDeactivated, onMounted, onUnmounted, toValue } from 'vue'

import {
  clearInkeyState,
  type KeyboardBufferView,
  setInkeyState,
} from '@/core/devices'
import { logComposable } from '@/shared/logger'

export type InputMode = 'joystick' | 'keyboard'

export interface UseKeyboardInputOptions {
  /** Shared keyboard buffer view (reactive or static) */
  sharedKeyboardView?: MaybeRefOrGetter<KeyboardBufferView | null | undefined>
  /** Function that returns true when keyboard input should be processed */
  enabled?: () => boolean
  /** Current input mode (reactive or static) - only process keys when mode is 'keyboard' */
  inputMode?: MaybeRefOrGetter<InputMode>
}

/**
 * Composable for tracking keyboard input and writing to shared buffer for INKEY$.
 *
 * This composable:
 * - Listens for keydown/keyup events
 * - Writes pressed key character to shared buffer
 * - Only processes keys when input mode is 'keyboard'
 * - Only printable characters (key.length === 1) are tracked
 */
export function useKeyboardInput(options: UseKeyboardInputOptions = {}) {
  const { sharedKeyboardView, enabled = () => true, inputMode } = options

  /**
   * Check if keyboard input should be processed
   */
  const shouldProcessInput = (): boolean => {
    // Must be enabled
    if (!enabled()) return false
    // Must be in keyboard mode
    if (inputMode && toValue(inputMode) !== 'keyboard') return false
    return true
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!shouldProcessInput()) return

    // Only track printable characters (single character keys)
    if (event.key.length !== 1) return

    const view = sharedKeyboardView ? toValue(sharedKeyboardView) : null
    if (!view) return

    // Prevent default for game control keys to avoid browser shortcuts
    // But only when in keyboard mode and running
    // event.preventDefault() // May want to be selective here

    // F-BASIC only uses uppercase letters - convert lowercase to uppercase
    const key = event.key.length === 1 && event.key >= 'a' && event.key <= 'z'
      ? event.key.toUpperCase()
      : event.key

    setInkeyState(view, key)
    logComposable.debug('[useKeyboardInput] Key pressed:', key)
  }

  const handleKeyUp = (_event: KeyboardEvent) => {
    if (!shouldProcessInput()) return

    const view = sharedKeyboardView ? toValue(sharedKeyboardView) : null
    if (!view) return

    // Clear the keyboard state when any key is released
    clearInkeyState(view)
    logComposable.debug('[useKeyboardInput] Key released, buffer cleared')
  }

  // Set up event listeners
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    logComposable.debug('[useKeyboardInput] Event listeners registered')
  })

  // Clean up event listeners
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    logComposable.debug('[useKeyboardInput] Event listeners removed')
  })

  // Handle keep-alive deactivation
  onDeactivated(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    logComposable.debug('[useKeyboardInput] Event listeners removed (deactivated)')
  })

  // Handle keep-alive activation
  onActivated(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    logComposable.debug('[useKeyboardInput] Event listeners registered (activated)')
  })

  return {
    // No public methods needed - event handlers are automatic
  }
}
