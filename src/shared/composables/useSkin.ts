/**
 * Skin System Composable
 *
 * Provides reactive skin management for the application.
 * Uses data-skin attribute on <html> element to switch themes.
 */

import { useLocalStorage } from '@vueuse/core'
import { computed, watch } from 'vue'

import { type SkinConfig, skinConfigs } from './skinConfig'

export type SkinName = 'default' | 'retro-blue' | 'nintendo' | 'classic-light' | 'y2k-futuristic' | 'sunset-vaporwave'

const SKIN_STORAGE_KEY = 'fbasic-ide-skin'
const SKIN_ATTRIBUTE = 'data-skin'

const isValidSkinName = (value: unknown): value is SkinName => {
  return (
    value === 'default' ||
    value === 'retro-blue' ||
    value === 'nintendo' ||
    value === 'classic-light' ||
    value === 'y2k-futuristic' ||
    value === 'sunset-vaporwave'
  )
}

/**
 * Get initial skin from DOM or storage
 */
function getInitialSkin(): SkinName {
  if (typeof window === 'undefined') {
    return 'default'
  }

  // Check DOM first (takes precedence)
  const domSkin = document.documentElement.getAttribute(SKIN_ATTRIBUTE)
  if (domSkin && isValidSkinName(domSkin)) {
    return domSkin
  }

  // Check localStorage
  const storedSkin = localStorage.getItem(SKIN_STORAGE_KEY)
  if (storedSkin && isValidSkinName(storedSkin)) {
    return storedSkin
  }

  return 'default'
}

/**
 * Apply skin to DOM
 */
function applySkin(skin: SkinName): void {
  if (typeof window === 'undefined') {
    return
  }

  const config = skinConfigs[skin]

  if (skin === 'default') {
    document.documentElement.removeAttribute(SKIN_ATTRIBUTE)
  } else {
    document.documentElement.setAttribute(SKIN_ATTRIBUTE, skin)
  }

  // Apply light theme class if needed
  if (config.isLightTheme) {
    document.documentElement.classList.add('light-theme')
  } else {
    document.documentElement.classList.remove('light-theme')
  }
}

/**
 * Composable for skin management
 */
export function useSkin() {
  // Use VueUse's useLocalStorage with type safety
  const currentSkin = useLocalStorage<SkinName>(SKIN_STORAGE_KEY, getInitialSkin(), {
    serializer: {
      read: (value: string): SkinName => {
        if (isValidSkinName(value)) {
          return value
        }
        return 'default'
      },
      write: (value: SkinName): string => value,
    },
  })

  // Apply skin to DOM when it changes
  watch(
    currentSkin,
    skin => {
      if (typeof window !== 'undefined') {
        applySkin(skin)
      }
    },
    { immediate: true }
  )

  /**
   * Set active skin
   */
  const setSkin = (skin: SkinName) => {
    currentSkin.value = skin
    // Skin will be applied automatically via watch
  }

  /**
   * Available skins
   */
  const availableSkins: Array<{ name: SkinName; label: string; description: string }> = [
    { name: 'default', label: 'Default', description: 'Original retro game-themed dark skin' },
    { name: 'retro-blue', label: 'Retro Blue', description: 'Blue-tinted retro theme' },
    { name: 'nintendo', label: 'Nintendo', description: 'Nintendo-themed with inverted colors and red accent' },
    { name: 'classic-light', label: 'Classic Light', description: 'Warm classic light theme with soft purple accent' },
    {
      name: 'y2k-futuristic',
      label: 'Y2K Futuristic',
      description: 'Retro-futuristic Y2K aesthetic with neon colors, CRT effects, and cyberpunk vibes',
    },
    {
      name: 'sunset-vaporwave',
      label: 'Sunset Vaporwave',
      description: 'Dreamy 80s/90s aesthetic with pastel gradients, soft glows, and nostalgic vibes',
    },
  ]

  /**
   * Get current skin configuration
   */
  const currentSkinConfig = computed<SkinConfig>(() => {
    return skinConfigs[currentSkin.value]
  })

  return {
    currentSkin,
    setSkin,
    availableSkins,
    currentSkinConfig,
    skinConfigs,
  }
}

// Export skin configs for global access
export { type SkinConfig, skinConfigs }
