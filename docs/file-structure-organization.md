# File Structure Organization

## New Feature-Based Structure

The codebase has been reorganized from a file-type-based structure to a feature-based structure, following the principle of organizing by business features and route pages.

### Directory Structure

```
src/
├── features/                    # Feature-based organization
│   ├── sprite-viewer/          # Character Sprite Viewer feature
│   │   ├── components/          # Feature-specific components
│   │   │   ├── AnimationControl.vue
│   │   │   ├── ColorBox.vue
│   │   │   ├── ColorPaletteDisplay.vue
│   │   │   ├── DisplayOptions.vue
│   │   │   ├── PaletteCombinations.vue
│   │   │   ├── PaletteSelector.vue
│   │   │   ├── SpriteControls.vue
│   │   │   ├── SpriteGrid.vue
│   │   │   └── SpriteSelector.vue
│   │   ├── composables/        # Feature-specific composables
│   │   │   ├── usePaletteSelection.ts
│   │   │   ├── useSpriteAnimation.ts
│   │   │   ├── useSpriteDisplay.ts
│   │   │   └── useSpriteViewerStore.ts
│   │   └── CharacterSpriteViewerPage.vue
│   │
│   ├── image-analyzer/          # Image Analyzer feature
│   │   └── ImageAnalyzerPage.vue
│   │
│   └── ide/                     # IDE feature (Home + Monaco Editor)
│       ├── components/          # IDE-specific components
│       │   ├── CodeEditor.vue
│       │   ├── IdeControls.vue
│       │   ├── JoystickControl.vue
│       │   ├── MonacoCodeEditor.vue
│       │   └── RuntimeOutput.vue
│       ├── composables/         # IDE-specific composables
│       │   └── useBasicIdeEnhanced.ts
│       ├── HomePage.vue
│       └── MonacoEditorPage.vue
│
├── shared/                      # Shared across features
│   ├── components/              # (empty, for future shared components)
│   ├── composables/            # (empty, for future shared composables)
│   └── data/                   # Shared data
│       ├── palette.ts
│       └── sprites.ts
│
├── core/                       # Core interpreter (unchanged)
├── integrations/               # Integrations (unchanged)
├── router/                     # Router configuration
└── utils/                      # Utilities (unchanged)
```

### Benefits

1. **Feature Isolation**: Each feature is self-contained with its own components, composables, and page
2. **Easy Navigation**: Find all related code for a feature in one place
3. **Better Scalability**: Easy to add new features without cluttering shared directories
4. **Clear Dependencies**: Shared code is explicitly in `shared/`, feature code is in `features/`
5. **Route-Based Organization**: Each route page is co-located with its feature code

### Import Paths

- **Within feature**: Use relative paths (`../components/`, `../composables/`)
- **To shared**: Use relative paths (`../../../shared/data/`)
- **To core**: Use relative paths (`../../../core/...`)

### Migration Summary

- ✅ Moved sprite-viewer feature (9 components, 4 composables, 1 page)
- ✅ Moved image-analyzer feature (1 page)
- ✅ Moved IDE feature (5 components, 1 composable, 2 pages)
- ✅ Moved shared data (palette.ts, sprites.ts)
- ✅ Updated all import paths
- ✅ Updated router configuration
- ✅ Removed empty old directories

