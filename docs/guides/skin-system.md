# Skin System Guide

This guide explains the color-based skin system that allows different visual themes while maintaining consistency.

## Overview

The skin system extends the theme architecture to support multiple color schemes (skins) while using the current theme as the default. Each skin redefines the base color layer, and all `--game-xxx` variables automatically adapt.

## Architecture

The skin system follows a hierarchical override pattern:

```
:root (default skin)
  ├── --base-xxx (default values)
  └── --game-xxx (references --base-xxx)

[data-skin="alternative"]
  ├── --base-xxx (overridden values)
  └── --game-xxx (automatically uses new --base-xxx)
```

### Key Principles

1. **Default Skin**: The current theme is the default skin (no attribute needed)
2. **Skin Isolation**: Each skin only overrides `--base-xxx` variables
3. **Automatic Propagation**: `--game-xxx` variables automatically use new base values
4. **Backward Compatible**: Existing code works without changes

## Skin Structure

Skins are defined using CSS attribute selectors:

```css
/* Default skin (current theme) - defined in :root */
:root {
  --base-color-primary: #00ff88;
  /* ... other base colors ... */
}

/* Alternative skin */
[data-skin="retro-blue"] {
  --base-color-primary: #4a9eff;
  /* ... override base colors only ... */
}

[data-skin="retro-blue"] {
  --base-color-primary: #4a9eff;
  /* ... override base colors only ... */
}
```

## Creating a New Skin

1. **Choose base colors** that define the skin's palette
2. **Override only `--base-xxx` variables** (primary, grays, semantic colors)
3. **Don't modify `--game-xxx` variables** - they automatically adapt
4. **Test compatibility** with existing components

### Example: Creating a "Retro Blue" Skin

```css
[data-skin="retro-blue"] {
  /* Primary accent color */
  --base-color-primary: #4a9eff;
  --base-color-primary-10: rgba(74, 158, 255, 0.1);
  --base-color-primary-20: rgba(74, 158, 255, 0.2);
  /* ... continue with all primary variants ... */
  
  /* Optionally override semantic colors */
  --semantic-success: #61ce85;
  /* ... */
}
```

All `--game-xxx` variables (like `--game-accent-color`, `--game-text-primary`) will automatically use the new `--base-color-primary` values.

## Applying a Skin

### Method 1: HTML Data Attribute (Recommended)

Set the `data-skin` attribute on the `<html>` element:

```html
<html data-skin="retro-blue">
  <!-- App content -->
</html>
```

### Method 2: JavaScript/TypeScript

```typescript
// Switch skin programmatically
document.documentElement.setAttribute('data-skin', 'retro-blue')

// Get current skin
const currentSkin = document.documentElement.getAttribute('data-skin') || 'default'

// Remove skin (use default)
document.documentElement.removeAttribute('data-skin')
```

### Method 3: Vue Composable (Recommended for Vue Components)

Use the `useSkin` composable for reactive skin switching:

```typescript
import { useSkin } from '@/shared/composables/useSkin'

const { currentSkin, setSkin, availableSkins } = useSkin()

// Switch skin
setSkin('retro-blue')

// Access current skin reactively
console.log(currentSkin.value) // 'retro-blue'
```

The composable:
- Provides reactive `currentSkin` ref
- Persists skin choice to localStorage
- Automatically applies skin on component mount
- Includes list of available skins with labels

## Available Skins

### Default Skin (Current Theme)

- **Name**: `default` (or no attribute)
- **Primary Color**: `#00ff88` (cyan-green)
- **Description**: The original retro game-themed dark skin
- **File**: Defined in `src/shared/styles/theme.css` under `:root`

### Retro Blue Skin

- **Name**: `retro-blue`
- **Primary Color**: `#4a9eff` (blue)
- **Description**: A blue-tinted retro theme alternative
- **File**: `src/shared/styles/skins/retro-blue.css`

### Nintendo Skin

- **Name**: `nintendo`
- **Primary Color**: `#E60012` (Nintendo Red)
- **Description**: Nintendo-themed skin with inverted black/white colors and Nintendo Red accent
- **File**: `src/shared/styles/skins/nintendo.css`

### Adding New Skins

Additional skins can be added by creating new CSS files with `[data-skin="name"]` selectors. Potential future skins:

- `warm-orange`: Warm orange/amber theme
- `monochrome`: Black and white only
- `purple-dream`: Purple-tinted theme

## Best Practices

1. **Always override at the base layer**: Only modify `--base-xxx` variables in skins
2. **Maintain color relationships**: Ensure semantic relationships remain (e.g., text contrast)
3. **Test all components**: Verify components work correctly with each skin
4. **Document color choices**: Explain why specific colors were chosen for each skin
5. **Keep skins minimal**: Only override what's necessary for the visual theme

## Implementation Details

### File Structure

```
src/shared/styles/
  ├── theme.css          # Default skin (current theme) + base structure
  └── skins/
      ├── retro-blue.css # Alternative skin definitions
      └── nintendo.css   # Nintendo-themed skin
```

### Skin Loading

Skins can be:
- **Compiled-in**: Import all skins in `main.ts` (larger bundle, instant switching)
- **Dynamic**: Load skins on-demand (smaller bundle, requires loading mechanism)
- **Build-time**: Select skin at build time (smallest bundle, no runtime switching)

For now, skins are compiled-in for simplicity. Future enhancements can add dynamic loading.

## Migration Notes

- **Existing code works unchanged**: The default skin is the current theme
- **No breaking changes**: All current CSS variables remain valid
- **Progressive enhancement**: Skins are opt-in via data attribute
- **Component compatibility**: Components using `--game-xxx` variables automatically adapt
