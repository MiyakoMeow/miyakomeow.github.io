import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginBetterTailwind from "eslint-plugin-better-tailwindcss";
import globals from "globals";
import vueScopedCss from "eslint-plugin-vue-scoped-css";

export default defineConfigWithVueTs(
  vueTsConfigs.recommended,
  {
    files: ["**/*.vue"],
    plugins: {
      "vue-scoped-css": vueScopedCss,
    },
    rules: {
      "vue-scoped-css/no-parsing-error": "error",
      "vue-scoped-css/enforce-style-type": "off",
      "vue-scoped-css/no-unused-selector": "off",
      "vue-scoped-css/no-unused-keyframes": "off",
    },
  },
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
    files: ["**/*.{vue,ts,tsx,js}"],
    plugins: {
      "better-tailwindcss": pluginBetterTailwind,
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "tailwind.config.js",
      },
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "off",
      "better-tailwindcss/enforce-shorthand-classes": "off",
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      "better-tailwindcss/no-duplicate-classes": "off",
      "better-tailwindcss/no-unnecessary-whitespace": "off",
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
