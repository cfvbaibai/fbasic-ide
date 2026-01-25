import { inject, type InjectionKey, provide, type Ref,ref } from 'vue'

/**
 * Zoom control interface
 */
export interface ZoomControl {
  zoomLevel: Ref<1 | 2 | 3 | 4>
  setZoom: (level: 1 | 2 | 3 | 4) => void
}

/**
 * Injection key for screen zoom control
 */
export const ScreenZoomKey: InjectionKey<ZoomControl> = Symbol('screen-zoom')

/**
 * Composable for providing screen zoom level state.
 * Should be called in a parent component (e.g., RuntimeOutput) to provide
 * zoom state to child components (e.g., Screen).
 * 
 * @returns Object with zoom level state and setter function
 */
export function provideScreenZoom(): ZoomControl {
  // Zoom state - default to 2x (current scale)
  const zoomLevel = ref<1 | 2 | 3 | 4>(2)

  function setZoom(level: 1 | 2 | 3 | 4): void {
    zoomLevel.value = level
  }

  const control: ZoomControl = {
    zoomLevel,
    setZoom
  }

  provide(ScreenZoomKey, control)

  return control
}

/**
 * Composable for injecting screen zoom level state.
 * Should be called in child components that need access to zoom state.
 * 
 * @returns Object with zoom level state and setter function, or undefined if not provided
 */
export function useScreenZoom(): ZoomControl {
  const injected = inject(ScreenZoomKey)
  
  if (!injected) {
    // Fallback: create local state if not provided (for backwards compatibility or standalone usage)
    const zoomLevel = ref<1 | 2 | 3 | 4>(2)
    
    function setZoom(level: 1 | 2 | 3 | 4): void {
      zoomLevel.value = level
    }
    
    return {
      zoomLevel,
      setZoom
    }
  }
  
  return injected
}
