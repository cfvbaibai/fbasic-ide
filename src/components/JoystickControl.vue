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

    <div class="joystick-grid">
      <div 
        v-for="joystickId in 4" 
        :key="joystickId - 1"
        class="joystick-panel"
      >
        <div class="joystick-title">Joystick {{ joystickId - 1 }}</div>
        
        <!-- STICK Display -->
        <div class="stick-section">
          <div class="section-title">STICK({{ joystickId - 1 }})</div>
          <div class="stick-display">
            <div class="cross-buttons">
              <div class="cross-button up" :class="{ active: (stickStates[joystickId - 1] || 0) & 8 }">
                ↑
              </div>
              <div class="cross-button-row">
                <div class="cross-button left" :class="{ active: (stickStates[joystickId - 1] || 0) & 2 }">
                  ←
                </div>
                <div class="cross-button center">
                  {{ joystickId - 1 }}
                </div>
                <div class="cross-button right" :class="{ active: (stickStates[joystickId - 1] || 0) & 1 }">
                  →
                </div>
              </div>
              <div class="cross-button down" :class="{ active: (stickStates[joystickId - 1] || 0) & 4 }">
                ↓
              </div>
            </div>
            <div class="stick-value">
              Value: {{ stickStates[joystickId - 1] }}
            </div>
          </div>
        </div>

        <!-- STRIG Display -->
        <div class="strig-section">
          <div class="section-title">STRIG({{ joystickId - 1 }})</div>
          <div class="strig-display">
            <div class="action-buttons">
              <div class="action-button start" :class="{ active: (trigStates[joystickId - 1] || 0) & 1 }">
                START
              </div>
              <div class="action-button select" :class="{ active: (trigStates[joystickId - 1] || 0) & 2 }">
                SELECT
              </div>
              <div class="action-button b" :class="{ active: (trigStates[joystickId - 1] || 0) & 4 }">
                B
              </div>
              <div class="action-button a" :class="{ active: (trigStates[joystickId - 1] || 0) & 8 }">
                A
              </div>
            </div>
            <div class="strig-value">
              Value: {{ trigStates[joystickId - 1] }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual Control Panel -->
    <div class="manual-control">
      <h4>Manual Control (for testing)</h4>
      <div class="control-grid">
        <div 
          v-for="joystickId in 4" 
          :key="joystickId - 1"
          class="manual-joystick"
        >
          <div class="manual-title">Joystick {{ joystickId - 1 }}</div>
          
          <!-- Manual STICK Controls -->
          <div class="manual-stick">
            <div class="manual-cross">
              <button 
                class="manual-button up" 
                @mousedown="setStickButton(joystickId - 1, 'up', true)"
                @mouseup="setStickButton(joystickId - 1, 'up', false)"
                @mouseleave="setStickButton(joystickId - 1, 'up', false)"
              >
                ↑
              </button>
              <div class="manual-cross-row">
                <button 
                  class="manual-button left" 
                  @mousedown="setStickButton(joystickId - 1, 'left', true)"
                  @mouseup="setStickButton(joystickId - 1, 'left', false)"
                  @mouseleave="setStickButton(joystickId - 1, 'left', false)"
                >
                  ←
                </button>
                <button 
                  class="manual-button right" 
                  @mousedown="setStickButton(joystickId - 1, 'right', true)"
                  @mouseup="setStickButton(joystickId - 1, 'right', false)"
                  @mouseleave="setStickButton(joystickId - 1, 'right', false)"
                >
                  →
                </button>
              </div>
              <button 
                class="manual-button down" 
                @mousedown="setStickButton(joystickId - 1, 'down', true)"
                @mouseup="setStickButton(joystickId - 1, 'down', false)"
                @mouseleave="setStickButton(joystickId - 1, 'down', false)"
              >
                ↓
              </button>
            </div>
          </div>

          <!-- Manual STRIG Controls -->
          <div class="manual-strig">
            <div class="manual-action-buttons">
              <button 
                class="manual-action-button start" 
                @mousedown="setTrigButton(joystickId - 1, 'start', true)"
                @mouseup="setTrigButton(joystickId - 1, 'start', false)"
                @mouseleave="setTrigButton(joystickId - 1, 'start', false)"
              >
                START
              </button>
              <button 
                class="manual-action-button select" 
                @mousedown="setTrigButton(joystickId - 1, 'select', true)"
                @mouseup="setTrigButton(joystickId - 1, 'select', false)"
                @mouseleave="setTrigButton(joystickId - 1, 'select', false)"
              >
                SELECT
              </button>
              <button 
                class="manual-action-button b" 
                @mousedown="setTrigButton(joystickId - 1, 'b', true)"
                @mouseup="setTrigButton(joystickId - 1, 'b', false)"
                @mouseleave="setTrigButton(joystickId - 1, 'b', false)"
              >
                B
              </button>
              <button 
                class="manual-action-button a" 
                @mousedown="setTrigButton(joystickId - 1, 'a', true)"
                @mouseup="setTrigButton(joystickId - 1, 'a', false)"
                @mouseleave="setTrigButton(joystickId - 1, 'a', false)"
              >
                A
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  deviceAdapter?: any
}

const props = defineProps<Props>()

// Reactive state
const isConnected = ref(false)
const stickStates = ref([0, 0, 0, 0]) // STICK values for joysticks 0-3
const trigStates = ref([0, 0, 0, 0]) // STRIG values for joysticks 0-3

// Polling interval
let pollingInterval: number | null = null

// Start polling for joystick state
const startPolling = () => {
  if (pollingInterval) return
  
  pollingInterval = window.setInterval(async () => {
    if (!props.deviceAdapter) return
    
    try {
      // Check if device adapter is available
      const count = await props.deviceAdapter.getJoystickCount()
      isConnected.value = count > 0
      
      if (isConnected.value) {
        // Poll all joysticks
        for (let i = 0; i < 4; i++) {
          try {
            const stickState = await props.deviceAdapter.getStickState(i)
            const trigState = await props.deviceAdapter.getTriggerState(i)
            stickStates.value[i] = stickState
            trigStates.value[i] = trigState
          } catch (error) {
            console.warn(`Error polling joystick ${i}:`, error)
          }
        }
      }
    } catch (error) {
      console.warn('Error polling joystick state:', error)
      isConnected.value = false
    }
  }, 100) // Poll every 100ms
}

// Stop polling
const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

// Manual control functions
const setStickButton = (joystickId: number, direction: string, pressed: boolean) => {
  if (!props.deviceAdapter) return
  
  const bitValue = {
    'up': 8,
    'down': 4,
    'left': 2,
    'right': 1
  }[direction] || 0
  
  if (pressed) {
    stickStates.value[joystickId] = (stickStates.value[joystickId] || 0) | bitValue
  } else {
    stickStates.value[joystickId] = (stickStates.value[joystickId] || 0) & ~bitValue
  }
}

const setTrigButton = (joystickId: number, button: string, pressed: boolean) => {
  if (!props.deviceAdapter) return
  
  const bitValue = {
    'start': 1,
    'select': 2,
    'b': 4,
    'a': 8
  }[button] || 0
  
  if (pressed) {
    trigStates.value[joystickId] = (trigStates.value[joystickId] || 0) | bitValue
  } else {
    trigStates.value[joystickId] = (trigStates.value[joystickId] || 0) & ~bitValue
  }
}

// Lifecycle
onMounted(() => {
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.joystick-control {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 20px 0;
}

.joystick-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.joystick-header h3 {
  margin: 0;
  color: #333;
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

.joystick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.joystick-panel {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.joystick-title {
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  text-align: center;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #666;
}

.stick-display, .strig-display {
  margin-bottom: 15px;
}

.cross-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.cross-button-row {
  display: flex;
  gap: 5px;
}

.cross-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  border-radius: 4px;
  font-weight: bold;
  color: #666;
  transition: all 0.2s;
}

.cross-button.active {
  background: #4caf50;
  color: white;
}

.cross-button.center {
  background: #f0f0f0;
  color: #999;
  font-size: 12px;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.action-button {
  padding: 8px 12px;
  background: #e0e0e0;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  color: #666;
  transition: all 0.2s;
}

.action-button.active {
  background: #ff9800;
  color: white;
}

.stick-value, .strig-value {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.manual-control {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.manual-control h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.manual-joystick {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
}

.manual-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  text-align: center;
}

.manual-stick, .manual-strig {
  margin-bottom: 15px;
}

.manual-cross {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.manual-cross-row {
  display: flex;
  gap: 5px;
}

.manual-button {
  width: 35px;
  height: 35px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  transition: all 0.2s;
}

.manual-button:hover {
  background: #f0f0f0;
}

.manual-button:active {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.manual-action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.manual-action-button {
  padding: 6px 8px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
  color: #666;
  transition: all 0.2s;
}

.manual-action-button:hover {
  background: #f0f0f0;
}

.manual-action-button:active {
  background: #ff9800;
  color: white;
  border-color: #ff9800;
}
</style>
