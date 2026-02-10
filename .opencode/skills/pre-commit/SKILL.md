---
name: pre-commit
description: Run comprehensive pre-commit checks including TypeScript, ESLint, and Stylelint. Use when the user wants to run pre-commit checks with commands like '/pre-commit', 'check my code', 'run linting', or before committing changes. Reviews code against Vue 3 and VueUse best practices and fixes all issues.
---

# Pre-Commit Skill

Run comprehensive pre-commit checks for the Family Basic IDE codebase.

## Quick Start

Run all pre-commit checks:
```bash
scripts/run-checks.sh
```

Run checks without auto-fix (fails on any issues):
```bash
scripts/run-checks.sh --no-fix
```

Run checks on changed files only:
```bash
scripts/run-checks.sh --changed-only
```

## What Gets Checked

The script runs three categories of checks:

### 1. TypeScript Type Checking
- Validates type correctness across all TypeScript files
- Ensures strict mode compliance (no `any` types)
- Checks import type usage

### 2. ESLint
- Checks TypeScript and Vue files for code quality issues
- Auto-fixes most issues when run without `--no-fix`
- Enforces Vue 3 and VueUse best practices

### 3. Stylelint
- Validates CSS/SCSS syntax and organization
- Checks for proper scoping and specificity

## Manual Check Commands

If you need to run checks individually:

```bash
pnpm type-check    # TypeScript type checking
pnpm lint          # ESLint with auto-fix
pnpm lint:style    # Stylelint checking
```

## Troubleshooting

### TypeScript Errors

**Common Issues**:
- Missing type imports → Use `import type` for type-only imports
- Implicit any errors → Add explicit type annotations
- Property missing on type → Check interface definitions

**Fix Pattern**:
```typescript
// ❌ Wrong
import { MyComponent } from './Component'
const props: MyComponent = component.props

// ✅ Correct
import type { MyComponentProps } from './Component'
const props: MyComponentProps = component.props
```

### ESLint Errors

**Common Vue 3 Issues**:
- Props destructuring losing reactivity → Use `toValue()` or access via `props.name`
- Missing template refs → Use `useTemplateRef()` (Vue 3.5+)
- Unscoped styles → Add `<style scoped>` to components

**Fix Pattern**:
```vue
<script setup lang="ts">
// ❌ Wrong - loses reactivity
const { value } = props

// ✅ Correct - preserves reactivity
import { toValue } from 'vue'
const currentValue = computed(() => toValue(props.value))
</script>
```

### Stylelint Errors

**Common Issues**:
- Selector specificity → Use more specific selectors or scoped styles
- Duplicate properties → Consolidate rules
- Invalid CSS syntax → Check for typos or missing units

## Best Practices

### During Development
- Run `pnpm type-check` after significant changes
- Use `pnpm lint` with auto-fix regularly
- Fix type issues immediately (they compound)

### Before Committing
- Run the full check script: `scripts/run-checks.sh`
- Review any remaining issues
- Ensure all checks pass before committing

### Code Style Guidelines
- Use `import type` for type-only imports
- Prefer `const` over `let` when possible
- Use `const` assertions for literals: `const x = 'value' as const`
- Maintain strict type safety (no `any` types)

## Summary Report

After running checks, provide:

- **Files checked**: Number of files processed
- **Issues found**: Count of TypeScript, ESLint, and Stylelint issues
- **Auto-fixed**: Issues automatically resolved
- **Manual fixes needed**: Issues requiring manual intervention
- **Status**: Pass/Fail summary
