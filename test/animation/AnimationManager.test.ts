/**
 * AnimationManager unit tests
 *
 * Covers DEF MOVE / MOVE lifecycle: defineMovement, startMovement, stopMovement,
 * eraseMovement, setPosition, getMovementStatus, getMovementState, reset.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AnimationManager } from '@/core/animation/AnimationManager'
import { TestDeviceAdapter } from '@/core/devices/TestDeviceAdapter'
import type { MoveDefinition } from '@/core/sprite/types'
import { MoveCharacterCode } from '@/shared/data/types'

describe('AnimationManager', () => {
  let manager: AnimationManager
  let deviceAdapter: TestDeviceAdapter

  beforeEach(() => {
    manager = new AnimationManager()
    deviceAdapter = new TestDeviceAdapter()
    manager.setDeviceAdapter(deviceAdapter)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const validDefinition: MoveDefinition = {
    actionNumber: 0,
    characterType: MoveCharacterCode.MARIO,
    direction: 3,
    speed: 60,
    distance: 50,
    priority: 0,
    colorCombination: 0,
  }

  describe('defineMovement', () => {
    it('should store a valid movement definition', () => {
      manager.defineMovement(validDefinition)
      expect(manager.getMoveDefinition(0)).toEqual(validDefinition)
    })

    it('should throw for action number out of range (0-7)', () => {
      expect(() =>
        manager.defineMovement({ ...validDefinition, actionNumber: -1 })
      ).toThrow('Invalid action number: -1 (must be 0-7)')
      expect(() =>
        manager.defineMovement({ ...validDefinition, actionNumber: 8 })
      ).toThrow('Invalid action number: 8 (must be 0-7)')
    })

    it('should throw for invalid character type (0-15)', () => {
      expect(() =>
        manager.defineMovement({ ...validDefinition, characterType: -1 as MoveCharacterCode })
      ).toThrow('Invalid character type: -1 (must be 0-15)')
      expect(() =>
        manager.defineMovement({ ...validDefinition, characterType: 16 as MoveCharacterCode })
      ).toThrow('Invalid character type: 16 (must be 0-15)')
    })

    it('should throw for invalid direction (0-8)', () => {
      expect(() =>
        manager.defineMovement({ ...validDefinition, direction: -1 })
      ).toThrow('Invalid direction: -1 (must be 0-8)')
      expect(() =>
        manager.defineMovement({ ...validDefinition, direction: 9 })
      ).toThrow('Invalid direction: 9 (must be 0-8)')
    })

    it('should throw for invalid speed (1-255)', () => {
      expect(() =>
        manager.defineMovement({ ...validDefinition, speed: 0 })
      ).toThrow('Invalid speed: 0 (must be 1-255)')
      expect(() =>
        manager.defineMovement({ ...validDefinition, speed: 256 })
      ).toThrow('Invalid speed: 256 (must be 1-255)')
    })

    it('should throw for invalid distance (1-255)', () => {
      expect(() =>
        manager.defineMovement({ ...validDefinition, distance: 0 })
      ).toThrow('Invalid distance: 0 (must be 1-255)')
    })

    it('should throw for invalid priority (0-1)', () => {
      expect(() =>
        manager.defineMovement({ ...validDefinition, priority: 2 })
      ).toThrow('Invalid priority: 2 (must be 0-1)')
    })

    it('should throw for invalid color combination (0-3)', () => {
      expect(() =>
        manager.defineMovement({ ...validDefinition, colorCombination: 4 })
      ).toThrow('Invalid color combination: 4 (must be 0-3)')
    })
  })

  describe('startMovement', () => {
    it('should throw when no definition exists for action number', () => {
      expect(() => manager.startMovement(0)).toThrow(
        'No movement definition for action number 0 (use DEF MOVE first)'
      )
    })

    it('should create movement state and send START_MOVEMENT command', () => {
      manager.defineMovement(validDefinition)
      manager.startMovement(0, 100, 80)

      const state = manager.getMovementState(0)
      expect(state).toBeDefined()
      expect(state?.actionNumber).toBe(0)
      expect(state?.isActive).toBe(true)
      expect(state?.currentFrameIndex).toBe(0)
      expect(state?.frameCounter).toBe(0)
      expect(state?.startX).toBe(100)
      expect(state?.startY).toBe(80)
      expect(state?.directionDeltaX).toBe(1)
      expect(state?.directionDeltaY).toBe(0)
      expect(state?.totalDistance).toBe(100)
      expect(state?.remainingDistance).toBe(100)
      expect(state?.speedDotsPerSecond).toBe(1)

      expect(deviceAdapter.animationCommandCalls).toHaveLength(1)
      expect(deviceAdapter.animationCommandCalls[0]).toEqual(
        expect.objectContaining({
          type: 'START_MOVEMENT',
          actionNumber: 0,
          startX: 100,
          startY: 80,
        })
      )
    })

    it('should use default position when startX/startY not provided', () => {
      manager.defineMovement(validDefinition)
      manager.startMovement(0)

      const state = manager.getMovementState(0)
      expect(state?.startX).toBe(128)
      expect(state?.startY).toBe(120)
    })
  })

  describe('getMovementStatus', () => {
    it('should return 0 when no movement defined or started', () => {
      expect(manager.getMovementStatus(0)).toBe(0)
      manager.defineMovement(validDefinition)
      expect(manager.getMovementStatus(0)).toBe(0)
    })

    it('should return -1 when movement is active', () => {
      manager.defineMovement(validDefinition)
      manager.startMovement(0)
      expect(manager.getMovementStatus(0)).toBe(-1)
    })

    it('should return 0 after stopMovement', () => {
      manager.defineMovement(validDefinition)
      manager.startMovement(0)
      manager.stopMovement([0])
      expect(manager.getMovementStatus(0)).toBe(0)
    })

    it('should return 0 after eraseMovement', () => {
      manager.defineMovement(validDefinition)
      manager.startMovement(0)
      manager.eraseMovement([0])
      expect(manager.getMovementStatus(0)).toBe(0)
    })
  })

  describe('stopMovement (CUT)', () => {
    it('should set isActive false and send STOP_MOVEMENT', () => {
      manager.defineMovement(validDefinition)
      manager.startMovement(0)
      manager.stopMovement([0])

      const state = manager.getMovementState(0)
      expect(state?.isActive).toBe(false)
      expect(deviceAdapter.animationCommandCalls.some(c => c.type === 'STOP_MOVEMENT' && c.actionNumbers?.includes(0))).toBe(true)
    })

    it('should handle multiple action numbers', () => {
      manager.defineMovement({ ...validDefinition, actionNumber: 0 })
      manager.defineMovement({ ...validDefinition, actionNumber: 1 })
      manager.startMovement(0)
      manager.startMovement(1)
      manager.stopMovement([0, 1])

      expect(manager.getMovementStatus(0)).toBe(0)
      expect(manager.getMovementStatus(1)).toBe(0)
    })
  })

  describe('eraseMovement (ERA)', () => {
    it('should remove movement state and send ERASE_MOVEMENT', () => {
      manager.defineMovement(validDefinition)
      manager.startMovement(0)
      manager.eraseMovement([0])

      expect(manager.getMovementState(0)).toBeUndefined()
      expect(deviceAdapter.animationCommandCalls.some(c => c.type === 'ERASE_MOVEMENT' && c.actionNumbers?.includes(0))).toBe(true)
    })
  })

  describe('setPosition (POSITION)', () => {
    it('should send SET_POSITION command', () => {
      manager.setPosition(0, 50, 60)
      expect(deviceAdapter.animationCommandCalls).toContainEqual({
        type: 'SET_POSITION',
        actionNumber: 0,
        x: 50,
        y: 60,
      })
    })

    it('should throw for invalid action number', () => {
      expect(() => manager.setPosition(-1, 0, 0)).toThrow('Invalid action number: -1 (must be 0-7)')
      expect(() => manager.setPosition(8, 0, 0)).toThrow('Invalid action number: 8 (must be 0-7)')
    })

    it('should throw for invalid X coordinate', () => {
      expect(() => manager.setPosition(0, -1, 0)).toThrow('Invalid X coordinate: -1 (must be 0-255)')
      expect(() => manager.setPosition(0, 256, 0)).toThrow('Invalid X coordinate: 256 (must be 0-255)')
    })

    it('should throw for invalid Y coordinate', () => {
      expect(() => manager.setPosition(0, 0, -1)).toThrow('Invalid Y coordinate: -1 (must be 0-239)')
      expect(() => manager.setPosition(0, 0, 240)).toThrow('Invalid Y coordinate: 240 (must be 0-239)')
    })
  })

  describe('getSpritePosition', () => {
    it('should return null (position is in frontend Konva nodes)', () => {
      expect(manager.getSpritePosition(0)).toBeNull()
    })
  })

  describe('getAllMovementStates', () => {
    it('should return all active movement states', () => {
      manager.defineMovement(validDefinition)
      manager.defineMovement({ ...validDefinition, actionNumber: 1 })
      manager.startMovement(0)
      manager.startMovement(1)

      const states = manager.getAllMovementStates()
      expect(states).toHaveLength(2)
      expect(states.map(s => s.actionNumber).sort()).toEqual([0, 1])
    })

    it('should return empty array when no movements', () => {
      expect(manager.getAllMovementStates()).toEqual([])
    })
  })

  describe('reset', () => {
    it('should clear all definitions and movement states', () => {
      manager.defineMovement(validDefinition)
      manager.startMovement(0)
      manager.reset()

      expect(manager.getMoveDefinition(0)).toBeUndefined()
      expect(manager.getMovementState(0)).toBeUndefined()
      expect(manager.getAllMovementStates()).toEqual([])
      expect(manager.getMovementStatus(0)).toBe(0)
    })
  })
})
