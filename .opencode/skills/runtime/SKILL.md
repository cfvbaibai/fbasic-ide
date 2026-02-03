---
name: runtime
description: Runtime team skill for command execution, expression evaluation, and program state management. Use when the user invokes '/runtime <task>' or requests executor implementation, expression functions, control flow (GOTO/GOSUB/FOR/IF), variable/array handling, or state management. Works with `src/core/execution/`, `src/core/evaluation/`, `src/core/state/`. Must read docs/teams/runtime-team.md for detailed patterns.
---

# Runtime Team Skill

Implement command execution, expression evaluation, and runtime state.

## Ownership

- **Files**: `src/core/execution/*`, `src/core/evaluation/*`, `src/core/state/*`
- **Responsibilities**: Command execution, expression evaluation, program state, control flow

## Key Files

- `ExecutionEngine.ts` - Main execution loop, dispatches to executors
- `executors/*.ts` - Individual command executors (33 executors)
- `ExpressionEvaluator.ts` - Evaluates expressions from CST
- `ExecutionContext.ts` - Runtime state (variables, arrays, program counter)

## Key Pattern

Each BASIC command has a dedicated executor class.

## Common Tasks

### Add New Command Executor

1. **Create executor** in `src/core/execution/executors/CommandExecutor.ts`:

   ```typescript
   export function executeCommand(cst: CstNode, context: ExecutionContext, device: BasicDeviceAdapter): void {
     // Extract arguments from CST
     // Evaluate expressions
     // Update context or call device
   }
   ```

2. **Register in ExecutionEngine** dispatcher

3. **Add executor tests** in `test/executors/`

### Fix Execution Bug

1. Identify which executor has the bug
2. Add test case reproducing the bug
3. Fix executor logic
4. Verify test passes

### Add Expression Function

1. Update `ExpressionEvaluator.ts`
2. Add tests in `test/evaluation/`

## Executor Function Signature

```typescript
export function executeCommandName(cst: CstNode, context: ExecutionContext, device: BasicDeviceAdapter): void
```

## State Management

```typescript
// Set variable
context.setVariable('A', 42)

// Get variable
const value = context.getVariable('A')

// Arrays
context.setArrayValue('ARR', [1, 2], 100)
```

## Device I/O

```typescript
device.printOutput(text)
device.clearScreen()
const input = await device.getInput()
const state = device.getStickState(joystickId)
```

## Testing

- **Location**: `test/executors/`, `test/evaluation/`
- **Pattern**: Mock device adapter, verify calls
- **Use**: Test helpers from `test/test-helpers.ts`

## Reference

- Read `docs/teams/runtime-team.md` for complete guide
- **F-BASIC manual**: `docs/reference/family-basic-manual/`
