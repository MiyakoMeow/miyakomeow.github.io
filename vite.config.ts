import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import htmlGeneratorPlugin from "./vite-plugins/html-generator";
import { mdsvex } from "mdsvex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { PreprocessorGroup } from "svelte/compiler";

// 由html-generator插件动态生成HTML文件，不再使用entry目录下的HTML文件

// https://vite.dev/config/
const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    svelte({
      preprocess: [
        (() => {
          const md = mdsvex({
            extensions: [".md"],
            remarkPlugins: [remarkGfm, remarkMath],
          });
          const pre: PreprocessorGroup = {
            markup: ({ content, filename }) =>
              md.markup({ content, filename: filename ?? "unknown.md" }),
          };
          return pre;
        })(),
        vitePreprocess({ script: true }),
      ],
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
    sourcemap: true,
    outDir: resolve(projectRoot, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      // input由html-generator插件动态生成
      input: {},
    },
  },
});
