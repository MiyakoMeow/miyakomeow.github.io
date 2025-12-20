import css from "@eslint/css";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import pluginBetterTailwind from "eslint-plugin-better-tailwindcss";
import svelte from "eslint-plugin-svelte";
import tailwindCanonicalClasses from "eslint-plugin-tailwind-canonical-classes";
import svelteTailwindCanonicalRule from "./tailwind-svelte-canonical-eslint-plugin.mjs";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";
import globals from "globals";
import { tailwind4 } from "tailwind-csstree";
import ts from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));
const jsTsFiles = ["**/*.{js,ts,tsx}"];
const jsTsSvelteFiles = ["**/*.{js,ts,tsx,svelte}"];
const svelteFiles = ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"];
const betterTailwindPlugins = { "better-tailwindcss": pluginBetterTailwind };
const betterTailwindSettings = { "better-tailwindcss": { entryPoint: "src/styles/main.css" } };
const tailwindCanonicalPlugins = { "tailwind-canonical-classes": tailwindCanonicalClasses };
const svelteTailwindCanonicalPlugins = {
  "svelte-tailwind-canonical": {
    rules: {
      "tailwind-canonical-classes-svelte": svelteTailwindCanonicalRule,
    },
  },
};
const betterTailwindRules = {
  ...pluginBetterTailwind.configs["recommended"].rules,
  "better-tailwindcss/enforce-consistent-line-wrapping": "off",
  "better-tailwindcss/no-unregistered-classes": "off",
};
const tailwindCanonicalRules = {
  "tailwind-canonical-classes/tailwind-canonical-classes": [
    "warn",
    { cssPath: "./src/styles/main.css" },
  ],
};
const svelteTailwindCanonicalRules = {
  "svelte-tailwind-canonical/tailwind-canonical-classes-svelte": [
    "warn",
    { cssPath: "./src/styles/main.css" },
  ],
};

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
    plugins: {
      ...betterTailwindPlugins,
      ...tailwindCanonicalPlugins,
      ...svelteTailwindCanonicalPlugins,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
      },
    },
    settings: {
      ...betterTailwindSettings,
    },
    rules: {
      ...betterTailwindRules,
      ...tailwindCanonicalRules,
      ...svelteTailwindCanonicalRules,
      "svelte/prefer-svelte-reactivity": "off",
      "no-empty": "off",
    },
  },
  {
    files: jsTsFiles,
    plugins: { ...betterTailwindPlugins, ...tailwindCanonicalPlugins },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      ...betterTailwindSettings,
    },
    rules: { ...betterTailwindRules, ...tailwindCanonicalRules },
  },
  {
    files: ["**/*.{css,pcss}"],
    plugins: {
      css,
      ...betterTailwindPlugins,
    },
    language: "css/css",
    languageOptions: {
      tolerant: true,
      customSyntax: tailwind4,
    },
    settings: {
      ...betterTailwindSettings,
    },
    rules: {
      ...betterTailwindRules,
      "css/no-duplicate-imports": "error",
      "css/no-invalid-properties": "warn",
      "css/use-baseline": ["warn", { available: "newly" }],
    },
  }
);
