/**
 * Unit tests for shared joystick buffer
 */

import { describe, expect, it } from 'vitest'

import {
  createSharedJoystickBuffer,
  createViewsFromJoystickBuffer,
  getStickState,
  getStrigState,
  setStickState,
  setStrigState,
} from '@/core/devices/sharedJoystickBuffer'

describe('sharedJoystickBuffer', () => {
  describe('createSharedJoystickBuffer', () => {
    it('should create a buffer of correct size', () => {
      const buffer = createSharedJoystickBuffer()
      expect(buffer.byteLength).toBe(32) // 2 joysticks × 2 fields × 8 bytes
    })

    it('should initialize buffer to zeros', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      expect(views.stickState[0]).toBe(0)
      expect(views.stickState[1]).toBe(0)
      expect(views.strigState[0]).toBe(0)
      expect(views.strigState[1]).toBe(0)
    })
  })

  describe('stickState accessors', () => {
    it('should set and get stick state for joystick 0', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      setStickState(views, 0, 8) // Up
      expect(getStickState(views, 0)).toBe(8)
    })

    it('should set and get stick state for joystick 1', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      setStickState(views, 1, 4) // Down
      expect(getStickState(views, 1)).toBe(4)
    })

    it('should allow combinations (e.g., up + right)', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      setStickState(views, 0, 9) // Up (8) + Right (1)
      expect(getStickState(views, 0)).toBe(9)
    })

    it('should return 0 for invalid joystick id', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      expect(getStickState(views, 2)).toBe(0)
      expect(getStickState(views, -1)).toBe(0)
    })

    it('should throw on set for invalid joystick id', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      expect(() => setStickState(views, 2, 8)).toThrow()
    })
  })

  describe('strigState accessors', () => {
    it('should set and get strig state for joystick 0', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      setStrigState(views, 0, 8) // A button
      expect(getStrigState(views, 0)).toBe(8)
    })

    it('should set and get strig state for joystick 1', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      setStrigState(views, 1, 4) // B button
      expect(getStrigState(views, 1)).toBe(4)
    })

    it('should allow combinations (e.g., A + B)', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      setStrigState(views, 0, 12) // A (8) + B (4)
      expect(getStrigState(views, 0)).toBe(12)
    })

    it('should return 0 for invalid joystick id', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      expect(getStrigState(views, 2)).toBe(0)
      expect(getStrigState(views, -1)).toBe(0)
    })

    it('should throw on set for invalid joystick id', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      expect(() => setStrigState(views, 2, 8)).toThrow()
    })
  })

  describe('createViewsFromJoystickBuffer', () => {
    it('should create views from existing buffer', () => {
      const buffer = createSharedJoystickBuffer()
      const views = createViewsFromJoystickBuffer(buffer)
      expect(views.buffer).toBe(buffer)
      expect(views.stickState.length).toBe(2)
      expect(views.strigState.length).toBe(2)
    })

    it('should throw for buffer that is too small', () => {
      const tinyBuffer = new SharedArrayBuffer(8)
      expect(() => createViewsFromJoystickBuffer(tinyBuffer)).toThrow()
    })
  })
})
