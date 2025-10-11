/**
 * Joystick Device Model Tests
 * 
 * Tests for the joystick device abstraction layer
 * Based on Family BASIC v3 STICK and STRIG specification
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  BasicDeviceManager, 
  BasicDeviceFactory, 
  DeviceAdapter,
  DeviceType,
  DeviceCapability,
  WebJoystickDevice,
  JoystickEvent
} from '../core/devices/index'

// Mock Gamepad API for tests
const mockGamepad = {
  id: 'Test Gamepad',
  index: 0,
  connected: true,
  buttons: [
    { pressed: true, touched: true, value: 1 },   // A button (button 0)
    { pressed: false, touched: false, value: 0 },  // B button (button 1)
    { pressed: false, touched: false, value: 0 },  // X button (button 2)
    { pressed: false, touched: false, value: 0 },  // Y button (button 3)
    { pressed: false, touched: false, value: 0 },  // L1 button (button 4)
    { pressed: false, touched: false, value: 0 },  // R1 button (button 5)
    { pressed: false, touched: false, value: 0 },  // L2 button (button 6)
    { pressed: false, touched: false, value: 0 },  // R2 button (button 7)
    { pressed: true, touched: true, value: 1 },    // Select button (button 8)
    { pressed: false, touched: false, value: 0 },  // Start button (button 9)
    { pressed: false, touched: false, value: 0 },  // Left stick button (button 10)
    { pressed: false, touched: false, value: 0 },  // Right stick button (button 11)
    { pressed: false, touched: false, value: 0 },  // D-pad up (button 12)
    { pressed: false, touched: false, value: 0 },  // D-pad down (button 13)
    { pressed: false, touched: false, value: 0 },  // D-pad left (button 14)
    { pressed: true, touched: true, value: 1 }     // D-pad right (button 15)
  ],
  axes: [0.7, -0.3, 0, 0], // Left stick X=0.7 (right), Y=-0.3 (up)
  mapping: 'standard',
  hapticActuators: []
}

const mockNavigator = {
  getGamepads: () => [mockGamepad, null, null, null]
}

// Mock DOM environment for tests
Object.defineProperty(globalThis, 'navigator', { value: mockNavigator })
Object.defineProperty(globalThis, 'window', { 
  value: {
    addEventListener: () => {},
    removeEventListener: () => {},
    setInterval: () => 123,
    clearInterval: () => {}
  }
})

describe('Joystick Device Model Tests', () => {
  let deviceManager: BasicDeviceManager
  let deviceFactory: BasicDeviceFactory
  let deviceAdapter: DeviceAdapter

  beforeEach(() => {
    deviceManager = new BasicDeviceManager()
    deviceFactory = new BasicDeviceFactory()
    deviceAdapter = new DeviceAdapter({
      deviceManager,
      enableDeviceIntegration: true
    })
  })

  afterEach(async () => {
    await deviceManager.destroyAll()
  })

  describe('Joystick Device Interface', () => {
    it('should have correct device type and capabilities', () => {
      const joystickDevice = new WebJoystickDevice('test-joystick', 'Test Joystick')
      
      expect(joystickDevice.id).toBe('test-joystick')
      expect(joystickDevice.name).toBe('Test Joystick')
      expect(joystickDevice.type).toBe(DeviceType.JOYSTICK)
      expect(joystickDevice.capabilities).toContain(DeviceCapability.JOYSTICK_INPUT)
    })

    it('should provide device status information', () => {
      const joystickDevice = new WebJoystickDevice('test-joystick', 'Test Joystick')
      const status = joystickDevice.getStatus()
      
      expect(status).toHaveProperty('isReady')
      expect(status).toHaveProperty('isConnected')
      expect(status).toHaveProperty('metadata')
    })

    it('should handle event listeners', () => {
      const joystickDevice = new WebJoystickDevice('test-joystick', 'Test Joystick')
      const callback = () => {}
      
      joystickDevice.onJoystickEvent(JoystickEvent.BUTTON_DOWN, callback)
      joystickDevice.offJoystickEvent(JoystickEvent.BUTTON_DOWN, callback)
      
      // Should not throw errors
      expect(joystickDevice.isReady()).toBe(false) // Not initialized yet
    })
  })

  describe('Device Manager Integration', () => {
    it('should register and manage joystick devices', async () => {
      const joystickDevice = new WebJoystickDevice('test-joystick', 'Test Joystick')
      
      await deviceManager.registerDevice(joystickDevice)
      expect(deviceManager.getAllDevices()).toHaveLength(1)
      expect(deviceManager.getDevice('test-joystick')).toBe(joystickDevice)
      expect(deviceManager.getPrimaryDevice(DeviceType.JOYSTICK)).toBe(joystickDevice)
    })

    it('should filter devices by joystick type', async () => {
      const joystickDevice = new WebJoystickDevice('joystick-1', 'Joystick 1')
      
      await deviceManager.registerDevice(joystickDevice)
      
      const joystickDevices = deviceManager.getDevicesByType(DeviceType.JOYSTICK)
      expect(joystickDevices).toHaveLength(1)
      expect(joystickDevices[0]).toBe(joystickDevice)
    })

    it('should filter devices by joystick capability', async () => {
      const joystickDevice = new WebJoystickDevice('joystick-1', 'Joystick 1')
      
      await deviceManager.registerDevice(joystickDevice)
      
      const joystickInputDevices = deviceManager.getDevicesByCapability(DeviceCapability.JOYSTICK_INPUT)
      expect(joystickInputDevices).toHaveLength(1)
      expect(joystickInputDevices[0]).toBe(joystickDevice)
    })
  })

  describe('Device Factory Integration', () => {
    it('should create joystick devices from configuration', async () => {
      const config = deviceFactory.getDefaultConfig(DeviceType.JOYSTICK)
      config.id = 'test-joystick'
      config.name = 'Test Joystick'

      const device = await deviceFactory.createDevice(config)
      expect(device.id).toBe('test-joystick')
      expect(device.name).toBe('Test Joystick')
      expect(device.type).toBe(DeviceType.JOYSTICK)
    })

    it('should provide joystick device configuration', () => {
      const config = deviceFactory.getDefaultConfig(DeviceType.JOYSTICK)
      
      expect(config.type).toBe(DeviceType.JOYSTICK)
      expect(config.capabilities).toContain(DeviceCapability.JOYSTICK_INPUT)
      expect(config.settings).toHaveProperty('enableGamepadAPI')
      expect(config.settings).toHaveProperty('crossButtonThreshold')
      expect(config.settings).toHaveProperty('deadzone')
    })
  })

  describe('Device Adapter Integration', () => {
    it('should provide joystick operations through adapter', async () => {
      const joystickDevice = new WebJoystickDevice('test-joystick', 'Test Joystick')
      
      await deviceManager.registerDevice(joystickDevice)
      deviceManager.setPrimaryDevice(DeviceType.JOYSTICK, 'test-joystick')
      
      // These should not throw errors even when device is not initialized
      const count = await deviceAdapter.getJoystickCount()
      const stick0 = await deviceAdapter.getStickState(0)
      const trig0 = await deviceAdapter.getTriggerState(0)
      
      expect(typeof count).toBe('number')
      expect(typeof stick0).toBe('number')
      expect(typeof trig0).toBe('number')
    })

    it('should include joystick capabilities', () => {
      const capabilities = deviceAdapter.getCapabilities()
      expect(Array.isArray(capabilities)).toBe(true)
    })
  })

  describe('Family BASIC v3 Compatibility', () => {
    it('should support Family BASIC v3 STICK keyword', async () => {
      const joystickDevice = new WebJoystickDevice('test-joystick', 'Test Joystick', {
        crossButtonThreshold: 0.5
      })
      
      await deviceManager.registerDevice(joystickDevice)
      
      // STICK should return cross-button state: 1=right, 2=left, 4=down, 8=top
      const stick0 = await deviceAdapter.getStickState(0)
      
      // With mock data: axes[0]=0.7 (right), axes[1]=-0.3 (up), D-pad right pressed
      // Expected: 1 (right) from analog stick + 1 (right) from D-pad = 1 (right)
      // Note: Y=-0.3 is not < -0.5 threshold, so no "up" bit
      expect(stick0).toBe(1) // right only
    })

    it('should support Family BASIC v3 STRIG keyword', async () => {
      const joystickDevice = new WebJoystickDevice('test-joystick', 'Test Joystick')
      
      await deviceManager.registerDevice(joystickDevice)
      
      // STRIG should return button state: 1=start, 2=select, 4=B, 8=A
      const trig0 = await deviceAdapter.getTriggerState(0)
      
      // With mock data: A button (0) pressed, Select button (8) pressed
      // Expected: 8 (A) | 2 (select) = 10
      expect(trig0).toBe(10) // A + select
    })

    it('should support up to 4 joysticks (Family BASIC v3 limit)', async () => {
      const joystickDevice = new WebJoystickDevice('test-joystick', 'Test Joystick')
      
      await deviceManager.registerDevice(joystickDevice)
      
      const count = await deviceAdapter.getJoystickCount()
      expect(count).toBeGreaterThanOrEqual(0)
      expect(count).toBeLessThanOrEqual(4) // Family BASIC v3 supports up to 4 joysticks
    })

    it('should handle invalid joystick IDs gracefully', async () => {
      const joystickDevice = new WebJoystickDevice('test-joystick', 'Test Joystick')
      
      await deviceManager.registerDevice(joystickDevice)
      
      // Test invalid joystick IDs
      const stickInvalid = await deviceAdapter.getStickState(5) // Invalid ID
      const trigInvalid = await deviceAdapter.getTriggerState(-1) // Invalid ID
      
      expect(stickInvalid).toBe(0)
      expect(trigInvalid).toBe(0)
    })
  })
})
