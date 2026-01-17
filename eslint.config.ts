import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
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
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/consistent-type-imports': ['error', {
                'prefer': 'type-imports',
                'fixStyle': 'separate-type-imports'
            }],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    'selector': 'interface',
                    'format': ['PascalCase'],
                    'custom': {
                        'regex': '^I[A-Z]',
                        'match': false
                    }
                },
                {
                    'selector': 'typeAlias',
                    'format': ['PascalCase']
                },
                {
                    'selector': 'variable',
                    'modifiers': ['exported', 'const'],
                    'format': ['camelCase', 'UPPER_CASE', 'PascalCase'],
                    'leadingUnderscore': 'allow'
                },
                {
                    'selector': 'variable',
                    'format': ['camelCase', 'UPPER_CASE'],
                    'leadingUnderscore': 'allow'
                },
                {
                    'selector': 'function',
                    'format': ['camelCase']
                },
                {
                    'selector': 'parameter',
                    'format': ['camelCase'],
                    'leadingUnderscore': 'allow'
                }
            ],
            'max-lines': ['error', {
                'max': 500,
                'skipBlankLines': true,
                'skipComments': true
            }],
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
        files: ['**/*.vue'],
        plugins: {
            'vue': vuePlugin,
            '@typescript-eslint': tseslint
        },
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsparser,
                extraFileExtensions: ['.vue']
            },
            globals: {
                ...globals.browser,
            }
        },
        rules: {
            'max-lines': ['error', {
                'max': 500,
                'skipBlankLines': true,
                'skipComments': true
            }],
            'no-undef': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', {
                'argsIgnorePattern': '^.',
                'varsIgnorePattern': '^_',
                'ignoreRestSiblings': true
            }],
            'no-unused-vars': 'off',
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        '*.css',
                    ]
                }
            ]
        }
    },
    {
        ignores: [
            'dist',
            'node_modules',
            '**/*.config.ts',
            '**/*.config.js',
            '**/*.js',
            '**/*.html',
            'scripts/**/*',
            'src/shared/data/bg/kana.ts',
            'src/core/parser/FBasicChevrotainParser.ts',
        ],
    },
]