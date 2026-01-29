/**
 * Message handlers for BASIC IDE web worker communication
 *
 * Use loglevel: log.getLogger('ide-messages').setLevel('debug') in console for verbose logs.
 */
/* eslint-disable max-lines -- multiple handlers; extract to useBasicIdeScreenUpdateHandler etc. when adding more */

import type { Ref } from 'vue'

import { writeSpriteState } from '@/core/animation/sharedAnimationBuffer'
import type {
  DecodedScreenState,
  SharedDisplayViews,
} from '@/core/animation/sharedDisplayBuffer'
import type {
  AnimationCommand,
  AnyServiceWorkerMessage,
  ErrorMessage,
  ResultMessage,
  ScreenCell,
} from '@/core/interfaces'
import type { MovementState } from '@/core/sprite/types'
import { ExecutionError } from '@/features/ide/errors/ExecutionError'
import { logIdeMessages, logScreen } from '@/shared/logger'

import type { WebWorkerManager } from './useBasicIdeWebWorkerUtils'

export { ExecutionError }

/**
 * Message queue for non-critical messages
 * Processed during requestAnimationFrame to align with rendering
 */
interface QueuedMessage {
  message: AnyServiceWorkerMessage
  context: MessageHandlerContext
}

const messageQueue: QueuedMessage[] = []
let isProcessingQueue = false
let queueAnimationFrame: number | null = null

/**
 * Process queued messages during animation frame
 * This ensures state updates happen in sync with rendering
 */
function processMessageQueue(): void {
  if (messageQueue.length === 0) {
    isProcessingQueue = false
    queueAnimationFrame = null
    return
  }

  // Process all queued messages in this frame
  // This batches multiple updates together
  const messagesToProcess = messageQueue.splice(0)
  isProcessingQueue = false
  queueAnimationFrame = null

  for (const { message, context } of messagesToProcess) {
    processMessage(message, context)
  }

  // If more messages arrived while processing, schedule another frame
  if (messageQueue.length > 0) {
    scheduleQueueProcessing()
  }
}

/**
 * Schedule message queue processing in the next animation frame
 */
function scheduleQueueProcessing(): void {
  if (isProcessingQueue || queueAnimationFrame !== null) {
    return // Already scheduled
  }

  isProcessingQueue = true
  queueAnimationFrame = requestAnimationFrame(() => {
    processMessageQueue()
  })
}

/**
 * Flush the message queue synchronously (e.g. before resolving RESULT so OUTPUT/ANIMATION_COMMAND are applied first).
 */
function flushMessageQueue(): void {
  if (queueAnimationFrame !== null) {
    cancelAnimationFrame(queueAnimationFrame)
    queueAnimationFrame = null
  }
  isProcessingQueue = false
  while (messageQueue.length > 0) {
    const messagesToProcess = messageQueue.splice(0)
    for (const { message, context } of messagesToProcess) {
      if (!context) {
        console.warn('⚠️ [COMPOSABLE] Skipping queued message: context is undefined')
        continue
      }
      processMessage(message, context)
    }
  }
}

/**
 * Pending action for a sprite when its Konva node does not exist yet; 
 * applied when node is created or START_MOVEMENT is handled. 
 */
export type PendingSpriteAction = { type: 'POSITION'; x: number; y: number }

/** Per-sprite action queue (action number → list of pending actions). */
export type SpriteActionQueues = Map<number, PendingSpriteAction[]>

export interface MessageHandlerContext {
  output: Ref<string[]>
  errors: Ref<
    Array<{ line: number; message: string; type: string; stack?: string; sourceLine?: string }>
  >
  debugOutput: Ref<string>
  screenBuffer: Ref<ScreenCell[][]>
  cursorX: Ref<number>
  cursorY: Ref<number>
  bgPalette: Ref<number>
  backdropColor?: Ref<number>
  spritePalette?: Ref<number>
  cgenMode?: Ref<number>
  movementStates?: Ref<MovementState[]>
  frontSpriteNodes?: Ref<Map<number, unknown>>
  backSpriteNodes?: Ref<Map<number, unknown>>
  /** Per-sprite action queue; POSITION etc. when node does not exist; consumed when START_MOVEMENT is handled. */
  spriteActionQueues?: Ref<SpriteActionQueues>
  webWorkerManager: WebWorkerManager
  /** Shared animation state view; main thread writes positions + isActive for worker (XPOS/YPOS, MOVE(n)). */
  sharedAnimationView?: Float64Array
  /** Shared display buffer views; main reads screen/cursor/scalars when SCREEN_CHANGED. */
  sharedDisplayViews?: SharedDisplayViews
  /** Called when SCREEN_CHANGED is received to schedule a render (Screen.vue reads from shared buffer). */
  scheduleRender?: () => void
  /** Called by Screen.vue after decoding shared buffer to update refs (screenBuffer, cursorX, etc.). */
  setDecodedScreenState?: (decoded: DecodedScreenState) => void
}

/**
 * Handle output message from web worker
 */
export function handleOutputMessage(message: AnyServiceWorkerMessage, context: MessageHandlerContext): void {
  if (message.type !== 'OUTPUT') return
  const { output: outputText, outputType } = message.data
  logIdeMessages.debug('📤 Handling output:', outputType, outputText)

  if (outputType === 'print') {
    context.output.value.push(outputText)
  } else if (outputType === 'debug') {
    context.debugOutput.value += `${outputText}\n`
  } else if (outputType === 'error') {
    context.errors.value.push({
      line: 0,
      message: outputText,
      type: 'runtime',
    })
  }
}

/**
 * Handle SCREEN_CHANGED message from web worker (shared buffer path).
 * Only schedules a render; Screen.vue reads from shared buffer and decodes in its render path.
 */
export function handleScreenChangedMessage(
  _message: AnyServiceWorkerMessage,
  context: MessageHandlerContext
): void {
  if (context.scheduleRender) {
    context.scheduleRender()
  }
}

/**
 * Handle screen update message from web worker (legacy SCREEN_UPDATE; worker no longer sends for shared buffer path)
 */
export function handleScreenUpdateMessage(message: AnyServiceWorkerMessage, context: MessageHandlerContext): void {
  if (message.type !== 'SCREEN_UPDATE') return
  
  const update = message.data
  if (!update) {
    console.warn('⚠️ [COMPOSABLE] SCREEN_UPDATE message has no data')
    return
  }
  if (!context?.screenBuffer) {
    console.warn('⚠️ [COMPOSABLE] SCREEN_UPDATE: context or screenBuffer missing, skipping')
    return
  }

  switch (update.updateType) {
    case 'character':
      if (update.x !== undefined && update.y !== undefined && update.character !== undefined) {
        const x = update.x
        const y = update.y
        const character = update.character

        // Ensure row exists
        context.screenBuffer.value[y] ??= []

        // Ensure cell exists
        const currentRow = context.screenBuffer.value[y]
        currentRow[x] ??= {
          character: ' ',
          colorPattern: 0,
          x,
          y,
        }

        // Update character - force reactivity by creating new object
        const currentCell = currentRow[x]
        const newCell: ScreenCell = {
          character,
          colorPattern: currentCell.colorPattern,
          x: currentCell.x,
          y: currentCell.y,
        }
        currentRow[x] = newCell

        // Also trigger reactivity by reassigning the row
        context.screenBuffer.value[y] = [...currentRow]
      }
      break
    case 'cursor':
      if (update.cursorX !== undefined) context.cursorX.value = update.cursorX
      if (update.cursorY !== undefined) context.cursorY.value = update.cursorY
      break
    case 'clear':
      // Clear screen buffer
      for (let y = 0; y < 24; y++) {
        const row = context.screenBuffer.value[y]
        if (row) {
          for (let x = 0; x < 28; x++) {
            const cell = row[x]
            if (cell) {
              cell.character = ' '
            }
          }
        }
      }
      context.cursorX.value = 0
      context.cursorY.value = 0
      break
    case 'full':
      if (update.screenBuffer) {
        context.screenBuffer.value = update.screenBuffer
      }
      if (update.cursorX !== undefined) context.cursorX.value = update.cursorX
      if (update.cursorY !== undefined) context.cursorY.value = update.cursorY
      break
    case 'color':
      // Update color pattern for cells specified in colorUpdates
      if (update.colorUpdates) {
        for (const colorUpdate of update.colorUpdates) {
          const { x, y, pattern } = colorUpdate

          // Ensure row exists
          context.screenBuffer.value[y] ??= []

          // Ensure cell exists
          const currentRow = context.screenBuffer.value[y]
          currentRow[x] ??= {
            character: ' ',
            colorPattern: 0,
            x,
            y,
          }

          // Update color pattern - force reactivity by creating new object
          const currentCell = currentRow[x]
          const newCell: ScreenCell = {
            character: currentCell.character,
            colorPattern: pattern,
            x: currentCell.x,
            y: currentCell.y,
          }
          currentRow[x] = newCell

          // Also trigger reactivity by reassigning the row
          context.screenBuffer.value[y] = [...currentRow]
        }
      }
      break
    case 'palette':
      // Update background and sprite palette codes
      if (update.bgPalette !== undefined) {
        context.bgPalette.value = update.bgPalette
        console.log('🖥️ [COMPOSABLE] Updated background palette:', update.bgPalette)
      }
      if (update.spritePalette !== undefined) {
        // Note: spritePalette is stored but not currently used in rendering
        // It will be used when sprite system is implemented
        console.log('🖥️ [COMPOSABLE] Updated sprite palette:', update.spritePalette)
      }
      break
    case 'backdrop':
      // Update backdrop color
      if (update.backdropColor !== undefined && context.backdropColor) {
        context.backdropColor.value = update.backdropColor
        console.log('🖥️ [COMPOSABLE] Updated backdrop color:', update.backdropColor)
      }
      break
    case 'cgen':
      // Update character generator mode
      if (update.cgenMode !== undefined) {
        if (context.cgenMode) {
          context.cgenMode.value = update.cgenMode
        }
        console.log('🖥️ [COMPOSABLE] Updated character generator mode:', update.cgenMode)
      }
      break
  }
}

/**
 * Handle result message from web worker
 */
export function handleResultMessage(message: AnyServiceWorkerMessage, context: MessageHandlerContext): void {
  const resultMessage = message as ResultMessage
  const result = resultMessage.data // message.data IS the ExecutionResult
  console.log('✅ [COMPOSABLE] Execution completed:', result.executionId, 'result:', result)
  if (!result.success && result.errors?.length) {
    console.error('[COMPOSABLE] Execution failed:', result.errors[0]?.message, result.errors)
  }

  // Flush queued OUTPUT/ANIMATION_COMMAND so output and movement state are updated before resolving.
  // Otherwise RESULT resolves first, UI re-renders with empty output, then rAF applies OUTPUT (one frame late).
  flushMessageQueue()

  // Use message.id to look up the pending message (not executionId from data)
  const pending = context.webWorkerManager.pendingMessages.get(message.id)
  if (pending) {
    clearTimeout(pending.timeout)
    context.webWorkerManager.pendingMessages.delete(message.id)
    pending.resolve(result)
  } else {
    console.warn('⚠️ [COMPOSABLE] No pending message found for messageId:', message.id)
  }
}

/**
 * Handle error message from web worker
 */
export function handleErrorMessage(message: AnyServiceWorkerMessage, context: MessageHandlerContext): void {
  const errorMessage = message as ErrorMessage
  const data = errorMessage.data
  const executionId = data?.executionId ?? 'unknown'
  const errorText = data?.message ?? String(message)
  const lineNumber = data?.lineNumber
  const sourceLine = data?.sourceLine
  const stack = data?.stack

  console.error(
    '❌ [COMPOSABLE] Execution error:',
    executionId,
    errorText,
    lineNumber != null ? `(at line ${lineNumber})` : ''
  )

  flushMessageQueue()

  // Set errors so UI shows root line/stack; reject with ExecutionError so runCode catch preserves them
  const errorEntry = {
    line: lineNumber ?? 0,
    message: errorText,
    type: 'runtime' as const,
    ...(typeof stack === 'string' && stack.length > 0 && { stack }),
    ...(sourceLine && { sourceLine }),
  }
  if (context?.errors) {
    context.errors.value = [errorEntry]
  }

  if (!context?.webWorkerManager) {
    console.warn('⚠️ [COMPOSABLE] handleErrorMessage: context or webWorkerManager missing, skipping pending reject')
    return
  }
  const pending = context.webWorkerManager.pendingMessages.get(message.id)
  if (pending) {
    clearTimeout(pending.timeout)
    context.webWorkerManager.pendingMessages.delete(message.id)
    const executionError = new ExecutionError(errorText, {
      lineNumber,
      sourceLine,
      stackTrace: stack,
    })
    pending.reject(executionError)
  } else {
    console.warn('⚠️ [COMPOSABLE] No pending message found for error messageId:', message.id)
  }
}

/**
 * Handle progress message from web worker
 */
export function handleProgressMessage(message: AnyServiceWorkerMessage, _context: MessageHandlerContext): void {
  if (message.type !== 'PROGRESS') return
  const { iterationCount, currentStatement } = message.data
  logIdeMessages.debug('🔄 Progress:', iterationCount, currentStatement)
}

/**
 * Handle animation command message from web worker
 * These commands are sent immediately when MOVE is executed
 */
export function handleAnimationCommandMessage(message: AnyServiceWorkerMessage, context: MessageHandlerContext): void {
  if (message.type !== 'ANIMATION_COMMAND') return
  if (!context.movementStates) return

  // TypeScript narrows message.data to AnimationCommand after type check
  const command: AnimationCommand = message.data

  logIdeMessages.debug('🎬 Handling animation command:', command.type, command)

  switch (command.type) {
    case 'START_MOVEMENT': {
      // Start position: Konva node (if exists) > last POSITION from this sprite's action queue > command from worker
      const queue = context.spriteActionQueues?.value.get(command.actionNumber) ?? []
      const lastPosition = [...queue].reverse().find((a): a is PendingSpriteAction => a.type === 'POSITION')
      let startX = lastPosition?.x ?? command.startX
      let startY = lastPosition?.y ?? command.startY
      context.spriteActionQueues?.value.set(command.actionNumber, [])

      const existingNode =
        command.definition.priority === 0
          ? context.frontSpriteNodes?.value?.get(command.actionNumber)
          : context.backSpriteNodes?.value?.get(command.actionNumber)

      if (existingNode && typeof existingNode === 'object' && 'x' in existingNode && 'y' in existingNode) {
        const nodeX = typeof existingNode.x === 'function' ? (existingNode.x as () => number)() : startX
        const nodeY = typeof existingNode.y === 'function' ? (existingNode.y as () => number)() : startY
        startX = nodeX
        startY = nodeY
      }

      // Check if there's an existing movement (for remaining distance)
      const existingMovement = context.movementStates.value.find(
        m => m.actionNumber === command.actionNumber
      )

      // Preserve remaining distance if movement was stopped (CUT), otherwise use full distance
      const remainingDistance = existingMovement && !existingMovement.isActive
        ? existingMovement.remainingDistance
        : 2 * command.definition.distance

      // Only set position on Konva node if movement was stopped (CUT) and we're restarting
      // If movement is already active, don't reset position - animation loop manages it
      if (existingNode && typeof existingNode === 'object' && 'x' in existingNode && 'y' in existingNode) {
        if (typeof existingNode.x === 'function' && typeof existingNode.y === 'function') {
          // Only update position if movement was stopped (restarting from CUT position)
          // or if this is a new movement (node doesn't have a valid position yet)
          const isNewMovement = !existingMovement
          const isRestartingFromCut = existingMovement && !existingMovement.isActive
          
          if (isNewMovement || isRestartingFromCut) {
            // New movement or restarting from CUT - use the start position we determined
            ;(existingNode.x as (x: number) => void)(startX)
            ;(existingNode.y as (y: number) => void)(startY)
          }
          // If movement is already active, don't touch the position - animation loop manages it
        }
      }

      // Create movement state immediately (without currentX/currentY - position is in Konva)
      const movementState: MovementState = {
        actionNumber: command.actionNumber,
        definition: command.definition,
        startX,
        startY,
        remainingDistance,
        totalDistance: 2 * command.definition.distance,
        speedDotsPerSecond: command.definition.speed > 0 ? 60 / command.definition.speed : 0,
        directionDeltaX: getDirectionDeltaX(command.definition.direction),
        directionDeltaY: getDirectionDeltaY(command.definition.direction),
        isActive: true,
        currentFrameIndex: existingMovement?.currentFrameIndex ?? 0,
        frameCounter: existingMovement?.frameCounter ?? 0,
      }

      // Add or update movement state
      const existing = context.movementStates.value.findIndex(
        m => m.actionNumber === command.actionNumber
      )

      if (existing >= 0) {
        context.movementStates.value[existing] = movementState
      } else {
        context.movementStates.value.push(movementState)
      }

      // Force reactivity by creating new array
      context.movementStates.value = [...context.movementStates.value]

      logScreen.warn(
        'START_MOVEMENT actionNumber=',
        command.actionNumber,
        'total movements=',
        context.movementStates.value.length
      )

      if (context.sharedAnimationView) {
        writeSpriteState(context.sharedAnimationView, command.actionNumber, startX, startY, true)
      }
      break
    }

    case 'STOP_MOVEMENT': {
      if (command.positions) {
        for (const pos of command.positions) {
          const movement = context.movementStates.value.find(m => m.actionNumber === pos.actionNumber)
          if (movement) {
            movement.isActive = false
            movement.remainingDistance = pos.remainingDistance
            if (context.sharedAnimationView) {
              writeSpriteState(context.sharedAnimationView, pos.actionNumber, pos.x, pos.y, false)
            }
          }
        }
      } else {
        for (const actionNumber of command.actionNumbers) {
          const movement = context.movementStates.value.find(m => m.actionNumber === actionNumber)
          if (movement) {
            movement.isActive = false
            if (context.sharedAnimationView) {
              const spriteNode =
                movement.definition.priority === 0
                  ? context.frontSpriteNodes?.value?.get(actionNumber)
                  : context.backSpriteNodes?.value?.get(actionNumber)
              const x = spriteNode && typeof spriteNode === 'object' && 'x' in spriteNode && typeof (spriteNode as { x: () => number }).x === 'function'
                ? (spriteNode as { x: () => number; y: () => number }).x()
                : 0
              const y = spriteNode && typeof spriteNode === 'object' && 'y' in spriteNode && typeof (spriteNode as { y: () => number }).y === 'function'
                ? (spriteNode as { x: () => number; y: () => number }).y()
                : 0
              writeSpriteState(context.sharedAnimationView, actionNumber, x, y, false)
            }
          }
        }
      }
      context.movementStates.value = [...context.movementStates.value]
      break
    }

    case 'ERASE_MOVEMENT': {
      context.movementStates.value = context.movementStates.value.filter(
        m => !command.actionNumbers.includes(m.actionNumber)
      )
      for (const actionNumber of command.actionNumbers) {
        context.spriteActionQueues?.value.delete(actionNumber)
        if (context.sharedAnimationView) {
          writeSpriteState(context.sharedAnimationView, actionNumber, 0, 0, false)
        }
      }
      break
    }

    case 'SET_POSITION': {
      const spriteNode =
        context.frontSpriteNodes?.value?.get(command.actionNumber) ??
        context.backSpriteNodes?.value?.get(command.actionNumber)

      if (spriteNode && typeof spriteNode === 'object' && 'x' in spriteNode && 'y' in spriteNode) {
        if (typeof spriteNode.x === 'function' && typeof spriteNode.y === 'function') {
          ;(spriteNode.x as (x: number) => void)(command.x)
          ;(spriteNode.y as (y: number) => void)(command.y)
          context.spriteActionQueues?.value.delete(command.actionNumber)
          if (context.sharedAnimationView) {
            const movement = context.movementStates?.value.find(m => m.actionNumber === command.actionNumber)
            writeSpriteState(
              context.sharedAnimationView,
              command.actionNumber,
              command.x,
              command.y,
              movement?.isActive ?? false
            )
          }
        }
      } else {
        const queues = context.spriteActionQueues?.value
        if (queues) {
          const q = queues.get(command.actionNumber) ?? []
          q.push({ type: 'POSITION', x: command.x, y: command.y })
          queues.set(command.actionNumber, q)
        }
        if (context.sharedAnimationView) {
          const movement = context.movementStates?.value.find(m => m.actionNumber === command.actionNumber)
          writeSpriteState(
            context.sharedAnimationView,
            command.actionNumber,
            command.x,
            command.y,
            movement?.isActive ?? false
          )
        }
      }
      break
    }

    case 'UPDATE_MOVEMENT_POSITION': {
      // Update movement remaining distance (position is in Konva node)
      const movement = context.movementStates.value.find(m => m.actionNumber === command.actionNumber)
      if (movement) {
        movement.remainingDistance = command.remainingDistance
      }
      break
    }
  }
}

/**
 * Helper to get X delta from direction
 */
function getDirectionDeltaX(direction: number): number {
  switch (direction) {
    case 2:
    case 3:
    case 4:
      return 1 // Right directions
    case 6:
    case 7:
    case 8:
      return -1 // Left directions
    default:
      return 0
  }
}

/**
 * Helper to get Y delta from direction
 */
function getDirectionDeltaY(direction: number): number {
  switch (direction) {
    case 1:
    case 2:
    case 8:
      return -1 // Up directions
    case 4:
    case 5:
    case 6:
      return 1 // Down directions
    default:
      return 0
  }
}

/**
 * Route message to appropriate handler
 * 
 * Event loop execution order in browsers:
 * 1. Execute macrotask (worker.onmessage callback) - WE ARE HERE
 * 2. Execute all microtasks (Promise.then, queueMicrotask)
 * 3. Execute requestAnimationFrame callbacks (rendering phase)
 * 4. Browser rendering (paint)
 * 5. Execute requestIdleCallback (idle time)
 * 
 * Strategy:
 * - Critical messages (RESULT, ERROR): Process immediately (synchronously)
 * - Non-critical messages (SCREEN_UPDATE, OUTPUT): Queue for processing in requestAnimationFrame
 * 
 * This ensures:
 * - Vue state updates happen in the same frame as rendering
 * - State updates and rendering are synchronized
 * - No blocking of the current event loop iteration
 * - Messages are batched per frame for efficiency
 */
export function handleWorkerMessage(message: AnyServiceWorkerMessage, context: MessageHandlerContext): void {
  if (!context) {
    console.warn('⚠️ [COMPOSABLE] handleWorkerMessage called with undefined context, skipping')
    return
  }
  // Critical messages must be handled immediately (they resolve promises, etc.)
  const isCritical = message.type === 'RESULT' || message.type === 'ERROR'
  
  if (isCritical) {
    // Handle critical messages synchronously - they're needed for execution flow
    processMessage(message, context)
  } else {
    // Queue non-critical messages for processing in requestAnimationFrame
    // This ensures Vue state updates happen in sync with rendering
    messageQueue.push({ message, context })
    scheduleQueueProcessing()
  }
}

/**
 * Process a message (internal function)
 */
function processMessage(message: AnyServiceWorkerMessage, context: MessageHandlerContext): void {
  logIdeMessages.debug('📨 Received message from worker:', message.type)

  // -- Only handling response messages, request messages sent elsewhere
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (message.type) {
    case 'OUTPUT':
      handleOutputMessage(message, context)
      break
    case 'SCREEN_CHANGED':
      handleScreenChangedMessage(message, context)
      break
    case 'SCREEN_UPDATE':
      handleScreenUpdateMessage(message, context)
      break
    case 'ANIMATION_COMMAND':
      handleAnimationCommandMessage(message, context)
      break
    case 'RESULT':
      handleResultMessage(message, context)
      break
    case 'ERROR':
      handleErrorMessage(message, context)
      break
    case 'PROGRESS':
      handleProgressMessage(message, context)
      break
    default:
      console.warn('⚠️ [COMPOSABLE] Unknown message type:', message.type)
  }
}
