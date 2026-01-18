// Stylelint Configuration
// Enforces no hardcoded colors - use CSS variables instead
// 
// Run: pnpm lint:style

export default {
    extends: [
        'stylelint-config-standard',
        'stylelint-config-standard-vue'
    ],
    rules: {
        'color-no-hex': true,
        'color-named': 'never',
    },
    ignoreFiles: [
        '**/node_modules/**',
        '**/dist/**',
        // Allow theme.css since it defines the CSS variables
        'src/shared/styles/theme.css',
        // Grid colors in ImageAnalyzerPage are intentional visualization colors
        'src/features/image-analyzer/ImageAnalyzerPage.vue'
    ]
}