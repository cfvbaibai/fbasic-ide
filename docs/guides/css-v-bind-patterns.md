# CSS v-bind Safe Patterns Guide

**Date**: 2026-01-22  
**Status**: Active  
**Purpose**: Document safe patterns for using CSS v-bind in Vue 3 components

## Overview

Vue 3's CSS `v-bind()` feature allows reactive JavaScript values to be used directly in `<style>` blocks. This guide documents safe patterns and common pitfalls based on our codebase review.

## When to Use CSS v-bind

### ✅ Good Use Cases

1. **Component-level reactive styles** - When a style value is reactive but applies to the entire component or a specific class
2. **CSS custom properties** - When setting CSS variables that are used throughout the component's styles
3. **Computed style values** - When you have computed properties that determine styling
4. **Performance optimization** - Moving simple reactive styles from `:style` bindings to CSS v-bind can reduce template complexity

### ❌ When NOT to Use CSS v-bind

1. **Dynamic per-item styling in loops** - Use `:style` bindings in templates instead
2. **Conditional styles based on complex logic** - Use class bindings or `:style` for better readability
3. **Styles that depend on multiple reactive sources** - May be clearer with `:style` or computed classes

## Safe Patterns

### Pattern 1: Simple Reactive Values

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  size?: 'small' | 'medium' | 'large'
}>()

const tableSize = computed(() => {
  const sizeMap = {
    small: '0.75rem',
    medium: '0.875rem',
    large: '1rem'
  }
  return sizeMap[props.size ?? 'medium']
})
</script>

<template>
  <table class="game-table">...</table>
</template>

<style scoped>
.game-table {
  font-size: v-bind(tableSize);
}
</style>
```

**Why this works**: The computed property returns a string value that can be directly used in CSS. The value is reactive and updates when props change.

### Pattern 2: CSS Custom Properties

```vue
<script setup lang="ts">
const props = defineProps<{
  iconColor?: string
}>()

const iconColor = computed(() => props.iconColor ?? 'var(--base-solid-primary)')
</script>

<template>
  <div class="game-card">
    <div class="game-card-icon-wrapper">...</div>
  </div>
</template>

<style scoped>
.game-card {
  --icon-color: v-bind(iconColor);
}

.game-card-icon-wrapper {
  border: 2px solid var(--icon-color);
  box-shadow: 0 0 20px color-mix(in srgb, var(--icon-color) 50%, transparent);
}
</style>
```

**Why this works**: CSS custom properties can be set with v-bind and then used throughout the component's styles. This is more efficient than inline `:style` bindings.

### Pattern 3: Computed Style Strings

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}>()

const resizeValue = computed(() => props.resize ?? 'vertical')
</script>

<template>
  <textarea class="game-textarea">...</textarea>
</template>

<style scoped>
.game-textarea {
  resize: v-bind(resizeValue);
}
</style>
```

**Why this works**: Simple string values from computed properties work well with v-bind.

## Common Pitfalls

### Pitfall 1: Complex Expressions Without Quotes

❌ **Wrong**:
```vue
<style scoped>
.box {
  width: v-bind(size + 'px');  /* Syntax error */
}
</style>
```

✅ **Correct**:
```vue
<script setup lang="ts">
const sizeWithUnit = computed(() => `${size.value}px`)
</script>

<style scoped>
.box {
  width: v-bind(sizeWithUnit);
}
</style>
```

**Solution**: Always use computed properties for complex expressions. Vue's CSS v-bind doesn't support inline expressions.

### Pitfall 2: Initial Render Flash

❌ **Wrong**:
```vue
<script setup lang="ts">
const color = ref<string>()  // No initial value
</script>

<style scoped>
.text {
  color: v-bind(color);  /* May flash on initial render */
}
</style>
```

✅ **Correct**:
```vue
<script setup lang="ts">
const color = ref('blue')  // Has initial value
</script>

<style scoped>
.text {
  /* Fallback for SSR/initial render */
  color: blue;
  color: v-bind(color);
}
</style>
```

**Solution**: Always provide initial values for reactive refs used in v-bind, or provide CSS fallbacks.

### Pitfall 3: Using v-bind in Loops

❌ **Wrong**:
```vue
<template>
  <div
    v-for="item in items"
    :key="item.id"
    class="item"
  >
    {{ item.name }}
  </div>
</template>

<script setup lang="ts">
const itemColor = computed(() => {
  // This won't work - v-bind is component-level, not per-item
  return items.value.map(i => getColor(i))
})
</script>

<style scoped>
.item {
  color: v-bind(itemColor);  /* Can't bind per-item values */
}
</style>
```

✅ **Correct**:
```vue
<template>
  <div
    v-for="item in items"
    :key="item.id"
    :style="{ color: getColor(item) }"
  >
    {{ item.name }}
  </div>
</template>
```

**Solution**: Use `:style` bindings in templates for per-item dynamic styling.

### Pitfall 4: Nested Property Access

❌ **Wrong**:
```vue
<script setup lang="ts">
const theme = reactive({
  colors: {
    primary: '#42b883'
  }
})
</script>

<style scoped>
.button {
  color: v-bind(theme.colors.primary);  /* Won't work */
}
</style>
```

✅ **Correct**:
```vue
<script setup lang="ts">
const theme = reactive({
  colors: {
    primary: '#42b883'
  }
})

const primaryColor = computed(() => theme.colors.primary)
</script>

<style scoped>
.button {
  color: v-bind(primaryColor);
}
</style>
```

**Solution**: Extract nested properties into computed properties.

## Performance Considerations

### Many Individual Bindings

If you have many reactive style values, consider grouping them:

❌ **Less Efficient**:
```vue
<script setup lang="ts">
const primaryColor = ref('#000')
const secondaryColor = ref('#fff')
const borderRadius = ref('4px')
const padding = ref('1rem')
</script>

<style scoped>
.card {
  background: v-bind(primaryColor);
  border-color: v-bind(secondaryColor);
  border-radius: v-bind(borderRadius);
  padding: v-bind(padding);
}
</style>
```

✅ **More Efficient**:
```vue
<script setup lang="ts">
const theme = reactive({
  primaryColor: '#000',
  secondaryColor: '#fff',
  borderRadius: '4px',
  padding: '1rem'
})
</script>

<style scoped>
.card {
  background: v-bind('theme.primaryColor');
  border-color: v-bind('theme.secondaryColor');
  border-radius: v-bind('theme.borderRadius');
  padding: v-bind('theme.padding');
}
</style>
```

**Note**: However, for readability and maintainability, individual computed properties are often preferred unless performance is critical.

## Codebase Examples

### ✅ Good Example: GameTable.vue

```vue
<script setup lang="ts">
const tableSize = computed(() => {
  const sizeMap = {
    small: '0.75rem',
    medium: '0.875rem',
    large: '1rem'
  }
  return sizeMap[props.size]
})
</script>

<style scoped>
.game-table {
  font-size: v-bind(tableSize);
}
</style>
```

**Why it's good**: Simple computed property, component-level styling, clear and maintainable.

### ✅ Good Example: GameCard.vue (After Refactoring)

```vue
<script setup lang="ts">
const iconColor = computed(() => props.iconColor ?? 'var(--base-solid-primary)')
</script>

<style scoped>
.game-card {
  --icon-color: v-bind(iconColor);
}

.game-card-icon-wrapper {
  border: 2px solid var(--icon-color);
}
</style>
```

**Why it's good**: Uses CSS custom property pattern, allows the value to be used throughout the component's styles.

### ✅ Appropriate Use of :style: SpriteGrid.vue

```vue
<template>
  <div
    v-for="(row, rowIndex) in store.spriteGrid.value"
    :key="rowIndex"
  >
    <div
      v-for="(value, colIndex) in row"
      :key="colIndex"
      :style="{
        backgroundColor: store.getCellColor(value)
      }"
    >
    </div>
  </div>
</template>
```

**Why :style is correct here**: Each cell has a different color based on its value. CSS v-bind is component-level and can't handle per-item variations in loops.

## Migration Checklist

When migrating from `:style` to CSS v-bind:

- [ ] The style value is reactive (ref, computed, or prop)
- [ ] The style applies to the component or a class, not per-item in a loop
- [ ] The value is a simple string or can be computed to a string
- [ ] Initial value is provided or CSS fallback exists
- [ ] No complex expressions are needed (use computed properties instead)
- [ ] The migration improves code clarity or performance

## References

- [Vue 3 CSS v-bind Documentation](https://vuejs.org/api/sfc-css-features.html#v-bind-in-css)
- [Vue Best Practices: CSS v-bind](../.claude/skills/vue-best-practices/rules/css-v-bind.md)

---

**Last Updated**: 2026-01-22
