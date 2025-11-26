/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Configure Monaco Editor workers
  optimizeDeps: {
    include: ['monaco-editor']
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure Monaco workers are handled correctly
        manualChunks: undefined
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        maxForks: 4, // Use up to 4 worker processes
        minForks: 2  // Use at least 2 worker processes
      }
    },
    // Enable parallel test execution
    maxConcurrency: 10,
    // Optimize for faster execution
    isolate: true,
    // Use threads for better performance
    threads: true
  },
})
