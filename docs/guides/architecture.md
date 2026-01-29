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

## Sprite & Animation (Core)

- `src/core/animation/AnimationManager.ts` - Manages DEF MOVE / MOVE: 8 action slots, movement state, commands to device
- `src/core/animation/CharacterAnimationBuilder.ts` - Builds character animation configs from CHARACTER_SPRITES and characterSequenceConfig
- `src/core/animation/characterSequenceConfig.ts` - Explicit direction/sprite config per character (0-15)
- `src/core/animation/sharedAnimationBuffer.ts` - SharedArrayBuffer layout for sprite positions (0-192 bytes)
- `src/core/animation/sharedDisplayBuffer.ts` - Combined buffer: sprites + screen cells + cursor + sequence + scalars (1548 bytes)
- `src/core/sprite/types.ts` - DefSpriteDefinition, SpriteState, MoveDefinition, MovementState
- `src/core/sprite/SpriteStateManager.ts` - Manages 8 static sprite slots (DEF SPRITE / SPRITE)
- `src/core/sprite/characterSetConverter.ts` - Converts DEF SPRITE character set to tiles (Table A)
- `src/core/execution/executors/DefSpriteExecutor.ts`, `SpriteExecutor.ts`, `SpriteOnOffExecutor.ts` - Static sprites
- `src/core/execution/executors/DefMoveExecutor.ts`, `MoveExecutor.ts`, `CutExecutor.ts`, `EraExecutor.ts`, `PositionExecutor.ts` - Animated movement

**Key Pattern**: Worker holds definitions and movement state; main thread renders via Konva and reads/writes shared buffer. See [Screen device architecture](../device-models/screen/architecture.md) and [Remaining work plan – Phase 5 Sprite System](../planning/remaining-work-plan.md#phase-5-implement-sprite-system--complete).

## Frontend

- `src/features/ide/` - Code editor, runtime output, controls
- `src/features/sprite-viewer/` - Character sprite viewer
- `src/shared/components/ui/` - Reusable Game* UI components
- `src/shared/styles/` - Global CSS (theme.css, utilities.css)

## Reference Documentation

- `docs/reference/family-basic-manual/` - Original F-BASIC manual pages (consult for language behavior)
