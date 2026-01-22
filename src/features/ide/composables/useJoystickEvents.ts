import { ref, onUnmounted } from 'vue'
import { useTimeoutFn, useIntervalFn } from '@vueuse/core'

interface UseJoystickEventsOptions {
  sendStickEvent?: (joystickId: number, state: number) => void
  sendStrigEvent?: (joystickId: number, state: number) => void
  onStickStateChange?: (joystickId: number, state: number) => void
  onStrigStateChange?: (joystickId: number, state: number) => void
  onCellFlash?: (cellKey: string) => void
}

export function useJoystickEvents(options: UseJoystickEventsOptions = {}) {
  const {
    sendStickEvent,
    sendStrigEvent,
    onStickStateChange,
    onStrigStateChange,
    onCellFlash
  } = options

  // Track which buttons are currently "held" (toggle state)
  const heldButtons = ref<Record<string, boolean>>({})

  // Track which D-pad buttons are being held for periodic triggering
  // Store the pause function from useIntervalFn (Pausable interface)
  const heldDpadButtons = ref<Record<string, (() => void) | null>>({})
  const dpadRepeatInterval = 100 // Repeat every 100ms when held

  // Track if we're actively using manual controls to prevent polling interference
  const usingManualControls = ref(false)
  const actionButtonActive = ref(false)

  // Track flashing state for table cells
  const flashingCells = ref<Record<string, boolean>>({})

  // Track STRIG reset timers - store the stop function from useTimeoutFn
  const strigResetTimers = ref<Record<number, (() => void) | null>>({})

  // Helper function to flash a table cell
  const flashCell = (cellKey: string) => {
    flashingCells.value[cellKey] = true
    const { start } = useTimeoutFn(() => {
      flashingCells.value[cellKey] = false
    }, 200) // Flash for 200ms
    start()
    onCellFlash?.(cellKey)
  }

  // Helper function to reset STRIG value after delay
  const resetStrigValue = (joystickId: number) => {
    // Stop existing timer if any
    if (strigResetTimers.value[joystickId]) {
      strigResetTimers.value[joystickId]!()
      strigResetTimers.value[joystickId] = null
    }
    
    // Set new timer to reset STRIG value after 300ms
    const { start, stop } = useTimeoutFn(() => {
      onStrigStateChange?.(joystickId, 0)
      strigResetTimers.value[joystickId] = null
    }, 300)
    strigResetTimers.value[joystickId] = stop
    start()
  }

  // D-pad hold and repeat functions
  const startDpadHold = async (joystickId: number, direction: 'up' | 'down' | 'left' | 'right') => {
    const buttonKey = `${joystickId}-${direction}`
    
    // Set manual controls flag to prevent polling interference
    usingManualControls.value = true
    
    // Map direction names to STICK values
    const directionMap: Record<string, number> = {
      'up': 8,
      'down': 4,
      'left': 2,
      'right': 1
    }
    
    const stickValue = directionMap[direction] || 0
    
    // Send STICK event to service worker
    if (sendStickEvent && stickValue > 0) {
      console.log('🎮 [JOYSTICK_CONTROL] Sending STICK event:', { joystickId, direction, stickValue })
      sendStickEvent(joystickId, stickValue)
      
      // Update local state for display
      onStickStateChange?.(joystickId, stickValue)
      
      // Keep the STICK cell flashing while button is held
      flashingCells.value[`stick-${joystickId}`] = true
    }
    
    // Pause existing interval for this button if any
    if (heldDpadButtons.value[buttonKey]) {
      heldDpadButtons.value[buttonKey]!()
      heldDpadButtons.value[buttonKey] = null
    }
    
    // Set up repeat interval using VueUse
    // useIntervalFn starts immediately by default, so we just need to store pause
    const { pause } = useIntervalFn(() => {
      if (sendStickEvent && stickValue > 0) {
        console.log('🎮 [JOYSTICK_CONTROL] Repeating STICK event:', { joystickId, direction, stickValue })
        sendStickEvent(joystickId, stickValue)
      }
    }, dpadRepeatInterval)
    heldDpadButtons.value[buttonKey] = pause
  }

  const stopDpadHold = async (joystickId: number, direction: 'up' | 'down' | 'left' | 'right') => {
    const buttonKey = `${joystickId}-${direction}`
    
    // Only process if button was actually being held
    const wasHeld = heldDpadButtons.value[buttonKey] !== null && heldDpadButtons.value[buttonKey] !== undefined
    
    // Pause the repeat interval
    if (heldDpadButtons.value[buttonKey]) {
      heldDpadButtons.value[buttonKey]!()
      heldDpadButtons.value[buttonKey] = null
    }
    
    // Only send release event and stop flashing if button was actually being held
    if (wasHeld && sendStickEvent) {
      console.log('🎮 [JOYSTICK_CONTROL] Sending STICK release event:', { joystickId, direction, stickValue: 0 })
      sendStickEvent(joystickId, 0)
      
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

  // Toggle action button (pulse effect - only send pressed event)
  const toggleActionButton = async (joystickId: number, button: 'select' | 'start' | 'a' | 'b') => {
    const buttonKey = `${joystickId}-${button}`
    
    // Prevent multiple triggers if button is already active
    if (actionButtonActive.value) {
      return
    }
    
    // Set action button flag to prevent polling interference
    actionButtonActive.value = true
    
    // Set button to active state
    heldButtons.value[buttonKey] = true
    
    // Map button names to STRIG values
    const buttonMap: Record<string, number> = {
      'select': 2,
      'start': 1,
      'b': 4,
      'a': 8
    }
    
    const strigValue = buttonMap[button] || 0
    
    // Send STRIG event to service worker
    if (sendStrigEvent && strigValue > 0) {
      console.log('🎮 [JOYSTICK_CONTROL] Sending STRIG event:', { joystickId, button, strigValue })
      sendStrigEvent(joystickId, strigValue)
      
      // Update local state for display
      onStrigStateChange?.(joystickId, strigValue)
      
      // Flash the STRIG cell
      flashCell(`strig-${joystickId}`)
      
      // Set up timer to reset STRIG value after 300ms
      resetStrigValue(joystickId)
    }
    
    // Reset button state immediately after sending pressed event
    const { start } = useTimeoutFn(() => {
      heldButtons.value[buttonKey] = false
      
      // Allow polling to resume after action button is processed
      actionButtonActive.value = false
    }, 50) // Short delay to ensure pressed event is processed
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
    
    // Clean up all STRIG timers (stop them)
    for (const [_joystickId, stopFn] of Object.entries(strigResetTimers.value)) {
      if (stopFn) {
        stopFn()
      }
    }
    strigResetTimers.value = {}
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    heldButtons,
    flashingCells,
    usingManualControls,
    startDpadHold,
    stopDpadHold,
    toggleActionButton,
    cleanup
  }
}
