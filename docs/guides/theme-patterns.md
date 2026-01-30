# Theme System Patterns

Essential patterns for working with the theme system in this codebase.

## Architecture Overview

**Three-layer system**:
1. **Base Layer** (`--base-solid-*`, `--base-alpha-*`) - Raw color values
2. **Game Layer** (`--game-*`) - Semantic game-themed variables (PREFERRED)
3. **Semantic Layer** (`--semantic-solid-*`, `--semantic-alpha-*`) - Status colors

**Key Rule**: Always prefer `--game-*` variables over base/semantic layers.

## Solid vs Alpha Colors

**Solid colors** (`-solid-`):
- Use for: Text, backgrounds, borders, brand elements
- Examples: `--base-solid-gray-50`, `--game-text-primary`

**Alpha colors** (`-alpha-`):
- Use for: Shadows, glows, overlays, hover states
- Examples: `--base-alpha-primary-20`, `--game-accent-glow`

**Critical Rule**: NEVER use alpha colors for main backgrounds or borders.

## Common Patterns

### Text Styling
```css
.primary-text { color: var(--game-text-primary); }
.muted-text { color: var(--game-text-muted); }
```

### Backgrounds
```css
.surface { background: var(--game-surface-bg-gradient); }
.elevated { background: var(--game-elevated-bg); }
```

### Effects
```css
.shadow { box-shadow: var(--game-shadow-base); }
.glow { box-shadow: var(--game-accent-glow); }
```

### Borders
```css
.bordered { border: 1px solid var(--game-surface-border); }
```

## Dark vs Light Theme Design

**Dark Theme**: Uses glow effects for depth
**Light Theme**: Uses direct color application

These are NOT simple color reversals - each has distinct visual language.

## When to Add New Variables

Only add new CSS variables when:
1. The pattern appears in 3+ components
2. No existing variable fits the use case
3. The value needs theme variation

Otherwise, use existing variables or inline values.
