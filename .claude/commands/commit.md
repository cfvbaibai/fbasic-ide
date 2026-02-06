Stage all code changes and commit them with a conventional commit message.

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

## Usage
Analyze git changes, generate appropriate commit message, stage all changes with `git add -A`, and commit.
