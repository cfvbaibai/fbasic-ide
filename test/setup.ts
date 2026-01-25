// Test setup file for Vitest
import { afterAll, beforeAll } from 'vitest'

// Global test setup
beforeAll(() => {
  // Any global setup can go here
  console.log('Setting up test environment...')
})

afterAll(() => {
  // Any global cleanup can go here
  console.log('Cleaning up test environment...')
})
