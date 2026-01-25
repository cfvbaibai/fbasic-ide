/**
 * Vue I18n type declarations
 *
 * This file augments vue-i18n's types to provide type safety for translation keys.
 * All translation keys are validated against the MessageSchema.
 */

import type { MessageSchema } from './types'

declare module 'vue-i18n' {
  // Define the locale message schema
  export interface DefineLocaleMessage extends MessageSchema {}
}
