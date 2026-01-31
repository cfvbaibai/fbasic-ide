/**
 * Tests for SoundStateManager
 */

import { describe, expect, test } from 'vitest'

import { SoundStateManager } from '@/core/sound/SoundStateManager'

describe('SoundStateManager', () => {
  test('initializes with default state', () => {
    const manager = new SoundStateManager()
    const state = manager.getState()

    expect(state.tempo).toEqual(4)
    expect(state.duty).toEqual(2)
    expect(state.envelope).toEqual(0)
    expect(state.volumeOrLength).toEqual(15)
    expect(state.octave).toEqual(3)
  })

  test('initializes with custom state', () => {
    const manager = new SoundStateManager({
      tempo: 1,
      duty: 0,
      envelope: 1,
      volumeOrLength: 8,
      octave: 5,
    })
    const state = manager.getState()

    expect(state.tempo).toEqual(1)
    expect(state.duty).toEqual(0)
    expect(state.envelope).toEqual(1)
    expect(state.volumeOrLength).toEqual(8)
    expect(state.octave).toEqual(5)
  })

  test('updates partial state', () => {
    const manager = new SoundStateManager()

    manager.updateState({ tempo: 8, octave: 0 })

    const state = manager.getState()
    expect(state.tempo).toEqual(8)
    expect(state.octave).toEqual(0)
    expect(state.duty).toEqual(2) // Unchanged
    expect(state.envelope).toEqual(0) // Unchanged
    expect(state.volumeOrLength).toEqual(15) // Unchanged
  })

  test('resets to default state', () => {
    const manager = new SoundStateManager()

    manager.updateState({ tempo: 1, duty: 0, envelope: 1, volumeOrLength: 0, octave: 5 })
    manager.reset()

    const state = manager.getState()
    expect(state.tempo).toEqual(4)
    expect(state.duty).toEqual(2)
    expect(state.envelope).toEqual(0)
    expect(state.volumeOrLength).toEqual(15)
    expect(state.octave).toEqual(3)
  })

  describe('tempo', () => {
    test('gets and sets tempo', () => {
      const manager = new SoundStateManager()

      expect(manager.getTempo()).toEqual(4)

      manager.setTempo(1)
      expect(manager.getTempo()).toEqual(1)

      manager.setTempo(8)
      expect(manager.getTempo()).toEqual(8)
    })

    test('throws on invalid tempo', () => {
      const manager = new SoundStateManager()

      expect(() => manager.setTempo(0)).toThrow('Invalid tempo: 0. Must be 1-8')
      expect(() => manager.setTempo(9)).toThrow('Invalid tempo: 9. Must be 1-8')
    })
  })

  describe('duty', () => {
    test('gets and sets duty', () => {
      const manager = new SoundStateManager()

      expect(manager.getDuty()).toEqual(2)

      manager.setDuty(0)
      expect(manager.getDuty()).toEqual(0)

      manager.setDuty(3)
      expect(manager.getDuty()).toEqual(3)
    })

    test('throws on invalid duty', () => {
      const manager = new SoundStateManager()

      expect(() => manager.setDuty(-1)).toThrow('Invalid duty: -1. Must be 0-3')
      expect(() => manager.setDuty(4)).toThrow('Invalid duty: 4. Must be 0-3')
    })
  })

  describe('envelope', () => {
    test('gets and sets envelope', () => {
      const manager = new SoundStateManager()

      expect(manager.getEnvelope()).toEqual(0)

      manager.setEnvelope(1)
      expect(manager.getEnvelope()).toEqual(1)

      manager.setEnvelope(0)
      expect(manager.getEnvelope()).toEqual(0)
    })

    test('throws on invalid envelope', () => {
      const manager = new SoundStateManager()

      expect(() => manager.setEnvelope(-1)).toThrow('Invalid envelope: -1. Must be 0-1')
      expect(() => manager.setEnvelope(2)).toThrow('Invalid envelope: 2. Must be 0-1')
    })
  })

  describe('volumeOrLength', () => {
    test('gets and sets volume/length', () => {
      const manager = new SoundStateManager()

      expect(manager.getVolumeOrLength()).toEqual(15)

      manager.setVolumeOrLength(0)
      expect(manager.getVolumeOrLength()).toEqual(0)

      manager.setVolumeOrLength(15)
      expect(manager.getVolumeOrLength()).toEqual(15)
    })

    test('throws on invalid volume/length', () => {
      const manager = new SoundStateManager()

      expect(() => manager.setVolumeOrLength(-1)).toThrow('Invalid volume/length: -1. Must be 0-15')
      expect(() => manager.setVolumeOrLength(16)).toThrow('Invalid volume/length: 16. Must be 0-15')
    })
  })

  describe('octave', () => {
    test('gets and sets octave', () => {
      const manager = new SoundStateManager()

      expect(manager.getOctave()).toEqual(3)

      manager.setOctave(0)
      expect(manager.getOctave()).toEqual(0)

      manager.setOctave(5)
      expect(manager.getOctave()).toEqual(5)
    })

    test('throws on invalid octave', () => {
      const manager = new SoundStateManager()

      expect(() => manager.setOctave(-1)).toThrow('Invalid octave: -1. Must be 0-5')
      expect(() => manager.setOctave(6)).toThrow('Invalid octave: 6. Must be 0-5')
    })
  })

  test('getState returns a copy', () => {
    const manager = new SoundStateManager()
    const state1 = manager.getState()
    const state2 = manager.getState()

    expect(state1).not.toBe(state2) // Different objects
    expect(state1).toEqual(state2) // Same values
  })

  test('state persists across calls', () => {
    const manager = new SoundStateManager()

    manager.setTempo(1)
    manager.setDuty(0)
    manager.setEnvelope(1)
    manager.setVolumeOrLength(8)
    manager.setOctave(5)

    const state = manager.getState()
    expect(state.tempo).toEqual(1)
    expect(state.duty).toEqual(0)
    expect(state.envelope).toEqual(1)
    expect(state.volumeOrLength).toEqual(8)
    expect(state.octave).toEqual(5)
  })
})
