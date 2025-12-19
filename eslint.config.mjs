import css from "@eslint/css";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import pluginBetterTailwind from "eslint-plugin-better-tailwindcss";
import svelte from "eslint-plugin-svelte";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";
import globals from "globals";
import { tailwind4 } from "tailwind-csstree";
import ts from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));
const jsTsFiles = ["**/*.{js,ts,tsx}"];
const jsTsSvelteFiles = ["**/*.{js,ts,tsx,svelte}"];
const svelteFiles = ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"];

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: { "no-undef": "off" },
  },
  { ...js.configs.recommended, files: jsTsSvelteFiles },
  ...ts.configs.recommended.map((config) => ({ ...config, files: jsTsSvelteFiles })),
  ...svelte.configs.recommended.map((config) => ({
    ...config,
    files: config.files ?? svelteFiles,
  })),
  prettier,
  ...svelte.configs.prettier.map((config) => ({
    ...config,
    files: config.files ?? svelteFiles,
  })),
  {
    files: svelteFiles,
    rules: {
      "svelte/prefer-svelte-reactivity": "off",
      "no-empty": "off",
    },
  },
  {
    files: svelteFiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
      },
    },
  },
  {
    files: jsTsFiles,
    plugins: {
      "better-tailwindcss": pluginBetterTailwind,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/main.css",
      },
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "warn",
      "better-tailwindcss/enforce-shorthand-classes": "warn",
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      "better-tailwindcss/no-duplicate-classes": "warn",
      "better-tailwindcss/no-unnecessary-whitespace": "warn",
    },
  },
  {
    files: ["**/*.{css,pcss}"],
    plugins: {
      css,
      "better-tailwindcss": pluginBetterTailwind,
    },
    language: "css/css",
    languageOptions: {
      tolerant: true,
      customSyntax: tailwind4,
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/main.css",
      },
    },
    rules: {
      "css/no-duplicate-imports": "error",
      "css/no-invalid-properties": "warn",
      "css/use-baseline": ["warn", { available: "newly" }],
    },
  }
);
