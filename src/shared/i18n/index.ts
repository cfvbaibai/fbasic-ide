import { createI18n } from 'vue-i18n'
import type { MessageSchema, Locale } from './types'
import enNavigation from './locales/en/navigation.json'
import enIde from './locales/en/ide.json'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enSpriteViewer from './locales/en/sprite-viewer.json'
import jaNavigation from './locales/ja/navigation.json'
import jaIde from './locales/ja/ide.json'
import jaCommon from './locales/ja/common.json'
import jaHome from './locales/ja/home.json'
import jaSpriteViewer from './locales/ja/sprite-viewer.json'
import zhCNNavigation from './locales/zh-CN/navigation.json'
import zhCNIde from './locales/zh-CN/ide.json'
import zhCNCommon from './locales/zh-CN/common.json'
import zhCNHome from './locales/zh-CN/home.json'
import zhCNSpriteViewer from './locales/zh-CN/sprite-viewer.json'
import zhTWNavigation from './locales/zh-TW/navigation.json'
import zhTWIde from './locales/zh-TW/ide.json'
import zhTWCommon from './locales/zh-TW/common.json'
import zhTWHome from './locales/zh-TW/home.json'
import zhTWSpriteViewer from './locales/zh-TW/sprite-viewer.json'

// Import type declarations
import './vue-i18n.d.ts'

// Get saved locale from localStorage or default to browser language
const getDefaultLocale = (): Locale => {
  const saved = localStorage.getItem('locale')
  if (saved && (saved === 'en' || saved === 'ja' || saved === 'zh-CN' || saved === 'zh-TW')) {
    return saved as Locale
  }
  
  // Detect browser language
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) {
    // Check for Traditional Chinese (Taiwan, Hong Kong, Macau)
    if (browserLang.includes('TW') || browserLang.includes('HK') || browserLang.includes('MO')) {
      return 'zh-TW'
    }
    return 'zh-CN' // Default to Simplified Chinese
  }
  if (browserLang.startsWith('ja')) {
    return 'ja'
  }
  return 'en'
}

const i18n = createI18n<{ message: MessageSchema }, Locale>({
  legacy: false, // Use Composition API mode
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages: {
    en: {
      navigation: enNavigation,
      ide: enIde,
      common: enCommon,
      home: enHome,
      spriteViewer: enSpriteViewer
    },
    ja: {
      navigation: jaNavigation,
      ide: jaIde,
      common: jaCommon,
      home: jaHome,
      spriteViewer: jaSpriteViewer
    },
    'zh-CN': {
      navigation: zhCNNavigation,
      ide: zhCNIde,
      common: zhCNCommon,
      home: zhCNHome,
      spriteViewer: zhCNSpriteViewer
    },
    'zh-TW': {
      navigation: zhTWNavigation,
      ide: zhTWIde,
      common: zhTWCommon,
      home: zhTWHome,
      spriteViewer: zhTWSpriteViewer
    }
  }
})

export default i18n
