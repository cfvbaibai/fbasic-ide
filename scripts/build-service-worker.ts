/**
 * Build script for creating a service worker-compatible BASIC interpreter
 */

import * as esbuild from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'

/* global process */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const workerEntrypoint = path.resolve(__dirname, '../src/core/workers/ServiceWorkerInterpreter.ts')
const workerOutputPath = path.resolve(__dirname, '../public/basic-interpreter-worker.js')

async function buildServiceWorker() {
  console.log('Building service worker with full interpreter...')
  try {
    await esbuild.build({
      entryPoints: [workerEntrypoint],
      bundle: true,
      outfile: workerOutputPath,
      format: 'iife', // Immediately Invoked Function Expression for service worker
      platform: 'browser',
      target: 'es2020',
      minify: false, // Keep readable for debugging
      sourcemap: false,
      external: ['vue', 'element-plus', 'lodash-es'], // Exclude main app dependencies
      define: {
        'process.env.NODE_ENV': '"production"', // Ensure production environment
      },
      // Bundle all interpreter dependencies
      packages: 'bundle',
    })
    console.log(`Service worker with full interpreter generated successfully!`)
    console.log(`Output: ${workerOutputPath}`)
  } catch (error) {
    console.error('Error building service worker:', error)
    process.exit(1)
  }
}

buildServiceWorker()