# Vue 3 Patterns

Essential Vue 3 patterns and best practices for this codebase.

## CSS v-bind Usage

### ✅ Good Use Cases
- Component-level reactive styles
- CSS custom properties
- Computed style values

### ❌ Avoid
- Dynamic per-item styling in loops (use `:style` instead)
- Complex conditional styles (use class bindings)

### Pattern: Simple Reactive Values
```vue
<script setup lang="ts">
const tableSize = computed(() => {
  const sizes = { small: '0.75rem', medium: '0.875rem', large: '1rem' }
  return sizes[props.size ?? 'medium']
})
</script>

<style scoped>
.table { font-size: v-bind(tableSize); }
</style>
```

### Pattern: CSS Custom Properties
```vue
<script setup lang="ts">
const iconColor = computed(() => props.iconColor ?? 'var(--base-solid-primary)')
</script>

<style scoped>
.card {
  --icon-color: v-bind(iconColor);
}
.icon { color: var(--icon-color); }
</style>
```

## Component Patterns

### Props Reactivity
```typescript
// ❌ Wrong - loses reactivity
const { value } = props

// ✅ Correct - preserves reactivity
import { toValue } from 'vue'
const currentValue = computed(() => toValue(props.value))
```

### Composables
```typescript
// Pattern: Always return refs/computed
export function useFeature() {
  const state = ref(initialValue)
  const derived = computed(() => transform(state.value))
  return { state, derived }
}
```

### Template Refs
```vue
<script setup lang="ts">
// Vue 3.5+ - use useTemplateRef
import { useTemplateRef } from 'vue'
const element = useTemplateRef('myElement')
</script>

<template>
  <div ref="myElement">Content</div>
</template>
```

## File Organization

**Component Structure**:
```vue
<script setup lang="ts">
// 1. Imports (types, external, internal)
// 2. Props/Emits definitions
// 3. Composables
// 4. Reactive state
// 5. Computed properties
// 6. Methods
// 7. Lifecycle hooks
</script>

<template>
  <!-- Keep templates simple -->
</template>

<style scoped>
/* Always use scoped styles */
/* Prefer utility classes over custom styles */
</style>
```

**Max file size**: 500 lines (extract composables/components when approaching)

## Key Constraints

- **ALWAYS** use `<style scoped>` (never external CSS imports except `@/shared/styles/*`)
- **ALWAYS** use `import type` for type-only imports
- **NEVER** use `any` type - use specific types or `unknown`
- **PREFER** composition API over options API
- **PREFER** `<script setup>` syntax
