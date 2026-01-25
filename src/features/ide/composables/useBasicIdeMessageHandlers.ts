/**
 * Message handlers for BASIC IDE web worker communication
 */

import type { Ref } from 'vue'

import type {
  AnimationCommand,
  AnyServiceWorkerMessage,
  ErrorMessage,
  ResultMessage,
  ScreenCell
} from '@/core/interfaces'
import type { MovementState } from '@/core/sprite/types'

import type { WebWorkerManager } from './useBasicIdeWebWorkerUtils'

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
  webWorkerManager: WebWorkerManager
}

/**
 * Handle output message from web worker
 */
export function handleOutputMessage(
  message: AnyServiceWorkerMessage,
  context: MessageHandlerContext
): void {
  if (message.type !== 'OUTPUT') return
  const { output: outputText, outputType } = (message).data
  console.log('📤 [COMPOSABLE] Handling output:', outputType, outputText)
  
  if (outputType === 'print') {
    context.output.value.push(outputText)
  } else if (outputType === 'debug') {
    context.debugOutput.value += `${outputText  }\n`
  } else if (outputType === 'error') {
    context.errors.value.push({
      line: 0,
      message: outputText,
      type: 'runtime'
    })
  }
}

/**
 * Handle screen update message from web worker
 */
export function handleScreenUpdateMessage(
  message: AnyServiceWorkerMessage,
  context: MessageHandlerContext
): void {
  if (message.type !== 'SCREEN_UPDATE') return
  const update = (message).data
  console.log('🖥️ [COMPOSABLE] Handling screen update:', update.updateType, update)
  
  switch (update.updateType) {
    case 'character':
      if (update.x !== undefined && update.y !== undefined && update.character !== undefined) {
        const x = update.x
        const y = update.y
        const character = update.character
        
        console.log('🖥️ [COMPOSABLE] Updating character:', {
          x,
          y,
          char: character,
          currentBuffer: context.screenBuffer.value[y]?.[x]
        })
        
        // Ensure row exists
        context.screenBuffer.value[y] ??= []

        // Ensure cell exists
        const currentRow = context.screenBuffer.value[y]
        currentRow[x] ??= {
          character: ' ',
          colorPattern: 0,
          x,
          y
        }
        
        // Update character - force reactivity by creating new object
        const currentCell = currentRow[x]
        const newCell: ScreenCell = {
          character,
          colorPattern: currentCell.colorPattern,
          x: currentCell.x,
          y: currentCell.y
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
        console.log('🖥️ [COMPOSABLE] Updating color patterns:', update.colorUpdates)
        
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
            y
          }
          
          // Update color pattern - force reactivity by creating new object
          const currentCell = currentRow[x]
          const newCell: ScreenCell = {
            character: currentCell.character,
            colorPattern: pattern,
            x: currentCell.x,
            y: currentCell.y
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
export function handleResultMessage(
  message: AnyServiceWorkerMessage,
  context: MessageHandlerContext
): void {
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
export function handleErrorMessage(
  message: AnyServiceWorkerMessage,
  context: MessageHandlerContext
): void {
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
export function handleProgressMessage(
  message: AnyServiceWorkerMessage,
  _context: MessageHandlerContext
): void {
  if (message.type !== 'PROGRESS') return
  const { iterationCount, currentStatement } = (message).data
  console.log('🔄 [COMPOSABLE] Progress:', iterationCount, currentStatement)
  // Could emit progress events here if needed
}

/**
 * Handle animation command message from web worker
 * These commands are sent immediately when MOVE is executed
 */
export function handleAnimationCommandMessage(
  message: AnyServiceWorkerMessage,
  context: MessageHandlerContext
): void {
  if (message.type !== 'ANIMATION_COMMAND') return
  if (!context.movementStates) return
  
  // TypeScript narrows message.data to AnimationCommand after type check
  const command: AnimationCommand = message.data
  
  console.log('🎬 [COMPOSABLE] Handling animation command:', command.type, command)
  
  switch (command.type) {
    case 'START_MOVEMENT': {
      // Create movement state immediately
      const movementState: MovementState = {
        actionNumber: command.actionNumber,
        definition: command.definition,
        startX: command.startX,
        startY: command.startY,
        currentX: command.startX,
        currentY: command.startY,
        remainingDistance: 2 * command.definition.distance,
        totalDistance: 2 * command.definition.distance,
        speedDotsPerSecond: command.definition.speed > 0 ? 60 / command.definition.speed : 0,
        directionDeltaX: getDirectionDeltaX(command.definition.direction),
        directionDeltaY: getDirectionDeltaY(command.definition.direction),
        isActive: true,
        currentFrameIndex: 0,
        frameCounter: 0
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
      
      console.log('🎬 [COMPOSABLE] Started movement:', command.actionNumber, 'at', command.startX, command.startY)
      break
    }
    
    case 'STOP_MOVEMENT': {
      // Mark movements as inactive but keep positions
      for (const actionNumber of command.actionNumbers) {
        const movement = context.movementStates.value.find(m => m.actionNumber === actionNumber)
        if (movement) {
          movement.isActive = false
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
    
    case 'UPDATE_MOVEMENT_POSITION': {
      // Update movement position (for future use if needed)
      const movement = context.movementStates.value.find(m => m.actionNumber === command.actionNumber)
      if (movement) {
        movement.currentX = command.x
        movement.currentY = command.y
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
    case 2: case 3: case 4: return 1  // Right directions
    case 6: case 7: case 8: return -1 // Left directions
    default: return 0
  }
}

/**
 * Helper to get Y delta from direction
 */
function getDirectionDeltaY(direction: number): number {
  switch (direction) {
    case 1: case 2: case 8: return -1 // Up directions
    case 4: case 5: case 6: return 1  // Down directions
    default: return 0
  }
}

/**
 * Route message to appropriate handler
 */
export function handleWorkerMessage(
  message: AnyServiceWorkerMessage,
  context: MessageHandlerContext
): void {
  console.log('📨 [COMPOSABLE] Received message from worker:', message.type)

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- Only handling response messages, request messages sent elsewhere
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
