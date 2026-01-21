/**
 * Type definitions for i18n translation keys
 * 
 * This file provides TypeScript type safety for translation keys throughout the application.
 * The types are derived from the English locale files (master schema).
 */

import enNavigation from './locales/en/navigation.json'
import enIde from './locales/en/ide.json'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enSpriteViewer from './locales/en/sprite-viewer.json'

// Define the master schema from English locale
export type MessageSchema = {
  navigation: typeof enNavigation
  ide: typeof enIde
  common: typeof enCommon
  home: typeof enHome
  spriteViewer: typeof enSpriteViewer
}

// Define available locales
export type Locale = 'en' | 'ja' | 'zh-CN' | 'zh-TW'
