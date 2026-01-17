# Theme System Guide

This guide explains how to use the standardized color system with custom Game* components.

## Overview

The theme system uses CSS variables to provide consistent colors across the application. The application uses a **single dark theme** optimized for the retro game aesthetic.

## Setup

The theme system is automatically initialized when the app starts. The theme CSS is imported in `src/main.ts`:

```typescript
import './shared/styles/theme.css'
```

## Using CSS Variables

### Application Colors

Application colors for the dark theme:

```css
/* Background colors */
--app-bg-color              /* Main background */
--app-bg-color-page         /* Page/container background */
--app-fill-color            /* Fill color for components */
--app-fill-color-blank      /* Blank/white background */

/* Text colors */
--app-text-color-primary     /* Primary text */
--app-text-color-regular    /* Regular text */
--app-text-color-secondary   /* Secondary text */
--app-text-color-placeholder /* Placeholder text */

/* Border colors */
--app-border-color           /* Base border */
--app-border-color-light    /* Light border */
--app-border-color-lighter  /* Lighter border */
--app-border-color-extra-light /* Extra light border */

/* Shadows */
--app-box-shadow-base       /* Base shadow */
--app-box-shadow-dark       /* Dark shadow */
--app-box-shadow-light      /* Light shadow */
```

## Usage Examples

### In Vue Components

#### Using CSS Variables in `<style>` blocks:

```vue
<template>
  <div class="my-component">
    <h2 class="title">Title</h2>
    <div class="content">Content</div>
  </div>
</template>

<style scoped>
.my-component {
  background-color: var(--app-bg-color-page);
  border: 1px solid var(--app-border-color);
  box-shadow: var(--app-box-shadow-base);
}

.title {
  color: var(--app-text-color-primary);
}

.content {
  color: var(--app-text-color-regular);
  border-top: 1px solid var(--app-border-color-light);
}
</style>
```

#### Using Utility Classes:

```vue
<template>
  <div class="bg-game-surface text-game-heading">
    Game-themed background and heading text
  </div>
  <div class="text-game-accent">
    Accent colored text
  </div>
</template>
```

Available utility classes (from `src/shared/styles/utilities.css`):
- **Background**: `.bg-game-surface`
- **Text**: `.text-game-heading`, `.text-game-accent`, `.text-game-secondary`
- **Text Shadows**: `.text-shadow-glow-sm`, `.text-shadow-glow-md`
- **Box Shadows**: `.shadow-game-base`
- **Borders**: `.border-game-surface`, `.border-game-surface-2`, `.border-game-surface-top`, `.border-game-surface-bottom`, `.border-game-surface-left`, `.border-game-surface-right`

**Note**: For semantic colors (success, warning, danger, info), use CSS variables directly rather than utility classes.

### In Inline Styles

```vue
<template>
  <div :style="{ backgroundColor: 'var(--app-bg-color-page)' }">
    Content
  </div>
</template>
```

### Replacing Hard-coded Colors

**Before:**
```css
.container {
  background-color: #ffffff;
  color: #303133;
  border: 1px solid #e4e7ed;
}
```

**After:**
```css
.container {
  background-color: var(--app-bg-color-page);
  color: var(--app-text-color-primary);
  border: 1px solid var(--app-border-color-light);
}
```


## Migration Guide

### Step 1: Replace Hard-coded Colors

Find and replace hard-coded color values with CSS variables:

| Old Value | New Variable |
|-----------|-------------|
| `#ffffff` | `var(--game-text-primary)` (for text) or `var(--game-color-white)` |
| `#000000` | `var(--game-color-black)` or `var(--game-screen-bg-color)` |
| `#303133` | `var(--app-text-color-primary)` (app text) or `var(--game-text-primary)` (game text) |
| `#909399` | `var(--app-text-color-secondary)` (app text) or `var(--game-text-secondary)` (game text) |
| `#e4e7ed` | `var(--app-border-color-light)` |
| `#409eff` | `var(--game-accent-color)` |
| `#00ff88` | `var(--game-accent-color)` (game accent color) |

### Step 2: Update Component Styles

Replace hard-coded colors in component `<style>` blocks:

```vue
<!-- Before -->
<style scoped>
.header {
  background: #fff;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
}
</style>

<!-- After -->
<style scoped>
.header {
  background: var(--app-bg-color-page);
  color: var(--app-text-color-primary);
  border-bottom: 1px solid var(--app-border-color-light);
}
</style>
```


## Best Practices

1. **Always use CSS variables** instead of hard-coded colors
2. **Use semantic color names** (e.g., `--app-text-color-primary` instead of `--app-color-gray-1`)
3. **Use Game* component colors** for component-specific styling when appropriate
4. **Leverage utility classes** for common patterns
5. **Maintain dark theme consistency** - all colors are designed for the dark theme

## Customization

To customize theme colors, edit `src/shared/styles/theme.css`:

```css
:root {
  /* Override application colors */
  --app-bg-color: #your-bg-color;
  --game-accent-color: #your-accent-color;
}
```

## Troubleshooting

### Colors not displaying correctly

1. Ensure `./shared/styles/theme.css` is imported in `main.ts`
2. Verify CSS variables are defined in `:root` selector in `theme.css`
3. Check that you're using the correct CSS variable names (see CSS Variables section above)
4. Use browser DevTools to inspect computed CSS variable values

