import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import globals from 'globals'

export default [
    js.configs.recommended,
    {
        files: ['**/*.{js,ts}'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
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
            'no-undef': 'off', // TypeScript handles this, turn off for TS files
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
        ignores: ['dist', 'node_modules', '*.config.js', '**/*.vue'],
    },
]