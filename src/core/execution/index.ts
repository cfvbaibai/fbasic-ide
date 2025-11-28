/**
 * Core execution components
 */

// Execution
export { ExecutionEngine } from './ExecutionEngine'
export { StatementRouter } from './StatementRouter'

// Executors
export { PrintExecutor } from './executors/PrintExecutor'
export { LetExecutor } from './executors/LetExecutor'

// Evaluation
export { ExpressionEvaluator } from '../evaluation/ExpressionEvaluator'

// Services
export { VariableService } from '../services/VariableService'
export { DataService } from '../services/DataService'

// State
export { ExecutionContext, type LoopState } from '../state/ExecutionContext'
