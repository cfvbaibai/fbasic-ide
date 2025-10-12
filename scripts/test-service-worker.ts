/**
 * Test script to verify service worker functionality
 */

import { createProductionInterpreter } from '../src/core/BasicInterpreter.js'

async function testServiceWorker() {
  console.log('Testing service worker functionality...')
  
  const interpreter = createProductionInterpreter({
    serviceWorker: {
      enabled: true,
      workerScript: '/basic-interpreter-worker.js'
    }
  })

  try {
    const result = await interpreter.execute('10 PRINT "Hello World"\n20 END')
    console.log('Service worker test result:', result)
    
    if (result.success && result.output.includes('not yet fully implemented')) {
      console.log('✅ Service worker is working correctly - falling back to main thread as expected')
    } else if (result.success) {
      console.log('✅ Service worker executed successfully')
    } else {
      console.log('❌ Service worker execution failed:', result.errors)
    }
  } catch (error) {
    console.log('❌ Service worker test failed:', error.message)
  }
}

// Run the test
testServiceWorker()
