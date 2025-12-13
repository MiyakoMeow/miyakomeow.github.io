import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginBetterTailwind from "eslint-plugin-better-tailwindcss";
import globals from "globals";
import css from "@eslint/css";
import { tailwind4 } from "tailwind-csstree";

export default defineConfigWithVueTs(
  vueTsConfigs.recommended,
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.{vue,ts,tsx,js}"],
    plugins: {
      "better-tailwindcss": pluginBetterTailwind,
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
    files: ["**/*.css}"],
    plugins: {
      css,
    },
    language: "css/css",
    languageOptions: {
      tolerant: true,
      customSyntax: tailwind4,
    },
    plugins: {
      "better-tailwindcss": pluginBetterTailwind,
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/main.css",
      },
    },
    rules: {
      "css/use-baseline": "off",
      "css/no-invalid-properties": "off",
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
