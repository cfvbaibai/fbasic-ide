/**
 * Vite Plugin: Auto-increment build number
 *
 * This plugin:
 * 1. Increments a build number on each build
 * 2. Updates buildInfo.ts with the new number and timestamp
 * 3. Defines __BUILD_NUMBER__ and __BUILD_TIMESTAMP__ constants
 *
 * The build number file is tracked in git so it persists across sessions.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

const BUILD_NUMBER_FILE = resolve(import.meta.dirname, 'build-number.json')

interface BuildNumberData {
  buildNumber: number
  lastBuildTimestamp: number
}

function getBuildNumberData(): BuildNumberData {
  if (existsSync(BUILD_NUMBER_FILE)) {
    try {
      const content = readFileSync(BUILD_NUMBER_FILE, 'utf-8')
      return JSON.parse(content) as BuildNumberData
    } catch {
      // File exists but is invalid, start fresh
    }
  }
  return { buildNumber: 0, lastBuildTimestamp: 0 }
}

function incrementBuildNumber(): void {
  const data = getBuildNumberData()
  const newBuildNumber = data.buildNumber + 1
  const newTimestamp = Date.now()

  writeFileSync(
    BUILD_NUMBER_FILE,
    JSON.stringify({ buildNumber: newBuildNumber, lastBuildTimestamp: newTimestamp }, null, 2),
    'utf-8'
  )

  console.log(`\n[vite-plugin-build-number] Build #${newBuildNumber} - ${new Date(newTimestamp).toLocaleString()}\n`)
}

export function buildNumberPlugin(): Plugin {
  let currentBuildNumber = 1
  let currentTimestamp = Date.now()
  let configPhase = true

  const plugin: Plugin = {
    name: 'vite-plugin-build-number',
    enforce: 'pre',
  }

  plugin.config = function (config) {
    // Increment build number at config time (before build starts)
    // Only increment once during config phase, not for every HMR
    if (configPhase) {
      incrementBuildNumber()
      const data = getBuildNumberData()
      currentBuildNumber = data.buildNumber
      currentTimestamp = data.lastBuildTimestamp
      configPhase = false
    }

    return {
      define: {
        __BUILD_NUMBER__: JSON.stringify(currentBuildNumber),
        __BUILD_TIMESTAMP__: JSON.stringify(currentTimestamp),
      },
    }
  }

  return plugin
}
