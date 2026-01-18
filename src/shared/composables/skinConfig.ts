/**
 * Skin Configuration
 * 
 * Defines metadata for available skins including theme type (light/dark).
 */

import type { SkinName } from './useSkin'

export interface SkinConfig {
  /** Whether this skin uses a light theme (default: false) */
  isLightTheme: boolean
}

/**
 * Configuration for all available skins
 */
export const skinConfigs: Record<SkinName, SkinConfig> = {
  default: {
    isLightTheme: false
  },
  'retro-blue': {
    isLightTheme: false
  },
  nintendo: {
    isLightTheme: true
  }
}

/**
 * Get configuration for a specific skin
 */
export function getSkinConfig(skin: SkinName): SkinConfig {
  return skinConfigs[skin]
}
