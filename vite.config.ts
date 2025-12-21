import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import htmlGeneratorPlugin from "./vite-plugins/html-generator";

// 由html-generator插件动态生成HTML文件，不再使用entry目录下的HTML文件

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte({ preprocess: vitePreprocess({ script: true }) }),
    tailwindcss(),
    htmlGeneratorPlugin(),
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
