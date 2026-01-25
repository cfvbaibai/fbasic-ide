/**
 * Movement state synchronization composable
 * Manages synchronization between parent movement states and local mutable copy
 */

import { type Ref, ref, watch } from 'vue'

import type { MovementState } from '@/core/sprite/types'

export interface UseMovementStateSyncOptions {
  movementStates: Ref<MovementState[] | undefined>
  onSync?: () => void
}

/**
 * Synchronize movement states from parent to local mutable copy
 * Merges with existing states to preserve positions of active movements
 */
export function useMovementStateSync(options: UseMovementStateSyncOptions) {
  const { movementStates, onSync } = options

  // Local mutable copy of movement states for animation updates
  const localMovementStates = ref<MovementState[]>([])

  // Update local movement states from props
  // MOVE command states - animation loop handles rendering of these
  watch(
    movementStates,
    newStates => {
      if (!newStates || newStates.length === 0) {
        localMovementStates.value = []
        return
      }

      // Deep clone movement states to make them mutable
      // Merge with existing states to preserve positions of active movements
      const existingStates = new Map(localMovementStates.value.map(m => [m.actionNumber, m]))

      localMovementStates.value = newStates.map(m => {
        const existing = existingStates.get(m.actionNumber)
        if (existing) {
          if (existing.isActive && m.isActive) {
            // Preserve existing position if movement is still active
            return {
              ...m,
              currentX: existing.currentX,
              currentY: existing.currentY,
              remainingDistance: existing.remainingDistance,
              definition: { ...m.definition },
            }
          } else if (!m.isActive && existing.currentX !== undefined && existing.currentY !== undefined) {
            // Movement was stopped (CUT) - preserve current position from local state
            // The web worker state might have stale positions, so use the animated position
            return {
              ...m,
              currentX: existing.currentX,
              currentY: existing.currentY,
              remainingDistance: existing.remainingDistance,
              definition: { ...m.definition },
            }
          }
        }
        // New movement or movement was restarted - use new state
        return {
          ...m,
          definition: { ...m.definition },
        }
      })

      // Trigger callback after sync
      if (onSync) {
        onSync()
      }
    },
    { immediate: true, deep: true }
  )

  return {
    localMovementStates,
  }
}
