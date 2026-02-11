import js from '@eslint/js';

import svelteConfig from './svelte.config.ts';
import { configs as svelteConfigs } from 'eslint-plugin-svelte';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import betterTailwindCss from 'eslint-plugin-better-tailwindcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default tseslint.config(
  {
    ignores: [
      '.svelte-kit/',
      'build/',
      '**/*.generated.ts',
      'node_modules/',
      '.output',
      '.vercel',
      '.netlify',
      '.wrangler',
      '.DS_Store',
      'Thumbs.db',
      '.env',
      '.env.*',
      '!.env.example',
      '!.env.test',
      'vite.config.js.timestamp-*',
      'vite.config.ts.timestamp-*',
      'src/lib/paraglide',
      'project.inlang/cache/',
      '.vite',
      '/legacy',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelteConfigs['flat/recommended'],

  // Svelte文件配置 - 增强parserOptions
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        extraFileExtensions: ['.svelte', '.svx'],
        svelteConfig,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // MDSvex文件配置
  {
    files: ['**/*.svx'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        extraFileExtensions: ['.svelte', '.svx'],
        svelteConfig,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // TypeScript文件配置
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {},
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx,svelte,svx}'],
    plugins: {
      'better-tailwindcss': betterTailwindCss,
    },
    rules: {
      'better-tailwindcss/enforce-consistent-class-order': 'error',
      'better-tailwindcss/enforce-consistent-important-position': 'error',
    },
  }
);
