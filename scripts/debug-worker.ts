/**
 * Simple test to debug service worker message passing
 */

// Test if we can create a worker and send messages
console.log('Testing service worker...')

// Create a simple worker script
const workerScript = `
console.log('Worker script loaded')
self.addEventListener('message', (event) => {
  console.log('Worker received message:', event.data)
  self.postMessage({
    type: 'RESULT',
    id: event.data.id,
    data: {
      success: true,
      output: 'Test message received',
      errors: [],
      variables: new Map(),
      executionTime: 0,
      debugOutput: undefined
    }
  })
})
`

// Create a blob URL for the worker script
const blob = new Blob([workerScript], { type: 'application/javascript' })
const workerUrl = URL.createObjectURL(blob)

// Create worker
const worker = new Worker(workerUrl)

// Set up message handler
worker.onmessage = (event) => {
  console.log('Main thread received message:', event.data)
  worker.terminate()
  URL.revokeObjectURL(workerUrl)
}

// Send test message
worker.postMessage({
  type: 'EXECUTE',
  id: 'test-1',
  data: { code: '10 PRINT "Hello"', config: {} }
})

console.log('Test message sent')
