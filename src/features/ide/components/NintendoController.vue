<template>
  <div class="nintendo-controller">
    <!-- D-Pad (Cross) on the left -->
    <div class="controller-section d-pad-section">
      <div class="section-label">D-PAD</div>
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

    <!-- Select/Start buttons in the middle -->
    <div class="controller-section select-start-section">
      <div class="section-label">SELECT / START</div>
      <div class="select-start-buttons">
        <button 
          class="manual-action-button select" 
          :class="{ active: heldButtons[`${joystickId}-select`] }"
          @mousedown="handleActionButton('select')"
          tabindex="-1"
        >
          SELECT
        </button>
        <button 
          class="manual-action-button start" 
          :class="{ active: heldButtons[`${joystickId}-start`] }"
          @mousedown="handleActionButton('start')"
          tabindex="-1"
        >
          START
        </button>
      </div>
    </div>

    <!-- B/A buttons on the right -->
    <div class="controller-section action-buttons-section">
      <div class="section-label">A / B</div>
      <div class="action-buttons">
        <button 
          class="manual-action-button b" 
          :class="{ active: heldButtons[`${joystickId}-b`] }"
          @mousedown="handleActionButton('b')"
          tabindex="-1"
        >
          B
        </button>
        <button 
          class="manual-action-button a" 
          :class="{ active: heldButtons[`${joystickId}-a`] }"
          @mousedown="handleActionButton('a')"
          tabindex="-1"
        >
          A
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  joystickId: number
  heldButtons: Record<string, boolean>
}

interface Emits {
  (e: 'dpad-start', direction: 'up' | 'down' | 'left' | 'right'): void
  (e: 'dpad-stop', direction: 'up' | 'down' | 'left' | 'right'): void
  (e: 'action-button', button: 'select' | 'start' | 'a' | 'b'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleDpadStart = (direction: 'up' | 'down' | 'left' | 'right') => {
  emit('dpad-start', direction)
}

const handleDpadStop = (direction: 'up' | 'down' | 'left' | 'right') => {
  emit('dpad-stop', direction)
}

const handleActionButton = (button: 'select' | 'start' | 'a' | 'b') => {
  emit('action-button', button)
}
</script>

<style scoped>
/* Nintendo Controller Layout */
.nintendo-controller {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem;
  width: 100%;
  min-width: fit-content;
}

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

/* Section width variants */
.d-pad-section,
.select-start-section,
.action-buttons-section {
  flex: 0 0 auto;
}

.d-pad-section {
  min-width: 75px;
}

.select-start-section {
  min-width: 90px;
}

.action-buttons-section {
  min-width: 70px;
}

/* Button container layouts */
.select-start-buttons,
.action-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.select-start-buttons {
  gap: 0.375rem;
}

.action-buttons {
  gap: 0.5rem;
  align-items: center;
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
    inset 0 2px 4px var(--game-color-black-40),
    0 1px 2px var(--game-color-black-20);
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
  box-shadow: inset 0 1px 2px var(--game-color-black-30);
  opacity: 0.6;
}

/* Common button base styles */
.manual-button,
.manual-action-button {
  border: 2px solid var(--game-surface-border);
  background: var(--game-surface-bg-gradient);
  cursor: pointer;
  font-weight: var(--game-font-weight-bold);
  color: var(--game-text-primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 4px var(--game-color-black-30),
    inset 0 1px 2px var(--game-color-white-10);
  outline: none;
  text-shadow: 0 0 4px var(--game-accent-glow);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* D-Pad button specific styles */
.manual-button {
  width: 100%;
  height: 100%;
  min-height: 32px;
  min-width: 32px;
  border-radius: var(--game-radius-md);
  font-size: 18px;
  padding: 0;
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

/* Action button specific styles */
.manual-action-button {
  border-radius: var(--game-radius-lg);
  font-family: var(--game-font-family-heading);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.manual-action-button.select,
.manual-action-button.start {
  padding: 0.375rem 0.5rem;
  font-size: 0.65rem;
  min-width: 38px;
}

.manual-action-button.b,
.manual-action-button.a {
  padding: 0.5rem;
  font-size: var(--game-font-size-sm);
  min-width: 32px;
  min-height: 32px;
  border-radius: 50%;
  aspect-ratio: 1;
}

/* Common hover state */
.manual-button:hover,
.manual-action-button:hover {
  background: var(--game-surface-bg-gradient);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 4px 8px var(--game-color-black-40),
    inset 0 1px 2px var(--game-color-white-15);
}

.manual-button:hover {
  border-color: var(--game-surface-border-hover);
  box-shadow: 
    0 4px 8px var(--game-color-black-40),
    0 0 12px var(--game-accent-glow),
    inset 0 1px 2px var(--game-color-white-15);
  color: var(--game-accent-color);
  text-shadow: 0 0 8px var(--game-accent-glow);
}

.manual-action-button:hover {
  border-color: var(--semantic-warning);
  box-shadow: 
    0 4px 8px var(--game-color-black-40),
    0 0 12px var(--semantic-warning-40),
    inset 0 1px 2px var(--game-color-white-15);
  color: var(--semantic-warning);
  text-shadow: 0 0 8px var(--semantic-warning-60);
}

/* Common active state */
.manual-button:active,
.manual-action-button:active {
  background: linear-gradient(135deg, var(--game-surface-bg-end) 0%, var(--game-surface-bg-start) 100%);
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 1px 2px var(--game-color-black-40),
    inset 0 2px 4px var(--game-color-black-30);
}

.manual-button:active {
  box-shadow: 
    0 1px 2px var(--game-color-black-40),
    inset 0 2px 4px var(--game-color-black-30),
    var(--game-shadow-glow);
  border-color: var(--game-surface-border-hover);
}

.manual-action-button:active {
  box-shadow: 
    0 1px 2px var(--game-color-black-40),
    inset 0 2px 4px var(--game-color-black-30),
    0 0 20px var(--semantic-warning-50);
  border-color: var(--semantic-warning);
}

/* Active state for held buttons */
.manual-action-button.active {
  background: linear-gradient(135deg, var(--semantic-success) 0%, var(--semantic-success-dark) 100%);
  color: var(--game-color-white);
  border-color: var(--semantic-success);
  box-shadow: 
    0 0 16px var(--semantic-success-60),
    0 2px 6px var(--game-color-black-30),
    inset 0 1px 2px var(--game-color-white-20);
  text-shadow: 0 0 8px var(--game-color-white-50);
  transform: scale(1.05);
}
</style>
