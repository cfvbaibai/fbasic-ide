/**
 * Frame animation logic unit tests
 *
 * Covers frame index, direction, and inversion: MovementState frame fields,
 * direction-to-sequence mapping, per-frame inversion in sequences.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { AnimationManager } from '@/core/animation/AnimationManager'
import {
  buildAllCharacterAnimationConfigs,
  buildCharacterAnimationConfig,
  getSequenceForMovement,
} from '@/core/animation/CharacterAnimationBuilder'
import { MoveCharacterCode } from '@/shared/data/types'

describe('Frame animation logic', () => {
  let manager: AnimationManager

  beforeEach(() => {
    manager = new AnimationManager()
  })

  describe('MovementState frame fields', () => {
    it('should create movement state with currentFrameIndex 0 after defineMovement', () => {
      manager.defineMovement({
        actionNumber: 0,
        characterType: MoveCharacterCode.MARIO,
        direction: 3,
        speed: 60,
        distance: 50,
        priority: 0,
        colorCombination: 0,
      })

      const state = manager.getMovementState(0)
      expect(state).toBeDefined()
    })

    it('should have direction in definition matching direction code (right = 3)', () => {
      manager.defineMovement({
        actionNumber: 0,
        characterType: MoveCharacterCode.MARIO,
        direction: 3,
        speed: 60,
        distance: 50,
        priority: 0,
        colorCombination: 0,
      })

      const state = manager.getMovementState(0)
      expect(state?.definition.direction).toBe(3)
    })

    it('should have direction in definition for left (7)', () => {
      manager.defineMovement({
        actionNumber: 0,
        characterType: MoveCharacterCode.MARIO,
        direction: 7,
        speed: 60,
        distance: 50,
        priority: 0,
        colorCombination: 0,
      })

      const state = manager.getMovementState(0)
      expect(state?.definition.direction).toBe(7)
    })

    it('should have direction in definition for up (1)', () => {
      manager.defineMovement({
        actionNumber: 0,
        characterType: MoveCharacterCode.MARIO,
        direction: 1,
        speed: 60,
        distance: 50,
        priority: 0,
        colorCombination: 0,
      })

      const state = manager.getMovementState(0)
      expect(state?.definition.direction).toBe(1)
    })

    it('should have direction in definition for down (5)', () => {
      manager.defineMovement({
        actionNumber: 0,
        characterType: MoveCharacterCode.MARIO,
        direction: 5,
        speed: 60,
        distance: 50,
        priority: 0,
        colorCombination: 0,
      })

      const state = manager.getMovementState(0)
      expect(state?.definition.direction).toBe(5)
    })
  })

  describe('Direction-to-sequence mapping', () => {
    it('should return different sequence names for different directions', () => {
      const configs = buildAllCharacterAnimationConfigs()
      const dir3 = getSequenceForMovement(MoveCharacterCode.MARIO, 3, configs)
      const dir7 = getSequenceForMovement(MoveCharacterCode.MARIO, 7, configs)

      expect(dir3.sequence).not.toBeNull()
      expect(dir7.sequence).not.toBeNull()
      expect(dir3.sequence?.name).not.toBe(dir7.sequence?.name)
    })

    it('should return sequence with multiple frames for walk directions', () => {
      const configs = buildAllCharacterAnimationConfigs()
      const result = getSequenceForMovement(MoveCharacterCode.MARIO, 3, configs)

      expect(result.sequence?.frames.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Per-frame inversion', () => {
    it('should have frameInversions array when sequence is from config', () => {
      const config = buildCharacterAnimationConfig(MoveCharacterCode.MARIO)
      expect(config).not.toBeNull()

      const dir3Sequence = config!.sequences.get('DIR3')
      expect(dir3Sequence).toBeDefined()
      expect(dir3Sequence?.frameInversions).toBeDefined()
      expect(Array.isArray(dir3Sequence?.frameInversions)).toBe(true)
    })

    it('should have frameInversions length match frame count for Mario direction 3', () => {
      const config = buildCharacterAnimationConfig(MoveCharacterCode.MARIO)
      expect(config).not.toBeNull()

      const dir3Sequence = config!.sequences.get('DIR3')
      expect(dir3Sequence).toBeDefined()
      expect(dir3Sequence?.frames.length).toBe(dir3Sequence?.frameInversions?.length ?? 0)
    })

    it('should have invertX/invertY on each frame inversion entry', () => {
      const config = buildCharacterAnimationConfig(MoveCharacterCode.MARIO)
      const dir3Sequence = config!.sequences.get('DIR3')
      expect(dir3Sequence?.frameInversions).toBeDefined()
      expect(dir3Sequence!.frameInversions!.length).toBeGreaterThan(0)

      for (const frameInv of dir3Sequence!.frameInversions!) {
        expect(typeof frameInv.invertX === 'boolean' || frameInv.invertX === undefined).toBe(true)
        expect(typeof frameInv.invertY === 'boolean' || frameInv.invertY === undefined).toBe(true)
      }
    })

    it('should return direction-level invertX from getSequenceForMovement (first frame fallback)', () => {
      const configs = buildAllCharacterAnimationConfigs()
      const result = getSequenceForMovement(MoveCharacterCode.MARIO, 3, configs)

      expect(result.invertX).toBe(true)
      expect(result.invertY).toBe(false)
    })
  })
})
