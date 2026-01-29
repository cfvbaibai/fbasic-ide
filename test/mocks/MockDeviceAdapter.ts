/**
 * Mock Device Adapter for Layer 2 Integration Tests
 *
 * Extends TestDeviceAdapter with simulation helpers for sprite movement lifecycle tests.
 * Simulates frontend position updates and movement completion for worker-frontend communication tests.
 */

import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'
import type { AnimationCommand } from '@/core/interfaces'

export interface SimulateAnimationFrameState {
  actionNumber: number
  currentX: number
  currentY: number
  remainingDistance?: number
}

export class MockDeviceAdapter extends TestDeviceAdapter {
  /**
   * Simulate frontend sending a position update (e.g. UPDATE_MOVEMENT_POSITION).
   * Updates getSpritePosition() so XPOS/YPOS return this position.
   */
  simulatePositionUpdate(actionNumber: number, position: { x: number; y: number }): void {
    this.setSpritePositionForTest(actionNumber, position.x, position.y)
  }

  /**
   * Simulate frontend movement completion at final position.
   * Sets position; test must call CUT to stop movement so MOVE(n) returns 0.
   */
  simulateMovementComplete(actionNumber: number, finalPosition: { x: number; y: number }): void {
    this.setSpritePositionForTest(actionNumber, finalPosition.x, finalPosition.y)
  }

  /**
   * Simulate an animation frame with current position (and optional remaining distance).
   * Equivalent to simulatePositionUpdate for position; remainingDistance is for future use.
   */
  simulateAnimationFrame(state: SimulateAnimationFrameState): void {
    this.setSpritePositionForTest(state.actionNumber, state.currentX, state.currentY)
  }

  /** All START_MOVEMENT commands sent to frontend */
  getStartMovementCalls(): AnimationCommand[] {
    return this.animationCommandCalls.filter(
      (c): c is AnimationCommand & { type: 'START_MOVEMENT' } => c.type === 'START_MOVEMENT'
    )
  }

  /** All SET_POSITION commands sent to frontend */
  getPositionCalls(): AnimationCommand[] {
    return this.animationCommandCalls.filter(
      (c): c is AnimationCommand & { type: 'SET_POSITION' } => c.type === 'SET_POSITION'
    )
  }

  /** Last animation command sent (for assertions on type, actionNumber, x, y, etc.) */
  get lastMessage(): AnimationCommand {
    const len = this.animationCommandCalls.length
    if (len === 0) {
      throw new Error('MockDeviceAdapter: no animation commands sent yet')
    }
    return this.animationCommandCalls[len - 1]!
  }
}
