/**
 * Web Joystick Device Implementation
 * 
 * A concrete implementation of JoystickDevice for web browsers using Gamepad API
 * Supports Family BASIC v3 STICK and STRIG keywords
 */

/* global navigator, Gamepad, window, clearInterval, GamepadEvent */

import type {
  JoystickDevice,
  DeviceStatus,
  JoystickEventData
} from './interfaces'
import { DeviceType, DeviceCapability, JoystickEvent } from './interfaces'

export interface WebJoystickConfig {
  enableGamepadAPI?: boolean
  pollInterval?: number
  deadzone?: number
  crossButtonThreshold?: number // Threshold for converting analog stick to digital cross buttons
}

export class WebJoystickDevice implements JoystickDevice {
  readonly id: string
  readonly name: string
  readonly type = DeviceType.JOYSTICK
  readonly capabilities: DeviceCapability[] = [
    DeviceCapability.JOYSTICK_INPUT
  ]

  private config: WebJoystickConfig
  private isInitialized = false
  private gamepads: Gamepad[] = []
  private pollInterval: number | null = null
  private eventListeners: Map<JoystickEvent, Set<(data: JoystickEventData) => void>> = new Map()
  private lastButtonStates: Map<number, boolean[]> = new Map()
  private lastStickStates: Map<number, { x: number; y: number }> = new Map()

  constructor(id: string, name: string, config: WebJoystickConfig = {}) {
    this.id = id
    this.name = name
    this.config = {
      enableGamepadAPI: true,
      pollInterval: 16, // ~60fps
      deadzone: 0.1,
      crossButtonThreshold: 0.5, // Threshold for converting analog stick to digital cross buttons
      ...config
    }
  }

  async initialize(): Promise<void> {
    if (!this.config.enableGamepadAPI) {
      throw new Error('Gamepad API is disabled')
    }

    if (!navigator.getGamepads) {
      throw new Error('Gamepad API not supported in this browser')
    }

    // Set up gamepad event listeners
    window.addEventListener('gamepadconnected', this.handleGamepadConnected.bind(this))
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this))

    // Start polling for gamepad state
    this.startPolling()

    this.isInitialized = true
  }

  async destroy(): Promise<void> {
    this.stopPolling()
    
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected.bind(this))
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this))
    
    this.eventListeners.clear()
    this.lastButtonStates.clear()
    this.lastStickStates.clear()
    
    this.isInitialized = false
  }

  isReady(): boolean {
    return this.isInitialized
  }

  getStatus(): DeviceStatus {
    return {
      isReady: this.isInitialized,
      isConnected: this.gamepads.length > 0,
      metadata: {
        gamepadCount: this.gamepads.length,
        gamepadIds: this.gamepads.map(gp => gp.id),
        config: this.config
      }
    }
  }

  async getJoystickCount(): Promise<number> {
    this.updateGamepads()
    return Math.min(this.gamepads.length, 4) // Family BASIC v3 supports up to 4 joysticks
  }

  async getStickState(joystickId: number): Promise<number> {
    this.updateGamepads()
    
    if (joystickId < 0 || joystickId >= 4 || joystickId >= this.gamepads.length) {
      return 0
    }

    const gamepad = this.gamepads[joystickId]
    if (!gamepad) {
      return 0
    }

    let state = 0
    
    // Convert analog stick to digital cross buttons
    const leftStickX = gamepad.axes[0] || 0
    const leftStickY = gamepad.axes[1] || 0
    const threshold = this.config.crossButtonThreshold || 0.5
    
    // Family BASIC v3 STICK values: 1=right, 2=left, 4=down, 8=top
    if (leftStickX > threshold) state |= 1  // right
    if (leftStickX < -threshold) state |= 2 // left
    if (leftStickY > threshold) state |= 4  // down
    if (leftStickY < -threshold) state |= 8 // top
    
    // Also check D-pad if available (buttons 12-15 are typically D-pad)
    if (gamepad.buttons.length > 12) {
      if (gamepad.buttons[15]?.pressed) state |= 1  // right
      if (gamepad.buttons[14]?.pressed) state |= 2  // left
      if (gamepad.buttons[13]?.pressed) state |= 4  // down
      if (gamepad.buttons[12]?.pressed) state |= 8  // up
    }
    
    return state
  }

  async getTriggerState(joystickId: number): Promise<number> {
    this.updateGamepads()
    
    if (joystickId < 0 || joystickId >= 4 || joystickId >= this.gamepads.length) {
      return 0
    }

    const gamepad = this.gamepads[joystickId]
    if (!gamepad) {
      return 0
    }

    let state = 0
    
    // Family BASIC v3 STRIG values: 1=start, 2=select, 4=B, 8=A
    // Map common gamepad buttons to Family BASIC buttons
    if (gamepad.buttons[9]?.pressed) state |= 1  // start button
    if (gamepad.buttons[8]?.pressed) state |= 2  // select button
    if (gamepad.buttons[1]?.pressed) state |= 4  // B button (usually X on Xbox, Square on PlayStation)
    if (gamepad.buttons[0]?.pressed) state |= 8  // A button (usually A on Xbox, X on PlayStation)
    
    return state
  }

  async isCrossButtonPressed(joystickId: number, direction: 'right' | 'left' | 'down' | 'up'): Promise<boolean> {
    const state = await this.getStickState(joystickId)
    
    switch (direction) {
      case 'right': return (state & 1) !== 0
      case 'left': return (state & 2) !== 0
      case 'down': return (state & 4) !== 0
      case 'up': return (state & 8) !== 0
      default: return false
    }
  }

  async isActionButtonPressed(joystickId: number, button: 'start' | 'select' | 'B' | 'A'): Promise<boolean> {
    const state = await this.getTriggerState(joystickId)
    
    switch (button) {
      case 'start': return (state & 1) !== 0
      case 'select': return (state & 2) !== 0
      case 'B': return (state & 4) !== 0
      case 'A': return (state & 8) !== 0
      default: return false
    }
  }


  onJoystickEvent(event: JoystickEvent, callback: (data: JoystickEventData) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  offJoystickEvent(event: JoystickEvent, callback: (data: JoystickEventData) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  private updateGamepads(): void {
    this.gamepads = Array.from(navigator.getGamepads()).filter(gp => gp !== null) as Gamepad[]
  }

  private startPolling(): void {
    if (this.pollInterval) return

    this.pollInterval = window.setInterval(() => {
      this.pollGamepadState()
    }, this.config.pollInterval)
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  private pollGamepadState(): void {
    this.updateGamepads()

    for (let i = 0; i < this.gamepads.length; i++) {
      const gamepad = this.gamepads[i]
      if (!gamepad) continue

      // Check button state changes
      const currentButtons = gamepad.buttons.map(button => button.pressed)
      const lastButtons = this.lastButtonStates.get(i) || []

      for (let j = 0; j < currentButtons.length; j++) {
        if (currentButtons[j] !== lastButtons[j]) {
          this.emitEvent(currentButtons[j] ? JoystickEvent.BUTTON_DOWN : JoystickEvent.BUTTON_UP, {
            type: currentButtons[j] ? JoystickEvent.BUTTON_DOWN : JoystickEvent.BUTTON_UP,
            stickNumber: i,
            buttonNumber: j,
            timestamp: Date.now()
          })
        }
      }

      this.lastButtonStates.set(i, currentButtons)

      // Check stick position changes
      const currentStick = { x: gamepad.axes[0] || 0, y: gamepad.axes[1] || 0 }
      const lastStick = this.lastStickStates.get(i) || { x: 0, y: 0 }

      const threshold = 0.01 // Small threshold to avoid noise
      if (Math.abs(currentStick.x - lastStick.x) > threshold || 
          Math.abs(currentStick.y - lastStick.y) > threshold) {
        this.emitEvent(JoystickEvent.STICK_MOVE, {
          type: JoystickEvent.STICK_MOVE,
          stickNumber: i,
          axis: 0, // X axis
          position: currentStick.x,
          timestamp: Date.now()
        })

        this.emitEvent(JoystickEvent.STICK_MOVE, {
          type: JoystickEvent.STICK_MOVE,
          stickNumber: i,
          axis: 1, // Y axis
          position: currentStick.y,
          timestamp: Date.now()
        })
      }

      this.lastStickStates.set(i, currentStick)
    }
  }

  private handleGamepadConnected(event: GamepadEvent): void {
    this.updateGamepads()
    this.emitEvent(JoystickEvent.CONNECTED, {
      type: JoystickEvent.CONNECTED,
      stickNumber: event.gamepad.index,
      timestamp: Date.now()
    })
  }

  private handleGamepadDisconnected(event: GamepadEvent): void {
    this.updateGamepads()
    this.emitEvent(JoystickEvent.DISCONNECTED, {
      type: JoystickEvent.DISCONNECTED,
      stickNumber: event.gamepad.index,
      timestamp: Date.now()
    })
  }

  private emitEvent(event: JoystickEvent, data: JoystickEventData): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }
}
