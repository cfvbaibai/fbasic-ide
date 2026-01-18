// Stylelint Configuration
// Enforces no hardcoded colors - use CSS variables instead
// Detects undefined CSS variables across files
// 
// Run: pnpm lint:style

export default {
    extends: [
        'stylelint-config-standard',
        'stylelint-config-standard-vue'
    ],
    plugins: [
        'stylelint-value-no-unknown-custom-properties'
    ],
    rules: {
        'color-no-hex': true,
        'color-named': 'never',
        'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'],
        // Detect undefined CSS variables (checks theme.css imports AND same-file definitions)
        'csstools/value-no-unknown-custom-properties': [
            true,
            {
                importFrom: ['src/shared/styles/theme.css']
            }
        ],
    },
    ignoreFiles: [
        '**/node_modules/**',
        '**/dist/**',
        // Allow theme.css since it defines the CSS variables
        'src/shared/styles/theme.css',
        // Allow skin files - they define base color palettes with hardcoded colors
        'src/shared/styles/skins/*.css',
    ]
}