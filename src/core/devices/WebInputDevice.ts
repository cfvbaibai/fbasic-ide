/**
 * Web Input Device Implementation
 * 
 * A concrete implementation of InputDevice for web browsers
 */

/* global HTMLElement, document, KeyboardEvent, InputEvent */

import type {
  InputDevice,
  DeviceStatus,
  InputEventData
} from './interfaces'
import { DeviceType, DeviceCapability, CustomInputEvent, MouseButton } from './interfaces'

export interface WebInputConfig {
  enableKeyboard?: boolean
  enableMouse?: boolean
  enableTouch?: boolean
  targetElement?: HTMLElement
}

export class WebInputDevice implements InputDevice {
  readonly id: string
  readonly name: string
  readonly type = DeviceType.INPUT
  readonly capabilities: DeviceCapability[] = [
    DeviceCapability.KEYBOARD_INPUT,
    DeviceCapability.POINTER_INPUT
  ]

  private targetElement: HTMLElement
  private eventListeners: Map<CustomInputEvent, Set<(data: InputEventData) => void>> = new Map()
  private inputBuffer: string[] = []
  private isInitialized = false
  private currentKeys: Set<string> = new Set()
  private currentButtons: Set<MouseButton> = new Set()
  private pointerPosition = { x: 0, y: 0 }

  constructor(id: string, name: string, private config: WebInputConfig = {}) {
    this.id = id
    this.name = name
    this.targetElement = config.targetElement || document.body
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Set up event listeners
    if (this.config.enableKeyboard !== false) {
      this.setupKeyboardListeners()
    }

    if (this.config.enableMouse !== false) {
      this.setupMouseListeners()
    }

    if (this.config.enableTouch !== false) {
      this.setupTouchListeners()
    }

    // Make the target element focusable
    if (!this.targetElement.hasAttribute('tabindex')) {
      this.targetElement.setAttribute('tabindex', '0')
    }

    this.isInitialized = true
  }

  async destroy(): Promise<void> {
    if (!this.isInitialized) return

    // Remove all event listeners
    this.removeAllListeners()
    this.eventListeners.clear()
    this.inputBuffer = []
    this.currentKeys.clear()
    this.currentButtons.clear()

    this.isInitialized = false
  }

  isReady(): boolean {
    return this.isInitialized
  }

  getStatus(): DeviceStatus {
    return {
      isReady: this.isReady(),
      isConnected: true,
      metadata: {
        targetElement: this.targetElement.tagName,
        keyboardEnabled: this.config.enableKeyboard !== false,
        mouseEnabled: this.config.enableMouse !== false,
        touchEnabled: this.config.enableTouch !== false,
        bufferSize: this.inputBuffer.length
      }
    }
  }

  async readLine(prompt?: string): Promise<string> {
    if (prompt) {
      // In a real implementation, you might want to display the prompt
      console.log(prompt)
    }

    return new Promise((resolve) => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          const line = this.inputBuffer.join('')
          this.inputBuffer = []
          this.targetElement.removeEventListener('keydown', handleKeyDown)
          resolve(line)
        } else if (event.key === 'Backspace') {
          this.inputBuffer.pop()
        } else if (event.key.length === 1) {
          this.inputBuffer.push(event.key)
        }
        event.preventDefault()
      }

      this.targetElement.addEventListener('keydown', handleKeyDown)
      this.targetElement.focus()
    })
  }

  async readChar(): Promise<string> {
    return new Promise((resolve) => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key.length === 1) {
          this.targetElement.removeEventListener('keydown', handleKeyDown)
          resolve(event.key)
        }
        event.preventDefault()
      }

      this.targetElement.addEventListener('keydown', handleKeyDown)
      this.targetElement.focus()
    })
  }

  async isKeyPressed(key: string): Promise<boolean> {
    return this.currentKeys.has(key.toLowerCase())
  }

  async getPointerPosition(): Promise<{ x: number; y: number }> {
    return { ...this.pointerPosition }
  }

  async isButtonPressed(button: MouseButton): Promise<boolean> {
    return this.currentButtons.has(button)
  }

  onInputEvent(event: CustomInputEvent, callback: (data: InputEventData) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  offInputEvent(event: CustomInputEvent, callback: (data: InputEventData) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  private setupKeyboardListeners(): void {
    this.targetElement.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase()
      this.currentKeys.add(key)
      
      this.emitEvent(CustomInputEvent.KEY_DOWN, {
        type: CustomInputEvent.KEY_DOWN,
        key: event.key,
        timestamp: Date.now()
      })
    })

    this.targetElement.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase()
      this.currentKeys.delete(key)
      
      this.emitEvent(CustomInputEvent.KEY_UP, {
        type: CustomInputEvent.KEY_UP,
        key: event.key,
        timestamp: Date.now()
      })
    })

    this.targetElement.addEventListener('input', (event) => {
      const inputEvent = event as InputEvent
      this.emitEvent(CustomInputEvent.TEXT_INPUT, {
        type: CustomInputEvent.TEXT_INPUT,
        text: (inputEvent as InputEvent & { data?: string }).data || '',
        timestamp: Date.now()
      })
    })
  }

  private setupMouseListeners(): void {
    this.targetElement.addEventListener('mousedown', (event) => {
      const button = this.getMouseButton(event.button)
      this.currentButtons.add(button)
      
      this.updatePointerPosition(event.clientX, event.clientY)
      
      this.emitEvent(CustomInputEvent.MOUSE_DOWN, {
        type: CustomInputEvent.MOUSE_DOWN,
        button,
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now()
      })
    })

    this.targetElement.addEventListener('mouseup', (event) => {
      const button = this.getMouseButton(event.button)
      this.currentButtons.delete(button)
      
      this.updatePointerPosition(event.clientX, event.clientY)
      
      this.emitEvent(CustomInputEvent.MOUSE_UP, {
        type: CustomInputEvent.MOUSE_UP,
        button,
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now()
      })
    })

    this.targetElement.addEventListener('mousemove', (event) => {
      this.updatePointerPosition(event.clientX, event.clientY)
      
      this.emitEvent(CustomInputEvent.MOUSE_MOVE, {
        type: CustomInputEvent.MOUSE_MOVE,
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now()
      })
    })
  }

  private setupTouchListeners(): void {
    this.targetElement.addEventListener('touchstart', (event) => {
      const touch = event.touches[0]
      if (touch) {
        this.updatePointerPosition(touch.clientX, touch.clientY)
        
        this.emitEvent(CustomInputEvent.MOUSE_DOWN, {
          type: CustomInputEvent.MOUSE_DOWN,
          button: MouseButton.LEFT,
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now()
        })
      }
    })

    this.targetElement.addEventListener('touchend', (event) => {
      const touch = event.changedTouches[0]
      if (touch) {
        this.updatePointerPosition(touch.clientX, touch.clientY)
        
        this.emitEvent(CustomInputEvent.MOUSE_UP, {
          type: CustomInputEvent.MOUSE_UP,
          button: MouseButton.LEFT,
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now()
        })
      }
    })

    this.targetElement.addEventListener('touchmove', (event) => {
      const touch = event.touches[0]
      if (touch) {
        this.updatePointerPosition(touch.clientX, touch.clientY)
        
        this.emitEvent(CustomInputEvent.MOUSE_MOVE, {
          type: CustomInputEvent.MOUSE_MOVE,
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now()
        })
      }
    })
  }

  private removeAllListeners(): void {
    // Remove all event listeners by cloning the element
    const newElement = this.targetElement.cloneNode(true) as HTMLElement
    this.targetElement.parentNode?.replaceChild(newElement, this.targetElement)
    this.targetElement = newElement
  }

  private emitEvent(event: CustomInputEvent, data: InputEventData): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  private updatePointerPosition(x: number, y: number): void {
    this.pointerPosition = { x, y }
  }

  private getMouseButton(button: number): MouseButton {
    switch (button) {
      case 0: return MouseButton.LEFT
      case 1: return MouseButton.MIDDLE
      case 2: return MouseButton.RIGHT
      default: return MouseButton.LEFT
    }
  }
}
