/**
 * CharacterAnimationBuilder unit tests
 *
 * Covers buildCharacterAnimationConfig, buildAllCharacterAnimationConfigs,
 * getSequenceForMovement, and config structure (sequences, directionMappings).
 */

import { describe, expect, it } from 'vitest'

import {
  buildAllCharacterAnimationConfigs,
  buildCharacterAnimationConfig,
  getSequenceForMovement,
} from '@/core/animation/CharacterAnimationBuilder'
import { MoveCharacterCode } from '@/shared/data/types'

describe('CharacterAnimationBuilder', () => {
  describe('buildCharacterAnimationConfig', () => {
    it('should return config for Mario (character 0)', () => {
      const config = buildCharacterAnimationConfig(MoveCharacterCode.MARIO)
      expect(config).not.toBeNull()
      expect(config?.characterType).toBe(MoveCharacterCode.MARIO)
      expect(config?.sequences).toBeDefined()
      expect(config?.sequences.size).toBeGreaterThan(0)
      expect(config?.directionMappings).toBeDefined()
      expect(config?.directionMappings.size).toBeGreaterThan(0)
    })

    it('should return config for Lady (character 1)', () => {
      const config = buildCharacterAnimationConfig(MoveCharacterCode.LADY)
      expect(config).not.toBeNull()
      expect(config?.characterType).toBe(MoveCharacterCode.LADY)
      expect(config?.sequences.size).toBeGreaterThan(0)
    })

    it('should return config with sequences that have frames and frameRate', () => {
      const config = buildCharacterAnimationConfig(MoveCharacterCode.MARIO)
      expect(config).not.toBeNull()
      const firstSequence = Array.from(config!.sequences.values())[0]
      expect(firstSequence).toBeDefined()
      if (!firstSequence) return
      expect(firstSequence.name).toBeDefined()
      expect(Array.isArray(firstSequence.frames)).toBe(true)
      expect(firstSequence.frames.length).toBeGreaterThan(0)
      expect(firstSequence.frameRate).toBe(8)
      expect(typeof firstSequence.looping).toBe('boolean')
    })

    it('should return config with directionMappings for directions 0-8', () => {
      const config = buildCharacterAnimationConfig(MoveCharacterCode.MARIO)
      expect(config).not.toBeNull()
      for (let dir = 0; dir <= 8; dir++) {
        const mapping = config!.directionMappings.get(dir)
        expect(mapping).toBeDefined()
        expect(mapping?.sequence).toBeDefined()
        expect(typeof mapping?.invertX).toBe('boolean')
        expect(typeof mapping?.invertY).toBe('boolean')
      }
    })
  })

  describe('buildAllCharacterAnimationConfigs', () => {
    it('should return map with entries for all 16 character types (0-15)', () => {
      const configs = buildAllCharacterAnimationConfigs()
      expect(configs.size).toBe(16)
      for (let code = 0; code <= 15; code++) {
        expect(configs.has(code as MoveCharacterCode)).toBe(true)
      }
    })

    it('should return cached map on second call', () => {
      const first = buildAllCharacterAnimationConfigs()
      const second = buildAllCharacterAnimationConfigs()
      expect(first).toBe(second)
    })

    it('should have non-null config for Mario and Lady', () => {
      const configs = buildAllCharacterAnimationConfigs()
      expect(configs.get(MoveCharacterCode.MARIO)).not.toBeNull()
      expect(configs.get(MoveCharacterCode.LADY)).not.toBeNull()
    })
  })

  describe('getSequenceForMovement', () => {
    it('should return sequence and inversion for character and direction', () => {
      const configs = buildAllCharacterAnimationConfigs()
      const result = getSequenceForMovement(
        MoveCharacterCode.MARIO,
        3,
        configs
      )
      expect(result.sequence).not.toBeNull()
      expect(result.sequence?.name).toBeDefined()
      expect(result.sequence?.frames.length).toBeGreaterThan(0)
      expect(typeof result.invertX).toBe('boolean')
      expect(typeof result.invertY).toBe('boolean')
    })

    it('should return invertX true for direction 3 (right) for Mario per config', () => {
      const configs = buildAllCharacterAnimationConfigs()
      const result = getSequenceForMovement(
        MoveCharacterCode.MARIO,
        3,
        configs
      )
      expect(result.sequence).not.toBeNull()
      expect(result.invertX).toBe(true)
    })

    it('should return invertX false for direction 7 (left) for Mario per config', () => {
      const configs = buildAllCharacterAnimationConfigs()
      const result = getSequenceForMovement(
        MoveCharacterCode.MARIO,
        7,
        configs
      )
      expect(result.sequence).not.toBeNull()
      expect(result.invertX).toBe(false)
    })

    it('should return null sequence for unknown character when using partial config map', () => {
      const configs = new Map()
      configs.set(MoveCharacterCode.LADY, buildCharacterAnimationConfig(MoveCharacterCode.LADY)!)
      const result = getSequenceForMovement(
        MoveCharacterCode.MARIO,
        3,
        configs
      )
      expect(result.sequence).toBeNull()
      expect(result.invertX).toBe(false)
      expect(result.invertY).toBe(false)
    })

    it('should fallback to first sequence when direction not in mappings', () => {
      const configs = buildAllCharacterAnimationConfigs()
      const config = configs.get(MoveCharacterCode.MARIO)!
      const emptyMappings = new Map(config.directionMappings)
      emptyMappings.delete(3)
      const partialConfig = {
        ...config,
        directionMappings: emptyMappings,
      }
      const partialConfigs = new Map<MoveCharacterCode, typeof partialConfig>()
      partialConfigs.set(MoveCharacterCode.MARIO, partialConfig)
      const result = getSequenceForMovement(
        MoveCharacterCode.MARIO,
        3,
        partialConfigs as ReturnType<typeof buildAllCharacterAnimationConfigs>
      )
      expect(result.sequence).not.toBeNull()
      expect(result.invertX).toBe(false)
      expect(result.invertY).toBe(false)
    })
  })
})
