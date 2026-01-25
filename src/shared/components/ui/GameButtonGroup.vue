<script setup lang="ts">
/**
 * GameButtonGroup component - A container for grouping buttons together.
 *
 * @example
 * ```vue
 * <GameButtonGroup>
 *   <GameButton>Button 1</GameButton>
 *   <GameButton>Button 2</GameButton>
 * </GameButtonGroup>
 * ```
 */
defineOptions({
  name: 'GameButtonGroup',
})
</script>

<template>
  <div class="game-button-group">
    <slot />
  </div>
</template>

<style scoped>
.game-button-group {
  display: inline-flex;
  align-items: stretch;
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  border-radius: 8px;
  padding: 2px;
  box-shadow: var(--game-shadow-base);
  gap: 2px;
  transition: all 0.2s ease;
}

/* Remove individual button borders and adjust border-radius for connected appearance */
.game-button-group :deep(.game-button) {
  margin: 0;
  border: none !important;
  border-width: 0 !important;
  border-color: transparent !important;
  border-radius: 0;
  box-shadow: none;
  position: relative;
  flex: 1 1 auto;
}

/* First button - rounded left only */
.game-button-group :deep(.game-button:first-child) {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

/* Last button - rounded right only */
.game-button-group :deep(.game-button:last-child) {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

/* Add divider between buttons (except last) */
.game-button-group :deep(.game-button:not(:last-child))::after {
  content: '';
  position: absolute;
  right: 0;
  top: 15%;
  bottom: 15%;
  width: 1px;
  background: var(--game-surface-border);
  opacity: 0.7;
  z-index: 1;
}

/* Selected button divider - keep subtle, no accent color since button is already highlighted */
.game-button-group :deep(.game-button-selected:not(:last-child))::after {
  background: var(--game-surface-border);
  opacity: 0.5;
  width: 1px;
}

/* Hover effect for group container */
.game-button-group:hover {
  border-color: var(--base-solid-primary);
  box-shadow:
    0 0 12px var(--game-accent-glow),
    var(--game-shadow-base);
}

/* Toggle buttons in group should be more compact */
.game-button-group :deep(.game-button-toggle) {
  min-width: auto;
  padding: 0.5rem 0.75rem;
}

/* Action buttons in group should maintain their size but no min-width */
.game-button-group :deep(.game-button-action) {
  min-width: auto;
}

/* Ensure selected buttons in group maintain their styling but no border */
.game-button-group :deep(.game-button-selected) {
  z-index: 2;
  border: none !important;
  border-width: 0 !important;
  border-color: transparent !important;
}

/* Override all border-related properties for selected buttons in groups - all states */
.game-button-group :deep(.game-button-selected:hover),
.game-button-group :deep(.game-button-selected:active),
.game-button-group :deep(.game-button-selected:focus),
.game-button-group :deep(.game-button-selected:focus-visible) {
  border: none !important;
  border-width: 0 !important;
  border-color: transparent !important;
  outline: none !important;
  outline-width: 0 !important;
}

/* Also override for toggle variant specifically - must be more specific than GameButton styles */
.game-button-group :deep(.game-button-toggle.game-button-selected),
.game-button-group :deep(.game-button-toggle.game-button-selected:hover),
.game-button-group :deep(.game-button-toggle.game-button-selected:active),
.game-button-group :deep(.game-button-toggle.game-button-selected:focus),
.game-button-group :deep(.game-button-toggle.game-button-selected:focus-visible) {
  border: none !important;
  border-width: 0 !important;
  border-color: transparent !important;
  outline: none !important;
  outline-width: 0 !important;
}

.game-button-group :deep(.game-button-toggle.game-button-selected:hover:not(.game-button-disabled)) {
  color: var(--game-text-contrast);
}

/* Override action variant selected state too */
.game-button-group :deep(.game-button-action.game-button-selected),
.game-button-group :deep(.game-button-action.game-button-selected:hover),
.game-button-group :deep(.game-button-action.game-button-selected:active) {
  border: none !important;
  border-width: 0 !important;
  border-color: transparent !important;
  outline: none !important;
}

.game-button-group :deep(.game-button-action.game-button-selected:hover:not(.game-button-disabled)) {
  color: var(--game-text-contrast);
}

/* Override hover transform for buttons in group to prevent layout shift */
.game-button-group :deep(.game-button:hover:not(.game-button-disabled)) {
  transform: none;
}

.game-button-group :deep(.game-button-selected:hover:not(.game-button-disabled)) {
  transform: none;
  color: var(--game-text-contrast);
}
</style>
