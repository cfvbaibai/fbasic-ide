<script setup lang="ts">
/**
 * Dpad component - D-pad (directional pad) component for Nintendo controller.
 */
defineOptions({
  name: 'Dpad',
})

const emit = defineEmits<Emits>()

interface Emits {
  (type: 'dpadStart', direction: 'up' | 'down' | 'left' | 'right'): void
  (type: 'dpadStop', direction: 'up' | 'down' | 'left' | 'right'): void
}

const handleDpadStart = (direction: 'up' | 'down' | 'left' | 'right') => {
  emit('dpadStart', direction)
}

const handleDpadStop = (direction: 'up' | 'down' | 'left' | 'right') => {
  emit('dpadStop', direction)
}
</script>

<template>
  <div class="controller-section d-pad-section">
    <div class="manual-cross">
      <div class="dpad-grid">
        <div class="dpad-spacer"></div>
        <button
          class="manual-button up"
          @mousedown="handleDpadStart('up')"
          @mouseup="handleDpadStop('up')"
          @mouseleave="handleDpadStop('up')"
          tabindex="-1"
        >
          ↑
        </button>
        <div class="dpad-spacer"></div>
        <button
          class="manual-button left"
          @mousedown="handleDpadStart('left')"
          @mouseup="handleDpadStop('left')"
          @mouseleave="handleDpadStop('left')"
          tabindex="-1"
        >
          ←
        </button>
        <div class="dpad-center"></div>
        <button
          class="manual-button right"
          @mousedown="handleDpadStart('right')"
          @mouseup="handleDpadStop('right')"
          @mouseleave="handleDpadStop('right')"
          tabindex="-1"
        >
          →
        </button>
        <div class="dpad-spacer"></div>
        <button
          class="manual-button down"
          @mousedown="handleDpadStart('down')"
          @mouseup="handleDpadStop('down')"
          @mouseleave="handleDpadStop('down')"
          tabindex="-1"
        >
          ↓
        </button>
        <div class="dpad-spacer"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controller-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.section-label {
  font-size: 0.625rem;
  font-weight: var(--game-font-weight-bold);
  font-family: var(--game-font-family-heading);
  color: var(--game-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  line-height: 1.2;
}

.d-pad-section {
  flex: 0 0 auto;
  min-width: 75px;
}

/* Common surface gradient background */
.manual-cross,
.dpad-center {
  background: var(--game-surface-bg-gradient);
}

.manual-cross {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--game-radius-lg);
  padding: 0.5rem;
  box-shadow:
    inset 0 2px 4px var(--base-alpha-gray-00-40),
    0 1px 2px var(--base-alpha-gray-00-20);
  border: 1px solid var(--game-surface-border);
  width: 100%;
  min-width: 70px;
}

.dpad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 0.375rem;
  width: 100%;
  min-width: 60px;
  aspect-ratio: 1;
}

.dpad-spacer {
  display: block; /* Empty cells for proper cross layout */
}

.dpad-center {
  border-radius: var(--game-radius-sm);
  border: 1px solid var(--game-surface-border);
  box-shadow: inset 0 1px 2px var(--base-alpha-gray-00-30);
  opacity: 0.6;
}

/* D-Pad button base styles */
.manual-button {
  border: 2px solid var(--game-surface-border);
  background: var(--game-surface-bg-gradient);
  cursor: pointer;
  font-weight: var(--game-font-weight-bold);
  color: var(--game-text-primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 2px 4px var(--base-alpha-gray-00-30),
    inset 0 1px 2px var(--base-alpha-gray-100-10);
  outline: none;
  text-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 32px;
  min-width: 32px;
  border-radius: var(--game-radius-md);
  font-size: 18px;
  padding: 0;
}

/* Light theme: use regular gradient background for raised appearance */
.light-theme .manual-button {
  background: var(--game-surface-bg-gradient);
  color: var(--game-text-primary);
}

.manual-button.up {
  grid-column: 2;
  grid-row: 1;
}

.manual-button.down {
  grid-column: 2;
  grid-row: 3;
}

.manual-button.left {
  grid-column: 1;
  grid-row: 2;
}

.manual-button.right {
  grid-column: 3;
  grid-row: 2;
}

/* Hover state */
.manual-button:hover {
  transform: translateY(-2px) scale(1.05);
  border-color: var(--game-surface-border-hover);
  box-shadow:
    0 4px 8px var(--base-alpha-gray-00-40),
    0 0 12px var(--game-accent-glow),
    inset 0 1px 2px var(--base-alpha-gray-100-10);
  color: var(--base-solid-primary);
  text-shadow: none;
}

/* Active state */
.manual-button:active {
  transform: translateY(0) scale(0.98);
  border-color: var(--game-surface-border-hover);
  box-shadow:
    0 1px 2px var(--base-alpha-gray-00-40),
    inset 0 2px 4px var(--base-alpha-gray-00-30),
    var(--game-shadow-glow);
  color: var(--base-solid-primary);
}

.light-theme .manual-button:hover {
  color: var(--game-text-primary);
}

.light-theme .manual-button:active {
  color: var(--game-text-primary);
}
</style>
