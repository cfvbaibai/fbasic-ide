import { useIntervalFn, useTimeoutFn } from '@vueuse/core'
import { onDeactivated, onUnmounted, ref, shallowRef } from 'vue'

import { type JoystickBufferView, setStickState } from '@/core/devices'
import { logComposable } from '@/shared/logger'

interface UseJoystickEventsOptions {
  sendStrigEvent?: (joystickId: number, state: number) => void
  onStickStateChange?: (joystickId: number, state: number) => void
  onStrigStateChange?: (joystickId: number, state: number) => void
  onCellFlash?: (cellKey: string) => void
  /**
   * Shared joystick buffer view - REQUIRED for STICK (no fallback)
   * Can be a direct JoystickBufferView or a function that returns one (for reactive sources).
   *
   * NOTE: STICK requires sharedJoystickView (zero-copy buffer reads).
   * STRIG can use sendStrigEvent fallback (message passing with consume pattern).
   */
  sharedJoystickView?: JoystickBufferView | (() => JoystickBufferView | null | undefined)
}

export function useJoystickEvents(options: UseJoystickEventsOptions = {}) {
  const {
    sendStrigEvent,
    onStickStateChange,
    onStrigStateChange,
    onCellFlash,
    sharedJoystickView,
  } = options

  // Helper to get the current shared joystick view (handles both direct value and function)
  const getSharedJoystickView = (): JoystickBufferView | null => {
    if (!sharedJoystickView) return null
    if (typeof sharedJoystickView === 'function') {
      return sharedJoystickView() ?? null
    }
    return sharedJoystickView
  }

  // Track which buttons are currently "held" (toggle state)
  const heldButtons = ref<Record<string, boolean>>({})

  // Track which action buttons are currently pressed (for simultaneous button detection)
  const pressedActionButtons = ref<Set<string>>(new Set())

  // Track which D-pad buttons are being held for periodic triggering
  // Store the pause function from useIntervalFn (Pausable interface)
  const heldDpadButtons = ref<Record<string, (() => void) | null>>({})
  const dpadRepeatInterval = 100 // Repeat every 100ms when held

  // Track if we're actively using manual controls to prevent polling interference
  const usingManualControls = shallowRef(false)

  // Track flashing state for table cells
  const flashingCells = ref<Record<string, boolean>>({})

  // Helper function to flash a table cell
  const flashCell = (cellKey: string) => {
    flashingCells.value[cellKey] = true
    const { start } = useTimeoutFn(() => {
      flashingCells.value[cellKey] = false
    }, 200) // Flash for 200ms
    start()
    onCellFlash?.(cellKey)
  }

  // D-pad hold and repeat functions
  const startDpadHold = (joystickId: number, direction: 'up' | 'down' | 'left' | 'right') => {
    const buttonKey = `${joystickId}-${direction}`

    // Set manual controls flag to prevent polling interference
    usingManualControls.value = true

    // Map direction names to STICK values
    const directionMap: Record<string, number> = {
      up: 8,
      down: 4,
      left: 2,
      right: 1,
    }

    const stickValue = directionMap[direction] ?? 0

    // Write STICK state to shared joystick buffer (zero-copy)
    // STICK requires sharedJoystickView - no fallback
    const view = getSharedJoystickView()
    if (!view) {
      throw new Error(
        'Shared joystick buffer is required for STICK input. Ensure sharedJoystickBuffer is set in JoystickControl.'
      )
    }
    setStickState(view, joystickId, stickValue)
    // logComposable.debug('Writing stick state to shared buffer:', { joystickId, direction, stickValue })

    // Update local state for display
    onStickStateChange?.(joystickId, stickValue)

    // Keep the STICK cell flashing while button is held
    flashingCells.value[`stick-${joystickId}`] = true

    // Pause existing interval for this button if any
    if (heldDpadButtons.value[buttonKey]) {
      heldDpadButtons.value[buttonKey]()
      heldDpadButtons.value[buttonKey] = null
    }

    // Set up repeat interval using VueUse
    // useIntervalFn starts immediately by default, so we just need to store pause
    const { pause } = useIntervalFn(() => {
      const view = getSharedJoystickView()
      if (!view) {
        throw new Error(
          'Shared joystick buffer is required for STICK input. Ensure sharedJoystickBuffer is set in JoystickControl.'
        )
      }
      setStickState(view, joystickId, stickValue)
      // logComposable.debug('Repeating stick state to shared buffer:', { joystickId, direction, stickValue })
    }, dpadRepeatInterval)
    heldDpadButtons.value[buttonKey] = pause
  }

  const stopDpadHold = (joystickId: number, direction: 'up' | 'down' | 'left' | 'right') => {
    const buttonKey = `${joystickId}-${direction}`

    // Only process if button was actually being held
    const wasHeld = heldDpadButtons.value[buttonKey] !== null && heldDpadButtons.value[buttonKey] !== undefined

    // Pause the repeat interval
    if (heldDpadButtons.value[buttonKey]) {
      heldDpadButtons.value[buttonKey]()
      heldDpadButtons.value[buttonKey] = null
    }

    // Only send release event and stop flashing if button was actually being held
    if (wasHeld) {
      const view = getSharedJoystickView()
      if (!view) {
        throw new Error(
          'Shared joystick buffer is required for STICK input. Ensure sharedJoystickBuffer is set in JoystickControl.'
        )
      }
      setStickState(view, joystickId, 0)
      logComposable.debug('Writing stick release to shared buffer:', { joystickId, direction, stickValue: 0 })

      // Update local state for display
      onStickStateChange?.(joystickId, 0)
    }

    // Check if any D-pad buttons for this joystick are still being held
    const anyDpadHeldForJoystick = Object.entries(heldDpadButtons.value).some(
      ([key, interval]) => interval !== null && key.startsWith(`${joystickId}-`)
    )

    // Check if any D-pad buttons are still being held (across all joysticks)
    const anyDpadHeld = Object.values(heldDpadButtons.value).some(interval => interval !== null)

    if (!anyDpadHeldForJoystick) {
      // No D-pad buttons are being held for this joystick, stop flashing
      flashingCells.value[`stick-${joystickId}`] = false
    }

    if (!anyDpadHeld) {
      // No D-pad buttons are being held (across all joysticks), allow polling to resume
      usingManualControls.value = false
    }
  }

  // Toggle action button (pulse effect - supports simultaneous button presses)
  const toggleActionButton = (joystickId: number, button: 'select' | 'start' | 'a' | 'b') => {
    const buttonKey = `${joystickId}-${button}`

    // If button is already pressed, ignore (prevent double-press)
    if (pressedActionButtons.value.has(buttonKey)) {
      return
    }

    // Add button to pressed set
    pressedActionButtons.value.add(buttonKey)

    // Set button to active state for UI display
    heldButtons.value[buttonKey] = true

    // Map button names to STRIG values
    const buttonMap: Record<string, number> = {
      select: 2,
      start: 1,
      b: 4,
      a: 8,
    }

    // Calculate combined STRIG value from ALL currently pressed buttons
    let combinedStrigValue = 0
    for (const pressedKey of pressedActionButtons.value) {
      if (pressedKey.startsWith(`${joystickId}-`)) {
        const btn = pressedKey.split('-')[1] as 'select' | 'start' | 'a' | 'b'
        combinedStrigValue |= buttonMap[btn] ?? 0
      }
    }

    // Send combined STRIG event via message passing (consume pattern)
    // STRIG always uses message passing, NOT shared buffer (unlike STICK)
    if (sendStrigEvent && combinedStrigValue > 0) {
      sendStrigEvent(joystickId, combinedStrigValue)
    }

    // Update local state for display
    onStrigStateChange?.(joystickId, combinedStrigValue)

    // Flash the STRIG cell
    flashCell(`strig-${joystickId}`)

    // Set up timer to reset this button and recalculate combined value
    const { start } = useTimeoutFn(() => {
      // Remove this button from pressed set
      pressedActionButtons.value.delete(buttonKey)
      heldButtons.value[buttonKey] = false

      // Recalculate and send new combined value (0 if no buttons pressed)
      let newCombinedValue = 0
      for (const pressedKey of pressedActionButtons.value) {
        if (pressedKey.startsWith(`${joystickId}-`)) {
          const btn = pressedKey.split('-')[1] as 'select' | 'start' | 'a' | 'b'
          newCombinedValue |= buttonMap[btn] ?? 0
        }
      }

      // Send updated STRIG value
      if (sendStrigEvent) {
        sendStrigEvent(joystickId, newCombinedValue)
      }
      onStrigStateChange?.(joystickId, newCombinedValue)
    }, 300) // Hold for 300ms to allow simultaneous detection
    start()
  }

  // Cleanup function
  const cleanup = () => {
    // Clean up all D-pad intervals (pause them)
    for (const [_buttonKey, pauseFn] of Object.entries(heldDpadButtons.value)) {
      if (pauseFn) {
        pauseFn()
      }
    }
    heldDpadButtons.value = {}

    // Clear pressed action buttons
    pressedActionButtons.value.clear()
  }

  // Clean up on unmount AND deactivation (keep-alive)
  onUnmounted(cleanup)
  onDeactivated(cleanup)

  return {
    heldButtons,
    flashingCells,
    usingManualControls,
    startDpadHold,
    stopDpadHold,
    toggleActionButton,
    cleanup,
  }
}
