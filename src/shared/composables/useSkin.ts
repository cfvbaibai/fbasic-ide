/**
 * Skin System Composable
 * 
 * Provides reactive skin management for the application.
 * Uses data-skin attribute on <html> element to switch themes.
 */

import { ref, onMounted, computed } from 'vue'
import { skinConfigs, type SkinConfig } from './skinConfig'

export type SkinName = 'default' | 'retro-blue' | 'nintendo'

const SKIN_STORAGE_KEY = 'fbasic-emu-skin'
const SKIN_ATTRIBUTE = 'data-skin'

/**
 * Get current skin from DOM or storage
 */
function getCurrentSkin(): SkinName {
  if (typeof window === 'undefined') {
    return 'default'
  }

  // Check DOM first (takes precedence)
  const domSkin = document.documentElement.getAttribute(SKIN_ATTRIBUTE)
  if (domSkin && (domSkin === 'default' || domSkin === 'retro-blue' || domSkin === 'nintendo')) {
    return domSkin as SkinName
  }

  // Check localStorage
  const storedSkin = localStorage.getItem(SKIN_STORAGE_KEY)
  if (storedSkin && (storedSkin === 'default' || storedSkin === 'retro-blue' || storedSkin === 'nintendo')) {
    return storedSkin as SkinName
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
  const currentSkin = ref<SkinName>(getCurrentSkin())

  // Apply skin immediately (works on page load and navigation)
  if (typeof window !== 'undefined') {
    applySkin(currentSkin.value)
  }

  // Also apply on mount (for reactivity when component mounts)
  onMounted(() => {
    applySkin(currentSkin.value)
  })

  /**
   * Set active skin
   */
  const setSkin = (skin: SkinName) => {
    currentSkin.value = skin
    applySkin(skin)
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      if (skin === 'default') {
        localStorage.removeItem(SKIN_STORAGE_KEY)
      } else {
        localStorage.setItem(SKIN_STORAGE_KEY, skin)
      }
    }
  }

  /**
   * Available skins
   */
  const availableSkins: Array<{ name: SkinName; label: string; description: string }> = [
    { name: 'default', label: 'Default', description: 'Original retro game-themed dark skin' },
    { name: 'retro-blue', label: 'Retro Blue', description: 'Blue-tinted retro theme' },
    { name: 'nintendo', label: 'Nintendo', description: 'Nintendo-themed with inverted colors and red accent' },
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
export { skinConfigs, type SkinConfig }
