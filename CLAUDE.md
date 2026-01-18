# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Family Basic IDE - a web-based emulator/IDE for the F-BASIC programming language (Nintendo Family Computer's BASIC). Built with Vue 3, TypeScript, Vite, and Chevrotain parser.

## Development Commands

```bash
pnpm dev              # Start dev server (builds web worker first)
pnpm build            # Production build
pnpm lint             # ESLint with auto-fix
pnpm type-check       # TypeScript type checking
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:run <path>  # Run specific test file (no -- separator needed)
                      # Example: pnpm test:run test/executors/RestoreExecutor.test.ts
```

## Architecture

### Core Interpreter (DOM-free)
- `src/core/BasicInterpreter.ts` - Main interpreter orchestrating parsing and execution
- `src/core/parser/FBasicChevrotainParser.ts` - Chevrotain-based CST parser
- `src/core/execution/ExecutionEngine.ts` - Executes programs from CST
- `src/core/execution/executors/*.ts` - Individual statement executors (LetExecutor, PrintExecutor, etc.)
- `src/core/evaluation/ExpressionEvaluator.ts` - Expression evaluation
- `src/core/state/ExecutionContext.ts` - Runtime state management
- `src/core/devices/*.ts` - Device adapters (joystick, screen output)

**Key Pattern**: Direct CST execution - no AST conversion. Parser outputs CST, executors consume CST nodes directly.

### Frontend
- `src/features/ide/` - Code editor, runtime output, controls
- `src/features/sprite-viewer/` - Character sprite viewer
- `src/shared/components/ui/` - Reusable Game* UI components
- `src/shared/styles/` - Global CSS (theme.css, utilities.css)

### Reference Documentation
- `docs/reference/family-basic-manual/` - Original F-BASIC manual pages (consult for language behavior)

## Code Constraints

### File Size Limits
- `.ts` files: max 500 lines
- `.vue` files: max 500 lines
- Extract to focused modules when approaching limits

### Vue Component Styling
- Use `<style scoped>` blocks, not external CSS imports
- Exception: Only `@/shared/styles/*.css` imports allowed
- Prefer utility classes and CSS variables over component-scoped styles

### TypeScript
- Strict mode enabled
- Use `import type` for type-only imports
- No `any` type - use specific types or `unknown`
- All constants in `src/core/constants.ts`

### Testing
- Use `.toEqual()` for exact matching, not `.toContain()` for values
- Test files in `test/` mirror source structure

## Commit Convention

```
refactor: description  # code restructuring
feat: description      # new features
fix: description       # bug fixes
chore: description     # maintenance, data files
doc(*): description    # documentation
```
