Run a comprehensive pre-commit check that reviews code changes against Vue3/VueUse best practices and fixes all TypeScript, ESLint, and Stylelint issues.

## Skeptical Behavior

See `.claude/SKEPTICAL_BEHAVIOR.md` - all agents are skeptical collaborators.

## Workflow

1. **Get Changed Files**: Identify all changed files in the current git branch compared to the base branch (typically `master` or `main`)

2. **Review Against Best Practices**: 
   - Review changed files against Vue 3 best practices (use the `vue-best-practices` skill)
   - Review changed files against VueUse best practices (use the `vueuse-best-practices` skill)
   - Fix any issues found according to these best practices

3. **Fix TypeScript Issues**:
   - Run `pnpm type-check` to identify TypeScript errors
   - Fix all TypeScript type errors in the changed files
   - Re-run type-check to verify fixes

4. **Fix ESLint Issues**:
   - Run `pnpm lint` (which includes auto-fix via `--fix` flag)
   - Review and fix any remaining ESLint issues that couldn't be auto-fixed
   - Verify all ESLint issues are resolved

5. **Fix Stylelint Issues**:
   - Run `pnpm lint:style --fix` to auto-fix stylelint issues
   - Review and fix any remaining Stylelint issues that couldn't be auto-fixed
   - Verify all Stylelint issues are resolved

## Implementation Details

- **Git Changes**: 
  - First, determine the base branch (check `git branch --show-current` and compare against `master` or `main`)
  - Use `git diff --name-only <base-branch>...HEAD` to get changed files
  - If on master/main or no base branch exists, use `git status --short` to get unstaged/staged changes
- **Focus on Changed Files**: Prioritize fixing issues in files that have been modified, but also check related files if fixes reveal issues
- **Best Practices**: 
  - Actively use the `vue-best-practices` skill when reviewing Vue components and TypeScript files
  - Actively use the `vueuse-best-practices` skill when reviewing files using VueUse composables
  - Apply best practices from these skills to fix issues
- **Auto-fix First**: Always try auto-fix commands first before manual fixes
- **Verification**: After each fix step, re-run the check to ensure issues are resolved
- **Type Safety**: Ensure all TypeScript fixes maintain strict type safety (no `any` types, use `import type` for type-only imports)

## Commands Reference

- `pnpm type-check` - TypeScript type checking (no auto-fix, manual fixes required)
- `pnpm lint` - ESLint with auto-fix (already includes `--fix` flag)
- `pnpm lint:style --fix` - Stylelint with auto-fix (add `--fix` flag to the script)

## Notes

- **No Changes**: If there are no changes in the current branch, inform the user and exit gracefully
- **No Issues Found**: If all checks pass with no issues, report success to the user
- **Breaking Changes**: If fixes require breaking changes or significant refactoring, inform the user before proceeding
- **Scope**: Focus on fixing issues in changed files first, but also check if fixes in changed files reveal issues in related files
- **Error Handling**: If a check command fails, report the error and continue with the next check where possible
- **Summary**: At the end, provide a summary of:
  - Files reviewed
  - Issues found and fixed
  - Remaining issues (if any) that require manual intervention
