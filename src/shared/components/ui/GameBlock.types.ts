/**
 * Type definitions for GameBlock component
 */

export interface GameBlockProps {
  /** Block title */
  title: string
  /** Title icon name in format "prefix:name" (e.g., "mdi:play") */
  titleIcon?: string
  /** Whether the header is clickable */
  clickableHeader?: boolean
  /** Whether to hide the header */
  hideHeader?: boolean
  /** Whether the block floats on hover */
  floatOnHover?: boolean
  /** Whether the block is clickable */
  clickable?: boolean
}

export interface GameBlockEmits {
  /** Header clicked */
  clickHeader: []
  /** Block clicked */
  click: []
}
