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
import Markdown from "vite-plugin-md";

// 由html-generator插件动态生成HTML文件，不再使用entry目录下的HTML文件

// https://vite.dev/config/
const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    svelte({ preprocess: vitePreprocess({ script: true }) }),
    tailwindcss(),
    htmlGeneratorPlugin(),
    Markdown({
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
      },
      markdownItSetup(md) {
        // 代码高亮
        md.use(markdownItHighlightjs, { hljs: shiki });
        // 数学公式
        md.use(markdownItKatex);
        // 自定义容器
        md.use(markdownItContainer, "info");
        md.use(markdownItContainer, "warning");
        md.use(markdownItContainer, "tip");
      },
      wrapperClasses: "markdown-content",
    }),
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
