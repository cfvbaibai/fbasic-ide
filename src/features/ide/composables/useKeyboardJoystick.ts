import type { Ref } from 'vue'
import { onActivated, onDeactivated, onMounted, onUnmounted, ref } from 'vue'

import { logComposable } from '@/shared/logger'

export interface KeyBinding {
  key: string
  displayName: string
}

export interface JoystickKeyBindings {
  up: KeyBinding
  down: KeyBinding
  left: KeyBinding
  right: KeyBinding
  a: KeyBinding
  b: KeyBinding
  start: KeyBinding
  select: KeyBinding
}

export interface KeyBindingsConfig {
  joystick0: JoystickKeyBindings
  joystick1: JoystickKeyBindings
  joystick2?: JoystickKeyBindings
  joystick3?: JoystickKeyBindings
}

export const defaultJoystick0Bindings: JoystickKeyBindings = {
  up: { key: 'w', displayName: 'W' },
  down: { key: 's', displayName: 'S' },
  left: { key: 'a', displayName: 'A' },
  right: { key: 'd', displayName: 'D' },
  a: { key: 'k', displayName: 'K' },
  b: { key: 'j', displayName: 'J' },
  start: { key: 'h', displayName: 'H' },
  select: { key: 'g', displayName: 'G' },
}

export const defaultJoystick1Bindings: JoystickKeyBindings = {
  up: { key: 'ArrowUp', displayName: '↑' },
  down: { key: 'ArrowDown', displayName: '↓' },
  left: { key: 'ArrowLeft', displayName: '←' },
  right: { key: 'ArrowRight', displayName: '→' },
  a: { key: '1', displayName: '1' },
  b: { key: '2', displayName: '2' },
  start: { key: '3', displayName: '3' },
  select: { key: '4', displayName: '4' },
}

const STORAGE_KEY = 'fbasic-joystick-keybindings'

export function loadKeyBindings(): KeyBindingsConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<KeyBindingsConfig>
      return {
        joystick0: { ...defaultJoystick0Bindings, ...parsed.joystick0 },
        joystick1: { ...defaultJoystick1Bindings, ...parsed.joystick1 },
      }
    }
  } catch {
    logComposable.warn('Failed to load key bindings from localStorage')
  }

  return {
    joystick0: { ...defaultJoystick0Bindings },
    joystick1: { ...defaultJoystick1Bindings },
  }
}

export function saveKeyBindings(config: KeyBindingsConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    logComposable.debug('Key bindings saved to localStorage')
  } catch {
    logComposable.warn('Failed to save key bindings to localStorage')
  }
}

export function resetKeyBindings(): KeyBindingsConfig {
  const config = {
    joystick0: { ...defaultJoystick0Bindings },
    joystick1: { ...defaultJoystick1Bindings },
  }
  saveKeyBindings(config)
  return config
}

interface UseKeyboardJoystickOptions {
  enabled?: Ref<boolean> | boolean
  onDirectionStart?: (joystickId: number, direction: 'up' | 'down' | 'left' | 'right') => void
  onDirectionStop?: (joystickId: number, direction: 'up' | 'down' | 'left' | 'right') => void
  onButtonPress?: (joystickId: number, button: 'a' | 'b' | 'start' | 'select') => void
  onButtonRelease?: (joystickId: number, button: 'a' | 'b' | 'start' | 'select') => void
  keyBindings?: KeyBindingsConfig
}

export function useKeyboardJoystick(options: UseKeyboardJoystickOptions = {}) {
  const {
    enabled: enabledOption = true,
    onDirectionStart,
    onDirectionStop,
    onButtonPress,
    onButtonRelease,
    keyBindings: initialBindings,
  } = options

  const enabled = typeof enabledOption === 'boolean' ? ref(enabledOption) : enabledOption

  const keyBindings = ref<KeyBindingsConfig>(initialBindings ?? loadKeyBindings())

  const pressedKeys = ref<Set<string>>(new Set())

  const heldDirections = ref<Record<number, Set<string>>>({
    0: new Set(),
    1: new Set(),
  })

  type HeldButtonKey = `${0 | 1}-${'a' | 'b' | 'start' | 'select'}`
  const heldButtons = ref<Record<HeldButtonKey, boolean>>({} as Record<HeldButtonKey, boolean>)

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!enabled.value) return

    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
    pressedKeys.value.add(key)

    processJoystickBindings(key, 0, keyBindings.value.joystick0, heldDirections.value[0]!, true)
    processJoystickBindings(key, 1, keyBindings.value.joystick1, heldDirections.value[1]!, true)
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!enabled.value) return

    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
    pressedKeys.value.delete(key)

    processJoystickBindings(key, 0, keyBindings.value.joystick0, heldDirections.value[0]!, false)
    processJoystickBindings(key, 1, keyBindings.value.joystick1, heldDirections.value[1]!, false)
  }

  function matchBinding(binding: KeyBinding, key: string): boolean {
    const bindingKey = binding.key.length === 1 ? binding.key.toLowerCase() : binding.key
    return bindingKey === key
  }

  type Direction = 'up' | 'down' | 'left' | 'right'
  type Button = 'a' | 'b' | 'start' | 'select'

  function processJoystickBindings(
    key: string,
    joystickId: number,
    bindings: JoystickKeyBindings,
    directions: Set<string>,
    isKeyDown: boolean
  ): void {
    const directionsMap: Record<Direction, Direction> = { up: 'up', down: 'down', left: 'left', right: 'right' }
    const buttons: Button[] = ['a', 'b', 'start', 'select']

    for (const dir of Object.keys(directionsMap) as Direction[]) {
      const binding = bindings[dir]
      if (matchBinding(binding, key)) {
        if (isKeyDown) {
          if (!directions.has(dir)) {
            directions.add(dir)
            onDirectionStart?.(joystickId, dir)
          }
        } else {
          directions.delete(dir)
          onDirectionStop?.(joystickId, dir)
        }
      }
    }

    for (const btn of buttons) {
      const binding = bindings[btn]
      if (matchBinding(binding, key)) {
        const heldKey = `${joystickId}-${btn}` as HeldButtonKey
        if (isKeyDown) {
          if (!heldButtons.value[heldKey]) {
            heldButtons.value[heldKey] = true
            onButtonPress?.(joystickId, btn)
          }
        } else {
          heldButtons.value[heldKey] = false
          onButtonRelease?.(joystickId, btn)
        }
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })

  onDeactivated(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })

  onActivated(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  const updateKeyBindings = (newBindings: KeyBindingsConfig) => {
    keyBindings.value = newBindings
    saveKeyBindings(newBindings)
  }

  const resetToDefaults = () => {
    const defaults = resetKeyBindings()
    updateKeyBindings(defaults)
  }

  return {
    keyBindings,
    pressedKeys,
    updateKeyBindings,
    resetToDefaults,
  }
}
