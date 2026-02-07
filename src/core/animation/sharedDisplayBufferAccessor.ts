/* eslint-disable max-lines */
/**
 * Shared Display Buffer Accessor
 *
 * Unified accessor for the combined display buffer that creates consistent views
 * for all sections: sprites, screen, cursor, sequence, scalars, and animation sync.
 *
 * This class encapsulates all offset calculations and provides type-safe methods,
 * serving as the single source of truth for buffer layout. Raw views are private
 * to prevent direct array access from outside.
 *
 * All operation logic (read/write functions, sync protocol) is in this accessor.
 * The sharedDisplayBuffer.ts file contains only structure (constants, types, factory).
 *
 * @see {@link docs/reference/shared-display-buffer.md} for full buffer layout
 */

import type { ScreenCell } from '@/core/interfaces'
import { logCore } from '@/shared/logger'
import { getCharacterByCode, getCodeByChar } from '@/shared/utils/backgroundLookup'

import {
  ACK_PENDING,
  ACK_RECEIVED,
  COLS,
  MAX_SPRITES,
  OFFSET_ANIMATION_SYNC,
  OFFSET_CHARS,
  OFFSET_CURSOR,
  OFFSET_PATTERNS,
  OFFSET_SCALARS,
  OFFSET_SEQUENCE,
  ROWS,
  SHARED_DISPLAY_BUFFER_BYTES,
  slotBase,
  SyncCommandType,
} from './sharedDisplayBuffer'

// Re-export types for convenience
export type { SyncCommandType } from './sharedDisplayBuffer'

/**
 * Decoded screen state read from shared buffer.
 * Used to transfer state from buffer to IDE refs.
 */
export interface DecodedScreenState {
  buffer: ScreenCell[][]
  cursorX: number
  cursorY: number
  bgPalette: number
  spritePalette: number
  backdropColor: number
  cgenMode: number
}

/**
 * Parameters for sync commands (varies by command type)
 */
export interface SyncCommandParams {
  startX?: number
  startY?: number
  direction?: number
  speed?: number
  distance?: number
  priority?: number
}

/**
 * Sync command read from buffer
 */
export interface SyncCommand {
  commandType: SyncCommandType
  actionNumber: number
  params: {
    startX: number
    startY: number
    direction: number
    speed: number
    distance: number
    priority: number
  }
}

/**
 * Unified accessor for shared display buffer.
 *
 * Creates consistent views for all buffer sections, with methods
 * for all operations. Raw views are private - use accessor methods.
 */
export class SharedDisplayBufferAccessor {
  private readonly buffer: SharedArrayBuffer

  // Cached views - created once in constructor (all private)
  private readonly spriteViewInternal: Float64Array
  private readonly charViewInternal: Uint8Array
  private readonly patternViewInternal: Uint8Array
  private readonly cursorViewInternal: Uint8Array
  private readonly sequenceViewInternal: Int32Array
  private readonly scalarsViewInternal: Uint8Array
  private readonly syncViewInternal: Float64Array
  private readonly syncInt32ViewInternal: Int32Array

  // Section sizes
  private static readonly SPRITE_DATA_FLOATS = 96 // 8 sprites × 12 floats
  private static readonly SCREEN_CHARS = 672 // 28 × 24
  private static readonly SCREEN_PATTERNS = 672 // 28 × 24
  private static readonly CURSOR_BYTES = 2
  private static readonly SEQUENCE_INTS = 1
  private static readonly SCALARS_BYTES = 4
  private static readonly SYNC_SECTION_FLOATS = 9 // command type + action number + 6 params + ack
  private static readonly SYNC_SECTION_BYTES = 9 * 8 // 72 bytes

  // Sprite layout constants
  private static readonly FLOATS_PER_SPRITE = 12
  private static readonly SPRITE_DATA_FLOATS_CHECK = MAX_SPRITES * 12 // 96

  // Offsets within sync section (relative to sync section start in combined buffer)
  // In combined display buffer, sync section starts at byte OFFSET_ANIMATION_SYNC (2128)
  private static readonly SYNC_COMMAND_TYPE_INDEX = 0
  private static readonly SYNC_ACTION_NUMBER_INDEX = 1
  private static readonly SYNC_PARAM1_INDEX = 2
  private static readonly SYNC_PARAM2_INDEX = 3
  private static readonly SYNC_PARAM3_INDEX = 4
  private static readonly SYNC_PARAM4_INDEX = 5
  private static readonly SYNC_PARAM5_INDEX = 6
  private static readonly SYNC_PARAM6_INDEX = 7
  private static readonly SYNC_ACK_INDEX = 8

  // Screen helper
  private cellIndex(x: number, y: number): number {
    return y * COLS + x
  }

  /**
   * Create accessor from combined display buffer.
   * @param buffer - SharedArrayBuffer (must be SHARED_DISPLAY_BUFFER_BYTES)
   * @throws RangeError if buffer is too small
   */
  constructor(buffer: SharedArrayBuffer) {
    if (buffer.byteLength < SHARED_DISPLAY_BUFFER_BYTES) {
      throw new RangeError(`Buffer too small: ${buffer.byteLength} bytes, need at least ${SHARED_DISPLAY_BUFFER_BYTES}`)
    }

    this.buffer = buffer

    // Sprite data view: 96 Float64 elements at byte offset 0
    this.spriteViewInternal = new Float64Array(buffer, 0, SharedDisplayBufferAccessor.SPRITE_DATA_FLOATS)

    // Screen characters: 672 Uint8 elements at byte offset 768
    this.charViewInternal = new Uint8Array(buffer, OFFSET_CHARS, SharedDisplayBufferAccessor.SCREEN_CHARS)

    // Screen patterns: 672 Uint8 elements at byte offset 1440
    this.patternViewInternal = new Uint8Array(buffer, OFFSET_PATTERNS, SharedDisplayBufferAccessor.SCREEN_PATTERNS)

    // Cursor: 2 Uint8 elements at byte offset 2112
    this.cursorViewInternal = new Uint8Array(buffer, OFFSET_CURSOR, SharedDisplayBufferAccessor.CURSOR_BYTES)

    // Sequence: 1 Int32 element at byte offset 2116
    this.sequenceViewInternal = new Int32Array(buffer, OFFSET_SEQUENCE, SharedDisplayBufferAccessor.SEQUENCE_INTS)

    // Scalars: 4 Uint8 elements at byte offset 2120
    this.scalarsViewInternal = new Uint8Array(buffer, OFFSET_SCALARS, SharedDisplayBufferAccessor.SCALARS_BYTES)

    // Sync section view: 9 Float64 elements at byte offset OFFSET_ANIMATION_SYNC (2128)
    this.syncViewInternal = new Float64Array(
      buffer,
      OFFSET_ANIMATION_SYNC,
      SharedDisplayBufferAccessor.SYNC_SECTION_FLOATS
    )

    // Int32 view for Atomics: 9 Float64 × 2 = 18 Int32 elements at same offset
    this.syncInt32ViewInternal = new Int32Array(
      buffer,
      OFFSET_ANIMATION_SYNC,
      SharedDisplayBufferAccessor.SYNC_SECTION_FLOATS * 2
    )
  }

  /**
   * Get sprite data view (96 Float64 elements).
   * @internal For use with helper functions in sharedAnimationBuffer.ts only.
   */
  private get spriteView(): Float64Array {
    return this.spriteViewInternal
  }

  /**
   * Get sync section view (9 Float64 elements at byte offset 2128).
   * @internal For internal use only - use writeSyncCommand()/readSyncCommand() instead
   */
  private get syncView(): Float64Array {
    return this.syncViewInternal
  }

  /**
   * Get sync section Int32 view (18 Int32 elements) for Atomics operations.
   * @internal For internal use only - use notify()/waitForAck() instead
   */
  private get syncInt32View(): Int32Array {
    return this.syncInt32ViewInternal
  }

  /**
   * Notify waiting threads that sync state has changed.
   * This is a convenience wrapper around Atomics.notify for the sync section.
   * @param count - Number of threads to notify (default: 1)
   */
  notify(count = 1): void {
    try {
      Atomics.notify(this.syncInt32ViewInternal, 0, count)
    } catch {
      // Atomics.notify may throw in some contexts, ignore
    }
  }

  /**
   * Get Int32 index for acknowledgment (for Atomics operations).
   * @internal For internal use only.
   */
  private get ackInt32Index(): number {
    // Ack is at index 8 in sync section
    // syncInt32View starts at sync section, so ack is at Int32 index 8 * 2 = 16
    return 8 * 2
  }

  // ============================================================================
  // Sync Command Methods
  // ============================================================================

  /**
   * Write a sync command to the shared buffer for Animation Worker to process.
   */
  writeSyncCommand(commandType: SyncCommandType, actionNumber: number, params: SyncCommandParams = {}): void {
    const sync = this.syncViewInternal
    sync[SharedDisplayBufferAccessor.SYNC_COMMAND_TYPE_INDEX] = commandType
    sync[SharedDisplayBufferAccessor.SYNC_ACTION_NUMBER_INDEX] = actionNumber
    sync[SharedDisplayBufferAccessor.SYNC_PARAM1_INDEX] = params.startX ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM2_INDEX] = params.startY ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM3_INDEX] = params.direction ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM4_INDEX] = params.speed ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM5_INDEX] = params.distance ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM6_INDEX] = params.priority ?? 0
    sync[SharedDisplayBufferAccessor.SYNC_ACK_INDEX] = ACK_PENDING
  }

  /**
   * Read sync command from shared buffer.
   * Returns null if no command is pending.
   */
  readSyncCommand(): SyncCommand | null {
    const sync = this.syncViewInternal
    const commandType = sync[SharedDisplayBufferAccessor.SYNC_COMMAND_TYPE_INDEX] as SyncCommandType

    // Only valid command types (1-5) are real commands
    if (commandType < SyncCommandType.START_MOVEMENT || commandType > SyncCommandType.CLEAR_ALL_MOVEMENTS) {
      return null
    }

    return {
      commandType,
      actionNumber: sync[SharedDisplayBufferAccessor.SYNC_ACTION_NUMBER_INDEX] as number,
      params: {
        startX: sync[SharedDisplayBufferAccessor.SYNC_PARAM1_INDEX] as number,
        startY: sync[SharedDisplayBufferAccessor.SYNC_PARAM2_INDEX] as number,
        direction: sync[SharedDisplayBufferAccessor.SYNC_PARAM3_INDEX] as number,
        speed: sync[SharedDisplayBufferAccessor.SYNC_PARAM4_INDEX] as number,
        distance: sync[SharedDisplayBufferAccessor.SYNC_PARAM5_INDEX] as number,
        priority: sync[SharedDisplayBufferAccessor.SYNC_PARAM6_INDEX] as number,
      },
    }
  }

  /**
   * Clear sync command from shared buffer (set to NONE).
   */
  clearSyncCommand(): void {
    const sync = this.syncViewInternal
    sync[SharedDisplayBufferAccessor.SYNC_COMMAND_TYPE_INDEX] = SyncCommandType.NONE
    sync[SharedDisplayBufferAccessor.SYNC_ACTION_NUMBER_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM1_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM2_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM3_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM4_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM5_INDEX] = 0
    sync[SharedDisplayBufferAccessor.SYNC_PARAM6_INDEX] = 0
  }

  /**
   * Write acknowledgment flag.
   */
  writeAck(ack: number): void {
    this.syncViewInternal[SharedDisplayBufferAccessor.SYNC_ACK_INDEX] = ack
  }

  /**
   * Read acknowledgment flag.
   */
  readAck(): number {
    return this.syncViewInternal[SharedDisplayBufferAccessor.SYNC_ACK_INDEX] as number
  }

  /**
   * Notify waiting thread using Atomics (sets ack to RECEIVED and notifies).
   */
  notifyAck(): void {
    this.syncInt32ViewInternal[this.ackInt32Index] = ACK_RECEIVED
    try {
      Atomics.notify(this.syncInt32ViewInternal, this.ackInt32Index, 1)
    } catch {
      // Atomics.notify may throw in some contexts, ignore
    }
  }

  /**
   * Wait for acknowledgment using Atomics.
   * @param timeoutMs - Timeout in milliseconds (default 100)
   * @returns true if acknowledged, false if timeout
   */
  waitForAck(timeoutMs: number = 100): boolean {
    const ackIndex = this.ackInt32Index
    const startTime = performance.now()

    while (this.syncInt32ViewInternal[ackIndex] === ACK_PENDING) {
      const elapsed = performance.now() - startTime
      if (elapsed >= timeoutMs) {
        return false
      }
      try {
        const remaining = Math.min(10, timeoutMs - elapsed)
        Atomics.wait(this.syncInt32ViewInternal, ackIndex, ACK_PENDING, remaining)
      } catch {
        // Atomics.wait may throw if not in a worker or if buffer is not shared
        const start = performance.now()
        while (performance.now() - start < 1) {
          // Busy-wait for 1ms to yield CPU
        }
      }
    }

    return this.syncInt32ViewInternal[ackIndex] === ACK_RECEIVED
  }

  // ============================================================================
  // Screen Section Methods
  // ============================================================================

  /**
   * Read screen character code at position.
   * @param x - Column (0-27)
   * @param y - Row (0-23)
   * @returns F-BASIC character code (0-255)
   */
  readScreenChar(x: number, y: number): number {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return 0x20
    return this.charViewInternal[this.cellIndex(x, y)] ?? 0x20
  }

  /**
   * Write screen character code at position.
   * @param x - Column (0-27)
   * @param y - Row (0-23)
   * @param charCode - F-BASIC character code (0-255)
   */
  writeScreenChar(x: number, y: number, charCode: number): void {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return
    this.charViewInternal[this.cellIndex(x, y)] = Math.max(0, Math.min(255, charCode))
  }

  /**
   * Read screen color pattern at position.
   * @param x - Column (0-27)
   * @param y - Row (0-23)
   * @returns Color pattern (0-3)
   */
  readScreenPattern(x: number, y: number): number {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return 0
    return (this.patternViewInternal[this.cellIndex(x, y)] ?? 0) & 3
  }

  /**
   * Write screen color pattern at position.
   * @param x - Column (0-27)
   * @param y - Row (0-23)
   * @param pattern - Color pattern (0-3)
   */
  writeScreenPattern(x: number, y: number, pattern: number): void {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return
    this.patternViewInternal[this.cellIndex(x, y)] = pattern & 3
  }

  /**
   * Read entire screen as ScreenCell[][].
   * Useful for rendering or state inspection.
   */
  readScreenBuffer(): ScreenCell[][] {
    const buffer: ScreenCell[][] = []
    for (let y = 0; y < ROWS; y++) {
      const row: ScreenCell[] = []
      for (let x = 0; x < COLS; x++) {
        const idx = this.cellIndex(x, y)
        const charCode = this.charViewInternal[idx] ?? 0x20
        row.push({
          character: getCharacterByCode(charCode) ?? String.fromCharCode(charCode),
          colorPattern: (this.patternViewInternal[idx] ?? 0) & 3,
          x,
          y,
        })
      }
      buffer.push(row)
    }
    return buffer
  }

  // ============================================================================
  // Cursor Section Methods
  // ============================================================================

  /**
   * Read cursor position.
   * @returns Object with x (0-27) and y (0-23)
   */
  readCursor(): { x: number; y: number } {
    return {
      x: this.cursorViewInternal[0] ?? 0,
      y: this.cursorViewInternal[1] ?? 0,
    }
  }

  /**
   * Write cursor position.
   * @param x - Column (0-27)
   * @param y - Row (0-23)
   */
  writeCursor(x: number, y: number): void {
    this.cursorViewInternal[0] = Math.max(0, Math.min(COLS - 1, x))
    this.cursorViewInternal[1] = Math.max(0, Math.min(ROWS - 1, y))
  }

  // ============================================================================
  // Sequence Section Methods
  // ============================================================================

  /**
   * Read sequence number (change detection counter).
   */
  readSequence(): number {
    return this.sequenceViewInternal[0] ?? 0
  }

  /**
   * Increment sequence number to signal change.
   */
  incrementSequence(): void {
    this.sequenceViewInternal[0] = (this.sequenceViewInternal[0] ?? 0) + 1
  }

  // ============================================================================
  // Bulk Screen Operations
  // ============================================================================

  /**
   * Write screen state from ScreenCell[][] buffer into shared views.
   * Writes characters, patterns, cursor, and scalar values.
   * Does not increment sequence (caller should call incrementSequence after).
   *
   * @param screenBuffer - ScreenCell[][] array (28×24)
   * @param cursorX - Cursor X position (0-27)
   * @param cursorY - Cursor Y position (0-23)
   * @param bgPalette - Background palette (0-1)
   * @param spritePalette - Sprite palette (0-3)
   * @param backdropColor - Backdrop color (0-60)
   * @param cgenMode - Character generation mode (0-3)
   */
  writeScreenState(
    screenBuffer: ScreenCell[][],
    cursorX: number,
    cursorY: number,
    bgPalette: number,
    spritePalette: number,
    backdropColor: number,
    cgenMode: number
  ): void {
    if (screenBuffer == null) {
      logCore.warn('[SharedDisplayBufferAccessor] writeScreenState: screenBuffer is required, skipping')
      return
    }

    const {
      charViewInternal: charView,
      patternViewInternal: patternView,
      cursorViewInternal: cursorView,
      scalarsViewInternal: scalarsView,
    } = this

    for (let y = 0; y < ROWS; y++) {
      const row = screenBuffer[y]
      for (let x = 0; x < COLS; x++) {
        const cell = row?.[x]
        const idx = this.cellIndex(x, y)
        const ch = cell?.character ?? ' '
        // Store F-BASIC code (0-255); use mapping so e.g. '「' → 91, not Unicode 12300
        const code = getCodeByChar(ch) ?? (ch.length === 1 ? ch.charCodeAt(0) : 0x20)
        charView[idx] = Math.max(0, Math.min(255, code))
        patternView[idx] = (cell?.colorPattern ?? 0) & 3
      }
    }

    cursorView[0] = Math.max(0, Math.min(COLS - 1, cursorX))
    cursorView[1] = Math.max(0, Math.min(ROWS - 1, cursorY))
    scalarsView[0] = bgPalette & 1
    scalarsView[1] = spritePalette & 3
    scalarsView[2] = Math.max(0, Math.min(60, backdropColor))
    scalarsView[3] = cgenMode & 3
  }

  /**
   * Read complete screen state from shared views.
   * Returns ScreenCell[][] buffer plus cursor and scalar values.
   *
   * @returns Decoded screen state with buffer, cursor position, and scalars
   */
  readScreenState(): {
    buffer: ScreenCell[][]
    cursorX: number
    cursorY: number
    bgPalette: number
    spritePalette: number
    backdropColor: number
    cgenMode: number
  } {
    const {
      charViewInternal: charView,
      patternViewInternal: patternView,
      cursorViewInternal: cursorView,
      scalarsViewInternal: scalarsView,
    } = this
    const buffer: ScreenCell[][] = []

    for (let y = 0; y < ROWS; y++) {
      const row: ScreenCell[] = []
      for (let x = 0; x < COLS; x++) {
        const idx = this.cellIndex(x, y)
        row.push({
          character: getCharacterByCode(charView[idx] ?? 0x20) ?? String.fromCharCode(charView[idx] ?? 0x20),
          colorPattern: (patternView[idx] ?? 0) & 3,
          x,
          y,
        })
      }
      buffer.push(row)
    }

    return {
      buffer,
      cursorX: cursorView[0] ?? 0,
      cursorY: cursorView[1] ?? 0,
      bgPalette: scalarsView[0] ?? 1,
      spritePalette: scalarsView[1] ?? 1,
      backdropColor: scalarsView[2] ?? 0,
      cgenMode: scalarsView[3] ?? 2,
    }
  }

  // ============================================================================
  // Scalars Section Methods
  // ============================================================================

  /**
   * Read background palette (0-1).
   */
  readBgPalette(): number {
    return this.scalarsViewInternal[0] ?? 1
  }

  /**
   * Write background palette.
   * @param value - Palette value (0-1)
   */
  writeBgPalette(value: number): void {
    this.scalarsViewInternal[0] = value & 1
  }

  /**
   * Read sprite palette (0-3).
   */
  readSpritePalette(): number {
    return this.scalarsViewInternal[1] ?? 1
  }

  /**
   * Write sprite palette.
   * @param value - Palette value (0-3)
   */
  writeSpritePalette(value: number): void {
    this.scalarsViewInternal[1] = value & 3
  }

  /**
   * Read backdrop color (0-60).
   */
  readBackdropColor(): number {
    return this.scalarsViewInternal[2] ?? 0
  }

  /**
   * Write backdrop color.
   * @param value - Color value (0-60)
   */
  writeBackdropColor(value: number): void {
    this.scalarsViewInternal[2] = Math.max(0, Math.min(60, value))
  }

  /**
   * Read character generation mode (0-3).
   */
  readCgenMode(): number {
    return this.scalarsViewInternal[3] ?? 2
  }

  /**
   * Write character generation mode.
   * @param value - Mode value (0-3)
   */
  writeCgenMode(value: number): void {
    this.scalarsViewInternal[3] = value & 3
  }

  /**
   * Read all scalar values at once.
   */
  readScalars(): {
    bgPalette: number
    spritePalette: number
    backdropColor: number
    cgenMode: number
  } {
    return {
      bgPalette: this.readBgPalette(),
      spritePalette: this.readSpritePalette(),
      backdropColor: this.readBackdropColor(),
      cgenMode: this.readCgenMode(),
    }
  }

  /**
   * Write all scalar values at once.
   */
  writeScalars(bgPalette: number, spritePalette: number, backdropColor: number, cgenMode: number): void {
    this.writeBgPalette(bgPalette)
    this.writeSpritePalette(spritePalette)
    this.writeBackdropColor(backdropColor)
    this.writeCgenMode(cgenMode)
  }

  // ============================================================================
  // Sync Command Methods
  // ============================================================================

  /**
   * Internal helper: Write one sprite's full animation state to shared buffer.
   */
  private writeSpriteStateToView(
    view: Float64Array,
    actionNumber: number,
    x: number,
    y: number,
    isActive: boolean,
    isVisible: boolean,
    frameIndex: number = 0,
    remainingDistance: number = 0,
    totalDistance: number = 0,
    direction: number = 0,
    speed: number = 0,
    priority: number = 0,
    characterType: number = 0,
    colorCombination: number = 0
  ): void {
    const base = slotBase(actionNumber)
    view[base] = x
    view[base + 1] = y
    view[base + 2] = isActive ? 1 : 0
    view[base + 3] = isVisible ? 1 : 0
    view[base + 4] = frameIndex
    view[base + 5] = remainingDistance
    view[base + 6] = totalDistance
    view[base + 7] = direction
    view[base + 8] = speed
    view[base + 9] = priority
    view[base + 10] = characterType
    view[base + 11] = colorCombination
  }

  /**
   * Internal helper: Read one sprite's position from the shared view. Returns null if slot not used.
   */
  private readSpritePositionFromView(view: Float64Array, actionNumber: number): { x: number; y: number } | null {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return null
    const base = slotBase(actionNumber)
    return { x: view[base] ?? 0, y: view[base + 1] ?? 0 }
  }

  /**
   * Internal helper: Read isActive for one sprite (1 = active, 0 = inactive).
   */
  private readSpriteIsActiveFromView(view: Float64Array, actionNumber: number): boolean {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return false
    const base = slotBase(actionNumber)
    return view[base + 2] !== 0
  }

  /**
   * Internal helper: Read isVisible for one sprite (1 = visible, 0 = invisible).
   */
  private readSpriteIsVisibleFromView(view: Float64Array, actionNumber: number): boolean {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return false
    const base = slotBase(actionNumber)
    return view[base + 3] !== 0
  }

  /**
   * Internal helper: Read frameIndex for one sprite (which animation frame to show).
   */
  private readSpriteFrameIndexFromView(view: Float64Array, actionNumber: number): number {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
    const base = slotBase(actionNumber)
    return view[base + 4] ?? 0
  }

  /**
   * Internal helper: Read remainingDistance for one sprite (dots remaining in movement).
   */
  private readSpriteRemainingDistanceFromView(view: Float64Array, actionNumber: number): number {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
    const base = slotBase(actionNumber)
    return view[base + 5] ?? 0
  }

  /**
   * Internal helper: Read totalDistance for one sprite (total distance in dots).
   */
  private readSpriteTotalDistanceFromView(view: Float64Array, actionNumber: number): number {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
    const base = slotBase(actionNumber)
    return view[base + 6] ?? 0
  }

  /**
   * Internal helper: Read direction for one sprite (0-8 direction code).
   */
  private readSpriteDirectionFromView(view: Float64Array, actionNumber: number): number {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
    const base = slotBase(actionNumber)
    return view[base + 7] ?? 0
  }

  /**
   * Internal helper: Read speed for one sprite (MOVE command speed parameter C).
   */
  private readSpriteSpeedFromView(view: Float64Array, actionNumber: number): number {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
    const base = slotBase(actionNumber)
    return view[base + 8] ?? 0
  }

  /**
   * Internal helper: Read priority for one sprite (0=front, 1=back).
   */
  private readSpritePriorityFromView(view: Float64Array, actionNumber: number): number {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
    const base = slotBase(actionNumber)
    return view[base + 9] ?? 0
  }

  /**
   * Internal helper: Read characterType for one sprite (DEF MOVE character type).
   */
  private readSpriteCharacterTypeFromView(view: Float64Array, actionNumber: number): number {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
    const base = slotBase(actionNumber)
    return view[base + 10] ?? 0
  }

  /**
   * Internal helper: Read colorCombination for one sprite.
   */
  private readSpriteColorCombinationFromView(view: Float64Array, actionNumber: number): number {
    if (actionNumber < 0 || actionNumber >= MAX_SPRITES) return 0
    const base = slotBase(actionNumber)
    return view[base + 11] ?? 0
  }

  /**
   * Write one sprite's full animation state to shared buffer.
   * Convenience wrapper around helper function.
   */
  writeSpriteState(
    actionNumber: number,
    x: number,
    y: number,
    isActive: boolean,
    isVisible: boolean,
    frameIndex: number = 0,
    remainingDistance: number = 0,
    totalDistance: number = 0,
    direction: number = 0,
    speed: number = 0,
    priority: number = 0,
    characterType: number = 0,
    colorCombination: number = 0
  ): void {
    this.writeSpriteStateToView(
      this.spriteViewInternal,
      actionNumber,
      x,
      y,
      isActive,
      isVisible,
      frameIndex,
      remainingDistance,
      totalDistance,
      direction,
      speed,
      priority,
      characterType,
      colorCombination
    )
  }

  /**
   * Clear all sprite data in the shared buffer.
   * Sets all sprites to inactive, invisible, with characterType = -1 (uninitialized).
   */
  clearAllSprites(): void {
    // Set all sprites to uninitialized state
    for (let i = 0; i < 8; i++) {
      this.writeSpriteState(i, 0, 0, false, false, 0, 0, 0, 0, 0, 0, -1, 0)
    }
  }

  /**
   * Read one sprite's position from shared buffer.
   * Returns null if slot not used.
   */
  readSpritePosition(actionNumber: number): { x: number; y: number } | null {
    return this.readSpritePositionFromView(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read isActive for one sprite (1 = active, 0 = inactive).
   */
  readSpriteIsActive(actionNumber: number): boolean {
    return this.readSpriteIsActiveFromView(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read isVisible for one sprite (1 = visible, 0 = invisible).
   */
  readSpriteIsVisible(actionNumber: number): boolean {
    return this.readSpriteIsVisibleFromView(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read frameIndex for one sprite (which animation frame to show).
   */
  readSpriteFrameIndex(actionNumber: number): number {
    return this.readSpriteFrameIndexFromView(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read remainingDistance for one sprite (dots remaining in movement).
   */
  readSpriteRemainingDistance(actionNumber: number): number {
    return this.readSpriteRemainingDistanceFromView(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read totalDistance for one sprite (total distance in dots).
   */
  readSpriteTotalDistance(actionNumber: number): number {
    return this.readSpriteTotalDistanceFromView(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read direction for one sprite (0-8 direction code).
   */
  readSpriteDirection(actionNumber: number): number {
    return this.readSpriteDirectionFromView(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read speed for one sprite (MOVE command speed parameter C).
   */
  readSpriteSpeed(actionNumber: number): number {
    return this.readSpriteSpeedFromView(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read priority for one sprite (0=front, 1=back).
   */
  readSpritePriority(actionNumber: number): number {
    return this.readSpritePriorityFromView(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read characterType for one sprite (DEF MOVE character type).
   */
  readSpriteCharacterType(actionNumber: number): number {
    return this.readSpriteCharacterTypeFromView(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read colorCombination for one sprite.
   */
  readSpriteColorCombination(actionNumber: number): number {
    return this.readSpriteColorCombinationFromView(this.spriteViewInternal, actionNumber)
  }

  /**
   * Read all movement states from shared buffer.
   * Returns an array of MovementState objects for slots that have a valid DEF MOVE (characterType >= 0).
   * This allows the main thread rendering to discover which movements have been defined
   * without relying on a separate movementStates ref.
   */
  readAllMovementStates(): Array<{
    actionNumber: number
    definition: {
      actionNumber: number
      characterType: number
      direction: number
      speed: number
      distance: number
      priority: number
      colorCombination: number
    }
  }> {
    const states: Array<{
      actionNumber: number
      definition: {
        actionNumber: number
        characterType: number
        direction: number
        speed: number
        distance: number
        priority: number
        colorCombination: number
      }
    }> = []

    // Read all 8 sprite slots
    for (let actionNumber = 0; actionNumber < 8; actionNumber++) {
      const characterType = this.readSpriteCharacterType(actionNumber)
      // characterType = -1 means uninitialized (no DEF MOVE)
      // characterType >= 0 means a valid DEF MOVE exists
      if (characterType >= 0) {
        const totalDistance = this.readSpriteTotalDistance(actionNumber)
        states.push({
          actionNumber,
          definition: {
            actionNumber,
            characterType,
            direction: this.readSpriteDirection(actionNumber),
            speed: this.readSpriteSpeed(actionNumber),
            distance: Math.round(totalDistance / 2), // distance = totalDistance / 2
            priority: this.readSpritePriority(actionNumber),
            colorCombination: this.readSpriteColorCombination(actionNumber),
          },
        })
      }
    }

    return states
  }
}
