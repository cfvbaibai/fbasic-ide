/**
 * Build script for creating a web worker-compatible BASIC interpreter
 */

import * as esbuild from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'

/* global process */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const workerEntrypoint = path.resolve(__dirname, '../src/core/workers/WebWorkerInterpreter.ts')
const workerOutputPath = path.resolve(__dirname, '../public/basic-interpreter-worker.js')

async function buildWebWorker() {
  console.log('Building web worker with full interpreter...')
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
      external: ['vue'], // Exclude main app dependencies (lodash-es must be bundled for Chevrotain)
      define: {
        'process.env.NODE_ENV': '"production"', // Ensure production environment
      },
      // Bundle all interpreter dependencies
      packages: 'bundle',
    })
    console.log(`Web worker with full interpreter generated successfully!`)
    console.log(`Output: ${workerOutputPath}`)
  } catch (error) {
    console.error('Error building web worker:', error)
    process.exit(1)
  }
}

buildWebWorker()