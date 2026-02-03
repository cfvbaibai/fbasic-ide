# AGENTS.md

AI agent instructions for the Family Basic IDE codebase.

## Commands

### Development

```bash
pnpm dev              # Start dev server (builds service worker first)
pnpm build            # Production build with type checking
pnpm preview          # Preview production build
```

### Code Quality

```bash
pnpm lint             # ESLint with auto-fix + stylelint
pnpm type-check       # TypeScript type checking (no emit)
```

### Testing

```bash
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:run <path>  # Run specific test file (e.g., pnpm test:run test/parser/lexer.test.ts)
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage
```

### Utilities

```bash
pnpm build-service-worker   # Build the web worker
pnpm visualize-cst          # Visualize CST tree
```

## Code Style

### TypeScript

- **Strict mode** enabled - no `any` types
- Use `import type` for type-only imports
- Max 500 lines per file (enforced by ESLint)
- Max 120 characters per line
- No semicolons, single quotes, 2-space indentation (Prettier)

### Imports

- Use `@/` alias for all imports (e.g., `@/core/parser/lexer`)
- Same-folder imports allowed (`./Component`)
- Parent folder imports limited to depth 1 (`../composables/useX`)
- Sort imports automatically (eslint-plugin-simple-import-sort)
- Never use relative paths like `../../` - refactor to use `@/` instead

### Naming Conventions

- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase (no `I` prefix for interfaces)
- **Constants**: UPPER_CASE or camelCase
- **Composables**: Must start with `use` (e.g., `useBasicIdeState`)
- **Vue Components**: PascalCase in templates
- **Custom Events**: camelCase (e.g., `@my-event` not `@myEvent`)

### Vue 3 Conventions

- Use `<script setup>` exclusively
- Style blocks must use `<style scoped>` (except `@/shared/styles/*` imports)
- SFC block order: script, template, style
- Use `useTemplateRef()` for template refs in script setup
- Preserve reactivity: never destructure refs/props directly

### Error Handling

- Use specific error types from `@/features/ide/errors/`
- Handle promises with `await` - no floating promises
- Use nullish coalescing (`??`) over logical OR for defaults
- Use optional chaining (`?.`) for safe property access

### Testing

- Use `.toEqual()` for exact matching (not `.toContain()`)
- Mock external APIs (fetch, etc.) in tests
- Test files: `*.test.ts` alongside source or in `test/` directory

## Project Structure

```
src/
├── core/               # Parser + Runtime teams
│   ├── parser/         # Grammar, CST (Chevrotain)
│   ├── execution/      # Statement executors
│   ├── evaluation/     # Expression evaluation
│   ├── state/          # Execution state/context
│   ├── animation/      # Animation manager (Platform)
│   ├── sprite/         # Sprite state manager (Platform)
│   └── devices/        # Device adapters (Platform)
├── features/           # UI team
│   ├── ide/            # Main IDE feature
│   └── sprite-viewer/  # Sprite viewer feature
└── shared/             # Shared UI components/utilities
    ├── components/
    ├── composables/
    └── styles/

test/                   # Test suites by domain
```

## Team Commands

When working on a task, use the team command prefix:

- `/lead <task>` - Tech lead analysis and orchestration
- `/parser <task>` - Parser team (grammar, CST, tokens)
- `/runtime <task>` - Runtime team (executors, evaluation, state)
- `/ui <task>` - UI team (Vue components, IDE features)
- `/platform <task>` - Platform team (animation, sprites, devices)
- `/commit` - Create commit with proper format

## Commit Format

```
feat:     New feature
fix:      Bug fix
refactor: Code restructuring
chore:    Maintenance, deps, config
docs:     Documentation only
```

## Constants

Place shared constants in `src/core/constants.ts`.
