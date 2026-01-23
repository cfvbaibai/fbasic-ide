/**
 * Message handlers for BASIC IDE web worker communication
 */

import type { Ref } from 'vue'
import type {
  AnyServiceWorkerMessage,
  OutputMessage,
  ScreenUpdateMessage,
  ResultMessage,
  ErrorMessage,
  ProgressMessage,
  ScreenCell
} from '../../../core/interfaces'
import type { WebWorkerManager } from './useBasicIdeWebWorkerUtils'

export interface MessageHandlerContext {
  output: Ref<string[]>
  errors: Ref<Array<{ line: number; message: string; type: string }>>
  debugOutput: Ref<string>
  screenBuffer: Ref<ScreenCell[][]>
  cursorX: Ref<number>
  cursorY: Ref<number>
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
  const { output: outputText, outputType } = (message as OutputMessage).data
  console.log('📤 [COMPOSABLE] Handling output:', outputType, outputText)
  
  if (outputType === 'print') {
    context.output.value.push(outputText)
  } else if (outputType === 'debug') {
    context.debugOutput.value += outputText + '\n'
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
  const update = (message as ScreenUpdateMessage).data
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
        if (!context.screenBuffer.value[y]) {
          context.screenBuffer.value[y] = []
        }
        
        // Ensure cell exists
        const currentRow = context.screenBuffer.value[y]
        if (!currentRow[x]) {
          currentRow[x] = {
            character: ' ',
            colorPattern: 0,
            x,
            y
          }
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
          if (!context.screenBuffer.value[y]) {
            context.screenBuffer.value[y] = []
          }
          
          // Ensure cell exists
          const currentRow = context.screenBuffer.value[y]
          if (!currentRow[x]) {
            currentRow[x] = {
              character: ' ',
              colorPattern: 0,
              x,
              y
            }
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
  const { iterationCount, currentStatement } = (message as ProgressMessage).data
  console.log('🔄 [COMPOSABLE] Progress:', iterationCount, currentStatement)
  // Could emit progress events here if needed
}

/**
 * Route message to appropriate handler
 */
export function handleWorkerMessage(
  message: AnyServiceWorkerMessage,
  context: MessageHandlerContext
): void {
  console.log('📨 [COMPOSABLE] Received message from worker:', message.type)
  
  switch (message.type) {
    case 'OUTPUT':
      handleOutputMessage(message, context)
      break
    case 'SCREEN_UPDATE':
      handleScreenUpdateMessage(message, context)
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
