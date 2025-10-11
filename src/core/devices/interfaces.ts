/**
 * Device Abstraction Layer
 * 
 * This module defines the abstract interfaces for input/output devices
 * that can be used with the F-Basic interpreter. This decouples the
 * parser and interpreter from specific device implementations.
 */

/**
 * Base interface for all devices
 */
export interface Device {
  readonly id: string
  readonly name: string
  readonly type: DeviceType
  readonly capabilities: DeviceCapability[]
  
  /**
   * Initialize the device
   */
  initialize(): Promise<void>
  
  /**
   * Clean up resources when device is no longer needed
   */
  destroy(): Promise<void>
  
  /**
   * Check if device is ready for use
   */
  isReady(): boolean
  
  /**
   * Get device status information
   */
  getStatus(): DeviceStatus
}

/**
 * Types of devices supported
 */
export enum DeviceType {
  DISPLAY = 'display',
  INPUT = 'input',
  STORAGE = 'storage',
  AUDIO = 'audio',
  NETWORK = 'network',
  JOYSTICK = 'joystick'
}

/**
 * Device capabilities
 */
export enum DeviceCapability {
  TEXT_OUTPUT = 'text_output',
  GRAPHICS_OUTPUT = 'graphics_output',
  KEYBOARD_INPUT = 'keyboard_input',
  POINTER_INPUT = 'pointer_input',
  JOYSTICK_INPUT = 'joystick_input',
  FILE_READ = 'file_read',
  FILE_WRITE = 'file_write',
  AUDIO_PLAYBACK = 'audio_playback',
  AUDIO_RECORDING = 'audio_recording',
  NETWORK_COMMUNICATION = 'network_communication'
}

/**
 * Device status information
 */
export interface DeviceStatus {
  isReady: boolean
  isConnected: boolean
  lastError?: string
  metadata: Record<string, unknown>
}

/**
 * Display device interface for text and graphics output
 */
export interface DisplayDevice extends Device {
  readonly type: DeviceType.DISPLAY
  
  /**
   * Clear the display
   */
  clear(): Promise<void>
  
  /**
   * Set cursor position
   */
  setCursorPosition(x: number, y: number): Promise<void>
  
  /**
   * Get current cursor position
   */
  getCursorPosition(): Promise<{ x: number; y: number }>
  
  /**
   * Get display dimensions
   */
  getDimensions(): Promise<{ width: number; height: number }>
  
  /**
   * Set text color
   */
  setTextColor(color: Color): Promise<void>
  
  /**
   * Set background color
   */
  setBackgroundColor(color: Color): Promise<void>
  
  /**
   * Write text to display
   */
  writeText(text: string): Promise<void>
  
  /**
   * Write text with newline
   */
  writeLine(text: string): Promise<void>
  
  /**
   * Draw a pixel at specified coordinates
   */
  drawPixel(x: number, y: number, color: Color): Promise<void>
  
  /**
   * Draw a line between two points
   */
  drawLine(x1: number, y1: number, x2: number, y2: number, color: Color): Promise<void>
  
  /**
   * Draw a rectangle
   */
  drawRectangle(x: number, y: number, width: number, height: number, color: Color, filled?: boolean): Promise<void>
  
  /**
   * Draw a circle
   */
  drawCircle(x: number, y: number, radius: number, color: Color, filled?: boolean): Promise<void>
  
  /**
   * Refresh/update the display
   */
  refresh(): Promise<void>
}

/**
 * Input device interface for keyboard and other input methods
 */
export interface InputDevice extends Device {
  readonly type: DeviceType.INPUT
  
  /**
   * Read a line of text input
   */
  readLine(prompt?: string): Promise<string>
  
  /**
   * Read a single character
   */
  readChar(): Promise<string>
  
  /**
   * Check if a key is currently pressed
   */
  isKeyPressed(key: string): Promise<boolean>
  
  /**
   * Get current mouse/pointer position
   */
  getPointerPosition(): Promise<{ x: number; y: number }>
  
  /**
   * Check if mouse button is pressed
   */
  isButtonPressed(button: MouseButton): Promise<boolean>
  
  /**
   * Set up event listeners for input events
   */
  onInputEvent(event: CustomInputEvent, callback: (data: InputEventData) => void): void
  
  /**
   * Remove event listeners
   */
  offInputEvent(event: CustomInputEvent, callback: (data: InputEventData) => void): void
}

/**
 * Storage device interface for file operations
 */
export interface StorageDevice extends Device {
  readonly type: DeviceType.STORAGE
  
  /**
   * Read data from a file
   */
  readFile(filename: string): Promise<string>
  
  /**
   * Write data to a file
   */
  writeFile(filename: string, data: string): Promise<void>
  
  /**
   * Check if a file exists
   */
  fileExists(filename: string): Promise<boolean>
  
  /**
   * Delete a file
   */
  deleteFile(filename: string): Promise<void>
  
  /**
   * List files in a directory
   */
  listFiles(directory?: string): Promise<string[]>
  
  /**
   * Create a directory
   */
  createDirectory(directory: string): Promise<void>
  
  /**
   * Get file information
   */
  getFileInfo(filename: string): Promise<FileInfo>
}

/**
 * Audio device interface for sound output
 */
export interface AudioDevice extends Device {
  readonly type: DeviceType.AUDIO
  
  /**
   * Play a tone at specified frequency and duration
   */
  playTone(frequency: number, duration: number, volume?: number): Promise<void>
  
  /**
   * Play a sequence of tones
   */
  playToneSequence(tones: Tone[]): Promise<void>
  
  /**
   * Stop all audio playback
   */
  stopAudio(): Promise<void>
  
  /**
   * Set master volume
   */
  setVolume(volume: number): Promise<void>
  
  /**
   * Get current volume
   */
  getVolume(): Promise<number>
}

/**
 * Network device interface for communication
 */
export interface NetworkDevice extends Device {
  readonly type: DeviceType.NETWORK
  
  /**
   * Send data to a remote endpoint
   */
  sendData(endpoint: string, data: string): Promise<void>
  
  /**
   * Receive data from a remote endpoint
   */
  receiveData(endpoint: string): Promise<string>
  
  /**
   * Check if network is available
   */
  isNetworkAvailable(): Promise<boolean>
  
  /**
   * Get network status
   */
  getNetworkStatus(): Promise<NetworkStatus>
}

/**
 * Joystick device interface for gamepad/joystick input
 * Supports Family BASIC v3 STICK and STRIG keywords
 */
export interface JoystickDevice extends Device {
  readonly type: DeviceType.JOYSTICK
  
  /**
   * Get the number of available joysticks (0-3 for Family BASIC v3)
   */
  getJoystickCount(): Promise<number>
  
  /**
   * Get joystick cross-button state (for STICK keyword)
   * @param joystickId - Joystick ID (0, 1, 2, or 3)
   * @returns Cross-button state: 1=right, 2=left, 4=down, 8=top. Can be combined (e.g. 9 for top-right)
   */
  getStickState(joystickId: number): Promise<number>
  
  /**
   * Get joystick button state (for STRIG keyword)
   * @param joystickId - Joystick ID (0, 1, 2, or 3)
   * @returns Button state: 1=start, 2=select, 4=B, 8=A. Can be combined
   */
  getTriggerState(joystickId: number): Promise<number>
  
  /**
   * Check if a specific cross-button is pressed
   * @param joystickId - Joystick ID (0, 1, 2, or 3)
   * @param direction - Direction: 'right', 'left', 'down', 'up'
   * @returns True if the direction button is pressed
   */
  isCrossButtonPressed(joystickId: number, direction: 'right' | 'left' | 'down' | 'up'): Promise<boolean>
  
  /**
   * Check if a specific action button is pressed
   * @param joystickId - Joystick ID (0, 1, 2, or 3)
   * @param button - Button: 'start', 'select', 'B', 'A'
   * @returns True if the button is pressed
   */
  isActionButtonPressed(joystickId: number, button: 'start' | 'select' | 'B' | 'A'): Promise<boolean>
  
  /**
   * Set up event listeners for joystick events
   */
  onJoystickEvent(event: JoystickEvent, callback: (data: JoystickEventData) => void): void
  
  /**
   * Remove joystick event listeners
   */
  offJoystickEvent(event: JoystickEvent, callback: (data: JoystickEventData) => void): void
}

/**
 * Color representation
 */
export interface Color {
  r: number
  g: number
  b: number
  a?: number
}

/**
 * Mouse button types
 */
export enum MouseButton {
  LEFT = 'left',
  RIGHT = 'right',
  MIDDLE = 'middle'
}

/**
 * Input event types
 */
export enum CustomInputEvent {
  KEY_DOWN = 'keydown',
  KEY_UP = 'keyup',
  MOUSE_DOWN = 'mousedown',
  MOUSE_UP = 'mouseup',
  MOUSE_MOVE = 'mousemove',
  TEXT_INPUT = 'textinput'
}

/**
 * Input event data
 */
export interface InputEventData {
  type: CustomInputEvent
  key?: string
  button?: MouseButton
  x?: number
  y?: number
  text?: string
  timestamp: number
}

/**
 * Joystick event types
 */
export enum JoystickEvent {
  BUTTON_DOWN = 'joystick_button_down',
  BUTTON_UP = 'joystick_button_up',
  STICK_MOVE = 'joystick_stick_move',
  CONNECTED = 'joystick_connected',
  DISCONNECTED = 'joystick_disconnected'
}

/**
 * Joystick event data
 */
export interface JoystickEventData {
  type: JoystickEvent
  stickNumber: number
  buttonNumber?: number
  axis?: number
  position?: number
  timestamp: number
}

/**
 * File information
 */
export interface FileInfo {
  name: string
  size: number
  created: Date
  modified: Date
  isDirectory: boolean
}

/**
 * Tone definition for audio
 */
export interface Tone {
  frequency: number
  duration: number
  volume?: number
}

/**
 * Network status information
 */
export interface NetworkStatus {
  isConnected: boolean
  connectionType?: string
  speed?: number
  latency?: number
}

/**
 * Device manager interface for managing multiple devices
 */
export interface DeviceManager {
  /**
   * Register a device
   */
  registerDevice(device: Device): Promise<void>
  
  /**
   * Unregister a device
   */
  unregisterDevice(deviceId: string): Promise<void>
  
  /**
   * Get a device by ID
   */
  getDevice(deviceId: string): Device | undefined
  
  /**
   * Get devices by type
   */
  getDevicesByType(type: DeviceType): Device[]
  
  /**
   * Get devices by capability
   */
  getDevicesByCapability(capability: DeviceCapability): Device[]
  
  /**
   * Get the primary device of a specific type
   */
  getPrimaryDevice(type: DeviceType): Device | undefined
  
  /**
   * Set the primary device for a type
   */
  setPrimaryDevice(type: DeviceType, deviceId: string): void
  
  /**
   * Initialize all registered devices
   */
  initializeAll(): Promise<void>
  
  /**
   * Destroy all registered devices
   */
  destroyAll(): Promise<void>
  
  /**
   * Get all registered devices
   */
  getAllDevices(): Device[]
}

/**
 * Device configuration
 */
export interface DeviceConfig {
  id: string
  name: string
  type: DeviceType
  capabilities: DeviceCapability[]
  settings: Record<string, unknown>
  enabled: boolean
}

/**
 * Device factory interface for creating devices
 */
export interface DeviceFactory {
  /**
   * Create a device from configuration
   */
  createDevice(config: DeviceConfig): Promise<Device>
  
  /**
   * Get supported device types
   */
  getSupportedTypes(): DeviceType[]
  
  /**
   * Get default configuration for a device type
   */
  getDefaultConfig(type: DeviceType): DeviceConfig
}
