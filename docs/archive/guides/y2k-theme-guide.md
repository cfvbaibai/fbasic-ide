# Y2K Futuristic Theme Guide

Comprehensive guide to the enhanced Y2K Futuristic skin featuring authentic early 2000s cyber aesthetics.

## Overview

The Y2K Futuristic theme captures the essence of millennium-era digital culture with:
- **Holographic gradients** - Iridescent color shifts
- **Intense neon glows** - Multi-layered shadow effects
- **Glass-morphism** - Frosted glass translucent surfaces
- **Chrome effects** - Reflective metallic finishes
- **Cyberpunk typography** - Glowing text with depth

## Color Palette

### Primary Colors
- **Electric Cyan**: `#00ffff` - Primary accent color
- **Hot Magenta**: `#ff0099` - Danger/action color
- **Matrix Green**: `#00ff88` - Success/borders
- **Cyber Yellow**: `#ffea00` - Warning color
- **Electric Purple**: `#7700ff` - Info color

### Chrome Grayscale
- Deep void black with blue tint to bright cyber white
- 11 shades optimized for metallic reflective surfaces
- Blue undertones for that authentic cyber aesthetic

## Custom CSS Variables

### Holographic Gradients
```css
--y2k-gradient-holographic    /* Rainbow shimmer effect */
--y2k-gradient-cyber          /* Dark background gradient */
--y2k-gradient-chrome         /* Metallic surface gradient */
--y2k-gradient-neon-border    /* Animated border gradient */
```

### Mega Glows (Multi-Layer Effects)
```css
--y2k-glow-cyan-intense       /* 5-layer cyan glow */
--y2k-glow-magenta-intense    /* 5-layer magenta glow */
--y2k-glow-green-intense      /* 4-layer green glow */
--y2k-glow-multi-color        /* Multi-color neon glow */
```

### Text Effects
```css
--y2k-text-glow-primary       /* Cyan text glow with shadow */
--y2k-text-glow-secondary     /* Magenta text glow */
--y2k-text-glow-accent        /* Green text glow */
```

### Glass-Morphism
```css
--y2k-glass-bg                /* Semi-transparent background */
--y2k-glass-border            /* Translucent border */
--y2k-glass-blur              /* Backdrop blur filter */
```

### Chrome Surfaces
```css
--y2k-chrome-surface          /* Reflective metallic gradient */
```

### Border Effects
```css
--y2k-border-glow-cyan        /* Cyan border with inner/outer glow */
--y2k-border-glow-magenta     /* Magenta border glow */
--y2k-border-glow-multi       /* Multi-color border glow */
```

### Depth & Dimension
```css
--y2k-depth-low               /* Subtle elevation */
--y2k-depth-medium            /* Standard elevation */
--y2k-depth-high              /* Maximum elevation */
```

### Interactive States
```css
--y2k-hover-glow              /* Enhanced hover effect */
--y2k-active-glow             /* Active/pressed state */
```

## Component Enhancements

The theme automatically applies Y2K styling to common UI elements:

### Buttons
- Metallic gradient backgrounds
- Neon border glows
- Text shadows with multiple layers
- Hover effects with color shifts (cyan → magenta)
- Primary buttons feature intense magenta glow

### Inputs & Textareas
- Dark glass-like backgrounds
- Cyan border with subtle glow
- Focus state with intense neon border glow
- Glowing text on focus

### Headers (h1, h2, h3)
- Holographic gradient text effect
- Color shifts from cyan → magenta → green → yellow
- Multi-layer drop shadows
- Uses `background-clip: text` for gradient fill

### Links
- Cyan color with soft glow
- Hover state transitions to magenta with intense glow

### Code Blocks
- Matrix-style green on deep black
- Inner and outer glow effects
- Border with green accent

### Scrollbars
- Chrome-styled track and thumb
- Gradient fills with neon borders
- Intense glow on hover

### Cards & Panels
- Glass-morphism backgrounds
- Backdrop blur effects
- Depth shadows with neon tint
- Hover effects with elevation increase

### Tables
- Cyber grid lines
- Chrome-gradient headers with glowing text
- Row hover effects with neon highlight

### Progress Bars
- Holographic animated fill
- Rainbow gradient progression
- Multi-layer glow effects

### Modals & Dialogs
- Strong glass-morphism
- Thick neon borders
- Dramatic depth shadows
- Inner glow for dimension

## Utility Classes

Quick-apply effects using utility classes:

### Glass-Morphism
```html
<div class="y2k-glass">
  <!-- Frosted glass effect with backdrop blur -->
</div>
```

### Chrome Surface
```html
<div class="y2k-chrome">
  <!-- Reflective metallic surface -->
</div>
```

### Holographic Text
```html
<h1 class="y2k-holographic-text">
  Rainbow Shimmer Text
</h1>
```

### Glow Effects
```html
<div class="y2k-glow-cyan">Cyan glow</div>
<div class="y2k-glow-magenta">Magenta glow</div>
<div class="y2k-glow-green">Green glow</div>
<div class="y2k-glow-multi">Multi-color glow</div>
```

### Neon Borders
```html
<div class="y2k-border-neon">
  <!-- Animated gradient border -->
</div>
```

### Text Glows
```html
<span class="y2k-text-glow-cyan">Glowing cyan text</span>
<span class="y2k-text-glow-magenta">Glowing magenta text</span>
<span class="y2k-text-glow-green">Glowing green text</span>
```

## Usage Examples

### Enhanced Card Component
```vue
<template>
  <div class="game-card y2k-glass">
    <h2 class="y2k-holographic-text">Cyber Title</h2>
    <p class="y2k-text-glow-cyan">Glowing description text</p>
    <button class="primary">Action Button</button>
  </div>
</template>
```

### Custom Neon Element
```vue
<style scoped>
[data-skin="y2k-futuristic"] .custom-element {
  background: var(--y2k-glass-bg);
  border: 2px solid var(--base-solid-primary);
  box-shadow: var(--y2k-glow-cyan-intense);
  backdrop-filter: var(--y2k-glass-blur);
  text-shadow: var(--y2k-text-glow-primary);
}
</style>
```

### Holographic Progress Bar
```vue
<template>
  <div class="progress-container">
    <div class="progress-fill y2k-glow-multi" :style="{ width: progress + '%' }"></div>
  </div>
</template>
```

## Design Principles

The Y2K Futuristic theme follows these key principles:

1. **Layered Depth**: Multiple shadow layers create realistic lighting
2. **Vibrant Energy**: Saturated neon colors demand attention
3. **Glass & Chrome**: Mixing transparent and reflective surfaces
4. **Holographic Magic**: Rainbow gradients for that millennium shimmer
5. **Glow Everything**: Soft halos make elements pop from dark backgrounds

## Performance Notes

- **Backdrop filters** may impact performance on older devices
- **Multi-layer shadows** are GPU-accelerated but use moderately
- **Gradient animations** are CSS-only, no JavaScript overhead
- **Text gradients** with `background-clip` are well-supported in modern browsers

## Browser Support

- Chrome/Edge: Full support ✓
- Firefox: Full support ✓
- Safari: Full support (with `-webkit-` prefixes) ✓
- Older browsers: Graceful degradation (loses some effects)

## Customization Tips

### Adjusting Glow Intensity
Modify glow variables in your component:
```css
--y2k-glow-custom:
  0 0 10px #00ffff,    /* Increase px values for more intense glow */
  0 0 20px #00ffff,
  0 0 40px #00ffff;
```

### Creating Custom Holographic Gradients
```css
--custom-holographic: linear-gradient(
  135deg,
  #ff00ff 0%,     /* Start color */
  #00ffff 50%,    /* Mid color */
  #00ff88 100%    /* End color */
);
```

### Mixing Effects
Combine utility classes for unique looks:
```html
<div class="y2k-glass y2k-glow-multi y2k-border-neon">
  Maximum cyber aesthetic
</div>
```

## Troubleshooting

### Glows Not Visible
- Check background color contrast
- Ensure parent elements don't clip shadows (remove `overflow: hidden`)
- Verify theme is active: `data-skin="y2k-futuristic"`

### Backdrop Blur Not Working
- Requires semi-transparent background
- May not work in private browsing mode (Safari)
- Check browser support for `backdrop-filter`

### Text Gradient Not Showing
- Requires both `background-clip: text` and `-webkit-background-clip: text`
- Set `-webkit-text-fill-color: transparent`
- Won't work with existing `color` property active

## Related Documentation

- [Skin System Guide](./skin-system.md) - Core theming system
- [Architecture Guide](./architecture.md) - System architecture overview

---

**Last Updated**: 2026-01-24
**Theme Version**: Enhanced Edition v2.0
