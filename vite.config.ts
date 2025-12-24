import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import htmlGeneratorPlugin from "./vite-plugins/html-generator";
import markdownItContainer from "markdown-it-container";
import markdownItHighlightjs from "markdown-it-highlightjs";
import markdownItKatex from "markdown-it-katex";
import * as shiki from "shiki";
import svelteMd from "vite-plugin-svelte-md";

// 由html-generator插件动态生成HTML文件，不再使用entry目录下的HTML文件

// https://vite.dev/config/
const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    svelteMd({
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
      },
      markdownItUses: [
        [markdownItHighlightjs, { hljs: shiki }],
        [markdownItKatex],
        [markdownItContainer, "info"],
        [markdownItContainer, "warning"],
        [markdownItContainer, "tip"],
      ],
      wrapperClasses: "",
    }),
    svelte({
      preprocess: vitePreprocess({ script: true }),
      extensions: [".svelte", ".md"],
    }),
    tailwindcss(),
    htmlGeneratorPlugin(),
  ],
  root: resolve(projectRoot, ".temp-html"),
  publicDir: resolve(projectRoot, "public"),
  appType: "mpa",
  base: "./",
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      "@": resolve(projectRoot, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    fs: { allow: [".."] },
  },
  build: {
    outDir: resolve(projectRoot, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      // input由html-generator插件动态生成
      input: {},
    },
  },
});
