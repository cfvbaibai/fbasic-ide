import type { Ref, ShallowRef } from 'vue'
import { onBeforeUnmount, onMounted } from 'vue'

export interface UseNavigationDropdownOptions {
  /**
   * Reactive ref for dropdown expanded state
   */
  expanded: Ref<boolean>
  /**
   * Template ref for the header element (from parent component)
   */
  headerRef: Readonly<ShallowRef<HTMLElement | null>>
  /**
   * Template ref for the dropdown element (from parent component)
   */
  dropdownRef: Readonly<ShallowRef<HTMLElement | null>>
  /**
   * Other dropdowns to close when this one is toggled
   */
  otherDropdowns?: Ref<boolean>[]
}

export interface UseNavigationDropdownReturn {
  /**
   * Toggle the dropdown open/closed
   */
  toggle: () => void
  /**
   * Close the dropdown
   */
  close: () => void
}

/**
 * Composable for managing navigation dropdown behavior including:
 * - Click-outside detection
 * - ESC key handling
 * - Toggle functionality
 *
 * @param options - Configuration options
 * @returns Navigation dropdown interface
 */
export function useNavigationDropdown(
  options: UseNavigationDropdownOptions,
): UseNavigationDropdownReturn {
  const { expanded, headerRef, dropdownRef, otherDropdowns = [] } = options

  /**
   * Toggle dropdown and close others
   */
  const toggle = () => {
    expanded.value = !expanded.value

    // Close other dropdowns
    otherDropdowns.forEach(other => {
      other.value = false
    })
  }

  /**
   * Close this dropdown
   */
  const close = () => {
    expanded.value = false
  }

  /**
   * Handle clicks outside dropdown to close it
   */
  const handleClickOutside = (event: MouseEvent) => {
    if (!expanded.value) return

    const target = event.target as Node
    const headerContains = headerRef.value?.contains(target) ?? false
    const dropdownContains = dropdownRef.value?.contains(target) ?? false

    if (!headerContains && !dropdownContains) {
      close()
    }
  }

  /**
   * Handle ESC key to close dropdown
   */
  const handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close()
    }
  }

  // Set up event listeners
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscKey)
  })

  return {
    toggle,
    close,
  }
}
