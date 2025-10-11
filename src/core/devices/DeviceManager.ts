/**
 * Device Manager Implementation
 * 
 * Manages multiple devices and provides a unified interface
 */

import type {
  Device,
  DeviceManager,
  DeviceConfig,
  DeviceFactory
} from './interfaces'
import { DeviceType, DeviceCapability } from './interfaces'
import type { WebDisplayConfig } from './WebDisplayDevice'
import type { WebInputConfig } from './WebInputDevice'
import type { WebJoystickConfig } from './WebJoystickDevice'

export class BasicDeviceManager implements DeviceManager {
  private devices: Map<string, Device> = new Map()
  private primaryDevices: Map<DeviceType, string> = new Map()

  async registerDevice(device: Device): Promise<void> {
    if (this.devices.has(device.id)) {
      throw new Error(`Device with ID '${device.id}' is already registered`)
    }

    await device.initialize()
    this.devices.set(device.id, device)

    // Set as primary if it's the first device of its type
    if (!this.primaryDevices.has(device.type)) {
      this.primaryDevices.set(device.type, device.id)
    }
  }

  async unregisterDevice(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId)
    if (!device) {
      throw new Error(`Device with ID '${deviceId}' is not registered`)
    }

    await device.destroy()
    this.devices.delete(deviceId)

    // Update primary device if this was the primary
    if (this.primaryDevices.get(device.type) === deviceId) {
      this.primaryDevices.delete(device.type)
      
      // Find another device of the same type to be primary
      const remainingDevices = this.getDevicesByType(device.type)
      if (remainingDevices.length > 0 && remainingDevices[0]) {
        this.primaryDevices.set(device.type, remainingDevices[0].id)
      }
    }
  }

  getDevice(deviceId: string): Device | undefined {
    return this.devices.get(deviceId)
  }

  getDevicesByType(type: DeviceType): Device[] {
    return Array.from(this.devices.values()).filter(device => device.type === type)
  }

  getDevicesByCapability(capability: DeviceCapability): Device[] {
    return Array.from(this.devices.values()).filter(device => 
      device.capabilities.includes(capability)
    )
  }

  getPrimaryDevice(type: DeviceType): Device | undefined {
    const primaryId = this.primaryDevices.get(type)
    return primaryId ? this.devices.get(primaryId) : undefined
  }

  setPrimaryDevice(type: DeviceType, deviceId: string): void {
    const device = this.devices.get(deviceId)
    if (!device) {
      throw new Error(`Device with ID '${deviceId}' is not registered`)
    }

    if (device.type !== type) {
      throw new Error(`Device '${deviceId}' is not of type '${type}'`)
    }

    this.primaryDevices.set(type, deviceId)
  }

  async initializeAll(): Promise<void> {
    const initPromises = Array.from(this.devices.values()).map(device => 
      device.initialize().catch(error => {
        console.error(`Failed to initialize device ${device.id}:`, error)
      })
    )

    await Promise.all(initPromises)
  }

  async destroyAll(): Promise<void> {
    const destroyPromises = Array.from(this.devices.values()).map(device => 
      device.destroy().catch(error => {
        console.error(`Failed to destroy device ${device.id}:`, error)
      })
    )

    await Promise.all(destroyPromises)
    this.devices.clear()
    this.primaryDevices.clear()
  }

  getAllDevices(): Device[] {
    return Array.from(this.devices.values())
  }

  /**
   * Get device statistics
   */
  getDeviceStats(): {
    total: number
    byType: Record<DeviceType, number>
    ready: number
    connected: number
  } {
    const devices = this.getAllDevices()
    const byType: Record<DeviceType, number> = {} as Record<DeviceType, number>
    
    // Initialize all device types to 0
    Object.values(DeviceType).forEach(type => {
      byType[type] = 0
    })

    let ready = 0
    let connected = 0

    devices.forEach(device => {
      byType[device.type]++
      
      if (device.isReady()) {
        ready++
      }

      const status = device.getStatus()
      if (status.isConnected) {
        connected++
      }
    })

    return {
      total: devices.length,
      byType,
      ready,
      connected
    }
  }
}

/**
 * Basic Device Factory Implementation
 */
export class BasicDeviceFactory implements DeviceFactory {
  private factories: Map<DeviceType, (config: DeviceConfig) => Promise<Device>> = new Map()

  constructor() {
    // Register default factories for web devices
    this.registerFactory(DeviceType.DISPLAY, async (config) => {
      const { WebDisplayDevice } = await import('./WebDisplayDevice')
      return new WebDisplayDevice(config.id, config.name, config.settings as WebDisplayConfig)
    })

    this.registerFactory(DeviceType.INPUT, async (config) => {
      const { WebInputDevice } = await import('./WebInputDevice')
      return new WebInputDevice(config.id, config.name, config.settings as WebInputConfig)
    })

    this.registerFactory(DeviceType.JOYSTICK, async (config) => {
      const { WebJoystickDevice } = await import('./WebJoystickDevice')
      return new WebJoystickDevice(config.id, config.name, config.settings as WebJoystickConfig)
    })
  }

  registerFactory(type: DeviceType, factory: (config: DeviceConfig) => Promise<Device>): void {
    this.factories.set(type, factory)
  }

  async createDevice(config: DeviceConfig): Promise<Device> {
    const factory = this.factories.get(config.type)
    if (!factory) {
      throw new Error(`No factory registered for device type '${config.type}'`)
    }

    return await factory(config)
  }

  getSupportedTypes(): DeviceType[] {
    return Array.from(this.factories.keys())
  }

  getDefaultConfig(type: DeviceType): DeviceConfig {
    const baseConfig: DeviceConfig = {
      id: `device-${Date.now()}`,
      name: `${type} Device`,
      type,
      capabilities: [],
      settings: {},
      enabled: true
    }

    switch (type) {
      case DeviceType.DISPLAY:
        return {
          ...baseConfig,
          capabilities: [DeviceCapability.TEXT_OUTPUT, DeviceCapability.GRAPHICS_OUTPUT],
          settings: {
            width: 800,
            height: 600,
            fontSize: 16,
            fontFamily: 'monospace',
            backgroundColor: { r: 255, g: 255, b: 255 },
            textColor: { r: 0, g: 0, b: 0 }
          }
        }

      case DeviceType.INPUT:
        return {
          ...baseConfig,
          capabilities: [DeviceCapability.KEYBOARD_INPUT, DeviceCapability.POINTER_INPUT],
          settings: {
            enableKeyboard: true,
            enableMouse: true,
            enableTouch: true
          }
        }

      case DeviceType.STORAGE:
        return {
          ...baseConfig,
          capabilities: [DeviceCapability.FILE_READ, DeviceCapability.FILE_WRITE],
          settings: {
            basePath: './',
            allowWrite: true
          }
        }

      case DeviceType.AUDIO:
        return {
          ...baseConfig,
          capabilities: [DeviceCapability.AUDIO_PLAYBACK],
          settings: {
            sampleRate: 44100,
            channels: 2,
            volume: 0.5
          }
        }

      case DeviceType.NETWORK:
        return {
          ...baseConfig,
          capabilities: [DeviceCapability.NETWORK_COMMUNICATION],
          settings: {
            timeout: 5000,
            retries: 3
          }
        }

      case DeviceType.JOYSTICK:
        return {
          ...baseConfig,
          capabilities: [DeviceCapability.JOYSTICK_INPUT],
          settings: {
            enableGamepadAPI: true,
            pollInterval: 16,
            deadzone: 0.1,
            crossButtonThreshold: 0.5
          }
        }

      default:
        return baseConfig
    }
  }
}
