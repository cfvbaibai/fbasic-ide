import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
    js.configs.recommended,
    {
        files: ['**/*.{js,ts}'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                setTimeout: 'readonly',
                console: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['error', {
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_',
                'ignoreRestSiblings': true
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-unused-vars': 'off', // Turn off base rule as it can report incorrect errors
            // Custom rule to disallow "as unknown as" type assertions
            'no-restricted-syntax': [
                'error',
                {
                    selector: "TSAsExpression[expression.type='TSAsExpression']",
                    message: 'Avoid using "as unknown as" type assertions. Use proper type definitions instead.',
                },
            ],
        },
    },
    {
        ignores: ['dist', 'node_modules', '*.config.js', '**/*.vue', 'src/core/parser/fbasic-parser.js'],
    },
]