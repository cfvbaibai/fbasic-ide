/**
 * Screen State Manager
 *
 * Manages screen buffer, cursor position, and screen-related operations.
 */

import type { ScreenCell, ScreenUpdateMessage } from '@/core/interfaces'
import { logDevice } from '@/shared/logger'

export class ScreenStateManager {
  private screenBuffer: ScreenCell[][] = []
  private cursorX = 0
  private cursorY = 0
  private bgPalette = 1 // Default background palette (0-1)
  private spritePalette = 1 // Default sprite palette (0-2)
  private backdropColor = 0 // Default backdrop color code (0-60, 0 = black)
  private cgenMode = 2 // Default character generator mode (0-3): B on BG, A on sprite
  private currentExecutionId: string | null = null

  constructor() {
    this.initializeScreen()
  }

  /**
   * Initialize the screen buffer
   */
  initializeScreen(): void {
    // Initialize empty 28×24 grid
    this.screenBuffer = []
    for (let y = 0; y < 24; y++) {
      const row: ScreenCell[] = []
      for (let x = 0; x < 28; x++) {
        row.push({ character: ' ', colorPattern: 0, x, y })
      }
      this.screenBuffer.push(row)
    }
    this.cursorX = 0
    this.cursorY = 0
  }

  /**
   * Get the current screen buffer
   */
  getScreenBuffer(): ScreenCell[][] {
    return this.screenBuffer
  }

  /**
   * Get cursor position
   */
  getCursorPosition(): { x: number; y: number } {
    return { x: this.cursorX, y: this.cursorY }
  }

  /**
   * Set cursor position
   */
  setCursorPosition(x: number, y: number): void {
    // Validate ranges
    if (x < 0 || x > 27 || y < 0 || y > 23) {
      logDevice.warn(`Invalid cursor position: (${x}, ${y}), clamping to valid range`)
      x = Math.max(0, Math.min(27, x))
      y = Math.max(0, Math.min(23, y))
    }

    this.cursorX = x
    this.cursorY = y
  }

  /**
   * Write a character to the screen at the current cursor position
   */
  writeCharacter(char: string): void {
    // Handle newline
    if (char === '\n') {
      this.cursorX = 0
      this.cursorY++
      if (this.cursorY >= 24) {
        // Scroll screen up (simple implementation: reset to top)
        this.cursorY = 0
      }
      return
    }

    // Write character at cursor position
    if (this.cursorY < 24 && this.cursorX < 28) {
      this.screenBuffer[this.cursorY] ??= []
      const row = this.screenBuffer[this.cursorY]!
      let cell = row[this.cursorX]
      if (!cell) {
        cell = {
          character: ' ',
          colorPattern: 0,
          x: this.cursorX,
          y: this.cursorY,
        }
        row[this.cursorX] = cell
      }
      cell.character = char

      // Advance cursor
      this.cursorX++
      if (this.cursorX >= 28) {
        this.cursorX = 0
        this.cursorY++
        if (this.cursorY >= 24) {
          // Scroll screen up (simple implementation: reset to top)
          this.cursorY = 0
        }
      }
    }
  }

  /**
   * Set color pattern for a 2×2 area containing the specified position
   */
  setColorPattern(x: number, y: number, pattern: number): Array<{ x: number; y: number; pattern: number }> {
    // Validate ranges
    if (x < 0 || x > 27 || y < 0 || y > 23) {
      logDevice.warn(`Invalid color position: (${x}, ${y}), clamping to valid range`)
      x = Math.max(0, Math.min(27, x))
      y = Math.max(0, Math.min(23, y))
    }

    if (pattern < 0 || pattern > 3) {
      logDevice.warn(`Invalid color pattern: ${pattern}, clamping to valid range (0-3)`)
      pattern = Math.max(0, Math.min(3, pattern))
    }

    // Calculate the 2×2 area containing position (x, y)
    const areaX = Math.floor(x / 2) * 2 // Round down to even number (0, 2, 4, ...)
    const areaY = y // The y coordinate itself is the bottom row of the area

    // Update color pattern for all 4 cells in the 2×2 area
    const cellsToUpdate: Array<{ x: number; y: number; pattern: number }> = []

    // Top-left: (areaX, areaY - 1) or (areaX, 0) if areaY is 0
    const topY = areaY > 0 ? areaY - 1 : 0
    if (areaX < 28 && topY < 24) {
      const cell = this.screenBuffer[topY]?.[areaX]
      if (cell) {
        cell.colorPattern = pattern
        cellsToUpdate.push({ x: areaX, y: topY, pattern })
      }
    }

    // Top-right: (areaX + 1, areaY - 1) or (areaX + 1, 0) if areaY is 0
    if (areaX + 1 < 28 && topY < 24) {
      const row = this.screenBuffer[topY]
      const cell = row?.[areaX + 1]
      if (cell) {
        cell.colorPattern = pattern
        cellsToUpdate.push({ x: areaX + 1, y: topY, pattern })
      }
    }

    // Bottom-left: (areaX, areaY)
    if (areaX < 28 && areaY < 24) {
      const row = this.screenBuffer[areaY]
      const cell = row?.[areaX]
      if (cell) {
        cell.colorPattern = pattern
        cellsToUpdate.push({ x: areaX, y: areaY, pattern })
      }
    }

    // Bottom-right: (areaX + 1, areaY)
    if (areaX + 1 < 28 && areaY < 24) {
      const row = this.screenBuffer[areaY]
      const cell = row?.[areaX + 1]
      if (cell) {
        cell.colorPattern = pattern
        cellsToUpdate.push({ x: areaX + 1, y: areaY, pattern })
      }
    }

    return cellsToUpdate
  }

  /**
   * Set color palette
   */
  setColorPalette(bgPalette: number, spritePalette: number): void {
    // Validate ranges
    if (bgPalette < 0 || bgPalette > 1) {
      logDevice.warn(`Invalid background palette: ${bgPalette}, clamping to valid range (0-1)`)
      bgPalette = Math.max(0, Math.min(1, bgPalette))
    }

    if (spritePalette < 0 || spritePalette > 2) {
      logDevice.warn(`Invalid sprite palette: ${spritePalette}, clamping to valid range (0-2)`)
      spritePalette = Math.max(0, Math.min(2, spritePalette))
    }

    this.bgPalette = bgPalette
    this.spritePalette = spritePalette
  }

  /**
   * Set backdrop color
   */
  setBackdropColor(colorCode: number): void {
    // Validate range (0-60)
    if (colorCode < 0 || colorCode > 60) {
      logDevice.warn(`Invalid backdrop color code: ${colorCode}, clamping to valid range (0-60)`)
      colorCode = Math.max(0, Math.min(60, colorCode))
    }

    this.backdropColor = colorCode
  }

  /**
   * Set character generator mode
   */
  setCharacterGeneratorMode(mode: number): void {
    // Validate range
    if (mode < 0 || mode > 3) {
      logDevice.warn(`Invalid CGEN mode: ${mode}, clamping to valid range (0-3)`)
      mode = Math.max(0, Math.min(3, mode))
    }

    this.cgenMode = mode
  }

  /**
   * Get palette values
   */
  getPalette(): { bgPalette: number; spritePalette: number } {
    return { bgPalette: this.bgPalette, spritePalette: this.spritePalette }
  }

  /**
   * Get backdrop color
   */
  getBackdropColor(): number {
    return this.backdropColor
  }

  /**
   * Get CGEN mode
   */
  getCgenMode(): number {
    return this.cgenMode
  }

  /**
   * Set current execution ID
   */
  setCurrentExecutionId(executionId: string | null): void {
    this.currentExecutionId = executionId
  }

  /**
   * Get current execution ID
   */
  getCurrentExecutionId(): string | null {
    return this.currentExecutionId
  }

  /**
   * Create a full screen update message.
   * Defensive: if called without correct `this` (e.g. unbound), return a safe message.
   */
  createFullScreenUpdateMessage(): ScreenUpdateMessage {
    const self = this as ScreenStateManager | undefined
    const buffer = self?.screenBuffer ?? []
    const cursorX = self?.cursorX ?? 0
    const cursorY = self?.cursorY ?? 0
    const executionId = self?.currentExecutionId ?? 'unknown'
    return {
      type: 'SCREEN_UPDATE',
      id: `screen-full-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId,
        updateType: 'full',
        screenBuffer: buffer,
        cursorX,
        cursorY,
        timestamp: Date.now(),
      },
    }
  }

  /**
   * Create a cursor update message
   */
  createCursorUpdateMessage(): ScreenUpdateMessage {
    return {
      type: 'SCREEN_UPDATE',
      id: `screen-cursor-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.currentExecutionId ?? 'unknown',
        updateType: 'cursor',
        cursorX: this.cursorX,
        cursorY: this.cursorY,
        timestamp: Date.now(),
      },
    }
  }

  /**
   * Create a clear screen update message
   */
  createClearScreenUpdateMessage(): ScreenUpdateMessage {
    return {
      type: 'SCREEN_UPDATE',
      id: `screen-clear-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.currentExecutionId ?? 'unknown',
        updateType: 'clear',
        timestamp: Date.now(),
      },
    }
  }

  /**
   * Create a color pattern update message
   */
  createColorUpdateMessage(cellsToUpdate: Array<{ x: number; y: number; pattern: number }>): ScreenUpdateMessage {
    return {
      type: 'SCREEN_UPDATE',
      id: `screen-color-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.currentExecutionId ?? 'unknown',
        updateType: 'color',
        colorUpdates: cellsToUpdate,
        timestamp: Date.now(),
      },
    }
  }

  /**
   * Create a palette update message
   */
  createPaletteUpdateMessage(): ScreenUpdateMessage {
    return {
      type: 'SCREEN_UPDATE',
      id: `screen-palette-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.currentExecutionId ?? 'unknown',
        updateType: 'palette',
        bgPalette: this.bgPalette,
        spritePalette: this.spritePalette,
        timestamp: Date.now(),
      },
    }
  }

  /**
   * Create a backdrop color update message
   */
  createBackdropUpdateMessage(): ScreenUpdateMessage {
    return {
      type: 'SCREEN_UPDATE',
      id: `screen-backdrop-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.currentExecutionId ?? 'unknown',
        updateType: 'backdrop',
        backdropColor: this.backdropColor,
        timestamp: Date.now(),
      },
    }
  }

  /**
   * Create a CGEN mode update message
   */
  createCgenUpdateMessage(): ScreenUpdateMessage {
    return {
      type: 'SCREEN_UPDATE',
      id: `screen-cgen-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        executionId: this.currentExecutionId ?? 'unknown',
        updateType: 'cgen',
        cgenMode: this.cgenMode,
        timestamp: Date.now(),
      },
    }
  }
}
