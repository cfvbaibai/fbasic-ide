# CLAUDE.md

Project configuration for Claude Code. This file provides essential context, constraints, and workflows for working with this codebase.

## Project Overview

Family Basic IDE - a web-based emulator/IDE for the F-BASIC programming language (Nintendo Family Computer's BASIC).

**Tech Stack**: Vue 3, TypeScript, Vite, Chevrotain parser

**Skills**: Vue 3 and VueUse best practices are available as agent skills. See [Architecture](docs/guides/architecture.md) for system architecture details.

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


## Development Guidelines

### Library Selection
- **ALWAYS** search for existing, well-maintained libraries on GitHub before implementing functionality from scratch
- Prefer established libraries with active maintenance, good documentation, and compatible licenses
- Only implement custom solutions when no suitable library exists or when specific project requirements cannot be met by existing libraries

## Code Constraints

### File Size Limits
- `.ts` files: **MAX 500 lines** - extract to focused modules when approaching limit
- `.vue` files: **MAX 500 lines** - extract to focused modules when approaching limit

### TypeScript
- **ALWAYS** use strict mode (enabled)
- **ALWAYS** use `import type` for type-only imports
- **NEVER** use `any` type - use specific types or `unknown`
- **ALL** constants in `src/core/constants.ts`

### Vue Component Styling
- **ALWAYS** use `<style scoped>` blocks, not external CSS imports
- **Exception**: Only `@/shared/styles/*.css` imports allowed
- Prefer utility classes and CSS variables over component-scoped styles

### Testing
- **ALWAYS** use `.toEqual()` for exact matching, not `.toContain()` for values
- Test files in `test/` mirror source structure

## Documentation Guidelines

### Directory Structure

**ALL documentation files MUST be organized in the `docs/` directory:**

- `docs/planning/` - Refactoring plans, migration plans, feature proposals
- `docs/guides/` - How-to guides and integration documentation
- `docs/analysis/` - Analysis reports and technical reviews
- `docs/device-models/` - Device specifications and architecture
- `docs/reference/` - Language references, manuals, specifications
- `docs/poc/` - Experimental documentation and POCs

**NEVER create documentation files at the workspace root.** All documentation belongs in `docs/` with appropriate subdirectories.

### File Naming
- Use kebab-case: `feature-name-plan.md`, `refactoring-guide.md`
- Be descriptive but concise
- Include document type when helpful: `*-plan.md`, `*-guide.md`, `*-analysis.md`

## Commits

Use the `commit-code` command for commits. Follow conventional commit format: `refactor:`, `feat:`, `fix:`, `chore:`, `doc(*):`.
