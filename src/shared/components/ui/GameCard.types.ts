/**
 * Type definitions for GameCard component
 */

export interface GameCardProps {
  /** Card title */
  title: string
  /** Card description */
  description?: string
  /** Icon name in format "prefix:name" (e.g., "mdi:play") */
  icon?: string
  /** Icon color */
  iconColor?: string
  /** Action button text */
  actionText?: string
  /** Whether the card is clickable */
  clickable?: boolean
  /** Whether the card floats on hover */
  floatOnHover?: boolean
}

export interface GameCardEmits {
  /** Card clicked */
  click: []
}
