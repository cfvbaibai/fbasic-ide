# Element Plus Replacement Plan

## Overview
This document outlines the plan to replace Element Plus with custom game-style UI components that align with the F-BASIC emulator's retro aesthetic.

## Current Element Plus Usage Analysis

### Components Currently Used
1. **el-button** - Used extensively across:
   - `IdeControls.vue` (Run, Stop, Clear, Debug buttons)
   - `ImageAnalyzerPage.vue` (Upload, Analyze, grid controls)
   - `MonacoEditorPage.vue` (Back button)
   - Various other pages

2. **el-icon** - Used everywhere for icons
   - Navigation icons
   - Button icons
   - Status indicators
   - Tab icons

3. **el-tag** - Status indicators
   - Runtime status (Running/Ready)
   - Error counts
   - Live indicators
   - Variable counts

4. **el-tabs** - Tab navigation
   - `RuntimeOutput.vue` (Screen, STDOUT, Debug, Variables tabs)

5. **el-upload** - File upload
   - `ImageAnalyzerPage.vue` (Image upload)

6. **el-button-group** - Button groups
   - `IdeControls.vue`
   - `ImageAnalyzerPage.vue` (Grid controls)

7. **el-input** / **el-textarea** - Form inputs
   - `DefStatements.vue` (likely)
   - Various form inputs

8. **el-card** - Card containers
   - `MonacoEditorPage.vue` (Info panel)

9. **el-divider** - Visual separators
   - Used in various layouts

10. **el-scrollbar** - Custom scrollbars
    - Output areas (though native scrollbars are also used)

### Icon Library
- `@element-plus/icons-vue` - Used throughout for icons
- Need to replace with custom icon system or alternative

## Migration Strategy

### Phase 1: Foundation Components (Priority: High)
Build the most fundamental components that everything else depends on.

#### 1.1 Icon System
**Component**: `GameIcon.vue` or use SVG icons directly
- **Location**: `src/shared/components/ui/GameIcon.vue`
- **Features**:
  - Support for SVG icons
  - Size variants (small, medium, large)
  - Color theming via CSS variables
  - Animation support (rotate, pulse, etc.)
- **Alternative**: Use a lightweight icon library like `@iconify/vue` or inline SVGs
- **Migration**: Create icon mapping from Element Plus icons to new system

#### 1.2 Button Component
**Component**: `GameButton.vue`
- **Location**: `src/shared/components/ui/GameButton.vue`
- **Props**:
  - `type`: 'primary' | 'success' | 'warning' | 'danger' | 'default'
  - `size`: 'small' | 'medium' | 'large'
  - `disabled`: boolean
  - `loading`: boolean
  - `icon`: icon component (optional)
- **Features**:
  - Game-style appearance with gradients and borders
  - Hover effects with glow
  - Loading state with spinner
  - Icon support
  - Disabled state styling
- **Usage**: Replace all `el-button` instances

#### 1.3 Button Group Component
**Component**: `GameButtonGroup.vue`
- **Location**: `src/shared/components/ui/GameButtonGroup.vue`
- **Features**:
  - Groups buttons together with shared borders
  - Game-style appearance
- **Usage**: Replace `el-button-group`

### Phase 2: Status & Display Components (Priority: High)
Components for showing status and information.

#### 2.1 Tag/Badge Component
**Component**: `GameTag.vue`
- **Location**: `src/shared/components/ui/GameTag.vue`
- **Props**:
  - `type`: 'success' | 'warning' | 'danger' | 'info' | 'default'
  - `size`: 'small' | 'medium' | 'large'
  - `effect`: 'light' | 'dark' | 'plain'
- **Features**:
  - Game-style badge appearance
  - Icon support
  - Animated states (e.g., pulsing for "Live")
- **Usage**: Replace all `el-tag` instances

#### 2.2 Divider Component
**Component**: `GameDivider.vue`
- **Location**: `src/shared/components/ui/GameDivider.vue`
- **Features**:
  - Horizontal/vertical dividers
  - Game-style appearance with subtle glow
- **Usage**: Replace `el-divider`

### Phase 3: Navigation Components (Priority: Medium)
Components for navigation and content organization.

#### 3.1 Tabs Component
**Component**: `GameTabs.vue` + `GameTabPane.vue`
- **Location**: `src/shared/components/ui/GameTabs.vue`
- **Props**:
  - `modelValue`: string (active tab name)
  - `type`: 'default' | 'border-card'
- **Features**:
  - Game-style tab appearance
  - Icon support in labels
  - Badge support in labels
  - Disabled tab support
  - Smooth transitions
- **Usage**: Replace `el-tabs` in `RuntimeOutput.vue`

### Phase 4: Form Components (Priority: Medium)
Components for user input.

#### 4.1 Input Component
**Component**: `GameInput.vue`
- **Location**: `src/shared/components/ui/GameInput.vue`
- **Props**:
  - `modelValue`: string | number
  - `type`: 'text' | 'number' | 'password' | etc.
  - `placeholder`: string
  - `disabled`: boolean
  - `size`: 'small' | 'medium' | 'large'
- **Features**:
  - Game-style input appearance
  - Focus glow effect
  - Disabled state
- **Usage**: Replace `el-input`

#### 4.2 Textarea Component
**Component**: `GameTextarea.vue`
- **Location**: `src/shared/components/ui/GameTextarea.vue`
- **Props**: Similar to `GameInput`
- **Features**:
  - Game-style textarea appearance
  - Resizable
  - Scrollbar styling
- **Usage**: Replace `el-textarea`

#### 4.3 Upload Component
**Component**: `GameUpload.vue`
- **Location**: `src/shared/components/ui/GameUpload.vue`
- **Props**:
  - `accept`: string (file types)
  - `autoUpload`: boolean
  - `onChange`: function
- **Features**:
  - Game-style upload button/area
  - Drag and drop support
  - File preview (optional)
- **Usage**: Replace `el-upload` in `ImageAnalyzerPage.vue`

### Phase 5: Container Components (Priority: Low)
Components for layout and containers.

#### 5.1 Card Component
**Component**: `GameCard.vue` (already exists, may need enhancement)
- **Location**: `src/shared/components/ui/GameCard.vue`
- **Enhancements**:
  - Header slot
  - Footer slot
  - Body slot
- **Usage**: Replace `el-card` in `MonacoEditorPage.vue`

#### 5.2 Scrollbar Component
**Component**: `GameScrollbar.vue` (optional)
- **Location**: `src/shared/components/ui/GameScrollbar.vue`
- **Note**: May not be necessary if native scrollbars with custom styling suffice
- **Features**:
  - Custom styled scrollbar
  - Game-style appearance
- **Usage**: Replace `el-scrollbar` (if needed)

## Implementation Plan

### Step 1: Setup Icon System
1. Decide on icon solution:
   - Option A: Use `@iconify/vue` (lightweight, many icons)
   - Option B: Create custom SVG icon components
   - Option C: Use inline SVGs with a helper component
2. Create `GameIcon.vue` wrapper component
3. Create icon mapping utility
4. Update theme system for icon colors

### Step 2: Build Foundation Components
1. Create `GameButton.vue` with all variants
2. Create `GameButtonGroup.vue`
3. Create `GameTag.vue`
4. Create `GameDivider.vue`
5. Test components in isolation
6. Add to component library documentation

### Step 3: Build Navigation Components
1. Create `GameTabs.vue` and `GameTabPane.vue`
2. Test with `RuntimeOutput.vue` use case
3. Ensure smooth transitions and animations

### Step 4: Build Form Components
1. Create `GameInput.vue`
2. Create `GameTextarea.vue`
3. Create `GameUpload.vue`
4. Test form interactions

### Step 5: Migration
1. Start with low-risk components (buttons, tags)
2. Migrate one page at a time:
   - `IdeControls.vue` (buttons, tags)
   - `RuntimeOutput.vue` (tabs, tags, icons)
   - `ImageAnalyzerPage.vue` (upload, buttons, button groups)
   - Other pages
3. Test thoroughly after each migration
4. Remove Element Plus dependencies

### Step 6: Cleanup
1. Remove Element Plus from `package.json`
2. Remove Element Plus imports from `main.ts`
3. Remove Element Plus CSS imports
4. Update documentation
5. Update README

## Component Design Principles

### Visual Style
- **Retro/Game Aesthetic**: Dark backgrounds, neon accents, glowing effects
- **Consistent Theming**: Use CSS variables from theme system
- **Smooth Animations**: Subtle hover effects, transitions
- **Accessibility**: Maintain keyboard navigation, ARIA attributes

### Technical Requirements
- **TypeScript**: Full type safety
- **Composition API**: Use Vue 3 Composition API
- **Props Validation**: Proper prop types and defaults
- **Slots**: Support for flexible content via slots
- **Events**: Emit standard Vue events
- **Accessibility**: ARIA attributes, keyboard navigation

### Theme Integration
- All components must use CSS variables from `theme.css`
- Support both light and dark themes (if applicable)
- Game-specific colors should use `--game-*` variables
- Regular app colors should use `--app-*` variables

## File Structure

```
src/shared/components/ui/
├── GameButton.vue
├── GameButtonGroup.vue
├── GameTag.vue
├── GameDivider.vue
├── GameTabs.vue
├── GameTabPane.vue
├── GameInput.vue
├── GameTextarea.vue
├── GameUpload.vue
├── GameCard.vue (enhance existing)
├── GameIcon.vue
├── GameScrollbar.vue (optional)
└── index.ts (barrel export)
```

## Testing Strategy

1. **Component Tests**: Unit tests for each component
2. **Visual Tests**: Manual testing in browser
3. **Integration Tests**: Test components in actual pages
4. **Accessibility Tests**: Keyboard navigation, screen readers
5. **Theme Tests**: Test in both light and dark themes

## Timeline Estimate

- **Phase 1 (Foundation)**: 2-3 days
- **Phase 2 (Status)**: 1-2 days
- **Phase 3 (Navigation)**: 2-3 days
- **Phase 4 (Forms)**: 2-3 days
- **Phase 5 (Containers)**: 1 day
- **Migration**: 2-3 days
- **Testing & Cleanup**: 1-2 days

**Total**: ~12-17 days

## Risks & Mitigation

### Risk 1: Missing Features
- **Risk**: Element Plus has features we haven't identified
- **Mitigation**: Complete audit before starting, create comprehensive component list

### Risk 2: Accessibility Regression
- **Risk**: Custom components may not be as accessible as Element Plus
- **Mitigation**: Follow WCAG guidelines, test with screen readers, maintain keyboard navigation

### Risk 3: Performance Issues
- **Risk**: Custom components may be slower
- **Mitigation**: Optimize components, use Vue best practices, profile performance

### Risk 4: Breaking Changes During Migration
- **Risk**: Migration may break existing functionality
- **Mitigation**: Migrate incrementally, test thoroughly, maintain feature parity

## Success Criteria

1. ✅ All Element Plus components replaced
2. ✅ No visual regressions
3. ✅ All functionality preserved
4. ✅ Improved game-style aesthetic
5. ✅ Better theme integration
6. ✅ Reduced bundle size (Element Plus removal)
7. ✅ All tests passing
8. ✅ Documentation updated

## Next Steps

1. Review and approve this plan
2. Set up icon system
3. Begin Phase 1 implementation
4. Create component documentation template
5. Set up component testing infrastructure
