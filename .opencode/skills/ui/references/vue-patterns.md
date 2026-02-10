# Vue 3 Patterns Reference

This reference covers common Vue 3 Composition API patterns used in the F-BASIC IDE.

## Component Structure Template

### Standard Component Layout

```vue
<script setup lang="ts">
// 1. Type imports
import type { Ref } from 'vue'

// 2. Value imports
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from './composables/useStore'

// 3. Props/Emits
interface Props {
  modelValue: string
  disabled?: boolean
}
interface Emits {
  update: [value: string]
  change: [event: Event]
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})
const emit = defineEmits<Emits>()

// 4. Composables
const store = useStore()

// 5. Reactive state
const localState = ref('')
const isLoading = ref(false)

// 6. Computed properties
const displayValue = computed(() => {
  return props.modelValue.toUpperCase()
})

const canSubmit = computed(() => {
  return localState.value.length > 0 && !isLoading.value
})

// 7. Methods
function handleSubmit() {
  if (canSubmit.value) {
    emit('update', localState.value)
  }
}

function reset() {
  localState.value = ''
}

// 8. Watchers
watch(() => props.modelValue, (newValue) => {
  localState.value = newValue
})

// 9. Lifecycle hooks
onMounted(() => {
  localState.value = props.modelValue
})

// 10. Expose (if needed for parent component refs)
defineExpose({
  reset,
  focus: () => inputRef.value?.focus()
})
</script>

<template>
  <div class="container">
    <input
      v-model="localState"
      :disabled="disabled"
      @change="handleSubmit"
    />
  </div>
</template>

<style scoped>
.container {
  /* Always use scoped styles */
  color: var(--game-text-primary);
  background: var(--game-surface-bg-gradient);
}
</style>
```

## Composition API Patterns

### Basic Composable

```typescript
// composables/useFeature.ts
import { ref, computed } from 'vue'

export function useFeature(initialValue: string) {
  const state = ref(initialValue)

  const doubled = computed(() => state.value + state.value)

  function update(newValue: string) {
    state.value = newValue
  }

  function reset() {
    state.value = initialValue
  }

  return {
    state,
    doubled,
    update,
    reset
  }
}
```

### Reactive Composable (with props)

```typescript
// composables/useSize.ts
import { computed } from 'vue'
import type { Ref } from 'vue'

export function useSize(
  width: Ref<number>,
  height: Ref<number>
) {
  const aspectRatio = computed(() => {
    return width.value / height.value
  })

  const isLandscape = computed(() => {
    return aspectRatio.value > 1
  })

  const isPortrait = computed(() => {
    return aspectRatio.value < 1
  })

  return {
    aspectRatio,
    isLandscape,
    isPortrait
  }
}
```

### Async Composable

```typescript
// composables/useAsyncData.ts
import { ref } from 'vue'

export function useAsyncData<T>() {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  async function fetch(fetcher: () => Promise<T>) {
    isLoading.value = true
    error.value = null

    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  return {
    data,
    error,
    isLoading,
    fetch
  }
}
```

## Props Reactivity Patterns

### Destructuring Props (WRONG)

```typescript
// ❌ Loses reactivity
const { value } = props
console.log(value) // Won't update when props.value changes
```

### Destructuring Props (CORRECT)

```typescript
// ✅ Preserves reactivity with toValue
import { toValue } from 'vue'

const currentValue = computed(() => toValue(props.value))

// ✅ Or use props directly in template
// <template>{{ props.value }}</template>
```

### Props with Default Values

```typescript
interface Props {
  required: string
  optional?: number
  withDefault?: string
}

const props = withDefaults(defineProps<Props>(), {
  optional: undefined,
  withDefault: 'default value'
})
```

## Template Refs (Vue 3.5+)

### useTemplateRef Pattern

```vue
<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

const inputRef = useTemplateRef<HTMLInputElement>('input')

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="input" type="text" />
</template>
```

### Legacy Template Ref Pattern (pre-3.5)

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="inputRef" type="text" />
</template>
```

## CSS v-bind Pattern

### Dynamic CSS Variables

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  color?: string
  size?: number
}>()

const themeColor = computed(() => props.color ?? 'var(--base-solid-primary)')
const iconSize = computed(() => `${props.size ?? 16}px`)
</script>

<style scoped>
.card {
  /* Bind computed values to CSS variables */
  --card-color: v-bind(themeColor);
  --icon-size: v-bind(iconSize);

  color: var(--card-color);
}

.icon {
  width: var(--icon-size);
  height: var(--icon-size);
}
</style>
```

## Watcher Patterns

### Watching Single Source

```typescript
import { watch } from 'vue'

watch(() => props.value, (newValue, oldValue) => {
  console.log('Changed from', oldValue, 'to', newValue)
})
```

### Watching Multiple Sources

```typescript
import { watch } from 'vue'

watch([() => props.x, () => props.y], ([newX, newY], [oldX, oldY]) => {
  console.log('Position changed:', newX, newY)
})
```

### Deep Watch

```typescript
import { watch } from 'vue'

const formData = ref({ name: '', email: '' })

watch(formData, (newValue) => {
  console.log('Form changed:', newValue)
}, { deep: true })
```

### Watch with Immediate

```typescript
import { watch } from 'vue'

watch(() => props.value, (value) => {
  console.log('Value:', value)
}, { immediate: true })
```

### Watch Effect

```typescript
import { watchEffect } from 'vue'

watchEffect(() => {
  // Automatically tracks dependencies
  console.log('Value is:', props.value)
})
```

## Event Handling Patterns

### Emitting Events

```typescript
interface Emits {
  update: [value: string]
  submit: [event: Event]
  change: [value: number, oldValue: number]
}

const emit = defineEmits<Emits>()

function handleInput() {
  emit('update', 'new value')
  emit('submit', event!)
  emit('change', 42, 10)
}
```

### Event Modifiers

```vue
<template>
  <!-- Prevent default form submission -->
  <form @submit.prevent="handleSubmit">

    <!-- Stop propagation -->
  <div @click.stop="handleDivClick">
    <button @click="handleButtonClick">Click</button>
  </div>

    <!-- Key modifiers -->
  <input @keyup.enter="handleSubmit" />
  <input @keyup.ctrl.enter="handleCtrlEnter" />
</template>
```

## Provide/Inject Pattern

### Provider

```typescript
// Parent component
import { provide, ref } from 'vue'

const theme = ref('dark')

provide('theme', {
  theme,
  setTheme: (value: string) => { theme.value = value }
})
```

### Injector

```typescript
// Child component
import { inject } from 'vue'

interface ThemeContext {
  theme: Ref<string>
  setTheme: (value: string) => void
}

const { theme, setTheme } = inject<ThemeContext>('theme')!
```

## Component Lifecycle

### Lifecycle Hooks Order

```typescript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

onBeforeMount(() => {
  console.log('Before mount')
})

onMounted(() => {
  console.log('Mounted - DOM is ready')
})

onBeforeUpdate(() => {
  console.log('Before update')
})

onUpdated(() => {
  console.log('Updated - DOM has been patched')
})

onBeforeUnmount(() => {
  console.log('Before unmount')
})

onUnmounted(() => {
  console.log('Unmounted - cleanup completed')
})
```

## Performance Patterns

### Computed vs Watch

```typescript
// ✅ Use computed for derived values
const fullName = computed(() => {
  return `${props.firstName} ${props.lastName}`
})

// ✅ Use watch for side effects
watch(() => props.value, (newValue) => {
  localStorage.setItem('value', newValue)
})
```

### Lazy Loading Components

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>

<template>
  <HeavyComponent />
</template>
```

## Theme System Patterns

### Using Theme Variables

```vue
<style scoped>
.card {
  /* Text colors */
  color: var(--game-text-primary);
  color: var(--game-text-muted);

  /* Backgrounds */
  background: var(--game-surface-bg-gradient);
  background: var(--game-elevated-bg);

  /* Borders */
  border: 1px solid var(--game-surface-border);

  /* Effects */
  box-shadow: var(--game-shadow-base);
  box-shadow: var(--game-accent-glow);
}
</style>
```

### Dynamic Theme Switching

```typescript
// composables/useTheme.ts
import { computed } from 'vue'

export function useTheme() {
  const theme = ref<'light' | 'dark'>('dark')

  const isDark = computed(() => theme.value === 'dark')

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  return {
    theme,
    isDark,
    toggleTheme
  }
}
```

## Testing Patterns

### Component Test Template

```typescript
import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/features/ide/components/MyComponent.vue'

describe('MyComponent', () => {
  test('renders with default props', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.text()).toContain('default')
  })

  test('emits update event on input', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('input').setValue('test')
    await wrapper.find('input').trigger('change')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')?.[0]).toEqual(['test'])
  })

  test('computed property works correctly', () => {
    const wrapper = mount(MyComponent, {
      props: { value: 'test' }
    })

    expect(wrapper.vm.displayValue).toBe('TEST')
  })
})
```

### Composable Test Template

```typescript
import { describe, test, expect } from 'vitest'
import { useFeature } from '@/features/ide/composables/useFeature'

describe('useFeature', () => {
  test('initializes with default value', () => {
    const { state } = useFeature('default')
    expect(state.value).toBe('default')
  })

  test('update method changes state', () => {
    const { state, update } = useFeature('default')
    update('new value')
    expect(state.value).toBe('new value')
  })

  test('reset method restores initial value', () => {
    const { state, update, reset } = useFeature('default')
    update('new value')
    reset()
    expect(state.value).toBe('default')
  })
})
```
