import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'

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
      'simple-import-sort': simpleImportSort,
      'no-relative-import-paths': noRelativeImportPaths,
    },
    rules: {
      // === IMPORT SORTING & ALIAS CONVERSION ===
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          allowSameFolder: true, // Allow same-folder imports (./Component)
          allowedDepth: 1, // Allow ../ imports (for composables sibling folder)
          rootDir: 'src', // Remove 'src/' from absolute paths
          prefix: '@', // Add '@' prefix to converted imports
        },
      ],

      // === EXISTING CORE RULES ===
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          modifiers: ['exported', 'const'],
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function',
          filter: {
            regex: '^use[A-Z].*',
            match: true,
          },
          format: ['camelCase'],
          custom: {
            regex: '^use[A-Z]',
            match: true,
          },
        },
      ],
      'max-lines': [
        'error',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-len': [
        'error',
        {
          code: 120,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreComments: false,
          ignoreTrailingComments: true,
        },
      ],
      'no-unused-vars': 'off',
      'no-undef': 'off',

      // === PHASE 1: ENHANCED TYPE SAFETY ===
      '@typescript-eslint/prefer-nullish-coalescing': 'warn', // Warn for now - requires careful review
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'warn', // Warn for now - may need default cases
      '@typescript-eslint/no-floating-promises': 'error', // Prevent unhandled promises
      '@typescript-eslint/await-thenable': 'error', // Prevent awaiting non-promises
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            arguments: false, // Allow async functions in VueUse event handlers
            attributes: false,
          },
        },
      ],

      // === PHASE 1: PERFORMANCE OPTIMIZATIONS ===
      'prefer-template': 'error',
      'no-array-constructor': 'error',

      // === CUSTOM RULES ===
      'no-restricted-syntax': [
        'error',
        {
          selector: "TSAsExpression[expression.type='TSAsExpression']",
          message: 'Avoid using "as unknown as" type assertions. Use proper type definitions instead.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lodash',
              message: 'Use native array methods instead of lodash',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.vue'],
    plugins: {
      vue: vuePlugin,
      '@typescript-eslint': tseslint,
      'simple-import-sort': simpleImportSort,
      'no-relative-import-paths': noRelativeImportPaths,
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsparser,
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'max-lines': [
        'error',
        {
          max: 500,
          skipBlankLines: false,
          skipComments: false,
        },
      ],
      'max-len': [
        'error',
        {
          code: 120,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreComments: false,
          ignoreTrailingComments: true,
        },
      ],
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^.',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-unused-vars': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: ['*.css'],
        },
      ],

      // === PHASE 1: VUE 3 COMPOSITION API & REACTIVITY ===

      // Reactivity preservation
      'vue/no-ref-object-reactivity-loss': 'error', // Prevent reactive destructuring
      'vue/no-ref-as-operand': 'error', // Prevent using ref as operand (use .value)

      // Import consistency
      'vue/prefer-import-from-vue': 'error', // Import from 'vue' not '@vue/*'

      // Cleanup & hygiene
      'vue/no-unused-refs': 'error', // Clean up unused template refs
      'vue/no-template-target-blank': 'error', // Security: require rel="noopener" for target="_blank"

      // Script setup patterns
      'vue/define-macros-order': [
        'error',
        {
          // Consistent macro ordering
          order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'],
        },
      ],
      'vue/valid-define-props': 'error', // Enforce valid defineProps
      'vue/valid-define-emits': 'error', // Enforce valid defineEmits

      // === PHASE 2: VUE 3 COMPONENT QUALITY ===

      // Component naming & organization
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/component-api-style': ['error', ['script-setup']], // Enforce script setup
      'vue/block-order': [
        'error',
        {
          // Consistent SFC block order
          order: ['script', 'template', 'style'],
        },
      ],

      // Template best practices
      'vue/no-v-html': 'warn', // XSS prevention
      'vue/v-on-event-hyphenation': ['error', 'always'], // @my-event not @myEvent
      'vue/attribute-hyphenation': ['error', 'always'], // my-prop not myProp

      // Composition API patterns
      'vue/no-watch-after-await': 'error', // watch() before await in setup
      'vue/no-setup-props-reactivity-loss': 'error', // Prevent props destructuring
      'vue/no-expose-after-await': 'error', // defineExpose before await
      'vue/no-lifecycle-after-await': 'error', // Lifecycle hooks before await

      // === PHASE 2: VUEUSE COMPOSABLE PATTERNS ===

      'vue/prefer-use-template-ref': 'error', // Use useTemplateRef() in script setup

      // === IMPORT SORTING & ALIAS CONVERSION ===
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          allowSameFolder: true, // Allow same-folder imports (./Component)
          allowedDepth: 1, // Allow ../ imports (for composables sibling folder)
          rootDir: 'src', // Remove 'src/' from absolute paths
          prefix: '@', // Add '@' prefix to converted imports
        },
      ],
    },
  },
  {
    files: ['test/**/*.test.ts', '**/*.test.ts'],
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
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-unused-vars': 'off',

      // Note: .toContain() is appropriate for:
      // - Checking if a string contains a substring (e.g., error messages)
      // - Checking if an array contains a specific element
      // This rule is disabled as the AST selector was too complex and had false positives

      // Encourage proper test isolation
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Mock fetch in tests instead of using global fetch',
        },
      ],
    },
  },
  {
    ignores: [
      'dist',
      'node_modules',
      '**/*.config.ts',
      '**/*.config.js',
      'vite-plugin-*.ts',
      '**/*.js',
      '**/*.html',
      'scripts/**/*',
      'src/shared/data/bg/kana.ts',
      'src/shared/data/bg/picture.ts',
      'src/core/parser/FBasicChevrotainParser.ts',
    ],
  },
]
