# Vue Best Practices Improvement Plan

**Date**: 2024  
**Status**: Planning  
**Priority**: High

## Executive Summary

This document outlines violations of Vue 3 best practices identified in the codebase and provides a structured improvement plan. The analysis is based on the `vue-best-practices` skill (hyf0/vue-skills) which contains 41 rules covering TypeScript configuration, component patterns, composables, and Vue Router.

## Issues Identified

### 🔴 High Priority Issues

#### 1. **Provide/Inject Without Type Safety** (provide-inject-types rule)
**Impact**: MEDIUM → HIGH (Type safety critical for maintainability)

**Location**: `src/shared/components/ui/GameTabs.vue`

**Issue**:
```typescript
// Current: Using string keys without InjectionKey
provide('activeTab', activeTab)
provide('setActiveTab', (name: string) => { ... })
provide('tabsType', props.type)
provide('registerTab', registerTab)
provide('unregisterTab', unregisterTab)
```

**Problem**: 
- No type safety for injected values
- No autocomplete support
- Runtime errors only (no compile-time checks)
- Inconsistent with `useSpriteViewerStore` which correctly uses `InjectionKey`

**Fix Required**:
- Create `InjectionKey` constants for all provided values
- Update `GameTabButton.vue` and `GameTabPane.vue` to use typed inject
- Add runtime error handling for missing injections

---

#### 2. **Template Event Handlers Using $emit** (event-handler-typing rule)
**Impact**: MEDIUM

**Location**: `src/features/ide/components/IdeControls.vue`

**Issue**:
```vue
<!-- Current: Direct $emit in template -->
<GameButton @click="$emit('stop')">
<GameButton @click="$emit('clear')">
```

**Problem**:
- Less maintainable than named handler functions
- Harder to add logic before emitting
- Inconsistent with other handlers in the same component

**Fix Required**:
- Create typed handler functions for all emits
- Ensure all event handlers are properly typed

---

#### 3. **Missing vue-tsc Strict Template Checking** (vue-tsc-strict-templates rule)
**Impact**: HIGH

**Location**: `tsconfig.json`

**Issue**:
- No `vueCompilerOptions` configured
- Strict template checking not enabled
- Undefined components in templates won't be caught at compile time

**Fix Required**:
- Add `vueCompilerOptions` to `tsconfig.json`
- Enable `strictTemplates: true`
- Configure `target` for proper type checking

---

#### 4. **Component Type Extraction Not Used** (component-type-helpers rule)
**Impact**: HIGH (Code reusability and type safety)

**Location**: Multiple components

**Issue**:
- No extraction of component prop/emit types
- Parent components can't reuse child component types
- Wrapper components can't extend base component props

**Example**: `GameButton` props could be extracted and reused in wrapper components.

**Fix Required**:
- Extract prop types from key components using `ComponentProps<typeof Component>`
- Create type utilities for commonly reused component types
- Update wrapper components to use extracted types

---

### 🟡 Medium Priority Issues

#### 5. **Missing defineOptions for Component Names**
**Impact**: MEDIUM (Developer experience)

**Location**: All components using `<script setup>`

**Issue**:
- Components don't have explicit names
- Harder to debug in Vue DevTools
- No component name in error messages

**Fix Required**:
- Add `defineOptions({ name: 'ComponentName' })` to all components
- Use consistent naming convention

---

#### 6. **Inconsistent Event Handler Patterns**
**Impact**: MEDIUM (Code consistency)

**Location**: Multiple components

**Issue**:
- Mix of inline handlers and named functions
- Some components use `$emit` directly, others use handlers
- Inconsistent typing of event handlers

**Fix Required**:
- Standardize on named handler functions
- Ensure all handlers are properly typed
- Document event handler patterns

---

#### 7. **Missing JSDoc in Script Setup** (script-setup-jsdoc rule)
**Impact**: MEDIUM (Documentation)

**Location**: All components

**Issue**:
- Components lack JSDoc documentation
- Props and emits not documented
- Complex logic not explained

**Fix Required**:
- Add JSDoc comments to all components
- Document props, emits, and complex logic
- Use `@example` for usage patterns

---

#### 8. **Provide/Inject Pattern Inconsistency**
**Impact**: MEDIUM

**Location**: 
- ✅ `useSpriteViewerStore` - Correctly uses `InjectionKey`
- ❌ `GameTabs` - Uses string keys

**Issue**:
- Inconsistent patterns across codebase
- Some use typed injection, others don't

**Fix Required**:
- Standardize on `InjectionKey` pattern
- Create helper utilities for common injection patterns

---

### 🟢 Low Priority Issues

#### 9. **No defineExpose Usage**
**Impact**: LOW (May be needed for template refs)

**Location**: Components that might need template refs

**Issue**:
- No components explicitly expose methods/properties
- If template refs are needed, types won't be available

**Fix Required**:
- Review components that might need template refs
- Add `defineExpose` with proper types where needed

---

#### 10. **CSS v-bind Usage Review** (css-v-bind rule)
**Impact**: LOW

**Location**: Components using reactive CSS values

**Issue**:
- Need to verify safe usage of reactive values in CSS
- Check for potential reactivity issues

**Fix Required**:
- Review components using CSS variables with reactive values
- Ensure proper reactivity patterns

---

## Improvement Plan

### Phase 1: Type Safety Foundation (Week 1)

**Priority**: 🔴 High  
**Estimated Effort**: 2-3 days

#### Tasks:
1. **Enable vue-tsc Strict Templates**
   - [ ] Add `vueCompilerOptions` to `tsconfig.json`
   - [ ] Configure `strictTemplates: true`
   - [ ] Fix any template type errors that arise
   - [ ] Update CI to enforce strict template checking

2. **Fix Provide/Inject Type Safety**
   - [ ] Create `InjectionKey` constants for `GameTabs`
   - [ ] Update `GameTabButton.vue` to use typed inject
   - [ ] Update `GameTabPane.vue` to use typed inject
   - [ ] Add runtime error handling
   - [ ] Create `injectStrict` helper utility

3. **Standardize Event Handler Typing**
   - [ ] Fix `IdeControls.vue` to use typed handlers
   - [ ] Review all components for `$emit` in templates
   - [ ] Create event handler typing guidelines
   - [ ] Update ESLint rules if needed

**Deliverables**:
- Updated `tsconfig.json` with strict template checking
- Typed provide/inject for `GameTabs`
- All event handlers properly typed
- Type checking passes with strict mode

---

### Phase 2: Component Type Utilities (Week 2)

**Priority**: 🔴 High  
**Estimated Effort**: 2-3 days

#### Tasks:
1. **Create Component Type Helpers**
   - [ ] Create `src/shared/types/components.ts` for extracted types
   - [ ] Extract prop types from key components (`GameButton`, `GameInput`, etc.)
   - [ ] Extract emit types where applicable
   - [ ] Create wrapper component type utilities

2. **Update Components to Use Extracted Types**
   - [ ] Identify wrapper components that can benefit
   - [ ] Update components to use `ComponentProps<typeof BaseComponent>`
   - [ ] Test type inference and autocomplete

3. **Document Type Extraction Patterns**
   - [ ] Add examples to codebase
   - [ ] Update development guidelines

**Deliverables**:
- Component type utilities file
- Updated wrapper components
- Documentation for type extraction patterns

---

### Phase 3: Code Quality Improvements (Week 3)

**Priority**: 🟡 Medium  
**Estimated Effort**: 2-3 days

#### Tasks:
1. **Add defineOptions to All Components**
   - [ ] Add component names to all `<script setup>` components
   - [ ] Use consistent naming convention
   - [ ] Verify Vue DevTools shows correct names

2. **Standardize Event Handler Patterns**
   - [ ] Review all components for consistency
   - [ ] Update components to use named handlers
   - [ ] Document patterns in guidelines

3. **Add JSDoc Documentation**
   - [ ] Add JSDoc to all components
   - [ ] Document props, emits, and complex logic
   - [ ] Add usage examples where helpful

**Deliverables**:
- All components have explicit names
- Consistent event handler patterns
- Comprehensive JSDoc documentation

---

### Phase 4: Advanced Patterns (Week 4)

**Priority**: 🟢 Low  
**Estimated Effort**: 1-2 days

#### Tasks:
1. **Review defineExpose Usage**
   - [ ] Identify components that might need template refs
   - [ ] Add `defineExpose` with proper types where needed
   - [ ] Test template ref type inference

2. **CSS v-bind Review**
   - [ ] Review components using reactive CSS values
   - [ ] Ensure proper reactivity patterns
   - [ ] Document safe usage patterns

3. **Provide/Inject Consistency**
   - [ ] Review all provide/inject usage
   - [ ] Standardize on `InjectionKey` pattern
   - [ ] Create shared injection utilities

**Deliverables**:
- Components with proper `defineExpose` where needed
- Reviewed and documented CSS v-bind usage
- Consistent provide/inject patterns

---

## Implementation Guidelines

### Type Safety Standards

1. **All provide/inject must use InjectionKey**
   ```typescript
   // ✅ Good
   export const MyKey: InjectionKey<MyType> = Symbol('MyKey')
   provide(MyKey, value)
   const value = inject(MyKey)
   
   // ❌ Bad
   provide('myKey', value)
   const value = inject('myKey')
   ```

2. **All event handlers must be typed**
   ```typescript
   // ✅ Good
   const handleClick = (event: MouseEvent) => { emit('click', event) }
   
   // ❌ Bad
   @click="$emit('click')"
   ```

3. **Component props/emits must be extractable**
   ```typescript
   // ✅ Good - can extract types
   interface Props { ... }
   const props = defineProps<Props>()
   
   // ✅ Good - extract in parent
   type ButtonProps = ComponentProps<typeof GameButton>
   ```

### Code Consistency Standards

1. **Component naming**: Use PascalCase, match file name
2. **Event handlers**: Always use named functions, never inline `$emit`
3. **Provide/inject**: Always use `InjectionKey`, never string keys
4. **Documentation**: All components must have JSDoc

---

## Testing Strategy

### Type Checking
- [ ] All changes must pass `pnpm type-check`
- [ ] Strict template checking enabled and passing
- [ ] No `any` types introduced

### Component Testing
- [ ] Existing tests continue to pass
- [ ] New tests for type safety where applicable
- [ ] Template ref tests if `defineExpose` is added

### Manual Testing
- [ ] Vue DevTools shows correct component names
- [ ] Autocomplete works for all typed values
- [ ] No runtime errors from type changes

---

## Success Metrics

1. **Type Safety**
   - ✅ 100% of provide/inject uses `InjectionKey`
   - ✅ 100% of event handlers properly typed
   - ✅ Strict template checking enabled and passing

2. **Code Quality**
   - ✅ All components have explicit names
   - ✅ Consistent event handler patterns
   - ✅ JSDoc coverage > 80%

3. **Developer Experience**
   - ✅ Full IDE autocomplete for all typed values
   - ✅ Compile-time errors catch issues early
   - ✅ Clear patterns documented

---

## Risk Assessment

### Low Risk
- Adding `defineOptions` - no runtime impact
- Adding JSDoc - no runtime impact
- Extracting component types - improves type safety

### Medium Risk
- Enabling strict template checking - may reveal existing issues
- Fixing provide/inject - requires testing all affected components
- Standardizing event handlers - requires careful testing

### Mitigation
- Enable strict checking incrementally
- Test each change in isolation
- Keep existing functionality working
- Update tests as needed

---

## References

- [vue-best-practices Skill](../.claude/skills/vue-best-practices/SKILL.md)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vue TypeScript Guide](https://vuejs.org/guide/typescript/overview.html)
- [Vue Router TypeScript](https://router.vuejs.org/guide/advanced/typescript.html)

---

## Appendix: Detailed Issue List

### Files Requiring Changes

#### High Priority
1. `src/shared/components/ui/GameTabs.vue` - Provide/inject types
2. `src/features/ide/components/IdeControls.vue` - Event handler typing
3. `tsconfig.json` - Strict template checking
4. `src/shared/components/ui/GameTabButton.vue` - Typed inject
5. `src/shared/components/ui/GameTabPane.vue` - Typed inject

#### Medium Priority
- All `.vue` files - Add `defineOptions`
- All `.vue` files - Add JSDoc
- Components with event handlers - Standardize patterns

#### Low Priority
- Components that might need template refs - Add `defineExpose`
- Components with reactive CSS - Review CSS v-bind usage

---

**Next Steps**: Review this plan and prioritize based on project needs. Start with Phase 1 for immediate type safety improvements.
