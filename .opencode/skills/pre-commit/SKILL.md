---
name: pre-commit
description: Run comprehensive pre-commit checks including TypeScript, ESLint, and Stylelint. Use when the user wants to run pre-commit checks with commands like '/pre-commit', 'check my code', 'run linting', or before committing changes. Reviews code against Vue 3 and VueUse best practices and fixes all issues.
---

# Pre-Commit Skill

Run comprehensive pre-commit checks for the Family Basic IDE codebase.

## Workflow

1. **Get Changed Files**: Identify all changed files
   - Run `git status` to see current changes
   - If on a feature branch, run `git diff --name-only master...HEAD` or `git diff --name-only main...HEAD`

2. **Fix TypeScript Issues**:
   - Run `pnpm type-check` to identify TypeScript errors
   - Fix all TypeScript type errors in changed files
   - Re-run type-check to verify fixes

3. **Fix ESLint Issues**:
   - Run `pnpm lint` (includes auto-fix via `--fix` flag)
   - Review any remaining ESLint issues
   - Verify all ESLint issues are resolved

4. **Fix Stylelint Issues**:
   - Run `pnpm lint:style` to check style issues
   - Fix any remaining Stylelint issues
   - Verify all Stylelint issues are resolved

## Commands Reference

- `pnpm type-check` - TypeScript type checking
- `pnpm lint` - ESLint with auto-fix
- `pnpm lint:style` - Stylelint checking

## Best Practices

- Focus on fixing issues in changed files first
- Try auto-fix commands first before manual fixes
- Re-run checks after each fix to verify
- Maintain strict type safety (no `any` types)
- Use `import type` for type-only imports

## Summary Report

At the end, provide:

- Files reviewed
- Issues found and fixed
- Any remaining issues requiring manual intervention
