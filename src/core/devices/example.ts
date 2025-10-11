/**
 * Device Abstraction Usage Example
 * 
 * Demonstrates how to use the device abstraction layer with the F-Basic interpreter
 */

import { BasicInterpreter } from '../BasicInterpreter'
import { 
  BasicDeviceManager, 
  BasicDeviceFactory, 
  DeviceAdapter,
  DeviceType,
  WebJoystickDevice
} from './index'

export class DeviceIntegratedInterpreter {
  private interpreter: BasicInterpreter
  private deviceManager: BasicDeviceManager
  private deviceFactory: BasicDeviceFactory
  private deviceAdapter: DeviceAdapter

  constructor() {
    this.interpreter = new BasicInterpreter()
    this.deviceManager = new BasicDeviceManager()
    this.deviceFactory = new BasicDeviceFactory()
    this.deviceAdapter = new DeviceAdapter({
      deviceManager: this.deviceManager,
      enableDeviceIntegration: true
    })
  }

  /**
   * Initialize the interpreter with devices
   */
  async initialize(): Promise<void> {
    // Create and register display device
    const displayConfig = this.deviceFactory.getDefaultConfig(DeviceType.DISPLAY)
    displayConfig.id = 'main-display'
    displayConfig.name = 'Main Display'
    const displayDevice = await this.deviceFactory.createDevice(displayConfig)
    await this.deviceManager.registerDevice(displayDevice)

    // Create and register input device
    const inputConfig = this.deviceFactory.getDefaultConfig(DeviceType.INPUT)
    inputConfig.id = 'main-input'
    inputConfig.name = 'Main Input'
    const inputDevice = await this.deviceFactory.createDevice(inputConfig)
    await this.deviceManager.registerDevice(inputDevice)

    // Attach device adapter to interpreter
    this.deviceAdapter.attachInterpreter(this.interpreter)

    console.log('Device-integrated interpreter initialized')
    console.log('Available capabilities:', this.deviceAdapter.getCapabilities())
  }

  /**
   * Execute BASIC code with device integration
   */
  async execute(code: string): Promise<void> {
    // Execute the BASIC code
    const result = await this.interpreter.execute(code)
    
    if (result.success) {
      // Output results to display device
      if (result.output) {
        await this.deviceAdapter.writeToDisplay(result.output)
      }

      // Handle debug output if available
      if (result.debugOutput) {
        await this.deviceAdapter.writeToDisplay('\n--- Debug Output ---\n')
        await this.deviceAdapter.writeToDisplay(result.debugOutput)
      }
    } else {
      // Display errors
      await this.deviceAdapter.writeToDisplay('\n--- Errors ---\n')
      for (const error of result.errors) {
        await this.deviceAdapter.writeToDisplay(`Error: ${error.message}\n`)
      }
    }
  }

  /**
   * Run an interactive BASIC session
   */
  async runInteractive(): Promise<void> {
    await this.deviceAdapter.writeToDisplay('F-Basic Interactive Mode\n')
    await this.deviceAdapter.writeToDisplay('Type "EXIT" to quit\n\n')

    while (true) {
      const input = await this.deviceAdapter.readInput('> ')
      
      if (input.toUpperCase() === 'EXIT') {
        break
      }

      if (input.trim()) {
        await this.execute(input)
        await this.deviceAdapter.writeToDisplay('\n')
      }
    }

    await this.deviceAdapter.writeToDisplay('Goodbye!\n')
  }

  /**
   * Get device status
   */
  getDeviceStatus() {
    return this.deviceAdapter.getDeviceStatus()
  }

  /**
   * Demonstrate joystick functionality for Family BASIC v3 STICK and STRIG keywords
   */
  async demonstrateJoystick(): Promise<void> {
    console.log('=== Family BASIC v3 Joystick Demonstration ===')
    
    // Register a joystick device
    const joystickDevice = new WebJoystickDevice('joystick-1', 'Primary Joystick', {
      enableGamepadAPI: true,
      crossButtonThreshold: 0.5, // Threshold for analog to digital conversion
      deadzone: 0.1
    })
    
    await this.deviceManager.registerDevice(joystickDevice)
    this.deviceManager.setPrimaryDevice(DeviceType.JOYSTICK, 'joystick-1')
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check joystick count
    const count = await this.deviceAdapter.getJoystickCount()
    console.log(`Available joysticks: ${count}`)
    
    if (count > 0) {
      // Demonstrate STICK functionality (cross-button state)
      const stick0 = await this.deviceAdapter.getStickState(0) // Joystick 0
      const stick1 = await this.deviceAdapter.getStickState(1) // Joystick 1
      console.log(`STICK(0) = ${stick0}, STICK(1) = ${stick1}`)
      
      // Demonstrate STRIG functionality (button state)
      const trig0 = await this.deviceAdapter.getTriggerState(0) // Joystick 0
      const trig1 = await this.deviceAdapter.getTriggerState(1) // Joystick 1
      console.log(`STRIG(0) = ${trig0}, STRIG(1) = ${trig1}`)
      
      // Example Family BASIC v3 program using joystick
      const joystickCode = `10 REM Family BASIC v3 Joystick Demo
20 PRINT "Joystick Demo - Move stick and press buttons!"
30 PRINT "STICK(0) = "; STICK(0)
40 PRINT "STRIG(0) = "; STRIG(0)
50 PRINT "STICK(1) = "; STICK(1)
60 PRINT "STRIG(1) = "; STRIG(1)
70 END`
      
      console.log('Running Family BASIC v3 joystick demo...')
      await this.execute(joystickCode)
    } else {
      console.log('No joysticks detected. Connect a gamepad and refresh.')
    }
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    this.deviceAdapter.detachInterpreter()
    await this.deviceManager.destroyAll()
  }
}

/**
 * Example usage function
 */
export async function runDeviceExample(): Promise<void> {
  const interpreter = new DeviceIntegratedInterpreter()
  
  try {
    await interpreter.initialize()

    // Example BASIC program
    const basicCode = `10 PRINT "Hello from device-integrated F-Basic!"
20 PRINT "This text is displayed using the device abstraction layer"
30 FOR I = 1 TO 5
40   PRINT "Count: "; I
50 NEXT I
60 PRINT "Device capabilities:"
70 PRINT "- Text output"
80 PRINT "- Graphics output" 
90 PRINT "- Keyboard input"
100 PRINT "- Pointer input"
110 END`

    await interpreter.execute(basicCode)

    // Show device status
    const status = interpreter.getDeviceStatus()
    console.log('Device Status:', status)

    // Demonstrate joystick functionality
    await interpreter.demonstrateJoystick()

  } catch (error) {
    console.error('Error running device example:', error)
  } finally {
    await interpreter.destroy()
  }
}
