---
name: commit
description: Create conventional commits with proper formatting. Use when the user wants to commit changes with messages like '/commit', 'commit my changes', 'create a commit', or when staging and committing code. Analyzes git changes and generates appropriate conventional commit messages following the feat/fix/refactor/chore/docs format.
---

# Commit Skill

Create conventional commits for the Family Basic IDE codebase.

## Commit Types

- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code restructuring without changing functionality
- `chore:` - Maintenance, dependencies, data files
- `docs:` - Documentation updates

## Format

**Simple (one-liner):**

```
<type>: <description>
```

**Multi-line:**

```
<type>: <summary>

- Bullet point 1
- Bullet point 2
```

## Examples

- `feat: add CIRCLE command to F-BASIC parser`
- `fix: resolve GOTO executor line number bug`
- `refactor: extract animation logic to AnimationManager`
- `chore: update dependencies`
- `docs: add platform team context`

## Workflow

1. Run `git status` to see current changes
2. Run `git diff` to understand what changed
3. Run `git log --oneline -5` to see recent commit style
4. Analyze changes and determine commit type
5. Stage all changes with `git add -A`
6. Create commit with conventional message using `git commit -m "<type>: <message>"`
7. Run `git status` to verify commit succeeded

## Safety Protocol

- NEVER update git config
- NEVER run destructive commands like `push --force` or `reset --hard`
- NEVER skip hooks unless explicitly requested
- NEVER amend commits unless explicitly requested
