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
const gitignorePath = path.resolve(__dirname, ".gitignore");

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
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...svelteConfigs["flat/recommended"],
  svelteConfigs["flat/prettier"],

  // 全局配置 - 统一 parserOptions 和全局变量
  {
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        allowDefaultProject: true,
        extraFileExtensions: [".svelte", ".svx"],
        svelteConfig,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // SvelteKit 全局变量
        "$app/stores": "readonly",
        "$app/environment": "readonly",
        "$app/paths": "readonly",
        "$app/navigation": "readonly",
        "$app/error": "readonly",
        "$app/forms": "readonly",
      },
    },
    plugins: {
      "import-x": importX,
    },
    rules: {
      // TypeScript 和 Svelte 通用规则
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

      // Stylistic 规则覆盖（交给 Prettier）
      "@typescript-eslint/semi": "off",
      "@typescript-eslint/quotes": "off",
      "@typescript-eslint/comma-dangle": "off",
      "@typescript-eslint/indent": "off",
      "@typescript-eslint/member-delimiter-style": "off",
      "@typescript-eslint/brace-style": "off",
      "@typescript-eslint/object-curly-spacing": "off",
      "@typescript-eslint/arrow-parens": "off",
      "@typescript-eslint/space-before-function-paren": "off",
      "@typescript-eslint/key-spacing": "off",
      "@typescript-eslint/lines-between-class-members": "off",
      "@typescript-eslint/consistent-generic-constructors": "off",
      "@typescript-eslint/consistent-type-imports": "off",

      // import-x 规则
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

  // 所有文件类型配置
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

  eslintConfigPrettier
);
