/*
 * ESLint 配置说明
 *
 * Tailwind CSS 类名处理分为两个工具：
 *
 * 1. prettier-plugin-tailwindcss（Prettier 插件）
 *    - 功能：类名排序（如：m-4 p-2 → p-2 m-4）
 *    - 运行时机：执行 `bun format` 或 Prettier 格式化时
 *    - 配置文件：.prettierrc
 *
 * 2. eslint-plugin-svelte-tailwind-canonical（自定义插件）
 *    - 功能：canonical 规范化（如：p-4px → p-1）
 *    - 运行时机：执行 `bun run lint` 时
 *    - 配置：本文件中的 svelteTailwindCanonicalRules
 *
 * 为什么需要两个工具？
 * - prettier-plugin-tailwindcss 官方插件不支持 canonical 规范化
 * - eslint-plugin-tailwind-canonical-classes 只支持 JSX/TSX，不支持 Svelte
 * - 因此自定义插件专门为 Svelte 文件提供 canonical 规范化功能
 *
 * 未来改进：
 * - 计划向 eslint-plugin-tailwind-canonical-classes 提交 PR 添加 Svelte 支持
 * - 合并后可移除自定义插件 eslint-plugin-svelte-tailwind-canonical.ts
 */

import css from "@eslint/css";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import pluginBetterTailwind from "eslint-plugin-better-tailwindcss";
import svelte from "eslint-plugin-svelte";
import tailwindCanonicalClasses from "eslint-plugin-tailwind-canonical-classes";
import svelteTailwindCanonicalRule from "./eslint-plugin-svelte-tailwind-canonical.ts";
import { defineConfig } from "eslint/config";
import type { Plugin, RulesConfig } from "@eslint/core";
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
const svelteTailwindCanonicalPlugins: Record<string, Plugin> = {
  "svelte-tailwind-canonical": {
    rules: {
      "tailwind-canonical-classes-svelte": svelteTailwindCanonicalRule,
    },
  },
};
const betterTailwindRules: RulesConfig = {
  ...(pluginBetterTailwind.configs["recommended"].rules as unknown as RulesConfig),
  "better-tailwindcss/enforce-consistent-line-wrapping": "off",
  "better-tailwindcss/no-unregistered-classes": "off",
};
const tailwindCanonicalRules: RulesConfig = {
  "tailwind-canonical-classes/tailwind-canonical-classes": [
    "warn",
    { cssPath: "./src/styles/main.css" },
  ],
};
const svelteTailwindCanonicalRules: RulesConfig = {
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
  ...svelte.configs.prettier.map((config) => ({ ...config, files: config.files ?? svelteFiles })),
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
