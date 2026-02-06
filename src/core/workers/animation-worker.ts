/**
 * Animation Worker Entry Point
 *
 * This worker manages sprite animation state as the SINGLE WRITER to the shared animation buffer.
 * Main thread becomes read-only for rendering.
 *
 * Communication:
 * - Executor Worker sends AnimationWorkerCommand messages
 * - This worker writes positions to shared buffer
 * - Main thread reads from shared buffer for rendering
 */

import { AnimationWorker } from './AnimationWorker'

const worker = new AnimationWorker()

// Listen for messages from Executor Worker or Main Thread
self.onmessage = (event: MessageEvent) => {
  worker.handleMessage(event.data)
}

// Export for type checking (no runtime effect in workers)
export {}
