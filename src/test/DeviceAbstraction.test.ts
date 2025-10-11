/**
 * Device Abstraction Tests
 * 
 * Tests for the device abstraction layer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  BasicDeviceManager, 
  BasicDeviceFactory, 
  DeviceAdapter,
  DeviceType,
  DeviceCapability,
  WebDisplayDevice,
  WebInputDevice,
  CustomInputEvent
} from '../core/devices/index'

// Mock DOM environment for tests
const mockCanvas = {
  getContext: () => ({
    fillRect: () => {},
    fillText: () => {},
    strokeRect: () => {},
    stroke: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    moveTo: () => {},
    lineTo: () => {},
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    putImageData: () => {}
  }),
  width: 800,
  height: 600,
  style: {},
  parentNode: { removeChild: () => {} },
  addEventListener: () => {},
  removeEventListener: () => {},
  focus: () => {},
  offsetHeight: 600
}

// Mock document
const mockDocument = {
  getElementById: () => mockCanvas,
  createElement: () => mockCanvas,
  body: { 
    appendChild: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    focus: () => {},
    hasAttribute: () => false,
    setAttribute: () => {},
    cloneNode: () => mockCanvas,
    parentNode: { replaceChild: () => {} }
  }
}

// Mock window
const mockWindow = {
  document: mockDocument
}

// Set up global mocks
Object.defineProperty(globalThis, 'document', { value: mockDocument })
Object.defineProperty(globalThis, 'window', { value: mockWindow })

describe('Device Abstraction Tests', () => {
  let deviceManager: BasicDeviceManager
  let deviceFactory: BasicDeviceFactory

  beforeEach(() => {
    deviceManager = new BasicDeviceManager()
    deviceFactory = new BasicDeviceFactory()
  })

  afterEach(async () => {
    await deviceManager.destroyAll()
  })

  describe('Device Manager', () => {
    it('should initialize empty', () => {
      expect(deviceManager.getAllDevices()).toHaveLength(0)
    })

    it('should register and unregister devices', async () => {
      const displayDevice = new WebDisplayDevice('test-display', 'Test Display')
      
      await deviceManager.registerDevice(displayDevice)
      expect(deviceManager.getAllDevices()).toHaveLength(1)
      expect(deviceManager.getDevice('test-display')).toBe(displayDevice)

      await deviceManager.unregisterDevice('test-display')
      expect(deviceManager.getAllDevices()).toHaveLength(0)
      expect(deviceManager.getDevice('test-display')).toBeUndefined()
    })

    it('should manage primary devices', async () => {
      const displayDevice1 = new WebDisplayDevice('display-1', 'Display 1')
      const displayDevice2 = new WebDisplayDevice('display-2', 'Display 2')
      
      await deviceManager.registerDevice(displayDevice1)
      expect(deviceManager.getPrimaryDevice(DeviceType.DISPLAY)).toBe(displayDevice1)

      await deviceManager.registerDevice(displayDevice2)
      expect(deviceManager.getPrimaryDevice(DeviceType.DISPLAY)).toBe(displayDevice1)

      deviceManager.setPrimaryDevice(DeviceType.DISPLAY, 'display-2')
      expect(deviceManager.getPrimaryDevice(DeviceType.DISPLAY)).toBe(displayDevice2)
    })

    it('should filter devices by type', async () => {
      const displayDevice = new WebDisplayDevice('display', 'Display')
      const inputDevice = new WebInputDevice('input', 'Input')
      
      await deviceManager.registerDevice(displayDevice)
      await deviceManager.registerDevice(inputDevice)

      const displayDevices = deviceManager.getDevicesByType(DeviceType.DISPLAY)
      const inputDevices = deviceManager.getDevicesByType(DeviceType.INPUT)

      expect(displayDevices).toHaveLength(1)
      expect(displayDevices[0]).toBe(displayDevice)
      expect(inputDevices).toHaveLength(1)
      expect(inputDevices[0]).toBe(inputDevice)
    })

    it('should filter devices by capability', async () => {
      const displayDevice = new WebDisplayDevice('display', 'Display')
      const inputDevice = new WebInputDevice('input', 'Input')
      
      await deviceManager.registerDevice(displayDevice)
      await deviceManager.registerDevice(inputDevice)

      const textOutputDevices = deviceManager.getDevicesByCapability(DeviceCapability.TEXT_OUTPUT)
      const keyboardInputDevices = deviceManager.getDevicesByCapability(DeviceCapability.KEYBOARD_INPUT)

      expect(textOutputDevices).toHaveLength(1)
      expect(textOutputDevices[0]).toBe(displayDevice)
      expect(keyboardInputDevices).toHaveLength(1)
      expect(keyboardInputDevices[0]).toBe(inputDevice)
    })

    it('should provide device statistics', async () => {
      const displayDevice = new WebDisplayDevice('display', 'Display')
      const inputDevice = new WebInputDevice('input', 'Input')
      
      await deviceManager.registerDevice(displayDevice)
      await deviceManager.registerDevice(inputDevice)

      const stats = deviceManager.getDeviceStats()
      expect(stats.total).toBe(2)
      expect(stats.byType[DeviceType.DISPLAY]).toBe(1)
      expect(stats.byType[DeviceType.INPUT]).toBe(1)
    })
  })

  describe('Device Factory', () => {
    it('should create devices from configuration', async () => {
      const config = deviceFactory.getDefaultConfig(DeviceType.DISPLAY)
      config.id = 'test-display'
      config.name = 'Test Display'

      const device = await deviceFactory.createDevice(config)
      expect(device.id).toBe('test-display')
      expect(device.name).toBe('Test Display')
      expect(device.type).toBe(DeviceType.DISPLAY)
    })

    it('should provide supported device types', () => {
      const supportedTypes = deviceFactory.getSupportedTypes()
      expect(supportedTypes).toContain(DeviceType.DISPLAY)
      expect(supportedTypes).toContain(DeviceType.INPUT)
    })

    it('should provide default configurations', () => {
      const displayConfig = deviceFactory.getDefaultConfig(DeviceType.DISPLAY)
      expect(displayConfig.type).toBe(DeviceType.DISPLAY)
      expect(displayConfig.capabilities).toContain(DeviceCapability.TEXT_OUTPUT)
      expect(displayConfig.capabilities).toContain(DeviceCapability.GRAPHICS_OUTPUT)

      const inputConfig = deviceFactory.getDefaultConfig(DeviceType.INPUT)
      expect(inputConfig.type).toBe(DeviceType.INPUT)
      expect(inputConfig.capabilities).toContain(DeviceCapability.KEYBOARD_INPUT)
      expect(inputConfig.capabilities).toContain(DeviceCapability.POINTER_INPUT)
    })
  })

  describe('Web Display Device', () => {
    let displayDevice: WebDisplayDevice

    beforeEach(() => {
      displayDevice = new WebDisplayDevice('test-display', 'Test Display')
    })

    it('should initialize correctly', async () => {
      await displayDevice.initialize()
      expect(displayDevice.isReady()).toBe(true)
    })

    it('should have correct properties', () => {
      expect(displayDevice.id).toBe('test-display')
      expect(displayDevice.name).toBe('Test Display')
      expect(displayDevice.type).toBe(DeviceType.DISPLAY)
      expect(displayDevice.capabilities).toContain(DeviceCapability.TEXT_OUTPUT)
      expect(displayDevice.capabilities).toContain(DeviceCapability.GRAPHICS_OUTPUT)
    })

    it('should provide status information', () => {
      const status = displayDevice.getStatus()
      expect(status).toHaveProperty('isReady')
      expect(status).toHaveProperty('isConnected')
      expect(status).toHaveProperty('metadata')
    })

    it('should handle text operations', async () => {
      await displayDevice.initialize()
      
      await displayDevice.writeText('Hello World')
      await displayDevice.writeLine('New Line')
      
      const position = await displayDevice.getCursorPosition()
      expect(position).toHaveProperty('x')
      expect(position).toHaveProperty('y')
    })

    it('should handle color operations', async () => {
      await displayDevice.initialize()
      
      await displayDevice.setTextColor({ r: 255, g: 0, b: 0 })
      await displayDevice.setBackgroundColor({ r: 0, g: 0, b: 255 })
      
      // Colors should be set without errors
      expect(displayDevice.isReady()).toBe(true)
    })

    it('should handle graphics operations', async () => {
      await displayDevice.initialize()
      
      await displayDevice.drawPixel(10, 10, { r: 255, g: 0, b: 0 })
      await displayDevice.drawLine(0, 0, 100, 100, { r: 0, g: 255, b: 0 })
      await displayDevice.drawRectangle(50, 50, 100, 100, { r: 0, g: 0, b: 255 })
      await displayDevice.drawCircle(100, 100, 50, { r: 255, g: 255, b: 0 })
      
      // Graphics operations should complete without errors
      expect(displayDevice.isReady()).toBe(true)
    })
  })

  describe('Web Input Device', () => {
    let inputDevice: WebInputDevice

    beforeEach(() => {
      inputDevice = new WebInputDevice('test-input', 'Test Input')
    })

    it('should initialize correctly', async () => {
      await inputDevice.initialize()
      expect(inputDevice.isReady()).toBe(true)
    })

    it('should have correct properties', () => {
      expect(inputDevice.id).toBe('test-input')
      expect(inputDevice.name).toBe('Test Input')
      expect(inputDevice.type).toBe(DeviceType.INPUT)
      expect(inputDevice.capabilities).toContain(DeviceCapability.KEYBOARD_INPUT)
      expect(inputDevice.capabilities).toContain(DeviceCapability.POINTER_INPUT)
    })

    it('should provide status information', () => {
      const status = inputDevice.getStatus()
      expect(status).toHaveProperty('isReady')
      expect(status).toHaveProperty('isConnected')
      expect(status).toHaveProperty('metadata')
    })

    it('should handle event listeners', () => {
      const callback = () => {}
      
      inputDevice.onInputEvent(CustomInputEvent.KEY_DOWN, callback)
      inputDevice.offInputEvent(CustomInputEvent.KEY_DOWN, callback)
      
      // Should not throw errors
      expect(inputDevice.isReady()).toBe(false) // Not initialized yet
    })
  })

  describe('Device Adapter', () => {
    let deviceAdapter: DeviceAdapter

    beforeEach(() => {
      deviceAdapter = new DeviceAdapter({
        deviceManager,
        enableDeviceIntegration: true
      })
    })

    it('should initialize with device manager', () => {
      expect(deviceAdapter).toBeDefined()
    })

    it('should get device status', () => {
      const status = deviceAdapter.getDeviceStatus()
      expect(status).toHaveProperty('enabled')
      expect(status).toHaveProperty('devices')
      expect(status).toHaveProperty('capabilities')
    })

    it('should handle device operations when no devices are registered', async () => {
      // These should not throw errors even when no devices are registered
      await deviceAdapter.writeToDisplay('test')
      await deviceAdapter.clearDisplay()
      await deviceAdapter.setTextColor(255, 0, 0)
      await deviceAdapter.setBackgroundColor(0, 0, 255)
      
      const input = await deviceAdapter.readInput('prompt')
      expect(input).toBe('')
    })

    it('should get capabilities', () => {
      const capabilities = deviceAdapter.getCapabilities()
      expect(Array.isArray(capabilities)).toBe(true)
    })
  })
})
