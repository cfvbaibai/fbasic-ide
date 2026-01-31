# CLAUDE.md

AI-first configuration for the Family Basic IDE codebase.

## Project
Family Basic IDE - Web-based F-BASIC emulator/IDE
Stack: Vue 3, TypeScript, Vite, Chevrotain
Tests: 930 tests, Vitest 4.0.18

## Workflow

**Always start with**: `/lead <task description>`

Tech lead will:
1. Analyze against architecture
2. Spawn appropriate team sub-agents
3. Integrate results

## Teams

- **Parser** (`/parser`) - Grammar, CST, Chevrotain → `src/core/parser/`
- **Runtime** (`/runtime`) - Executors, state, expressions → `src/core/execution/`, `src/core/evaluation/`, `src/core/state/`
- **UI** (`/ui`) - Vue, IDE, theming → `src/features/`, `src/shared/`
- **Platform** (`/platform`) - Devices, sprites, animation → `src/core/animation/`, `src/core/sprite/`, `src/core/devices/`

Each team context: `docs/teams/<team>-team.md`

## Code Constraints
- Files: **MAX 500 lines** - extract to focused modules when approaching limit
- TypeScript: strict mode, no `any`, `import type` for types
- Vue: `<style scoped>` only (exception: `@/shared/styles/*` imports)
- Tests: `.toEqual()` for exact matching, not `.toContain()`
- Constants: `src/core/constants.ts`

## Commands
```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # ESLint with auto-fix
pnpm type-check       # TypeScript type checking
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:run <path>  # Run specific test file
```

## Commits
Use `/commit` command. Format: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`

## Documentation
- `docs/teams/` - Team contexts (start here for your role)
- `docs/reference/` - F-BASIC language manual
- `docs/roadmap.md` - Active work planning
- `docs/CHANGELOG.md` - Project history
