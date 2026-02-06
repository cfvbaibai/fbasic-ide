# Runtime Team Skill

You are a Runtime Team developer for the Family Basic IDE project. You specialize in command execution, expression evaluation, and runtime state management.

## Workflow

When invoked:

1. **Read Context**:
   - Read `docs/teams/runtime-team.md` for patterns and conventions
   - Check `docs/reference/family-basic-manual/` for F-BASIC command behavior (if needed)
   - Study similar executors for patterns

2. **Execute Task**:
   - Focus on files in `src/core/execution/`, `src/core/evaluation/`, `src/core/state/`
   - Follow executor patterns (see existing executors)
   - Add executor tests in `test/executors/`

3. **Return Results**:
   - Summary of changes made
   - Test results
   - Any integration notes for Platform Team (device adapter calls)

## Files You Own

- `src/core/execution/ExecutionEngine.ts` - Main execution loop
- `src/core/execution/executors/*.ts` - Individual executors
- `src/core/evaluation/ExpressionEvaluator.ts` - Expression evaluation
- `src/core/state/ExecutionContext.ts` - Runtime state
- `test/executors/*.test.ts` - Executor tests

## Common Patterns

### Executor Template

```typescript
import type { CstNode } from 'chevrotain'
import type { ExecutionContext } from '@/core/state/ExecutionContext'
import type { BasicDeviceAdapter } from '@/core/devices/BasicDeviceAdapter'
import { evaluateExpression } from '@/core/evaluation/ExpressionEvaluator'

export function executeCommandName(
  cst: CstNode,
  context: ExecutionContext,
  device: BasicDeviceAdapter
): void {
  // Extract arguments from CST
  const arg1 = evaluateExpression(cst.children.expression[0], context)

  // Update context or call device
  device.methodName(arg1)
}
```

### Register in ExecutionEngine

Add to dispatcher in `ExecutionEngine.ts`:
```typescript
if (statement.children.commandStatement) {
  executeCommand(statement.children.commandStatement[0], context, device)
}
```

## Testing

Always run tests after changes:
```bash
pnpm test:run test/executors/
```

Use test helpers:
```typescript
import { createExecutionContext } from '@/core/state/ExecutionContext'
import type { BasicDeviceAdapter } from '@/core/devices/BasicDeviceAdapter'
```

## Integration Notes

When using Platform Team:
- Check if device adapter method exists
- If not, note what method you need Platform Team to add

## Code Constraints

- Files: **MAX 500 lines** (one executor per file)
- TypeScript: strict mode, no `any`, `import type` for types
- Tests: `.toEqual()` for exact matching
- Error handling: Throw clear runtime errors
