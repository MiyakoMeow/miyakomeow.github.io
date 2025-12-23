import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import htmlGeneratorPlugin from "./vite-plugins/html-generator";
import Markdown from "vite-plugin-md";

// 由html-generator插件动态生成HTML文件，不再使用entry目录下的HTML文件

// https://vite.dev/config/
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
        md.use(require("markdown-it-highlightjs"), { hljs: require("shiki") });
        // 数学公式
        md.use(require("markdown-it-katex"));
        // 自定义容器
        md.use(require("markdown-it-container"), "info");
        md.use(require("markdown-it-container"), "warning");
        md.use(require("markdown-it-container"), "tip");
      },
      wrapperClasses: "markdown-content",
    }),
  ],
  root: resolve(__dirname, ".temp-html"),
  publicDir: resolve(__dirname, "public"),
  appType: "mpa",
  base: "./",
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    fs: { allow: [".."] },
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      // input由html-generator插件动态生成
      input: {},
    },
  },
});
