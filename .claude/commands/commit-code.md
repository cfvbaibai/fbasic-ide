Stage all code changes and commit them with a message following the conventional commit format pattern used in this repository.

## Commit Message Format

### Structure

**Simple Format (one-liner):**
```
<type>: <description>
```

**Complex Format (multi-line with details):**
```
<type>: <summary description>

- <bullet point 1>
  - <sub-bullet if needed>
- <bullet point 2>
- <bullet point 3>
```

**Sectioned Format (for multiple feature areas):**
```
<type>: <summary description>
<Section Name>:

- <bullet point>
- <bullet point>

<Another Section>:

- <bullet point>
```

### Commit Types

- `refactor:` - Code restructuring without changing functionality
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks, dependencies, or data files
- `doc(*):` - Documentation updates

### Style Guidelines

1. **Subject Line**: Lowercase after the colon, descriptive but concise
2. **Multiple Concerns**: Can combine related changes with "and" (e.g., "fix TypeScript errors and lint issues")
3. **Bullet Points**: Use `-` for main points, `  -` (two spaces) for sub-points
4. **Organization**: Group related changes under section headers when appropriate
5. **Detail Level**: Simple changes = one-liner, complex changes = multi-line with bullets

### Examples from Repository

**Simple one-liner:**
- `refactor: remove dark/light theme switching and fix TypeScript errors`
- `refactor: extract composables and GameTabButton component`
- `feat: add sprite inversion and DEF SPRITE statement generation`
- `fix: resolve all linting and TypeScript issues`
- `chore: add car and fireball character sprite data`
- `doc(*): Update documentation for screen and device`

**Multi-line with bullets:**
```
feat: implement CLS command and fix TypeScript/lint issues
- Add CLS (Clear Screen) command implementation
  - Add CLS token to parser
  - Create ClsExecutor with screen clearing functionality
  - Register CLS in StatementRouter
  - Add comprehensive tests for CLS command
- Fix TypeScript errors in IdePage.vue
  - Add 'allChars' to sample type union
- Fix linting issues
  - Remove unused classifyColor import
  - Extract color logic to useImageAnalyzerColors composable
```

**Sectioned format:**
```
feat: integrate VueUse composables and enhance image analyzer i18n
VueUse Integration:

- Add @vueuse/core dependency
- Integrate VueUse composables across features
- Update joystick event handling with improved composable patterns

Image Analyzer i18n:

- Add comprehensive internationalization support
- Add color classification utilities
- Add localized UI strings for en/ja/zh-CN/zh-TW
```

## Usage

Analyze the current git changes, generate an appropriate commit message following the patterns above, stage all changes with `git add -A`, and commit with the generated message.
