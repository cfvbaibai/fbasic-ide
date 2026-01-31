/**
 * Provide/inject for screen-related state used by ScreenTab and Screen.
 * Eliminates prop drilling from IdePage → RuntimeOutput → ScreenTab → Screen.
 */

import { inject, type InjectionKey, provide, type Ref } from 'vue'

import type {
  DecodedScreenState,
  SharedDisplayViews,
} from '@/core/animation/sharedDisplayBuffer'
import type { ScreenCell } from '@/core/interfaces'
import type { MovementState, SpriteState } from '@/core/sprite/types'

/**
 * Screen context: refs and callbacks for the CRT screen and sprites.
 * Provided by IdePage, consumed by ScreenTab and Screen.
 */
export interface ScreenContextValue {
  screenBuffer: Ref<ScreenCell[][]>
  cursorX: Ref<number>
  cursorY: Ref<number>
  bgPalette: Ref<number>
  backdropColor: Ref<number>
  spritePalette: Ref<number>
  cgenMode: Ref<number>
  spriteStates: Ref<SpriteState[]>
  spriteEnabled: Ref<boolean>
  movementStates: Ref<MovementState[]>
  externalFrontSpriteNodes: Ref<Map<number, unknown>>
  externalBackSpriteNodes: Ref<Map<number, unknown>>
  sharedAnimationView: Ref<Float64Array | undefined>
  sharedDisplayViews: Ref<SharedDisplayViews | undefined>
  setDecodedScreenState: (decoded: DecodedScreenState) => void
  registerScheduleRender: (fn: () => void) => void
}

export const ScreenContextKey: InjectionKey<ScreenContextValue> = Symbol(
  'ide-screen-context'
)

/**
 * Provide screen context. Call from IdePage with refs and callbacks from useBasicIdeEnhanced.
 */
export function provideScreenContext(value: ScreenContextValue): void {
  provide(ScreenContextKey, value)
}

/**
 * Inject screen context. Use in ScreenTab and Screen.
 * @throws if used outside a provider (IdePage must provide)
 */
export function useScreenContext(): ScreenContextValue {
  const ctx = inject(ScreenContextKey)
  if (!ctx) {
    throw new Error(
      'useScreenContext() must be used within a component tree that calls provideScreenContext (e.g. IdePage)'
    )
  }
  return ctx
}
