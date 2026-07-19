import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'build/**',
      '.docusaurus/**',
      'node_modules/**',
      'static/**',
      'docs/superpowers/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: {
      globals: {...globals.browser, ...globals.node},
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
      'no-console': ['warn', {allow: ['warn', 'error']}],
    },
  },
)
