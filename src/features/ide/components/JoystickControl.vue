<template>
  <div class="joystick-control" :class="{ collapsed: !isExpanded }">
    <div class="joystick-header" @click="isExpanded = !isExpanded">
      <h3>
        <GameIcon :icon="VideoPlay" size="small" />
        Joystick Control
      </h3>
      <div class="joystick-header-right">
        <div class="joystick-status">
          <span class="status-indicator" :class="{ active: isConnected }">
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
        <button 
          class="collapse-button" 
          :class="{ expanded: isExpanded }"
          @click.stop="isExpanded = !isExpanded"
        >
          <GameIcon :icon="isExpanded ? ArrowUp : ArrowDown" size="small" />
        </button>
      </div>
    </div>

    <!-- Joystick Controls and Status Display in same row -->
    <div class="joystick-content" :class="{ expanded: isExpanded }">
      <div class="joystick-panels-row">
      <!-- Joystick Controls -->
      <div class="control-grid">
        <div 
          v-for="joystickId in 2" 
          :key="joystickId - 1"
          class="manual-joystick"
        >
          <div class="manual-title">Joystick {{ joystickId - 1 }}</div>
          
          <!-- Nintendo Controller Layout -->
          <div class="nintendo-controller">
            <!-- D-Pad (Cross) on the left -->
            <div class="controller-section d-pad-section">
              <div class="section-label">D-PAD</div>
              <div class="manual-cross">
                <div class="dpad-grid">
                  <div class="dpad-spacer"></div>
                  <button 
                    class="manual-button up" 
                    @mousedown="startDpadHold(joystickId - 1, 'up')"
                    @mouseup="stopDpadHold(joystickId - 1, 'up')"
                    @mouseleave="stopDpadHold(joystickId - 1, 'up')"
                    tabindex="-1"
                  >
                    ↑
                  </button>
                  <div class="dpad-spacer"></div>
                  <button 
                    class="manual-button left" 
                    @mousedown="startDpadHold(joystickId - 1, 'left')"
                    @mouseup="stopDpadHold(joystickId - 1, 'left')"
                    @mouseleave="stopDpadHold(joystickId - 1, 'left')"
                    tabindex="-1"
                  >
                    ←
                  </button>
                  <div class="dpad-center"></div>
                  <button 
                    class="manual-button right" 
                    @mousedown="startDpadHold(joystickId - 1, 'right')"
                    @mouseup="stopDpadHold(joystickId - 1, 'right')"
                    @mouseleave="stopDpadHold(joystickId - 1, 'right')"
                    tabindex="-1"
                  >
                    →
                  </button>
                  <div class="dpad-spacer"></div>
                  <button 
                    class="manual-button down" 
                    @mousedown="startDpadHold(joystickId - 1, 'down')"
                    @mouseup="stopDpadHold(joystickId - 1, 'down')"
                    @mouseleave="stopDpadHold(joystickId - 1, 'down')"
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
                  :class="{ active: heldButtons[`${joystickId - 1}-select`] }"
                  @mousedown="toggleActionButton(joystickId - 1, 'select')"
                  tabindex="-1"
                >
                  SELECT
                </button>
                <button 
                  class="manual-action-button start" 
                  :class="{ active: heldButtons[`${joystickId - 1}-start`] }"
                  @mousedown="toggleActionButton(joystickId - 1, 'start')"
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
                  :class="{ active: heldButtons[`${joystickId - 1}-b`] }"
                  @mousedown="toggleActionButton(joystickId - 1, 'b')"
                  tabindex="-1"
                >
                  B
                </button>
                <button 
                  class="manual-action-button a" 
                  :class="{ active: heldButtons[`${joystickId - 1}-a`] }"
                  @mousedown="toggleActionButton(joystickId - 1, 'a')"
                  tabindex="-1"
                >
                  A
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Display Panels -->
      <div class="joystick-status-table">
        <div class="status-header">
          <div class="status-title">Joystick Status</div>
        </div>
        <GameTable 
          :data="joystickStatusData" 
          :columns="tableColumns"
          size="small"
          :show-header="true"
          :border="false"
          :stripe="false"
          :highlight-row="true"
        >
          <template #cell-id="{ row }">
            <span class="cell-id">{{ row.id }}</span>
          </template>
          <template #cell-stick="{ row }">
            <span :class="{ 'flashing-cell': flashingCells[`stick-${row.id}`] }">
              {{ row.stick }}
            </span>
          </template>
          <template #cell-strig="{ row }">
            <span :class="{ 'flashing-cell': flashingCells[`strig-${row.id}`] }">
              {{ row.strig }}
            </span>
          </template>
        </GameTable>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { VideoPlay, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { GameIcon, GameTable } from '../../../shared/components/ui'

interface Column {
  prop: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  formatter?: (row: any, column: Column, cellValue: any) => any
}

// Props
interface Props {
  sendStickEvent?: (joystickId: number, state: number) => void
  sendStrigEvent?: (joystickId: number, state: number) => void
}

const props = defineProps<Props>()

// Reactive state
const isConnected = ref(false)
const stickStates = ref([0, 0, 0, 0]) // STICK values for joysticks 0-3
const trigStates = ref([0, 0, 0, 0]) // STRIG values for joysticks 0-3

// Track which buttons are currently "held" (toggle state)
const heldButtons = ref<Record<string, boolean>>({})

// Track which D-pad buttons are being held for periodic triggering
const heldDpadButtons = ref<Record<string, NodeJS.Timeout | null>>({})
const dpadRepeatInterval = 100 // Repeat every 100ms when held

// Track if we're actively using manual controls to prevent polling interference
const usingManualControls = ref(false)
const actionButtonActive = ref(false)

// Track flashing state for table cells
const flashingCells = ref<Record<string, boolean>>({})

// Track STRIG reset timers
const strigResetTimers = ref<Record<number, NodeJS.Timeout | null>>({})

// Collapsible state
const isExpanded = ref(true)

// Computed property for table data
const joystickStatusData = computed(() => {
  return [
    {
      id: 0,
      stick: stickStates.value[0] || 0,
      strig: trigStates.value[0] || 0
    },
    {
      id: 1,
      stick: stickStates.value[1] || 0,
      strig: trigStates.value[1] || 0
    }
  ]
})

// Table columns configuration
const tableColumns: Column[] = [
  {
    prop: 'id',
    label: 'ID',
    width: 40,
    align: 'center'
  },
  {
    prop: 'stick',
    label: 'STICK',
    width: 60,
    align: 'center'
  },
  {
    prop: 'strig',
    label: 'STRIG',
    width: 60,
    align: 'center'
  }
]

// Polling interval
let pollingInterval: number | null = null

// Helper function to flash a table cell
const flashCell = (cellKey: string) => {
  flashingCells.value[cellKey] = true
  setTimeout(() => {
    flashingCells.value[cellKey] = false
  }, 200) // Flash for 200ms
}

// Helper function to reset STRIG value after delay
const resetStrigValue = (joystickId: number) => {
  // Clear existing timer if any
  if (strigResetTimers.value[joystickId]) {
    clearTimeout(strigResetTimers.value[joystickId]!)
  }
  
  // Set new timer to reset STRIG value after 100ms
  strigResetTimers.value[joystickId] = setTimeout(() => {
    trigStates.value[joystickId] = 0
    strigResetTimers.value[joystickId] = null
  }, 300)
}

// D-pad hold and repeat functions
const startDpadHold = async (joystickId: number, direction: string) => {
  const buttonKey = `${joystickId}-${direction}`
  
  // Set manual controls flag to prevent polling interference
  usingManualControls.value = true
  
  // Map direction names to STICK values
  const directionMap: Record<string, number> = {
    'up': 8,
    'down': 4,
    'left': 2,
    'right': 1
  }
  
  const stickValue = directionMap[direction] || 0
  
  // Send STICK event to service worker
  if (props.sendStickEvent && stickValue > 0) {
    console.log('🎮 [JOYSTICK_CONTROL] Sending STICK event:', { joystickId, direction, stickValue })
    props.sendStickEvent(joystickId, stickValue)
    
    // Update local state for display
    stickStates.value[joystickId] = stickValue
    
    // Flash the STICK cell
    flashCell(`stick-${joystickId}`)
  }
  
  // Clear any existing interval for this button
  if (heldDpadButtons.value[buttonKey]) {
    clearInterval(heldDpadButtons.value[buttonKey]!)
  }
  
  // Set up repeat interval
  heldDpadButtons.value[buttonKey] = setInterval(() => {
    if (props.sendStickEvent && stickValue > 0) {
      console.log('🎮 [JOYSTICK_CONTROL] Repeating STICK event:', { joystickId, direction, stickValue })
      props.sendStickEvent(joystickId, stickValue)
    }
  }, dpadRepeatInterval)
}

const stopDpadHold = async (joystickId: number, direction: string) => {
  const buttonKey = `${joystickId}-${direction}`
  
  // Clear the repeat interval
  if (heldDpadButtons.value[buttonKey]) {
    clearInterval(heldDpadButtons.value[buttonKey]!)
    heldDpadButtons.value[buttonKey] = null
  }
  
  // Send STICK release event (value 0)
  if (props.sendStickEvent) {
    console.log('🎮 [JOYSTICK_CONTROL] Sending STICK release event:', { joystickId, direction, stickValue: 0 })
    props.sendStickEvent(joystickId, 0)
    
    // Update local state for display
    stickStates.value[joystickId] = 0
    
    // Flash the STICK cell
    flashCell(`stick-${joystickId}`)
  }
  
  // Check if any D-pad buttons are still being held
  const anyDpadHeld = Object.values(heldDpadButtons.value).some(interval => interval !== null)
  if (!anyDpadHeld) {
    // No D-pad buttons are being held, allow polling to resume
    usingManualControls.value = false
  }
}

// Toggle action button (pulse effect - only send pressed event)
const toggleActionButton = async (joystickId: number, button: string) => {
  const buttonKey = `${joystickId}-${button}`
  
  // Prevent multiple triggers if button is already active
  if (actionButtonActive.value) {
    return
  }
  
  // Set action button flag to prevent polling interference
  actionButtonActive.value = true
  
  // Set button to active state
  heldButtons.value[buttonKey] = true
  
  // Map button names to STRIG values
  const buttonMap: Record<string, number> = {
    'select': 2,
    'start': 1,
    'b': 4,
    'a': 8
  }
  
  const strigValue = buttonMap[button] || 0
  
  // Send STRIG event to service worker
  if (props.sendStrigEvent && strigValue > 0) {
    console.log('🎮 [JOYSTICK_CONTROL] Sending STRIG event:', { joystickId, button, strigValue })
    props.sendStrigEvent(joystickId, strigValue)
    
    // Update local state for display
    trigStates.value[joystickId] = strigValue
    
    // Flash the STRIG cell
    flashCell(`strig-${joystickId}`)
    
    // Set up timer to reset STRIG value after 100ms
    resetStrigValue(joystickId)
  }
  
  // Reset button state immediately after sending pressed event
  setTimeout(async () => {
    heldButtons.value[buttonKey] = false
    
    // Allow polling to resume after action button is processed
    actionButtonActive.value = false
  }, 50) // Short delay to ensure pressed event is processed
}

onUnmounted(() => {
  // Clean up all D-pad intervals
  for (const [buttonKey, interval] of Object.entries(heldDpadButtons.value)) {
    if (interval) {
      clearInterval(interval)
    }
  }
  heldDpadButtons.value = {}
})
</script>

<style scoped>
.joystick-control {
  padding: 1rem;
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 2px solid var(--game-card-border);
  border-radius: 12px;
  margin: 0 0 1rem 0;
  box-shadow: 
    var(--game-shadow-base),
    0 0 20px rgba(0, 255, 136, 0.1),
    inset 0 0 30px rgba(0, 255, 136, 0.02);
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.joystick-control::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-color) 25%,
    var(--game-accent-glow) 50%, 
    var(--game-accent-color) 75%,
    transparent 100%
  );
  opacity: 0.6;
  z-index: 1;
  animation: borderShimmer 2.5s ease-in-out infinite;
  box-shadow: 0 0 10px var(--game-accent-glow);
  border-radius: 12px 12px 0 0;
}

.joystick-control:hover {
  border-color: var(--game-accent-color);
  box-shadow: 
    var(--game-shadow-hover),
    0 0 30px rgba(0, 255, 136, 0.3),
    0 0 60px rgba(0, 255, 136, 0.15),
    inset 0 0 40px rgba(0, 255, 136, 0.05);
  transform: translateY(-2px);
}

.joystick-control:hover::before {
  opacity: 1;
  height: 4px;
  box-shadow: 0 0 20px var(--game-accent-glow), 0 0 40px rgba(0, 255, 136, 0.4);
}

.joystick-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--game-card-border);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  position: relative;
}

.joystick-header:hover {
  border-bottom-color: var(--game-accent-color);
}

.joystick-header:hover h3 {
  text-shadow: 
    0 0 12px var(--game-accent-glow),
    0 0 20px rgba(0, 255, 136, 0.5);
  color: var(--game-accent-color);
}

.joystick-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.joystick-header h3 {
  margin: 0;
  color: var(--game-text-primary);
  font-size: 1.1rem;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--game-font-family);
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  color: var(--game-text-secondary);
  border: 1px solid var(--game-card-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-indicator.active {
  background: linear-gradient(135deg, var(--el-color-success) 0%, var(--el-color-success-dark-2) 100%);
  color: white;
  border-color: var(--el-color-success);
  box-shadow: 
    0 0 12px rgba(103, 194, 58, 0.4),
    0 2px 6px rgba(0, 0, 0, 0.3);
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
}

.collapse-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 2px solid var(--game-card-border);
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
  outline: none;
  position: relative;
  overflow: hidden;
}

.collapse-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, var(--game-accent-glow) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
}

.collapse-button:hover {
  border-color: var(--game-accent-color);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 0 12px var(--game-accent-glow),
    inset 0 1px 2px rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

.collapse-button:hover::before {
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.collapse-button:active {
  transform: scale(0.95);
}

.collapse-button.expanded {
  background: linear-gradient(135deg, var(--game-accent-color) 0%, var(--game-accent-glow) 100%);
  border-color: var(--game-accent-color);
  box-shadow: 
    0 0 16px var(--game-accent-glow),
    0 2px 6px rgba(0, 0, 0, 0.3);
}

.collapse-button :deep(.game-icon) {
  color: var(--game-text-primary);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 4px rgba(0, 255, 136, 0.3));
  transform: rotate(0deg) scale(1);
}

.collapse-button:hover :deep(.game-icon) {
  color: var(--game-accent-color);
  filter: drop-shadow(0 0 8px var(--game-accent-glow)) 
          drop-shadow(0 0 16px rgba(0, 255, 136, 0.5));
  transform: rotate(180deg) scale(1.15);
}

.collapse-button.expanded :deep(.game-icon) {
  color: var(--game-accent-color);
  filter: drop-shadow(0 0 8px var(--game-accent-glow)) 
          drop-shadow(0 0 16px rgba(0, 255, 136, 0.5));
  transform: rotate(0deg) scale(1.1);
}

.collapse-button:not(.expanded) :deep(.game-icon) {
  transform: rotate(180deg) scale(1.1);
}

.joystick-content {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: 
    max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s,
    transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s,
    margin-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(-20px) scale(0.98);
  margin-top: -1rem;
  filter: blur(2px);
}

.joystick-content.expanded {
  max-height: 2000px;
  opacity: 1;
  transform: translateY(0) scale(1);
  margin-top: 0;
  filter: blur(0);
  transition: 
    max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s,
    transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s,
    margin-top 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s,
    filter 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
}

.joystick-control.collapsed {
  margin-bottom: 0.5rem;
}

.joystick-control.collapsed .joystick-header {
  margin-bottom: 0;
  border-bottom: none;
}

.joystick-panels-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.joystick-status-table {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border: 2px solid var(--game-card-border);
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 
    var(--game-shadow-base),
    0 0 15px rgba(0, 255, 136, 0.08),
    inset 0 1px 2px rgba(0, 0, 0, 0.2);
  flex: 0 0 auto;
  min-width: 160px;
  position: relative;
  transition: all 0.3s ease;
}

.joystick-status-table::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-color) 25%,
    var(--game-accent-glow) 50%, 
    var(--game-accent-color) 75%,
    transparent 100%
  );
  opacity: 0.6;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 0 8px var(--game-accent-glow);
}

.joystick-status-table:hover {
  border-color: var(--game-accent-color);
  box-shadow: 
    var(--game-shadow-hover),
    0 0 20px rgba(0, 255, 136, 0.15),
    inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.joystick-status-table:hover::before {
  opacity: 0.9;
  box-shadow: 0 0 12px var(--game-accent-glow), 0 0 24px rgba(0, 255, 136, 0.3);
}

.status-header {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--game-card-border);
  position: relative;
}

.status-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--game-accent-glow) 50%, 
    transparent 100%
  );
  opacity: 0.5;
}

.status-title {
  font-size: 0.9rem;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  color: var(--game-text-primary);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* GameTable custom styles for Joystick Status */
.joystick-status-table :deep(.game-table-wrapper) {
  border-radius: 6px;
  overflow: hidden;
}

.joystick-status-table :deep(.cell-id) {
  color: var(--game-accent-color);
  text-shadow: 0 0 4px var(--game-accent-glow);
  font-weight: 700;
}


.control-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  justify-content: start;
}

.manual-joystick {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-radius: 10px;
  padding: 0.75rem;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 2px 6px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--game-card-border);
  position: relative;
  transition: all 0.3s ease;
  width: 100%;
  min-width: fit-content;
  max-width: 100%;
  box-sizing: border-box;
}

.manual-joystick:hover {
  border-color: var(--game-accent-color);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 12px rgba(0, 255, 136, 0.2);
}

.manual-title {
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--game-accent-color);
  text-align: center;
  font-size: 0.875rem;
  font-family: var(--game-font-family-heading);
  text-shadow: 0 0 8px var(--game-accent-glow);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--game-card-border);
}

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
  font-weight: 700;
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

.select-start-section {
  flex: 0 0 auto;
  min-width: 90px;
}

.action-buttons-section {
  flex: 0 0 auto;
  min-width: 70px;
}

.select-start-buttons {
  display: flex;
  flex-direction: row;
  gap: 0.375rem;
  justify-content: center;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.manual-cross {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    0 1px 2px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--game-card-border);
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
  /* Empty cells for proper cross layout */
}

.dpad-center {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-radius: 4px;
  border: 1px solid var(--game-card-border);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
  opacity: 0.6;
}

.manual-button {
  width: 100%;
  height: 100%;
  min-height: 32px;
  min-width: 32px;
  border: 2px solid var(--game-card-border);
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  color: var(--game-text-primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
  font-size: 18px;
  outline: none;
  font-family: var(--game-font-family);
  text-shadow: 0 0 4px rgba(0, 255, 136, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
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

.manual-button:hover {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-color: var(--game-accent-color);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 0 12px var(--game-accent-glow),
    inset 0 1px 2px rgba(255, 255, 255, 0.15);
  color: var(--game-accent-color);
  text-shadow: 0 0 8px var(--game-accent-glow);
}

.manual-button:active {
  background: linear-gradient(135deg, var(--game-card-bg-end) 0%, var(--game-card-bg-start) 100%);
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 20px var(--game-accent-glow);
  border-color: var(--game-accent-color);
}


.manual-action-button {
  border: 2px solid var(--game-card-border);
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  color: var(--game-text-primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
  text-align: center;
  outline: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 0 4px rgba(0, 255, 136, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 0.875rem;
  min-width: 32px;
  min-height: 32px;
  border-radius: 50%;
  aspect-ratio: 1;
}

.manual-action-button:hover {
  background: linear-gradient(135deg, var(--game-card-bg-start) 0%, var(--game-card-bg-end) 100%);
  border-color: var(--el-color-warning);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 0 12px rgba(230, 162, 60, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.15);
  color: var(--el-color-warning);
  text-shadow: 0 0 8px rgba(230, 162, 60, 0.6);
}

.manual-action-button:active {
  background: linear-gradient(135deg, var(--game-card-bg-end) 0%, var(--game-card-bg-start) 100%);
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(230, 162, 60, 0.5);
  border-color: var(--el-color-warning);
}

.manual-action-button.active {
  background: linear-gradient(135deg, var(--el-color-success) 0%, var(--el-color-success-dark-2) 100%);
  color: white;
  border-color: var(--el-color-success);
  box-shadow: 
    0 0 16px rgba(103, 194, 58, 0.6),
    0 2px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

/* Flashing cell animation */
.flashing-cell {
  animation: flash 0.3s ease-in-out;
}

@keyframes flash {
  0% {
    background-color: transparent;
    color: var(--game-text-primary);
  }
  50% {
    background: linear-gradient(135deg, var(--game-accent-color) 0%, var(--game-accent-glow) 100%);
    color: white;
    font-weight: 700;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    box-shadow: 
      0 0 12px var(--game-accent-glow),
      inset 0 1px 2px rgba(255, 255, 255, 0.2);
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  }
  100% {
    background-color: transparent;
    color: var(--game-text-primary);
  }
}

/* Glowing border animations */
@keyframes borderShimmer {
  0%, 100% {
    background-position: -200% center;
    opacity: 0.6;
  }
  50% {
    background-position: 200% center;
    opacity: 0.9;
  }
}
</style>
