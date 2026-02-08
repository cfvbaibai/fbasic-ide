/**
 * Build Information Module
 *
 * This file is automatically updated by the Vite build plugin during:
 * - Production builds (pnpm build)
 * - Development server hot-reloads (HMR updates)
 *
 * The build number increments on each update, and the timestamp reflects
 * when the last build occurred. This helps identify whether cached
 * browser code is stale.
 */
export const buildInfo = {
  buildNumber: __BUILD_NUMBER__,
  buildTimestamp: __BUILD_TIMESTAMP__,
  buildDate: new Date(__BUILD_TIMESTAMP__).toLocaleString(),
}

/**
 * Get a formatted build ID string for display
 */
export function getBuildId(): string {
  return `#${buildInfo.buildNumber} (${buildInfo.buildDate})`
}
