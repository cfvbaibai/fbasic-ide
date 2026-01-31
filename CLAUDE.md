# CLAUDE.md

AI-first project configuration for working with this codebase efficiently.

## Quick Reference

**Project**: Family Basic IDE - Web-based F-BASIC emulator/IDE
**Stack**: Vue 3, TypeScript, Vite, Chevrotain parser
**Tests**: 930 tests, Vitest 4.0.18
**Node**: ≥24.13.0

## Essential Reading (Start Here)

1. [Architecture](docs/guides/architecture.md) - System overview, file structure, key patterns
2. [Vue Patterns](docs/guides/vue-patterns.md) - Vue 3 best practices
3. [Theme Patterns](docs/guides/theme-patterns.md) - CSS variable system
4. [Device Essentials](docs/device-models/device-essentials.md) - Screen & joystick architecture
5. [Remaining Work](docs/planning/remaining-work-plan.md) - Active planning document
6. [CHANGELOG](docs/CHANGELOG.md) - Recent changes and implementation notes

## AI Workflow

**For feature work**: Read architecture.md → Check remaining-work-plan.md → Implement
**For bug fixes**: Check CHANGELOG.md for recent changes → Debug
**For refactoring**: Review vue-patterns.md → Apply best practices
**For UI work**: Review theme-patterns.md → Use existing variables

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

- `docs/guides/` - Essential AI patterns (architecture, Vue, theme)
- `docs/planning/` - Active planning documents
- `docs/analysis/` - Current analysis and compatibility reviews
- `docs/device-models/` - Device architecture essentials
- `docs/reference/` - F-BASIC language manual (96 pages + PDF)
- `docs/poc/` - Proof of concepts (experimental)
- `docs/archive/` - Historical documentation
- `docs/CHANGELOG.md` - All project changes (consolidated)

**NEVER create documentation files at the workspace root.** All documentation belongs in `docs/` with appropriate subdirectories.

### Changelog Updates

- **ALL changelog entries** go in `docs/CHANGELOG.md`
- Format: `## YYYY-MM-DD - Title` for each date
- Keep reverse chronological order (newest first)
- Include: what changed, why, impact, status

### File Naming
- Use kebab-case: `feature-name-plan.md`, `refactoring-guide.md`
- Be descriptive but concise
- Include document type when helpful: `*-plan.md`, `*-guide.md`, `*-analysis.md`

## Commits

Use the `commit-code` command for commits. Follow conventional commit format: `refactor:`, `feat:`, `fix:`, `chore:`, `doc(*):`.
