import { type ComputedRef, inject, type InjectionKey, type VNode } from 'vue'

/**
 * Injection keys for GameTabs component provide/inject pattern.
 * Provides type-safe injection for tab-related state and functions.
 */

export interface GameTabsContext {
  activeTab: ComputedRef<string>
  setActiveTab: (name: string) => void
  registerTab: (name: string, render: () => VNode) => void
  unregisterTab: (name: string) => void
}

export const ActiveTabKey: InjectionKey<ComputedRef<string>> = Symbol('ActiveTab')
export const SetActiveTabKey: InjectionKey<(name: string) => void> = Symbol('SetActiveTab')
export const RegisterTabKey: InjectionKey<(name: string, render: () => VNode) => void> = Symbol('RegisterTab')
export const UnregisterTabKey: InjectionKey<(name: string) => void> = Symbol('UnregisterTab')

/**
 * Helper function for strict injection with runtime error handling.
 * Throws an error if the injection key is not provided.
 */
export function injectStrict<T>(key: InjectionKey<T>, fallback?: T): T {
  const resolved = inject(key, fallback)
  if (!resolved) {
    throw new Error(`Could not resolve ${key.description}`)
  }
  return resolved
}
