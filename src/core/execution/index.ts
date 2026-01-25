/**
 * Core execution components
 */

// Execution
export { ExecutionEngine } from './ExecutionEngine'
export { StatementRouter } from './StatementRouter'

// Executors
export { LetExecutor } from './executors/LetExecutor'
export { PrintExecutor } from './executors/PrintExecutor'

// Evaluation
export { ExpressionEvaluator } from '../evaluation/ExpressionEvaluator'

// Services
export { DataService } from '../services/DataService'
export { VariableService } from '../services/VariableService'

// State
export { ExecutionContext, type LoopState } from '../state/ExecutionContext'
