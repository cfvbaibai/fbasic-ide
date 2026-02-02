/**
 * Centralized reactive state for the BASIC IDE.
 * Single source of refs used by screen integration, worker, execution, and editor.
 */

import { type Ref, ref } from 'vue'

import type { BasicVariable } from '@/core/interfaces'
import type { RequestInputMessage } from '@/core/interfaces'
import type { ScreenCell } from '@/core/interfaces'
import type { MovementState, SpriteState } from '@/core/sprite/types'

import type { PendingSpriteAction } from './useBasicIdeMessageHandlers'
import { initializeScreenBuffer } from './useBasicIdeScreenUtils'

const DEFAULT_CODE = `10 PRINT "Hello World!"
20 PRINT "Family Basic IDE Demo"
30 PRINT "Program completed!"
40 FOR I=1 TO 3: PRINT "I="; I: NEXT
50 END`

type ErrorEntry = { line: number; message: string; type: string; stack?: string; sourceLine?: string }

/** All IDE state refs; used by other composables. */
export interface BasicIdeState {
  code: Ref<string>
  currentSampleType: Ref<string | null>
  highlightedCode: Ref<string>
  isRunning: Ref<boolean>
  output: Ref<string[]>
  errors: Ref<ErrorEntry[]>
  variables: Ref<Record<string, BasicVariable>>
  debugOutput: Ref<string>
  debugMode: Ref<boolean>
  screenBuffer: Ref<ScreenCell[][]>
  cursorX: Ref<number>
  cursorY: Ref<number>
  bgPalette: Ref<number>
  backdropColor: Ref<number>
  spritePalette: Ref<number>
  cgenMode: Ref<number>
  spriteStates: Ref<SpriteState[]>
  spriteEnabled: Ref<boolean>
  movementStates: Ref<MovementState[]>
  /** Current sprite positions read from shared buffer (for inspector MOVE tab). */
  movementPositionsFromBuffer: Ref<Map<number, { x: number; y: number }>>
  frontSpriteNodes: Ref<Map<number, unknown>>
  backSpriteNodes: Ref<Map<number, unknown>>
  spriteActionQueues: Ref<Map<number, PendingSpriteAction[]>>
  pendingInputRequest: Ref<RequestInputMessage['data'] | null>
}

/**
 * Create and return all IDE state refs.
 */
export function useBasicIdeState(): BasicIdeState {
  return {
    code: ref(DEFAULT_CODE),
    currentSampleType: ref<string | null>(null),
    highlightedCode: ref(''),

    isRunning: ref(false),
    output: ref<string[]>([]),
    errors: ref<
      Array<{ line: number; message: string; type: string; stack?: string; sourceLine?: string }>
    >([]),
    variables: ref<Record<string, BasicVariable>>({}),
    debugOutput: ref<string>(''),
    debugMode: ref(false),

    screenBuffer: ref(initializeScreenBuffer()),
    cursorX: ref(0),
    cursorY: ref(0),
    bgPalette: ref(1),
    backdropColor: ref(0),
    spritePalette: ref(1),
    cgenMode: ref(2),

    spriteStates: ref<SpriteState[]>([]),
    spriteEnabled: ref(false),
    movementStates: ref<MovementState[]>([]),
    movementPositionsFromBuffer: ref<Map<number, { x: number; y: number }>>(new Map()),
    frontSpriteNodes: ref<Map<number, unknown>>(new Map()),
    backSpriteNodes: ref<Map<number, unknown>>(new Map()),
    spriteActionQueues: ref<Map<number, PendingSpriteAction[]>>(new Map()),

    pendingInputRequest: ref<RequestInputMessage['data'] | null>(null),
  }
}
