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
  ERROR_TYPES,
} from './constants'
import type { 
  BasicVariable, 
  InterpreterConfig, 
  ExecutionResult
} from './interfaces'
import type { CstNode } from 'chevrotain'

// Import the FBasicParser
import { FBasicParser } from './parser/FBasicParser'

// Import refactored components
import {
  ExecutionEngine,
  ExecutionContext
} from './execution'
import { expandStatements } from './execution/statement-expander'
import { SpriteStateManager } from './sprite/SpriteStateManager'

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
    console.log('🔧 [MAIN] BasicInterpreter constructor called with config:', {
      hasDeviceAdapter: !!config?.deviceAdapter,
      maxIterations: config?.maxIterations,
      maxOutputLines: config?.maxOutputLines,
      enableDebugMode: config?.enableDebugMode,
      strictMode: config?.strictMode
    })
    
    this.config = {
      maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_TEST,
      maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES_TEST,
      enableDebugMode: false,
      strictMode: false,
      ...config,
    }
    
    console.log('🔧 [MAIN] Final config after merge:', {
      maxIterations: this.config.maxIterations,
      maxOutputLines: this.config.maxOutputLines,
      enableDebugMode: this.config.enableDebugMode,
      strictMode: this.config.strictMode
    })
    
    this.parser = new FBasicParser()
  }

  /**
   * Execute BASIC code
   */
  async execute(code: string): Promise<ExecutionResult> {
    console.log('🚀 [MAIN] BasicInterpreter.execute called with code length:', code.length)
    try {
      // Parse the code
      const parseResult = await this.parser.parse(code)
      if (!parseResult.success) {
        return {
          success: false,
          errors: parseResult.errors?.map((error) => ({
            line: error.location?.start?.line ?? 0,
            message: error.message,
            type: ERROR_TYPES.SYNTAX
          })) ?? [],
          variables: new Map(),
          executionTime: 0
        }
      }

      // Create execution context (or reuse existing one if it has device adapter)
      if (!this.context?.deviceAdapter) {
        this.context = new ExecutionContext(this.config)
        // Set device adapter if provided
        if (this.config.deviceAdapter) {
          this.context.deviceAdapter = this.config.deviceAdapter
        }
        // Initialize sprite state manager
        this.context.spriteStateManager = new SpriteStateManager()
        this.executionEngine = new ExecutionEngine(this.context, this.config.deviceAdapter)
      } else {
        // Update existing ExecutionEngine with current output callback
        this.executionEngine = new ExecutionEngine(this.context, this.config.deviceAdapter)
      }
      
      // Reset context for new execution but preserve device adapter and cached states
      const preservedDeviceAdapter = this.context.deviceAdapter
      
      this.context.reset()
      
      // Extract statement nodes from CST program node and expand them
      if (parseResult.cst?.children.statement) {
        const statementsCst = parseResult.cst.children.statement;
        const validStatements = Array.isArray(statementsCst) 
          ? statementsCst.filter((s): s is CstNode => 'children' in s)
          : [];
        
        // Expand statements (flatten colon-separated commands) and create label map
        const { statements, labelMap } = expandStatements(validStatements)
        this.context.statements = statements
        this.context.labelMap = labelMap
      } else {
        this.context.statements = []
        this.context.labelMap = new Map()
      }
      
      // Restore preserved values
      this.context.deviceAdapter = preservedDeviceAdapter

      // Execute the program
      const result = await this.executionEngine.execute()

      return result

    } catch (error) {
      return {
        success: false,
        errors: [{
          line: 0,
          message: `Execution error: ${error}`,
          type: ERROR_TYPES.RUNTIME
        }],
        variables: new Map(),
        arrays: new Map(),
        executionTime: 0
      }
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
      ...newConfig,
    }
    
    if (this.executionEngine) {
      this.executionEngine.updateConfig(this.config)
    }
  }

  /**
   * Stop execution and cleanup resources
   */
  stop(): void {
    if (this.executionEngine) {
      this.executionEngine.stop()
    }
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
    return this.context?.isRunning ?? false
  }

  /**
   * Get current variables
   */
  getVariables(): Map<string, BasicVariable> {
    return this.context?.variables ?? new Map()
  }

  /**
   * Get all sprite states
   */
  getSpriteStates() {
    return this.context?.spriteStateManager?.getAllSpriteStates() ?? []
  }

  /**
   * Check if sprite display is enabled
   */
  isSpriteEnabled(): boolean {
    return this.context?.spriteStateManager?.isSpriteEnabled() ?? false
  }
}
