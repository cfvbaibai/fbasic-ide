/**
 * Type definitions for GameTextarea component
 */

export interface GameTextareaProps {
  /** Textarea value (v-model) */
  modelValue: string
  /** Placeholder text */
  placeholder?: string
  /** Whether the textarea is disabled */
  disabled?: boolean
  /** Whether the textarea is readonly */
  readonly?: boolean
  /** Number of rows */
  rows?: number
  /** Resize behavior */
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  /** Textarea size */
  size?: 'small' | 'medium' | 'large'
}

export interface GameTextareaEmits {
  /** Update model value (v-model) */
  'update:modelValue': [value: string]
  /** Focus event */
  focus: [event: FocusEvent]
  /** Blur event */
  blur: [event: FocusEvent]
}
