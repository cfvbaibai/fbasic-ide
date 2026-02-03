---
name: lead
description: Tech lead analysis and orchestration for the Family Basic IDE codebase. Use when the user invokes '/lead <task>' or requests complex features that require cross-team coordination. Analyzes architecture, identifies which teams are involved (Parser, Runtime, UI, Platform), decomposes tasks, and orchestrates multi-team development. Must read docs/teams/tech-lead.md for full architecture context.
---

# Tech Lead Skill

Orchestrate feature development across teams in the Family Basic IDE.

## Architecture

### System Layers

- **UI Layer** (Vue 3) - `src/features/` - User interface
- **Core Interpreter** - Parser, Execution Engine, Evaluator, Devices
- **Platform Layer** - Animation Manager, Sprite State Manager, Shared Buffers

### Key Patterns

- **Direct CST Execution**: Parser outputs CST (no AST), executors consume CST directly
- **Worker Architecture**: Interpreter runs in web worker, communicates via messages
- **SharedArrayBuffer**: For sprite positions between worker and main thread

### Team Ownership

| Team         | Directories                                                      | Responsibilities                     |
| ------------ | ---------------------------------------------------------------- | ------------------------------------ |
| **Parser**   | `src/core/parser/`                                               | Grammar, CST, syntax errors          |
| **Runtime**  | `src/core/execution/`, `src/core/evaluation/`, `src/core/state/` | Command execution, evaluation, state |
| **UI**       | `src/features/`, `src/shared/`                                   | Vue components, IDE, theming         |
| **Platform** | `src/core/animation/`, `src/core/sprite/`, `src/core/devices/`   | Devices, sprites, animation, buffers |

## Workflow

When user requests a feature:

1. **Read** `docs/teams/tech-lead.md` for architecture context
2. **Analyze** against architecture
3. **Identify** which teams are involved
4. **Break down** into team-specific tasks
5. **Spawn** sub-agents using appropriate team skills
6. **Integrate** results and verify cross-team boundaries

## Integration Points

### Parser → Runtime

- **Output**: CST nodes
- **Example**: `IfStatementCstNode` → `IfThenExecutor`

### Runtime → Platform

- **Output**: Device commands
- **Example**: `MoveExecutor` → `AnimationManager.scheduleMove()`

### Platform → UI

- **Output**: SharedArrayBuffer updates
- **Example**: Sprite positions written by worker, read by Konva

### UI → Runtime

- **Output**: Web Worker messages (`EXECUTE`, `STOP`, `INPUT_RESPONSE`)

## Common Scenarios

### New BASIC Command

Teams: Parser → Runtime → (maybe Platform)

### New IDE Feature

Teams: UI only

### Animation/Sprite Feature

Teams: Platform → Runtime

### Bug Fix

Teams: Usually single team (identify which layer)

## Commands

Use these to delegate to specific teams:

- `/parser <task>` - Parser team work
- `/runtime <task>` - Runtime team work
- `/ui <task>` - UI team work
- `/platform <task>` - Platform team work
