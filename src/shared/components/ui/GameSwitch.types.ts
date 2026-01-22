/**
 * Type definitions for GameSwitch component
 */

export interface GameSwitchProps {
  /** Switch value (v-model) */
  modelValue: boolean | string | number
  /** Whether the switch is disabled */
  disabled?: boolean
  /** Switch size */
  size?: 'small' | 'medium' | 'large'
}

export interface GameSwitchEmits {
  /** Update model value (v-model) */
  'update:modelValue': [value: boolean | string | number]
}
