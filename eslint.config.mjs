import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginBetterTailwind from "eslint-plugin-better-tailwindcss";
import globals from "globals";
import css from "@eslint/css";
import { tailwind4 } from "tailwind-csstree";

export default defineConfigWithVueTs(
  vueTsConfigs.recommended,
  {
    ignores: ["dist/**", "node_modules/**", "bun.lockb"],
  },
  {
    files: ["**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  {
    files: ["**/*.{vue,ts,js}"],
    plugins: {
      "better-tailwindcss": pluginBetterTailwind,
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/main.pcss",
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
    files: ["**/*.css"],
    plugins: {
      css,
    },
    language: "css/css",
    languageOptions: {
      tolerant: true,
    },
    rules: {
      "css/no-empty-blocks": "error",
      "css/no-invalid-at-rules": "error",
      "css/no-invalid-properties": "error",
      "css/no-duplicate-imports": "error",
      "css/use-baseline": "error",
    },
  },
  {
    files: ["**/*.pcss"],
    plugins: {
      css,
    },
    language: "css/css",
    languageOptions: {
      tolerant: true,
      customSyntax: tailwind4,
    },
    rules: {
      "css/no-empty-blocks": "error",
      "css/no-invalid-at-rules": "off",
      "css/no-invalid-properties": "off",
      "css/no-duplicate-imports": "error",
    },
  },
  {
    files: ["vite.config.ts", "postcss.config.*"],
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintConfigPrettier
);
