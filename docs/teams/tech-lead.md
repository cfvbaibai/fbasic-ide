# Tech Lead Team

## Role
Orchestrate feature development across teams. Analyze architecture, decompose tasks, spawn sub-agents, integrate results.

## Architecture Overview

### System Layers
```
┌─────────────────────────────────────────┐
│  UI Layer (Vue 3)                       │
│  src/features/                          │
└─────────────────────────────────────────┘
         │
┌─────────────────────────────────────────┐
│  Core Interpreter (DOM-free)            │
│  ├─ Parser (Chevrotain CST)             │
│  ├─ Execution Engine                    │
│  ├─ Expression Evaluator                │
│  └─ Device Adapters                     │
└─────────────────────────────────────────┘
         │
┌─────────────────────────────────────────┐
│  Platform Layer                         │
│  ├─ Animation Manager                   │
│  ├─ Sprite State Manager                │
│  └─ Shared Buffers                      │
└─────────────────────────────────────────┘
```

### Key Pattern: Direct CST Execution
**No AST conversion.** Parser outputs CST, executors consume CST nodes directly.

### Key Pattern: Worker Architecture
Interpreter runs in web worker for non-blocking execution:
1. Main → Worker: `EXECUTE` message with code
2. Worker → Main: `OUTPUT` messages for PRINT
3. Worker → Main: `SCREEN_CHANGED` notification (shared buffer updated)
4. Worker ↔ Main: SharedArrayBuffer for sprite positions (Animation Worker single writer)

**See**: `docs/reference/worker-messages.md` for complete message types

## File Structure

```
src/
├── core/                      # Parser + Runtime teams
│   ├── BasicInterpreter.ts   # Main orchestrator
│   ├── parser/               # Parser team ownership
│   ├── execution/            # Runtime team ownership
│   ├── evaluation/           # Runtime team ownership
│   ├── state/                # Runtime team ownership
│   ├── animation/            # Platform team ownership
│   ├── sprite/               # Platform team ownership
│   └── devices/              # Platform team ownership
├── features/                  # UI team ownership
│   ├── ide/
│   └── sprite-viewer/
└── shared/                    # UI team ownership
    ├── components/
    └── styles/
```

## Team Ownership

| Team | Directories | Responsibilities |
|------|-------------|------------------|
| **Parser** | `src/core/parser/` | Grammar, CST generation, syntax errors |
| **Runtime** | `src/core/execution/`, `src/core/evaluation/`, `src/core/state/` | Command execution, expression evaluation, state management |
| **UI** | `src/features/`, `src/shared/` | Vue components, IDE, theming |
| **Platform** | `src/core/animation/`, `src/core/sprite/`, `src/core/devices/` | Device models, sprites, animation, buffers |

## Integration Points

### Parser → Runtime
- **Output**: CST (Concrete Syntax Tree)
- **Interface**: CST node types from Chevrotain
- **Example**: `IfStatementCstNode` → `IfThenExecutor`

### Runtime → Platform
- **Output**: Device commands
- **Interface**: `BasicDeviceAdapter`
- **Example**: `MoveExecutor` → `AnimationManager.scheduleMove()`

### Platform → UI
- **Output**: SharedArrayBuffer updates
- **Interface**: `sharedDisplayBuffer` layout
- **Example**: Sprite positions written by worker, read by Konva renderer

### UI → Runtime
- **Output**: User actions (run, stop, input)
- **Interface**: Web Worker messages
- **Example**: User clicks "Run" → `EXECUTE` message to worker

## Workflow: Task Decomposition

When user requests a feature:

1. **Analyze** against architecture (above)
2. **Identify** which teams are involved
3. **Break down** into team-specific tasks
4. **Spawn** sub-agents via Task tool
5. **Integrate** results and verify cross-team boundaries

### Example: Add CIRCLE Command

```markdown
Feature: "Add CIRCLE command to draw circles"

Analysis:
- Parser: Add grammar rule
- Runtime: Implement executor
- Platform: Add drawing primitive to device
- UI: No changes needed

Task Breakdown:
1. Parser Team: Add CIRCLE token and grammar rule
2. Runtime Team: Implement CircleExecutor
3. Platform Team: Add circle drawing to BasicDeviceAdapter
4. Integration: Verify CST → Executor → Device flow
```

## Common Scenarios

### New BASIC Command
Teams: Parser → Runtime → (maybe Platform)

### New IDE Feature
Teams: UI only (usually)

### Animation/Sprite Feature
Teams: Platform → Runtime

### Bug Fix
Teams: Usually single team (identify which layer has the bug)

## Reference Documentation

- **F-BASIC Language**: `docs/reference/family-basic-manual/`
- **Worker Message Types**: `docs/reference/worker-messages.md`
- **Shared Buffer Layout**: `docs/reference/shared-display-buffer.md`
- **Roadmap**: `docs/roadmap.md`
- **Changelog**: `docs/CHANGELOG.md`

## Code Constraints (Enforce Across All Teams)

- Files: **MAX 500 lines**
- TypeScript: strict mode, no `any`, `import type` for types
- Tests: `.toEqual()` for exact matching
- Constants: `src/core/constants.ts`
