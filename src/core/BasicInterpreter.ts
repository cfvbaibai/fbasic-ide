/**
 * Basic BASIC Interpreter Core - Refactored
 * 
 * A streamlined interpreter for Family Basic (F-BASIC) that delegates
 * to focused utility classes for better maintainability.
 * 
 * @author Family Basic IDE Team
 * @version 3.0.0
 */

import { 
  EXECUTION_LIMITS, 
  ERROR_TYPES
} from './constants'
import type { 
  BasicVariable, 
  BasicError, 
  InterpreterConfig, 
  ExecutionResult
} from './interfaces'

// Import the FBasicParser
import { FBasicParser } from './parser/FBasicParser'

// Import refactored components
import { 
  ExecutionEngine, 
  ExecutionContext 
} from './execution'

/**
 * Main interpreter class for executing Family Basic programs
 * 
 * This refactored version delegates to focused utility classes to keep
 * the main class focused on orchestration rather than implementation.
 */
export class BasicInterpreter {
  private config: InterpreterConfig
  private parser: FBasicParser
  private executionEngine?: ExecutionEngine
  private context?: ExecutionContext

  constructor(config?: Partial<InterpreterConfig>) {
    this.config = {
      maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS,
      maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES,
      enableDebugMode: false,
      strictMode: false,
      ...config
    }
    this.parser = new FBasicParser()
  }

  /**
   * Execute BASIC code
   */
  async execute(code: string): Promise<ExecutionResult> {
    try {
      // Parse the code
      const parseResult = await this.parser.parse(code)
      if (!parseResult.success) {
      return {
        success: false,
          output: '',
          debugOutput: this.config.enableDebugMode ? 
            parseResult.errors?.map((e) => `Parse error: ${e.message}`).join('\n') : undefined,
          errors: parseResult.errors?.map((error) => ({
            line: error.location?.start?.line || 0,
            message: error.message,
            type: ERROR_TYPES.SYNTAX
          })) || [],
          variables: new Map(),
          executionTime: 0
        }
      }

      // Create execution context (or reuse existing one if it has device adapter)
      if (!this.context || !this.context.deviceAdapter) {
        this.context = new ExecutionContext(this.config)
        // Set device adapter if provided
        if (this.config.deviceAdapter) {
          this.context.deviceAdapter = this.config.deviceAdapter
        }
        this.executionEngine = new ExecutionEngine(this.context)
      }
      
      // Reset context for new execution but preserve device adapter and cached states
      const preservedJoystickStates = this.context.joystickStates
      const preservedTriggerStates = this.context.triggerStates
      const preservedDeviceAdapter = this.context.deviceAdapter
      
      this.context.reset()
      this.context.statements = parseResult.ast?.statements || []
      
      // Restore preserved values
      this.context.joystickStates = preservedJoystickStates
      this.context.triggerStates = preservedTriggerStates
      this.context.deviceAdapter = preservedDeviceAdapter

      // Execute the program
      const result = await this.executionEngine!.execute()

      return result

    } catch (error) {
      return {
        success: false,
        output: '',
        debugOutput: this.config.enableDebugMode ? 
          `Execution error: ${error}` : undefined,
        errors: [{
        line: 0,
        message: `Execution error: ${error}`,
        type: ERROR_TYPES.RUNTIME
        }],
        variables: new Map(),
        executionTime: 0
      }
    }
  }

  /**
   * Stop execution
   */
  stop(): void {
    if (this.executionEngine) {
      this.executionEngine.stop()
    }
  }

  /**
   * Reset interpreter state
   */
  reset(): void {
    if (this.executionEngine) {
      this.executionEngine.reset()
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<InterpreterConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    }
    
    if (this.executionEngine) {
      this.executionEngine.updateConfig(newConfig)
    }
    
    // Update device adapter if provided
    if (newConfig.deviceAdapter && this.context) {
      this.context.deviceAdapter = newConfig.deviceAdapter
    }
  }

  /**
   * Update joystick states (for STICK/STRIG functions)
   */
  async updateJoystickStates(): Promise<void> {
    // Ensure execution context exists
    if (!this.context) {
      this.context = new ExecutionContext(this.config)
      // Set device adapter if provided
      if (this.config.deviceAdapter) {
        this.context.deviceAdapter = this.config.deviceAdapter
      }
      this.executionEngine = new ExecutionEngine(this.context)
    }
    
    if (this.executionEngine) {
      await this.executionEngine.updateJoystickStates()
    }
  }

  /**
   * Get current joystick state
   */
  getJoystickState(joystickId: number): number {
    if (this.executionEngine) {
      return this.executionEngine.getJoystickState(joystickId)
    }
    return 0
  }

  /**
   * Get current trigger state
   */
  getTriggerState(joystickId: number): number {
    if (this.executionEngine) {
      return this.executionEngine.getTriggerState(joystickId)
    }
    return 0
  }

  /**
   * Get current configuration
   */
  getConfig(): InterpreterConfig {
    return { ...this.config }
  }

  /**
   * Check if interpreter is currently running
   */
  isRunning(): boolean {
    return this.context?.isRunning || false
  }

  /**
   * Get current variables
   */
  getVariables(): Map<string, BasicVariable> {
    return this.context?.variables || new Map()
  }

  /**
   * Get current output
   */
  getOutput(): string[] {
    return this.context?.output || []
  }

  /**
   * Get current errors
   */
  getErrors(): BasicError[] {
    return this.context?.errors || []
  }

  /**
   * Get debug output
   */
  getDebugOutput(): string[] {
    return this.context?.debugOutput || []
  }
}