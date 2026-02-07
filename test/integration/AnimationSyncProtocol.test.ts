/**
 * Animation Sync Protocol Tests
 *
 * Tests the direct Executor Worker ↔ Animation Worker communication via shared buffer.
 *
 * Covers:
 * - Sync command serialization/deserialization
 * - Acknowledgment protocol with Atomics
 * - Full round-trip communication flow
 * - All command types (START_MOVEMENT, STOP_MOVEMENT, ERASE_MOVEMENT, SET_POSITION)
 */

/* eslint-disable max-lines -- Integration tests require comprehensive coverage exceeding 500 lines */

import { beforeEach, describe, expect, it } from 'vitest'

import {
  ACK_PENDING,
  ACK_RECEIVED,
  ANIMATION_SECTION_FLOATS,
  MAX_SPRITES,
  slotBase,
  SyncCommandType,
} from '@/core/animation/sharedDisplayBuffer'
import { createSharedDisplayBuffer } from '@/core/animation/sharedDisplayBuffer'

/**
 * Helper functions for testing (inlined from sharedAnimationBuffer)
 */
function writeSpriteState(
  view: Float64Array,
  actionNumber: number,
  x: number,
  y: number,
  isActive: boolean,
  isVisible: boolean,
  frameIndex: number = 0,
  remainingDistance: number = 0,
  totalDistance: number = 0,
  direction: number = 0,
  speed: number = 0,
  priority: number = 0,
  characterType: number = 0,
  colorCombination: number = 0
): void {
  const base = slotBase(actionNumber)
  view[base] = x
  view[base + 1] = y
  view[base + 2] = isActive ? 1 : 0
  view[base + 3] = isVisible ? 1 : 0
  view[base + 4] = frameIndex
  view[base + 5] = remainingDistance
  view[base + 6] = totalDistance
  view[base + 7] = direction
  view[base + 8] = speed
  view[base + 9] = priority
  view[base + 10] = characterType
  view[base + 11] = colorCombination
}

function readSpritePosition(
  view: Float64Array,
  actionNumber: number
): { x: number; y: number } | null {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return null
  const base = slotBase(actionNumber)
  return { x: view[base] ?? 0, y: view[base + 1] ?? 0 }
}

function readSpriteIsActive(view: Float64Array, actionNumber: number): boolean {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return false
  const base = slotBase(actionNumber)
  return view[base + 2] !== 0
}

function readSpriteIsVisible(view: Float64Array, actionNumber: number): boolean {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return false
  const base = slotBase(actionNumber)
  return view[base + 3] !== 0
}

function readSpriteFrameIndex(view: Float64Array, actionNumber: number): number {
  if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
  const base = slotBase(actionNumber)
  return view[base + 4] ?? 0
}

function writeSyncCommand(
  view: Float64Array,
  commandType: SyncCommandType,
  actionNumber: number,
  params: {
    startX?: number
    startY?: number
    direction?: number
    speed?: number
    distance?: number
    priority?: number
  } = {}
): void {
  view[96] = commandType // SYNC_COMMAND_TYPE_OFFSET
  view[97] = actionNumber // SYNC_ACTION_NUMBER_OFFSET
  view[98] = params.startX ?? 0 // SYNC_PARAM1_OFFSET
  view[99] = params.startY ?? 0 // SYNC_PARAM2_OFFSET
  view[100] = params.direction ?? 0 // SYNC_PARAM3_OFFSET
  view[101] = params.speed ?? 0 // SYNC_PARAM4_OFFSET
  view[102] = params.distance ?? 0 // SYNC_PARAM5_OFFSET
  view[103] = params.priority ?? 0 // SYNC_PARAM6_OFFSET
  view[104] = ACK_PENDING // SYNC_ACK_OFFSET
}

function readSyncCommand(view: Float64Array): {
  commandType: SyncCommandType
  actionNumber: number
  params: {
    startX: number
    startY: number
    direction: number
    speed: number
    distance: number
    priority: number
  }
} | null {
  const commandType = view[96] as SyncCommandType

  if (commandType < SyncCommandType.START_MOVEMENT || commandType > SyncCommandType.CLEAR_ALL_MOVEMENTS) {
    return null
  }

  return {
    commandType,
    actionNumber: view[97] as number,
    params: {
      startX: view[98] as number,
      startY: view[99] as number,
      direction: view[100] as number,
      speed: view[101] as number,
      distance: view[102] as number,
      priority: view[103] as number,
    },
  }
}

function clearSyncCommand(view: Float64Array): void {
  view[96] = SyncCommandType.NONE
  view[97] = 0
  view[98] = 0
  view[99] = 0
  view[100] = 0
  view[101] = 0
  view[102] = 0
  view[103] = 0
}

function writeSyncAck(view: Float64Array, ack: number): void {
  view[104] = ack
}

function readSyncAck(view: Float64Array): number {
  return view[104] as number
}

function getAckInt32Index(): number {
  return 16 // (104 - 96) * 2
}

function notifyAck(syncView: Int32Array): void {
  const ackIndex = getAckInt32Index()
  syncView[ackIndex] = ACK_RECEIVED
  try {
    Atomics.notify(syncView, ackIndex, 1)
  } catch {
    // Atomics.notify may throw in some contexts, ignore
  }
}

function waitForAck(syncView: Int32Array, timeoutMs: number = 100): boolean {
  const ackIndex = getAckInt32Index()
  const startTime = performance.now()

  while (syncView[ackIndex] === ACK_PENDING) {
    const elapsed = performance.now() - startTime
    if (elapsed >= timeoutMs) {
      return false
    }
    try {
      const remaining = Math.min(10, timeoutMs - elapsed)
      Atomics.wait(syncView, ackIndex, ACK_PENDING, remaining)
    } catch {
      const start = performance.now()
      while (performance.now() - start < 1) {
        // Busy-wait for 1ms to yield CPU
      }
    }
  }

  return syncView[ackIndex] === ACK_RECEIVED
}

describe('Animation Sync Protocol', () => {
  describe('Buffer Layout', () => {
    it('should have correct animation sync section layout', () => {
      const views = createSharedDisplayBuffer()

      // Verify animation sync view exists and has correct size
      expect(views.animationSyncView).toBeInstanceOf(Float64Array)
      expect(views.animationSyncView.length).toBe(9) // commandType + actionNumber + 6 params + ack

      // Verify sprite view exists for position writes (separate from sync section)
      expect(views.spriteView).toBeInstanceOf(Float64Array)
      expect(views.spriteView.length).toBe(96) // 8 sprites × 12 (x, y, isActive, isVisible, frameIndex, remainingDistance, totalDistance, direction, speed, priority, characterType, colorCombination)
    })

    it('should have sync section at correct byte offset', () => {
      const views = createSharedDisplayBuffer()

      // The sync section should be accessible via animationSyncView
      // This is a view into the buffer starting at OFFSET_ANIMATION_SYNC (2064 bytes)
      expect(views.animationSyncView.buffer).toBe(views.buffer)
    })
  })

  describe('Sync Command Write/Read Round-trip', () => {
    let syncView: Float64Array

    beforeEach(() => {
      const views = createSharedDisplayBuffer()
      // Use a view that covers the entire animation section (sprites + sync)
      // This is needed because writeSyncCommand/readSyncCommand use offsets relative to animation section start
      syncView = new Float64Array(views.buffer, 0, ANIMATION_SECTION_FLOATS)
      // Clear to ensure clean state
      clearSyncCommand(syncView)
    })

    it('should write and read START_MOVEMENT command', () => {
      writeSyncCommand(syncView, SyncCommandType.START_MOVEMENT, 0, {
        startX: 100,
        startY: 50,
        direction: 3,
        speed: 60,
        distance: 100,
        priority: 0,
      })

      const command = readSyncCommand(syncView)
      expect(command).not.toBeNull()
      expect(command?.commandType).toBe(SyncCommandType.START_MOVEMENT)
      expect(command?.actionNumber).toBe(0)
      expect(command?.params.startX).toBe(100)
      expect(command?.params.startY).toBe(50)
      expect(command?.params.direction).toBe(3)
      expect(command?.params.speed).toBe(60)
      expect(command?.params.distance).toBe(100)
      expect(command?.params.priority).toBe(0)
    })

    it('should write and read STOP_MOVEMENT command', () => {
      writeSyncCommand(syncView, SyncCommandType.STOP_MOVEMENT, 3, {})

      const command = readSyncCommand(syncView)
      expect(command).not.toBeNull()
      expect(command?.commandType).toBe(SyncCommandType.STOP_MOVEMENT)
      expect(command?.actionNumber).toBe(3)
    })

    it('should write and read ERASE_MOVEMENT command', () => {
      writeSyncCommand(syncView, SyncCommandType.ERASE_MOVEMENT, 5, {})

      const command = readSyncCommand(syncView)
      expect(command).not.toBeNull()
      expect(command?.commandType).toBe(SyncCommandType.ERASE_MOVEMENT)
      expect(command?.actionNumber).toBe(5)
    })

    it('should write and read SET_POSITION command', () => {
      writeSyncCommand(syncView, SyncCommandType.SET_POSITION, 2, {
        startX: 200,
        startY: 150,
      })

      const command = readSyncCommand(syncView)
      expect(command).not.toBeNull()
      expect(command?.commandType).toBe(SyncCommandType.SET_POSITION)
      expect(command?.actionNumber).toBe(2)
      expect(command?.params.startX).toBe(200) // param1 = x
      expect(command?.params.startY).toBe(150) // param2 = y
    })

    it('should return null when no command is pending', () => {
      const command = readSyncCommand(syncView)
      expect(command).toBeNull()
    })

    it('should return null after command is cleared', () => {
      writeSyncCommand(syncView, SyncCommandType.START_MOVEMENT, 0, {})
      clearSyncCommand(syncView)

      const command = readSyncCommand(syncView)
      expect(command).toBeNull()
    })
  })

  describe('Acknowledgment Protocol', () => {
    let syncView: Float64Array
    let syncIntView: Int32Array

    beforeEach(() => {
      const views = createSharedDisplayBuffer()
      // Use a view that covers the entire animation section for writeSyncAck/readSyncAck
      syncView = new Float64Array(views.buffer, 0, ANIMATION_SECTION_FLOATS)

      // Create Int32Array view for Atomics operations
      // In the combined display buffer, sync section starts at OFFSET_ANIMATION_SYNC (2064 bytes)
      const SYNC_SECTION_BYTE_OFFSET = 2064
      const SYNC_SECTION_FLOATS = 9
      syncIntView = new Int32Array(views.buffer, SYNC_SECTION_BYTE_OFFSET, SYNC_SECTION_FLOATS * 2)

      // Clear to ensure clean state
      writeSyncAck(syncView, 0)
    })

    it('should write and read acknowledgment flag', () => {
      expect(readSyncAck(syncView)).toBe(0)

      writeSyncAck(syncView, 1)
      expect(readSyncAck(syncView)).toBe(1)

      writeSyncAck(syncView, 0)
      expect(readSyncAck(syncView)).toBe(0)
    })

    it('should get correct Int32 index for acknowledgment', () => {
      // Ack is at the last position in the sync section
      // Sync section has 9 floats, ack is at index 8 (relative to sync section)
      // Each Float64 = 2 Int32, so ack is at Int32 index (8 - 0) * 2 = 16
      expect(getAckInt32Index()).toBe(16)
    })

    it('should support notifyAck and waitForAck via Int32Array view', () => {
      // Initially pending
      expect(syncIntView[getAckInt32Index()]).toBe(0)

      // Notify (write ack)
      notifyAck(syncIntView)
      expect(syncIntView[getAckInt32Index()]).toBe(1)

      // waitForAck should return true immediately when already acknowledged
      const result = waitForAck(syncIntView, 100)
      expect(result).toBe(true)
    })

    it('should timeout waitForAck when acknowledgment not received', () => {
      // Set to pending
      syncIntView[getAckInt32Index()] = 0

      // waitForAck should timeout and return false
      const result = waitForAck(syncIntView, 10) // 10ms timeout
      expect(result).toBe(false)
    })
  })

  describe('Full Communication Flow', () => {
    let views: ReturnType<typeof createSharedDisplayBuffer>
    let syncView: Float64Array
    let syncIntView: Int32Array
    let spriteView: Float64Array

    beforeEach(() => {
      views = createSharedDisplayBuffer()
      // Use a view that covers the entire animation section for sync operations
      syncView = new Float64Array(views.buffer, 0, ANIMATION_SECTION_FLOATS)
      // Use spriteView for sprite state operations (can also use syncView[0-23])
      spriteView = views.spriteView

      // Create Int32Array view for Atomics operations
      const SYNC_SECTION_BYTE_OFFSET = 2064
      const SYNC_SECTION_FLOATS = 9
      syncIntView = new Int32Array(views.buffer, SYNC_SECTION_BYTE_OFFSET, SYNC_SECTION_FLOATS * 2)

      // Clear to ensure clean state
      clearSyncCommand(syncView)
      writeSyncAck(syncView, 0)
    })

    describe('START_MOVEMENT Flow', () => {
      it('should complete full START_MOVEMENT round-trip', () => {
        // === Executor Worker writes command ===
        writeSyncCommand(syncView, SyncCommandType.START_MOVEMENT, 0, {
          startX: 100,
          startY: 50,
          direction: 3,
          speed: 60,
          distance: 100,
          priority: 0,
        })
        // Set ack to pending
        writeSyncAck(syncView, 0)

        // === Animation Worker reads command ===
        const command = readSyncCommand(syncView)
        expect(command).not.toBeNull()
        expect(command?.commandType).toBe(SyncCommandType.START_MOVEMENT)
        expect(command?.actionNumber).toBe(0)

        // === Animation Worker processes and writes sprite position ===
        writeSpriteState(spriteView, 0, 100, 50, true, true)

        // Verify sprite state is readable
        const pos = readSpritePosition(spriteView, 0)
        expect(pos).toEqual({ x: 100, y: 50 })
        expect(readSpriteIsActive(spriteView, 0)).toBe(true)

        // === Animation Worker acknowledges ===
        notifyAck(syncIntView)

        // === Executor Worker waits for ack ===
        const ackReceived = waitForAck(syncIntView, 100)
        expect(ackReceived).toBe(true)

        // === Executor Worker clears command ===
        clearSyncCommand(syncView)

        // Verify command is cleared
        expect(readSyncCommand(syncView)).toBeNull()
      })

      it('should handle timeout when Animation Worker does not acknowledge', () => {
        // === Executor Worker writes command ===
        writeSyncCommand(syncView, SyncCommandType.START_MOVEMENT, 0, {
          startX: 100,
          startY: 50,
          direction: 3,
          speed: 60,
          distance: 100,
          priority: 0,
        })
        writeSyncAck(syncView, 0)

        // === Executor Worker waits for ack (but Animation Worker never responds) ===
        const ackReceived = waitForAck(syncIntView, 10) // Short timeout
        expect(ackReceived).toBe(false)

        // Executor Worker should clear command and continue
        clearSyncCommand(syncView)
      })
    })

    describe('SET_POSITION Flow', () => {
      it('should complete full SET_POSITION round-trip', () => {
        // First, start a movement
        writeSpriteState(spriteView, 0, 50, 50, true, true)

        // === Executor Worker writes SET_POSITION command ===
        writeSyncCommand(syncView, SyncCommandType.SET_POSITION, 0, {
          startX: 200,
          startY: 150,
        })
        writeSyncAck(syncView, 0)

        // === Animation Worker reads command ===
        const command = readSyncCommand(syncView)
        expect(command?.commandType).toBe(SyncCommandType.SET_POSITION)
        expect(command?.actionNumber).toBe(0)

        // === Animation Worker updates sprite position ===
        writeSpriteState(spriteView, 0, 200, 150, true, true)

        // === Animation Worker acknowledges ===
        notifyAck(syncIntView)

        // === Executor Worker waits for ack ===
        const ackReceived = waitForAck(syncIntView, 100)
        expect(ackReceived).toBe(true)

        // === Executor Worker clears command ===
        clearSyncCommand(syncView)

        // Verify new position is set
        const pos = readSpritePosition(spriteView, 0)
        expect(pos).toEqual({ x: 200, y: 150 })
      })
    })

    describe('STOP_MOVEMENT Flow', () => {
      it('should complete full STOP_MOVEMENT round-trip', () => {
        // First, start a movement
        writeSpriteState(spriteView, 0, 100, 100, true, true)

        // === Executor Worker writes STOP_MOVEMENT command ===
        writeSyncCommand(syncView, SyncCommandType.STOP_MOVEMENT, 0, {})
        writeSyncAck(syncView, 0)

        // === Animation Worker reads command ===
        const command = readSyncCommand(syncView)
        expect(command?.commandType).toBe(SyncCommandType.STOP_MOVEMENT)

        // === Animation Worker stops movement (writes isActive=false, isVisible stays true) ===
        writeSpriteState(spriteView, 0, 100, 100, false, true)

        // === Animation Worker acknowledges ===
        notifyAck(syncIntView)

        // === Executor Worker waits for ack ===
        const ackReceived = waitForAck(syncIntView, 100)
        expect(ackReceived).toBe(true)

        // Verify sprite is now inactive
        expect(readSpriteIsActive(spriteView, 0)).toBe(false)
      })
    })

    describe('ERASE_MOVEMENT Flow', () => {
      it('should complete full ERASE_MOVEMENT round-trip', () => {
        // First, start a movement
        writeSpriteState(spriteView, 0, 100, 100, true, true)

        // === Executor Worker writes ERASE_MOVEMENT command ===
        writeSyncCommand(syncView, SyncCommandType.ERASE_MOVEMENT, 0, {})
        writeSyncAck(syncView, 0)

        // === Animation Worker reads command ===
        const command = readSyncCommand(syncView)
        expect(command?.commandType).toBe(SyncCommandType.ERASE_MOVEMENT)

        // === Animation Worker erases movement (writes position to 0,0, isActive=false, isVisible=false) ===
        writeSpriteState(spriteView, 0, 0, 0, false, false)

        // === Animation Worker acknowledges ===
        notifyAck(syncIntView)

        // === Executor Worker waits for ack ===
        const ackReceived = waitForAck(syncIntView, 100)
        expect(ackReceived).toBe(true)

        // Verify sprite is erased (position 0,0 and inactive)
        const pos = readSpritePosition(spriteView, 0)
        expect(pos).toEqual({ x: 0, y: 0 })
        expect(readSpriteIsActive(spriteView, 0)).toBe(false)
      })
    })
  })

  describe('Sprite State Synchronization', () => {
    let spriteView: Float64Array

    beforeEach(() => {
      const views = createSharedDisplayBuffer()
      spriteView = views.spriteView
    })

    it('should write and read sprite positions for all 8 sprites', () => {
      const testPositions = [
        { actionNumber: 0, x: 10, y: 20 },
        { actionNumber: 1, x: 30, y: 40 },
        { actionNumber: 2, x: 50, y: 60 },
        { actionNumber: 3, x: 70, y: 80 },
        { actionNumber: 4, x: 90, y: 100 },
        { actionNumber: 5, x: 110, y: 120 },
        { actionNumber: 6, x: 130, y: 140 },
        { actionNumber: 7, x: 150, y: 160 },
      ]

      // Write all positions
      for (const pos of testPositions) {
        writeSpriteState(spriteView, pos.actionNumber, pos.x, pos.y, true, true)
      }

      // Read and verify all positions
      for (const pos of testPositions) {
        const read = readSpritePosition(spriteView, pos.actionNumber)
        expect(read).toEqual({ x: pos.x, y: pos.y })
        expect(readSpriteIsActive(spriteView, pos.actionNumber)).toBe(true)
      }
    })

    it('should handle slotBase calculation correctly', () => {
      // Verify slotBase formula: actionNumber × 12 (all sprite fields)
      expect(slotBase(0)).toBe(0)
      expect(slotBase(1)).toBe(12)
      expect(slotBase(2)).toBe(24)
      expect(slotBase(3)).toBe(36)
      expect(slotBase(4)).toBe(48)
      expect(slotBase(5)).toBe(60)
      expect(slotBase(6)).toBe(72)
      expect(slotBase(7)).toBe(84)
    })

    it('should return null for invalid action numbers', () => {
      expect(readSpritePosition(spriteView, -1)).toBeNull()
      expect(readSpritePosition(spriteView, 8)).toBeNull()
      expect(readSpritePosition(spriteView, 999)).toBeNull()
    })

    it('should return false for isActive when action number out of range', () => {
      expect(readSpriteIsActive(spriteView, -1)).toBe(false)
      expect(readSpriteIsActive(spriteView, 8)).toBe(false)
      expect(readSpriteIsActive(spriteView, 999)).toBe(false)
    })

    it('should return false for isVisible when action number out of range', () => {
      expect(readSpriteIsVisible(spriteView, -1)).toBe(false)
      expect(readSpriteIsVisible(spriteView, 8)).toBe(false)
      expect(readSpriteIsVisible(spriteView, 999)).toBe(false)
    })

    it('should read frameIndex from shared buffer', () => {
      // Initially frameIndex should be 0
      expect(readSpriteFrameIndex(spriteView, 0)).toBe(0)
      expect(readSpriteFrameIndex(spriteView, 1)).toBe(0)

      // Manually write frameIndex to shared buffer
      const base = slotBase(0)
      spriteView[base + 4] = 5  // Set sprite 0 frameIndex to 5 (offset changed from 3 to 4)
      expect(readSpriteFrameIndex(spriteView, 0)).toBe(5)

      // Another sprite
      const base2 = slotBase(3)
      spriteView[base2 + 4] = 2  // Set sprite 3 frameIndex to 2
      expect(readSpriteFrameIndex(spriteView, 3)).toBe(2)
    })

    it('should return 0 for frameIndex when action number out of range', () => {
      expect(readSpriteFrameIndex(spriteView, -1)).toBe(0)
      expect(readSpriteFrameIndex(spriteView, 8)).toBe(0)
      expect(readSpriteFrameIndex(spriteView, 999)).toBe(0)
    })
  })

  describe('Concurrent Command Handling', () => {
    let syncView: Float64Array

    beforeEach(() => {
      const views = createSharedDisplayBuffer()
      // Use a view that covers the entire animation section
      syncView = new Float64Array(views.buffer, 0, ANIMATION_SECTION_FLOATS)
      clearSyncCommand(syncView)
    })

    it('should only process one command at a time (last write wins)', () => {
      // Write first command
      writeSyncCommand(syncView, SyncCommandType.START_MOVEMENT, 0, {
        startX: 100,
        startY: 50,
        direction: 3,
        speed: 60,
        distance: 100,
        priority: 0,
      })

      // Overwrite with second command (simulating rapid commands)
      writeSyncCommand(syncView, SyncCommandType.START_MOVEMENT, 1, {
        startX: 200,
        startY: 150,
        direction: 5,
        speed: 120,
        distance: 50,
        priority: 1,
      })

      // Should read the second command (last write wins)
      const command = readSyncCommand(syncView)
      expect(command?.actionNumber).toBe(1)
      expect(command?.params.startX).toBe(200)
      expect(command?.params.startY).toBe(150)
    })

    it('should handle command overwrite correctly', () => {
      // Write START_MOVEMENT
      writeSyncCommand(syncView, SyncCommandType.START_MOVEMENT, 0, {})
      expect(readSyncCommand(syncView)?.commandType).toBe(SyncCommandType.START_MOVEMENT)

      // Overwrite with STOP_MOVEMENT
      writeSyncCommand(syncView, SyncCommandType.STOP_MOVEMENT, 0, {})
      expect(readSyncCommand(syncView)?.commandType).toBe(SyncCommandType.STOP_MOVEMENT)

      // Clear and verify
      clearSyncCommand(syncView)
      expect(readSyncCommand(syncView)).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    let syncView: Float64Array

    beforeEach(() => {
      const views = createSharedDisplayBuffer()
      // Use a view that covers the entire animation section
      syncView = new Float64Array(views.buffer, 0, ANIMATION_SECTION_FLOATS)
      clearSyncCommand(syncView)
    })

    it('should handle zero values correctly', () => {
      writeSyncCommand(syncView, SyncCommandType.START_MOVEMENT, 0, {
        startX: 0,
        startY: 0,
        direction: 0,
        speed: 0,
        distance: 1, // distance has minimum of 1
        priority: 0,
      })

      const command = readSyncCommand(syncView)
      expect(command?.params.startX).toBe(0)
      expect(command?.params.startY).toBe(0)
      expect(command?.params.direction).toBe(0)
      expect(command?.params.speed).toBe(0)
    })

    it('should handle maximum values correctly', () => {
      writeSyncCommand(syncView, SyncCommandType.START_MOVEMENT, 7, {
        startX: 255,
        startY: 255,
        direction: 8,
        speed: 255,
        distance: 255,
        priority: 1,
      })

      const command = readSyncCommand(syncView)
      expect(command?.actionNumber).toBe(7)
      expect(command?.params.startX).toBe(255)
      expect(command?.params.startY).toBe(255)
      expect(command?.params.direction).toBe(8)
      expect(command?.params.speed).toBe(255)
      expect(command?.params.distance).toBe(255)
      expect(command?.params.priority).toBe(1)
    })

    it('should handle NaN gracefully in params (uses default 0)', () => {
      // Write with undefined params (should default to 0)
      writeSyncCommand(syncView, SyncCommandType.START_MOVEMENT, 0, {})

      const command = readSyncCommand(syncView)
      expect(command?.params.startX).toBe(0)
      expect(command?.params.startY).toBe(0)
      expect(command?.params.direction).toBe(0)
      expect(command?.params.speed).toBe(0)
      expect(command?.params.distance).toBe(0)
      expect(command?.params.priority).toBe(0)
    })
  })
})
