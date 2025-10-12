/**
 * Device Abstraction Layer - Main Export
 * 
 * Exports all device implementations and utilities
 */

// Device implementations
export * from './ServiceWorkerDeviceAdapter'
export * from './TestDeviceAdapter'

// Re-export commonly used types for convenience
export type {
  BasicDeviceAdapter
} from '../interfaces'
