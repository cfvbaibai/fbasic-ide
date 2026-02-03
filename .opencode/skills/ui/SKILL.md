---
name: ui
description: UI team skill for Vue 3 components, IDE features, and theming. Use when the user invokes '/ui <task>' or requests Vue component creation, IDE features, theme updates, web worker communication, or styling changes. Works with `src/features/`, `src/shared/components/`, `src/shared/styles/`. Must read docs/teams/ui-team.md for detailed patterns and Vue 3 conventions.
---

# UI Team Skill

Build Vue 3 components, IDE features, and user interface elements.

## Ownership

- **Files**: `src/features/*`, `src/shared/components/*`, `src/shared/styles/*`
- **Responsibilities**: Vue components, IDE features, theming, user interaction

## Architecture

```
src/
├── features/
│   ├── ide/                    # Main IDE interface
│   │   ├── components/        # IDE-specific components
│   │   ├── composables/       # IDE logic
│   │   └── BasicIde.vue       # Main container
│   └── sprite-viewer/         # Character sprite viewer
└── shared/
    ├── components/ui/         # Reusable UI components
    └── styles/               # Global CSS (theme.css)
```

## Vue 3 Patterns

### Component Template

```vue
<script setup lang="ts">
// 1. Type imports
import type { Ref } from 'vue'

// 2. Value imports
import { ref, computed } from 'vue'

// 3. Props/Emits
const props = defineProps<{ value: string }>()
const emit = defineEmits<{ update: [value: string] }>()

// 4. Composables
// 5. Reactive state
// 6. Computed
// 7. Methods
// 8. Lifecycle
</script>

<template>
  <!-- Simple templates -->
</template>

<style scoped>
/* Always scoped, use CSS variables */
</style>
```

### Template Refs (Vue 3.5+)

```typescript
import { useTemplateRef } from 'vue'
const element = useTemplateRef('myElement')
```

## Theme System

### Three-Layer System

1. **Base Layer** (`--base-solid-*`, `--base-alpha-*`) - Raw colors
2. **Game Layer** (`--game-*`) - Semantic game-themed (PREFERRED)
3. **Semantic Layer** (`--semantic-solid-*`) - Status colors

**Key Rule**: Always prefer `--game-*` variables.

### Common Patterns

```css
/* Text */
.primary-text {
  color: var(--game-text-primary);
}

/* Backgrounds */
.surface {
  background: var(--game-surface-bg-gradient);
}

/* Effects */
.shadow {
  box-shadow: var(--game-shadow-base);
}

/* Borders */
.bordered {
  border: 1px solid var(--game-surface-border);
}
```

## Common Tasks

### Add New IDE Feature

1. Create component in `src/features/ide/components/`
2. Add to `BasicIde.vue` if needed
3. Add tests in `test/components/`

### Update Theme

1. Edit `src/shared/styles/theme.css`
2. Update both `[data-theme="dark"]` and `[data-theme="light"]`
3. Use CSS variables in components

## Composable Pattern

```typescript
export function useFeature() {
  const state = ref(initialValue)
  const derived = computed(() => transform(state.value))
  function action() {
    /* logic */
  }
  return { state, derived, action }
}
```

## Testing

- **Location**: `test/components/`
- **Framework**: Vitest + Vue Test Utils
- **Pattern**: Test user interaction and state changes

## Reference

- Read `docs/teams/ui-team.md` for complete guide
- **Vue 3 docs**: https://vuejs.org/
