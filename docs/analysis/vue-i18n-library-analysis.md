# Vue I18n Library Analysis

## Executive Summary

**Recommendation**: Use **vue-i18n v11** (from `@intlify/vue-i18n` organization) - it is the best choice for this project.

## Research Date
January 2025

## Project Requirements

From `docs/planning/i18n-refactoring-plan.md`:
- Vue 3 with Composition API support
- TypeScript type safety for translation keys
- JSON-based translation files
- Multiple locales (English, Japanese initially)
- Locale switching functionality
- Medium-sized application (not enterprise-scale)

Current project stack:
- Vue 3.5.22 with Composition API
- TypeScript (strict mode)
- Vite build tool

## Library Comparison

### vue-i18n (intlify/vue-i18n) ✅ RECOMMENDED

**Repository**: https://github.com/intlify/vue-i18n  
**Package**: `vue-i18n` (npm)  
**Latest Stable**: v11.2.8  
**Weekly Downloads**: ~1,550,758  
**GitHub Stars**: ~2,627  

#### Strengths
- ✅ **Official Vue ecosystem library** - de facto standard for Vue i18n
- ✅ **Active maintenance** - v11 is stable, v12-alpha in development
- ✅ **Perfect Vue 3 Composition API support** - native `useI18n()` composable
- ✅ **Excellent TypeScript support** - can generate types for translation keys
- ✅ **Large community and ecosystem** - extensive documentation, tools, integrations
- ✅ **Security maintained** - CVE-2024-52809 patched in v9.14.2 and v10.0.5
- ✅ **Rich features** - pluralization, number/date formatting, message format syntax
- ✅ **Tree-shakable** - modular architecture allows optimization
- ✅ **Well-documented** - comprehensive official documentation

#### Considerations
- ⚠️ Legacy API mode deprecated in v11 (but not needed for new projects)
- ⚠️ v9/v10 entering maintenance mode after July 2025 (use v11+ for new projects)
- ⚠️ Some complexity in advanced features (but basic usage is straightforward)

#### Version Recommendations
- **Use v11.x** - Current stable version with full Composition API support
- **Avoid v9/v10** - Entering maintenance mode
- **Avoid v12-alpha** - Not yet stable

### Alternative Libraries Evaluated

#### i18next-vue
- **Strengths**: Mature, rich plugin ecosystem, good for complex enterprise apps
- **Weaknesses**: Heavier bundle, less Vue-native, more configuration overhead
- **Verdict**: Overkill for this project's needs

#### v-intl (@vinayakkulkarni/v-intl)
- **Strengths**: Very lightweight, native Intl API usage
- **Weaknesses**: Only formatting (numbers/dates), no translation key management
- **Verdict**: Doesn't meet requirements (needs translation management)

#### Intlayer
- **Strengths**: Modern, typed translations, automation features
- **Weaknesses**: Newer/less mature, smaller community, may be overkill
- **Verdict**: Not necessary for this project's scope

#### Fluent-Vue / Vue-gettext
- **Strengths**: Alternative paradigms (FTL format, PO files)
- **Weaknesses**: Less common in Vue ecosystem, fewer tools
- **Verdict**: Unnecessary complexity for JSON-based translations

## Decision Criteria Matrix

| Criterion | vue-i18n v11 | i18next-vue | v-intl | Intlayer |
|-----------|-------------|-------------|--------|----------|
| Vue 3 Composition API | ✅ Native | ⚠️ Plugin-based | ✅ Native | ⚠️ Tool-based |
| TypeScript Support | ✅ Excellent | ✅ Good | ❌ Limited | ✅ Excellent |
| Maintenance Status | ✅ Active (v11) | ✅ Active | ✅ Active | ⚠️ Newer |
| Community Size | ✅ Large (1.5M/wk) | ✅ Large | ⚠️ Smaller | ⚠️ Growing |
| Documentation | ✅ Comprehensive | ✅ Good | ⚠️ Limited | ⚠️ Limited |
| Bundle Size | ✅ Moderate | ⚠️ Larger | ✅ Very Small | ⚠️ Tool overhead |
| Feature Completeness | ✅ Full | ✅ Full | ❌ Formatting only | ✅ Full |
| Learning Curve | ✅ Moderate | ⚠️ Steeper | ✅ Easy | ⚠️ Steeper |
| **Fit for Project** | ✅ **Perfect** | ⚠️ Overkill | ❌ Insufficient | ⚠️ Overkill |

## Security Considerations

- vue-i18n had a security vulnerability (CVE-2024-52809) in v9.3.0-10.0.4
- **Patched in**: v9.14.2, v10.0.5, and all v11 versions
- **Recommendation**: Use v11.2.8 or later to avoid any security concerns

## Installation Command

```bash
pnpm add vue-i18n@^11
```

## Conclusion

**vue-i18n v11** is the optimal choice because:

1. **Perfect fit for requirements**: Matches all project needs (Vue 3 Composition API, TypeScript, JSON files)
2. **Official and maintained**: Part of official Vue ecosystem, actively developed
3. **Proven stability**: v11 is stable, v9/v10 maintenance shows clear versioning strategy
4. **Strong community**: 1.5M+ weekly downloads, extensive documentation and tools
5. **Security**: Latest version has all security patches
6. **No significant drawbacks**: Complexity is manageable, bundle size reasonable

The plan in `docs/planning/i18n-refactoring-plan.md` correctly specifies `vue-i18n@^9`, but should be updated to **`vue-i18n@^11`** for optimal long-term support.

## Next Steps

1. ✅ Confirm vue-i18n v11 as the chosen library
2. Update `docs/planning/i18n-refactoring-plan.md` to specify v11 instead of v9
3. Proceed with implementation using vue-i18n v11
