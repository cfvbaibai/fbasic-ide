# i18n Refactoring Plan

## Overview

This document outlines the plan to add internationalization (i18n) support to the Family Basic IDE project. The project currently uses hardcoded English strings throughout the Vue components and needs to be refactored to support multiple languages.

## Goals

1. **Add Vue I18n**: Install and configure `vue-i18n` for Vue 3 with Composition API
2. **Extract Text Strings**: Identify and extract all user-facing text from components
3. **Organize Translations**: Structure translation files by feature/module
4. **Implement Locale Switching**: Add language selector to the UI
5. **Preserve F-BASIC Errors**: Keep F-BASIC error codes (NF, SN, etc.) as-is since they're part of the language specification

## Technology Stack

- **Library**: `vue-i18n` (v11+) for Vue 3 Composition API
- **Type Safety**: TypeScript types for translation keys
- **Default Locale**: English (en)
- **Target Locales**: To be determined (likely Japanese (ja) for historical accuracy)

## Project Structure Changes

```
src/
├── shared/
│   ├── i18n/
│   │   ├── index.ts              # i18n instance configuration
│   │   ├── locales/
│   │   │   ├── en/
│   │   │   │   ├── common.json   # Common UI strings
│   │   │   │   ├── navigation.json
│   │   │   │   ├── ide.json      # IDE-specific strings
│   │   │   │   ├── sprite-viewer.json
│   │   │   │   └── home.json
│   │   │   └── ja/
│   │   │       ├── common.json
│   │   │       ├── navigation.json
│   │   │       ├── ide.json
│   │   │       ├── sprite-viewer.json
│   │   │       └── home.json
│   │   └── types.ts               # TypeScript types for translation keys
│   └── composables/
│       └── useI18n.ts            # Wrapper composable (optional)
```

## Implementation Steps

### Phase 1: Setup and Configuration

1. **Install Dependencies**
   ```bash
   pnpm add vue-i18n@^11
   ```

2. **Create i18n Configuration**
   - Create `src/shared/i18n/index.ts` with `createI18n` setup
   - Configure for Composition API mode (`legacy: false`)
   - Set up default locale (en) and fallback locale
   - Register with Vue app in `src/main.ts`

3. **Create Translation File Structure**
   - Create base locale files (en, ja)
   - Organize by feature/module for maintainability
   - Use JSON format for translation files

### Phase 2: Extract and Organize Text Strings

#### Text Categories to Extract:

1. **Navigation** (`navigation.json`)
   - Navigation menu items (Home, IDE, Monaco Editor, etc.)
   - Navigation descriptions
   - App title: "F-BASIC EMU"

2. **Home Page** (`home.json`)
   - Hero section (title, subtitle, description)
   - Feature cards (titles, descriptions, action text)
   - Info sections ("About F-BASIC", "Getting Started")
   - Button labels ("Explore →")

3. **IDE Controls** (`ide.json`)
   - Button labels: "Run", "Stop", "Clear"
   - Toggle labels: "Debug"
   - Screen/output labels
   - Error messages (UI layer only, not F-BASIC runtime errors)
   - Status messages

4. **Sprite Viewer** (`sprite-viewer.json`)
   - Page title: "Character Sprite Viewer"
   - Control labels
   - Display option labels
   - Palette labels ("Sprite Palette", "Background Palette")
   - Grid cell tooltips

5. **Common UI Components** (`common.json`)
   - Button labels (if generic)
   - Upload component: "Upload File", "Drag and drop files here", "click to browse"
   - Input placeholders (if generic)
   - Modal/dialog text
   - Form labels

6. **Monaco Editor** (if applicable)
   - Editor-specific labels
   - Tooltip text

### Phase 3: Refactor Components

#### Components to Update:

**High Priority (User-Facing)**
1. `src/shared/components/GameNavigation.vue`
2. `src/features/home/HomePage.vue`
3. `src/features/ide/components/IdeControls.vue`
4. `src/features/sprite-viewer/CharacterSpriteViewerPage.vue`
5. `src/shared/components/ui/GameUpload.vue`

**Medium Priority**
6. `src/features/sprite-viewer/components/*.vue` (all sprite viewer components)
7. `src/shared/components/ui/HeroSection.vue` (if text passed as props)
8. `src/features/ide/IdePage.vue`
9. Other feature pages

**Low Priority (Generic Components)**
10. Generic UI components (may not need i18n if they're purely presentational)

#### Refactoring Pattern:

**Before:**
```vue
<template>
  <GameButton>Run</GameButton>
</template>
```

**After:**
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <GameButton>{{ t('ide.controls.run') }}</GameButton>
</template>
```

### Phase 4: Locale Management

1. **Create Locale Store/Composable**
   - Create `src/shared/composables/useLocale.ts` (optional)
   - Manage current locale state
   - Persist locale preference (localStorage)
   - Provide locale switching function

2. **Add Language Selector**
   - Add to navigation bar (similar to skin selector)
   - Or create language switcher component
   - Allow users to switch between available locales

3. **Browser Language Detection**
   - Detect user's browser language on first visit
   - Fall back to default locale if user's language not available

### Phase 5: Type Safety (Optional but Recommended)

1. **Generate TypeScript Types**
   - Create TypeScript types for translation keys
   - Use TypeScript to ensure type safety when accessing translations
   - Prevents typos in translation keys

2. **Example:**
   ```typescript
   // src/shared/i18n/types.ts
   export interface TranslationKeys {
     navigation: {
       home: string
       ide: string
       // ...
     }
     ide: {
       controls: {
         run: string
         stop: string
         // ...
       }
     }
   }
   ```

### Phase 6: Testing

1. **Component Tests**
   - Update existing tests to handle i18n
   - Mock `useI18n` in tests if needed
   - Test translation switching

2. **Translation Coverage**
   - Verify all user-facing strings are translated
   - Check for missing translations
   - Validate translation file structure

## Translation File Structure Example

### `src/shared/i18n/locales/en/common.json`
```json
{
  "buttons": {
    "upload": "Upload File",
    "clear": "Clear",
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "upload": {
    "dragAndDrop": "Drag and drop files here, or",
    "clickToBrowse": "click to browse"
  }
}
```

### `src/shared/i18n/locales/en/navigation.json`
```json
{
  "appTitle": "F-BASIC EMU",
  "items": {
    "home": {
      "name": "Home",
      "description": "Main Menu"
    },
    "ide": {
      "name": "IDE",
      "description": "Family Basic IDE"
    },
    "monaco": {
      "name": "Monaco Editor",
      "description": "Advanced Code Editor"
    },
    "spriteViewer": {
      "name": "Sprite Viewer",
      "description": "View Character Sprites"
    }
  }
}
```

### `src/shared/i18n/locales/en/ide.json`
```json
{
  "controls": {
    "run": "Run",
    "stop": "Stop",
    "clear": "Clear",
    "debug": "Debug"
  },
  "output": {
    "title": "Runtime Output",
    "empty": "No output yet"
  }
}
```

## Considerations

### What NOT to Translate

1. **F-BASIC Error Codes**: Keep error codes like "SN ERROR", "NF ERROR" as-is (part of language spec)
2. **Technical Terms**: Consider keeping some technical terms in English if they're commonly used
3. **Code/Program Content**: User's BASIC code should remain as-written
4. **Variable Names**: User-defined variables remain unchanged

### What TO Translate

1. **UI Labels**: All buttons, menu items, titles
2. **Descriptive Text**: Feature descriptions, help text
3. **Messages**: User notifications, status messages
4. **Tooltips**: Hover tooltips and help text
5. **Placeholders**: Input placeholders where appropriate

## Migration Strategy

### Incremental Approach

1. **Start with High-Traffic Components**
   - Navigation first (most visible)
   - Home page next
   - Then IDE controls

2. **One Feature at a Time**
   - Complete one feature module before moving to next
   - Test after each module
   - Reduces risk of breaking changes

3. **Backward Compatibility**
   - Keep English as default
   - Existing functionality should continue to work
   - No breaking changes to API

## File Size Constraints

- Translation files should be organized to keep individual files under reasonable size
- If a translation file exceeds 500 lines, consider splitting by sub-feature
- JSON files are easier to manage than TypeScript object files for translations

## Future Enhancements

1. **Pluralization**: Use vue-i18n's pluralization features if needed
2. **Date/Number Formatting**: Use vue-i18n's formatting for locale-specific formats
3. **RTL Support**: Consider right-to-left languages if needed
4. **Translation Management**: Consider tools for managing translations (if team grows)
5. **Lazy Loading**: Lazy load translation files for better performance

## Dependencies

- `vue-i18n@^11` - Vue 3 Composition API compatible version (stable, actively maintained)

## Timeline Estimate

- **Phase 1 (Setup)**: 1-2 hours
- **Phase 2 (Extract Strings)**: 2-3 hours
- **Phase 3 (Refactor Components)**: 4-6 hours (depending on number of components)
- **Phase 4 (Locale Management)**: 2-3 hours
- **Phase 5 (Type Safety)**: 1-2 hours (optional)
- **Phase 6 (Testing)**: 2-3 hours

**Total Estimated Time**: 12-19 hours

## Questions to Resolve

1. **Target Languages**: Which languages should be supported initially?
   - English (en) - default
   - Japanese (ja) - likely, given F-BASIC's Japanese origins
   - Others?

2. **Locale Persistence**: Should locale preference be stored in localStorage?

3. **Translation Quality**: 
   - Who will provide translations?
   - Will professional translation be needed?

4. **F-BASIC Error Messages**: Should we translate error messages displayed to users, or keep original F-BASIC error codes only?

5. **Monaco Editor**: Should Monaco Editor itself be localized, or just our UI around it?
