/**
 * Theme management composable
 * Provides theme switching functionality with Element Plus dark mode support
 */

import { ref, watch, onMounted } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

// Shared state (singleton pattern)
let themeMode = ref<ThemeMode>('auto')
let isDark = ref(false)
let initialized = false

/**
 * Get system preference for dark mode
 */
function getSystemPreference(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Apply theme to document
 */
function applyTheme(dark: boolean) {
  if (typeof document === 'undefined') return
  
  const html = document.documentElement
  if (dark) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
  isDark.value = dark
}

/**
 * Update theme based on current mode
 */
function updateTheme() {
  let shouldBeDark = false
  
  if (themeMode.value === 'dark') {
    shouldBeDark = true
  } else if (themeMode.value === 'light') {
    shouldBeDark = false
  } else {
    // auto mode - use system preference
    shouldBeDark = getSystemPreference()
  }
  
  applyTheme(shouldBeDark)
}

/**
 * Watch for system preference changes (only in auto mode)
 */
function setupSystemPreferenceWatcher() {
  if (typeof window === 'undefined') return
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    if (themeMode.value === 'auto') {
      updateTheme()
    }
  }
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange)
  }
}

/**
 * Load theme preference from localStorage
 */
function loadThemePreference(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'auto'
  
  const saved = localStorage.getItem('theme-mode') as ThemeMode | null
  if (saved && ['light', 'dark', 'auto'].includes(saved)) {
    return saved
  }
  return 'auto'
}

/**
 * Save theme preference to localStorage
 */
function saveThemePreference(mode: ThemeMode) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem('theme-mode', mode)
}

/**
 * Initialize theme system (call once at app startup)
 */
export function initTheme() {
  if (initialized) return
  
  themeMode.value = loadThemePreference()
  updateTheme()
  setupSystemPreferenceWatcher()
  initialized = true
}

/**
 * Theme management composable
 */
export function useTheme() {
  // Initialize if not already done
  if (!initialized && typeof window !== 'undefined') {
    initTheme()
  }

  // Initialize theme on mount (fallback)
  onMounted(() => {
    if (!initialized) {
      initTheme()
    }
  })

  // Watch for theme mode changes
  watch(themeMode, (newMode) => {
    saveThemePreference(newMode)
    updateTheme()
  })

  /**
   * Set theme mode
   */
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
  }

  /**
   * Toggle between light and dark (ignores auto mode)
   */
  const toggleTheme = () => {
    if (isDark.value) {
      setThemeMode('light')
    } else {
      setThemeMode('dark')
    }
  }

  return {
    themeMode,
    isDark,
    setThemeMode,
    toggleTheme
  }
}

