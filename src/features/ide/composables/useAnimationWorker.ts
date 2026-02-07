/**
 * Animation Worker Manager Composable
 *
 * Manages the Animation Worker lifecycle from the main thread.
 * Passes shared buffers to Animation Worker during initialization.
 *
 * Note: Animation commands are sent via direct sync (Executor Worker → Animation Worker)
 * through the shared buffer using Atomics, not via postMessage forwarding.
 */

import { type Ref, ref, watch } from 'vue'

import type { AnimationWorkerCommand } from '@/core/workers/AnimationWorker'

export interface UseAnimationWorkerOptions {
  sharedAnimationBuffer: Ref<SharedArrayBuffer | null>
  onReady?: () => void
  onError?: (error: Error) => void
}

/**
 * Composable for managing Animation Worker from main thread
 *
 * @param options - Configuration options
 * @returns Animation worker manager interface
 */
export function useAnimationWorker(options: UseAnimationWorkerOptions) {
  const { sharedAnimationBuffer, onReady, onError } = options

  let worker: Worker | null = null
  const isReady = ref(false)
  const isInitializing = ref(false)
  const initError = ref<Error | null>(null)

  /**
   * Initialize the Animation Worker
   */
  async function initialize(): Promise<void> {
    console.log('[useAnimationWorker] initialize() called', {
      isReady: isReady.value,
      isInitializing: isInitializing.value,
      hasBuffer: !!sharedAnimationBuffer.value,
      bufferByteLength: sharedAnimationBuffer.value?.byteLength,
    })

    if (isReady.value) {
      return
    }

    if (isInitializing.value) {
      throw new Error('Animation Worker is already initializing')
    }

    isInitializing.value = true
    initError.value = null

    try {
      console.log('[useAnimationWorker] Creating Animation Worker...')
      // Create Animation Worker
      // Vite will bundle this automatically with the ?worker suffix pattern
      worker = new Worker(
        new URL('../../../core/workers/animation-worker.ts?worker', import.meta.url),
        {
          type: 'module',
        }
      )

      // Set up error handler
      worker.onerror = (event) => {
        const error = new Error(`Animation Worker error: ${event.message}`)
        initError.value = error
        onError?.(error)
      }

      // Wait for worker to be ready
      await new Promise<void>((resolve, reject) => {
        if (!worker) {
          reject(new Error('Worker failed to initialize'))
          return
        }

        const timeout = setTimeout(() => {
          reject(new Error('Animation Worker initialization timeout'))
        }, 5000)

        // Assume worker is ready immediately after creation
        // (no handshake needed, just send the buffers)
        clearTimeout(timeout)
        resolve()
      })

      // Send shared buffers to animation worker (if available)
      // Buffers might be set after worker initialization, so we watch for changes
      if (sharedAnimationBuffer.value) {
        const setBufferCommand: AnimationWorkerCommand = {
          type: 'SET_SHARED_BUFFER',
          buffer: sharedAnimationBuffer.value,
        }
        worker.postMessage(setBufferCommand)
      }

      isReady.value = true
      onReady?.()
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      initError.value = err
      onError?.(err)
      throw err
    } finally {
      isInitializing.value = false
    }
  }

  // Watch for buffer changes and send to worker when available
  watch(sharedAnimationBuffer, (newBuffer) => {
    console.log('[useAnimationWorker] sharedAnimationBuffer changed:', {
      isReady: isReady.value,
      hasWorker: !!worker,
      hasBuffer: !!newBuffer,
      byteLength: newBuffer?.byteLength,
    })
    if (isReady.value && worker) {
      if (newBuffer) {
        const setBufferCommand: AnimationWorkerCommand = {
          type: 'SET_SHARED_BUFFER',
          buffer: newBuffer,
        }
        worker.postMessage(setBufferCommand)
        console.log('[useAnimationWorker] Sent SET_SHARED_BUFFER to AnimationWorker, byteLength:', newBuffer.byteLength)
      }
    }
  })

  /**
   * Terminate the Animation Worker
   */
  function terminate(): void {
    if (worker) {
      worker.terminate()
      worker = null
    }
    isReady.value = false
    isInitializing.value = false
    initError.value = null
  }

  /**
   * Reset the Animation Worker state
   */
  function reset(): void {
    // Animation worker doesn't have a reset command
    // Terminate and re-initialize if needed
  }

  return {
    // State
    isReady,
    isInitializing,
    initError,

    // Methods
    initialize,
    terminate,
    reset,

    // Computed
    worker: () => worker,
  }
}
