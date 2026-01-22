/**
 * Component type utilities for extracting prop types from Vue components.
 * 
 * Note: For script setup components using `defineProps<Interface>()`, we cannot
 * use ExtractPropTypes directly. Instead, components should export their prop
 * interfaces for reuse.
 * 
 * @example
 * ```typescript
 * // In component file, export the interface:
 * export interface GameButtonProps { ... }
 * 
 * // In parent component:
 * import type { GameButtonProps } from '@/shared/components/ui/GameButton.vue'
 * ```
 * 
 * For runtime props definitions, use ExtractPropTypes:
 * ```typescript
 * import type { ExtractPropTypes } from 'vue'
 * type Props = ExtractPropTypes<typeof propsOptions>
 * ```
 */

// This file serves as documentation for component type extraction patterns.
// Individual components should export their prop interfaces when type extraction is needed.
