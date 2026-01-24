# Sunset Vaporwave Theme Guide

A dreamy journey into 80s/90s vaporwave aesthetics with pastel gradients, soft glows, and nostalgic vibes.

## 🌅 Overview

**Sunset Vaporwave** captures the essence of late-night drives, neon-lit Japanese cityscapes, and that distinctive A E S T H E T I C feeling. This theme stands apart from our other skins with its unique pastel color palette and dreamy, nostalgic atmosphere.

### Design Philosophy

- **Soft & Dreamy**: Gentle pastel colors instead of harsh neons
- **Nostalgic Warmth**: Sunset hues that evoke emotional memories
- **Smooth Transitions**: Fluid animations with easing curves
- **Atmospheric Depth**: Layered glows create immersive ambiance
- **Retro Romance**: 80s/90s aesthetics without aggressive cyber edge

### Visual Inspiration

- Japanese city pop album covers
- 80s Miami Vice sunset aesthetics
- Vaporwave art movement
- Retro computer graphics
- Pastel sunset photography

## 🎨 Color Palette

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Soft Lavender** | `#c77dff` | Primary accent, links, focus states |
| **Coral Pink** | `#ff6b9d` | Danger, action buttons, highlights |
| **Soft Teal** | `#72dbb8` | Success, code blocks, secondary accents |
| **Sky Blue** | `#7dd3fc` | Info, calm accents, gradient transitions |
| **Warm Peach** | `#ffb86c` | Warning, sunset accents |

### Background Gradient Scale

From darkest to lightest, all with purple undertones:

| Level | Hex | Description |
|-------|-----|-------------|
| 00 | `#0f0a1a` | Deep twilight purple-black |
| 10 | `#1a1228` | Dark violet night |
| 20 | `#251b36` | Midnight purple |
| 30 | `#332744` | Shadow violet |
| 40 | `#443555` | Dusk purple |
| 50 | `#5c4d6b` | Twilight mid-tone |
| 60 | `#7a6b8a` | Lavender gray |
| 70 | `#9a8ca9` | Soft lavender |
| 80 | `#bdb3ca` | Pastel lavender |
| 90 | `#ddd7e5` | Light lavender mist |
| 100 | `#f5f3f8` | Cream white |

### Why This Palette?

Unlike the aggressive cyan/magenta of Y2K or the corporate grays of other themes, Sunset Vaporwave uses:
- **Purple base** for dreamlike atmosphere
- **Warm accents** (coral, peach) for sunset vibes
- **Cool highlights** (teal, sky blue) for balance
- **Pastel saturation** for gentleness vs. neon intensity

## ✨ Signature Effects

### 1. Sunset Gradients

**Primary Sunset Gradient** (`--vapor-gradient-sunset`)
```css
linear-gradient(135deg,
  #ff6b9d 0%,    /* Coral pink */
  #c77dff 25%,   /* Lavender */
  #7dd3fc 50%,   /* Sky blue */
  #72dbb8 75%,   /* Teal */
  #ffb86c 100%   /* Peach */
)
```

Perfect for headers, progress bars, and eye-catching elements.

**Aurora Gradient** (`--vapor-gradient-aurora`)
```css
linear-gradient(135deg,
  #c77dff 0%,    /* Lavender */
  #7dd3fc 50%,   /* Sky blue */
  #72dbb8 100%   /* Teal */
)
```

Ideal for subtle backgrounds and scrollbar styling.

### 2. Soft Glow System

Unlike Y2K's intense 5-layer glows, Vaporwave uses softer 3-4 layer halos:

```css
--vapor-glow-lavender:
  0 0 10px rgba(199, 125, 255, 0.4),
  0 0 20px rgba(199, 125, 255, 0.3),
  0 0 40px rgba(199, 125, 255, 0.2),
  0 0 60px rgba(199, 125, 255, 0.1);
```

Creates ethereal, dreamy halos instead of aggressive neon.

### 3. Dreamy Glass-Morphism

```css
--vapor-glass-bg: rgba(37, 27, 54, 0.6);     /* 60% transparent */
--vapor-glass-border: rgba(199, 125, 255, 0.3);
--vapor-glass-blur: blur(16px);               /* Stronger blur */
```

More translucent and blurred than Y2K for that dreamy effect.

### 4. Animated Shimmer

Headers automatically shimmer between colors:

```css
@keyframes vapor-shimmer {
  0%, 100% {
    filter: drop-shadow(lavender + coral)
  }
  50% {
    filter: drop-shadow(sky + teal)
  }
}
```

Subtle 8-second animation creates living, breathing text.

## 🎯 Component Styling

### Buttons

**Default State**
- Gradient background (midnight → dark violet)
- Lavender border with soft glow
- Lavender text with glow shadow
- Smooth 0.4s cubic-bezier transition

**Hover State**
- Shifts to coral pink color
- Elevates with `translateY(-3px) scale(1.02)`
- Enhanced multi-color glow
- Color smoothly transitions

**Primary Buttons**
- Full coral-peach gradient background
- Dark text for contrast
- Intense coral glow halo

### Inputs & Textareas

- Deep twilight background (70% opacity)
- Lavender border
- Focus state triggers lavender border glow
- Text gains soft glow on focus

### Headers (h1, h2, h3)

- Sunset gradient text using `background-clip`
- Animated shimmer effect (8s loop)
- Multi-color drop shadows
- Transparent fill reveals gradient

### Code Blocks

- Teal-themed (not green like default)
- Deep twilight background
- Soft teal border and text glow
- Matches vaporwave terminal aesthetic

### Progress Bars

- Sunset gradient fill
- Animated brightness pulse (2s loop)
- Rounded corners (11px border-radius)
- Inner highlight for dimension

### Scrollbars

- Aurora gradient thumb (lavender → sky → teal)
- Rounded corners
- Hover triggers sunset gradient shift
- Lavender glow on hover

## 🛠️ CSS Variables Reference

### Gradients

| Variable | Description |
|----------|-------------|
| `--vapor-gradient-sunset` | Full 5-color sunset spectrum |
| `--vapor-gradient-twilight` | Dark background gradient |
| `--vapor-gradient-aurora` | Cool 3-color gradient |
| `--vapor-gradient-coral-dream` | Warm coral-peach gradient |
| `--vapor-gradient-pastel-sky` | Light pastel gradient |

### Glows

| Variable | Description |
|----------|-------------|
| `--vapor-glow-lavender` | Soft purple halo |
| `--vapor-glow-coral` | Warm pink halo |
| `--vapor-glow-teal` | Cool green halo |
| `--vapor-glow-sky` | Blue halo |
| `--vapor-glow-sunset` | Multi-color composite |

### Text Effects

| Variable | Description |
|----------|-------------|
| `--vapor-text-glow-primary` | Lavender text glow |
| `--vapor-text-glow-coral` | Coral text glow |
| `--vapor-text-glow-teal` | Teal text glow |

### Glass & Surfaces

| Variable | Description |
|----------|-------------|
| `--vapor-glass-bg` | Translucent background |
| `--vapor-glass-border` | Glass-like border |
| `--vapor-glass-blur` | Backdrop blur filter |
| `--vapor-surface-dreamy` | Gradient overlay |

### Depth System

| Variable | Description |
|----------|-------------|
| `--vapor-depth-low` | Subtle elevation |
| `--vapor-depth-medium` | Standard depth |
| `--vapor-depth-high` | Maximum elevation |

### Interactive States

| Variable | Description |
|----------|-------------|
| `--vapor-hover-glow` | Hover effect |
| `--vapor-active-glow` | Active/pressed state |

## 📦 Utility Classes

### Background Utilities

```html
<div class="vapor-glass">Glass-morphism effect</div>
<div class="vapor-sunset-bg">Sunset gradient background</div>
<div class="vapor-aurora-bg">Aurora gradient background</div>
```

### Text Utilities

```html
<h1 class="vapor-sunset-text">Gradient sunset text</h1>
<span class="vapor-text-glow-lavender">Glowing lavender text</span>
<span class="vapor-text-glow-coral">Glowing coral text</span>
<span class="vapor-text-glow-teal">Glowing teal text</span>
```

### Glow Utilities

```html
<div class="vapor-glow-lavender">Lavender halo</div>
<div class="vapor-glow-coral">Coral halo</div>
<div class="vapor-glow-teal">Teal halo</div>
<div class="vapor-glow-sunset">Multi-color halo</div>
```

### Border Utilities

```html
<div class="vapor-border-dreamy">Soft glowing border</div>
```

## 🎭 Usage Examples

### Dreamy Card Component

```vue
<template>
  <div class="game-card vapor-glass">
    <h2 class="vapor-sunset-text">Nostalgic Title</h2>
    <p class="vapor-text-glow-lavender">
      Dreamy description with soft glow
    </p>
    <button class="primary">Explore</button>
  </div>
</template>
```

### Sunset Progress Indicator

```vue
<template>
  <div class="progress-container vapor-border-dreamy">
    <div
      class="progress-fill vapor-sunset-bg vapor-glow-sunset"
      :style="{ width: progress + '%' }"
    />
  </div>
</template>
```

### Custom Vaporwave Panel

```vue
<style scoped>
[data-skin="sunset-vaporwave"] .custom-panel {
  background: var(--vapor-glass-bg);
  border: 2px solid var(--base-solid-primary);
  backdrop-filter: var(--vapor-glass-blur);
  box-shadow: var(--vapor-depth-high);
}

[data-skin="sunset-vaporwave"] .custom-panel h3 {
  background: var(--vapor-gradient-aurora);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: var(--vapor-text-glow-primary);
}
</style>
```

## 🆚 Comparison with Other Themes

| Aspect | Sunset Vaporwave | Y2K Futuristic | Default |
|--------|------------------|----------------|---------|
| **Vibe** | Dreamy, nostalgic | Aggressive, cyber | Professional, retro |
| **Colors** | Pastel warm/cool mix | Intense cyan/magenta | Green accent |
| **Contrast** | Medium-soft | Very high | High |
| **Glows** | Soft 3-4 layer halos | Intense 5-layer neon | Minimal |
| **Animation** | Smooth shimmer | Sharp transitions | None |
| **Best For** | Relaxed browsing, aesthetics | High-energy coding | Focus work |

## 💡 Design Tips

### When to Use Sunset Vaporwave

✅ **Great for:**
- Creative/artistic projects
- Personal portfolios with aesthetic focus
- Relaxed evening coding sessions
- Projects targeting nostalgic audiences
- Music or art-related applications

❌ **Less ideal for:**
- High-contrast accessibility needs
- Professional corporate environments
- Detailed technical documentation
- High-speed data-dense interfaces

### Customization Ideas

**More Intense Sunset**
```css
--custom-intense-sunset: linear-gradient(
  135deg,
  #ff4d88 0%,    /* Brighter coral */
  #dd66ff 25%,   /* More vibrant lavender */
  #55ddff 50%,   /* Brighter sky */
  #44ffcc 75%,   /* Vivid teal */
  #ffaa44 100%   /* Stronger peach */
);
```

**Midnight Variation**
```css
/* Darker, more nighttime vibe */
--base-solid-gray-00: #050208;  /* Nearly black */
--base-solid-gray-10: #0f0a15;  /* Deeper purple */
```

**Tropical Variation**
```css
/* More pink and teal, less purple */
--base-solid-primary: #ff88dd;  /* Hot pink */
--semantic-solid-success: #00ffbb;  /* Bright teal */
```

## 🎬 Animations

### Shimmer Animation

Headers automatically shimmer between color schemes:
- **Duration**: 8 seconds
- **Easing**: ease-in-out
- **Loop**: Infinite
- **Effect**: Filter brightness + color shift

### Progress Pulse

Progress bars subtly pulse:
- **Duration**: 2 seconds
- **Easing**: ease-in-out
- **Effect**: Brightness 1.0 → 1.2 → 1.0

### Hover Transitions

All interactive elements use:
- **Duration**: 0.4s
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Properties**: color, background, transform, box-shadow

## 🔧 Technical Notes

### Performance

- **Backdrop filters**: May impact older devices (but more efficient than Y2K with fewer layers)
- **Gradients**: CSS-only, no JavaScript overhead
- **Animations**: GPU-accelerated transform and filter
- **Shadows**: 3-4 layers vs Y2K's 5, better performance

### Browser Support

- Chrome/Edge: Full support ✓
- Firefox: Full support ✓
- Safari: Full support (with `-webkit-` prefixes) ✓
- Older browsers: Graceful degradation (loses some glows)

### Accessibility Notes

- **Contrast ratios**: Meet WCAG AA for most text
- **Motion**: Animations are subtle and non-essential
- **Color blindness**: Purple/pink/teal remain distinguishable
- **Light mode**: Consider adding sunset-vaporwave-light variant

## 🎨 Color Psychology

### Why These Colors Work

- **Purple/Lavender**: Creativity, nostalgia, mystique
- **Coral/Pink**: Warmth, comfort, playfulness
- **Teal**: Balance, freshness, technology
- **Sky Blue**: Calm, openness, dreams
- **Peach**: Warmth, approachability, sunset glow

Combined, they create an emotional palette that's:
- Nostalgic without being dated
- Technological without being cold
- Vibrant without being aggressive
- Unique without being unusable

## 📚 Related Resources

- [Skin System Guide](./skin-system.md) - Core theming system
- [Y2K Theme Guide](./y2k-theme-guide.md) - Contrast with cyber aesthetics
- [Architecture Guide](./architecture.md) - System architecture

## 🎵 Playlist Recommendations

Experience the theme with authentic vaporwave soundtracks:
- Macross 82-99
- Saint Pepsi
- Yung Bae
- Future Funk compilations
- Japanese City Pop classics

---

**Last Updated**: 2026-01-24
**Theme Version**: Aesthetic Edition v1.0
**Aesthetic Level**: ∞
**Vibes**: ✨ Immaculate ✨
