/**
 * Web worker management utilities for BASIC IDE
 */

import type { AnyServiceWorkerMessage, ExecutionResult } from '@/core/interfaces'

export interface WebWorkerManager {
  worker: Worker | null
  messageId: number
  pendingMessages: Map<
    string,
    {
      resolve: (result: ExecutionResult) => void
      reject: (error: Error) => void
      timeout: NodeJS.Timeout
    }
  >
}

/**
 * Initialize web worker
 */
export async function initializeWebWorker(
  webWorkerManager: WebWorkerManager,
  onMessage: (message: AnyServiceWorkerMessage) => void,
  sharedAnimationBuffer: SharedArrayBuffer
): Promise<void> {
  if (webWorkerManager.worker) {
    console.log('✅ [COMPOSABLE] Web worker already initialized')
    return
  }

  try {
    console.log('🔧 [COMPOSABLE] Initializing web worker...')
    webWorkerManager.worker = new Worker('/basic-interpreter-worker.js')

    // Set up message handling
    webWorkerManager.worker.onmessage = event => {
      onMessage(event.data)
    }

    webWorkerManager.worker.onerror = error => {
      console.error('❌ [COMPOSABLE] Web worker error:', error)
      rejectAllPendingMessages(webWorkerManager, `Web worker error: ${error.message}`)
      // Restart web worker on error
      void restartWebWorker(webWorkerManager, onMessage, sharedAnimationBuffer)
    }

    webWorkerManager.worker.onmessageerror = error => {
      console.error('❌ [COMPOSABLE] Web worker message error:', error)
      rejectAllPendingMessages(webWorkerManager, 'Web worker message error')
      void restartWebWorker(webWorkerManager, onMessage, sharedAnimationBuffer)
    }

    webWorkerManager.worker.postMessage({
      type: 'SET_SHARED_ANIMATION_BUFFER',
      id: `init-buffer-${Date.now()}`,
      timestamp: Date.now(),
      data: { buffer: sharedAnimationBuffer },
    })

    console.log('✅ [COMPOSABLE] Web worker initialized successfully')
  } catch (error) {
    console.error('❌ [COMPOSABLE] Failed to initialize web worker:', error)
    throw error
  }
}

/**
 * Restart web worker
 */
export async function restartWebWorker(
  webWorkerManager: WebWorkerManager,
  onMessage: (message: AnyServiceWorkerMessage) => void,
  sharedAnimationBuffer: SharedArrayBuffer
): Promise<void> {
  console.log('🔄 [COMPOSABLE] Restarting web worker...')

  if (webWorkerManager.worker) {
    webWorkerManager.worker.terminate()
    webWorkerManager.worker = null
  }

  rejectAllPendingMessages(webWorkerManager, 'Web worker restarted')
  await new Promise(resolve => setTimeout(resolve, 100))
  await initializeWebWorker(webWorkerManager, onMessage, sharedAnimationBuffer)
}

/**
 * Check web worker health
 */
export async function checkWebWorkerHealth(
  webWorkerManager: WebWorkerManager,
  sendMessageToWorkerFn: (message: AnyServiceWorkerMessage) => Promise<ExecutionResult>
): Promise<boolean> {
  if (!webWorkerManager.worker) {
    return false
  }

  try {
    // Send a ping message to check if worker is responsive
    await sendMessageToWorkerFn({
      type: 'EXECUTE',
      id: `ping-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        code: '10 PRINT "PING"',
        config: {
          maxIterations: 100,
          maxOutputLines: 10,
          enableDebugMode: false,
          strictMode: false,
          deviceAdapter: undefined,
        },
        options: {
          timeout: 5000,
        },
      },
    })

    return true
  } catch (error) {
    console.warn('⚠️ [COMPOSABLE] Web worker health check failed:', error)
    return false
  }
}

/**
 * Reject all pending messages
 */
export function rejectAllPendingMessages(webWorkerManager: WebWorkerManager, reason: string): void {
  console.log('🚫 [COMPOSABLE] Rejecting all pending messages:', reason)
  for (const [_messageId, pending] of webWorkerManager.pendingMessages) {
    clearTimeout(pending.timeout)
    pending.reject(new Error(reason))
  }
  webWorkerManager.pendingMessages.clear()
}

/**
 * Send message to web worker and return promise
 */
export function sendMessageToWorker(
  message: AnyServiceWorkerMessage,
  webWorkerManager: WebWorkerManager
): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    if (!webWorkerManager.worker) {
      reject(new Error('Web worker not initialized'))
      return
    }

    const _messageId = (++webWorkerManager.messageId).toString()
    const messageWithId = { ...message, id: _messageId }

    // Set up timeout
    const timeout = setTimeout(() => {
      console.log('⏰ [COMPOSABLE] Message timeout:', _messageId)
      webWorkerManager.pendingMessages.delete(_messageId)
      reject(new Error('Web worker message timeout'))
    }, 30000) // 30 second timeout

    // Store pending message
    webWorkerManager.pendingMessages.set(_messageId, {
      resolve,
      reject,
      timeout,
    })

    console.log('📤 [COMPOSABLE] Sending message to worker:', messageWithId.type, _messageId)
    console.log('📤 [COMPOSABLE] Pending messages count:', webWorkerManager.pendingMessages.size)
    webWorkerManager.worker.postMessage(messageWithId)
  })
}
