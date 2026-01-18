# Stylelint Color Exceptions

This document lists the hardcoded colors that are intentionally allowed despite the `color-no-hex` rule.

## Design Pattern Colors (No CSS Variables Available)

These colors are used in gradient design patterns but don't have corresponding CSS variables in `theme.css`:

- **`#00cc6a`** - Darker variant of accent color used in gradients
  - Used in: scrollbar, navigation buttons, tab buttons, switch components
  - Pattern: `linear-gradient(135deg, var(--game-accent-color) 0%, #00cc6a 100%)`
  - Reason: Gradient design pattern without CSS variable

- **`#c88a2e`** - Warning color dark variant for gradients
  - Used in: GameButton, GameIconButton
  - Pattern: `linear-gradient(135deg, var(--semantic-warning) 0%, #c88a2e 100%)`
  - Reason: Semantic color dark variant without CSS variable

- **`#d44a4a`** - Danger color dark variant for gradients
  - Used in: GameButton, GameIconButton
  - Pattern: `linear-gradient(135deg, var(--semantic-danger) 0%, #d44a4a 100%)`
  - Reason: Semantic color dark variant without CSS variable

- **`#6d7075`** - Info color dark variant for gradients
  - Used in: GameButton, GameIconButton
  - Pattern: `linear-gradient(135deg, var(--semantic-info) 0%, #6d7075 100%)`
  - Reason: Semantic color dark variant without CSS variable

## Handling These in Stylelint

Since these are intentional design patterns, you have two options:

### Option 1: Add stylelint-disable comments (Recommended)

Add comments above the lines using these colors:

```css
/* stylelint-disable-next-line color-no-hex */
background: linear-gradient(135deg, var(--game-accent-color) 0%, #00cc6a 100%);
```

### Option 2: Accept linting failures

Document that these are known exceptions and accept that `pnpm lint:style` will report them as violations. Review them manually during code review.

## Future Improvement

Consider adding CSS variables for these gradient design patterns to `theme.css`:
- `--game-accent-color-dark: #00cc6a`
- `--semantic-warning-dark: #c88a2e`
- `--semantic-danger-dark: #d44a4a`
- `--semantic-info-dark: #6d7075`

Then replace all hardcoded instances with these variables.
