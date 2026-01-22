/**
 * Type definitions for GameSelect component
 */

export interface GameSelectOption {
  /** Option display label */
  label: string
  /** Option value */
  value: string | number
  /** Whether the option is disabled */
  disabled?: boolean
}

export interface GameSelectProps {
  /** Selected value (v-model) */
  modelValue: string | number
  /** Available options */
  options?: GameSelectOption[]
  /** Placeholder text */
  placeholder?: string
  /** Whether the select is disabled */
  disabled?: boolean
  /** Select size */
  size?: 'small' | 'medium' | 'large'
  /** Custom width */
  width?: string
}

export interface GameSelectEmits {
  /** Update model value (v-model) */
  'update:modelValue': [value: string | number]
}
