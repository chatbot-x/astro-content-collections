import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default [
  // Base Astro recommended rules
  ...astro.configs.recommended,

  // Accessibility rules for .astro files
  {
    files: ['**/*.astro'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Enable all recommended a11y rules
      ...jsxA11y.configs.recommended.rules,

      // Custom overrides for Astro
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/heading-has-content': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-access-key': 'error',
    },
  },

  // TypeScript files — use typescript-eslint flat config
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{js,ts,mjs}'],
  })),

  // Custom TypeScript rules
  {
    files: ['**/*.{js,ts,mjs}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**',
    ],
  },
];
