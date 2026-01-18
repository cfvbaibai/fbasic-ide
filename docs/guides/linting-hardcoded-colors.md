# Enforcing No Hardcoded Colors

This guide explains how to enforce the use of CSS variables instead of hardcoded colors in CSS classes and inline styles.

## Overview

There are two types of hardcoded colors to prevent:

1. **CSS/Style blocks**: Colors in `<style>` blocks and `.css` files (hex, rgb, rgba, hsl, named colors)
2. **Inline styles**: Colors in Vue template `:style` bindings (JavaScript/TypeScript code)

## Solution 1: Stylelint for CSS and Style Blocks

Stylelint is the standard tool for linting CSS. It can lint `<style>` blocks in Vue files.

### Installation

```bash
pnpm add -D stylelint stylelint-config-standard stylelint-config-standard-vue postcss-html
```

### Configuration

Create `stylelint.config.js` in the project root:

```javascript
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-vue'
  ],
  rules: {
    // Disallow hex colors (#ffffff, #000, etc.)
    'color-no-hex': true,
    
    // Disallow named colors (red, blue, white, etc.)
    'color-named': 'never',
    
    // Disallow rgb/rgba/hsl/hsla functions (except in theme.css)
    'function-disallow-list': [
      'rgb',
      'rgba',
      'hsl',
      'hsla'
    ],
  },
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    'src/shared/styles/theme.css' // Allow theme.css since it defines CSS variables
  ]
}
```

### Adding to package.json scripts

```json
{
  "scripts": {
    "lint:style": "stylelint \"src/**/*.{css,vue}\"",
    "lint": "eslint . --fix && pnpm lint:style"
  }
}
```

### Limitations

- Stylelint cannot check inline styles in Vue templates (`:style="{ color: '#fff' }"`)
- Stylelint rules for function-disallow-list may need exceptions for theme.css

## Solution 2: ESLint for Inline Styles

ESLint can detect hardcoded colors in Vue template inline styles and JavaScript/TypeScript code.

### Configuration

Add to `eslint.config.ts`:

```typescript
{
  files: ['**/*.vue'],
  rules: {
    // ... existing rules ...
    'no-restricted-syntax': [
      'error',
      {
        selector: "VAttribute[directive=true][key.name.name='style'] > VExpressionContainer",
        message: 'Avoid hardcoded colors in inline styles. Use CSS variables instead.',
      },
      {
        selector: "Property[key.name='color'], Property[key.name='backgroundColor'], Property[key.name='background']",
        message: 'Avoid hardcoded color values. Use CSS variables like var(--game-text-primary).',
      },
    ],
  }
}
```

However, ESLint cannot easily parse CSS color values in template strings. A better approach is using regex patterns.

### Alternative: Custom ESLint Rule (Advanced)

For a more robust solution, you could create a custom ESLint rule or use a plugin. However, this is complex and may not be worth it for most projects.

## Solution 3: Practical Recommendation

Given the complexity of enforcing inline styles, here's a practical approach:

### 1. Use Stylelint for CSS (Recommended)

This catches 90% of violations:

```bash
pnpm add -D stylelint stylelint-config-standard stylelint-config-standard-vue postcss-html
```

Create `stylelint.config.js`:

```javascript
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-vue'
  ],
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
  },
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    'src/shared/styles/theme.css'
  ]
}
```

### 2. Code Review Guidelines

For inline styles, enforce through:
- **Code review**: Add a checklist item to review inline styles
- **Documentation**: Update theme guide to emphasize CSS variables
- **Conventions**: Prefer CSS classes over inline styles whenever possible

### 3. Pre-commit Hook (Optional)

Add a pre-commit hook to run Stylelint:

```bash
pnpm add -D husky lint-staged
```

In `package.json`:

```json
{
  "lint-staged": {
    "*.{css,vue}": ["stylelint --fix"]
  }
}
```

## Example Violations

### ❌ Bad (Will be caught by Stylelint)

```vue
<style scoped>
.bad {
  color: #ffffff;
  background: rgb(0, 0, 0);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
</style>
```

### ✅ Good

```vue
<style scoped>
.good {
  color: var(--game-text-primary);
  background: var(--base-color-black);
  border: 1px solid var(--base-color-white-50);
}
</style>
```

### ⚠️ Inline Styles (Manual Review Needed)

```vue
<!-- Bad - manual review needed -->
<div :style="{ color: '#fff', background: 'rgb(0,0,0)' }">

<!-- Good - use CSS variables -->
<div :style="{ color: 'var(--game-text-primary)', background: 'var(--base-color-black)' }">
```

## Known Exceptions

Some hardcoded colors are intentional design patterns without CSS variables. See `docs/guides/stylelint-exceptions.md` for details:

- `#00cc6a` - Gradient design pattern (darker accent color variant)
- `#c88a2e`, `#d44a4a`, `#6d7075` - Semantic color dark variants for gradients

These can be handled with `stylelint-disable` comments or documented as known exceptions.

## Summary

1. **Install Stylelint** for CSS and `<style>` blocks - catches most violations
2. **Use code review** for inline styles - manual but practical
3. **Prefer CSS classes** over inline styles when possible
4. **Document exceptions** - see `stylelint-exceptions.md` for known design patterns
5. **Use `stylelint-disable` comments** for intentional exceptions

This approach balances enforcement with practicality, catching the majority of violations automatically while allowing documented exceptions for design patterns.
