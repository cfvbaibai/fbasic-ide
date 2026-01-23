/**
 * Test Device Adapter
 * 
 * A mock implementation of BasicDeviceAdapter for unit testing the BasicInterpreter.
 * Provides controlled behavior for testing without external dependencies.
 */

import type { BasicDeviceAdapter } from '../interfaces'

export class TestDeviceAdapter implements BasicDeviceAdapter {
  // === JOYSTICK STATE ===
  private joystickCount = 2
  private stickStates: Map<number, number> = new Map()
  private strigBuffer: Map<number, number[]> = new Map()
  
  // === OUTPUT CAPTURE ===
  public printOutputs: string[] = []
  public debugOutputs: string[] = []
  public errorOutputs: string[] = []
  public clearScreenCalls = 0
  public cursorPosition: { x: number; y: number } = { x: 0, y: 0 }

  constructor() {
    console.log('🧪 [TEST_DEVICE] TestDeviceAdapter created')
  }

  // === JOYSTICK INPUT METHODS ===

  getJoystickCount(): number {
    return this.joystickCount
  }

  getStickState(joystickId: number): number {
    return this.stickStates.get(joystickId) || 0
  }

  setStickState(joystickId: number, state: number): void {
    this.stickStates.set(joystickId, state)
    console.log('🧪 [TEST_DEVICE] Stick state set:', { joystickId, state })
  }

  pushStrigState(joystickId: number, state: number): void {
    if (!this.strigBuffer.has(joystickId)) {
      this.strigBuffer.set(joystickId, [])
    }
    const buffer = this.strigBuffer.get(joystickId)!
    buffer.push(state)
    console.log('🧪 [TEST_DEVICE] STRIG state pushed:', { joystickId, state, bufferSize: buffer.length })
  }

  consumeStrigState(joystickId: number): number {
    if (!this.strigBuffer.has(joystickId)) {
      return 0
    }
    
    const buffer = this.strigBuffer.get(joystickId)!
    if (buffer.length === 0) {
      return 0
    }
    
    const state = buffer.shift()!
    console.log('🧪 [TEST_DEVICE] STRIG state consumed:', { joystickId, state, remaining: buffer.length })
    return state
  }

  // === TEXT OUTPUT METHODS ===

  printOutput(output: string): void {
    this.printOutputs.push(output)
    console.log('🧪 [TEST_DEVICE] Print output:', output)
  }

  debugOutput(output: string): void {
    this.debugOutputs.push(output)
    console.log('🧪 [TEST_DEVICE] Debug output:', output)
  }

  errorOutput(output: string): void {
    this.errorOutputs.push(output)
    console.log('🧪 [TEST_DEVICE] Error output:', output)
  }

  clearScreen(): void {
    this.clearScreenCalls++
    this.printOutputs = []
    this.debugOutputs = []
    this.errorOutputs = []
    console.log('🧪 [TEST_DEVICE] Clear screen called')
  }

  setCursorPosition(x: number, y: number): void {
    this.cursorPosition = { x, y }
    console.log('🧪 [TEST_DEVICE] Set cursor position:', { x, y })
  }

  // === TEST HELPER METHODS ===

  /**
   * Set up joystick state for testing
   */
  setupJoystickState(joystickId: number, stickState: number, strigEvents: number[] = []): void {
    this.setStickState(joystickId, stickState)
    for (const strigEvent of strigEvents) {
      this.pushStrigState(joystickId, strigEvent)
    }
  }

  /**
   * Simulate STRIG button press
   */
  simulateStrigPress(joystickId: number, buttonValue: number): void {
    this.pushStrigState(joystickId, buttonValue)
  }

  /**
   * Simulate STICK direction
   */
  simulateStickDirection(joystickId: number, directionValue: number): void {
    this.setStickState(joystickId, directionValue)
  }

  /**
   * Clear all captured outputs
   */
  clearOutputs(): void {
    this.printOutputs = []
    this.debugOutputs = []
    this.errorOutputs = []
    this.clearScreenCalls = 0
  }

  /**
   * Clear all joystick state
   */
  clearJoystickState(): void {
    this.stickStates.clear()
    this.strigBuffer.clear()
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.clearOutputs()
    this.clearJoystickState()
  }

  /**
   * Get all captured outputs as a single string
   * Error outputs are formatted as "RUNTIME: {message}" to match IDE format
   * Note: Each output may already contain a newline (from PRINT statements that don't end with semicolon/comma)
   * Outputs that don't end with newline (from PRINT statements ending with semicolon/comma) should be concatenated
   */
  getAllOutputs(): string {
    const allOutputs = [
      ...this.printOutputs,
      ...this.debugOutputs.map(o => `DEBUG: ${o}`),
      ...this.errorOutputs.map(o => `RUNTIME: ${o}`)
    ]
    
    if (allOutputs.length === 0) return ''
    
    // Concatenate outputs:
    // - Outputs ending with newline are kept as-is (they already have their newline)
    // - Outputs not ending with newline are concatenated directly (no separator)
    // - Only add newline separator when transitioning from newline-ending to non-newline-starting output
    let result = ''
    for (const output of allOutputs) {
      if (output.endsWith('\n')) {
        // Output ends with newline - add it as-is
        result += output
      } else {
        // Output doesn't end with newline - concatenate directly
        result += output
      }
    }
    return result
  }

  /**
   * Check if specific output was captured
   */
  hasOutput(output: string, type: 'print' | 'debug' | 'error' = 'print'): boolean {
    switch (type) {
      case 'print':
        return this.printOutputs.includes(output)
      case 'debug':
        return this.debugOutputs.includes(output)
      case 'error':
        return this.errorOutputs.includes(output)
      default:
        return false
    }
  }

  /**
   * Get the number of times clearScreen was called
   */
  getClearScreenCallCount(): number {
    return this.clearScreenCalls
  }

  /**
   * Check if any STRIG events are pending for a joystick
   */
  hasPendingStrigEvents(joystickId: number): boolean {
    const buffer = this.strigBuffer.get(joystickId)
    return buffer ? buffer.length > 0 : false
  }

  /**
   * Get pending STRIG events count for a joystick
   */
  getPendingStrigEventsCount(joystickId: number): number {
    const buffer = this.strigBuffer.get(joystickId)
    return buffer ? buffer.length : 0
  }
}
