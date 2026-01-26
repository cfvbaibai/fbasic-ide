/**
 * Message handlers for BASIC IDE web worker communication
 */

import type { Ref } from 'vue'

import type {
  AnimationCommand,
  AnyServiceWorkerMessage,
  ErrorMessage,
  ResultMessage,
  ScreenCell,
} from '@/core/interfaces'
import type { MovementState } from '@/core/sprite/types'

import type { WebWorkerManager } from './useBasicIdeWebWorkerUtils'

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

export interface MessageHandlerContext {
  output: Ref<string[]>
  errors: Ref<Array<{ line: number; message: string; type: string }>>
  debugOutput: Ref<string>
  screenBuffer: Ref<ScreenCell[][]>
  cursorX: Ref<number>
  cursorY: Ref<number>
  bgPalette: Ref<number>
  backdropColor?: Ref<number>
  cgenMode?: Ref<number>
  movementStates?: Ref<MovementState[]>
  frontSpriteNodes?: Ref<Map<number, unknown>>
  backSpriteNodes?: Ref<Map<number, unknown>>
  webWorkerManager: WebWorkerManager
}

/**
 * Handle output message from web worker
 */
export function handleOutputMessage(message: AnyServiceWorkerMessage, context: MessageHandlerContext): void {
  if (message.type !== 'OUTPUT') return
  const { output: outputText, outputType } = message.data
  console.log('📤 [COMPOSABLE] Handling output:', outputType, outputText)

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
 * Handle screen update message from web worker
 */
export function handleScreenUpdateMessage(message: AnyServiceWorkerMessage, context: MessageHandlerContext): void {
  if (message.type !== 'SCREEN_UPDATE') return
  
  const update = message.data

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
  console.error('❌ [COMPOSABLE] Execution error:', errorMessage.data.executionId, errorMessage.data.message)

  // Use message.id to look up the pending message (not executionId from data)
  const pending = context.webWorkerManager.pendingMessages.get(message.id)
  if (pending) {
    clearTimeout(pending.timeout)
    context.webWorkerManager.pendingMessages.delete(message.id)
    pending.reject(new Error(errorMessage.data.message))
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
  console.log('🔄 [COMPOSABLE] Progress:', iterationCount, currentStatement)
  // Could emit progress events here if needed
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

  console.log('🎬 [COMPOSABLE] Handling animation command:', command.type, command)

  switch (command.type) {
    case 'START_MOVEMENT': {
      // Get start position from Konva node if it exists (from previous CUT), otherwise use command position
      let startX = command.startX
      let startY = command.startY

      // Check if there's an existing Konva node with a position
      const existingNode =
        command.definition.priority === 0
          ? context.frontSpriteNodes?.value?.get(command.actionNumber)
          : context.backSpriteNodes?.value?.get(command.actionNumber)

      if (existingNode && typeof existingNode === 'object' && 'x' in existingNode && 'y' in existingNode) {
        const nodeX = typeof existingNode.x === 'function' ? (existingNode.x as () => number)() : command.startX
        const nodeY = typeof existingNode.y === 'function' ? (existingNode.y as () => number)() : command.startY
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

      // Immediately sync position to worker for XPOS/YPOS queries
      // This ensures XPOS/YPOS works even before animation loop starts syncing
      if (context.webWorkerManager?.worker) {
        context.webWorkerManager.worker.postMessage({
          type: 'UPDATE_ANIMATION_POSITIONS',
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          data: {
            positions: [{ actionNumber: command.actionNumber, x: startX, y: startY }],
          },
        })
      }
      break
    }

    case 'STOP_MOVEMENT': {
      // Mark movements as inactive
      // Position is stored in Konva nodes, no need to sync back to worker
      if (command.positions) {
        for (const pos of command.positions) {
          const movement = context.movementStates.value.find(m => m.actionNumber === pos.actionNumber)
          if (movement) {
            movement.isActive = false
            movement.remainingDistance = pos.remainingDistance
          }
        }
      } else {
        // Get position from Konva nodes (single source of truth)
        for (const actionNumber of command.actionNumbers) {
          const movement = context.movementStates.value.find(m => m.actionNumber === actionNumber)
          if (movement) {
            // Get position from Konva sprite node (actual rendered position)
            const _spriteNode =
              movement.definition.priority === 0
                ? context.frontSpriteNodes?.value?.get(actionNumber)
                : context.backSpriteNodes?.value?.get(actionNumber)


            // Mark as inactive - position stays in Konva node
            movement.isActive = false
          }
        }
      }

      context.movementStates.value = [...context.movementStates.value]
      break
    }

    case 'ERASE_MOVEMENT': {
      // Remove movements completely
      context.movementStates.value = context.movementStates.value.filter(
        m => !command.actionNumbers.includes(m.actionNumber)
      )
      break
    }

    case 'SET_POSITION': {
      // Set position on Konva node
      const spriteNode =
        context.frontSpriteNodes?.value?.get(command.actionNumber) ??
        context.backSpriteNodes?.value?.get(command.actionNumber)

      if (spriteNode && typeof spriteNode === 'object' && 'x' in spriteNode && 'y' in spriteNode) {
        if (typeof spriteNode.x === 'function' && typeof spriteNode.y === 'function') {
          ;(spriteNode.x as (x: number) => void)(command.x)
          ;(spriteNode.y as (y: number) => void)(command.y)
          
          // Immediately sync position to worker for XPOS/YPOS queries
          if (context.webWorkerManager?.worker) {
            context.webWorkerManager.worker.postMessage({
              type: 'UPDATE_ANIMATION_POSITIONS',
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              data: {
                positions: [{ actionNumber: command.actionNumber, x: command.x, y: command.y }],
              },
            })
          }
        }
      } else {
        // Node doesn't exist yet - cache position in worker anyway so XPOS/YPOS works
        // The position will be set on the node when it's created
        if (context.webWorkerManager?.worker) {
          context.webWorkerManager.worker.postMessage({
            type: 'UPDATE_ANIMATION_POSITIONS',
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            data: {
              positions: [{ actionNumber: command.actionNumber, x: command.x, y: command.y }],
            },
          })
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
  console.log('📨 [COMPOSABLE] Received message from worker:', message.type)

  // -- Only handling response messages, request messages sent elsewhere
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (message.type) {
    case 'OUTPUT':
      handleOutputMessage(message, context)
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
