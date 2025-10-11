/**
 * Web Display Device Implementation
 * 
 * A concrete implementation of DisplayDevice for web browsers
 */

/* global HTMLCanvasElement, CanvasRenderingContext2D, document */

import type { 
  DisplayDevice, 
  DeviceStatus, 
  Color
} from './interfaces'
import { DeviceType, DeviceCapability } from './interfaces'

export interface WebDisplayConfig {
  canvasId?: string
  width?: number
  height?: number
  fontSize?: number
  fontFamily?: string
  backgroundColor?: Color
  textColor?: Color
}

export class WebDisplayDevice implements DisplayDevice {
  readonly id: string
  readonly name: string
  readonly type = DeviceType.DISPLAY
  readonly capabilities: DeviceCapability[] = [
    DeviceCapability.TEXT_OUTPUT,
    DeviceCapability.GRAPHICS_OUTPUT
  ]

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private cursorX = 0
  private cursorY = 0
  private currentTextColor: Color = { r: 0, g: 0, b: 0 }
  private currentBackgroundColor: Color = { r: 255, g: 255, b: 255 }
  private fontSize: number
  private fontFamily: string
  private lineHeight: number
  private charWidth: number
  private isInitialized = false

  constructor(id: string, name: string, private config: WebDisplayConfig = {}) {
    this.id = id
    this.name = name
    this.fontSize = config.fontSize || 16
    this.fontFamily = config.fontFamily || 'monospace'
    this.lineHeight = this.fontSize * 1.2
    this.charWidth = this.fontSize * 0.6
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Find or create canvas element
    this.canvas = document.getElementById(this.config.canvasId || 'fbasic-display') as HTMLCanvasElement
    
    if (!this.canvas) {
      // Create canvas if it doesn't exist
      this.canvas = document.createElement('canvas')
      this.canvas.id = this.config.canvasId || 'fbasic-display'
      this.canvas.style.border = '1px solid #ccc'
      this.canvas.style.backgroundColor = '#ffffff'
      document.body.appendChild(this.canvas)
    }

    this.ctx = this.canvas.getContext('2d')
    if (!this.ctx) {
      throw new Error('Failed to get 2D context from canvas')
    }

    // Set canvas dimensions
    this.canvas.width = this.config.width || 800
    this.canvas.height = this.config.height || 600

    // Set default colors
    if (this.config.backgroundColor) {
      this.currentBackgroundColor = this.config.backgroundColor
    }
    if (this.config.textColor) {
      this.currentTextColor = this.config.textColor
    }

    // Clear the canvas
    await this.clear()
    
    this.isInitialized = true
  }

  async destroy(): Promise<void> {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }
    this.canvas = null
    this.ctx = null
    this.isInitialized = false
  }

  isReady(): boolean {
    return this.isInitialized && this.canvas !== null && this.ctx !== null
  }

  getStatus(): DeviceStatus {
    return {
      isReady: this.isReady(),
      isConnected: this.canvas !== null,
      metadata: {
        canvasId: this.canvas?.id,
        width: this.canvas?.width,
        height: this.canvas?.height,
        fontSize: this.fontSize,
        fontFamily: this.fontFamily
      }
    }
  }

  async clear(): Promise<void> {
    if (!this.ctx || !this.canvas) return

    this.ctx.fillStyle = this.colorToString(this.currentBackgroundColor)
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    this.cursorX = 0
    this.cursorY = 0
  }

  async setCursorPosition(x: number, y: number): Promise<void> {
    this.cursorX = Math.max(0, Math.min(x, this.getMaxColumns() - 1))
    this.cursorY = Math.max(0, Math.min(y, this.getMaxRows() - 1))
  }

  async getCursorPosition(): Promise<{ x: number; y: number }> {
    return { x: this.cursorX, y: this.cursorY }
  }

  async getDimensions(): Promise<{ width: number; height: number }> {
    if (!this.canvas) return { width: 0, height: 0 }
    return { width: this.canvas.width, height: this.canvas.height }
  }

  async setTextColor(color: Color): Promise<void> {
    this.currentTextColor = color
  }

  async setBackgroundColor(color: Color): Promise<void> {
    this.currentBackgroundColor = color
  }

  async writeText(text: string): Promise<void> {
    if (!this.ctx || !this.canvas) return

    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`
    this.ctx.fillStyle = this.colorToString(this.currentTextColor)

    const lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line !== undefined) {
        const x = this.cursorX * this.charWidth
        const y = (this.cursorY + i) * this.lineHeight + this.fontSize

        this.ctx.fillText(line, x, y)
      }
    }

    // Update cursor position
    if (lines.length === 1 && lines[0] !== undefined) {
      this.cursorX += lines[0].length
    } else if (lines.length > 1) {
      const lastLine = lines[lines.length - 1]
      if (lastLine !== undefined) {
        this.cursorX = lastLine.length
      }
      this.cursorY += lines.length - 1
    }

    // Handle line wrapping
    const maxCols = this.getMaxColumns()
    if (this.cursorX >= maxCols) {
      this.cursorX = 0
      this.cursorY++
    }

    // Handle scrolling
    const maxRows = this.getMaxRows()
    if (this.cursorY >= maxRows) {
      await this.scrollUp()
      this.cursorY = maxRows - 1
    }
  }

  async writeLine(text: string): Promise<void> {
    await this.writeText(text + '\n')
  }

  async drawPixel(x: number, y: number, color: Color): Promise<void> {
    if (!this.ctx) return

    this.ctx.fillStyle = this.colorToString(color)
    this.ctx.fillRect(x, y, 1, 1)
  }

  async drawLine(x1: number, y1: number, x2: number, y2: number, color: Color): Promise<void> {
    if (!this.ctx) return

    this.ctx.strokeStyle = this.colorToString(color)
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }

  async drawRectangle(x: number, y: number, width: number, height: number, color: Color, filled = false): Promise<void> {
    if (!this.ctx) return

    if (filled) {
      this.ctx.fillStyle = this.colorToString(color)
      this.ctx.fillRect(x, y, width, height)
    } else {
      this.ctx.strokeStyle = this.colorToString(color)
      this.ctx.lineWidth = 1
      this.ctx.strokeRect(x, y, width, height)
    }
  }

  async drawCircle(x: number, y: number, radius: number, color: Color, filled = false): Promise<void> {
    if (!this.ctx) return

    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI)

    if (filled) {
      this.ctx.fillStyle = this.colorToString(color)
      this.ctx.fill()
    } else {
      this.ctx.strokeStyle = this.colorToString(color)
      this.ctx.lineWidth = 1
      this.ctx.stroke()
    }
  }

  async refresh(): Promise<void> {
    // Canvas automatically refreshes, but we can trigger a repaint if needed
    if (this.canvas) {
      this.canvas.style.display = 'none'
      this.canvas.offsetHeight // Force reflow
      this.canvas.style.display = 'block'
    }
  }

  private colorToString(color: Color): string {
    const { r, g, b, a = 1 } = color
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }

  private getMaxColumns(): number {
    if (!this.canvas) return 0
    return Math.floor(this.canvas.width / this.charWidth)
  }

  private getMaxRows(): number {
    if (!this.canvas) return 0
    return Math.floor(this.canvas.height / this.lineHeight)
  }

  private async scrollUp(): Promise<void> {
    if (!this.ctx || !this.canvas) return

    const imageData = this.ctx.getImageData(0, this.lineHeight, this.canvas.width, this.canvas.height - this.lineHeight)
    this.ctx.putImageData(imageData, 0, 0)
    
    // Clear the bottom line
    this.ctx.fillStyle = this.colorToString(this.currentBackgroundColor)
    this.ctx.fillRect(0, this.canvas.height - this.lineHeight, this.canvas.width, this.lineHeight)
  }
}
