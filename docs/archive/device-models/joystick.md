# Family BASIC v3 Joystick Support - Device Model Review

## Overview

The device abstraction layer has been successfully extended to support joystick/gamepad inputs for Family BASIC v3's `STICK` and `STRIG` keywords. The implementation provides a clean, modular approach that decouples the interpreter from specific hardware implementations and matches the exact Family BASIC v3 specification.

## Family BASIC v3 Specification

### STICK Keyword
- **Syntax**: `STICK(<Joystick ID>)`
- **Returns**: Cross-button state as a bitmask
- **Values**: 
  - `1` = right
  - `2` = left  
  - `4` = down
  - `8` = top
- **Combined**: Can be combined (e.g., `9` for top-right)
- **Joystick ID**: 0, 1, 2, or 3 (up to 4 joysticks)

### STRIG Keyword
- **Syntax**: `STRIG(<Joystick ID>)`
- **Returns**: Action button state as a bitmask
- **Values**:
  - `1` = start
  - `2` = select
  - `4` = B
  - `8` = A
- **Combined**: Can be combined (e.g., `12` for B+select)
- **Joystick ID**: 0, 1, 2, or 3 (up to 4 joysticks)

## Key Components Added

### 1. Device Types and Capabilities

**New Device Type:**
```typescript
export enum DeviceType {
  // ... existing types
  JOYSTICK = 'joystick'
}
```

**New Capability:**
```typescript
export enum DeviceCapability {
  // ... existing capabilities
  JOYSTICK_INPUT = 'joystick_input'
}
```

### 2. Joystick Device Interface

```typescript
export interface JoystickDevice extends Device {
  readonly type: DeviceType.JOYSTICK
  
  /**
   * Get the number of available joysticks (0-3 for Family BASIC v3)
   */
  getJoystickCount(): Promise<number>
  
  /**
   * Get joystick cross-button state (for STICK keyword)
   * @param joystickId - Joystick ID (0, 1, 2, or 3)
   * @returns Cross-button state: 1=right, 2=left, 4=down, 8=top. Can be combined
   */
  getStickState(joystickId: number): Promise<number>
  
  /**
   * Get joystick button state (for STRIG keyword)
   * @param joystickId - Joystick ID (0, 1, 2, or 3)
   * @returns Button state: 1=start, 2=select, 4=B, 8=A. Can be combined
   */
  getTriggerState(joystickId: number): Promise<number>
  
  /**
   * Check if a specific cross-button is pressed
   * @param joystickId - Joystick ID (0, 1, 2, or 3)
   * @param direction - Direction: 'right', 'left', 'down', 'up'
   * @returns True if the direction button is pressed
   */
  isCrossButtonPressed(joystickId: number, direction: 'right' | 'left' | 'down' | 'up'): Promise<boolean>
  
  /**
   * Check if a specific action button is pressed
   * @param joystickId - Joystick ID (0, 1, 2, or 3)
   * @param button - Button: 'start', 'select', 'B', 'A'
   * @returns True if the button is pressed
   */
  isActionButtonPressed(joystickId: number, button: 'start' | 'select' | 'B' | 'A'): Promise<boolean>
  
  /**
   * Set up event listeners for joystick events
   */
  onJoystickEvent(event: JoystickEvent, callback: (data: JoystickEventData) => void): void
  
  /**
   * Remove joystick event listeners
   */
  offJoystickEvent(event: JoystickEvent, callback: (data: JoystickEventData) => void): void
}
```

### 3. Event System

**Joystick Events:**
```typescript
export enum JoystickEvent {
  BUTTON_DOWN = 'joystick_button_down',
  BUTTON_UP = 'joystick_button_up', 
  STICK_MOVE = 'joystick_stick_move',
  CONNECTED = 'joystick_connected',
  DISCONNECTED = 'joystick_disconnected'
}
```

**Event Data:**
```typescript
export interface JoystickEventData {
  type: JoystickEvent
  stickNumber: number
  buttonNumber?: number
  axis?: number
  position?: number
  timestamp: number
}
```

### 4. Web Implementation

**WebJoystickDevice** - A concrete implementation using the browser's Gamepad API:

- **Family BASIC v3 Compatibility**: Supports exact bitmask values (1, 2, 4, 8)
- **Analog to Digital Conversion**: Converts analog stick positions to digital cross buttons
- **D-pad Support**: Supports both analog sticks and D-pad inputs
- **Button Mapping**: Maps modern gamepad buttons to Family BASIC v3 button layout
- **Real-time Polling**: Efficient polling system for responsive input
- **Event-driven**: Supports both polling and event-based input handling
- **Multi-gamepad**: Supports up to 4 joysticks (Family BASIC v3 limit)

### 5. Device Manager Integration

The `BasicDeviceManager` now includes:
- Factory registration for joystick devices
- Default configuration with Family BASIC v3 compatibility settings
- Device filtering by joystick type and capability

### 6. Device Adapter Integration

The `DeviceAdapter` provides simplified access methods:
```typescript
// For Family BASIC v3 STICK keyword
async getStickState(joystickId: number): Promise<number>

// For Family BASIC v3 STRIG keyword  
async getTriggerState(joystickId: number): Promise<number>

// Utility
async getJoystickCount(): Promise<number>
```

## Family BASIC v3 Compatibility

### STICK Keyword Support

The `STICK(joystickId)` function maps to:
- `joystickId`: 0, 1, 2, or 3 (Family BASIC v3 supports up to 4 joysticks)
- **Return Value**: Bitmask with values:
  - `1` = right
  - `2` = left
  - `4` = down
  - `8` = top
  - Can be combined (e.g., `9` = top-right)

### STRIG Keyword Support

The `STRIG(joystickId)` function maps to:
- `joystickId`: 0, 1, 2, or 3 (Family BASIC v3 supports up to 4 joysticks)
- **Return Value**: Bitmask with values:
  - `1` = start
  - `2` = select
  - `4` = B
  - `8` = A
  - Can be combined (e.g., `12` = B+select)

## Usage Example

```typescript
// Initialize device system
const deviceManager = new BasicDeviceManager()
const deviceAdapter = new DeviceAdapter({ deviceManager })

// Register joystick device
const joystickDevice = new WebJoystickDevice('primary-joystick', 'Primary Joystick', {
  crossButtonThreshold: 0.5,  // Threshold for analog to digital conversion
  deadzone: 0.1               // Filter noise
})

await deviceManager.registerDevice(joystickDevice)
deviceManager.setPrimaryDevice(DeviceType.JOYSTICK, 'primary-joystick')

// Family BASIC v3 program using joystick
const basicCode = `
10 REM Family BASIC v3 Joystick Demo
20 PRINT "Move stick and press buttons!"
30 PRINT "STICK(0) = "; STICK(0)
40 PRINT "STRIG(0) = "; STRIG(0)
50 PRINT "STICK(1) = "; STICK(1)
60 PRINT "STRIG(1) = "; STRIG(1)
70 END
`

// Execute with joystick support
await interpreter.execute(basicCode)
```

## Button Mapping

### Cross Buttons (STICK)
- **Analog Stick**: Left stick X/Y axes converted to digital directions
- **D-pad**: Direct mapping to cross buttons
- **Threshold**: Configurable threshold for analog to digital conversion

### Action Buttons (STRIG)
- **A Button**: Maps to Family BASIC A button (bit 8)
- **B Button**: Maps to Family BASIC B button (bit 4)
- **Start Button**: Maps to Family BASIC start button (bit 1)
- **Select Button**: Maps to Family BASIC select button (bit 2)

## Benefits

1. **Exact Family BASIC v3 Compatibility**: Matches the original specification precisely
2. **Modular Design**: Joystick support is cleanly separated from core interpreter logic
3. **Hardware Agnostic**: Can be extended to support different input devices
4. **Modern Web Support**: Leverages browser Gamepad API for web-based implementations
5. **Event-driven**: Supports both polling and event-based input handling
6. **Configurable**: Deadzone, threshold, and polling frequency can be customized
7. **Testable**: Full test coverage ensures reliability
8. **Multi-gamepad**: Supports up to 4 joysticks as per Family BASIC v3 specification

## Future Extensions

The device model is designed to be extensible for:
- Additional joystick types (analog sticks, digital pads, etc.)
- Custom input mappings
- Haptic feedback support
- Platform-specific implementations (Node.js, mobile, etc.)

## Conclusion

The device abstraction layer now fully supports Family BASIC v3's `STICK` and `STRIG` keywords through a clean, modular interface. The implementation provides both modern web browser support and maintains exact compatibility with the Family BASIC v3 specification, making it ready for integration with the F-Basic interpreter when those keywords are implemented.

The bitmask-based approach ensures that the implementation matches the original Family BASIC v3 behavior exactly, while the device abstraction provides flexibility for different hardware implementations and future extensions.