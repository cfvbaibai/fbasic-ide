/**
 * Device Abstraction Layer - Main Export
 * 
 * Exports all device interfaces, implementations, and utilities
 */

// Core interfaces
export * from './interfaces'

// Device implementations
export * from './WebDisplayDevice'
export * from './WebInputDevice'
export * from './WebJoystickDevice'

// Device management
export * from './DeviceManager'
export * from './DeviceAdapter'

// Re-export commonly used types for convenience
export type {
  Device,
  DisplayDevice,
  InputDevice,
  JoystickDevice,
  StorageDevice,
  AudioDevice,
  NetworkDevice,
  DeviceManager,
  DeviceFactory,
  DeviceConfig,
  DeviceStatus,
  Color,
  FileInfo,
  Tone,
  NetworkStatus,
  InputEventData,
  JoystickEventData
} from './interfaces'

export {
  DeviceType,
  DeviceCapability,
  MouseButton,
  CustomInputEvent,
  JoystickEvent
} from './interfaces'
