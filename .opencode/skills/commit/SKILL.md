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

```
feat: add CIRCLE command to F-BASIC parser

Add CIRCLE token, grammar rule, and CircleExecutor for drawing circles.
- Parser: Add circleStatement rule
- Runtime: Implement CircleExecutor with device.drawCircle() call
- Platform: Add drawCircle method to BasicDeviceAdapter

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

```
fix: resolve GOTO executor line number bug

Fix incorrect line number lookup in GotoExecutor that caused jumps
to go to wrong lines. Use ExecutionContext.getLineOffset() for
accurate line number to program counter mapping.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

```
refactor: extract animation logic to AnimationManager

Extract sprite animation state from executors into dedicated AnimationManager
class. Improves testability and reduces executor complexity.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

```
chore: update dependencies

Update all dependencies to latest versions. No functional changes.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

```
docs: add platform team context

Add platform-team.md with device adapter patterns, SharedBuffer layout,
and animation worker architecture.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

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
