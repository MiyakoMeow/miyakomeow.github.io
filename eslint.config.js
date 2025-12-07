import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "public/**", "bun.lockb"],
  },
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      "no-console": "off",
      "no-debugger": "warn",
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
