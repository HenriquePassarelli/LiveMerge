import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-plugin-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx,css,js}'],
    ignores: ['**/node_modules/**'],
    plugins: { prettier },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    rules: {
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'auto',
          semi: false,
          singleQuote: true,
          printWidth: 120,
          arrowParens: 'always',
          noMixedOperators: 'true',
          trailingComma: 'none'
        },
        {
          usePrettierrc: false
        }
      ],

      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      'spaced-comment': ['warn', 'always', { markers: ['/'] }],
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'react-refresh/only-export-components': 'off',

      // TypeScript
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-unused-vars': 'off',

      'react/prop-types': 'off',
      semi: ['warn', 'never'],
      'no-extra-semi': 'warn',
      'max-len': [
        'warn',
        {
          code: 120,
          ignoreUrls: true,
          ignoreTrailingComments: true,
          ignoreStrings: true,
          ignorePattern: '^import .*'
        }
      ],
      curly: ['warn', 'multi-line'],
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'no-mixed-operators': 'off',
      'no-tabs': [
        'error',
        {
          allowIndentationTabs: true
        }
      ],
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true
        }
      ],
      'lines-around-comment': [
        'error',
        {
          beforeBlockComment: false,
          afterBlockComment: false,
          beforeLineComment: false,
          afterLineComment: false,
          allowBlockStart: true,
          allowBlockEnd: true,
          allowObjectStart: true,
          allowObjectEnd: true,
          allowArrayStart: true,
          allowArrayEnd: true
        }
      ],
      'comma-dangle': [
        'warn',
        {
          arrays: 'never',
          objects: 'never',
          imports: 'never',
          exports: 'never',
          functions: 'never'
        }
      ]
    }
  }
])
