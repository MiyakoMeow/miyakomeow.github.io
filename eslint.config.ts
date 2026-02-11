import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import betterTailwindCss from 'eslint-plugin-better-tailwindcss';
import importPlugin from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['.svelte-kit/', 'build/']
  },
  js.configs.recommended,
  ...svelte.configs['flat/all'],
  ...svelte.configs['flat/prettier'],
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      // Svelte
      'svelte/no-at-html-tags': 'error',

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Import (暂时禁用 order 规则)
      // 'import/order': [
      // 	'error',
      // 	{
      // 		groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
      // 		'newlines-between': 'always'
      // 	}
      // ],

      // 样式（替代Prettier）
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always']
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    }
  },
  {
    files: ['**/*.{js,jsx,ts,tsx,svelte}'],
    plugins: {
      'better-tailwindcss': betterTailwindCss
    },
    rules: {
      'better-tailwindcss/enforce-consistent-class-order': 'error',
      'better-tailwindcss/enforce-consistent-important-position': 'error'
    }
  }
);