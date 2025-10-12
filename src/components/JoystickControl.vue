<template>
  <div class="joystick-control">
    <div class="joystick-header">
      <h3>Joystick Control</h3>
      <div class="joystick-status">
        <span class="status-indicator" :class="{ active: isConnected }">
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
    </div>

    <!-- Manual Control Panel and Status Display in same row -->
    <div class="joystick-panels-row">
      <!-- Manual Control Panel -->
      <div class="manual-control">
        <h4>🎮 Manual Control (Click to Test)</h4>
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
                  <button 
                    class="manual-button up" 
                    @mousedown="startDpadHold(joystickId - 1, 'up')"
                    @mouseup="stopDpadHold(joystickId - 1, 'up')"
                    @mouseleave="stopDpadHold(joystickId - 1, 'up')"
                    tabindex="-1"
                  >
                    ↑
                  </button>
                  <div class="manual-cross-row">
                    <button 
                      class="manual-button left" 
                      @mousedown="startDpadHold(joystickId - 1, 'left')"
                      @mouseup="stopDpadHold(joystickId - 1, 'left')"
                      @mouseleave="stopDpadHold(joystickId - 1, 'left')"
                      tabindex="-1"
                    >
                      ←
                    </button>
                    <button 
                      class="manual-button right" 
                      @mousedown="startDpadHold(joystickId - 1, 'right')"
                      @mouseup="stopDpadHold(joystickId - 1, 'right')"
                      @mouseleave="stopDpadHold(joystickId - 1, 'right')"
                      tabindex="-1"
                    >
                      →
                    </button>
                  </div>
                  <button 
                    class="manual-button down" 
                    @mousedown="startDpadHold(joystickId - 1, 'down')"
                    @mouseup="stopDpadHold(joystickId - 1, 'down')"
                    @mouseleave="stopDpadHold(joystickId - 1, 'down')"
                    tabindex="-1"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <!-- Select/Start and B/A buttons combined on the right -->
              <div class="controller-section combined-buttons-section">
                <div class="section-label">CONTROLS</div>
                <div class="combined-buttons">
                  <!-- Select/Start buttons on top -->
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
                  <!-- B/A buttons below -->
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
        </div>
      </div>

      <!-- Status Display Panels -->
      <div class="joystick-status-table">
        <div class="status-header">
          <div class="status-title">Joystick Status</div>
        </div>
        <el-table 
          :data="joystickStatusData" 
          size="small" 
          :show-header="true"
          :border="false"
          :stripe="false"
          class="status-table"
        >
          <el-table-column prop="id" label="ID" width="30" align="center" />
          <el-table-column prop="stick" label="STICK" width="50" align="center">
            <template #default="{ row }">
              <span :class="{ 'flashing-cell': flashingCells[`stick-${row.id}`] }">
                {{ row.stick }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="strig" label="STRIG" width="50" align="center">
            <template #default="{ row }">
              <span :class="{ 'flashing-cell': flashingCells[`strig-${row.id}`] }">
                {{ row.strig }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

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
  padding: 6px;
  background: #f5f5f5;
  border-radius: 4px;
  margin: 5px 0;
}

.joystick-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.joystick-header h3 {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: bold;
  background: #ccc;
  color: #666;
}

.status-indicator.active {
  background: #4caf50;
  color: white;
}

.joystick-panels-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.joystick-status-table {
  background: white;
  border-radius: 4px;
  padding: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  flex: 0 0 auto;
  min-width: 130px;
}

.status-header {
  margin-bottom: 4px;
}

.status-title {
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.status-table {
  font-size: 0.7rem;
}

.status-table :deep(.el-table__header) {
  font-size: 0.7rem;
}

.status-table :deep(.el-table__body) {
  font-size: 0.7rem;
}

.status-table :deep(.el-table td) {
  padding: 4px 0;
}

.status-table :deep(.el-table th) {
  padding: 4px 0;
  background: #f5f5f5;
}

.manual-control {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  padding: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  margin-bottom: 0;
  flex: 0 0 auto;
}

.manual-control h4 {
  margin: 0 0 6px 0;
  color: white;
  text-align: center;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.control-grid {
  display: grid;
  grid-template-columns: 200px 200px;
  gap: 8px;
  justify-content: start;
}

.manual-joystick {
  background: linear-gradient(145deg, #f0f0f0, #e0e0e0);
  border-radius: 8px;
  padding: 6px;
  box-shadow: inset 2px 2px 4px rgba(0,0,0,0.1), 
              inset -2px -2px 4px rgba(255,255,255,0.8);
  border: 2px solid #d0d0d0;
}

.manual-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #333;
  text-align: center;
  font-size: 0.8rem;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
}

/* Nintendo Controller Layout */
.nintendo-controller {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 4px;
  width: 150px;
}

.controller-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.section-label {
  font-size: 8px;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.d-pad-section {
  flex: 0 0 60px;
}

.combined-buttons-section {
  flex: 0 0 80px;
}

.combined-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.select-start-buttons {
  display: flex;
  flex-direction: row;
  gap: 3px;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 3px;
}

.manual-cross {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  background: linear-gradient(145deg, #e8e8e8, #d0d0d0);
  border-radius: 6px;
  padding: 4px;
  box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2);
}

.manual-cross-row {
  display: flex;
  gap: 2px;
}

.manual-button {
  width: 28px;
  height: 28px;
  border: 2px solid #c0c0c0;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: #555;
  transition: all 0.1s ease;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.2), 
              inset 1px 1px 2px rgba(255,255,255,0.8);
  font-size: 12px;
  outline: none; /* Remove focus outline */
}

.manual-button:hover {
  background: linear-gradient(145deg, #f8f9fa, #e8e8e8);
  border-color: #4caf50;
  transform: translateY(-1px);
  box-shadow: 3px 3px 6px rgba(0,0,0,0.25), 
              inset 1px 1px 2px rgba(255,255,255,0.9);
}

.manual-button:active {
  background: linear-gradient(145deg, #e0e0e0, #d0d0d0);
  transform: translateY(1px);
  box-shadow: 1px 1px 2px rgba(0,0,0,0.3), 
              inset 2px 2px 4px rgba(0,0,0,0.1);
}


.manual-action-button {
  padding: 4px 6px;
  border: 2px solid #c0c0c0;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  border-radius: 6px;
  cursor: pointer;
  font-size: 9px;
  font-weight: bold;
  color: #555;
  transition: all 0.1s ease;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.2), 
              inset 1px 1px 2px rgba(255,255,255,0.8);
  min-width: 35px;
  text-align: center;
  outline: none;
}

.manual-action-button:hover {
  background: linear-gradient(145deg, #f8f9fa, #e8e8e8);
  border-color: #ff9800;
  transform: translateY(-1px);
  box-shadow: 3px 3px 6px rgba(0,0,0,0.25), 
              inset 1px 1px 2px rgba(255,255,255,0.9);
}

.manual-action-button:active {
  background: linear-gradient(145deg, #e0e0e0, #d0d0d0);
  transform: translateY(1px);
  box-shadow: 1px 1px 2px rgba(0,0,0,0.3), 
              inset 2px 2px 4px rgba(0,0,0,0.1);
}

.manual-action-button.active {
  background: linear-gradient(145deg, #4caf50, #45a049);
  color: white;
  border-color: #4caf50;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.2);
}

/* Flashing cell animation */
.flashing-cell {
  animation: flash 0.2s ease-in-out;
}

@keyframes flash {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: white;
    color: #333;
    font-weight: bold;
    border-radius: 4px;
    padding: 4px 8px;
  }
  100% {
    background-color: transparent;
  }
}
</style>
