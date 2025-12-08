import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";
import vueTsEslintConfig from "@vue/eslint-config-typescript";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "bun.lockb"],
  },
  ...pluginVue.configs["flat/essential"],
  ...tseslint.configs.recommended,
  ...vueTsEslintConfig(),
  {
    files: ["**/*.js", "**/*.ts"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      "no-console": "off",
      "no-debugger": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
];
