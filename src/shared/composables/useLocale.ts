import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Locale } from '../i18n/types'

const LOCALE_STORAGE_KEY = 'locale'

export function useLocale() {
  const { locale } = useI18n()
  const currentLocale = ref<Locale>(locale.value as Locale)

  // Initialize from localStorage or use current locale
  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
  if (savedLocale && (savedLocale === 'en' || savedLocale === 'ja' || savedLocale === 'zh-CN' || savedLocale === 'zh-TW')) {
    currentLocale.value = savedLocale
    locale.value = savedLocale
  }

  // Watch for locale changes and persist to localStorage
  watch(currentLocale, (newLocale) => {
    locale.value = newLocale
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
  })

  const setLocale = (newLocale: Locale) => {
    currentLocale.value = newLocale
  }

  const availableLocales: { value: Locale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁體中文' }
  ]

  return {
    currentLocale,
    setLocale,
    availableLocales
  }
}
