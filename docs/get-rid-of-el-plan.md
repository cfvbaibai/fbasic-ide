# Get Rid of Element Plus - Complete Removal Plan

## Overview
This document provides a comprehensive plan to completely remove Element Plus and all its dependencies from the codebase. Most UI components have already been replaced with custom `Game*` components, so the remaining work focuses on removing icon dependencies, configuration, and cleanup.

## Current Status Analysis

### ✅ Already Replaced
- **UI Components**: All `Game*` components exist and are in use:
  - `GameButton.vue` ✅
  - `GameButtonGroup.vue` ✅
  - `GameTag.vue` ✅
  - `GameDivider.vue` ✅
  - `GameTabs.vue` + `GameTabPane.vue` ✅
  - `GameInput.vue` ✅
  - `GameTextarea.vue` ✅
  - `GameUpload.vue` ✅
  - `GameCard.vue` ✅
  - `GameSwitch.vue` ✅
  - `GameIcon.vue` ✅

### ❌ Still Using Element Plus

#### 1. Core Configuration Files
- **`src/main.ts`** (Lines 6-9, 55, 59-61)
  - Imports: `ElementPlus`, CSS files, icons
  - Registration: `app.use(ElementPlus)`
  - Icon registration loop

- **`package.json`** (Lines 25, 28)
  - `"element-plus": "^2.11.4"`
  - `"@element-plus/icons-vue": "^2.3.2"`

- **`tsconfig.json`** (Line 22)
  - `"element-plus/global"` in types array

- **`scripts/build-service-worker.ts`** (Line 29)
  - `'element-plus'` in external dependencies

#### 2. Component Files Using Element Plus Icons
All these files import icons from `@element-plus/icons-vue`:

1. **`src/shared/components/ThemeToggle.vue`**
   - Uses `<el-switch>` component (Line 2)
   - Imports: `Sunny, Moon` icons

2. **`src/shared/components/GameNavigation.vue`**
   - Imports: `Monitor, Edit, Picture, Grid`

3. **`src/shared/components/ui/GameSelect.vue`**
   - Imports: `ArrowDown`

4. **`src/shared/components/ui/GameUpload.vue`**
   - Imports: `Upload`

5. **`src/features/home/HomePage.vue`**
   - Imports: `Monitor, Edit, Picture, Grid`

6. **`src/features/ide/IdePage.vue`**
   - Imports: `Monitor, Edit`

7. **`src/features/ide/components/IdeControls.vue`**
   - Imports: `VideoPlay, VideoPause, Delete, Loading, CircleCheck`

8. **`src/features/ide/components/CodeEditor.vue`**
   - Imports: `Edit`

9. **`src/features/ide/components/JoystickControl.vue`**
   - Imports: `VideoPlay, ArrowDown, ArrowUp`

10. **`src/features/ide/components/RuntimeOutput.vue`**
    - Imports: `Tools, Document, Warning, Loading, DataBoard, Picture, Monitor`
    - CSS: `.el-icon` styles (Line 389)

11. **`src/features/image-analyzer/ImageAnalyzerPage.vue`**
    - Imports: `Upload, Search, Plus, Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight`
    - CSS: `.el-textarea__inner` styles (Lines 619, 633)

12. **`src/features/monaco-editor/MonacoEditorPage.vue`**
    - Imports: `Edit, ArrowLeft`

13. **`src/features/sprite-viewer/CharacterSpriteViewerPage.vue`**
    - Imports: `View`

#### 3. Documentation Files
- **`docs/theme-guide.md`** (Line 18)
  - References Element Plus CSS import

- **`docs/element-plus-replacement-plan.md`**
  - Entire document about replacement (can be archived/deleted)

## @iconify/vue Documentation Reference

### Overview
`@iconify/vue` is a Vue component library that provides access to 275,000+ icons from 200+ icon sets. Icons are rendered as SVG (not fonts) and loaded on demand from the Iconify API.

### Installation
```bash
pnpm add @iconify/vue
pnpm add -D @iconify-json/mdi  # Optional: Material Design Icons JSON package for offline use
```

### Basic Usage
```vue
<script setup>
import { Icon } from '@iconify/vue'
</script>

<template>
  <Icon icon="mdi:home" />
</template>
```

### Props
- `icon`: string - Icon identifier in format `prefix:name` (e.g., `"mdi:play"`)
- `width`, `height`: string | number - Icon dimensions (one dimension calculates the other based on aspect ratio)
- `color`: string - Color for monotone icons (icons that allow color)
- `inline`: boolean - Affects vertical alignment relative to text
- `horizontalFlip`, `verticalFlip`, `flip`: boolean - Flip transformations
- `rotate`: number | string - Rotation angle (e.g., `90`, `"45deg"`)
- `ssr`: boolean - Force SVG rendering for SSR (default: false, icons load after client hydration)

### Icon Naming Convention
```
[provider:]prefix:name
```
- `provider`: Optional, used for alternate API providers
- `prefix`: Icon set identifier (e.g., `mdi`, `mdi-light`, `ph`, `simple-icons`)
- `name`: Specific icon name within the set

### Common Icon Sets
- **Material Design Icons**: `mdi:*` (e.g., `mdi:play`, `mdi:pause`, `mdi:delete`)
- **Material Design Icons Light**: `mdi-light:*`
- **Phosphor Icons**: `ph:*`
- **Simple Icons**: `simple-icons:*`

### Useful Functions
- `loadIcon(iconName)`: Promise - Preload a single icon
- `loadIcons([...])`: Promise - Preload multiple icons
- `addIcon(name, data)`: Add an icon manually using its data
- `addCollection(data, [provider])`: Register an icon set (multiple icons at once)

### Example: Direct Usage
```vue
<template>
  <Icon icon="mdi:play" :width="24" :height="24" />
  <Icon icon="mdi:pause" color="red" />
  <Icon icon="mdi:delete" :rotate="90" />
</template>

<script setup>
import { Icon } from '@iconify/vue'
</script>
```

### Example: With Size Variants
```vue
<template>
  <Icon icon="mdi:home" :width="size" :height="size" />
</template>

<script setup>
import { Icon } from '@iconify/vue'
const size = 20 // or '20px'
</script>
```

### Vue 3 Compatibility
- Use latest version of `@iconify/vue` for Vue 3
- For Vue 2, use version 1.x

### SSR Considerations
- By default, icons won't render until client-side hydration
- Use `ssr` prop to force immediate SVG rendering if needed for SSR
- Generated server-side HTML won't include SVGs unless `ssr` is used

## Removal Plan

### Phase 1: Icon System Setup (Priority: High)

#### Step 1.1: Install Icon Library
```bash
pnpm add @iconify/vue
pnpm add -D @iconify-json/mdi  # Optional: for offline icon support
```

#### Step 1.2: Use Icon Directly (Option B Selected)
**Decision**: Use `Icon` directly from `@iconify/vue` everywhere. No wrapper component needed.

**Approach**:
- Replace all `GameIcon` usage with direct `Icon` from `@iconify/vue`
- Simpler, no wrapper needed
- More direct control
- Less abstraction
- Remove or deprecate `GameIcon.vue` component (or leave it for potential future use, but don't use it in migration)

**Action Items**:
- Import `Icon` from `@iconify/vue` in all files that need icons
- Replace `<GameIcon :icon="IconComponent" />` with `<Icon icon="mdi:icon-name" :width="20" :height="20" />`
- Remove all `GameIcon` imports and usage

#### Step 1.3: Icon Name Reference
Direct mapping from Element Plus icons to Iconify (Material Design Icons):
- `VideoPlay` → `mdi:play`
- `VideoPause` → `mdi:pause`
- `Delete` → `mdi:delete`
- `Loading` → `mdi:loading` (or `mdi:loading` with rotate animation)
- `CircleCheck` → `mdi:check-circle`
- `Edit` → `mdi:pencil`
- `Monitor` → `mdi:monitor`
- `Picture` → `mdi:image`
- `Grid` → `mdi:grid`
- `Upload` → `mdi:upload`
- `ArrowDown` → `mdi:chevron-down`
- `ArrowUp` → `mdi:chevron-up`
- `ArrowLeft` → `mdi:chevron-left`
- `ArrowRight` → `mdi:chevron-right`
- `Sunny` → `mdi:weather-sunny`
- `Moon` → `mdi:weather-night`
- `Tools` → `mdi:tools`
- `Document` → `mdi:file-document`
- `Warning` → `mdi:alert`
- `DataBoard` → `mdi:view-dashboard`
- `Search` → `mdi:magnify`
- `Plus` → `mdi:plus`
- `Minus` → `mdi:minus`
- `View` → `mdi:eye`

### Phase 2: Replace Component Usage (Priority: High)

#### Step 2.1: Replace ThemeToggle Component
**File**: `src/shared/components/ThemeToggle.vue`
- Replace `<el-switch>` with `<GameSwitch>`
- Replace icon imports with Iconify equivalents
- Test theme switching functionality

#### Step 2.2: Replace All Icon Imports
For each file listed in section 2.2:
1. Remove `@element-plus/icons-vue` import completely
2. Import `Icon` from `@iconify/vue`
3. Replace all icon usages with direct Iconify icon names
4. Remove `GameIcon` wrapper if using `Icon` directly, or update `GameIcon` to use Iconify

**Example transformation:**
```vue
<!-- Before -->
<script setup>
import { VideoPlay } from '@element-plus/icons-vue'
import GameIcon from '@/shared/components/ui/GameIcon.vue'
</script>
<template>
  <GameIcon :icon="VideoPlay" />
</template>

<!-- After - Direct Icon usage -->
<script setup>
import { Icon } from '@iconify/vue'
</script>
<template>
  <Icon icon="mdi:play" :width="20" :height="20" />
</template>
```

**Direct replacement pattern:**
- Remove all `import { ... } from '@element-plus/icons-vue'`
- Remove all `import GameIcon from ...` (if present)
- Add `import { Icon } from '@iconify/vue'`
- Replace `<GameIcon :icon="IconName" />` with `<Icon icon="mdi:icon-name" :width="20" :height="20" />`
- Replace icon component props with Iconify icon strings
- Use appropriate width/height based on context (typically 16-24px for small icons, 20px for medium, 24px for large)

### Phase 3: Remove CSS References (Priority: Medium)

#### Step 3.1: Remove Element Plus CSS from RuntimeOutput.vue
**File**: `src/features/ide/components/RuntimeOutput.vue`
- Remove or update `.el-icon` styles (Line 389)
- Replace with generic icon styles if needed

#### Step 3.2: Remove Element Plus CSS from ImageAnalyzerPage.vue
**File**: `src/features/image-analyzer/ImageAnalyzerPage.vue`
- Remove or update `.el-textarea__inner` styles (Lines 619, 633)
- These should already be using `GameTextarea`, so styles may not be needed

### Phase 4: Remove Core Dependencies (Priority: High)

#### Step 4.1: Remove from main.ts
**File**: `src/main.ts`
- Remove lines 6-9 (Element Plus imports)
- Remove line 55 (`app.use(ElementPlus)`)
- Remove lines 59-61 (icon registration loop)

#### Step 4.2: Remove from package.json
**File**: `package.json`
- Remove `"element-plus": "^2.11.4"` from dependencies
- Remove `"@element-plus/icons-vue": "^2.3.2"` from dependencies

#### Step 4.3: Remove from tsconfig.json
**File**: `tsconfig.json`
- Remove `"element-plus/global"` from types array (Line 22)

#### Step 4.4: Update build-service-worker.ts
**File**: `scripts/build-service-worker.ts`
- Remove `'element-plus'` from external dependencies (Line 29)
- This is safe since the worker doesn't use Element Plus

### Phase 5: Documentation Cleanup (Priority: Low)

#### Step 5.1: Update theme-guide.md
**File**: `docs/theme-guide.md`
- Remove Element Plus CSS import reference (Line 18)
- Update any other Element Plus mentions

#### Step 5.2: Archive/Delete Replacement Plan
**File**: `docs/element-plus-replacement-plan.md`
- Archive or delete since migration is complete
- Or update to reflect completion status

### Phase 6: Final Verification (Priority: High)

#### Step 6.1: Run Tests
```bash
pnpm test:run
```
- Ensure all tests pass
- Fix any broken tests

#### Step 6.2: Type Check
```bash
pnpm type-check
```
- Ensure no TypeScript errors
- Fix any type issues

#### Step 6.3: Lint Check
```bash
pnpm lint
```
- Ensure no linting errors
- Auto-fix where possible

#### Step 6.4: Build Verification
```bash
pnpm build
```
- Ensure production build succeeds
- Check bundle size reduction

#### Step 6.5: Manual Testing
- Test all pages and components
- Verify icons display correctly
- Verify theme toggle works
- Verify all interactive elements work

#### Step 6.6: Clean Dependencies
```bash
pnpm install
```
- Clean install to remove unused packages
- Verify `pnpm-lock.yaml` no longer references Element Plus

## Migration Checklist

### Icon System
- [ ] Install `@iconify/vue` and icon set
- [x] **Decision made**: Use `Icon` directly from `@iconify/vue` (Option B)
- [ ] Replace all `GameIcon` usage with direct `Icon` component
- [ ] Remove `GameIcon` imports from all files
- [ ] Test icon rendering

### Component Replacements
- [ ] Replace `ThemeToggle.vue` (el-switch → GameSwitch)
- [ ] Replace icons in `GameNavigation.vue`
- [ ] Replace icons in `GameSelect.vue`
- [ ] Replace icons in `GameUpload.vue`
- [ ] Replace icons in `HomePage.vue`
- [ ] Replace icons in `IdePage.vue`
- [ ] Replace icons in `IdeControls.vue`
- [ ] Replace icons in `CodeEditor.vue`
- [ ] Replace icons in `JoystickControl.vue`
- [ ] Replace icons in `RuntimeOutput.vue`
- [ ] Replace icons in `ImageAnalyzerPage.vue`
- [ ] Replace icons in `MonacoEditorPage.vue`
- [ ] Replace icons in `CharacterSpriteViewerPage.vue`

### CSS Cleanup
- [ ] Remove `.el-icon` styles from `RuntimeOutput.vue`
- [ ] Remove `.el-textarea__inner` styles from `ImageAnalyzerPage.vue`

### Core Dependencies
- [ ] Remove Element Plus imports from `main.ts`
- [ ] Remove Element Plus registration from `main.ts`
- [ ] Remove icon registration from `main.ts`
- [ ] Remove from `package.json` dependencies
- [ ] Remove from `tsconfig.json` types
- [ ] Remove from `build-service-worker.ts` externals

### Documentation
- [ ] Update `theme-guide.md`
- [ ] Archive/delete `element-plus-replacement-plan.md`

### Verification
- [ ] All tests pass
- [ ] Type check passes
- [ ] Lint check passes
- [ ] Build succeeds
- [ ] Manual testing complete
- [ ] Dependencies cleaned

## Estimated Impact

### Bundle Size Reduction
- **element-plus**: ~500KB+ (minified)
- **@element-plus/icons-vue**: ~100KB+ (minified)
- **Total savings**: ~600KB+ (uncompressed)

### Benefits
- ✅ Smaller bundle size
- ✅ No external UI library dependency
- ✅ Full control over component styling
- ✅ Consistent game-style aesthetic
- ✅ Better tree-shaking
- ✅ Faster load times

### Risks
- ⚠️ Icon migration requires careful testing
- ⚠️ Need to ensure all icons have equivalents
- ⚠️ Theme toggle functionality must be preserved
- ⚠️ CSS cleanup may affect styling

## Rollback Plan

If issues arise:
1. Keep Element Plus in `package.json` but commented
2. Keep icon imports but commented
3. Revert `main.ts` changes
4. Test incrementally

## Notes

- Most UI components are already replaced, so this is primarily an icon migration
- No backward compatibility needed - we can change all code directly
- **Using `Icon` directly from `@iconify/vue`** - no wrapper component needed
- `GameIcon.vue` will not be updated; all usage will be replaced with direct `Icon` component
- `GameSwitch.vue` exists and can replace `el-switch`
- All other components have been migrated to `Game*` components
- The main work is direct icon replacement and cleanup
- No migration mapping layer needed - direct replacement is simpler

## Quick Reference: Icon Replacements

| Element Plus Icon | Iconify Equivalent |
|-------------------|-------------------|
| `VideoPlay` | `mdi:play` |
| `VideoPause` | `mdi:pause` |
| `Delete` | `mdi:delete` |
| `Loading` | `mdi:loading` |
| `CircleCheck` | `mdi:check-circle` |
| `Edit` | `mdi:pencil` |
| `Monitor` | `mdi:monitor` |
| `Picture` | `mdi:image` |
| `Grid` | `mdi:grid` |
| `Upload` | `mdi:upload` |
| `ArrowDown` | `mdi:chevron-down` |
| `ArrowUp` | `mdi:chevron-up` |
| `ArrowLeft` | `mdi:chevron-left` |
| `ArrowRight` | `mdi:chevron-right` |
| `Sunny` | `mdi:weather-sunny` |
| `Moon` | `mdi:weather-night` |
| `Tools` | `mdi:tools` |
| `Document` | `mdi:file-document` |
| `Warning` | `mdi:alert` |
| `DataBoard` | `mdi:view-dashboard` |
| `Search` | `mdi:magnify` |
| `Plus` | `mdi:plus` |
| `Minus` | `mdi:minus` |
| `View` | `mdi:eye` |
