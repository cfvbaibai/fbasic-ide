# Theme System Guide

This guide explains how to use the standardized color system with custom Game* components, including dark/light theme support.

## Overview

The theme system uses CSS variables to provide consistent colors across the application. It supports:
- **Light theme** (default)
- **Dark theme**
- **Auto mode** (follows system preference)

## Setup

The theme system is automatically initialized when the app starts. The theme CSS is imported in `src/main.ts`:

```typescript
import './shared/styles/theme.css'
```

## Using CSS Variables

### Application Colors

Custom application colors that work in both themes:

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
  <div class="bg-primary text-primary">
    Primary colored background and text
  </div>
</template>
```

Available utility classes:
- `.bg-primary`, `.bg-success`, `.bg-warning`, `.bg-danger`, `.bg-info`
- `.text-primary`, `.text-regular`, `.text-secondary`, `.text-placeholder`
- `.border-base`, `.border-light`

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

## Theme Management

### Using the `useTheme` Composable

```vue
<script setup lang="ts">
import { useTheme } from '@/shared/composables/useTheme'

const { themeMode, isDark, setThemeMode, toggleTheme } = useTheme()

// Set specific theme
setThemeMode('dark')  // 'light' | 'dark' | 'auto'

// Toggle between light and dark
toggleTheme()

// Check current state
console.log(isDark.value)  // true or false
console.log(themeMode.value)  // 'light' | 'dark' | 'auto'
</script>
```

### Theme Toggle Component

A ready-to-use theme toggle component is available:

```vue
<template>
  <ThemeToggle />
</template>

<script setup lang="ts">
import ThemeToggle from '@/shared/components/ThemeToggle.vue'
</script>
```

## Migration Guide

### Step 1: Replace Hard-coded Colors

Find and replace hard-coded color values with CSS variables:

| Old Value | New Variable |
|-----------|-------------|
| `#ffffff` | `var(--app-bg-color-page)` or `var(--app-fill-color-blank)` |
| `#f5f5f5` | `var(--app-bg-color)` |
| `#303133` | `var(--app-text-color-primary)` |
| `#606266` | `var(--app-text-color-regular)` |
| `#909399` | `var(--app-text-color-secondary)` |
| `#e4e7ed` | `var(--app-border-color-light)` |
| `#409eff` | `var(--game-accent-color)` |

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

### Step 3: Add Theme Toggle (Optional)

Add a theme toggle to your app header or settings:

```vue
<template>
  <div class="app-header">
    <h1>My App</h1>
    <ThemeToggle />
  </div>
</template>
```

## Best Practices

1. **Always use CSS variables** instead of hard-coded colors
2. **Use semantic color names** (e.g., `--app-text-color-primary` instead of `--app-color-gray-1`)
3. **Test in both themes** to ensure proper contrast and readability
4. **Use Game* component colors** for component-specific styling when appropriate
5. **Leverage utility classes** for common patterns

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

### Colors not updating in dark mode

1. Ensure `./shared/styles/theme.css` is imported in `main.ts`
2. Check that the `.dark` class is applied to the `<html>` element
3. Verify CSS variables are defined in both `:root` and `.dark` selectors

### Theme toggle not working

1. Ensure `useTheme` composable is called in a component that's mounted
2. Check browser console for errors
3. Verify localStorage is available (for theme persistence)

