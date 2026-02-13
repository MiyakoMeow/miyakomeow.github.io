import path from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import betterTailwindCss from "eslint-plugin-better-tailwindcss";
import importX from "eslint-plugin-import-x";
import { configs as svelteConfigs } from "eslint-plugin-svelte";
import globals from "globals";
import tseslint from "typescript-eslint";

import svelteConfig from "./svelte.config.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  {
    ignores: [
      ".svelte-kit/",
      "build/",
      "**/*.generated.ts",
      "node_modules/",
      ".output",
      ".vercel",
      ".netlify",
      ".wrangler",
      ".DS_Store",
      "Thumbs.db",
      ".env",
      ".env.*",
      "!.env.example",
      "!.env.test",
      "vite.config.js.timestamp-*",
      "vite.config.ts.timestamp-*",
      "src/lib/paraglide",
      "project.inlang/cache/",
      ".vite",
      "/legacy",
    ],
  },

  // 基础推荐配置
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // 全局配置
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        allowDefaultProject: true,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "import-x": importX,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "import-x/no-unused-modules": "warn",
      "import-x/no-duplicates": "error",
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "parent", "sibling", "index", "object", "internal"],
          "newlines-between": "always",
          alphabetize: { order: "asc" },
        },
      ],
    },
  },

  // Svelte文件特定配置
  ...svelteConfigs["flat/recommended"],
  svelteConfigs["flat/prettier"],
  {
    files: ["**/*.svelte", "**/*.svx"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        extraFileExtensions: [".svelte", ".svx"],
        svelteConfig,
      },
    },
    rules: {
      // 禁用一些在Svelte文件中可能出错的类型检查规则
      "@typescript-eslint/consistent-generic-constructors": "off",
    },
  },

  // TailwindCSS规则
  {
    files: ["**/*.{js,jsx,ts,tsx,svelte,svx}"],
    plugins: {
      "better-tailwindcss": betterTailwindCss,
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "error",
      "better-tailwindcss/enforce-consistent-important-position": "error",
    },
  },

  // Prettier必须最后
  eslintConfigPrettier
);
