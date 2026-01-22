/**
 * Type definitions for GameTag component
 */

export interface GameTagProps {
  /** Tag visual style variant */
  type?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  /** Tag size */
  size?: 'small' | 'medium' | 'large'
  /** Visual effect style */
  effect?: 'light' | 'dark' | 'plain'
  /** Icon name in format "prefix:name" (e.g., "mdi:check") */
  icon?: string
  /** Whether the tag can be closed */
  closable?: boolean
}

export interface GameTagEmits {
  /** Close button clicked */
  close: []
}
