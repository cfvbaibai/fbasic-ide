# Architecture

## Core Interpreter (DOM-free)

- `src/core/BasicInterpreter.ts` - Main interpreter orchestrating parsing and execution
- `src/core/parser/FBasicChevrotainParser.ts` - Chevrotain-based CST parser
- `src/core/execution/ExecutionEngine.ts` - Executes programs from CST
- `src/core/execution/executors/*.ts` - Individual statement executors (LetExecutor, PrintExecutor, etc.)
- `src/core/evaluation/ExpressionEvaluator.ts` - Expression evaluation
- `src/core/state/ExecutionContext.ts` - Runtime state management
- `src/core/devices/*.ts` - Device adapters (joystick, screen output)

**Key Pattern**: Direct CST execution - no AST conversion. Parser outputs CST, executors consume CST nodes directly.

## Frontend

- `src/features/ide/` - Code editor, runtime output, controls
- `src/features/sprite-viewer/` - Character sprite viewer
- `src/shared/components/ui/` - Reusable Game* UI components
- `src/shared/styles/` - Global CSS (theme.css, utilities.css)

## Reference Documentation

- `docs/reference/family-basic-manual/` - Original F-BASIC manual pages (consult for language behavior)
