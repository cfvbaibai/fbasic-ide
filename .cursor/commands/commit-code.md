Stage all code changes and commit them with a message following the conventional commit format pattern used in this repository.

Analyze the current git changes, generate an appropriate commit message following the conventional commit format (refactor:, feat:, fix:, chore:, doc(*):, etc.), stage all changes with `git add -A`, and commit with the generated message.

Commit message examples from this repository:
- `refactor: remove dark/light theme switching and fix TypeScript errors`
- `refactor: extract composables and GameTabButton component`
- `feat: add sprite inversion and DEF SPRITE statement generation`
- `fix: resolve all linting and TypeScript issues`
- `chore: add car and fireball character sprite data`
- `doc(*): Update documentation for screen and device`

Use the appropriate commit type:
- `refactor:` for code restructuring without changing functionality
- `feat:` for new features
- `fix:` for bug fixes
- `chore:` for maintenance tasks, dependencies, or data files
- `doc(*):` for documentation updates
