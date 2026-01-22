import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Page title for display in navigation or browser tab */
    title?: string
    /** Whether this route requires authentication */
    requiresAuth?: boolean
    /** Icon identifier for the route (e.g., 'mdi:monitor') */
    icon?: string
    /** Whether to show this route in navigation */
    showInNav?: boolean
  }
}
