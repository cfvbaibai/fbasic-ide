# Refactoring Plan: SpriteControls with Context-Store Pattern

## Problem Analysis

**Current Issues:**
- `SpriteControls.vue` has **8 props** and **6 events** (too many!)
- High coupling between parent and child components
- Prop drilling through multiple layers
- Difficult to test and maintain
- Violates Single Responsibility Principle

## Solution: Context-Store Pattern + Component Splitting

### Architecture Overview

```
CharacterSpriteViewerPage.vue (Provider)
├── Provides: SpriteViewerStore via provide/inject
├── SpriteControls.vue (Container - no props/events)
│   ├── SpriteSelector.vue (injects store)
│   ├── DisplayOptions.vue (injects store)
│   ├── AnimationControl.vue (injects store)
│   └── PaletteSelector.vue (injects store)
├── SpriteGrid.vue (injects store)
└── Other components...
```

### 1. Store Implementation (`useSpriteViewerStore.ts`)

**Created:** `src/composables/useSpriteViewerStore.ts`

**Features:**
- Centralized reactive state management
- Actions for state mutations
- Provide/Inject pattern for dependency injection
- Type-safe with TypeScript interfaces

**Store Interface:**
```typescript
interface SpriteViewerStore {
  // Reactive state
  selectedIndex: Ref<number>
  displayOptions: Ref<{ showValues: boolean; showGridLines: boolean }>
  isAnimating: Ref<boolean>
  selectedSprite: ComputedRef<SpriteDefinition | null>
  selectedPaletteCode: Ref<number>
  selectedColorCombination: Ref<number>
  selectedColorCombinationColors: ComputedRef<number[]>
  sprite16x16: ComputedRef<number[][]>
  getCellColor: (value: number) => string
  
  // Actions
  toggleAnimation: () => void
  setSelectedIndex: (index: number) => void
  setDisplayOptions: (options: Partial<...>) => void
  setPaletteCode: (code: number) => void
  setColorCombination: (combination: number) => void
}
```

### 2. Component Splitting Plan

#### 2.1 `SpriteSelector.vue`
**Purpose:** Sprite selection dropdown
**Props:** None (uses store)
**Events:** None (uses store actions)
**Size:** ~30 lines

```vue
<script setup>
import { useSpriteViewerStore } from '@/composables/useSpriteViewerStore'
const store = useSpriteViewerStore()
</script>
```

#### 2.2 `DisplayOptions.vue`
**Purpose:** Show values/grid lines toggles
**Props:** None (uses store)
**Events:** None (uses store actions)
**Size:** ~40 lines

#### 2.3 `AnimationControl.vue`
**Purpose:** Animation toggle button
**Props:** None (uses store)
**Events:** None (uses store actions)
**Size:** ~25 lines

#### 2.4 `PaletteSelector.vue`
**Purpose:** Palette code, color combination, and color preview
**Props:** None (uses store)
**Events:** None (uses store actions)
**Size:** ~60 lines

#### 2.5 `SpriteControls.vue` (Refactored)
**Purpose:** Container component (layout only)
**Props:** None
**Events:** None
**Size:** ~20 lines (just template with child components)

### 3. Implementation Steps

#### Step 1: Create Store ✅
- [x] Create `useSpriteViewerStore.ts`
- [x] Implement reactive state
- [x] Implement actions
- [x] Set up provide/inject

#### Step 2: Create Child Components
- [ ] Create `SpriteSelector.vue` (injects store)
- [ ] Create `DisplayOptions.vue` (injects store)
- [ ] Create `AnimationControl.vue` (injects store)
- [ ] Create `PaletteSelector.vue` (injects store)

#### Step 3: Refactor SpriteControls
- [ ] Remove all props/events
- [ ] Use child components
- [ ] Keep only layout/styles

#### Step 4: Update Parent Component
- [ ] Provide store in `CharacterSpriteViewerPage.vue`
- [ ] Remove prop drilling
- [ ] Update `SpriteGrid.vue` to use store

#### Step 5: Testing & Cleanup
- [ ] Test all functionality
- [ ] Remove unused code
- [ ] Update documentation

### 4. Benefits

✅ **Zero Props/Events** in child components (use store instead)
✅ **Low Coupling** - components don't depend on parent structure
✅ **High Cohesion** - each component has single responsibility
✅ **Easy Testing** - mock store instead of many props
✅ **Better Reusability** - components can be used anywhere store is provided
✅ **Type Safety** - TypeScript ensures store contract
✅ **Centralized State** - single source of truth

### 5. Code Example

**Before (Bad):**
```vue
<SpriteControls
  :selected-index="selectedIndex"
  :show-values="showValues"
  :show-grid-lines="showGridLines"
  :is-animating="isAnimating"
  :selected-sprite="selectedSprite"
  :selected-palette-code="selectedPaletteCode"
  :selected-color-combination="selectedColorCombination"
  :selected-color-combination-colors="selectedColorCombinationColors"
  @update:selected-index="selectedIndex = $event"
  @update:show-values="showValues = $event"
  @update:show-grid-lines="showGridLines = $event"
  @update:selected-palette-code="selectedPaletteCode = $event"
  @update:selected-color-combination="selectedColorCombination = $event"
  @toggle-animation="toggleAnimation"
/>
```

**After (Good):**
```vue
<!-- Parent provides store -->
<script setup>
provideSpriteViewerStore()
</script>

<!-- Child components use store -->
<SpriteControls />
```

```vue
<!-- Inside SpriteSelector.vue -->
<script setup>
const store = useSpriteViewerStore()
</script>
<template>
  <el-select :model-value="store.selectedIndex.value" 
             @update:model-value="store.setSelectedIndex($event)">
    ...
  </el-select>
</template>
```

### 6. File Structure

```
src/
├── composables/
│   └── useSpriteViewerStore.ts ✅ (Created)
├── components/
│   ├── SpriteControls.vue (Refactor to container)
│   ├── SpriteSelector.vue (New)
│   ├── DisplayOptions.vue (New)
│   ├── AnimationControl.vue (New)
│   └── PaletteSelector.vue (New)
└── views/
    └── CharacterSpriteViewerPage.vue (Provide store)
```

