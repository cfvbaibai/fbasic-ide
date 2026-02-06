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
      console.log('[useMovementStateSync] movementStates changed', {
        newStatesCount: newStates?.length ?? 0,
        activeMovements: newStates?.filter(m => m.isActive).map(m => m.actionNumber) ?? [],
      })

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
            // Preserve remaining distance if movement is still active
            // Position is in Konva nodes, not in state
            return {
              ...m,
              remainingDistance: existing.remainingDistance,
              currentFrameIndex: existing.currentFrameIndex,
              frameCounter: existing.frameCounter,
              definition: { ...m.definition },
            }
          } else if (!m.isActive) {
            // Movement was stopped (CUT) - preserve remaining distance
            // Position is in Konva nodes, not in state
            return {
              ...m,
              remainingDistance: existing.remainingDistance,
              definition: { ...m.definition },
            }
          }
          // Movement was restarted (existing.isActive=false, m.isActive=true)
          // Use new state (fresh movement with full remainingDistance)
          // Frame state (currentFrameIndex, frameCounter) is reset for new movement
        }
        // New movement or movement was restarted - use new state
        return {
          ...m,
          definition: { ...m.definition },
        }
      })

      console.log('[useMovementStateSync] After sync, localMovementStates', {
        total: localMovementStates.value.length,
        active: localMovementStates.value.filter(m => m.isActive).map(m => m.actionNumber),
      })

      // Trigger callback after sync
      if (onSync) {
        console.log('[useMovementStateSync] Calling onSync callback')
        onSync()
      }
    },
    { immediate: true, deep: true }
  )

  return {
    localMovementStates,
  }
}
