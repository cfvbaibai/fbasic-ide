/**
 * CLEAR_ALL_MOVEMENTS Integration Test
 *
 * Tests that the CLEAR button properly clears the shared sprite buffer
 * via the CLEAR_ALL_MOVEMENTS sync command.
 */

import { describe, expect, it } from 'vitest'

import {
  slotBase,
  SyncCommandType,
} from '@/core/animation/sharedDisplayBuffer'
import { createSharedDisplayBuffer, OFFSET_ANIMATION_SYNC } from '@/core/animation/sharedDisplayBuffer'
import { SharedDisplayBufferAccessor } from '@/core/animation/sharedDisplayBufferAccessor'

/**
 * Helper function for testing (inlined from sharedAnimationBuffer)
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

describe('CLEAR_ALL_MOVEMENTS Integration', () => {
  describe('SharedDisplayBufferAccessor.readSyncCommand() with CLEAR_ALL_MOVEMENTS', () => {
    it('should read CLEAR_ALL_MOVEMENTS command (value 5) from buffer', () => {
      const views = createSharedDisplayBuffer()
      const accessor = new SharedDisplayBufferAccessor(views.buffer)

      // Write CLEAR_ALL_MOVEMENTS command directly to the sync section at byte 2128
      const SYNC_BYTE_OFFSET = OFFSET_ANIMATION_SYNC // 2128
      const syncView = new Float64Array(views.buffer, SYNC_BYTE_OFFSET, 9)
      syncView[0] = SyncCommandType.CLEAR_ALL_MOVEMENTS
      syncView[8] = 0 // ACK_PENDING

      // Read using SharedDisplayBufferAccessor
      const command = accessor.readSyncCommand()

      expect(command).not.toBeNull()
      expect(command?.commandType).toBe(SyncCommandType.CLEAR_ALL_MOVEMENTS)
    })

    it('should return null for NONE command (value 0)', () => {
      const views = createSharedDisplayBuffer()
      const accessor = new SharedDisplayBufferAccessor(views.buffer)

      // Ensure buffer is cleared (commandType = 0 = NONE)
      const SYNC_BYTE_OFFSET = OFFSET_ANIMATION_SYNC
      const syncView = new Float64Array(views.buffer, SYNC_BYTE_OFFSET, 9)
      syncView[0] = SyncCommandType.NONE

      const command = accessor.readSyncCommand()
      expect(command).toBeNull()
    })

    it('should read all valid command types (1-5)', () => {
      const views = createSharedDisplayBuffer()
      const accessor = new SharedDisplayBufferAccessor(views.buffer)

      const SYNC_BYTE_OFFSET = OFFSET_ANIMATION_SYNC
      const syncView = new Float64Array(views.buffer, SYNC_BYTE_OFFSET, 9)

      // Test all valid command types
      const validCommandTypes = [
        SyncCommandType.START_MOVEMENT,
        SyncCommandType.STOP_MOVEMENT,
        SyncCommandType.ERASE_MOVEMENT,
        SyncCommandType.SET_POSITION,
        SyncCommandType.CLEAR_ALL_MOVEMENTS,
      ]

      for (const commandType of validCommandTypes) {
        syncView[0] = commandType
        syncView[8] = 0 // ACK_PENDING

        const command = accessor.readSyncCommand()
        expect(command).not.toBeNull()
        expect(command?.commandType).toBe(commandType)
      }
    })
  })

  describe('clearAllSprites() method', () => {
    it('should clear all sprite data in the buffer', () => {
      const views = createSharedDisplayBuffer()
      const accessor = new SharedDisplayBufferAccessor(views.buffer)

      // First, populate all 8 sprite slots with data
      for (let i = 0; i < 8; i++) {
        accessor.writeSpriteState(
          i,
          100 + i * 10, // x
          50 + i * 5,  // y
          true,        // isActive
          true,        // isVisible
          i,           // frameIndex
          100,         // remainingDistance
          200,         // totalDistance
          3,           // direction
          60,          // speed
          0,           // priority
          i,           // characterType
          i            // colorCombination
        )
      }

      // Verify sprites are written
      for (let i = 0; i < 8; i++) {
        expect(accessor.readSpriteCharacterType(i)).toBe(i)
        expect(accessor.readSpriteIsActive(i)).toBe(true)
        const pos = accessor.readSpritePosition(i)
        expect(pos).toEqual({ x: 100 + i * 10, y: 50 + i * 5 })
      }

      // Clear all sprites
      accessor.clearAllSprites()

      // Verify all sprites are cleared (characterType = -1 means uninitialized)
      for (let i = 0; i < 8; i++) {
        expect(accessor.readSpriteCharacterType(i)).toBe(-1) // -1 = uninitialized
        expect(accessor.readSpriteIsActive(i)).toBe(false)
        expect(accessor.readSpriteIsVisible(i)).toBe(false)

        const pos = accessor.readSpritePosition(i)
        expect(pos).toEqual({ x: 0, y: 0 })
      }
    })
  })

  describe('Full CLEAR_ALL_MOVEMENTS flow simulation', () => {
    it('should simulate complete CLEAR button flow', () => {
      const views = createSharedDisplayBuffer()
      const accessor = new SharedDisplayBufferAccessor(views.buffer)

      // Create sync section view for write operations (at byte 2128)
      const syncView = new Float64Array(views.buffer, OFFSET_ANIMATION_SYNC, 9)

      // === Step 1: User runs a program with sprites ===
      // Simulate DEF MOVE + MOVE execution (writes to buffer)
      accessor.writeSpriteState(0, 100, 50, true, true, 0, 100, 200, 3, 60, 0, 0, 0)
      accessor.writeSpriteState(1, 150, 75, true, true, 0, 50, 100, 5, 120, 1, 1, 1)
      accessor.writeSpriteState(2, 200, 100, false, true, 2, 0, 150, 7, 90, 0, 2, 2)

      // Verify sprites are in buffer
      expect(accessor.readSpriteCharacterType(0)).toBe(0)
      expect(accessor.readSpriteCharacterType(1)).toBe(1)
      expect(accessor.readSpriteCharacterType(2)).toBe(2)

      // === Step 2: User clicks CLEAR button ===
      // Main thread writes CLEAR_ALL_MOVEMENTS command to sync section at byte 2128
      syncView[0] = SyncCommandType.CLEAR_ALL_MOVEMENTS
      syncView[1] = 0 // actionNumber unused
      syncView[8] = 0 // ACK_PENDING

      // === Step 3: AnimationWorker polls for commands ===
      const command = accessor.readSyncCommand()
      expect(command).not.toBeNull()
      expect(command?.commandType).toBe(SyncCommandType.CLEAR_ALL_MOVEMENTS)

      // === Step 4: AnimationWorker handles the command ===
      // This is what handleClearAllMovementsFromSync() does:
      accessor.clearAllSprites()

      // === Step 5: AnimationWorker acknowledges ===
      accessor.notifyAck()

      // === Step 6: Verify all sprites are cleared ===
      for (let i = 0; i < 8; i++) {
        expect(accessor.readSpriteCharacterType(i)).toBe(-1) // uninitialized
        expect(accessor.readSpriteIsActive(i)).toBe(false)
        expect(accessor.readSpriteIsVisible(i)).toBe(false)
        const pos = accessor.readSpritePosition(i)
        expect(pos).toEqual({ x: 0, y: 0 })
      }

      // Sync command should still be readable until cleared
      const commandAfter = accessor.readSyncCommand()
      expect(commandAfter).not.toBeNull()
    })

    it('should clear buffer even when movements are still active', () => {
      const views = createSharedDisplayBuffer()
      const accessor = new SharedDisplayBufferAccessor(views.buffer)

      // Create sync section view for write operations (at byte 2128)
      const syncView = new Float64Array(views.buffer, OFFSET_ANIMATION_SYNC, 9)

      // Set up active movements (isActive=true, remainingDistance > 0)
      accessor.writeSpriteState(0, 50, 50, true, true, 0, 150, 150, 3, 60, 0, 0, 0)
      accessor.writeSpriteState(1, 100, 100, true, true, 0, 200, 200, 5, 90, 1, 1, 1)

      // Verify they're active
      expect(accessor.readSpriteIsActive(0)).toBe(true)
      expect(accessor.readSpriteIsActive(1)).toBe(true)
      expect(accessor.readSpriteRemainingDistance(0)).toBe(150)
      expect(accessor.readSpriteRemainingDistance(1)).toBe(200)

      // Write and process CLEAR_ALL_MOVEMENTS
      syncView[0] = SyncCommandType.CLEAR_ALL_MOVEMENTS
      syncView[1] = 0
      syncView[8] = 0 // ACK_PENDING
      expect(accessor.readSyncCommand()?.commandType).toBe(SyncCommandType.CLEAR_ALL_MOVEMENTS)

      accessor.clearAllSprites()

      // Verify everything is cleared
      for (let i = 0; i < 8; i++) {
        expect(accessor.readSpriteCharacterType(i)).toBe(-1)
        expect(accessor.readSpriteIsActive(i)).toBe(false)
        expect(accessor.readSpriteIsVisible(i)).toBe(false)
      }
    })
  })

  describe('Raw buffer operations with combined display buffer', () => {
    it('should write and read CLEAR_ALL_MOVEMENTS using raw Float64Array view', () => {
      const views = createSharedDisplayBuffer()

      // Create a view of the sync section at byte 2128
      const syncView = new Float64Array(views.buffer, OFFSET_ANIMATION_SYNC, 9)

      // Write CLEAR_ALL_MOVEMENTS directly to sync section
      syncView[0] = SyncCommandType.CLEAR_ALL_MOVEMENTS
      syncView[1] = 0 // actionNumber unused
      syncView[2] = 0 // param1
      syncView[3] = 0 // param2
      syncView[4] = 0 // param3
      syncView[5] = 0 // param4
      syncView[6] = 0 // param5
      syncView[7] = 0 // param6
      syncView[8] = 0 // ACK_PENDING

      // Read back using raw view access
      expect(syncView[0]).toBe(SyncCommandType.CLEAR_ALL_MOVEMENTS)
      expect(syncView[1]).toBe(0) // actionNumber unused
      expect(syncView[2]).toBe(0) // param1
      expect(syncView[8]).toBe(0) // ACK_PENDING
    })

    it('should handle sprite state writes before and after clear', () => {
      const views = createSharedDisplayBuffer()
      const accessor = new SharedDisplayBufferAccessor(views.buffer)

      // Write sprites using helper function (compatible with raw views)
      const spriteView = views.spriteView
      writeSpriteState(spriteView, 0, 123, 456, true, true, 5, 100, 200, 3, 60, 0, 7, 8)

      // Verify using accessor
      expect(accessor.readSpritePosition(0)).toEqual({ x: 123, y: 456 })
      expect(accessor.readSpriteCharacterType(0)).toBe(7)
      expect(accessor.readSpriteIsActive(0)).toBe(true)
      expect(accessor.readSpriteIsVisible(0)).toBe(true)

      // Clear
      accessor.clearAllSprites()

      // Verify cleared
      expect(accessor.readSpriteCharacterType(0)).toBe(-1)
      expect(accessor.readSpriteIsActive(0)).toBe(false)
      expect(accessor.readSpriteIsVisible(0)).toBe(false)
    })
  })
})
