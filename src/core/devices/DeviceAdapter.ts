/**
 * Device Adapter for BasicInterpreter
 * 
 * Adapts the device abstraction layer to work with the existing BasicInterpreter
 */

import type { BasicInterpreter } from '../BasicInterpreter'
import type { 
  DeviceManager, 
  DisplayDevice, 
  InputDevice, 
  JoystickDevice,
  StorageDevice,
  AudioDevice
} from './interfaces'
import { DeviceType, DeviceCapability } from './interfaces'

export interface DeviceAdapterConfig {
  deviceManager: DeviceManager
  enableDeviceIntegration?: boolean
}

export class DeviceAdapter {
  private deviceManager: DeviceManager
  private interpreter: BasicInterpreter | null = null
  private isEnabled: boolean

  constructor(private config: DeviceAdapterConfig) {
    this.deviceManager = config.deviceManager
    this.isEnabled = config.enableDeviceIntegration ?? true
  }

  /**
   * Attach the adapter to a BasicInterpreter instance
   */
  attachInterpreter(interpreter: BasicInterpreter): void {
    this.interpreter = interpreter
    this.setupDeviceIntegration()
  }

  /**
   * Detach from the current interpreter
   */
  detachInterpreter(): void {
    this.interpreter = null
  }

  /**
   * Enable or disable device integration
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (this.interpreter) {
      this.setupDeviceIntegration()
    }
  }

  /**
   * Get the primary display device
   */
  getDisplayDevice(): DisplayDevice | undefined {
    return this.deviceManager.getPrimaryDevice(DeviceType.DISPLAY) as DisplayDevice
  }

  /**
   * Get the primary input device
   */
  getInputDevice(): InputDevice | undefined {
    return this.deviceManager.getPrimaryDevice(DeviceType.INPUT) as InputDevice
  }

  /**
   * Get the primary storage device
   */
  getStorageDevice(): StorageDevice | undefined {
    return this.deviceManager.getPrimaryDevice(DeviceType.STORAGE) as StorageDevice
  }

  /**
   * Get the primary joystick device
   */
  getJoystickDevice(): JoystickDevice | undefined {
    return this.deviceManager.getPrimaryDevice(DeviceType.JOYSTICK) as JoystickDevice
  }

  /**
   * Get the primary audio device
   */
  getAudioDevice(): AudioDevice | undefined {
    return this.deviceManager.getPrimaryDevice(DeviceType.AUDIO) as AudioDevice
  }

  /**
   * Write text to the display device
   */
  async writeToDisplay(text: string): Promise<void> {
    if (!this.isEnabled) return

    const displayDevice = this.getDisplayDevice()
    if (displayDevice && displayDevice.isReady()) {
      await displayDevice.writeText(text)
    }
  }

  /**
   * Clear the display device
   */
  async clearDisplay(): Promise<void> {
    if (!this.isEnabled) return

    const displayDevice = this.getDisplayDevice()
    if (displayDevice && displayDevice.isReady()) {
      await displayDevice.clear()
    }
  }

  /**
   * Set text color on display device
   */
  async setTextColor(r: number, g: number, b: number): Promise<void> {
    if (!this.isEnabled) return

    const displayDevice = this.getDisplayDevice()
    if (displayDevice && displayDevice.isReady()) {
      await displayDevice.setTextColor({ r, g, b })
    }
  }

  /**
   * Set background color on display device
   */
  async setBackgroundColor(r: number, g: number, b: number): Promise<void> {
    if (!this.isEnabled) return

    const displayDevice = this.getDisplayDevice()
    if (displayDevice && displayDevice.isReady()) {
      await displayDevice.setBackgroundColor({ r, g, b })
    }
  }

  /**
   * Read input from input device
   */
  async readInput(prompt?: string): Promise<string> {
    if (!this.isEnabled) return ''

    const inputDevice = this.getInputDevice()
    if (inputDevice && inputDevice.isReady()) {
      return await inputDevice.readLine(prompt)
    }

    return ''
  }

  /**
   * Read a single character from input device
   */
  async readChar(): Promise<string> {
    if (!this.isEnabled) return ''

    const inputDevice = this.getInputDevice()
    if (inputDevice && inputDevice.isReady()) {
      return await inputDevice.readChar()
    }

    return ''
  }

  /**
   * Play a tone on audio device
   */
  async playTone(frequency: number, duration: number, volume?: number): Promise<void> {
    if (!this.isEnabled) return

    const audioDevice = this.getAudioDevice()
    if (audioDevice && audioDevice.isReady()) {
      await audioDevice.playTone(frequency, duration, volume)
    }
  }

  /**
   * Read file from storage device
   */
  async readFile(filename: string): Promise<string> {
    if (!this.isEnabled) return ''

    const storageDevice = this.getStorageDevice()
    if (storageDevice && storageDevice.isReady()) {
      return await storageDevice.readFile(filename)
    }

    return ''
  }

  /**
   * Write file to storage device
   */
  async writeFile(filename: string, data: string): Promise<void> {
    if (!this.isEnabled) return

    const storageDevice = this.getStorageDevice()
    if (storageDevice && storageDevice.isReady()) {
      await storageDevice.writeFile(filename, data)
    }
  }

  /**
   * Check if a file exists on storage device
   */
  async fileExists(filename: string): Promise<boolean> {
    if (!this.isEnabled) return false

    const storageDevice = this.getStorageDevice()
    if (storageDevice && storageDevice.isReady()) {
      return await storageDevice.fileExists(filename)
    }

    return false
  }

  /**
   * Get joystick cross-button state (for Family BASIC v3 STICK keyword)
   */
  async getStickState(joystickId: number): Promise<number> {
    if (!this.isEnabled) return 0

    const joystickDevice = this.getJoystickDevice()
    if (joystickDevice && joystickDevice.isReady()) {
      return await joystickDevice.getStickState(joystickId)
    }

    return 0
  }

  /**
   * Get joystick button state (for Family BASIC v3 STRIG keyword)
   */
  async getTriggerState(joystickId: number): Promise<number> {
    if (!this.isEnabled) return 0

    const joystickDevice = this.getJoystickDevice()
    if (joystickDevice && joystickDevice.isReady()) {
      return await joystickDevice.getTriggerState(joystickId)
    }

    return 0
  }

  /**
   * Get number of available joysticks (0-3 for Family BASIC v3)
   */
  async getJoystickCount(): Promise<number> {
    if (!this.isEnabled) return 0

    const joystickDevice = this.getJoystickDevice()
    if (joystickDevice && joystickDevice.isReady()) {
      return await joystickDevice.getJoystickCount()
    }

    return 0
  }

  /**
   * Get device capabilities
   */
  getCapabilities(): DeviceCapability[] {
    const capabilities: DeviceCapability[] = []
    
    const displayDevice = this.getDisplayDevice()
    if (displayDevice) {
      capabilities.push(...displayDevice.capabilities)
    }

    const inputDevice = this.getInputDevice()
    if (inputDevice) {
      capabilities.push(...inputDevice.capabilities)
    }

    const storageDevice = this.getStorageDevice()
    if (storageDevice) {
      capabilities.push(...storageDevice.capabilities)
    }

    const joystickDevice = this.getJoystickDevice()
    if (joystickDevice) {
      capabilities.push(...joystickDevice.capabilities)
    }

    const audioDevice = this.getAudioDevice()
    if (audioDevice) {
      capabilities.push(...audioDevice.capabilities)
    }

    return [...new Set(capabilities)] // Remove duplicates
  }

  /**
   * Get device status information
   */
  getDeviceStatus(): {
    enabled: boolean
    devices: Array<{
      id: string
      name: string
      type: DeviceType
      ready: boolean
      connected: boolean
    }>
    capabilities: DeviceCapability[]
  } {
    const devices = this.deviceManager.getAllDevices()
    
    return {
      enabled: this.isEnabled,
      devices: devices.map(device => ({
        id: device.id,
        name: device.name,
        type: device.type,
        ready: device.isReady(),
        connected: device.getStatus().isConnected
      })),
      capabilities: this.getCapabilities()
    }
  }

  private setupDeviceIntegration(): void {
    if (!this.interpreter || !this.isEnabled) return

    // Override interpreter methods to use devices
    this.interceptInterpreterMethods()
  }

  private interceptInterpreterMethods(): void {
    if (!this.interpreter) return

    // Store original methods
    const _originalMethods = {
      // We would override methods here if the interpreter exposed them
      // For now, we'll work with the existing output system
    }

    // Override methods to use device abstraction
    // This would require modifications to the BasicInterpreter class
    // to expose hooks for device integration
  }
}
