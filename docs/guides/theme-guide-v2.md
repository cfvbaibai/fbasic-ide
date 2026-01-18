# Theme System Guide

This guide explains the theme system architecture, naming conventions, and usage patterns for the Family Basic IDE application.

**Related Guides:**
- [Color Naming Convention Guide](./color-naming-guide.md) - Complete reference for all CSS variables and solid vs alpha color usage

## Overview

The theme system uses CSS custom properties (variables) to provide consistent, maintainable theming across the application. It supports both **dark theme** (default) and **light theme** (via skin system), each optimized for the retro game aesthetic.

### Design Principles

**Dark Theme vs Light Theme** are **not simple color reversals**. They follow distinct design principles:

- **Dark Theme**: Uses glow effects (via `text-shadow` and `box-shadow`) to express primary/accent colors and create depth
- **Light Theme**: Uses direct color application without glow effects for clear, readable interfaces

## Architecture

The theme system follows a **three-layer architecture**:

### 1. Base Layer (`--base-solid-xxx`, `--base-alpha-xxx`)

**Purpose**: Raw color values that serve as the foundation.

**Naming Convention:**
- `--base-solid-*` - Solid colors (no transparency)
- `--base-alpha-*` - Transparent colors (with opacity/alpha channel)

**Includes:**
- Gray scale colors (`--base-solid-gray-00` through `--base-solid-gray-100`)
- Primary accent color (`--base-solid-primary`)
- Primary color levels (`--base-solid-primary-10` through `--base-solid-primary-90`)
- Transparent variants for shadows, glows, overlays

**Usage**: Use directly only when no game layer equivalent exists. Prefer game layer variables for semantic meaning.

### 2. Game Layer (`--game-xxx`)

**Purpose**: Semantic game-themed variables that abstract base layer implementation.

**Examples:**
- `--game-text-primary` - Primary text color (references `--base-solid-gray-100`)
- `--game-surface-bg-gradient` - Surface background gradient
- `--game-shadow-base` - Standard shadow effect
- `--game-accent-glow` - Accent glow effect (references `--base-alpha-primary-50`)

**Usage**: **Preferred** for all game-themed UI components. Provides semantic meaning and enables future theme changes without modifying component code.

### 3. Semantic Layer (`--semantic-solid-xxx`, `--semantic-alpha-xxx`)

**Purpose**: Semantic color meanings (success, warning, danger, info, neutral).

**Naming Convention:**
- `--semantic-solid-*` - Solid semantic colors
- `--semantic-alpha-*` - Transparent semantic colors

**Examples:**
- `--semantic-solid-success` - Solid success color
- `--semantic-alpha-success-10` - Transparent success color (10% opacity)

**Usage**: Use for semantic meanings (status indicators, alerts, badges, etc.).

## Naming Conventions

### Solid vs Alpha (Transparent) Colors

The naming convention clearly distinguishes solid colors from transparent colors:

**Solid Colors:**
- Prefix: `-solid-` (e.g., `--base-solid-gray-50`, `--base-solid-primary`)
- Use for: Text, backgrounds, borders, brand elements
- Characteristics: Predictable, consistent appearance

**Transparent Colors (Alpha):**
- Prefix: `-alpha-` (e.g., `--base-alpha-gray-00-10`, `--base-alpha-primary-20`)
- Use for: Shadows, glows, overlays, interactive states, 3D effects
- Characteristics: Blend with underlying content

**Opacity Levels:**
- Always two-digit numbers: `-10`, `-20`, `-30`, etc.
- Represents percentage: `-10` = 10% opacity, `-20` = 20% opacity

**Examples:**
```css
/* Solid colors */
--base-solid-gray-100        /* Solid white */
--base-solid-primary         /* Solid primary color */
--semantic-solid-success     /* Solid success color */

/* Transparent colors */
--base-alpha-gray-00-30      /* 30% opacity dark */
--base-alpha-primary-50       /* 50% opacity primary */
--semantic-alpha-success-20  /* 20% opacity success */
```

For detailed guidelines on when to use solid vs alpha colors, see the [Color Naming Convention Guide](./color-naming-guide.md).

### Gray Scale Naming

Gray colors use numeric scale (`-00` through `-100`) instead of "black" or "white":

- `--base-solid-gray-00` - Darkest (was black)
- `--base-solid-gray-100` - Lightest (was white)
- `--base-solid-gray-50` - Middle gray

This naming avoids confusion when switching between light and dark themes.

## Usage Guidelines

### Variable Preference Hierarchy

When styling Vue components, use variables in this order:

1. **`--game-xxx` variables** (Preferred)
   - Use for all game-themed UI components
   - Provides semantic meaning
   - Abstracts implementation details

2. **`--semantic-xxx` variables**
   - Use for semantic meanings (success, warning, danger, info)

3. **`--base-xxx` variables**
   - Only use when no `--game-xxx` or `--semantic-xxx` equivalent exists
   - Examples: Custom shadow combinations, specific opacity levels not exposed by game layer

### Examples

**✅ Good - Use game layer variables:**
```css
.button {
  color: var(--game-text-primary);
  background: var(--game-surface-bg-gradient);
  border: 2px solid var(--game-surface-border);
  box-shadow: var(--game-shadow-base);
}
```

**✅ Good - Use semantic variables for meanings:**
```css
.alert-success {
  background: var(--semantic-solid-success);
  border-color: var(--semantic-alpha-success-50);
}
```

**✅ Acceptable - Use base layer when needed:**
```css
.custom-shadow {
  box-shadow: 
    0 4px 8px var(--base-alpha-gray-00-40),
    0 0 16px var(--base-alpha-primary-30);
}
```

**❌ Avoid - Direct base usage when game layer exists:**
```css
.button {
  color: var(--base-solid-gray-100);  /* Use --game-text-primary instead */
  background: var(--base-solid-gray-20);  /* Use --game-surface-bg-gradient instead */
}
```

## Common Patterns

### Pattern 1: Button with 3D Effect

```css
.button {
  background: var(--game-surface-bg-gradient);  /* Solid gradient */
  border: 2px solid var(--game-surface-border);  /* Solid border */
  color: var(--game-text-primary);  /* Solid text */
  box-shadow: 
    0 2px 4px var(--base-alpha-gray-00-30),      /* Outer dark shadow (alpha) */
    inset 0 1px 0 var(--base-alpha-gray-100-10); /* Inner light highlight (alpha) */
}
```

### Pattern 2: Hover State with Accent

```css
.button:hover {
  border-color: var(--base-solid-primary);  /* Solid accent border */
  box-shadow: 
    0 4px 8px var(--base-alpha-gray-00-40),  /* Darker shadow (alpha) */
    0 0 12px var(--game-accent-glow);        /* Transparent glow */
}
```

### Pattern 3: Text with Glow Effect (Dark Theme)

```css
.title {
  color: var(--game-text-primary);  /* Solid text */
  text-shadow: 
    0 0 8px var(--game-accent-glow),              /* Transparent glow */
    0 4px 8px var(--base-alpha-gray-00-80);      /* Dark shadow for depth */
}

/* Light theme: remove glow, use direct color */
.light-theme .title {
  color: var(--base-solid-primary);
  text-shadow: none;
}
```

### Pattern 4: Modal Overlay

```css
.modal-overlay {
  background: var(--base-alpha-gray-00-50);  /* 50% dark overlay (alpha) */
}

.modal-content {
  background: var(--game-surface-bg-gradient);  /* Solid background */
  border: 2px solid var(--game-surface-border);  /* Solid border */
}
```

## Best Practices

1. **Always use CSS variables** instead of hard-coded colors
2. **Prefer `--game-xxx` variables** for game-themed UI components
3. **Use semantic naming** - `--game-text-primary` instead of `--base-solid-gray-100`
4. **Follow solid vs alpha guidelines:**
   - Solid colors (`-solid-`) for text, backgrounds, borders
   - Alpha colors (`-alpha-`) for shadows, glows, overlays, 3D effects
5. **Leverage utility classes** for common patterns (see `utilities.css`)
6. **Follow dark/light theme principles** - glow effects in dark theme, direct colors in light theme
7. **Use gray scale naming** - `gray-00`/`gray-100` instead of black/white

## Migration

### Replacing Hard-coded Colors

Replace hard-coded hex values with appropriate CSS variables:

| Old Value | New Variable |
|-----------|-------------|
| `#ffffff` | `var(--game-text-primary)` or `var(--base-solid-gray-100)` |
| `#000000` | `var(--base-solid-gray-00)` or `var(--game-screen-bg-color)` |
| `#00ff88` | `var(--base-solid-primary)` |
| `#409eff` | `var(--base-solid-primary)` |

See [Color Naming Convention Guide](./color-naming-guide.md) for complete variable reference.

### Updating Component Styles

**Before:**
```css
.header {
  background: #fff;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
}
```

**After:**
```css
.header {
  background: var(--app-bg-color-page);
  color: var(--app-text-color-primary);
  border-bottom: 1px solid var(--app-border-color-light);
}
```

## Customization

### Changing Default Theme Colors

Edit `src/shared/styles/theme.css` to customize colors:

```css
:root {
  --base-solid-primary: #your-accent-color;
  --base-solid-gray-100: #your-text-color;
}
```

### Using the Skin System

The application includes a skin system for theme switching. See [Skin System Guide](./skin-system.md) for:
- Using alternative skins (e.g., `retro-blue`, `classic-light`)
- Creating new skins
- Programmatically switching skins using the `useSkin` composable

## Reference

- **Complete Variable List**: See [Color Naming Convention Guide](./color-naming-guide.md) for all available CSS variables
- **Solid vs Alpha Usage**: Detailed guidelines in [Color Naming Convention Guide](./color-naming-guide.md)
- **Skin System**: See [Skin System Guide](./skin-system.md) for theme customization
- **Utility Classes**: Available in `src/shared/styles/utilities.css`
