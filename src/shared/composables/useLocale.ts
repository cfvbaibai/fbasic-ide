import { useLocalStorage } from '@vueuse/core'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { Locale } from '@/shared/i18n/types'

const LOCALE_STORAGE_KEY = 'locale'

const isValidLocale = (value: unknown): value is Locale => {
  return value === 'en' || value === 'ja' || value === 'zh-CN' || value === 'zh-TW'
}

export function useLocale() {
  const { locale } = useI18n()

  // Use VueUse's useLocalStorage with type safety
  const currentLocale = useLocalStorage<Locale>(LOCALE_STORAGE_KEY, locale.value as Locale, {
    serializer: {
      read: (value: string): Locale => {
        if (isValidLocale(value)) {
          return value
        }
        return locale.value as Locale
      },
      write: (value: Locale): string => value,
    },
  })

  // Initialize locale from storage if valid
  if (isValidLocale(currentLocale.value)) {
    locale.value = currentLocale.value
  }

  // Watch for locale changes and sync with vue-i18n
  watch(currentLocale, newLocale => {
    if (isValidLocale(newLocale)) {
      locale.value = newLocale
    }
  })

  const setLocale = (newLocale: Locale) => {
    currentLocale.value = newLocale
  }

  const availableLocales: { value: Locale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁體中文' },
  ]

  return {
    currentLocale,
    setLocale,
    availableLocales,
  }
}
